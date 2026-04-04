"use client";

import { useState } from "react";
import Link from "next/link";
import { Eye, EyeOff, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { createClient } from "@/lib/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { AuthPageShell } from "@/components/layout/auth-page-shell";
import { GoogleOAuthButton } from "@/components/auth/google-oauth-button";
import { AuthEmailDivider } from "@/components/auth/auth-email-divider";
import { authInputClass } from "@/components/auth/auth-input-class";
import { SITE_NAME } from "@/lib/site-nav";
import { getAuthCallbackUrl } from "@/lib/auth-redirect";
import { AuthLoadingOverlay } from "@/components/auth/auth-loading-overlay";
import { ResendConfirmationEmailButton } from "@/components/auth/verify-email-panel";
import { getVisitorId } from "@/lib/fingerprint/getVisitorId";
import { FP_OAUTH_PENDING_KEY, fpRegisteredStorageKey } from "@/lib/auth/fingerprint-storage";

export default function SignupPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const { toast } = useToast();
  const supabase = createClient();

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const visitorId = await getVisitorId();
      if (visitorId) {
        const guard = await fetch("/api/auth/check-signup-device", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "same-origin",
          body: JSON.stringify({ visitorId }),
        });
        if (!guard.ok) {
          const j = (await guard.json().catch(() => ({}))) as { message?: string; error?: string };
          toast({
            title: "Signup not allowed from this device",
            description:
              j.message ||
              "Use your existing account, or contact support if you need a new workspace.",
            variant: "destructive",
          });
          setIsLoading(false);
          return;
        }
      }

      const check = await fetch("/api/auth/validate-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim() }),
      });
      if (!check.ok) {
        const j = await check.json().catch(() => ({}));
        toast({
          title: "Email not allowed",
          description:
            j.error === "disposable_not_allowed"
              ? "Disposable or temporary email addresses cannot be used. Please use a permanent work or personal email."
              : "Please enter a valid email address.",
          variant: "destructive",
        });
        setIsLoading(false);
        return;
      }

      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: getAuthCallbackUrl(),
        },
      });

      if (error) {
        toast({
          title: "Signup failed",
          description: error.message,
          variant: "destructive",
        });
        return;
      }

      if (data.session?.user && visitorId) {
        await fetch("/api/auth/register-device", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "same-origin",
          body: JSON.stringify({ visitorId }),
        });
        try {
          localStorage.setItem(fpRegisteredStorageKey(data.session.user.id), "1");
        } catch {
          /* private mode */
        }
      }

      if (data.session) {
        window.location.assign("/builder");
        return;
      }

      if (data.user) {
        const identities = data.user.identities ?? [];
        if (identities.length === 0) {
          toast({
            title: "Account may already exist",
            description: "Try signing in, or use a different email.",
            variant: "destructive",
          });
          return;
        }
        setSuccess(true);
        return;
      }

      toast({
        title: "Could not complete signup",
        description: "No account was created. Check Supabase Auth settings or try again.",
        variant: "destructive",
      });
    } catch {
      toast({
        title: "An error occurred",
        description: "Please try again later.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSignup = async () => {
    setIsGoogleLoading(true);
    try {
      const visitorId = await getVisitorId();
      if (visitorId) {
        const guard = await fetch("/api/auth/check-signup-device", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "same-origin",
          body: JSON.stringify({ visitorId }),
        });
        if (!guard.ok) {
          const j = (await guard.json().catch(() => ({}))) as { message?: string };
          toast({
            title: "Signup not allowed from this device",
            description:
              j.message ||
              "Use your existing account, or contact support if you need a new workspace.",
            variant: "destructive",
          });
          setIsGoogleLoading(false);
          return;
        }
        sessionStorage.setItem(FP_OAUTH_PENDING_KEY, visitorId);
      }

      const { error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: getAuthCallbackUrl(),
        },
      });
      if (error) {
        toast({
          title: "Google signup failed",
          description: error.message,
          variant: "destructive",
        });
        setIsGoogleLoading(false);
      }
    } catch {
      toast({
        title: "An error occurred",
        description: "Please try again later.",
        variant: "destructive",
      });
      setIsGoogleLoading(false);
    }
  };

  if (success) {
    const steps = [
      "Open the email from Resumify (check spam if needed).",
      "Click the confirmation link to verify your address.",
      "Return here and sign in to open the builder.",
    ];

    return (
      <AuthPageShell>
        <div className="mx-auto w-full max-w-[400px] text-center">
          <div className="rounded-2xl border border-border bg-card p-8 shadow-sm sm:p-10">
            <div
              className="mx-auto mb-6 flex size-14 items-center justify-center rounded-full bg-primary/10 text-primary"
              aria-hidden
            >
              <CheckCircle className="size-7" strokeWidth={1.75} />
            </div>
            <h2 className="text-balance text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
              Check your inbox
            </h2>
            <p className="mx-auto mt-3 max-w-sm text-pretty text-sm leading-relaxed text-muted-foreground">
              We sent a confirmation link to{" "}
              <span className="font-medium text-foreground">{email}</span>. Follow the steps below, then sign in.
            </p>

            <ol className="mx-auto mt-6 max-w-sm space-y-3 text-left">
              {steps.map((line, i) => (
                <li key={i} className="flex gap-3 text-sm leading-relaxed text-muted-foreground">
                  <span className="flex size-6 shrink-0 items-center justify-center rounded-full bg-muted text-xs font-semibold text-foreground">
                    {i + 1}
                  </span>
                  <span className="pt-0.5">{line}</span>
                </li>
              ))}
            </ol>

            <div className="mt-6 flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
              <ResendConfirmationEmailButton email={email} label="Resend confirmation email" />
            </div>

            <p className="mx-auto mt-5 max-w-sm text-left text-xs leading-relaxed text-muted-foreground">
              No email? Check spam. For production, configure SMTP in Supabase (Authentication → Emails) so messages
              deliver reliably.
            </p>

            <Button asChild variant="outline" className="mt-8 h-11 rounded-full border-border px-8 font-medium">
              <Link href="/auth/login">Back to sign in</Link>
            </Button>
          </div>
        </div>
      </AuthPageShell>
    );
  }

  return (
    <AuthPageShell>
      <div className="mx-auto w-full max-w-[400px]">
        <header className="mb-8 text-center">
          <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">Get started</p>
          <h1 className="mt-2 text-balance text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
            Create your account
          </h1>
          <p className="mx-auto mt-3 max-w-sm text-pretty text-sm leading-relaxed text-muted-foreground">
            Tailor your resume to each role—match score, layouts, and exports on {SITE_NAME}.
          </p>
          <Link
            href="/pricing"
            className="mt-4 inline-block text-xs font-medium text-primary underline-offset-4 hover:underline"
          >
            View plans
          </Link>
        </header>

        <div
          className="relative min-h-[380px] rounded-2xl border border-border bg-card p-7 shadow-sm sm:min-h-[400px] sm:p-8"
          aria-busy={isLoading || isGoogleLoading}
        >
          {isLoading || isGoogleLoading ? (
            <AuthLoadingOverlay mode={isGoogleLoading ? "google" : "signup"} />
          ) : null}

          <GoogleOAuthButton loading={isGoogleLoading} onClick={handleGoogleSignup} />
          <AuthEmailDivider label="Or with email" />

          <form onSubmit={handleSignup} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email" className="text-sm font-medium text-foreground">
                Email
              </Label>
              <Input
                id="email"
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoComplete="email"
                className={authInputClass}
                disabled={isLoading || isGoogleLoading}
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
                  placeholder="At least 8 characters"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  minLength={8}
                  autoComplete="new-password"
                  className={`${authInputClass} pr-11`}
                  disabled={isLoading || isGoogleLoading}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 rounded-md p-1 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                  disabled={isLoading || isGoogleLoading}
                >
                  {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                </button>
              </div>
            </div>

            <Button
              type="submit"
              disabled={isLoading || isGoogleLoading}
              className="mt-2 h-11 w-full rounded-full text-[15px] font-medium"
            >
              Create account
            </Button>
          </form>

          <p className="mt-5 text-center text-[11px] leading-relaxed text-muted-foreground">
            By continuing, you agree to our terms and privacy policy. A lightweight device signal helps us prevent
            abuse; paid plans and trials stay tied to your account.
          </p>
        </div>

        <p className="mt-8 text-center text-sm text-muted-foreground">
          Already have an account?{" "}
          <Link
            href="/auth/login"
            className="font-medium text-foreground underline-offset-4 transition-colors hover:underline"
          >
            Sign in
          </Link>
        </p>
      </div>
    </AuthPageShell>
  );
}
