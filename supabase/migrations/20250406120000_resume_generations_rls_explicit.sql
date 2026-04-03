-- Replace FOR ALL + INSERT with explicit per-command policies so INSERT reliably passes.
-- Also grant table privileges to authenticated (safe defaults in hosted Supabase, explicit for self-hosted).

ALTER TABLE public.resume_generations ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own generations" ON public.resume_generations;
DROP POLICY IF EXISTS "Users can insert own generations" ON public.resume_generations;
DROP POLICY IF EXISTS "resume_generations_select_own" ON public.resume_generations;
DROP POLICY IF EXISTS "resume_generations_insert_own" ON public.resume_generations;
DROP POLICY IF EXISTS "resume_generations_update_own" ON public.resume_generations;
DROP POLICY IF EXISTS "resume_generations_delete_own" ON public.resume_generations;

CREATE POLICY "resume_generations_select_own"
  ON public.resume_generations
  FOR SELECT
  TO authenticated
  USING ((SELECT auth.uid()) = user_id);

CREATE POLICY "resume_generations_insert_own"
  ON public.resume_generations
  FOR INSERT
  TO authenticated
  WITH CHECK ((SELECT auth.uid()) = user_id);

CREATE POLICY "resume_generations_update_own"
  ON public.resume_generations
  FOR UPDATE
  TO authenticated
  USING ((SELECT auth.uid()) = user_id)
  WITH CHECK ((SELECT auth.uid()) = user_id);

CREATE POLICY "resume_generations_delete_own"
  ON public.resume_generations
  FOR DELETE
  TO authenticated
  USING ((SELECT auth.uid()) = user_id);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.resume_generations TO authenticated;
GRANT ALL ON public.resume_generations TO service_role;
