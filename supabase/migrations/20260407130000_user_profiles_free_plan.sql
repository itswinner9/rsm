-- Free plan: 1 optimization per UTC day, max 3 total, within a 3-day window from first free use.
-- Server updates only via service role (optimize-resume).
ALTER TABLE user_profiles
  ADD COLUMN IF NOT EXISTS plan_type TEXT NOT NULL DEFAULT 'free',
  ADD COLUMN IF NOT EXISTS free_trial_started_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS free_trial_ends_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS last_free_use_date DATE,
  ADD COLUMN IF NOT EXISTS total_free_uses INTEGER NOT NULL DEFAULT 0;

COMMENT ON COLUMN user_profiles.plan_type IS 'free | pro — pro set when Stripe subscription active/trialing.';
COMMENT ON COLUMN user_profiles.free_trial_started_at IS 'First free optimization; starts 3-day window.';
COMMENT ON COLUMN user_profiles.free_trial_ends_at IS 'End of free window (UTC).';
COMMENT ON COLUMN user_profiles.last_free_use_date IS 'UTC date of last free optimization.';
COMMENT ON COLUMN user_profiles.total_free_uses IS 'Free optimizations used (max 3).';
