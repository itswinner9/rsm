"use client";

import { useMemo } from "react";
import { TrendingUp } from "lucide-react";

export type AtsTrendPoint = {
  date: string;
  optimized: number | null;
};

const MAX_POINTS = 20;

export function AtsTrendMini({ points }: { points: AtsTrendPoint[] }) {
  const { display, pathD, areaD } = useMemo(() => {
    const slice = points.slice(-MAX_POINTS);
    if (slice.length === 0) {
      return { display: [] as AtsTrendPoint[], pathD: "", areaD: "" };
    }
    const vals = slice.map((p) => (typeof p.optimized === "number" && p.optimized >= 0 ? p.optimized : 0));
    const max = Math.max(100, ...vals, 1);
    const w = 320;
    const h = 80;
    const pad = 8;
    const innerW = w - pad * 2;
    const innerH = h - pad * 2;
    const n = slice.length;
    const bottom = pad + innerH;
    const coords = slice.map((p, i) => {
      const v = typeof p.optimized === "number" && p.optimized >= 0 ? p.optimized : 0;
      const x = pad + (n <= 1 ? innerW / 2 : (i / (n - 1)) * innerW);
      const y = pad + innerH - (v / max) * innerH;
      return { x, y, v };
    });
    const d =
      coords.length === 0
        ? ""
        : coords.length === 1
          ? `M ${coords[0].x} ${coords[0].y}`
          : coords.map((c, i) => `${i === 0 ? "M" : "L"} ${c.x.toFixed(1)} ${c.y.toFixed(1)}`).join(" ");
    const first = coords[0];
    const last = coords[coords.length - 1];
    const area =
      d && first && last ? `${d} L ${last.x.toFixed(1)} ${bottom} L ${first.x.toFixed(1)} ${bottom} Z` : "";
    return {
      display: slice,
      pathD: d,
      areaD: area,
    };
  }, [points]);

  if (display.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-border bg-muted/20 px-4 py-8 text-center text-sm text-muted-foreground">
        Run the builder to see match scores here.
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-border bg-card p-4">
      <div className="flex items-center justify-between gap-2 mb-3">
        <div className="flex items-center gap-2">
          <div className="flex size-8 items-center justify-center rounded-lg bg-primary/10 text-primary">
            <TrendingUp className="size-4" strokeWidth={1.5} />
          </div>
          <div>
            <p className="text-sm font-medium text-foreground">Match score by run</p>
            <p className="text-xs text-muted-foreground">Each point is one optimization (oldest → newest).</p>
          </div>
        </div>
      </div>
      <div className="relative w-full overflow-hidden rounded-lg bg-muted/30">
        <svg
          viewBox="0 0 320 80"
          className="w-full h-[88px] text-primary"
          preserveAspectRatio="none"
          aria-hidden
        >
          <defs>
            <linearGradient id="atsFill" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity="0.2" />
              <stop offset="100%" stopColor="hsl(var(--primary))" stopOpacity="0" />
            </linearGradient>
          </defs>
          {pathD && areaD ? (
            <>
              <path d={areaD} fill="url(#atsFill)" />
              <path
                d={pathD}
                fill="none"
                stroke="hsl(var(--primary))"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                vectorEffect="non-scaling-stroke"
              />
            </>
          ) : null}
        </svg>
      </div>
      <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-[11px] text-muted-foreground">
        <span>
          Latest:{" "}
          <span className="font-medium text-foreground tabular-nums">
            {display[display.length - 1]?.optimized != null ? `${display[display.length - 1].optimized}%` : "—"}
          </span>
        </span>
        <span>
          Runs shown: <span className="font-medium text-foreground">{display.length}</span>
        </span>
      </div>
    </div>
  );
}
