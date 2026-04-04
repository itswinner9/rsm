"use client";

import { useEffect, useState } from "react";
import { hasPaidPlanAccess } from "@/lib/subscription/access";

export type UserSubscriptionState = {
  loading: boolean;
  isLoggedIn: boolean;
  hasPaidAccess: boolean;
  isTrialing: boolean;
  isActive: boolean;
  subscriptionStatus: string | null;
  trialEndLabel: string | null;
};

const initial: UserSubscriptionState = {
  loading: true,
  isLoggedIn: false,
  hasPaidAccess: false,
  isTrialing: false,
  isActive: false,
  subscriptionStatus: null,
  trialEndLabel: null,
};

/**
 * Loads subscription snapshot from GET /api/user/profile for pricing UI branching.
 */
export function useUserSubscription(): UserSubscriptionState {
  const [state, setState] = useState<UserSubscriptionState>(initial);

  useEffect(() => {
    let cancelled = false;

    (async () => {
      try {
        const res = await fetch("/api/user/profile", { credentials: "same-origin" });
        if (cancelled) return;

        if (res.status === 401) {
          setState({
            loading: false,
            isLoggedIn: false,
            hasPaidAccess: false,
            isTrialing: false,
            isActive: false,
            subscriptionStatus: null,
            trialEndLabel: null,
          });
          return;
        }

        if (!res.ok) {
          setState((s) => ({ ...s, loading: false, isLoggedIn: true }));
          return;
        }

        const data = (await res.json()) as {
          subscription_status?: string | null;
          subscription_trial_end?: string | null;
        };
        const status = typeof data.subscription_status === "string" ? data.subscription_status : null;
        const trialEnd = data.subscription_trial_end;
        const trialEndLabel =
          status === "trialing" && trialEnd
            ? new Date(trialEnd).toLocaleDateString("en-CA", {
                year: "numeric",
                month: "short",
                day: "numeric",
              })
            : null;

        setState({
          loading: false,
          isLoggedIn: true,
          hasPaidAccess: hasPaidPlanAccess(status),
          isTrialing: status === "trialing",
          isActive: status === "active",
          subscriptionStatus: status,
          trialEndLabel,
        });
      } catch {
        if (!cancelled) {
          setState((s) => ({ ...s, loading: false }));
        }
      }
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  return state;
}
