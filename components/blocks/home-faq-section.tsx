import Link from "next/link";
import { ChevronDown } from "lucide-react";
import { faqSectionTitle, homePageFaqs } from "@/lib/pricing/planDisplay";
import { cn } from "@/lib/utils";

export function HomeFaqSection() {
  return (
    <section
      id="faq"
      aria-labelledby="home-faq-heading"
      className="bg-background py-24 px-4 sm:px-6 lg:px-8 border-t border-border/50"
    >
      <div className="mx-auto max-w-3xl">
        <h2 id="home-faq-heading" className="text-foreground text-2xl sm:text-3xl font-bold tracking-tight text-center mb-4">
          {faqSectionTitle}
        </h2>
        <p className="text-muted-foreground text-center text-sm mb-10 max-w-lg mx-auto">
          Straight answers about matching job text and what we won&apos;t do. See the full list on{" "}
          <Link href="/pricing" className="font-medium text-primary underline-offset-4 hover:underline">
            Plans &amp; pricing
          </Link>
          .
        </p>
        <div className="space-y-3">
          {homePageFaqs.map((f) => (
            <details
              key={f.q}
              className={cn(
                "group rounded-2xl border border-border bg-card/50 px-5 py-4",
                "open:shadow-sm open:border-primary/20"
              )}
            >
              <summary className="flex cursor-pointer list-none items-center justify-between gap-3 text-left font-medium text-foreground">
                <span>{f.q}</span>
                <ChevronDown className="size-4 shrink-0 text-muted-foreground transition-transform group-open:rotate-180" />
              </summary>
              <p className="mt-3 text-muted-foreground text-sm leading-relaxed pr-6">{f.a}</p>
            </details>
          ))}
        </div>
      </div>
    </section>
  );
}
