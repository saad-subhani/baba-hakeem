# Storefront and Admin Catalogue Synchronization

## Issue addressed
The locked homepage uses six established card elements. A separate cart enhancement layer previously displayed hardcoded demo prices (Hair Oil Rs. 1,200, Joint Oil Rs. 1,800, etc.), while a newer published Hair oil record in Supabase had Rs. 2,000 and a different uploaded product image. Published names matching one of the six cards were intentionally filtered out to prevent duplicates, so the homepage appeared unchanged despite an Admin publish action.

## Behavior after fix
- The six original product-card nodes and all visual motion references remain intact; any matching published product supplies official price, category, description and image to the corresponding existing card.
- Matching ignores capitalization and repeated spaces, choosing the latest published record, consistent with the database ordering at checkout.
- Ordinary static catalogue images are replaced by the approved uploaded image, and reset to their original static image if no matching published product remains. **Joint Oil and Men's Oil animated images are left completely untouched** to avoid disrupting GSAP/hero-to-card and bottle-to-hands choreography. Their published images still appear in the quick-detail modal and cart.
- Price and stock badge shows the actual published product and quantity. The UI offers Add to Cart only for priced products with positive available stock. Sold-out or unpublished items remain available for WhatsApp enquiry and cannot be incorrectly ordered.
- Quick view, floating cart quantities/subtotal, and the dedicated Cart/Checkout route all look up the live published catalogue. The original localStorage cart item keys are retained to avoid losing existing carts.
- Product data is queried on load and refreshed when the browser tab is revisited. New admin products that don't match the original six appear in the existing additional-card area.
- Old marketing/demo prices are no longer treated as sale prices; no product prices or stock values are invented.
- Database checkout still validates final order totals and stock transactionally; **no database migrations or data edits are required**.

## Current live data at implementation review
Two case-variant Hair Oil records existed: an old Draft Hair Oil with no price and a newer Published Hair oil priced Rs. 2,000, uploaded green bottle image. At the moment of review the published record's stock quantity was **0**, marked Out of Stock (the earlier screenshot showed 1). Therefore the storefront should show Rs. 2,000 and Out of stock until the owner checks real inventory. Do not adjust stock unless the business confirms it.

## Manual QA
1. Reload the deployed site with Ctrl+Shift+R. On Our Products, inspect the **first Hair Oil card**. It should show the approved green bottle and Rs. 2,000, not Rs. 1,200. Out-of-stock must block Add to Cart.
2. Click Hair Oil's card: quick-view image/price must match Admin and the button must be disabled when stock is zero; WhatsApp enquiry stays available.
3. Update real stock in Admin (only if inventory physically exists), set In Stock, and revisit the storefront. Positive inventory should allow Add to Cart and Checkout at the approved amount.
4. Put one approved unit in the cart; the floating cart, /cart and /checkout must show matching price/image/availability, and the order is COD. Never create a fake live order.
5. Check Joint Oil scrolling into its original card and Men's Oil bottle-to-hands landing; neither animated asset must shift.
6. Publish/unpublish an additional test-approved product and check cards update after revisit without duplicate matching names.
7. Mobile layout, product modal, cart drawer and product buttons must remain usable and properly sized.
8. Existing customer-facing storefront design, header, GSAP, WebGL/3D elements, and responsive CSS were not edited.

## Files
- lib/storefrontCatalogue.mjs — normalized matching, verified price, availability rules
- components/CartExperience.js — live product enhancement and cart pricing
- components/StoreCheckout.js — newest-first published-product lookup
- tests/phase5.test.mjs — price, publication/stock restrictions, GSAP anchoring smoke tests
