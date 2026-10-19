# Cash on Delivery (COD) — Baba Hakeem checkout

Business payment decision confirmed: Cash on Delivery. Domain and outgoing email setup are delegated to the business.

## Customer order journey
1. Browse products and add to cart (or open a Published product's Buy Now form).
2. /cart verifies products against published Supabase records, official price and available stock. Unapproved items show Price pending, with a WhatsApp enquiry alternative. Checkout is blocked until business approval.
3. /checkout collects full name, phone number, city and full delivery address. Email and notes are optional. Cash on Delivery is the ONLY payment method. No online payment is taken.
4. Submit PLACE COD ORDER. The API invokes the database's transactional place_store_order function. The database calculates prices, reserves stock, and creates a Pending order with payment_method Cash on Delivery, customer details and line items.
5. Customer gets a reference on the receipt or the single-product confirmation. This means the order request was received, NOT approved, fulfilled, or paid.
6. Owner handles order Pending > Confirmed > Shipped > Delivered through /admin/operations. Cancellation of unshipped reserved orders restores stock exactly once.
7. COD is paid to delivery agent on arrival. This version does NOT independently record courier cash settlement. Delivered does not guarantee store cash has been received; reconcile settlements separately.

## Shipping and price disclosure
- Published Supabase price is the authoritative product price; cart promotional/demo prices are not considered approved.
- This version has no shipping-fee calculator or approved shipping-rate rules. It shows PRODUCT SUBTOTAL and explains that delivery charges, if applicable, will be confirmed before dispatch. Do not invent free delivery.
- Historical orders and their old payment methods are preserved.

## Before online selling
- Owner must verify and publish real product prices and stock. Seven catalogue products are still Draft with unapproved prices/stock.
- Verify the storefront price labels against live approved Supabase prices.
- Test an authorized order with actual approved inventory, checking order_items, pending status, reserved stock, receipt, email queue and admin visibility.
- Domain/email notifications remain disabled until independently configured by business.
- Confirm COD courier settlement/reconciliation procedure; this phase does not track physical cash collection.

## Changed files
- supabase/migrations/20261019_cod_checkout.sql
- components/StoreCheckout.js
- app/products/[slug]/page.js
- tests/phase5.test.mjs
- docs/cod-checkout.md

All homepage GSAP, WebGL, bottle placement, marketing layout, animations, responsiveness and admin workflows remain locked.
