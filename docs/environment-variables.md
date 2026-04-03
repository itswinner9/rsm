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
| **`STRIPE_PRICE_MONTHLY_CAD`** | Stripe **Price** ID (`price_...`) for the monthly CAD plan (Checkout when `plan` is `month`). |
| **`STRIPE_PRICE_YEARLY_CAD`** | Price ID for the yearly CAD plan when `plan` is `year`. |

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

- [Production authentication (Supabase + Google)](production-auth.md) — Site URL, redirect URLs, and OAuth. Align **Site URL** with `NEXT_PUBLIC_APP_URL`.
