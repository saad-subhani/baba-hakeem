-- Phase 3: owner-only order processing and auditable stock movements.
-- Additive: existing orders, products, and stock values are preserved.

create table if not exists public.order_status_events (
  id bigint generated always as identity primary key,
  order_id uuid references public.orders(id) on delete set null,
  order_number text not null,
  previous_status text,
  new_status text not null,
  note text,
  changed_by uuid,
  created_at timestamptz not null default now()
);
create index if not exists order_status_events_order_idx on public.order_status_events(order_id, created_at desc);
alter table public.order_status_events enable row level security;
drop policy if exists "Owner reads order status history" on public.order_status_events;
create policy "Owner reads order status history" on public.order_status_events
for select to authenticated
using (exists(select 1 from public.admin_users a where a.user_id=auth.uid()));

create table if not exists public.inventory_movements (
  id bigint generated always as identity primary key,
  product_id uuid references public.products(id) on delete set null,
  product_name text not null,
  previous_quantity integer not null,
  new_quantity integer not null,
  quantity_change integer not null,
  reason text not null,
  changed_by uuid,
  created_at timestamptz not null default now()
);
create index if not exists inventory_movements_product_idx on public.inventory_movements(product_id, created_at desc);
create index if not exists inventory_movements_date_idx on public.inventory_movements(created_at desc);
alter table public.inventory_movements enable row level security;
drop policy if exists "Owner reads inventory movements" on public.inventory_movements;
create policy "Owner reads inventory movements" on public.inventory_movements
for select to authenticated
using (exists(select 1 from public.admin_users a where a.user_id=auth.uid()));

-- Includes admin product edits, checkout stock reservations, and cancellations.
-- Default reason is truthful for an unlabelled legacy direct edit.
create or replace function public.audit_product_stock()
returns trigger language plpgsql security definer set search_path=public,pg_temp as $$
declare previous_qty integer;
begin
  if TG_OP='INSERT' then previous_qty:=0;
  else previous_qty:=old.stock_quantity;
  end if;
  if new.stock_quantity is distinct from previous_qty then
    insert into public.inventory_movements
       (product_id,product_name,previous_quantity,new_quantity,quantity_change,reason,changed_by)
    values(new.id,new.name,previous_qty,new.stock_quantity,new.stock_quantity-previous_qty,
      left(coalesce(nullif(current_setting('baba.stock_reason',true),''),'Stock quantity changed'),180),
      auth.uid());
  end if;
  return new;
end $$;
drop trigger if exists products_inventory_audit_insert on public.products;
create trigger products_inventory_audit_insert after insert on public.products
for each row execute function public.audit_product_stock();
drop trigger if exists products_inventory_audit_update on public.products;
create trigger products_inventory_audit_update after update of stock_quantity on public.products
for each row execute function public.audit_product_stock();

create or replace function public.audit_order_status()
returns trigger language plpgsql security definer set search_path=public,pg_temp as $$
begin
  if TG_OP='INSERT' then
    insert into public.order_status_events
      (order_id,order_number,previous_status,new_status,note,changed_by)
    values(new.id,new.order_number,null,new.status,null,auth.uid());
  elsif old.status is distinct from new.status then
    insert into public.order_status_events
      (order_id,order_number,previous_status,new_status,note,changed_by)
    values(new.id,new.order_number,old.status,new.status,
      nullif(left(coalesce(current_setting('baba.status_note',true),''),500),''),
      auth.uid());
  end if;
  return new;
end $$;
drop trigger if exists orders_status_audit_insert on public.orders;
create trigger orders_status_audit_insert after insert on public.orders
for each row execute function public.audit_order_status();
drop trigger if exists orders_status_audit_update on public.orders;
create trigger orders_status_audit_update after update of status on public.orders
for each row execute function public.audit_order_status();

-- Enhance existing cancellation restock trigger to support legacy single-item
-- orders when an actual product_id is present, as well as new order_items orders.
create or replace function public.restore_cancelled_order_stock()
returns trigger language plpgsql security definer set search_path=public,pg_temp as $$
declare item record; line_count integer:=0;
begin
  if old.stock_reserved and old.status='Cancelled' and new.status<>'Cancelled' then
    raise exception 'Cancelled orders cannot be reopened; place a new order';
  end if;
  if old.stock_reserved and old.status in ('Pending','Confirmed') and new.status='Cancelled' then
    for item in select product_id,quantity from public.order_items where order_id=old.id loop
      line_count:=line_count+1;
      update public.products
      set stock_quantity=stock_quantity+item.quantity,
          stock_status=case when stock_quantity+item.quantity<=5 then 'Low Stock' else 'In Stock' end,
          updated_at=now()
      where id=item.product_id;
    end loop;
    if line_count=0 and old.product_id is not null then
      update public.products
      set stock_quantity=stock_quantity+old.quantity,
          stock_status=case when stock_quantity+old.quantity<=5 then 'Low Stock' else 'In Stock' end,
          updated_at=now()
      where id=old.product_id;
    end if;
  end if;
  return new;
