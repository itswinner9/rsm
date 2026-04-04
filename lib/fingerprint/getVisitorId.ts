/**
 * Browser-only: FingerprintJS visitor id for signup abuse checks.
 * Do not import from Server Components.
 */
export async function getVisitorId(): Promise<string | null> {
  if (typeof window === "undefined") return null;
  try {
    const FingerprintJS = (await import("@fingerprintjs/fingerprintjs")).default;
    const fp = await FingerprintJS.load();
    const result = await fp.get();
    const id = result.visitorId?.trim();
    return id && id.length >= 8 ? id : null;
  } catch {
    return null;
  }
}
