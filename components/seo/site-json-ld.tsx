import { SITE_NAME } from "@/lib/site-nav";
import { SITE_CANONICAL_ORIGIN, siteDescription, siteUrl } from "@/lib/site-metadata";

/** Organization + WebSite structured data for search engines. */
export function SiteJsonLd() {
  const url = siteUrl();
  const org = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: SITE_NAME,
    url,
    description: siteDescription,
    sameAs: [SITE_CANONICAL_ORIGIN],
  };
  const website = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: SITE_NAME,
    url,
    description: siteDescription,
    publisher: { "@type": "Organization", name: SITE_NAME, url },
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(org) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(website) }} />
    </>
  );
}
