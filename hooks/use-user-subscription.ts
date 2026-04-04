"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { hasPaidPlanAccess } from "@/lib/subscription/access";

export type UserSubscriptionState = {
  /** Session check finished (Supabase getSession). */
  authReady: boolean;
  /** Profile fetch finished when logged in; true immediately when guest. */
  profileReady: boolean;
  /** True while auth not ready, or logged in and profile not ready. */
  loading: boolean;
  isLoggedIn: boolean;
  hasPaidAccess: boolean;
  isTrialing: boolean;
  isActive: boolean;
  subscriptionStatus: string | null;
  trialEndLabel: string | null;
};

const loggedOut: Omit<UserSubscriptionState, "authReady" | "profileReady" | "loading"> = {
  isLoggedIn: false,
  hasPaidAccess: false,
  isTrialing: false,
  isActive: false,
  subscriptionStatus: null,
  trialEndLabel: null,
};

const initial: UserSubscriptionState = {
  authReady: false,
  profileReady: false,
  loading: true,
  ...loggedOut,
};

/**
 * Loads auth from the Supabase client first, then subscription snapshot from GET /api/user/profile.
 * Avoids treating logged-in users as guests while the profile request is in flight.
 */
export function useUserSubscription(): UserSubscriptionState {
  const [state, setState] = useState<UserSubscriptionState>(initial);

  useEffect(() => {
    let cancelled = false;
    const supabase = createClient();

    (async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (cancelled) return;

      if (!session?.user) {
        setState({
          authReady: true,
          profileReady: true,
          loading: false,
          ...loggedOut,
        });
        return;
      }

      setState((s) => ({
        ...s,
        authReady: true,
        profileReady: false,
        loading: true,
        isLoggedIn: true,
      }));

      try {
        const res = await fetch("/api/user/profile", { credentials: "same-origin" });
        if (cancelled) return;

        if (res.status === 401) {
          setState({
            authReady: true,
            profileReady: true,
            loading: false,
            ...loggedOut,
          });
          return;
        }

        let subscription_status: string | null = null;
        let subscription_trial_end: string | null = null;

        if (res.ok) {
          const data = (await res.json()) as {
            subscription_status?: string | null;
            subscription_trial_end?: string | null;
          };
          subscription_status =
            typeof data.subscription_status === "string" ? data.subscription_status : null;
          subscription_trial_end =
            typeof data.subscription_trial_end === "string" ? data.subscription_trial_end : null;
        }

        const status = subscription_status;
        const trialEnd = subscription_trial_end;
        const trialEndLabel =
          status === "trialing" && trialEnd
            ? new Date(trialEnd).toLocaleDateString("en-CA", {
                year: "numeric",
                month: "short",
                day: "numeric",
              })
            : null;

        setState({
          authReady: true,
          profileReady: true,
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
          setState({
            authReady: true,
            profileReady: true,
            loading: false,
            isLoggedIn: true,
            hasPaidAccess: false,
            isTrialing: false,
            isActive: false,
            subscriptionStatus: null,
            trialEndLabel: null,
          });
        }
      }
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  return state;
}
