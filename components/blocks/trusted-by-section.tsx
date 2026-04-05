"use client";

import { Sparkles } from "@/components/ui/sparkles";
import { InfiniteSlider } from "@/components/ui/infinite-slider";
import { ProgressiveBlur } from "@/components/ui/progressive-blur";

// Company logos as inline SVGs
const logos = [
  {
    id: "shopify",
    name: "Shopify",
    svg: (
      <svg viewBox="0 0 120 40" fill="currentColor" className="h-6 w-auto">
        <path d="M26.3 8.3c0-.2-.2-.3-.3-.3-.2 0-3.3-.2-3.3-.2s-2.2-2.1-2.4-2.3c-.2-.2-.7-.1-.9-.1L17.9 6c-.5-1.4-1.3-2.7-2.8-2.7h-.2C14.4 2.5 13.7 2 13 2c-5.4 0-8 6.7-8.8 10.1l-3.8 1.2c-1.2.4-1.2.4-1.3 1.5L0 34.4l21.1 4 11.3-2.4L26.3 8.3zm-8-1.8c-1.1.4-2.3.7-3.6 1.1.7-2.6 2-3.8 3.1-4.3.3 1 .5 2.2.5 3.2zm-2.2-4.1c.2 0 .4.1.6.2-1.4.7-2.9 2.4-3.5 5.8l-2.7.8C11.3 5.9 13.3 2.4 16.1 2.4zM13.1 17c.2 0 3.5-.5 3.5-.5l.2-2.2s-1.4.1-2.9.3c.1-1 .1-1.8.2-2.3.5 0 2.8-.3 2.8-.3V9.8s-2.8.3-3 .3c-.6-1.9-1.8-2.2-1.8-2.2L11 19.9s1.9-.6 2.1-.6v-2.3z"/>
        <path d="M36 12.5c-1.8-.5-2.7-.7-2.7-1.5 0-.6.6-1 1.5-1 1 0 1.9.4 2.8 1l1.5-2.3C38 7.8 36.7 7 35 7c-2.7 0-4.5 1.6-4.5 3.9 0 2.1 1.4 3 3.3 3.6 1.7.5 2.4.8 2.4 1.6 0 .7-.6 1.1-1.6 1.1-1.2 0-2.4-.6-3.4-1.5l-1.6 2.2c1.2 1.2 2.9 1.8 4.8 1.8 2.9 0 4.7-1.5 4.7-4 .1-2.3-1.5-3.3-3.1-3.7zM45.4 7c-1.5 0-2.7.7-3.5 1.9V7.2h-3v12.4h3v-6.9c0-1.5.8-2.3 2-2.3s1.8.8 1.8 2.3v6.9h3v-7.5C48.7 8.8 47.4 7 45.4 7zM55.7 7c-3.6 0-6 2.6-6 6.5 0 3.8 2.3 6.3 5.8 6.3 1.8 0 3.2-.6 4.3-1.8l-1.8-1.9c-.7.7-1.5 1.1-2.4 1.1-1.5 0-2.5-.9-2.7-2.5h7.2c0-.4.1-.8.1-1.2C60 9.5 58.4 7 55.7 7zm-2.8 5.2c.2-1.5 1-2.6 2.5-2.6 1.4 0 2.2 1 2.3 2.6h-4.8zM67 7c-3.6 0-6 2.6-6 6.5 0 3.8 2.3 6.3 5.8 6.3 1.8 0 3.2-.6 4.3-1.8l-1.8-1.9c-.7.7-1.5 1.1-2.4 1.1-1.5 0-2.5-.9-2.7-2.5h7.2c0-.4.1-.8.1-1.2C71.5 9.5 69.8 7 67 7zm-2.7 5.2c.2-1.5 1-2.6 2.5-2.6 1.4 0 2.2 1 2.3 2.6h-4.8zM80.6 7.2v1.7C79.8 7.8 78.6 7 77 7c-3.1 0-5.3 2.7-5.3 6.5s2.2 6.3 5.3 6.3c1.6 0 2.8-.8 3.6-1.8v1.5h3V7.2h-3zm-3 9.8c-1.5 0-2.5-1.2-2.5-3.5s1-3.6 2.5-3.6 2.5 1.2 2.5 3.6-1 3.5-2.5 3.5zM91.5 7c-1.5 0-2.7.7-3.5 1.9V7.2h-3v12.4h3v-6.9c0-1.5.8-2.3 2-2.3s1.8.8 1.8 2.3v6.9h3v-7.5C94.8 8.8 93.5 7 91.5 7z"/>
      </svg>
    ),
  },
  {
    id: "indeed",
    name: "Indeed",
    svg: (
      <svg viewBox="0 0 100 36" fill="currentColor" className="h-6 w-auto">
        <path d="M15.5 8.5c2.5 0 4.5-2 4.5-4.5S18 0 15.5 0 11 2 11 4.5s2 4 4.5 4zM12 11h7v23h-7V11zM29 11h-6v23h7V23c0-3.5 1.5-5.5 4.5-5.5 2.5 0 3.5 1.5 3.5 4.5v11h7V21c0-6.5-3-10.5-9-10.5-3 0-5.5 1.5-7 3.5V11zM53 33.5c-3 0-5.5-1-7-3l-4 4c2.5 2.5 6 4 11 4 6.5 0 11-3.5 11-9 0-4.5-3-7-8-8l-3-.5c-2-.5-3-1-3-2.5 0-1.5 1.5-2.5 3.5-2.5 2.5 0 4.5.5 6.5 2l3.5-4c-2.5-2-5.5-3-10-3-6 0-10 3.5-10 8.5 0 4.5 3 7 7.5 7.5l3 .5c2.5.5 3.5 1.5 3.5 3 0 1.5-1.5 3-4.5 3zM78 11.5c-7 0-12 5-12 12s5 12 12.5 12c4.5 0 8-1.5 10.5-4.5l-4.5-4c-1.5 1.5-3.5 2.5-6 2.5-3 0-5.5-1.5-6.5-4.5h18V24c0-7.5-4.5-12.5-12-12.5zm-6 10c.5-3.5 2.5-5 5.5-5s5 2 5 5H72z"/>
      </svg>
    ),
  },
  {
    id: "linkedin",
    name: "LinkedIn",
    svg: (
      <svg viewBox="0 0 110 30" fill="currentColor" className="h-6 w-auto">
        <path d="M0 2.1C0 .9.9 0 2.2 0h5.6C9 0 10 .9 10 2.1v5.8C10 9.1 9 10 7.8 10H2.2C1 10 0 9.1 0 7.9V2.1zM0 14h10v16H0V14zM14 14h9.6v2.2c1.4-2.1 3.7-2.7 5.9-2.7C34 13.5 38 16.7 38 23.2V30H28.4V24.1c0-2.5-.9-3.8-2.7-3.8s-2.8 1.3-2.8 3.8V30H14V14zM40 22c0-4.9 3.5-8.5 8.5-8.5 2.5 0 4.6 1 5.8 2.8V14H64v16h-9.7v-2.3c-1.2 1.7-3.3 2.8-5.8 2.8-5 0-8.5-3.5-8.5-8.5zm14.6 0c0-1.9-1.3-3.2-3-3.2-1.8 0-3 1.3-3 3.2s1.2 3.2 3 3.2c1.7 0 3-1.3 3-3.2zM66 14h9.7v2.2C77 14.5 79 14 81.5 14c5.5 0 8.5 3.5 8.5 9.5V30H80.3V24.5c0-2.9-1-4.5-3-4.5-2.2 0-3.3 1.6-3.3 4.8V30H64.3V14zM92 2.1C92 .9 93 0 94.2 0h13.6C109 0 110 .9 110 2.1v2.8C110 6.1 109 7 107.8 7h-13.6C93 7 92 6.1 92 4.9V2.1zM92 14h10v16H92V14z"/>
      </svg>
    ),
  },
  {
    id: "workday",
    name: "Workday",
    svg: (
      <svg viewBox="0 0 130 32" fill="currentColor" className="h-5 w-auto">
        <path d="M8 4L0 28h7l4.5-15.5L17 28h5L28 4h-7l-4 13.5L12.5 4H8zM32 4v24h7V18h8v10h7V4h-7v9h-8V4h-7zM60 4v24h18v-5H67v-5h9v-5h-9V9h11V4H60zM83 4v24h9c7 0 12-4.5 12-12S99 4 92 4h-9zm7 5h2c3.5 0 5.5 2.5 5.5 7s-2 7-5.5 7H90V9zM107 4l8 14.5V28h7V18.5L130 4h-7.5l-4.5 9-4.5-9H107z"/>
      </svg>
    ),
  },
  {
    id: "glassdoor",
    name: "Glassdoor",
    svg: (
      <svg viewBox="0 0 140 32" fill="currentColor" className="h-6 w-auto">
        <path d="M16 0C7.2 0 0 7.2 0 16s7.2 16 16 16 16-7.2 16-16S24.8 0 16 0zm6.2 22.5H9.8v-3h12.4v3zm0-5H9.8c0-1 .4-1.9 1-2.7.7-.8 1.5-1.4 2.4-1.8l2-1c.8-.4 1.4-.8 1.8-1.3.4-.5.6-1.1.6-1.8s-.3-1.2-.9-1.6-1.3-.6-2.3-.6c-1 0-1.8.2-2.4.7-.6.5-.9 1.1-.9 1.9H9.8c0-1.7.6-3 1.8-4C12.8 4.9 14.3 4.3 16 4.3c2 0 3.6.5 4.7 1.4 1.1.9 1.7 2.2 1.7 3.8 0 1.2-.3 2.2-1 3-.7.8-1.7 1.5-3 2.1l-1.8.9c-.6.3-1.1.7-1.4 1h7v3z"/>
        <path d="M40 6.5h5.5c2.5 0 4.2.6 5.2 1.7 1 1.1 1.5 2.8 1.5 5V16c0 2.2-.5 3.9-1.5 5-1 1.1-2.7 1.7-5.2 1.7H40V6.5zm3 2.8v10.6h2.2c1.4 0 2.4-.4 3-.1.6-.7.9-1.9.9-3.5v-2.4c0-1.6-.3-2.7-.9-3.5-.6-.7-1.6-1.1-3-1.1H43zM55 22.7V6.5h3v16.2h-3zM60.5 17.1c0-1.9.5-3.4 1.5-4.4 1-.9 2.5-1.4 4.4-1.4s3.4.5 4.4 1.4c1 .9 1.5 2.4 1.5 4.4V18c0 1.9-.5 3.4-1.5 4.4-1 .9-2.5 1.4-4.4 1.4s-3.4-.5-4.4-1.4c-1-.9-1.5-2.4-1.5-4.4v-.9zm3 .9c0 1.1.2 2 .7 2.5.5.6 1.2.9 2.2.9s1.7-.3 2.2-.9c.5-.6.7-1.4.7-2.5v-.9c0-1.1-.2-2-.7-2.5-.5-.6-1.2-.9-2.2-.9s-1.7.3-2.2.9c-.5.6-.7 1.4-.7 2.5v.9zM80 22.7l-3.4-11h3l2 7.6 2-7.6h2.8l2 7.6 2-7.6h3l-3.4 11h-2.8l-2.1-7.4-2.1 7.4H80zM96.5 22.7V11.7h3v1.5c.6-1.1 1.7-1.7 3.3-1.7.3 0 .6 0 .9.1v2.8c-.4-.1-.8-.1-1.2-.1-1.8 0-2.8.9-2.8 2.6v5.8h-3zM112 22.7V21c-.7 1.3-1.9 1.9-3.5 1.9-1.3 0-2.3-.4-3-1.2-.7-.8-1-1.9-1-3.4v-6.6h3v6.4c0 1.8.7 2.7 2.1 2.7 1.5 0 2.2-1 2.2-3.1v-6h3v11h-2.8zM117.5 22.7V6.5h3v6.8c.7-1.1 1.8-1.6 3.4-1.6 1.5 0 2.6.5 3.5 1.5.8 1 1.2 2.5 1.2 4.4v.9c0 1.9-.4 3.4-1.2 4.4-.8 1-2 1.5-3.5 1.5-1.6 0-2.7-.6-3.4-1.7v1.6h-3zm3-5.4c0 1.2.2 2 .6 2.6.4.5 1 .8 1.9.8.8 0 1.5-.3 1.9-.9.4-.6.6-1.5.6-2.5v-1c0-1-.2-1.9-.6-2.5-.4-.6-1.1-.9-1.9-.9-.8 0-1.5.3-1.9.8-.4.5-.6 1.4-.6 2.6v1zM130 20c0-1.1.4-1.9 1.2-2.5.8-.6 1.9-1 3.3-1.2l2.6-.4v-.5c0-1.2-.7-1.8-2-1.8-.6 0-1 .1-1.4.4-.4.3-.6.7-.6 1.2h-2.8c0-1.2.5-2.2 1.5-2.9s2.1-1.1 3.5-1.1c1.6 0 2.8.4 3.7 1.1.9.7 1.3 1.8 1.3 3.2v5.2c0 .8.1 1.5.3 2h-3c-.1-.3-.2-.9-.2-1.7-.8 1.3-2 1.9-3.7 1.9-1.1 0-2-.3-2.7-.9-.7-.6-1-1.4-1-2.4zm4.3 1.4c.8 0 1.5-.2 2-.7.5-.5.8-1.1.8-1.9v-.9l-2 .3c-1.4.2-2.2.7-2.2 1.7 0 .4.2.8.5 1 .4.3.8.5 1.3.5z"/>
      </svg>
    ),
  },
];