end $$;

-- One server-side transaction handles status transitions and linked inventory.
create or replace function public.admin_set_order_status(
  p_order_id uuid,p_status text,p_note text default null)
returns text language plpgsql security definer set search_path=public,pg_temp as $$
declare o public.orders%rowtype; stock integer;
begin
  if auth.uid() is null or not exists(
    select 1 from public.admin_users a where a.user_id=auth.uid()
  ) then raise exception 'Admin access required'; end if;
  select * into o from public.orders where id=p_order_id for update;
  if not found then raise exception 'Order not found'; end if;
  if p_status not in ('Pending','Confirmed','Shipped','Delivered','Cancelled') then
    raise exception 'Invalid order status'; end if;
  if o.status=p_status then return o.status; end if;
  if not (
    (o.status='Pending' and p_status in ('Confirmed','Cancelled')) or
    (o.status='Confirmed' and p_status in ('Shipped','Cancelled')) or
    (o.status='Shipped' and p_status='Delivered')
  ) then raise exception 'Invalid transition from % to %',o.status,p_status; end if;
  if length(coalesce(p_note,''))>500 then raise exception 'Note too long'; end if;
  perform set_config('baba.status_note',coalesce(nullif(btrim(p_note),''),''),true);
  if o.status='Pending' and p_status='Confirmed'
     and not o.stock_reserved and o.product_id is not null then
    -- Historical orders had no reservation. Reserve only when an actual linked
    -- product and sufficient inventory exist; never silently clamp to zero.
    select stock_quantity into stock from public.products where id=o.product_id for update;
    if found then
      if stock<o.quantity then raise exception 'Insufficient stock for this order'; end if;
      perform set_config('baba.stock_reason','Legacy order confirmation: '||o.order_number,true);
      update public.products set stock_quantity=stock_quantity-o.quantity,
        stock_status=case when stock_quantity-o.quantity=0 then 'Out of Stock'
            when stock_quantity-o.quantity<=5 then 'Low Stock' else 'In Stock' end,
        updated_at=now() where id=o.product_id;
      o.stock_reserved:=true;
    end if;
  end if;
  if p_status='Cancelled' then
    perform set_config('baba.stock_reason','Order cancellation: '||o.order_number,true);
  end if;
  update public.orders set status=p_status,
    stock_reserved=o.stock_reserved,updated_at=now() where id=o.id;
  return p_status;
end $$;
revoke all on function public.admin_set_order_status(uuid,text,text) from public,anon,authenticated;
grant execute on function public.admin_set_order_status(uuid,text,text) to authenticated;

-- Manual adjustments require a recorded reason and cannot result in negative stock.
create or replace function public.admin_adjust_stock(
  p_product_id uuid,p_delta integer,p_reason text)
returns integer language plpgsql security definer set search_path=public,pg_temp as $$
declare p public.products%rowtype; next_qty integer;
begin
  if auth.uid() is null or not exists(
    select 1 from public.admin_users a where a.user_id=auth.uid()
  ) then raise exception 'Admin access required'; end if;
  if p_delta is null or p_delta=0 or abs(p_delta::bigint)>100000 then
    raise exception 'Enter a nonzero stock change within 100,000 units'; end if;
  if length(btrim(coalesce(p_reason,''))) not between 4 and 160 then
    raise exception 'Enter an adjustment reason (4 to 160 characters)'; end if;
  select * into p from public.products where id=p_product_id for update;
  if not found then raise exception 'Product not found'; end if;
  next_qty:=p.stock_quantity+p_delta;
  if next_qty<0 or next_qty>10000000 then
    raise exception 'Adjustment would result in an invalid stock quantity'; end if;
  perform set_config('baba.stock_reason','Manual: '||btrim(p_reason),true);
  update public.products
  set stock_quantity=next_qty,
      stock_status=case when next_qty=0 then 'Out of Stock'
        when next_qty<=5 then 'Low Stock' else 'In Stock' end,
      updated_at=now()
  where id=p.id;
  return next_qty;
end $$;
revoke all on function public.admin_adjust_stock(uuid,integer,text) from public,anon,authenticated;
grant execute on function public.admin_adjust_stock(uuid,integer,text) to authenticated;
