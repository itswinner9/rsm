/* eslint-disable @typescript-eslint/no-require-imports */
const disposableDomains: string[] = require("disposable-email-domains");

const domainSet = new Set(
  disposableDomains.map((d: string) => d.toLowerCase().trim())
);

export function getEmailDomain(email: string): string | null {
  const at = email.lastIndexOf("@");
  if (at < 0) return null;
  return email.slice(at + 1).toLowerCase().trim() || null;
}

export function isDisposableEmail(email: string): boolean {
  const domain = getEmailDomain(email);
  if (!domain) return true;
  return domainSet.has(domain);
}
