-- Baba Hakeem checkout: additive schema + transaction-safe order placement.
-- Apply through Supabase SQL editor before enabling checkout. Existing data is retained.
alter table public.orders add column if not exists customer_email text;
alter table public.orders add column if not exists payment_method text not null default 'To Be Confirmed';
alter table public.orders add column if not exists stock_reserved boolean not null default false;

create table if not exists public.order_items (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders(id) on delete cascade,
  product_id uuid references public.products(id) on delete set null,
  product_name text not null,
  unit_price numeric(12,2) not null check (unit_price >= 0),
  quantity integer not null check (quantity between 1 and 99),
  line_total numeric(12,2) not null check (line_total >= 0),
  created_at timestamptz not null default now()
);
create index if not exists order_items_order_id_idx on public.order_items(order_id);
alter table public.order_items enable row level security;

drop policy if exists "Approved admins can view order items" on public.order_items;
create policy "Approved admins can view order items" on public.order_items for select to authenticated
using (exists (select 1 from public.admin_users a where a.user_id=auth.uid()));

drop policy if exists "Approved admins can update order items" on public.order_items;
create policy "Approved admins can update order items" on public.order_items for update to authenticated
using (exists (select 1 from public.admin_users a where a.user_id=auth.uid()))
with check (exists (select 1 from public.admin_users a where a.user_id=auth.uid()));

-- Public callers can execute this transaction but cannot specify a product price,
-- amount, status, payment method, order number, or free inventory.
create or replace function public.place_store_order(p_customer jsonb,p_items jsonb)
returns table(order_number text,total_amount numeric)
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  v_name text := btrim(coalesce(p_customer->>'name',''));
  v_email text := lower(btrim(coalesce(p_customer->>'email','')));
  v_phone text := btrim(coalesce(p_customer->>'phone',''));
  v_city text := btrim(coalesce(p_customer->>'city',''));
  v_address text := btrim(coalesce(p_customer->>'address',''));
  v_notes text := nullif(btrim(coalesce(p_customer->>'notes','')),'');
  v_item jsonb;
  v_lookup text;
  v_product public.products%rowtype;
  v_qty integer;
  v_qty_raw text;
  v_price_raw text;
  v_price numeric(12,2);
  v_total numeric(12,2) := 0;
  v_units integer := 0;
  v_count integer := 0;
  v_seen uuid[] := '{}'::uuid[];
  v_lines jsonb := '[]'::jsonb;
  v_line jsonb;
  v_id uuid;
  v_first_id uuid;
  v_first_name text;
  v_first_price numeric(12,2);
  v_first_qty integer;
