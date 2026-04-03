import { Polar } from "@polar-sh/sdk";
import type { NextRequest } from "next/server";

export function getAppOrigin(request: NextRequest): string {
  const fromEnv = process.env.NEXT_PUBLIC_APP_URL?.trim().replace(/\/$/, "");
  if (fromEnv) return fromEnv;
  const host = request.headers.get("host");
  const forwardedProto = request.headers.get("x-forwarded-proto");
  const proto =
    forwardedProto?.split(",")[0]?.trim() ||
    (host?.includes("localhost") ? "http" : "https");
  if (host) return `${proto}://${host}`;
  return "http://localhost:3000";
}

export function getPolarServer(): "sandbox" | "production" {
  const v = process.env.POLAR_SERVER?.trim().toLowerCase();
  if (v === "production") return "production";
  return "sandbox";
}

export function getPolar(): Polar {
  const accessToken = process.env.POLAR_ACCESS_TOKEN?.trim();
  if (!accessToken) {
    throw new Error("POLAR_ACCESS_TOKEN is not set");
  }
  return new Polar({
    accessToken,
    server: getPolarServer(),
  });
}
