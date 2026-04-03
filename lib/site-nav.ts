/** Shared labels and hrefs for marketing header, footer, and in-app entry points. */

export const SITE_NAME = "Resumify";
/** Public site hostname (no protocol). */
export const SITE_DOMAIN = "resumify.cc";

export type SiteNavLink = { label: string; href: string };

export const marketingNavLinks: SiteNavLink[] = [
  { label: "Product", href: "/#features" },
  { label: "How it works", href: "/#how-it-works" },
  { label: "Plans", href: "/pricing" },
  { label: "About", href: "/about" },
];

/** Marketing anchors + Builder (footer “Explore” column). */
export const footerExploreLinks: SiteNavLink[] = [
  ...marketingNavLinks,
  { label: "Builder", href: "/builder" },
];

/** Primary app entry from marketing header. */
export const appPrimaryNav: SiteNavLink = { label: "Dashboard", href: "/dashboard" };

/** Header dropdown after Dashboard: recent list + account settings. */
export const appSecondaryNavLinks: SiteNavLink[] = [
  { label: "Recent", href: "/dashboard#recent" },
  { label: "Account", href: "/profile" },
];

/** All app links for footer account column when logged in. */
export const appNavLinksLoggedIn: SiteNavLink[] = [appPrimaryNav, ...appSecondaryNavLinks];
