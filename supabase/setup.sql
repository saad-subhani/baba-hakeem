-- Baba Hakeem live catalogue + admin security
create extension if not exists pgcrypto;

create table if not exists public.products (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  category text not null default 'Other',
  type text,
  description text,
  price text,
  status text not null default 'Draft' check (status in ('Published','Draft')),
  image text not null,
  image_path text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.products enable row level security;

drop policy if exists "Public can view published products" on public.products;
create policy "Public can view published products"
on public.products for select
to anon
using (status = 'Published');

drop policy if exists "Admins can view all products" on public.products;
create policy "Admins can view all products"
on public.products for select
to authenticated
using (true);

drop policy if exists "Admins can insert products" on public.products;
create policy "Admins can insert products"
on public.products for insert
to authenticated
with check (true);

drop policy if exists "Admins can update products" on public.products;
create policy "Admins can update products"
on public.products for update
to authenticated
using (true)
with check (true);

drop policy if exists "Admins can delete products" on public.products;
create policy "Admins can delete products"
on public.products for delete
to authenticated
using (true);

insert into storage.buckets (id,name,public,file_size_limit,allowed_mime_types)
values ('product-images','product-images',true,4194304,array['image/png','image/jpeg','image/webp'])
on conflict (id) do update set public=true,file_size_limit=4194304,allowed_mime_types=array['image/png','image/jpeg','image/webp'];

drop policy if exists "Public product images" on storage.objects;
create policy "Public product images"
on storage.objects for select
to public
using (bucket_id='product-images');

drop policy if exists "Admins upload product images" on storage.objects;
create policy "Admins upload product images"
on storage.objects for insert
to authenticated
with check (bucket_id='product-images');

drop policy if exists "Admins update product images" on storage.objects;
create policy "Admins update product images"
on storage.objects for update
to authenticated
using (bucket_id='product-images');

drop policy if exists "Admins delete product images" on storage.objects;
create policy "Admins delete product images"
on storage.objects for delete
to authenticated
using (bucket_id='product-images');


-- Production catalogue fields + least-privilege admin allow-list.
alter table public.products add column if not exists slug text;
alter table public.products add column if not exists stock_status text not null default 'In Stock';
alter table public.products add column if not exists featured boolean not null default false;
alter table public.products add column if not exists sort_order integer not null default 0;
alter table public.products add column if not exists whatsapp_number text;

update public.products
set slug = lower(regexp_replace(regexp_replace(trim(name),'[^a-zA-Z0-9]+','-','g'),'(^-|-$)','','g')) || '-' || left(id::text,8)
where slug is null or slug='';

create unique index if not exists products_slug_key on public.products(slug);
alter table public.products alter column slug set not null;

create table if not exists public.admin_users (
  user_id uuid primary key references auth.users(id) on delete cascade,
  created_at timestamptz not null default now()
);
alter table public.admin_users enable row level security;

drop policy if exists "Admins can read own allow-list entry" on public.admin_users;
create policy "Admins can read own allow-list entry"
on public.admin_users for select to authenticated
using (user_id = auth.uid());

drop policy if exists "Admins can view all products" on public.products;
drop policy if exists "Admins can insert products" on public.products;
drop policy if exists "Admins can update products" on public.products;
drop policy if exists "Admins can delete products" on public.products;

create policy "Approved admins can view all products"
on public.products for select to authenticated
using (exists(select 1 from public.admin_users a where a.user_id=auth.uid()));

create policy "Approved admins can insert products"
on public.products for insert to authenticated
with check (exists(select 1 from public.admin_users a where a.user_id=auth.uid()));

create policy "Approved admins can update products"
on public.products for update to authenticated
using (exists(select 1 from public.admin_users a where a.user_id=auth.uid()))
with check (exists(select 1 from public.admin_users a where a.user_id=auth.uid()));

create policy "Approved admins can delete products"
on public.products for delete to authenticated
using (exists(select 1 from public.admin_users a where a.user_id=auth.uid()));

drop policy if exists "Admins upload product images" on storage.objects;
drop policy if exists "Admins update product images" on storage.objects;
drop policy if exists "Admins delete product images" on storage.objects;

create policy "Approved admins upload product images"
on storage.objects for insert to authenticated
with check (bucket_id='product-images' and exists(select 1 from public.admin_users a where a.user_id=auth.uid()));

create policy "Approved admins update product images"
on storage.objects for update to authenticated
using (bucket_id='product-images' and exists(select 1 from public.admin_users a where a.user_id=auth.uid()));

create policy "Approved admins delete product images"
on storage.objects for delete to authenticated
using (bucket_id='product-images' and exists(select 1 from public.admin_users a where a.user_id=auth.uid()));

-- Run once after creating your Supabase Auth admin user:
-- insert into public.admin_users(user_id)
-- select id from auth.users where email='YOUR_ADMIN_EMAIL';


-- Phase 3: inventory + customer orders.
alter table public.products add column if not exists stock_quantity integer not null default 0 check (stock_quantity >= 0);

create table if not exists public.orders (
  id uuid primary key default gen_random_uuid(),
  order_number text not null unique default ('BH-' || upper(substr(replace(gen_random_uuid()::text,'-',''),1,8))),
  product_id uuid references public.products(id) on delete set null,
  product_name text not null,
  unit_price numeric(12,2) not null default 0,
  quantity integer not null default 1 check (quantity > 0),
  total_amount numeric(12,2) not null default 0,
  customer_name text not null,
  phone text not null,
  city text not null,
  address text not null,
  notes text,
  status text not null default 'Pending' check (status in ('Pending','Confirmed','Shipped','Delivered','Cancelled')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
alter table public.orders enable row level security;

drop policy if exists "Anyone can create an order" on public.orders;
create policy "Anyone can create an order"
on public.orders for insert to anon, authenticated
with check (status='Pending' and quantity > 0);

drop policy if exists "Approved admins can view orders" on public.orders;
create policy "Approved admins can view orders"
on public.orders for select to authenticated
using (exists(select 1 from public.admin_users a where a.user_id=auth.uid()));

drop policy if exists "Approved admins can update orders" on public.orders;
create policy "Approved admins can update orders"
on public.orders for update to authenticated
using (exists(select 1 from public.admin_users a where a.user_id=auth.uid()))
with check (exists(select 1 from public.admin_users a where a.user_id=auth.uid()));

drop policy if exists "Approved admins can delete orders" on public.orders;
create policy "Approved admins can delete orders"
on public.orders for delete to authenticated
using (exists(select 1 from public.admin_users a where a.user_id=auth.uid()));


-- ============================================================
-- SINGLE OWNER ADMIN — run this migration once in SQL Editor.
-- Exactly one row may exist in admin_users. Ownership can only
-- be claimed when empty or transferred by the current owner.
-- ============================================================

create unique index if not exists admin_users_single_owner
on public.admin_users ((true));

create or replace function public.admin_owner_status()
returns table(has_owner boolean, is_owner boolean, owner_email text)
language sql
security definer
set search_path = public, auth
as $$
  select
    exists(select 1 from public.admin_users) as has_owner,
    exists(select 1 from public.admin_users where user_id=auth.uid()) as is_owner,
    case when exists(select 1 from public.admin_users where user_id=auth.uid())
      then (select u.email from auth.users u join public.admin_users a on a.user_id=u.id limit 1)
      else null end as owner_email;
$$;

revoke all on function public.admin_owner_status() from public;
grant execute on function public.admin_owner_status() to anon, authenticated;

create or replace function public.claim_admin_ownership()
returns boolean
language plpgsql
security definer
set search_path = public, auth
as $$
begin
  if auth.uid() is null then raise exception 'Authentication required'; end if;
  if exists(select 1 from public.admin_users) then return false; end if;
  insert into public.admin_users(user_id) values(auth.uid());
  return true;
exception when unique_violation then
  return false;
end;
$$;
revoke all on function public.claim_admin_ownership() from public;
grant execute on function public.claim_admin_ownership() to authenticated;

create or replace function public.transfer_admin_ownership(target_email text)
returns text
language plpgsql
security definer
set search_path = public, auth
as $$
declare target_id uuid; normalized text;
begin
  if not exists(select 1 from public.admin_users where user_id=auth.uid()) then
    raise exception 'Only the current owner can transfer ownership';
  end if;
  normalized := lower(trim(target_email));
  select id into target_id from auth.users where lower(email)=normalized limit 1;
  if target_id is null then
    raise exception 'That email must register and confirm its account before ownership can be transferred';
  end if;
  delete from public.admin_users;
  insert into public.admin_users(user_id) values(target_id);
  return normalized;
end;
$$;
revoke all on function public.transfer_admin_ownership(text) from public;
grant execute on function public.transfer_admin_ownership(text) to authenticated;

-- admin_users is now controlled only through the secure owner functions.
drop policy if exists "Admins can read own allow-list entry" on public.admin_users;
create policy "Owner can read own entry"
on public.admin_users for select to authenticated
using (user_id=auth.uid());
