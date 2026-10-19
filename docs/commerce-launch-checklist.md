# Baba Hakeem — commerce go-live checklist

## Approved baseline
The existing home page styling, GSAP bottle trajectories, 3D reveal, mobile motion and site smoothness are intentionally preserved. Avoid restructuring these components.

## Installed foundation (2026-10-19)
- Dedicated /cart, /checkout and /thank-you pages.
- Transactional checkout function `public.place_store_order`, `order_items` lines, stock reservation, and cancellation restock.
- Existing historic orders retained.
- Seven draft products seeded from the existing website's images and catalogue labels. **All are unpublished, priced NULL, and have zero verified stock.** Do not mark products Published until real prices and inventory have been verified.
- New cart/checkout pages verify published catalogue prices and stock before offering order placement. Checkout always recalculates the total inside the database.

## Before accepting online orders
1. Admin login: visit `/admin` with the existing owner account.
2. For each draft, confirm name, description, image, final selling price (PKR) and real stock quantity with the business owner. Save approved entries with a valid price, set the stock status correctly, then explicitly publish.
3. Confirm that the homepage hard-coded catalogue cards and WhatsApp presentation are still demo-style. The new dedicated cart is authoritative for verified online prices; plan a separately approved visual/content alignment when all product prices have been finalized.
4. Confirm the payment method with Saad bhai. Checkout currently stores `To Be Confirmed` and **does not collect payments**.
5. Verify a low-risk end-to-end order using a genuine approved product, check order total/items, customer receipt and admin inventory. Do not send a fake paid order to production or manually manipulate live stock for demonstration.
6. Configure business email and customer email confirmations (not yet installed), plus abuse/rate limiting for anonymous checkout.
7. Add richer sales/date filters and reporting, and production contact details/sitemap as separately scoped tasks.
8. Review [Supabase security advisor](https://supabase.com/docs/guides/database/database-linter) and enable leaked-password protection in the Auth settings.

## SQL sources
- Base: `supabase/migrations/20261019_checkout.sql` (already applied).
- Follow-up: `supabase/migrations/20261019_checkout_hardening.sql` (already applied).
- Draft-only source data: `supabase/seeds/catalogue_drafts_20261019.sql` (already run, safe to re-run).

**Do not re-run migrations on a different project without reviewing its schema.** The intended production project is `baba-hakeem-herbal-products`.
