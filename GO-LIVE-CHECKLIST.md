# ProxyHarbor go-live checklist

This repository is a deployable full-stack starter, not a live merchant account. Live orders stay disabled until you configure the external services below.

## 1. Create service accounts
- Supabase project: create a project and run `supabase/schema.sql` in its SQL Editor.
- NOWPayments: create a merchant account, confirm business/country eligibility, configure payout wallet(s), enable supported coins/networks, create API key and IPN secret.
- VeritasProxy: create an account, generate an API key, confirm residential/datacenter product types and current costs, and apply to its reseller program.
- Hosting: deploy this Next.js project to a host that supports server-side Next.js routes (for example, Vercel or Netlify's Next.js runtime). Set the production `APP_BASE_URL`.

## 2. Set environment variables
Copy `.env.example` to `.env.local` for local development and set the values in your host's server-side environment settings:
- `SUPABASE_URL`
- `SUPABASE_SERVICE_ROLE_KEY`
- `NOWPAYMENTS_API_KEY`
- `NOWPAYMENTS_IPN_SECRET`
- `VERITASPROXY_API_KEY`
- `CREDENTIALS_ENCRYPTION_KEY` (generate with `openssl rand -hex 32`)
- `APP_BASE_URL`

Never add secrets to client-side variables, commit them to Git, or share them in chat.

## 3. Confirm product and payment mapping
- The app shows USD retail prices in `lib/plans.ts`. Verify supplier pricing and margin before accepting orders.
- The checkout UI lists USDT TRC20, USDT BEP20, BTC, and ETH. Confirm the exact codes supported by your NOWPayments merchant account. Update `ALLOWED_COINS` and the UI to match.
- This starter creates a NOWPayments hosted invoice with USD as the price currency. It validates the webhook signature and only starts fulfilment when status is `finished`.
- Test how your NOWPayments account represents invoice/order identifiers and paid amount/currency in its IPN payload before launch. Keep test mode or a low-value test plan until verified.

## 4. Test carefully
- Valid payment, wrong amount, wrong currency, underpayment, duplicate webhook, delayed confirmation, expired invoice, supplier API failure, database outage, and concurrent webhook deliveries.
- Confirm that proxy credentials are never returned before the order is fulfilled and that the order access token is kept private.
- Configure monitoring and an admin-only reconciliation process for `payment_review` and `provisioning_failed` orders.
- Add rate limiting and abuse monitoring to checkout and order lookup routes before public launch.
- Replace policy templates and `support@example.com` with accurate business contact details.
- Confirm supplier terms, reseller approval, refund rules, privacy obligations, and local business/tax requirements.

## Important limitations
- This starter does not email the customer an order-access link; the checkout response returns it to the browser. Add verified transactional email before public launch so customers can recover their order link safely.
- No admin dashboard is included.
- Do not promise a proxy plan is ready until a successful live test confirms it.
- Review and test the payment webhook amount/currency fields against current NOWPayments documentation and real sandbox payloads. A webhook signature alone is not sufficient to validate an order.
