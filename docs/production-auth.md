# Production authentication (Supabase + Google)

Confirmation emails and OAuth redirects that show `http://localhost:3000` are almost always fixed in the **Supabase project** and **Google Cloud Console**, not only in app env vars.

## Supabase — URL configuration

1. Open [Supabase Dashboard](https://supabase.com/dashboard) → your project → **Authentication** → **URL Configuration**.
2. Set **Site URL** to your production origin, for example `https://your-domain.com` (no trailing slash). This value is used in default email templates and link generation.
3. Under **Redirect URLs**, add every URL your app may use after auth:
   - `https://your-domain.com/auth/callback`
   - For Vercel preview deployments: `https://*.vercel.app/auth/callback` (or add each preview URL).

The app sends `emailRedirectTo` / `redirectTo` to `/auth/callback` on the current origin; Supabase only allows redirects that match this list.

## Supabase — email templates

Under **Authentication** → **Email Templates**, ensure confirmation and magic-link templates use the built-in variable for the confirmation link (e.g. `{{ .ConfirmationURL }}` in the default template) and do **not** hardcode `localhost`.

## Google OAuth (Sign in with Google)

1. In [Google Cloud Console](https://console.cloud.google.com/) → **APIs & Services** → **Credentials**, open the OAuth 2.0 Client ID used by Supabase.
2. **Authorized redirect URIs** must include Supabase’s callback (one per project):
   - `https://<project-ref>.supabase.co/auth/v1/callback`
   - Find `<project-ref>` in the Supabase project URL.
3. **Authorized JavaScript origins** (if required by your flow) can include:
   - `https://your-domain.com`
   - `http://localhost:3000` for local development.

Supabase docs describe linking the Google provider under **Authentication** → **Providers** → **Google**.

## Verification

- Sign up on production with a test inbox; the confirmation link should start with `https://your-domain.com/...`.
- Sign in with Google from production; you should land on `/auth/callback` on the same host, then redirect to the app.
