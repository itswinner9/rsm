# Stripe billing (how Resumify works)

This app follows Stripe’s standard **subscriptions + Checkout** model: [Subscriptions](https://docs.stripe.com/billing/subscriptions/overview), [Checkout](https://docs.stripe.com/payments/checkout), and [webhooks](https://docs.stripe.com/webhooks). It does **not** rely on Supabase’s optional **Stripe Foreign Data Wrapper (FDW)**.

## What this project uses

| Piece | Purpose |
|-------|---------|
| **Stripe Dashboard** | Products, Prices (`price_…`), Customers, Subscriptions |
| **Next.js API** | `STRIPE_SECRET_KEY` — create Checkout sessions, Billing Portal, sync subscriptions |
| **Hosted Checkout** | `/api/stripe/checkout` — subscription mode, 3-day trial, CAD, [Managed Payments](https://docs.stripe.com/payments/checkout/managed-payments) (`managed_payments.enabled`), Stripe API `2026-02-25.preview` |
| **Webhooks** | `POST /api/stripe/webhook` — `STRIPE_WEBHOOK_SECRET` verifies events; service role updates `user_profiles` |
| **Supabase** | Auth + Postgres `user_profiles` (Stripe IDs and subscription fields only) |

Flow: user signs in → Checkout → Stripe → webhooks → `user_profiles.subscription_status`, etc.

## What we do *not* use

**Supabase → Database → Foreign Data Wrappers → [Connecting to Stripe](https://supabase.com/docs/guides/database/extensions/wrappers/stripe)** lets you run SQL against Stripe via `stripe.prices`, `stripe.subscriptions`, etc. That is **optional** and **separate** from this codebase. You do **not** need to enable the Wrappers extension or create `stripe_server` for Resumify to bill customers. Use it only if you want analytics/reporting in SQL.

## Creating Prices in the Dashboard (monthly + yearly CAD)

Checkout expects **Price object IDs** (`price_…`), not dollar amounts. Configure recurring prices once per product, then copy the IDs into env (see [Environment variables](environment-variables.md)).

1. **Match API mode** — In Stripe Dashboard, toggle **Test mode** or **Live mode** to match your secret key (`sk_test_…` vs `sk_live_…`).
2. **Product catalog** — **Products** → select or create your subscription product (or use `STRIPE_SUBSCRIPTION_PRODUCT_ID` with a `prod_…` id).
3. **Add prices** — Open the product → **Pricing** → **Add another price** as needed:
   - **Recurring**, **CAD**, interval **Monthly** (for the monthly plan).
   - **Recurring**, **CAD**, interval **Yearly** (for the yearly plan).
4. **Copy Price IDs** — Each row shows a **Price ID** starting with `price_`. Copy the monthly id into `STRIPE_PRICE_MONTHLY_CAD` and the yearly id into `STRIPE_PRICE_YEARLY_CAD` (Vercel + `.env.local`).
5. **Redeploy** — After changing env vars on Vercel, redeploy so production picks up the new values.

If you leave `STRIPE_PRICE_MONTHLY_CAD` / `STRIPE_PRICE_YEARLY_CAD` empty, the app can use **inline** `price_data` (defaults in cents) or resolve prices from `STRIPE_SUBSCRIPTION_PRODUCT_ID` when set. For stable catalog billing, prefer explicit `price_…` IDs.

Official reference: [Manage prices](https://docs.stripe.com/products-prices/manage-prices).

## Environment variables

See [Environment variables](environment-variables.md) for `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`, price IDs or inline cents, and `SUPABASE_SERVICE_ROLE_KEY` (required for webhooks to update profiles).

## Webhook endpoint (Stripe Dashboard)

Add your public URL:

`https://<your-domain>/api/stripe/webhook`

Subscribe to at least:

- `checkout.session.completed`
- `customer.subscription.created`
- `customer.subscription.updated`
- `customer.subscription.deleted`

Use the signing secret as `STRIPE_WEBHOOK_SECRET`.

## Production checklist

1. **Live mode** in Stripe: live secret key, live webhook endpoint, live Price IDs (or blank `STRIPE_PRICE_*_CAD` for inline defaults).
2. **Same Stripe account** for keys, prices, and webhooks.
3. **`SUPABASE_SERVICE_ROLE_KEY`** set on the server so webhooks can update `user_profiles`.
4. **`NEXT_PUBLIC_APP_URL`** matches your site (Checkout success/cancel URLs).

## Further reading

- [Build a subscriptions integration](https://docs.stripe.com/billing/subscriptions/build-subscriptions) (Stripe)
- [Customer portal](https://docs.stripe.com/customer-management) — used by `/api/stripe/portal`
