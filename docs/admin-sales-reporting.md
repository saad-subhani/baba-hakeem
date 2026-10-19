# Phase 2 — Admin Sales Dashboard and Reports

## Access and navigation
- Sign in using the sole approved Supabase owner account at `/admin`.
- Select **Sales Reports** from the existing left navigation, or open `/admin/reports`.
- Access is checked with Supabase Auth `getUser()` and `admin_owner_status()`. The underlying `orders` and `order_items` data is protected with existing Row-Level Security policies.
- No public reporting API was added.

## Metrics
- **Delivered revenue**: sums only `Delivered` orders' `total_amount` (or matching `order_items.line_total` when filtering to one product).
- **Matched orders**: order count across all selected statuses.
- **Units sold**: sum of delivered order item quantities (or legacy order quantity).
- **Average delivered order value**: delivered revenue / delivered order count.
- **Pending orders and pending value**: pipeline figures, not recognized revenue.
- Best-selling products are ranked using delivered quantities.
- New orders use `order_items`; pre-migration orders fall back to their single-product `orders` fields. Never count a multi-product order twice.
- All amounts are PKR as stored in Supabase; no test/sample revenue is inserted.

## Report controls
Date presets: all time, last 7 days, last 30 days, current calendar month, custom from/to.
Status: all, pending, confirmed, shipped, delivered, cancelled.
Product: names present in existing orders, including historical ones.
Search: order number, customer name, city, phone, product.
Exports: filtered orders CSV and financial summary CSV; both are Excel-compatible UTF-8 CSV files.

## Implementation safeguards
- Read-only report. Order edit/cancel/delete, inventory and product publishing continue through the existing dashboard.
- Cursor-like batched reads at 500 rows per request for the current authenticated owner. If a report exceeds 50,000 rows it stops with a clear warning rather than silently showing partial totals; a server-side reporting endpoint would be needed for stores at that scale.
- Reload button retrieves latest Supabase order status changes.
- Customer names and other CSV text are quoted and prefixed if they could be interpreted by spreadsheet software as formulas.
- Approved homepage, animations, bottle alignment, WebGL and storefront design are unchanged.

## Current live figures, verified 2026-10-19
2 Pending orders with a combined value of PKR 22,400; 0 Delivered orders; 0 `order_items` rows. This implies delivered revenue = PKR 0. These figures are live data, not seed data.

## Still pending beyond Phase 2
Confirm business product prices and inventory; payment method; customer and store order email integration; server-side rate limits and spam protection on anonymous checkout; operational end-to-end order tests.
