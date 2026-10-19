-- Phase 4: durable, private order-email queue. No mail is sent by this migration.
-- The existing orders are deliberately NOT backfilled to avoid sending stale
-- notifications for historical/test requests.

create table if not exists public.order_email_outbox (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders(id) on delete cascade,
  kind text not null check (kind in ('store','customer')),
  recipient_email text,
  status text not null default 'pending'
    check (status in ('pending','processing','failed','sent')),
  attempts integer not null default 0 check (attempts >= 0),
  next_attempt_at timestamptz not null default now(),
  claimed_at timestamptz,
  last_attempt_at timestamptz,
  sent_at timestamptz,
  provider_message_id text,
  last_error text,
  created_at timestamptz not null default now(),
  unique(order_id,kind)
);
create index if not exists order_email_outbox_dispatch_idx
  on public.order_email_outbox(status,next_attempt_at,created_at);
alter table public.order_email_outbox enable row level security;
drop policy if exists "Owner may inspect email delivery status" on public.order_email_outbox;
create policy "Owner may inspect email delivery status" on public.order_email_outbox
for select to authenticated using (
  exists(select 1 from public.admin_users a where a.user_id=auth.uid())
);

-- Capture every NEW order regardless of whether it originated at /checkout,
-- a single-product order form, or another authorized checkout caller.
create or replace function public.queue_order_email_notifications()
returns trigger language plpgsql security definer set search_path=public,pg_temp as $$
begin
  insert into public.order_email_outbox(order_id,kind)
  values(new.id,'store') on conflict(order_id,kind) do nothing;
  if nullif(btrim(coalesce(new.customer_email,'')),'') is not null
    and new.customer_email ~* '^[A-Z0-9._%+-]+@[A-Z0-9.-]+[.][A-Z]{2,}$' then
    insert into public.order_email_outbox(order_id,kind,recipient_email)
    values(new.id,'customer',lower(btrim(new.customer_email)))
    on conflict(order_id,kind) do nothing;
  end if;
  return new;
end $$;
drop trigger if exists orders_queue_confirmation_emails on public.orders;
create trigger orders_queue_confirmation_emails
after insert on public.orders
for each row execute function public.queue_order_email_notifications();
revoke all on function public.queue_order_email_notifications() from public,anon,authenticated;

-- Only the trusted backend's Supabase SERVICE ROLE may claim delivery jobs.
-- SKIP LOCKED plus a short lease prevents two workers from sending the same job.
create or replace function public.claim_order_email_jobs(
  p_order_number text default null,
  p_limit integer default 6
)
returns table (
  job_id uuid,
  job_kind text,
  recipient_email text,
  order_number text,
  customer_name text,
  customer_email text,
  phone text,
  city text,
  address text,
  notes text,
  payment_method text,
  total_amount numeric,
  items jsonb
)
language plpgsql security definer set search_path=public,pg_temp as $$
begin
  if auth.role() is distinct from 'service_role' then
    raise exception 'Email dispatcher not authorized';
  end if;
  if p_limit is null or p_limit not between 1 and 10 then
    raise exception 'Invalid dispatch batch size';
  end if;
  return query
  with picked as (
    select e.id
    from public.order_email_outbox e
    join public.orders o on o.id=e.order_id
    where (p_order_number is null or o.order_number=p_order_number)
      and e.attempts<5
      and (
        (e.status in ('pending','failed') and e.next_attempt_at<=now())
        or (e.status='processing' and e.claimed_at<now()-interval '5 minutes')
      )
    order by e.created_at,e.id
    limit p_limit for update of e skip locked
  ), updated as (
    update public.order_email_outbox e
    set status='processing',attempts=e.attempts+1,claimed_at=now(),
      last_attempt_at=now(),last_error=null
    from picked p where e.id=p.id returning e.*
  )
  select e.id,e.kind,e.recipient_email,o.order_number,o.customer_name,
    o.customer_email,o.phone,o.city,o.address,o.notes,o.payment_method,o.total_amount,
    coalesce(
      (select jsonb_agg(jsonb_build_object(
        'name',i.product_name,'quantity',i.quantity,
        'unit_price',i.unit_price,'line_total',i.line_total
      ) order by i.created_at,i.id)
       from public.order_items i where i.order_id=o.id),
      jsonb_build_array(jsonb_build_object(
        'name',o.product_name,'quantity',o.quantity,
        'unit_price',o.unit_price,'line_total',o.total_amount
      ))
    )
  from updated e
  join public.orders o on o.id=e.order_id
  order by e.created_at,e.id;
end $$;
revoke all on function public.claim_order_email_jobs(text,integer) from public,anon,authenticated;
grant execute on function public.claim_order_email_jobs(text,integer) to service_role;

create or replace function public.complete_order_email_job(
  p_job_id uuid,p_provider_id text default null,p_error text default null
)
returns boolean language plpgsql security definer set search_path=public,pg_temp as $$
declare e public.order_email_outbox%rowtype;
begin
  if auth.role() is distinct from 'service_role' then
    raise exception 'Email dispatcher not authorized';
  end if;
  select * into e from public.order_email_outbox where id=p_job_id for update;
  if not found then return false; end if;
  if e.status='sent' then return true; end if;
  if e.status<>'processing' then return false; end if;
  if p_provider_id is not null and length(btrim(p_provider_id))>0 then
    update public.order_email_outbox set
      status='sent',sent_at=now(),provider_message_id=left(p_provider_id,200),
      last_error=null,claimed_at=null
    where id=p_job_id;
  else
    update public.order_email_outbox set
      status='failed',
      next_attempt_at=now()+(interval '1 minute' * least(60,power(2,least(e.attempts,6))::integer)),
      last_error=left(coalesce(p_error,'Email provider was unavailable'),350),
      claimed_at=null
    where id=p_job_id;
  end if;
  return true;
end $$;
revoke all on function public.complete_order_email_job(uuid,text,text) from public,anon,authenticated;
grant execute on function public.complete_order_email_job(uuid,text,text) to service_role;
