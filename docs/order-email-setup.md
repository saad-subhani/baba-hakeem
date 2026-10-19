# Phase 4 — Baba Hakeem Transactional Order Emails

## Added
- Customer order-request confirmation for a valid customer email.
- Store new-order notification for every new order, independent of customer email.
- A durable, owner-readable Supabase queue (order_email_outbox) populated atomically when new orders are inserted. No historical/test orders are backfilled.
- One server-side dispatcher shared by the main checkout and single-product order form; both use /api/orders.
- Branded email templates, HTML AND plain text, using database-validated order totals and line items. No payment success is claimed.
- Resend API Idempotency-Key per job to reduce duplicate sends.
- Explicit provider statuses, capped attempts (five), and exponential retry readiness (no scheduled retry processor is configured).
- Owner-only /admin/emails page to monitor queued, failed, and provider-accepted messages, plus an authorized Process pending / retry action.
- Customer orders remain valid even if sending fails. The queue records the failure without turning order success into a failed checkout.

## Required to ENABLE live sending

1. Obtain a business-approved domain that you control. Add it to https://resend.com/domains, publish the exact DNS records Resend provides, and wait for verified status. Do not claim domain verification without checking it.
2. Create a Resend API key with email-send permission, and store it privately. Never commit it in GitHub.
3. Confirm with Saad bhai or the business owner: the exact From address at the verified domain, the recipient inbox for store alerts, optional Reply-To address, and approval of email wording.
4. Configure the following runtime Worker SECRETS for Cloudflare Worker named verdura-botanics, via Cloudflare dashboard or secured Wrangler:
   - RESEND_API_KEY = private Resend API key.
   - SUPABASE_SERVICE_ROLE_KEY = server-only service-role key from Supabase (NOT the publishable/anon key).
   - ORDER_EMAIL_FROM = verified sender, for example Baba Hakeem <orders@YOUR_VERIFIED_DOMAIN>.
   - ORDER_EMAIL_NOTIFY_TO = approved recipient email for new order alerts.
   - ORDER_EMAIL_ENABLED = exact string true, set LAST.
   - ORDER_EMAIL_REPLY_TO = optional approved reply-to mailbox.

Cloudflare Workers with nodejs_compat can use runtime encrypted Worker secrets via process.env. The existing wrangler.jsonc already specifies nodejs_compat. Never use NEXT_PUBLIC_ for any secret, and do not put secret values in GitHub Actions workflow environment text.

5. Open /admin/emails using the approved sole-owner account, and inspect any NEWLY queued records.
6. Place one genuine, owner-approved small test order from checkout or a single-product order page after configuration. Confirm actual sending, exact email content, provider acceptance and mailbox delivery. Avoid creating fake live sales.
7. If sending fails, retry through /admin/emails after the next retry time. This is manual recovery, not scheduled background retries.
8. Confirm mail delivery with actual inbox testing; provider acceptance is NOT proof of inbox delivery. Webhooks for bounce/delivery events are a potential follow-up.

## Security and operational notes
- Database functions claim_order_email_jobs and complete_order_email_job are service-role only; browser callers cannot execute them.
- Outbox rows have owner-only SELECT RLS. The retry endpoint also validates owner identity from the Supabase access token.
- Jobs and email content use database-validated order data, not arbitrary browser-provided email bodies.
- Sending is fail-closed unless the secret values are present and ORDER_EMAIL_ENABLED=true.
- An order is NOT rolled back when email delivery fails.
- The queue is limited to five attempts per notification; retries occur on a later valid dispatch request or a future scheduled worker.
- For fully automatic retries without owner action, a server-authenticated scheduled queue processor must be enabled later.
- Confirm privacy/data-retention requirements for order contact information. Never log email API keys or complete email content.
- All 7 seeded products remain Draft until actual stock and prices are approved.

## Technical source
- supabase/migrations/20261019_order_email_outbox.sql
- lib/orderEmailDispatch.js
- app/api/orders/route.js
- app/api/admin/email-dispatch/route.js
- app/admin/emails/page.js
- components/AdminEmailQueue.js and associated module CSS

## Status
Database notification queue and code can be deployed before credentials. No approved sender domain, business recipient inbox, or Resend API key was supplied. Do not claim live email delivery or sent messages until provider configuration and actual mailbox tests succeed. All approved storefront animations, bottle positioning, GSAP, 3D effects, responsiveness and smoothness remain unchanged.
