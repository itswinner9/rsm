"use client";

import { useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";

/** Drops `?success=true` after checkout so refresh does not keep showing the success state. */
export function DashboardClearSuccessQuery() {
  const searchParams = useSearchParams();
  const router = useRouter();

  useEffect(() => {
    if (searchParams.get("success") !== "true") return;
    const t = window.setTimeout(() => {
      router.replace("/dashboard", { scroll: false });
    }, 2400);
    return () => window.clearTimeout(t);
  }, [router, searchParams]);

  return null;
}
