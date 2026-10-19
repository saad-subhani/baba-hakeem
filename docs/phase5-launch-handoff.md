# Phase 5 — Baba Hakeem launch handoff and acceptance checklist

Last review: 2026-10-19. Production code and database are real; commercial policies and owner approvals are still needed.

## What Phase 5 delivers
- Existing About and Contact premium page components retained; layout, GSAP and product animations unchanged.
- Contact includes a live customer enquiry form: name, email and/or phone, category, optional order reference, message.
- Enquiries are persisted to a PRIVATE Supabase table. The owner may read and mark an enquiry New / In progress / Resolved at /admin/inquiries. Enquiries do not rely on outgoing email being configured.
- The known website WhatsApp channel remains available on Contact. The business should confirm that this is still its authorized number.
- The server validates the form; Supabase RPC independently validates fields and limits each contact to 3 requests in 30 minutes. Basic honeypot included. Further bot/WAF rate limiting is recommended.
- Sitemap is served at /sitemap.xml. Includes home, About, Contact, Care Guide, FAQ, Ingredients, Process and CURRENTLY PUBLISHED products only. Drafts never appear. The XML uses the actual serving host; when the owner later connects the real domain, sitemap URLs follow that domain (do not invent a canonical business domain).
- Robots is served at /robots.txt, points to the runtime-host sitemap and disallows /admin, /api/, /cart, /checkout, /thank-you and unfinished policy pages.
- Checkout/cart/thank-you and all admin routes get NOINDEX metadata. Unpublished/missing product details get NOINDEX through dynamic product route metadata.
- About/Contact and root metadata improved without changing premium layout, imagery, copy structure or motion.
- Existing Privacy text states the current contact and checkout data collected. Privacy, Terms and Shipping & Returns remain discoverable through footer links, but NOINDEX until business approves their legal/commercial details.
- Built-in Node smoke tests run before build/deploy in the SINGLE Cloudflare workflow. Smoke tests cover SEO XML formatting, private paths, enquiry integration, RLS presence and baseline bottle animation signatures.

## Confirmed live foundation
- 2 historical orders preserved, 7 draft products retained; no prices/stock were invented.
- Secure order functions, order-item details, inventory history, sales reports and email queue from earlier phases remain in place.
- The real sender domain, private email keys and official store inbox are NOT configured here. Emails remain disabled.

## Acceptance steps after deployment
1. Open /about and /contact on desktop and mobile. Confirm premium motion, hero, site header, card styling, and form spacing.
2. From a real browser, submit ONE authorized contact enquiry (do not include personal secrets) and verify it appears on /admin/inquiries. Mark it In progress then Resolved. Do NOT fabricate customer orders or paid purchases for testing.
3. Verify invalid contact form fields are rejected, excessive submissions throttle, and non-owner users cannot read the enquiry inbox.
4. Visit /robots.txt and /sitemap.xml on the deployed host. Confirm correct host, public routes and NO drafts or private routes. Once the final domain is connected, recheck both URLs and submit the sitemap to Google Search Console.
5. Check /cart, /checkout, /thank-you and /admin for noindex metadata. Browse a draft/missing product route to confirm it is not indexed.
6. Test real order processing only after the business supplies verified prices, stock counts, payment choice and official shipping conditions. The 7 products are currently Draft.
7. Configure verified sender domain and store email inbox later, using docs/order-email-setup.md. No automatic email delivery is currently active.
8. Business approval needed: official identity and WhatsApp contact, terms of sale, payment model, shipping/returns/refunds, privacy/data retention, disclaimer and product copy, and pricing/stock.
9. Security follow-ups: enable leaked-password protection in Supabase Auth, review remaining intentional security-definer warnings, configure Cloudflare WAF/rate limits, consider CAPTCHA for public forms/checkout, confirm order-account access.
10. Real-world authenticated browser tests and mailbox-delivery tests require an owner session and configured credentials; a successful build alone does not prove those operations work.

## Strictly locked
- Homepage bottle landing and its 11.5° product tilt
- GSAP ScrollTrigger paths and timings, Best Product WebGL/3D section
- Site smoothness, responsive styling, translation, header, checkout visual styling, and the existing approved marketing layout
No migration deletes existing order/product records. No contact enquiry was submitted during migration.

## Files added or extended
- components/ContactEnquiryForm.js
- components/AdminEnquiries.js
- app/api/contact/route.js
- app/admin/inquiries/page.js
- supabase/migrations/20261019_contact_enquiries.sql
- lib/siteSeo.mjs
- app/robots.txt/route.js and app/sitemap.xml/route.js
- app/products/[slug]/layout.js
- tests/phase5.test.mjs
- app/admin/layout.js
- Minor metadata and link changes to About, Contact, Privacy, Terms, Shipping & Returns, Cart, Checkout and Thank You.
