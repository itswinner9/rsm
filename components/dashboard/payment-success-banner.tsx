"use client";

import { useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { BadgeCheck, Crown, Loader2, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";

export type PaymentSuccessVariant = "none" | "success-trial" | "success-active" | "pending";

export function PaymentSuccessBanner({
  variant,
  className,
}: {
  variant: PaymentSuccessVariant;
  className?: string;
}) {
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    if (variant === "none") return;

    const sessionId = searchParams.get("session_id");
    const clearUrl = () => router.replace("/dashboard", { scroll: false });

    if (variant === "pending") {
      let cancelled = false;
      void (async () => {
        for (let i = 0; i < 6; i++) {
          if (cancelled) return;
          await fetch("/api/stripe/sync", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(sessionId ? { session_id: sessionId } : {}),
            credentials: "same-origin",
          });
          router.refresh();
          await new Promise((r) => setTimeout(r, 450));
        }
      })();
      const t = window.setTimeout(clearUrl, 7000);
      return () => {
        cancelled = true;
        window.clearTimeout(t);
      };
    }

    const t = window.setTimeout(clearUrl, 4800);
    return () => window.clearTimeout(t);
  }, [variant, router, searchParams]);

  if (variant === "none") return null;

  if (variant === "pending") {
    return (
      <div
        className={cn(
          "relative overflow-hidden rounded-2xl border border-amber-500/25 bg-gradient-to-br from-amber-500/[0.07] via-card to-background p-4 sm:p-5 shadow-sm",
          className
        )}
      >
        <div className="flex gap-3 sm:gap-4">
          <div className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-amber-500/15 text-amber-700 dark:text-amber-400">
            <Loader2 className="size-5 animate-spin" strokeWidth={1.75} />
          </div>
          <div className="min-w-0 flex-1 space-y-1">
            <p className="text-sm font-semibold tracking-tight text-foreground">Confirming your purchase</p>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Syncing your subscription with your account. This usually takes a second — the sidebar updates
              automatically.
            </p>
          </div>
        </div>
      </div>
    );
  }

  const isTrial = variant === "success-trial";

  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-2xl border border-emerald-500/20 bg-gradient-to-br from-emerald-500/[0.09] via-violet-500/[0.04] to-background p-1 shadow-md shadow-emerald-500/[0.08]",
        className
      )}
    >
      <div className="rounded-[0.9rem] bg-card/80 backdrop-blur-sm px-4 py-4 sm:px-5 sm:py-5">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:gap-4">
          <div
            className={cn(
              "flex size-12 shrink-0 items-center justify-center rounded-2xl border shadow-sm",
              isTrial
                ? "border-primary/20 bg-primary/10 text-primary"
                : "border-emerald-500/25 bg-emerald-500/10 text-emerald-700 dark:text-emerald-400"
            )}
          >
            {isTrial ? (
              <Sparkles className="size-6" strokeWidth={1.5} />
            ) : (
              <Crown className="size-6" strokeWidth={1.5} />
            )}
          </div>
          <div className="min-w-0 flex-1 space-y-1.5">
            <div className="flex flex-wrap items-center gap-2">
              <p className="text-base font-semibold tracking-tight text-foreground">
                {isTrial ? "Trial started — you're in" : "Pro is active"}
              </p>
              <span className="inline-flex items-center gap-1 rounded-full border border-emerald-500/25 bg-emerald-500/10 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-emerald-800 dark:text-emerald-300">
                <BadgeCheck className="size-3" strokeWidth={2} />
                Purchased
              </span>
            </div>
            <p className="text-sm text-muted-foreground leading-relaxed">
              {isTrial
                ? "Your subscription is linked. During trial you get one optimization per UTC day; after that, unlimited runs while your plan stays active."
                : "Your subscription is linked — unlimited resume optimizations are available from the builder."}
            </p>
            <p className="text-[11px] text-muted-foreground/90 pt-0.5">
              Check the sidebar or Account for billing anytime.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
