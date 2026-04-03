-- Fix new-user profile insert (trigger context has no JWT; RLS INSERT policy requires auth.uid()).
-- Also remove the permissive "Service role..." policy that allowed any client matching policies to see all rows.
-- Stripe webhooks use the service_role key, which bypasses RLS — no replacement policy needed.

DROP POLICY IF EXISTS "Service role can update profiles" ON public.user_profiles;

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