export function TrustedBySection() {
  return (
    <section className="relative py-16 overflow-hidden">
      {/* Sparkle background glow */}
      <div className="relative h-[280px] w-full overflow-hidden [mask-image:radial-gradient(ellipse_50%_50%_at_50%_50%,white,transparent)]">
        <div className="absolute inset-0 before:absolute before:inset-0 before:bg-[radial-gradient(circle_at_bottom_center,hsl(var(--primary)/.25),transparent_65%)]" />
        <div className="absolute -left-1/2 top-1/2 aspect-[1/0.7] z-10 w-[200%] rounded-[100%] border-t border-border/60 bg-background" />
        <Sparkles
          density={800}
          speed={0.6}
          className="absolute inset-x-0 bottom-0 h-full w-full [mask-image:radial-gradient(ellipse_50%_50%_at_50%_50%,white,transparent_85%)]"
          color="hsl(var(--primary))"
          opacity={0.5}
        />
      </div>

      {/* Content overlaid on the sparkle section */}
      <div className="absolute inset-0 flex flex-col items-center justify-center px-4 pb-8">
        <p className="text-center text-sm font-medium text-muted-foreground mb-2 uppercase tracking-widest">
          Where people actually apply
        </p>
        <h2 className="text-center text-2xl sm:text-3xl font-bold text-foreground mb-8">
          Boards and brands you already use
        </h2>

        <div className="relative w-full max-w-3xl">
          <InfiniteSlider className="flex h-12 w-full items-center" duration={30} gap={56}>
            {logos.map(({ id, name, svg }) => (
              <div
                key={id}
                className="flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors"
                title={name}
              >
                {svg}
              </div>
            ))}
          </InfiniteSlider>

          <ProgressiveBlur
            className="pointer-events-none absolute top-0 left-0 h-full w-[120px]"
            direction="left"
            blurIntensity={0.6}
          />
          <ProgressiveBlur
            className="pointer-events-none absolute top-0 right-0 h-full w-[120px]"
            direction="right"
            blurIntensity={0.6}
          />
        </div>
      </div>
    </section>
  );
}
