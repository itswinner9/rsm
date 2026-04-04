# Environment variables

Copy [`.env.example`](../.env.example) to `.env.local` for local development. Configure the same keys in **Vercel → Project → Settings → Environment Variables** (Production / Preview / Development as appropriate).

## App URL

| Variable | Role |
|----------|------|
| **`NEXT_PUBLIC_APP_URL`** | Public site origin **without** a trailing slash (e.g. `https://resumify.cc` in production, `http://localhost:3000` locally). Used for Open Graph, Stripe success/cancel URLs, OpenRouter `HTTP-Referer`, auth redirects, and site metadata. |

**Production:** Set this to your real HTTPS domain on Vercel. Do **not** leave it as `localhost` in Production (breaks email/OAuth links).

**Vercel:** `VERCEL_URL` is injected automatically; some helpers fall back to `https://${VERCEL_URL}` when `NEXT_PUBLIC_APP_URL` is unset—still prefer setting `NEXT_PUBLIC_APP_URL` explicitly for stable canonical URLs.

## Supabase

| Variable | Role |
|----------|------|
| **`NEXT_PUBLIC_SUPABASE_URL`** | Project URL (Dashboard → Project Settings → API). Required by client, server, middleware, and auth callback. |
| **`NEXT_PUBLIC_SUPABASE_ANON_KEY`** | Public anon key (same screen). Safe to expose in the browser; RLS applies. |
| **`SUPABASE_SERVICE_ROLE_KEY`** | **Server-only.** Bypasses RLS for Stripe webhooks, subscription sync, and trial usage writes. **Never** expose to the client or commit. |

If `SUPABASE_SERVICE_ROLE_KEY` is missing, service-role features degrade (for example webhook/profile updates may fail).

## OpenRouter (AI resume optimization)

| Variable | Role |
|----------|------|
| **`OPENROUTER_API_KEY`** | Server-only API key from [OpenRouter](https://openrouter.ai/). Required for `/api/optimize-resume`. Without it, optimize returns 503. |

## Stripe (billing)

| Variable | Role |
|----------|------|
| **`STRIPE_SECRET_KEY`** | Secret key (`sk_live_...` or `sk_test_...`) from Stripe Dashboard → Developers → API keys. Used for Checkout, webhooks, and subscription sync. **Server-only.** |
| **`STRIPE_WEBHOOK_SECRET`** | Signing secret for the webhook endpoint that points to `/api/stripe/webhook` (Dashboard → Developers → Webhooks). |
| **`STRIPE_PRICE_MONTHLY_CAD`** | Stripe **Price** ID (`price_...`) for the monthly CAD plan (Checkout when `plan` is `month`). Create recurring CAD prices in Dashboard — see [Stripe billing](stripe-billing.md) (*Creating Prices in the Dashboard*). |
| **`STRIPE_PRICE_YEARLY_CAD`** | Price ID for the yearly CAD plan when `plan` is `year`. Same Dashboard steps; use **yearly** recurring Price ID. |
| **`STRIPE_PRICE_MONTHLY_CENTS`** | Optional. If `STRIPE_PRICE_MONTHLY_CAD` is **unset**, Checkout uses inline pricing; this sets the monthly amount in **cents** (default `999` = $9.99 CAD). |
| **`STRIPE_PRICE_YEARLY_CENTS`** | Optional. Same for yearly when `STRIPE_PRICE_YEARLY_CAD` is unset (default `9999` = $99.99 CAD). |

**Important:** When set, values must be **Price** IDs (`price_...`) from **Product catalog → your product → Pricing**. Do **not** paste a **Subscription** ID (`sub_...` from the Subscriptions page), a **Product** ID (`prod_...`), or a **Customer** ID (`cus_...`)—Checkout will fail with errors like “No such price”.

If **both** `STRIPE_PRICE_MONTHLY_CAD` / `STRIPE_PRICE_YEARLY_CAD` are **left blank** for a given plan, the app uses Stripe **inline `price_data`** (CAD amounts from the cents env vars or defaults above) so checkout still works with only **`STRIPE_SECRET_KEY`**. For production, prefer creating Products/Prices in Stripe and setting the `price_...` IDs.

**Never** set `STRIPE_PRICE_*` to the displayed price (`9.99`, `999` cents, `$9.99`, etc.). Stripe expects the **Price object ID** (`price_xxxxxxxx`), not the numerical amount.

**Checkout troubleshooting:** If the app says the price must be a Price object ID, open **Stripe → Product catalog → your product → Pricing**, copy each **Price ID** (`price_...`), and set **Vercel** (and `.env.local`) to those values. Use **test** Price IDs with **test** API keys and **live** prices with **live** keys. Redeploy after changing env vars. See also [Stripe: manage prices](https://docs.stripe.com/products-prices/manage-prices).

**Note:** The publishable key (`pk_...`) is only needed if you add client-side Stripe.js; the current server-side Checkout flow uses the secret key and hosted Checkout session URLs only.

## Automatic / platform-provided

These are not usually set in `.env.local`:

- **`NODE_ENV`**: `development` or `production` (set by Next.js / Node).
- **`VERCEL_URL`**: Set on Vercel deployments; used as a fallback for app origin in some helpers.

## Security checklist

- Never commit `.env.local` or real secrets.
- Rotate keys if they were exposed (for example pasted in chat or committed).
- Prefer restricted Stripe keys or least privilege where possible; the webhook secret is only for verifying webhooks.
- Treat **`SUPABASE_SERVICE_ROLE_KEY`** and **`STRIPE_SECRET_KEY`** like production database admin credentials.

## Related docs

- [Stripe billing architecture](stripe-billing.md) — Checkout, webhooks, and why the Supabase Stripe **FDW** is not required.
- [Production authentication (Supabase + Google)](production-auth.md) — Site URL, redirect URLs, and OAuth. Align **Site URL** with `NEXT_PUBLIC_APP_URL`.
