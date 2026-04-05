import Link from "next/link";
import { SiteHeader } from "@/components/layout/site-header";
import { SiteFooter } from "@/components/layout/site-footer";
import { SITE_DOMAIN, SITE_NAME } from "@/lib/site-nav";
import { Button } from "@/components/ui/button";

const highlights = [
  "Resume + posting → one tailored version per role",
  "Keyword overlap and clear gaps—no invented facts",
  "Multiple layouts · PDF or DOCX",
];

export default function AboutPage() {
  return (
    <div className="bg-background min-h-screen">
      <SiteHeader />

      <main className="pt-28 pb-24 px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-xl">
          <p className="text-xs font-medium tracking-wide text-muted-foreground">{SITE_DOMAIN}</p>
          <h1 className="mt-3 text-4xl font-semibold tracking-tight text-foreground sm:text-5xl text-balance">
            Resumes that fit the role—not a one-size file
          </h1>
          <p className="mt-6 text-base leading-relaxed text-muted-foreground sm:text-[17px]">
            {SITE_NAME} shapes your real experience into a clear story for each posting—so recruiters see why you fit.
          </p>

          <ul className="mt-10 space-y-3 border-t border-border pt-10 text-[15px] leading-relaxed text-muted-foreground">
            {highlights.map((line) => (
              <li key={line} className="flex gap-3">
                <span className="mt-2 h-1 w-1 shrink-0 rounded-full bg-primary/70" aria-hidden />
                <span>{line}</span>
              </li>
            ))}
          </ul>

          <p className="mt-10 rounded-2xl bg-muted/50 px-5 py-4 text-sm leading-relaxed text-muted-foreground">
            <span className="font-medium text-foreground">100+</span> job seekers tried {SITE_NAME} in the first weeks—many
            said they felt better hitting submit. Results vary; the goal is clearer applications and more replies.
          </p>

          <p className="mt-8 text-sm leading-relaxed text-muted-foreground">
            For anyone applying online—Canada first, works worldwide—career switches, new grads, or high-volume searches.
          </p>

          <div className="mt-12 flex flex-wrap items-center gap-3">
            <Button asChild size="default" className="rounded-full px-6">
              <Link href="/auth/signup">Get started</Link>
            </Button>
            <Button asChild variant="ghost" size="default" className="rounded-full text-muted-foreground">
              <Link href="/pricing">Pricing</Link>
            </Button>
          </div>
        </div>
      </main>

      <SiteFooter />
    </div>
  );
}
