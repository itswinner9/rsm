import type { MetadataRoute } from "next";
import { siteUrl } from "@/lib/site-metadata";

export default function robots(): MetadataRoute.Robots {
  const base = siteUrl();
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/api/", "/dashboard/", "/builder", "/profile"],
    },
    sitemap: `${base}/sitemap.xml`,
  };
}
