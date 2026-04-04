-- Welcome tier: one optimization per UTC day for inactive users in their first 3 days (no card).
CREATE TABLE IF NOT EXISTS welcome_daily_optimizations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  usage_date DATE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE (user_id, usage_date)
);

CREATE INDEX IF NOT EXISTS idx_welcome_daily_user_date ON welcome_daily_optimizations (user_id, usage_date);

ALTER TABLE welcome_daily_optimizations ENABLE ROW LEVEL SECURITY;

COMMENT ON TABLE welcome_daily_optimizations IS 'One row per UTC day when a welcome-tier user runs an optimization; enforced by API (service role), not client.';

CREATE POLICY "welcome_daily_select_own" ON welcome_daily_optimizations
  FOR SELECT TO authenticated USING (user_id = (SELECT auth.uid()));
