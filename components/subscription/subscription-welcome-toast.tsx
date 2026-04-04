"use client";

import { useEffect, useRef } from "react";
import Link from "next/link";
import { useUserSubscription } from "@/hooks/use-user-subscription";
import { useToast } from "@/hooks/use-toast";

const SESSION_KEY = "resumify_welcome_tier_toast_v1";

/**
 * One informational toast per browser session for users on the no-card welcome tier
 * (inactive subscription, still eligible per `evaluateFreeOptimizationGate`).
 */
export function SubscriptionWelcomeToast() {
  const { toast } = useToast();
  const subscription = useUserSubscription({ stripeSyncBeforeProfile: true });
  const fired = useRef(false);

  useEffect(() => {
    if (fired.current) return;
    if (!subscription.authReady || !subscription.profileReady) return;
    if (!subscription.isLoggedIn) return;
    if (subscription.loading) return;
    if (subscription.hasPaidAccess) return;
    if (!subscription.isWelcome) return;

    if (typeof sessionStorage === "undefined") return;
    if (sessionStorage.getItem(SESSION_KEY)) return;

    sessionStorage.setItem(SESSION_KEY, "1");
    fired.current = true;

    const days =
      subscription.welcomeDaysLeft > 0
        ? `${subscription.welcomeDaysLeft} day${subscription.welcomeDaysLeft === 1 ? "" : "s"} left in your welcome window`
        : "Welcome window active";

    toast({
      title: "Welcome free tier",
      description: (
        <span className="leading-relaxed">
          {days}: up to <strong>1 optimization per UTC day</strong>, max <strong>3 total</strong> in your first 3 days—no
          card. Need more?{" "}
          <Link href="/pricing" className="font-medium text-primary underline underline-offset-2">
            View plans
          </Link>
        </span>
      ),
    });
  }, [
    subscription.authReady,
    subscription.profileReady,
    subscription.isLoggedIn,
    subscription.loading,
    subscription.hasPaidAccess,
    subscription.isWelcome,
    subscription.welcomeDaysLeft,
    toast,
  ]);

  return null;
}
