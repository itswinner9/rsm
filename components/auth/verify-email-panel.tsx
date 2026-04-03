"use client";

import { useState } from "react";
import { Loader2, Mail } from "lucide-react";
import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { getAuthCallbackUrl } from "@/lib/auth-redirect";
import { cn } from "@/lib/utils";

export function ResendConfirmationEmailButton({
  email,
  className,
  label = "Resend confirmation email",
}: {
  email: string;
  className?: string;
  label?: string;
}) {
  const [resending, setResending] = useState(false);
  const supabase = createClient();
  const { toast } = useToast();

  const handleResend = async () => {
    const trimmed = email.trim();
    if (!trimmed) {
      toast({ title: "Add your email", description: "Enter the address you signed up with.", variant: "destructive" });
      return;
    }
    setResending(true);
    const { error } = await supabase.auth.resend({
      type: "signup",
      email: trimmed,
      options: { emailRedirectTo: getAuthCallbackUrl() },
    });
    setResending(false);
    if (error) {
      const msg = error.message.toLowerCase();
      const rateLimited = msg.includes("rate") || msg.includes("too many") || msg.includes("after");
      toast({
        title: rateLimited ? "Please wait" : "Could not resend",
        description: rateLimited
          ? "Wait a minute before requesting another email."
          : error.message,
        variant: "destructive",
      });
      return;
    }
    toast({
      title: "Check your inbox",
      description: "We sent another confirmation link.",
    });
  };

  return (
    <Button
      type="button"
      variant="outline"
      size="sm"
      className={cn("rounded-full border-border font-medium", className)}
      onClick={() => void handleResend()}
      disabled={resending}
    >
      {resending ? <Loader2 className="mr-2 size-4 animate-spin" /> : null}
      {label}
    </Button>
  );
}

export function VerifyEmailPanel({ email }: { email: string }) {
  return (
    <div className="mb-6 rounded-xl border border-primary/20 bg-primary/[0.04] p-4 text-left dark:bg-primary/[0.06]">
      <div className="flex gap-3">
        <div
          className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary"
          aria-hidden
        >
          <Mail className="size-5" strokeWidth={1.5} />
        </div>
        <div className="min-w-0 flex-1 space-y-2">
          <h3 className="text-sm font-semibold text-foreground">Verify your email</h3>
          <p className="text-sm leading-relaxed text-muted-foreground">
            We need to confirm <span className="font-medium text-foreground">{email || "your address"}</span> before you
            can sign in. Open the link in the email we sent you, then try again.
          </p>
          <ResendConfirmationEmailButton email={email} className="mt-1 w-full sm:w-auto" />
        </div>
      </div>
    </div>
  );
}
