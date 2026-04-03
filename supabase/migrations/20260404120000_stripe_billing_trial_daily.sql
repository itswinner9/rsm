-- Stripe replaces Polar; trial is enforced server-side (1 optimization per UTC day while trialing).
ALTER TABLE user_profiles
  ADD COLUMN IF NOT EXISTS stripe_customer_id TEXT,
  ADD COLUMN IF NOT EXISTS stripe_subscription_id TEXT,
  ADD COLUMN IF NOT EXISTS subscription_trial_end TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS subscription_current_period_end TIMESTAMPTZ;

COMMENT ON COLUMN user_profiles.stripe_customer_id IS 'Stripe Customer id (cus_...)';
COMMENT ON COLUMN user_profiles.stripe_subscription_id IS 'Stripe Subscription id (sub_...)';
COMMENT ON COLUMN user_profiles.subscription_trial_end IS 'When Stripe trial ends (UTC), from subscription.trial_end';

CREATE TABLE IF NOT EXISTS trial_daily_optimizations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  usage_date DATE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE (user_id, usage_date)
);

CREATE INDEX IF NOT EXISTS idx_trial_daily_user_date ON trial_daily_optimizations (user_id, usage_date);

ALTER TABLE trial_daily_optimizations ENABLE ROW LEVEL SECURITY;

COMMENT ON TABLE trial_daily_optimizations IS 'One row per UTC day when a trialing user runs an optimization; enforced by API (service role), not client.';

CREATE POLICY "trial_daily_select_own" ON trial_daily_optimizations
  FOR SELECT TO authenticated USING (user_id = (SELECT auth.uid()));
