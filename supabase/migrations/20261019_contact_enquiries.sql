-- Phase 5: operational enquiry inbox, not an email service.
-- Public submissions are validated and throttled inside PostgreSQL.
-- No historical orders, products or customer data are modified.

create table if not exists public.contact_inquiries (
  id uuid primary key default gen_random_uuid(),
  category text not null check (category in ('Product question','Order support','Retail enquiry','Collaboration','Other')),
  customer_name text not null check (char_length(customer_name) between 2 and 120),
  customer_email text,
  customer_phone text,
  order_reference text,
  message text not null check (char_length(message) between 15 and 2500),
  status text not null default 'New' check (status in ('New','In progress','Resolved')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists contact_inquiries_created_idx on public.contact_inquiries(created_at desc);
create index if not exists contact_inquiries_status_idx on public.contact_inquiries(status,created_at desc);
alter table public.contact_inquiries enable row level security;

drop policy if exists "Owner can review enquiries" on public.contact_inquiries;
create policy "Owner can review enquiries" on public.contact_inquiries
for select to authenticated using (
  exists (select 1 from public.admin_users a where a.user_id=auth.uid())
);
drop policy if exists "Owner can update enquiry status" on public.contact_inquiries;
create policy "Owner can update enquiry status" on public.contact_inquiries
for update to authenticated
using (exists (select 1 from public.admin_users a where a.user_id=auth.uid()))
with check (exists (select 1 from public.admin_users a where a.user_id=auth.uid()));

create or replace function public.submit_contact_enquiry(
  p_name text,p_email text,p_phone text,p_category text,p_reference text,p_message text
) returns text
language plpgsql security definer set search_path=public,pg_temp as $$
declare
  v_name text:=btrim(coalesce(p_name,''));
  v_email text:=lower(btrim(coalesce(p_email,'')));
  v_phone text:=btrim(coalesce(p_phone,''));
  v_category text:=btrim(coalesce(p_category,''));
  v_reference text:=btrim(coalesce(p_reference,''));
  v_message text:=btrim(coalesce(p_message,''));
  v_key text;
  v_count integer;
  v_id uuid;
begin
  if char_length(v_name) not between 2 and 120
    or char_length(v_message) not between 15 and 2500
    or v_category not in ('Product question','Order support','Retail enquiry','Collaboration','Other')
    or char_length(v_email)>254 or char_length(v_phone)>24 or char_length(v_reference)>50
    or (v_email='' and v_phone='')
  then raise exception 'Please complete the required enquiry fields'; end if;
  if v_email<>'' and v_email !~* '^[A-Z0-9._%+-]+@[A-Z0-9.-]+[.][A-Z]{2,}$' then
    raise exception 'Please provide a valid email address'; end if;
  if v_phone<>'' and (char_length(v_phone)<7 or v_phone !~ '^[+0-9 ()-]+$') then
    raise exception 'Please provide a valid phone number'; end if;

  -- Serialize retries by contact to avoid concurrent requests bypassing limits.
  v_key:=coalesce(nullif(v_email,''),v_phone);
  perform pg_advisory_xact_lock(hashtext('baba-contact-v1:'||v_key));
  select count(*) into v_count from public.contact_inquiries q
  where q.created_at>now()-interval '30 minutes'
    and ((v_email<>'' and q.customer_email=v_email)
       or (v_phone<>'' and q.customer_phone=v_phone));
  if v_count>=3 then raise exception 'Please wait before sending another enquiry'; end if;
  insert into public.contact_inquiries(
    category,customer_name,customer_email,customer_phone,order_reference,message)
  values(v_category,v_name,nullif(v_email,''),nullif(v_phone,''),
    nullif(v_reference,''),v_message)
  returning id into v_id;
  return 'Received';
end $$;

revoke all on function public.submit_contact_enquiry(text,text,text,text,text,text) from public,anon,authenticated;
grant execute on function public.submit_contact_enquiry(text,text,text,text,text,text) to anon,authenticated;
