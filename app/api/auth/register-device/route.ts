import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createServiceRoleClient } from "@/lib/supabase/admin";

function isValidVisitorId(id: unknown): id is string {
  if (typeof id !== "string") return false;
  const t = id.trim();
  return t.length >= 8 && t.length <= 128 && /^[a-zA-Z0-9_-]+$/.test(t);
}

/**
 * Associates the current user with a FingerprintJS visitor id (after login or signup).
 */
export async function POST(request: Request) {
  try {
    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = (await request.json().catch(() => ({}))) as { visitorId?: unknown };
    if (!isValidVisitorId(body.visitorId)) {
      return NextResponse.json({ error: "invalid_visitor" }, { status: 400 });
    }
    const visitorId = body.visitorId.trim();

    const admin = createServiceRoleClient();
    if (!admin) {
      return NextResponse.json({ ok: true, skipped: true });
    }

    const { error } = await admin.from("signup_device_visitors").insert({
      visitor_id: visitorId,
      user_id: user.id,
    });

    if (error && error.code !== "23505") {
      console.error("[register-device]", error.message);
      return NextResponse.json({ error: "Could not register device" }, { status: 500 });
    }

    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error("[register-device]", e);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
