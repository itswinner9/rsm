import { NextRequest, NextResponse } from "next/server";
import { isDisposableEmail } from "@/lib/auth/disposable-email";

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json();
    if (typeof email !== "string" || !email.includes("@")) {
      return NextResponse.json({ ok: false, error: "invalid_email" }, { status: 400 });
    }
    if (isDisposableEmail(email)) {
      return NextResponse.json({ ok: false, error: "disposable_not_allowed" }, { status: 400 });
    }
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ ok: false, error: "bad_request" }, { status: 400 });
  }
}
