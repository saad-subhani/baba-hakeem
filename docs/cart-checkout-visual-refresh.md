# Baba Hakeem / Premium Cart and COD Checkout Layout

## Design brief
Adapt the user's reference screenshot's clean checkout layout, horizontal stepper, light input fields and right-hand order summary into Baba Hakeem's existing emerald/sage/cream brand. The source screenshot included card payments and UK-specific billing fields; these are NOT part of the Baba Hakeem COD project and have not been copied.

## New customer journey
1. /cart — Step 1: Cart. Edit quantities, remove items, see approved published product prices, stock status, line totals and a sticky order-summary card.
2. /checkout — Step 2: Delivery & COD. Submit customer full name, optional email, phone, city, complete Pakistan delivery address and optional notes. Review items on the right. Cash on Delivery is selected; no payment card or online payment collection.
3. /thank-you — Step 3: Order received. The existing premium Thank You screen remains completely unchanged and displays a session-matching order reference.

## Responsive visual details
- Light premium background and stronger typography
- Green/gold-accented progress circles with active/completed states
- Two-column desktop layout; single-column under 850px; touch-sized inputs and buttons
- Cart summary line totals and order subtotal
- Sticky summary on desktops, normal flow on tablets/mobile
- COD-only method panel, no invented shipping charge or promise of free delivery
- Secure order, careful packing and WhatsApp trust strip
- Keyboard focus styles and reduced-motion support

## Deliberately unchanged
- Order API and Supabase pricing, inventory, stock reservation and order creation
- Existing cart localStorage format and quantity/remove operations
- Published-only product availability gate
- All existing Thank You component logic, styling and order reference behavior
- Header and marketing website, GSAP, 3D, bottle placement, animations
- Admin and Supabase database

## Manual acceptance
- Verify /cart with 0, 1 and multiple approved items; check prices/stock against live Admin data.
- Quantity + / − and Remove update both floating cart and page total; disallowed/draft products must not proceed to checkout.
- Continue to Checkout displays the shipping form with all original fields; COD remains the only payment mode.
- Do NOT enter card details; none are requested.
- Check review summary and product subtotal; shipping charges must remain To Be Confirmed.
- Confirm browser validation and server order flow with ONE legitimate authorized order only; don't generate fake production sales.
- Confirm Thank You still shows receipt for the matched browser session.
- Check desktop, 768px tablet and 390px mobile for text wrapping, navigation and scroll behavior.
- Read-only browser inspection cannot prove authenticated order flow or customer data entry end-to-end.
