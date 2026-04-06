import { TemplatesShowcaseClient } from "@/components/blocks/templates-showcase-client";

/** Landing section: compare all layouts with the same sample resume (SEO-friendly headings). */
export function TemplatesShowcaseSection() {
  return (
    <section
      id="templates"
      aria-labelledby="templates-heading"
      className="bg-background py-24 px-4 sm:px-6 lg:px-8 border-t border-border/50"
    >
      <div className="mx-auto max-w-6xl">
        <p className="text-center text-muted-foreground text-xs uppercase tracking-widest font-medium mb-4">
          Layouts
        </p>
        <h2
          id="templates-heading"
          className="text-foreground text-3xl sm:text-4xl font-bold tracking-tight text-center mb-4"
        >
          Five professional templates — same story, different structure
        </h2>
        <p className="text-muted-foreground text-lg max-w-2xl mx-auto text-center text-balance">
          Preview how your optimized resume can look before you sign up. After you run an optimization, export PDF or
          DOCX from whichever layout you prefer.
        </p>
        <TemplatesShowcaseClient />
      </div>
    </section>
  );
}
