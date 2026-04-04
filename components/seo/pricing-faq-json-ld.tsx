import { pricingFaqs } from "@/lib/pricing/planDisplay";
import { siteUrl } from "@/lib/site-metadata";

/** FAQPage structured data for the pricing page (Google rich results). */
export function PricingFaqJsonLd() {
  const data = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    url: `${siteUrl()}/pricing`,
    mainEntity: pricingFaqs.map((f) => ({
      "@type": "Question",
      name: f.q,
      acceptedAnswer: {
        "@type": "Answer",
        text: f.a,
      },
    })),
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}
