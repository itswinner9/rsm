import { NextRequest, NextResponse } from "next/server";
import { agentDebugLog } from "@/lib/debug/agent-log";

/** Persists client-side debug lines to .cursor/debug-b60315.log (dev only). */
export async function POST(request: NextRequest) {
  if (process.env.NODE_ENV !== "development") {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
  try {
    const body = (await request.json()) as {
      hypothesisId?: string;
      location?: string;
      message?: string;
      data?: Record<string, unknown>;
      runId?: string;
    };
    await agentDebugLog({
      hypothesisId: body.hypothesisId ?? "unknown",
      location: body.location ?? "client",
      message: body.message ?? "",
      data: body.data,
      runId: body.runId,
    });
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ ok: false }, { status: 400 });
  }
}
