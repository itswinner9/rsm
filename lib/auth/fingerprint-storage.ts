/** SessionStorage key: visitor id captured before OAuth redirect for post-login registration. */
export const FP_OAUTH_PENDING_KEY = "resumify_fp_oauth";

/** localStorage key prefix: device already registered for this user id. */
export function fpRegisteredStorageKey(userId: string): string {
  return `resumify_fp_registered_${userId}`;
}
