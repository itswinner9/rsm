import { NextResponse } from "next/server";
import { existsSync, readFileSync, readdirSync } from "fs";
import { join } from "path";

export const dynamic = "force-dynamic";

/** Runtime diagnostic: missing chunk files → same error as Cannot find module './948.js' */
export async function GET() {
  const cwd = process.cwd();
  const notFoundPage = join(cwd, ".next/server/app/_not-found/page.js");
  const chunksDir = join(cwd, ".next/server/chunks");

  const payload: Record<string, unknown> = {
    notFoundPageExists: existsSync(notFoundPage),
    chunksDirExists: existsSync(chunksDir),
    referencedChunkIds: [] as string[],
    missingChunkFiles: [] as string[],
    chunkFileCount: 0,
    ok: true,
  };

  try {
    if (existsSync(chunksDir)) {
      payload.chunkFileCount = readdirSync(chunksDir).filter((f) => f.endsWith(".js")).length;
    }
    if (existsSync(notFoundPage)) {
      const content = readFileSync(notFoundPage, "utf8");
      const m = content.match(/t\.X\(0,\[([^\]]+)\]/);
      if (m) {
        const ids = m[1].split(",").map((s) => s.trim()).filter(Boolean);
        (payload.referencedChunkIds as string[]) = ids;
        const missing: string[] = [];
        for (const id of ids) {
          if (!existsSync(join(chunksDir, `${id}.js`))) missing.push(`${id}.js`);
        }
        (payload.missingChunkFiles as string[]) = missing;
        payload.ok = missing.length === 0;
      }
    } else {
      payload.ok = false;
      (payload.missingChunkFiles as string[]).push("(no _not-found build output)");
    }
  } catch (e) {
    payload.ok = false;
    payload.error = String(e);
  }

  return NextResponse.json(payload);
}
