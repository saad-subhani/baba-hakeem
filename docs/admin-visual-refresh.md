# 2026 Admin Workspace Visual Refresh

## Why this redesign
The previous private admin pages were extremely dense: labels below 10 px, barely readable table rows and low-contrast cards. Order Operations also opened with a large empty detail pane until an order was clicked.

## Changes
- All private admin pages now share a readable, consistent emerald/sage/cream visual system.
- Administration navigation is visible across Order Operations, Sales Reports, Emails, and Contact Enquiries, with active tab, horizontal mobile scrolling, and clear focus states.
- Root /admin product management and order management retain their original workflows and security. Readable typography, responsive sidebar, spacious form controls, revised orders and product cards, and three linked quick-action cards have been added.
- On Order Operations the first real order is selected automatically after a successful owner-only fetch, so details aren't hidden behind an empty pane.
- Screens under 1020 px use stacked content cards where appropriate. At mobile widths (<650 px), forms become single-column, tables scroll safely, and stats use one or two readable columns.
- Only within /admin pages, the storefront's floating cart widget and ENG/Urdu selector are hidden, preventing them from covering private management controls. Storefront behavior is unchanged.
- Owner transfer page visuals also match the new design system.
- No business data, pricing, inventory, payment handling, Supabase RPCs, order email queue logic, or migrations changed.

## Files
- app/admin/layout.js and app/admin/admin-design.css: admin-only style scope and shared navigation.
- app/admin/admin.css and app/admin/page.js: dashboard/management redesign and shortcut cards.
- components/AdminSectionNav.js: reusable nav.
- components/AdminOperations.js / AdminOperations.module.css: UX and responsive styles.
- components/AdminSalesReports.js / AdminSalesReports.module.css: layout and responsive styles.
- components/AdminEmailQueue.js / AdminEmailQueue.module.css: order email monitor styles.
- components/AdminEnquiries.js: shared nav, same email/inbox styles.
- app/admin/transfer/transfer.css: responsive ownership page.
- tests/phase5.test.mjs: existing smoke tests plus admin regression checks.

## Acceptance and testing
1. Sign into /admin; verify quick-action navigation, product listing editing, upload, stock fields, order status, security and owner sections.
2. Open /admin/operations; verify first order details are visible and all buttons/selects fit at 375px, 768px, 1200px and large desktop.
3. Check /admin/reports filtering and exported CSV; verify new UI doesn't change totals or RLS.
4. Open /admin/emails and /admin/inquiries to check legible tables, statuses and mobile overflow; verify owner-only access.
5. Check /admin/transfer (only if owner transfer is legitimately in progress).
6. Check public homepage hero, bottle/GSAP, webGL, cart and translation switch: no customer-facing source files have been modified.
7. Build passing is not a substitute for a logged-in visual browser walkthrough on desktop and mobile.

## Constraints
One atomic GitHub commit and a single Cloudflare deployment trigger. All marketing and storefront functionality remain locked.
