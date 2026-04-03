-- Polar billing (replaces Stripe columns)
ALTER TABLE user_profiles
  ADD COLUMN IF NOT EXISTS polar_customer_id TEXT,
  ADD COLUMN IF NOT EXISTS polar_subscription_id TEXT;

ALTER TABLE user_profiles DROP COLUMN IF EXISTS stripe_customer_id;
ALTER TABLE user_profiles DROP COLUMN IF EXISTS stripe_subscription_id;
