"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronDown, Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import { createClient } from "@/lib/supabase/client";
import {
  appPrimaryNav,
  appSecondaryNavLinks,
  marketingNavLinks,
} from "@/lib/site-nav";
import { ResumifyLogo } from "@/components/brand/resumify-logo";

const MENU_PANEL_ID = "site-header-nav-panel";

export function SiteHeader() {
  const [menuOpen, setMenuOpen] = React.useState(false);
  const [scrolled, setScrolled] = React.useState(false);
  const [isLoggedIn, setIsLoggedIn] = React.useState(false);
  const pathname = usePathname();
  const supabase = createClient();

  React.useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  React.useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setIsLoggedIn(!!data.session);
    });
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setIsLoggedIn(!!session);
    });
    return () => subscription.unsubscribe();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const isPricingActive = pathname === "/pricing";
  const isAboutActive = pathname === "/about";
  const isOnHome = pathname === "/";

  return (
    <header>
      <nav
        data-state={menuOpen ? "active" : undefined}
        className="fixed z-20 w-full px-2 group"
        aria-label="Main"
      >
        <div
          className={cn(
            "mx-auto mt-2 max-w-6xl px-6 transition-all duration-300 lg:px-12",
            scrolled && "bg-background/50 max-w-4xl rounded-2xl border border-border backdrop-blur-lg lg:px-5"
          )}
        >
          <div className="relative flex flex-wrap items-center justify-between gap-6 py-3 lg:gap-0 lg:py-4">
            <div className="flex w-full justify-between lg:w-auto">
              <ResumifyLogo gradientIdSuffix="hdr" />
              <button
                type="button"
                onClick={() => setMenuOpen(!menuOpen)}
                aria-label={menuOpen ? "Close menu" : "Open menu"}
                aria-expanded={menuOpen}
                aria-controls={MENU_PANEL_ID}
                className="relative z-20 -m-2.5 -mr-4 block cursor-pointer p-2.5 lg:hidden"
              >
                <Menu className="group-data-[state=active]:scale-0 group-data-[state=active]:opacity-0 m-auto size-6 duration-200" />
                <X className="group-data-[state=active]:scale-100 group-data-[state=active]:opacity-100 absolute inset-0 m-auto size-6 scale-0 opacity-0 duration-200" />
              </button>
            </div>

            <div className="absolute inset-0 m-auto hidden size-fit lg:block">
              <ul className="flex gap-8 text-sm">
                {marketingNavLinks.map((item) => (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      className={cn(
                        "text-muted-foreground hover:text-foreground block duration-150",
                        item.href === "/pricing" && isPricingActive && "text-foreground font-medium",
                        item.href === "/about" && isAboutActive && "text-foreground font-medium",
                        item.href.startsWith("/#") && isOnHome && "hover:text-foreground"
                      )}
                    >
                      {item.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            <div
              id={MENU_PANEL_ID}
              className={cn(
                "bg-background group-data-[state=active]:block lg:group-data-[state=active]:flex mb-6 hidden w-full flex-wrap items-center justify-end space-y-8 rounded-3xl border border-border p-6 shadow-2xl shadow-zinc-300/20 md:flex-nowrap lg:m-0 lg:flex lg:w-fit lg:gap-6 lg:space-y-0 lg:border-transparent lg:bg-transparent lg:p-0 lg:shadow-none"
              )}
            >
              <div className="lg:hidden w-full">
                <p className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground mb-3">
                  Product
                </p>
                <ul className="space-y-4 text-base">
                  {marketingNavLinks.map((item) => (
                    <li key={item.href}>
                      <Link
                        href={item.href}
                        onClick={() => setMenuOpen(false)}
                        className="text-muted-foreground hover:text-foreground block duration-150"
                      >
                        {item.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>

              {isLoggedIn ? (
                <div className="lg:hidden w-full border-t border-border pt-6">
                  <p className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground mb-3">
                    App
                  </p>
                  <ul className="space-y-4 text-base">
                    <li>
                      <Link
                        href={appPrimaryNav.href}
                        onClick={() => setMenuOpen(false)}
                        className="text-foreground font-medium block"
                      >
                        {appPrimaryNav.label}
                      </Link>
                    </li>
                    {appSecondaryNavLinks.map((item) => (
                      <li key={item.href}>
                        <Link
                          href={item.href}
                          onClick={() => setMenuOpen(false)}
                          className="text-muted-foreground hover:text-foreground block duration-150"
                        >
                          {item.label}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              ) : null}

              <div
                className={cn(
                  "flex w-full flex-col space-y-3 sm:flex-row sm:flex-wrap sm:justify-end sm:gap-2 sm:space-y-0 md:w-fit md:max-w-[min(100%,28rem)] lg:flex-row",
                  isLoggedIn && "hidden lg:flex"
                )}
              >
                {isLoggedIn ? (
                  <>
                    <Button asChild size="sm" className="shrink-0">
                      <Link href={appPrimaryNav.href}>
                        <span>{appPrimaryNav.label}</span>
                      </Link>
                    </Button>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="outline" size="sm" className="gap-1.5 shrink-0 border-border">
                          More
                          <ChevronDown className="size-3.5 opacity-70" strokeWidth={2} />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-44">
                        {appSecondaryNavLinks.map((item) => (
                          <DropdownMenuItem key={item.href} asChild>
                            <Link href={item.href}>{item.label}</Link>
                          </DropdownMenuItem>
                        ))}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </>
                ) : (
                  <>
                    <Button
                      asChild
                      variant="outline"
                      size="sm"
                      className={cn("shrink-0", scrolled && "lg:hidden")}
                    >
                      <Link href="/auth/login" onClick={() => setMenuOpen(false)}>
                        <span>Login</span>
                      </Link>
                    </Button>
                    <Button asChild size="sm" className={cn("shrink-0", scrolled && "lg:hidden")}>
                      <Link href="/auth/signup" onClick={() => setMenuOpen(false)}>
                        <span>Sign Up Free</span>
                      </Link>
                    </Button>
                    <Button asChild size="sm" className={cn("shrink-0", scrolled ? "lg:inline-flex" : "hidden")}>
                      <Link href="/auth/signup" onClick={() => setMenuOpen(false)}>
                        <span>Get Started</span>
                      </Link>
                    </Button>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </nav>
    </header>
  );
}

/** @deprecated Use `ResumifyLogo` from `@/components/brand/resumify-logo`. */
export { ResumifyLogo as RsmLogo } from "@/components/brand/resumify-logo";
