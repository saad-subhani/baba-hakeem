-- Trigger functions run from their database triggers; they do not need client RPC access.
revoke all on function public.audit_order_status() from public, anon, authenticated;
revoke all on function public.audit_product_stock() from public, anon, authenticated;
