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
