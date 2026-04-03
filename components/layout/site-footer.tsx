import Link from "next/link";
import { ResumifyLogo } from "@/components/brand/resumify-logo";
import { FooterAccountLinks } from "./footer-account-links";
import { SITE_DOMAIN, SITE_NAME, footerExploreLinks } from "@/lib/site-nav";

export function SiteFooter() {
  return (
    <footer id="footer" className="border-t border-border bg-background">
      <div className="mx-auto max-w-6xl px-6 py-12">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-4">
          <div className="md:col-span-2">
            <ResumifyLogo className="mb-4" gradientIdSuffix="ftr" />
            <p className="text-muted-foreground text-sm leading-relaxed max-w-xs">
              Stop getting filtered out by ATS bots. {SITE_NAME} tailors your real experience to each posting—keyword
              match scores, honest gaps, and PDF or DOCX in seconds. {SITE_DOMAIN}
            </p>
            <p className="text-muted-foreground/50 text-xs mt-4">
              © {new Date().getFullYear()} {SITE_NAME}. All rights reserved.
            </p>
          </div>

          <div>
            <p className="text-foreground text-sm font-medium mb-4">Explore</p>
            <ul className="space-y-3">
              {footerExploreLinks.map((l) => (
                <li key={`${l.href}-${l.label}`}>
                  <Link
                    href={l.href}
                    className="text-muted-foreground hover:text-foreground text-sm transition-colors duration-150"
                  >
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <p className="text-foreground text-sm font-medium mb-4">Account</p>
            <FooterAccountLinks />
          </div>
        </div>
      </div>
    </footer>
  );
}
