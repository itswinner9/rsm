-- Links browser device fingerprints (FingerprintJS visitorId) to accounts for abuse prevention.
-- Enforced in API routes via service role only.

CREATE TABLE IF NOT EXISTS signup_device_visitors (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  visitor_id TEXT NOT NULL,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (visitor_id, user_id)
);

CREATE INDEX IF NOT EXISTS idx_signup_device_visitor_id ON signup_device_visitors (visitor_id);
CREATE INDEX IF NOT EXISTS idx_signup_device_visitor_created ON signup_device_visitors (visitor_id, created_at);

ALTER TABLE signup_device_visitors ENABLE ROW LEVEL SECURITY;

COMMENT ON TABLE signup_device_visitors IS
  'Device visitor ids from FingerprintJS; written by server only. Used to limit repeat signups / trial abuse.';
