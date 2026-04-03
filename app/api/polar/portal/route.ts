import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getAppOrigin, getPolar } from "@/lib/polar/server";
import type { NextRequest } from "next/server";

export async function POST(request: NextRequest) {
  if (!process.env.POLAR_ACCESS_TOKEN?.trim()) {
    return NextResponse.json(
      { error: "Billing is not configured. Set POLAR_ACCESS_TOKEN." },
      { status: 500 }
    );
  }

  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const origin = getAppOrigin(request);

  try {
    const polar = getPolar();
    const session = await polar.customerSessions.create({
      externalCustomerId: user.id,
      returnUrl: `${origin}/profile`,
    });
    return NextResponse.json({ url: session.customerPortalUrl });
  } catch (e) {
    console.error("Polar portal error:", e);
    const message = e instanceof Error ? e.message : "Could not open billing portal";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
