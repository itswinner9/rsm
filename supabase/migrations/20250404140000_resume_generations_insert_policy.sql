-- Ensure authenticated users can INSERT a new row per optimization.
-- If only SELECT/UPDATE policies exist (or INSERT was never allowed), inserts fail silently in the app.
DROP POLICY IF EXISTS "Users can insert own generations" ON public.resume_generations;
CREATE POLICY "Users can insert own generations"
  ON public.resume_generations
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);
