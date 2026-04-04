# Resumify (rsm)

Next.js app: ATS-focused resume optimization, Supabase auth/data, Stripe billing.

## Local setup

1. `npm install`
2. Copy `.env.example` to `.env.local` and fill in Supabase, OpenRouter, and Stripe keys. See [docs/environment-variables.md](docs/environment-variables.md) and [docs/stripe-billing.md](docs/stripe-billing.md) (Stripe webhooks + Supabase; no database FDW required).
3. `npm run dev`

Do not commit `.env.local`.
