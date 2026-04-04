-- Users profile table
CREATE TABLE user_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
  trial_used BOOLEAN DEFAULT false,
  subscription_status TEXT DEFAULT 'inactive',
  polar_customer_id TEXT,
  polar_subscription_id TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Resume uploads
CREATE TABLE resume_uploads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  file_name TEXT NOT NULL,
  file_url TEXT,
  parsed_text TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Resume generations
CREATE TABLE resume_generations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  upload_id UUID REFERENCES resume_uploads(id),
  job_description TEXT NOT NULL,
  job_title TEXT,
  company_name TEXT,
  ats_score_original INTEGER,
  ats_score_optimized INTEGER,
  generated_resumes JSONB,
  optimized_resume_data JSONB,
  selected_template TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS Policies
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE resume_uploads ENABLE ROW LEVEL SECURITY;
ALTER TABLE resume_generations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own profile" ON user_profiles FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can update own profile" ON user_profiles FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own profile" ON user_profiles FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view own uploads" ON resume_uploads FOR ALL USING (auth.uid() = user_id);

-- resume_generations: explicit policies (see migrations/20250406120000_resume_generations_rls_explicit.sql)
CREATE POLICY "resume_generations_select_own" ON resume_generations FOR SELECT TO authenticated USING ((SELECT auth.uid()) = user_id);
CREATE POLICY "resume_generations_insert_own" ON resume_generations FOR INSERT TO authenticated WITH CHECK ((SELECT auth.uid()) = user_id);
CREATE POLICY "resume_generations_update_own" ON resume_generations FOR UPDATE TO authenticated USING ((SELECT auth.uid()) = user_id) WITH CHECK ((SELECT auth.uid()) = user_id);
CREATE POLICY "resume_generations_delete_own" ON resume_generations FOR DELETE TO authenticated USING ((SELECT auth.uid()) = user_id);
GRANT SELECT, INSERT, UPDATE, DELETE ON resume_generations TO authenticated;

-- Welcome tier daily usage (see migrations/20260406120000_welcome_daily_optimizations.sql)
-- welcome_daily_optimizations (user_id, usage_date) — legacy; free plan now uses user_profiles columns below.

-- Free plan (see migrations/20260407130000_user_profiles_free_plan.sql): plan_type, free_trial_started_at,
-- free_trial_ends_at, last_free_use_date, total_free_uses — server-updated in optimize-resume only.

-- Polar webhooks use SUPABASE_SERVICE_ROLE_KEY in app code; service role bypasses RLS.
-- Do NOT add FOR ALL USING (true) — that would let authenticated users match a policy and read every profile.

-- Function to create profile on signup (must bypass RLS: runs as postgres, no JWT in trigger context)
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.user_profiles (user_id)
  VALUES (NEW.id)
  ON CONFLICT (user_id) DO NOTHING;
  RETURN NEW;
END;
$$;

ALTER FUNCTION public.handle_new_user() OWNER TO postgres;

GRANT EXECUTE ON FUNCTION public.handle_new_user() TO postgres;
GRANT EXECUTE ON FUNCTION public.handle_new_user() TO supabase_auth_admin;
GRANT EXECUTE ON FUNCTION public.handle_new_user() TO service_role;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
