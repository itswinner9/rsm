"use client";

import React from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { appNavLinksLoggedIn } from "@/lib/site-nav";

export function FooterAccountLinks() {
  const [loggedIn, setLoggedIn] = React.useState<boolean | null>(null);
  const supabase = createClient();

  React.useEffect(() => {
    supabase.auth.getSession().then(({ data }) => setLoggedIn(!!data.session));
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_e, session) => {
      setLoggedIn(!!session);
    });
    return () => subscription.unsubscribe();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (loggedIn === null) {
    return (
      <ul className="space-y-3">
        {[1, 2, 3].map((i) => (
          <li key={i}>
            <span className="text-muted-foreground/40 text-sm inline-block h-4 w-20 rounded bg-muted animate-pulse" />
          </li>
        ))}
      </ul>
    );
  }

  if (loggedIn) {
    return (
      <ul className="space-y-3">
        {appNavLinksLoggedIn.map((l) => (
          <li key={l.href}>
            <Link
              href={l.href}
              className="text-muted-foreground hover:text-foreground text-sm transition-colors duration-150"
            >
              {l.label}
            </Link>
          </li>
        ))}
      </ul>
    );
  }

  return (
    <ul className="space-y-3">
      {[
        { label: "Sign Up Free", href: "/auth/signup" },
        { label: "Login", href: "/auth/login" },
      ].map((l) => (
        <li key={l.href}>
          <Link
            href={l.href}
            className="text-muted-foreground hover:text-foreground text-sm transition-colors duration-150"
          >
            {l.label}
          </Link>
        </li>
      ))}
    </ul>
  );
}
