import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { ResumifyLogo } from "@/components/brand/resumify-logo";
import { cn } from "@/lib/utils";

export function AuthPageShell({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className="relative min-h-screen overflow-hidden bg-background text-foreground">
      <div
        aria-hidden
        className="pointer-events-none fixed inset-0 -z-10 [background-image:radial-gradient(hsl(var(--border))_1px,transparent_1px)] [background-size:24px_24px] opacity-[0.45]"
      />
      <div
        aria-hidden
        className="pointer-events-none fixed inset-0 -z-10 bg-[radial-gradient(90%_60%_at_50%_-10%,hsl(var(--primary)/0.08),transparent_55%)]"
      />

      <header className="relative z-20 mx-auto flex max-w-lg items-center justify-between gap-4 px-5 pt-8 sm:px-6">
        <ResumifyLogo gradientIdSuffix="auth" />
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-xs font-medium text-muted-foreground transition-colors hover:text-foreground"
        >
          <ArrowLeft className="size-3.5" aria-hidden />
          Home
        </Link>
      </header>

      <main
        className={cn(
          "relative z-10 mx-auto flex min-h-[calc(100vh-5.5rem)] max-w-lg flex-col justify-center px-5 pb-16 pt-10 sm:px-6",
          className
        )}
      >
        {children}
      </main>
    </div>
  );
}
