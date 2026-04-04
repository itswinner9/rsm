import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import {
  syncStripeSubscriptionForUser,
  syncStripeSubscriptionFromCheckoutSession,
} from "@/lib/stripe/syncSubscription";

/** Refresh subscription from Stripe (e.g. right after checkout, before webhooks land). */
export async function POST(request: Request) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let sessionId: string | undefined;
  const ct = request.headers.get("content-type");
  if (ct?.includes("application/json")) {
    try {
      const body = (await request.json()) as { session_id?: unknown };
      if (typeof body.session_id === "string" && body.session_id.startsWith("cs_")) {
        sessionId = body.session_id;
      }
    } catch {
      /* empty or invalid body */
    }
  }

  if (sessionId) {
    const active = await syncStripeSubscriptionFromCheckoutSession(user.id, sessionId);
    if (active) {
      return NextResponse.json({ active: true });
    }
  }

  const active = await syncStripeSubscriptionForUser(user.id);
  return NextResponse.json({ active });
}
