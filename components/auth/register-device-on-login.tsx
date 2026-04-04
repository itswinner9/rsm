"use client";

import { useEffect, useRef } from "react";
import { createClient } from "@/lib/supabase/client";
import { getVisitorId } from "@/lib/fingerprint/getVisitorId";
import { FP_OAUTH_PENDING_KEY, fpRegisteredStorageKey } from "@/lib/auth/fingerprint-storage";

/**
 * After any sign-in, links FingerprintJS visitor id to the account (server-side table).
 * Skips duplicate work per user per browser using localStorage.
 */
export function RegisterDeviceOnLogin() {
  const ranForUser = useRef<string | null>(null);

  useEffect(() => {
    const supabase = createClient();

    const register = async (userId: string) => {
      if (typeof window === "undefined") return;
      if (ranForUser.current === userId) return;
      try {
        if (localStorage.getItem(fpRegisteredStorageKey(userId))) {
          ranForUser.current = userId;
          return;
        }
      } catch {
        /* private mode */
      }

      const pending = sessionStorage.getItem(FP_OAUTH_PENDING_KEY);
      sessionStorage.removeItem(FP_OAUTH_PENDING_KEY);

      const visitorId = pending?.trim() || (await getVisitorId());
      if (!visitorId) return;

      const res = await fetch("/api/auth/register-device", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "same-origin",
        body: JSON.stringify({ visitorId }),
      });

      if (res.ok) {
        try {
          localStorage.setItem(fpRegisteredStorageKey(userId), "1");
        } catch {
          /* private mode */
        }
        ranForUser.current = userId;
      }
    };

    const init = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (session?.user?.id) await register(session.user.id);
    };

    void init();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === "SIGNED_IN" && session?.user?.id) {
        void register(session.user.id);
      }
      if (event === "SIGNED_OUT") {
        ranForUser.current = null;
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  return null;
}
