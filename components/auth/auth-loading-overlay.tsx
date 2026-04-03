"use client";

import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

type AuthLoadingMode = "password" | "google" | "signup";

const copy: Record<AuthLoadingMode, { title: string; subtitle: string }> = {
  password: {
    title: "Signing you in",
    subtitle: "Hang tight—this only takes a moment.",
  },
  google: {
    title: "Redirecting to Google",
    subtitle: "Complete sign-in in the window that opens.",
  },
  signup: {
    title: "Creating your account",
    subtitle: "Setting things up—almost there.",
  },
};

export function AuthLoadingOverlay({
  mode,
  className,
}: {
  mode: AuthLoadingMode;
  className?: string;
}) {
  const { title, subtitle } = copy[mode];

  return (
    <div
      className={cn(
        "absolute inset-0 z-10 flex flex-col items-center justify-center rounded-2xl bg-background/85 px-6 backdrop-blur-sm",
        className
      )}
      role="status"
      aria-live="polite"
      aria-busy="true"
    >
      <div className="relative mb-4">
        <span
          className="absolute inset-0 animate-ping rounded-full bg-primary/20"
          style={{ animationDuration: "1.5s" }}
          aria-hidden
        />
        <div className="relative flex size-12 items-center justify-center rounded-full border border-border bg-card shadow-sm">
          <Loader2 className="size-6 animate-spin text-primary" strokeWidth={2} />
        </div>
      </div>
      <p className="text-center text-sm font-semibold text-foreground">{title}</p>
      <p className="mt-1.5 max-w-[240px] text-center text-xs leading-relaxed text-muted-foreground">{subtitle}</p>
    </div>
  );
}
