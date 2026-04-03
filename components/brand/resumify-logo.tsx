import Link from "next/link";
import { cn } from "@/lib/utils";

/** Gradient mark; `gradientIdSuffix` avoids duplicate SVG defs when header + footer both render. */
export function ResumifyMark({
  className,
  gradientIdSuffix = "a",
}: {
  className?: string;
  gradientIdSuffix?: string;
}) {
  const gid = `resumify-mark-grad-${gradientIdSuffix}`;
  return (
    <svg
      viewBox="0 0 24 18"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={cn("h-5 w-auto shrink-0", className)}
      aria-hidden
    >
      <path d="M3 0H5V18H3V0ZM13 0H15V18H13V0ZM18 3V5H0V3H18ZM0 15V13H18V15H0Z" fill={`url(#${gid})`} />
      <defs>
        <linearGradient id={gid} x1="10" y1="0" x2="10" y2="20" gradientUnits="userSpaceOnUse">
          <stop stopColor="#9B99FE" />
          <stop offset="1" stopColor="#2BC8B7" />
        </linearGradient>
      </defs>
    </svg>
  );
}

/** Mark + wordmark for use inside an existing `Link` (e.g. app shell). */
export function ResumifyBrand({
  className,
  showWordmark = true,
  gradientIdSuffix = "a",
}: {
  className?: string;
  showWordmark?: boolean;
  gradientIdSuffix?: string;
}) {
  return (
    <span className={cn("inline-flex items-center gap-2", className)}>
      <ResumifyMark gradientIdSuffix={gradientIdSuffix} />
      {showWordmark ? (
        <span className="font-semibold text-foreground tracking-tight text-base sm:text-lg">Resumify</span>
      ) : null}
    </span>
  );
}

export function ResumifyLogo({
  className,
  href = "/",
  showWordmark = true,
  gradientIdSuffix = "a",
}: {
  className?: string;
  href?: string;
  showWordmark?: boolean;
  gradientIdSuffix?: string;
}) {
  return (
    <Link href={href} className={cn("inline-flex items-center gap-2", className)} aria-label="Resumify home">
      <ResumifyBrand showWordmark={showWordmark} gradientIdSuffix={gradientIdSuffix} />
    </Link>
  );
}
