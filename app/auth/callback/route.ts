import { createServerClient } from "@supabase/ssr";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

/**
 * Email confirmation and OAuth return here. Session cookies MUST be set on this
 * response — lib/supabase/server createClient() cannot persist cookies from
 * Route Handlers (set() is no-op), which left users "logged out" after confirm.
 */
export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url);
  const origin = requestUrl.origin;
  const code = requestUrl.searchParams.get("code");

  const next = requestUrl.searchParams.get("next");
  const safeNext =
    next && next.startsWith("/") && !next.startsWith("//") ? next : "/dashboard";

  const redirectSuccess = NextResponse.redirect(`${origin}${safeNext}`);
  const redirectLoginError = NextResponse.redirect(
    `${origin}/auth/login?error=auth_callback`
  );

  if (!code) {
    return redirectLoginError;
  }

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet: { name: string; value: string; options?: Record<string, unknown> }[]) {
          cookiesToSet.forEach(({ name, value, options }) => {
            redirectSuccess.cookies.set(
              name,
              value,
              options as Parameters<typeof redirectSuccess.cookies.set>[2]
            );
          });
        },
      },
    }
  );

  const { error } = await supabase.auth.exchangeCodeForSession(code);

  if (error) {
    console.error("auth callback exchangeCodeForSession:", error.message);
    return redirectLoginError;
  }

  return redirectSuccess;
}
