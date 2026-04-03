"use client";

import React, { useState, useEffect, useRef, useMemo } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import type { LucideIcon } from "lucide-react";
import {
  History,
  Sparkles,
  User,
  LogOut,
  Menu,
  X,
  Crown,
  Home,
  Tag,
  ChevronRight,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { ResumifyBrand } from "@/components/brand/resumify-logo";

const POLAR_SYNC_SESSION_KEY = "rsm_polar_sync_v1";

const navGroups: {
  label: string;
  items: { label: string; href: string; icon: LucideIcon }[];
}[] = [
  {
    label: "Product",
    items: [
      { label: "Recent", href: "/dashboard", icon: History },
      { label: "Builder", href: "/builder", icon: Sparkles },
    ],
  },
  {
    label: "Account",
    items: [{ label: "Profile", href: "/profile", icon: User }],
  },
  {
    label: "More",
    items: [
      { label: "Home", href: "/", icon: Home },
      { label: "Plans", href: "/pricing", icon: Tag },
    ],
  },
];

interface AppShellProps {
  children: React.ReactNode;
  userEmail?: string;
  isPro?: boolean;
}

export function AppShell({ children, userEmail, isPro }: AppShellProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const syncStarted = useRef(false);

  const sidebarNavGroups = useMemo(() => {
    let groups = navGroups;
    if (isPro) {
      groups = groups
        .filter((g) => g.label !== "Account")
        .map((g) =>
          g.label === "More"
            ? { ...g, items: g.items.filter((i) => i.href !== "/pricing") }
            : g
        )
        .filter((g) => g.items.length > 0);
    }
    return groups;
  }, [isPro]);

  const displayName = userEmail?.split("@")[0] ?? "Account";

  useEffect(() => {
    setSidebarOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (isPro || typeof window === "undefined" || syncStarted.current) return;
    if (sessionStorage.getItem(POLAR_SYNC_SESSION_KEY)) return;
    syncStarted.current = true;
    sessionStorage.setItem(POLAR_SYNC_SESSION_KEY, "1");

    (async () => {
      try {
        const res = await fetch("/api/polar/sync", { method: "POST", credentials: "same-origin" });
        const data = (await res.json()) as { active?: boolean };
        if (data.active) router.refresh();
      } catch {
        /* ignore */
      }
    })();
  }, [isPro, router]);

  const handleSignOut = async () => {
    await fetch("/api/auth/signout", { method: "POST" });
    router.push("/auth/login");
  };

  const NavLink = ({
    href,
    label,
    icon: Icon,
  }: {
    href: string;
    label: string;
    icon: LucideIcon;
  }) => {
    const active = pathname === href || pathname.startsWith(href + "/");
    return (
      <Link
        href={href}
        className={cn(
          "flex items-center gap-3 px-3 py-2.5 rounded-lg text-[13px] font-medium transition-colors duration-150",
          active
            ? "bg-muted text-foreground"
            : "text-muted-foreground hover:bg-muted/80 hover:text-foreground"
        )}
      >
        <Icon
          className={cn("size-[18px] shrink-0", active ? "text-foreground" : "text-muted-foreground")}
          strokeWidth={1.25}
        />
        {label}
      </Link>
    );
  };

  const SidebarContent = () => (
    <div className="flex h-full flex-col">
      <div className="flex items-center px-4 py-4 border-b border-border">
        <Link href="/" className="flex items-center gap-2 text-foreground">
          <ResumifyBrand gradientIdSuffix="shell" />
        </Link>
      </div>

      <nav className="flex-1 px-2 py-3 space-y-5 overflow-y-auto">
        {sidebarNavGroups.map((group) => (
          <div key={group.label}>
            <p className="px-3 mb-1 text-[11px] font-medium uppercase tracking-wide text-muted-foreground/60">
              {group.label}
            </p>
            <div className="space-y-0.5">
              {group.items.map((item) => (
                <NavLink key={item.href} {...item} />
              ))}
            </div>
          </div>
        ))}
      </nav>

      {isPro ? (
        <div className="mx-2 mb-2 rounded-xl border border-primary/15 bg-primary/[0.04] px-3 py-2.5">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2 min-w-0">
              <Crown className="size-3.5 text-primary shrink-0" strokeWidth={1.25} />
              <span className="text-xs font-semibold text-foreground truncate">Full access · Unlimited</span>
            </div>
            <Link
              href="/profile"
              className="text-[11px] text-muted-foreground hover:text-foreground transition-colors shrink-0"
            >
              Billing
            </Link>
          </div>
        </div>
      ) : (
        <div className="mx-2 mb-2 rounded-xl border border-border bg-muted/40 px-3 py-3">
          <p className="text-xs text-muted-foreground mb-2">Upgrade for unlimited optimizations.</p>
          <Link
            href="/pricing"
            className="block text-center text-xs font-medium rounded-full py-2.5 bg-primary text-primary-foreground hover:bg-primary/90 transition-colors"
          >
            View plans
          </Link>
        </div>
      )}

      <div className="border-t border-border px-2 py-2">
        <div className="flex items-center gap-1">
          <Link
            href="/profile"
            className="flex flex-1 min-w-0 items-center gap-2.5 px-2 py-2 rounded-lg hover:bg-muted/80 transition-colors group"
          >
            <div className="size-8 rounded-full bg-muted border border-border flex items-center justify-center shrink-0">
              <span className="text-xs font-medium text-foreground">{userEmail?.[0]?.toUpperCase() ?? "U"}</span>
            </div>
            <div className="flex-1 min-w-0 text-left">
              <p className="text-[13px] font-medium text-foreground truncate">{displayName}</p>
              <p className="text-[11px] text-muted-foreground truncate">{userEmail ?? "Open profile"}</p>
            </div>
            <ChevronRight
              className="size-4 text-muted-foreground/40 group-hover:text-muted-foreground shrink-0 hidden sm:block"
              strokeWidth={1.25}
            />
          </Link>
          <button
            onClick={handleSignOut}
            className="text-muted-foreground hover:text-foreground transition-colors p-2 rounded-md hover:bg-muted shrink-0"
            title="Sign out"
            type="button"
          >
            <LogOut className="size-4" strokeWidth={1.25} />
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-background text-foreground flex" data-app-shell>
      <aside className="hidden lg:flex w-[260px] shrink-0 flex-col fixed inset-y-0 left-0 z-30 border-r border-border bg-[hsl(var(--sidebar))]">
        <SidebarContent />
      </aside>

      {sidebarOpen && (
        <div className="lg:hidden fixed inset-0 z-50 flex">
          <button
            type="button"
            className="absolute inset-0 bg-black/60 backdrop-blur-[2px]"
            onClick={() => setSidebarOpen(false)}
            aria-label="Close menu"
          />
          <aside className="relative w-[min(280px,88vw)] h-full bg-[hsl(var(--sidebar))] border-r border-border flex flex-col z-10 shadow-2xl pt-12">
            <button
              type="button"
              onClick={() => setSidebarOpen(false)}
              className="absolute top-3.5 right-3 text-muted-foreground hover:text-foreground p-1 rounded-md hover:bg-muted"
            >
              <X className="size-5" strokeWidth={1.25} />
            </button>
            <SidebarContent />
          </aside>
        </div>
      )}

      <div className="flex-1 lg:ml-[260px] flex flex-col min-h-screen bg-background">
        <header className="lg:hidden sticky top-0 z-20 flex items-center justify-between px-4 py-3 border-b border-border bg-background/90 backdrop-blur-md">
          <button
            type="button"
            onClick={() => setSidebarOpen(true)}
            className="text-muted-foreground hover:text-foreground p-2 -ml-2 rounded-lg hover:bg-muted/80"
          >
            <Menu className="size-5" strokeWidth={1.25} />
          </button>
          <Link href="/" className="text-foreground">
            <ResumifyBrand gradientIdSuffix="shell-m" className="scale-[0.92]" />
          </Link>
          <Link
            href="/profile"
            className="size-8 rounded-full bg-muted border border-border flex items-center justify-center hover:bg-muted/90 transition-colors"
            aria-label="Profile"
          >
            <span className="text-xs font-medium text-foreground">{userEmail?.[0]?.toUpperCase() ?? "U"}</span>
          </Link>
        </header>

        <main className="flex-1 px-4 py-6 sm:px-6 lg:px-10 lg:py-8">{children}</main>
      </div>
    </div>
  );
}
