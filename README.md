# ProxyHarbor Full-Stack Starter

A Next.js storefront starter for a proxy reseller with a server-side checkout flow, NOWPayments hosted invoices, signed IPN validation, VeritasProxy provisioning, encrypted credentials, and token-protected order lookup.

**This is not yet a live or production-audited store.** You must create and configure your own service accounts and keys, confirm supplier terms and payment-provider eligibility, and test every payment/provisioning edge case.

## What is included
- Responsive ProxyHarbor storefront with residential/datacenter plans and an FAQ section
- Checkout form for USDT TRC20, USDT BEP20, BTC, and ETH (adjust to coins actually enabled in your account)
- Server-side plan price lookup; client cannot set the price
- NOWPayments hosted invoice creation and HMAC-SHA512 IPN signature verification
- VeritasProxy server-side plan provisioning using an idempotency key
- Encrypted-at-rest proxy credentials using AES-256-GCM
- Random-token protected order status/credential endpoint
- Supabase order schema and policy template pages

## Run locally
1. Install Node.js 20+.
2. Run `npm install`.
3. Copy `.env.example` to `.env.local` and set all secrets.
4. Create a Supabase project and run `supabase/schema.sql`.
5. Run `npm run dev`.
6. Open `http://localhost:3000`.

## Deploy
Deploy to Vercel or a host that supports Next.js App Router API routes. Netlify may also support Next.js, but confirm current runtime support and set all environment variables in the host dashboard. A static-only drag-and-drop deployment will not run checkout, webhook, database, or provisioning routes.

See `docs/GO-LIVE-CHECKLIST.md` before accepting real payments. Replace the example support email in `app/page.tsx`, verify every displayed price and payment network, and complete a mobile-browser review before launch.

## External documentation
- NOWPayments API: https://nowpayments.io/api
- NOWPayments IPN: https://nowpayments.zendesk.com/hc/en-us/articles/21395546303389-IPN-and-how-to-setup
- VeritasProxy API: https://veritasproxy.com/docs
- VeritasProxy reseller program: https://veritasproxy.com/docs/reseller-program