begin
  if jsonb_typeof(p_customer) is distinct from 'object'
     or jsonb_typeof(p_items) is distinct from 'array'
     or jsonb_array_length(p_items) not between 1 and 20 then
    raise exception 'Invalid checkout request';
  end if;
  if length(v_name) not between 2 and 120
     or length(v_phone) not between 7 and 24
     or length(v_city) not between 2 and 120
     or length(v_address) not between 8 and 500
     or length(coalesce(v_notes,'')) > 1000
     or length(v_email) > 254 then
    raise exception 'Please enter valid delivery details';
  end if;
  if v_email <> '' and v_email !~* '^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$' then
    raise exception 'Please enter a valid email address';
  end if;

  for v_item in select value from jsonb_array_elements(p_items) loop
    if jsonb_typeof(v_item) is distinct from 'object' then
      raise exception 'Invalid product entry';
    end if;
    v_lookup := btrim(coalesce(v_item->>'id',''));
    v_qty_raw := coalesce(v_item->>'quantity','');
    if v_qty_raw !~ '^[0-9]{1,2}$' then raise exception 'Invalid quantity'; end if;
    v_qty := v_qty_raw::integer;
    if v_qty not between 1 and 99 then raise exception 'Quantity must be between 1 and 99'; end if;
    v_product := null;
    -- Cart cards currently store name-based slugs; database-managed products use UUIDs.
    if v_lookup ~* '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$' then
      select * into v_product from public.products
      where id=v_lookup::uuid and status='Published' for update;
    else
      select * into v_product from public.products
      where lower(btrim(name))=lower(btrim(coalesce(v_item->>'name','')))
        and status='Published'
      order by created_at desc limit 1 for update;
    end if;
    if v_product.id is null then
      raise exception 'A product is unavailable in the live catalogue. Please contact the store.';
    end if;
    if v_product.id = any(v_seen) then raise exception 'Duplicate cart item'; end if;
    v_seen := array_append(v_seen,v_product.id);
    if v_product.stock_status='Out of Stock'
       or v_product.stock_quantity < v_qty then
      raise exception 'Insufficient stock for %',v_product.name;
    end if;
    -- Price is sourced from the product row, never from client JSON.
    v_price_raw := regexp_replace(lower(coalesce(v_product.price,'')),'(rs[.]?|pkr|,|[[:space:]])','','g');
    if v_price_raw !~ '^[0-9]+(\.[0-9]{1,2})?$' then
      raise exception 'Price for % must be confirmed with the store',v_product.name;
    end if;
    v_price := v_price_raw::numeric(12,2);
    if v_price <= 0 then raise exception 'Price for % must be confirmed',v_product.name; end if;
    v_count := v_count+1;
    v_units := v_units+v_qty;
    if v_units > 100 then raise exception 'Maximum order quantity exceeded'; end if;
    v_total := v_total+(v_price*v_qty);
    if v_count=1 then
      v_first_id:=v_product.id;v_first_name:=v_product.name;
      v_first_price:=v_price;v_first_qty:=v_qty;
    end if;
    v_lines := v_lines||jsonb_build_array(jsonb_build_object(
      'id',v_product.id,'name',v_product.name,'price',v_price,
      'quantity',v_qty,'line_total',v_price*v_qty
    ));
  end loop;
  insert into public.orders(product_id,product_name,unit_price,quantity,total_amount,
    customer_name,customer_email,phone,city,address,notes,payment_method,status,stock_reserved)
  values(v_first_id,case when v_count=1 then v_first_name else
    v_first_name||' + '||(v_count-1)::text||' more' end,
    v_first_price,v_first_qty,v_total,v_name,nullif(v_email,''),v_phone,v_city,
    v_address,v_notes,'To Be Confirmed','Pending',true)
  returning id into v_id;

  for v_line in select value from jsonb_array_elements(v_lines) loop
    insert into public.order_items(order_id,product_id,product_name,unit_price,quantity,line_total)
    values(v_id,(v_line->>'id')::uuid,v_line->>'name',
      (v_line->>'price')::numeric,(v_line->>'quantity')::integer,
      (v_line->>'line_total')::numeric);
  end loop;
  -- Inventory is reserved on order placement, in the same locked transaction.
  for v_line in select value from jsonb_array_elements(v_lines) loop
    update public.products
    set stock_quantity=stock_quantity-(v_line->>'quantity')::integer,
        stock_status=case
          when stock_quantity-(v_line->>'quantity')::integer=0 then 'Out of Stock'
          when stock_quantity-(v_line->>'quantity')::integer<=5 then 'Low Stock'
          else 'In Stock' end,
        updated_at=now()
    where id=(v_line->>'id')::uuid;
  end loop;
  return query select o.order_number,o.total_amount from public.orders o where o.id=v_id;
end $$;

revoke all on function public.place_store_order(jsonb,jsonb) from public;
grant execute on function public.place_store_order(jsonb,jsonb) to anon, authenticated;

-- Close old direct-write access: otherwise a caller can invent a zero-priced order.
drop policy if exists "Anyone can create an order" on public.orders;
-- Order reads remain restricted to the approved admin users.

-- Stock for new checkout orders is reserved when placed, not again on confirmation.
-- Replenish on cancellation of an unshipped order exactly once.
create or replace function public.restore_cancelled_order_stock()
returns trigger language plpgsql security definer set search_path=public,pg_temp as $$
declare item record;
begin
  if old.stock_reserved and old.status='Cancelled' and new.status<>'Cancelled' then
    raise exception 'Cancelled orders cannot be reopened; place a new order';
  end if;
  if old.stock_reserved and old.status in ('Pending','Confirmed')
     and new.status='Cancelled' then
    for item in select product_id,quantity from public.order_items where order_id=old.id loop
      update public.products
      set stock_quantity=stock_quantity+item.quantity,
          stock_status=case when stock_quantity+item.quantity<=5 then 'Low Stock' else 'In Stock' end,
          updated_at=now()
      where id=item.product_id;
    end loop;
  end if;
  return new;
end $$;
drop trigger if exists orders_restore_cancelled_stock on public.orders;
create trigger orders_restore_cancelled_stock
before update of status on public.orders
for each row execute function public.restore_cancelled_order_stock();
