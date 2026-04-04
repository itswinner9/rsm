"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Eye, EyeOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { createClient } from "@/lib/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { AuthPageShell } from "@/components/layout/auth-page-shell";
import { GoogleOAuthButton } from "@/components/auth/google-oauth-button";
import { AuthEmailDivider } from "@/components/auth/auth-email-divider";
import { authInputClass } from "@/components/auth/auth-input-class";
import { AuthLoadingOverlay } from "@/components/auth/auth-loading-overlay";
import { VerifyEmailPanel } from "@/components/auth/verify-email-panel";
import { SITE_NAME } from "@/lib/site-nav";
import { getAuthCallbackUrl } from "@/lib/auth-redirect";
import { getPostLoginDestination } from "@/lib/auth/post-login-destination";

function readSearchParams() {
  if (typeof window === "undefined") {
    return { redirect: "/dashboard", authError: null as string | null };
  }
  const params = new URLSearchParams(window.location.search);
  const redirect = getPostLoginDestination(params);
  return { redirect, authError: params.get("error") };
}

function isEmailNotConfirmedError(error: { code?: string; message?: string } | null): boolean {
  if (!error) return false;
  if (error.code === "email_not_confirmed" || error.code === "provider_email_needs_verification") {
    return true;
  }
  const m = (error.message ?? "").toLowerCase();
  return m.includes("email not confirmed") || m.includes("not confirmed");
}

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [showVerifyPanel, setShowVerifyPanel] = useState(false);
  const { toast } = useToast();
  const router = useRouter();
  const supabase = createClient();

  useEffect(() => {
    const { authError } = readSearchParams();

    if (authError === "auth_callback") {
      toast({
        title: "Could not sign you in",
        description:
          "The confirmation link may have expired. Try email and password, or sign up again.",
        variant: "destructive",
      });
      const url = new URL(window.location.href);
      url.searchParams.delete("error");
      window.history.replaceState({}, "", url.pathname + url.search);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps -- run once on mount
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setShowVerifyPanel(false);
    try {
      const signInPromise = supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      });
      const timeoutPromise = new Promise<never>((_, reject) =>
        setTimeout(() => reject(new Error("Request timed out. Check your network.")), 25000)
      );
      const { data, error } = await Promise.race([signInPromise, timeoutPromise]);

      if (error) {
        if (isEmailNotConfirmedError(error)) {
          setShowVerifyPanel(true);
          return;
        }
        toast({ title: "Login failed", description: error.message, variant: "destructive" });
        return;
      }
      if (data.session) {
        const dest = getPostLoginDestination(new URLSearchParams(window.location.search));
        const sid = (() => {
          try {
            return new URL(dest, window.location.origin).searchParams.get("session_id");
          } catch {
            return null;
          }
        })();
        if (sid?.startsWith("cs_")) {
          await fetch("/api/stripe/sync", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ session_id: sid }),
            credentials: "same-origin",
          });
        }
        router.refresh();
        window.location.assign(dest);
        return;
      }
      toast({
        title: "No session",
        description: "Confirm your email or try again.",
        variant: "destructive",
      });
    } catch (err) {
      const message = err instanceof Error ? err.message : "Please try again later.";
      toast({ title: "Sign-in problem", description: message, variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setIsGoogleLoading(true);
    try {
      const params = new URLSearchParams(window.location.search);
      const next = getPostLoginDestination(params);
      const callback = new URL(getAuthCallbackUrl());
      callback.searchParams.set("next", next);

      const { error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: { redirectTo: callback.toString() },
      });
      if (error) {
        toast({ title: "Google login failed", description: error.message, variant: "destructive" });
        setIsGoogleLoading(false);
      }
    } catch {
      toast({ title: "An error occurred", description: "Please try again later.", variant: "destructive" });
      setIsGoogleLoading(false);
    }
  };

  const busy = isLoading || isGoogleLoading;

  return (
    <AuthPageShell>
      <div className="mx-auto w-full max-w-[400px]">
        <header className="mb-8 text-center">
          <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">Sign in</p>
          <h1 className="mt-2 text-balance text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
            Welcome back
          </h1>
          <p className="mx-auto mt-3 max-w-sm text-pretty text-sm leading-relaxed text-muted-foreground">
            Continue to your resumes and job matches on {SITE_NAME}.
          </p>
        </header>

        <div
          className="relative min-h-[320px] rounded-2xl border border-border bg-card p-7 shadow-sm sm:min-h-[340px] sm:p-8"
          aria-busy={busy}
        >
          {busy ? (
            <AuthLoadingOverlay mode={isGoogleLoading ? "google" : "password"} />
          ) : null}

          {showVerifyPanel ? <VerifyEmailPanel email={email} /> : null}

          <GoogleOAuthButton loading={isGoogleLoading} onClick={handleGoogleLogin} />
          <AuthEmailDivider label="Or with email" />

          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email" className="text-sm font-medium text-foreground">
                Email
              </Label>
              <Input
                id="email"
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  setShowVerifyPanel(false);
                }}
                required
                autoComplete="email"
                className={authInputClass}
                disabled={busy}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password" className="text-sm font-medium text-foreground">
                Password
              </Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  autoComplete="current-password"
                  className={`${authInputClass} pr-11`}
                  disabled={busy}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 rounded-md p-1 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                  disabled={busy}
                >
                  {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                </button>
              </div>
            </div>
            <Button type="submit" disabled={busy} className="mt-2 h-11 w-full rounded-full text-[15px] font-medium">
              Sign in
            </Button>
          </form>
        </div>

        <p className="mt-8 text-center text-sm text-muted-foreground">
          New here?{" "}
          <Link
            href="/auth/signup"
            className="font-medium text-foreground underline-offset-4 transition-colors hover:underline"
          >
            Create an account
          </Link>
        </p>
      </div>
    </AuthPageShell>
  );
}
