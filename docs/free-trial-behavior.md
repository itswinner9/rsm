# Free trial behavior (product reference)

This document describes the **two separate concepts** enforced in code. Rules are applied server-side in `POST /api/optimize-resume` before any AI runs.

## A — No-card welcome window (`subscription_status` not active/trialing)

Persisted on `user_profiles` (`free_trial_*`, `last_free_use_date`, `total_free_uses`). Logic: `lib/subscription/freePlan.ts` → `evaluateFreeOptimizationGate`.

| Rule | Behavior |
|------|----------|
| First free run | Server sets the welcome window (start + end timestamps), increments usage. |
| 1 per UTC day | Same calendar day (UTC) → `free_daily_limit`. |
| Max 3 runs | `total_free_uses >= 3` → `free_cap_exceeded`. |
| Window ended | Now after `free_trial_ends_at` → `free_trial_ended`. |

## B — Stripe trial (`subscription_status === "trialing"`)

Card on file; 3-day trial from Stripe Checkout (`app/api/stripe/checkout/route.ts`).

| Rule | Behavior |
|------|----------|
| While trialing | 1 optimization per UTC day via `trial_daily_optimizations` → `trial_daily_limit` if duplicate day. |
| After trial window | Subscription billing per Stripe; **`active`** = unlimited optimizations (no daily cap). |

## Active paid (`subscription_status === "active"`)

Unlimited optimizations (subject to API limits).

---

Unlimited access after checkout requires a successful subscription sync (webhook or `/api/stripe/sync` with checkout `session_id`). See `docs/stripe-billing.md` and `docs/environment-variables.md`.
