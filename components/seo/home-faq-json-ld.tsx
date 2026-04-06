import { homePageFaqs } from "@/lib/pricing/planDisplay";
import { siteUrl } from "@/lib/site-metadata";

/** FAQPage structured data for the homepage (matches visible `HomeFaqSection`). */
export function HomeFaqJsonLd() {
  const data = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    url: siteUrl(),
    mainEntity: homePageFaqs.map((f) => ({
      "@type": "Question",
      name: f.q,
      acceptedAnswer: {
        "@type": "Answer",
        text: f.a,
      },
    })),
  };

  return (
    <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }} />
  );
}
