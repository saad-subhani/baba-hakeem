# Phase 3 — Order & Inventory Operations

## What is new
- Owner-only `/admin/operations` page linked from the existing `/admin` sidebar.
- Full order details: customer delivery information, payment method, product line items, totals, status history, optional processing notes.
- Allowed processing workflow: Pending → Confirmed → Shipped → Delivered; Pending/Confirmed → Cancelled. Delivered, Shipped-to-cancellation, and Cancelled terminal statuses are protected.
- Order status and any associated inventory reservation/restock happen in the same PostgreSQL transaction via `admin_set_order_status`. The original admin order-status selector now uses the same RPC.
- Owner-only inventory adjustments through `admin_adjust_stock`, with a mandatory reason, negative-stock protection, and audit history.
- Automatic history records for *new* order creations/status transitions and product stock changes (new checkout, cancellations, manual edits, etc.).
- Historical single-product orders are still accessible. Earlier status events are not fabricated retroactively.
- Existing checkout product stock reservations are not deducted twice on confirmation.
- Historic orders with no product ID have no linked stock to adjust; processing them must not invent inventory.

## Database migration
`supabase/migrations/20261019_order_inventory_operations.sql` was applied to the production **baba-hakeem-herbal-products** project. New tables: `order_status_events`, `inventory_movements`. Both have RLS owner-only read access, with no public modification policies. Functions `admin_set_order_status` and `admin_adjust_stock` are authenticated-only and internally validate the approved owner.

## Verification
- Test the owner route using the actual admin account, and verify non-admin users cannot read the data.
- Process a legitimate order Pending → Confirmed; verify it logs status and does not deduct already-reserved checkout stock twice.
- For a real unshipped order, Cancelled must restore reserved stock exactly once.
- Check stock adjustments with reason; confirm history delta and new quantity are correct.
- Verify legacy orders without linked product records display safely.
- New order history is forward-only and will not include prior events that were never recorded.
- Current products remain drafts with no verified prices/stock until formally approved for publication.
- Cloudflare build success validates deployment, but an authenticated browser walkthrough still requires the real owner session.

## Locked scope
Homepage visuals, hero/scroll animations, bottle landings, Best Product WebGL, smoothness optimizations, product cards, checkout design, translations, and responsive storefront have not been changed in Phase 3.

## Remaining project deliverables
Order-confirmation and store-notification email setup, official business contact details, final product approval, payment selection, and final security/acceptance testing.
