import { NextResponse } from "next/server";
import { createServiceRoleClient } from "@/lib/supabase/admin";
import { MAX_SIGNUPS_PER_DEVICE, MAX_SIGNUPS_PER_DEVICE_DAYS } from "@/lib/auth/device-signup-limits";

function isValidVisitorId(id: unknown): id is string {
  if (typeof id !== "string") return false;
  const t = id.trim();
  return t.length >= 8 && t.length <= 128 && /^[a-zA-Z0-9_-]+$/.test(t);
}

/**
 * Pre-signup: block if this browser already has an account with an active trial or paid plan,
 * or if too many accounts were created from this device recently.
 */
export async function POST(request: Request) {
  try {
    const body = (await request.json().catch(() => ({}))) as { visitorId?: unknown };
    if (!isValidVisitorId(body.visitorId)) {
      return NextResponse.json({ ok: false, error: "invalid_visitor" }, { status: 400 });
    }
    const visitorId = body.visitorId.trim();

    const admin = createServiceRoleClient();
    if (!admin) {
      return NextResponse.json({ ok: true, skipped: true });
    }

    const since = new Date();
    since.setDate(since.getDate() - MAX_SIGNUPS_PER_DEVICE_DAYS);

    const { data: deviceRows, error: devErr } = await admin
      .from("signup_device_visitors")
      .select("user_id")
      .eq("visitor_id", visitorId);

    if (devErr) {
      console.error("[check-signup-device] list:", devErr.message);
      return NextResponse.json({ ok: true, skipped: true });
    }

    const userIds = Array.from(new Set((deviceRows ?? []).map((r) => r.user_id)));
    if (userIds.length > 0) {
      const { data: paidProfiles, error: profErr } = await admin
        .from("user_profiles")
        .select("user_id")
        .in("user_id", userIds)
        .in("subscription_status", ["trialing", "active"]);

      if (!profErr && paidProfiles && paidProfiles.length > 0) {
        return NextResponse.json(
          {
            ok: false,
            error: "device_has_active_plan",
            message:
              "This device already has an account with an active or trial plan. Sign in to that account, or use Manage billing on your profile.",
          },
          { status: 403 }
        );
      }
    }

    const { data: recentRows, error: recentErr } = await admin
      .from("signup_device_visitors")
      .select("user_id")
      .eq("visitor_id", visitorId)
      .gte("created_at", since.toISOString());

    if (!recentErr && recentRows) {
      const distinct = new Set(recentRows.map((r) => r.user_id)).size;
      if (distinct >= MAX_SIGNUPS_PER_DEVICE) {
        return NextResponse.json(
          {
            ok: false,
            error: "too_many_accounts_device",
            message:
              "Too many accounts were created from this device recently. If you need help, contact support.",
          },
          { status: 403 }
        );
      }
    }

    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error("[check-signup-device]", e);
    return NextResponse.json({ ok: true, skipped: true });
  }
}
