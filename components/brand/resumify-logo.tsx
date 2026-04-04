import Link from "next/link";
import Image from "next/image";
import { cn } from "@/lib/utils";

/** Logo mark (PNG). `gradientIdSuffix` kept for API compatibility with older call sites. */
export function ResumifyMark({
  className,
  gradientIdSuffix: _gradientIdSuffix = "a",
}: {
  className?: string;
  /** @deprecated Unused; SVG gradients replaced by brand PNG. */
  gradientIdSuffix?: string;
}) {
  return (
    <Image
      src="/logor.png"
      alt=""
      width={36}
      height={36}
      className={cn("h-8 w-8 shrink-0 object-contain", className)}
      priority
    />
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
