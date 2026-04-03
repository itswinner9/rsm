import { appendFile, mkdir } from "fs/promises";
import { join } from "path";

const SESSION = "b60315";

/** NDJSON line to workspace .cursor (Node server only; Edge cannot use this). */
export async function agentDebugLog(payload: {
  hypothesisId: string;
  location: string;
  message: string;
  data?: Record<string, unknown>;
  runId?: string;
}) {
  const line = JSON.stringify({
    sessionId: SESSION,
    runId: payload.runId ?? "pre",
    hypothesisId: payload.hypothesisId,
    location: payload.location,
    message: payload.message,
    data: payload.data,
    timestamp: Date.now(),
  });
  try {
    const dir = join(process.cwd(), ".cursor");
    await mkdir(dir, { recursive: true });
    await appendFile(join(dir, `debug-${SESSION}.log`), `${line}\n`);
  } catch {
    /* ignore */
  }
}
