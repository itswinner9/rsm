"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { hasPaidPlanAccess } from "@/lib/subscription/access";
import type { FreePlanRow } from "@/lib/subscription/freePlan";
import { evaluateFreeOptimizationGate, freeWindowDaysLeft, hasFreePlanAccessPreview } from "@/lib/subscription/freePlan";

export type UserSubscriptionState = {
  /** Session check finished (Supabase getSession). */
  authReady: boolean;
  /** Profile fetch finished when logged in; true immediately when guest. */
  profileReady: boolean;
  /** True while auth not ready, or logged in and profile not ready. */
  loading: boolean;
  isLoggedIn: boolean;
  /** Stripe trial or paid. */
  hasPaidAccess: boolean;
  /** Can run optimize (paid, trial, or free plan). */
  hasOptimizationAccess: boolean;
  /**
   * When not trialing/active and free gate blocks: daily limit, 3-run cap, or welcome window ended.
   * Null if paid/trialing/active, or free gate allows a run.
   */
  freePlanBlockedCode: "free_trial_ended" | "free_daily_limit" | "free_cap_exceeded" | null;
  isWelcome: boolean;
  welcomeDaysLeft: number;
  isTrialing: boolean;
  isActive: boolean;
  subscriptionStatus: string | null;
  trialEndLabel: string | null;
};

export type UseUserSubscriptionOptions = {
  /**
   * POST /api/stripe/sync before GET /api/user/profile so DB matches Stripe after checkout.
   * Use on app surfaces (e.g. builder); keep false on marketing pricing.
   */
  stripeSyncBeforeProfile?: boolean;
};

export type UserSubscriptionResult = UserSubscriptionState & {
  /** Re-run Stripe sync (if enabled) and profile fetch; e.g. after first optimization. */
  refetch: () => Promise<void>;
};

const loggedOut: Omit<UserSubscriptionState, "authReady" | "profileReady" | "loading"> = {
  isLoggedIn: false,
  hasPaidAccess: false,
  hasOptimizationAccess: false,
  freePlanBlockedCode: null,
  isWelcome: false,
  welcomeDaysLeft: 0,
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

function buildStateFromProfile(data: {
  subscription_status?: string | null;
  subscription_trial_end?: string | null;
  free_trial_started_at?: string | null;
  free_trial_ends_at?: string | null;
  last_free_use_date?: string | null;
  total_free_uses?: number | null;
}): Omit<UserSubscriptionState, "authReady" | "profileReady" | "loading" | "isLoggedIn"> {
  const subscription_status =
    typeof data.subscription_status === "string" ? data.subscription_status : null;
  const trialEnd =
    typeof data.subscription_trial_end === "string" ? data.subscription_trial_end : null;
  const trialEndLabel =
    subscription_status === "trialing" && trialEnd
      ? new Date(trialEnd).toLocaleDateString("en-CA", {
          year: "numeric",
          month: "short",
          day: "numeric",
        })
      : null;

  const freeRow: FreePlanRow = {
    free_trial_started_at: data.free_trial_started_at ?? null,
    free_trial_ends_at: data.free_trial_ends_at ?? null,
    last_free_use_date: data.last_free_use_date ?? null,
    total_free_uses: data.total_free_uses ?? null,
  };

  const hasPaid = hasPaidPlanAccess(subscription_status);
  const freeGate = hasPaid ? { ok: true as const } : evaluateFreeOptimizationGate(freeRow);
  const isWelcome = hasFreePlanAccessPreview(subscription_status, freeRow);
  const wDays = freeWindowDaysLeft(freeRow);

  const freePlanBlockedCode =
    hasPaid || freeGate.ok
      ? null
      : freeGate.code;

  return {
    hasPaidAccess: hasPaid,
    hasOptimizationAccess: hasPaid || freeGate.ok,
    freePlanBlockedCode,
    isWelcome,
    welcomeDaysLeft: isWelcome ? wDays : 0,
    isTrialing: subscription_status === "trialing",
    isActive: subscription_status === "active",
    subscriptionStatus: subscription_status,
    trialEndLabel,
  };
}

/**
 * Loads auth from the Supabase client first, then subscription snapshot from GET /api/user/profile.
 * Avoids treating logged-in users as guests while the profile request is in flight.
 */
export function useUserSubscription(options?: UseUserSubscriptionOptions): UserSubscriptionResult {
  const stripeSyncFirst = options?.stripeSyncBeforeProfile === true;
  const [state, setState] = useState<UserSubscriptionState>(initial);
  const cancelledRef = useRef(false);

  const loadProfile = useCallback(
    async (opts: { sessionKnown: boolean }) => {
      const supabase = createClient();
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (cancelledRef.current) return;

      if (!session?.user) {
        setState({
          authReady: true,
          profileReady: true,
          loading: false,
          ...loggedOut,
        });
        return;
      }

      if (!opts.sessionKnown) {
        setState((s) => ({
          ...s,
          authReady: true,
          profileReady: false,
          loading: true,
          isLoggedIn: true,
        }));
      } else {
        setState((s) => ({ ...s, profileReady: false, loading: true }));
      }

      try {
        if (stripeSyncFirst) {
          await fetch("/api/stripe/sync", { method: "POST", credentials: "same-origin" });
          if (cancelledRef.current) return;
        }

        const res = await fetch("/api/user/profile", { credentials: "same-origin" });
        if (cancelledRef.current) return;

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
        let free_trial_started_at: string | null = null;
        let free_trial_ends_at: string | null = null;
        let last_free_use_date: string | null = null;
        let total_free_uses: number | null = null;

        if (res.ok) {
          const data = (await res.json()) as {
            subscription_status?: string | null;
            subscription_trial_end?: string | null;
            free_trial_started_at?: string | null;
            free_trial_ends_at?: string | null;
            last_free_use_date?: string | null;
            total_free_uses?: number | null;
          };
          subscription_status =
            typeof data.subscription_status === "string" ? data.subscription_status : null;
          subscription_trial_end =
            typeof data.subscription_trial_end === "string" ? data.subscription_trial_end : null;
          free_trial_started_at =
            typeof data.free_trial_started_at === "string" ? data.free_trial_started_at : null;
          free_trial_ends_at =
            typeof data.free_trial_ends_at === "string" ? data.free_trial_ends_at : null;
          last_free_use_date =
            typeof data.last_free_use_date === "string" ? data.last_free_use_date : null;
          total_free_uses =
            typeof data.total_free_uses === "number" ? data.total_free_uses : null;
        }

        const fields = buildStateFromProfile({
          subscription_status,
          subscription_trial_end,
          free_trial_started_at,
          free_trial_ends_at,
          last_free_use_date,
          total_free_uses,
        });

        setState({
          authReady: true,
          profileReady: true,
          loading: false,
          isLoggedIn: true,
          ...fields,
        });
      } catch {
        if (!cancelledRef.current) {
          setState({
            authReady: true,
            profileReady: true,
            loading: false,
            isLoggedIn: true,
            hasPaidAccess: false,
            hasOptimizationAccess: false,
            freePlanBlockedCode: null,
            isWelcome: false,
            welcomeDaysLeft: 0,
            isTrialing: false,
            isActive: false,
            subscriptionStatus: null,
            trialEndLabel: null,
          });
        }
      }
    },
    [stripeSyncFirst]
  );

  useEffect(() => {
    cancelledRef.current = false;
    void loadProfile({ sessionKnown: false });
    return () => {
      cancelledRef.current = true;
    };
  }, [loadProfile]);

  const refetch = useCallback(async () => {
    await loadProfile({ sessionKnown: true });
  }, [loadProfile]);

  return { ...state, refetch };
}
