'use client';

import React from 'react'
import Link from 'next/link'
import { ArrowRight, ChevronRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { AnimatedGroup } from '@/components/ui/animated-group'
import { SiteHeader } from '@/components/layout/site-header'
import { useUserSubscription } from '@/hooks/use-user-subscription'
import { cn } from '@/lib/utils'

const transitionVariants = {
    item: {
        hidden: {
            opacity: 0,
            filter: 'blur(12px)',
            y: 12,
        },
        visible: {
            opacity: 1,
            filter: 'blur(0px)',
            y: 0,
            transition: {
                type: 'spring',
                bounce: 0.3,
                duration: 1.5,
            },
        },
    },
}

export function HeroSection() {
    const subscription = useUserSubscription({ stripeSyncBeforeProfile: true })
    const isLoggedIn = subscription.isLoggedIn
    const ctaReady = subscription.authReady && (!isLoggedIn || subscription.profileReady)
    const paid = isLoggedIn && subscription.hasPaidAccess

    const pillHref = !ctaReady
        ? '/auth/signup'
        : !isLoggedIn
          ? '/auth/signup'
          : paid
            ? '/dashboard'
            : '/builder'
    const pillLabel = !ctaReady
        ? 'resumify.cc · First optimization free'
        : !isLoggedIn
          ? 'resumify.cc · First optimization free'
          : paid
            ? 'Welcome back — open dashboard'
            : 'Welcome back — open builder'

    const primaryHref = !ctaReady
        ? '/auth/signup'
        : !isLoggedIn
          ? '/auth/signup'
          : paid
            ? '/dashboard'
            : '/builder'
    const primaryLabel = !ctaReady
        ? 'Build my resume — free'
        : !isLoggedIn
          ? 'Build my resume — free'
          : paid
            ? 'Open dashboard'
            : 'Open resume builder'

    const secondaryLoggedInPaid = paid && ctaReady
    const trustedHref = !ctaReady
        ? '/auth/signup'
        : !isLoggedIn
          ? '/auth/signup'
          : paid
            ? '/dashboard'
            : '/builder'
    const trustedLabel = !ctaReady
        ? 'Start optimizing'
        : !isLoggedIn
          ? 'Start optimizing'
          : paid
            ? 'Continue to dashboard'
            : 'Continue to builder'

    return (
        <>
            <SiteHeader />
            <div className="overflow-hidden">
                <div
                    aria-hidden
                    className="z-[2] absolute inset-0 pointer-events-none isolate opacity-50 contain-strict hidden lg:block">
                    <div className="w-[35rem] h-[80rem] -translate-y-[350px] absolute left-0 top-0 -rotate-45 rounded-full bg-[radial-gradient(68.54%_68.72%_at_55.02%_31.46%,hsla(0,0%,85%,.08)_0,hsla(0,0%,55%,.02)_50%,hsla(0,0%,45%,0)_80%)]" />
                    <div className="h-[80rem] absolute left-0 top-0 w-56 -rotate-45 rounded-full bg-[radial-gradient(50%_50%_at_50%_50%,hsla(0,0%,85%,.06)_0,hsla(0,0%,45%,.02)_80%,transparent_100%)] [translate:5%_-50%]" />
                    <div className="h-[80rem] -translate-y-[350px] absolute left-0 top-0 w-56 -rotate-45 bg-[radial-gradient(50%_50%_at_50%_50%,hsla(0,0%,85%,.04)_0,hsla(0,0%,45%,.02)_80%,transparent_100%)]" />
                </div>
                <section>
                    <div className="relative pt-24 md:pt-36">
                        <AnimatedGroup
                            variants={{
                                container: {
                                    visible: {
                                        transition: {
                                            delayChildren: 1,
                                        },
                                    },
                                },
                                item: {
                                    hidden: {
                                        opacity: 0,
                                        y: 20,
                                    },
                                    visible: {
                                        opacity: 1,
                                        y: 0,
                                        transition: {
                                            type: 'spring',
                                            bounce: 0.3,
                                            duration: 2,
                                        },
                                    },
                                },
                            }}
                            className="absolute inset-0 -z-20">
                            <img
                                src="https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=3276&q=75"
                                alt="background"
                                className="absolute inset-x-0 top-56 -z-20 hidden lg:top-32 lg:block opacity-20"
                                width="3276"
                                height="4095"
                            />
                        </AnimatedGroup>
                        <div aria-hidden className="absolute inset-0 -z-10 size-full [background:radial-gradient(125%_125%_at_50%_100%,transparent_0%,var(--background)_75%)]" />
                        <div className="mx-auto max-w-7xl px-6">
                            <div className="text-center sm:mx-auto lg:mr-auto lg:mt-0">
                                <AnimatedGroup variants={transitionVariants}>
                                    <Link
                                        href={pillHref}
                                        className={cn(
                                            'hover:bg-background bg-muted group mx-auto flex w-fit items-center gap-4 rounded-full border border-border p-1 pl-4 shadow-md shadow-black/5 transition-all duration-300',
                                            !ctaReady && isLoggedIn && 'pointer-events-none opacity-60'
                                        )}
                                        aria-busy={!ctaReady && isLoggedIn}
                                    >
                                        <span className="text-foreground text-sm">
                                            {!ctaReady && isLoggedIn ? 'Loading your plan…' : pillLabel}
                                        </span>
                                        <span className="block h-4 w-0.5 border-l border-border bg-background" />

                                        <div className="bg-background group-hover:bg-muted size-6 overflow-hidden rounded-full duration-500">
                                            <div className="flex w-12 -translate-x-1/2 duration-500 ease-in-out group-hover:translate-x-0">
                                                <span className="flex size-6">
                                                    <ArrowRight className="m-auto size-3" />
                                                </span>
                                                <span className="flex size-6">
                                                    <ArrowRight className="m-auto size-3" />
                                                </span>
                                            </div>
                                        </div>
                                    </Link>

                                    <h1 className="mt-8 max-w-4xl mx-auto text-balance text-6xl md:text-7xl lg:mt-16 xl:text-[5.25rem]">
                                        A resume builder that gets you noticed—without the fluff
                                    </h1>
                                    <p className="mx-auto mt-8 max-w-2xl text-balance text-lg">
                                        Match each posting you care about: keyword overlap with the job text, clearer
                                        wording, professional layouts. Export PDF or DOCX and apply with confidence.
                                    </p>
                                </AnimatedGroup>

                                <AnimatedGroup
                                    variants={{
                                        container: {
                                            visible: {
                                                transition: {
                                                    staggerChildren: 0.05,
                                                    delayChildren: 0.75,
                                                },
                                            },
                                        },
                                        ...transitionVariants,
                                    }}
                                    className="mt-12 flex flex-col items-center justify-center gap-2 md:flex-row">
                                    <div
                                        key={1}
                                        className="bg-foreground/10 rounded-[14px] border p-0.5">
                                        {!ctaReady && isLoggedIn ? (
                                            <Button size="lg" disabled className="rounded-xl px-5 text-base">
                                                <span className="text-nowrap">Loading…</span>
                                            </Button>
                                        ) : (
                                            <Button asChild size="lg" className="rounded-xl px-5 text-base">
                                                <Link href={primaryHref}>
                                                    <span className="text-nowrap">{primaryLabel}</span>
                                                </Link>
                                            </Button>
                                        )}
                                    </div>
                                    {secondaryLoggedInPaid ? (
                                        <Button
                                            key={2}
                                            asChild
                                            size="lg"
                                            variant="ghost"
                                            className="h-10.5 rounded-xl px-5"
                                        >
                                            <Link href="/builder">
                                                <span className="text-nowrap">Resume builder</span>
                                            </Link>
                                        </Button>
                                    ) : (
                                        <Button
                                            key={2}
                                            asChild
                                            size="lg"
                                            variant="ghost"
                                            className="h-10.5 rounded-xl px-5"
                                        >
                                            <Link href="/pricing">
                                                <span className="text-nowrap">See plans</span>
                                            </Link>
                                        </Button>
                                    )}
                                </AnimatedGroup>
                            </div>
                        </div>

                        <AnimatedGroup
                            variants={{
                                container: {
                                    visible: {
                                        transition: {
                                            staggerChildren: 0.05,
                                            delayChildren: 0.75,
                                        },
                                    },
                                },
                                ...transitionVariants,
                            }}>
                            <div className="relative -mr-56 mt-8 overflow-hidden px-2 sm:mr-0 sm:mt-12 md:mt-20">
                                <div
                                    aria-hidden
                                    className="bg-gradient-to-b to-background absolute inset-0 z-10 from-transparent from-35%"
                                />
                                <div className="ring-background bg-background relative mx-auto max-w-6xl overflow-hidden rounded-2xl border border-border shadow-lg shadow-black/[0.08] ring-1 ring-border/60">
                                    <AppMockup />
                                </div>
                            </div>
                        </AnimatedGroup>
                    </div>
                </section>
                <section className="bg-background pb-16 pt-16 md:pb-32">
                    <div className="m-auto max-w-3xl px-6 text-center">
                        <p className="text-muted-foreground text-xs font-medium uppercase tracking-widest mb-4">
                            Who it&apos;s for
                        </p>
                        <p className="text-muted-foreground text-sm leading-relaxed">
                            People applying across Canada—and anywhere online—for roles in tech, operations, skilled
                            trades, healthcare, public sector, and more. Company names on job boards aren&apos;t
                            endorsements of Resumify; we help you align your real experience to the posting you paste.
                        </p>
                        <div className="mt-8 flex flex-wrap justify-center gap-2">
                            {['Tech & product', 'Operations', 'Skilled trades', 'Healthcare', 'Public sector', 'Professional services'].map(
                                (label) => (
                                    <span
                                        key={label}
                                        className="rounded-full border border-border/80 bg-muted/40 px-3 py-1.5 text-xs font-medium text-muted-foreground"
                                    >
                                        {label}
                                    </span>
                                )
                            )}
                        </div>
                        <div className="mt-8">
                            <Link
                                href={trustedHref}
                                className={cn(
                                    'inline-flex items-center text-sm font-medium text-primary hover:underline underline-offset-4',
                                    !ctaReady && isLoggedIn && 'pointer-events-none opacity-50'
                                )}
                            >
                                {!ctaReady && isLoggedIn ? 'Loading…' : trustedLabel}
                                <ChevronRight className="ml-1 inline-block size-3" />
                            </Link>
                        </div>
                    </div>
                </section>
            </div>
        </>
    )
}

const AppMockup = () => (
    <div className="bg-[#f8f9fb] rounded-2xl p-6 min-h-[340px]">
        {/* Top bar */}
        <div className="flex items-center gap-2 mb-6">
            <div className="flex gap-1.5">
                <div className="w-3 h-3 rounded-full bg-red-400/70" />
                <div className="w-3 h-3 rounded-full bg-yellow-400/70" />
                <div className="w-3 h-3 rounded-full bg-green-400/70" />
            </div>
            <div className="flex-1 bg-white border border-gray-200 rounded-full h-6 mx-4 flex items-center px-3">
                <span className="text-gray-400 text-xs">resumify.cc/builder</span>
            </div>
        </div>
        {/* App layout */}
        <div className="grid grid-cols-5 gap-4">
            {/* Left panel */}
            <div className="col-span-2 space-y-3">
                <div className="border border-dashed border-primary/30 rounded-xl p-4 bg-primary/5 text-center">
                    <div className="w-8 h-8 bg-primary/10 rounded-lg mx-auto mb-2 flex items-center justify-center">
                        <div className="w-4 h-4 border-2 border-primary/40 rounded" />
                    </div>
                    <div className="h-2 bg-primary/20 rounded-full w-24 mx-auto mb-1" />
                    <div className="h-1.5 bg-gray-200 rounded-full w-16 mx-auto" />
                </div>
                <div className="border border-gray-200 rounded-xl p-3 bg-white">
                    <div className="h-1.5 bg-gray-200 rounded w-20 mb-2" />
                    <div className="space-y-1.5">
                        {[1,0.9,0.7,1,0.8].map((w,i) => (
                            <div key={i} className="h-1.5 bg-gray-100 rounded" style={{width:`${w*100}%`}} />
                        ))}
                    </div>
                </div>
                <div className="bg-primary rounded-xl py-2.5 text-center">
                    <div className="h-2 bg-white/30 rounded w-28 mx-auto" />
                </div>
            </div>
            {/* Right panel */}
            <div className="col-span-3 space-y-3">
                <div className="flex gap-2">
                    {[
                        { score: '92%', w: 'w-[92%]' },
                        { score: '88%', w: 'w-[88%]' },
                        { score: '85%', w: 'w-[85%]' },
                    ].map((v) => (
                        <div key={v.score} className="flex-1 bg-white rounded-xl p-3 border border-gray-200">
                            <div className="text-sm font-bold text-primary mb-1">{v.score}</div>
                            <div className="h-1 bg-gray-100 rounded-full mb-2">
                                <div className={`h-full bg-primary rounded-full ${v.w}`} />
                            </div>
                            <div className="h-1.5 bg-gray-100 rounded w-full mb-1" />
                            <div className="h-1.5 bg-gray-100 rounded w-3/4" />
                        </div>
                    ))}
                </div>
                <div className="bg-white rounded-xl p-3 border border-gray-200">
                    <div className="h-1.5 bg-gray-200 rounded w-24 mb-2" />
                    <div className="flex flex-wrap gap-1.5">
                        {['Project Mgmt', 'AutoCAD', 'Safety', 'Agile', 'AWS'].map((kw) => (
                            <span key={kw} className="px-2 py-0.5 bg-primary/8 border border-primary/20 rounded-full text-primary text-[10px]">{kw}</span>
                        ))}
                    </div>
                </div>
                <div className="flex items-center gap-2 bg-white rounded-xl p-2.5 border border-gray-200">
                    <div className="h-2 bg-gray-100 rounded flex-1" />
                    <div className="bg-primary rounded-lg px-3 py-1.5">
                        <div className="h-1.5 bg-white/30 rounded w-16" />
                    </div>
                </div>
            </div>
        </div>
    </div>
)
