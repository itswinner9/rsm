'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { ArrowRight, Upload, ClipboardList, Sparkles, Download } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

const steps = [
    {
        number: '01',
        icon: Upload,
        title: 'Upload your resume',
        description:
            'PDF, DOCX, or paste text. We extract roles, skills, and dates so you start from what you already have—no blank-page panic.',
    },
    {
        number: '02',
        icon: ClipboardList,
        title: 'Paste the job description',
        description:
            'Drop in the full posting from LinkedIn, Indeed, or the company site. Better JD text = better keyword alignment and a truer match score.',
    },
    {
        number: '03',
        icon: Sparkles,
        title: 'Get one tailored resume + insights',
        description:
            'Resumify rewrites one ATS-focused master resume for that role, shows honest gaps and strengths, then previews it in three professional layouts.',
    },
    {
        number: '04',
        icon: Download,
        title: 'Choose a layout & export',
        description:
            'Compare five layouts (classic through minimal). Export PDF or DOCX from whichever look you like—the content stays the same, optimized for scanners and recruiters.',
    },
];

const container = {
    hidden: { opacity: 0 },
    show: {
        opacity: 1,
        transition: { staggerChildren: 0.08, delayChildren: 0.06 },
    },
};

const item = {
    hidden: { opacity: 0, y: 16 },
    show: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 380, damping: 28 } },
};

export function HowItWorksSection() {
    return (
        <section
            id="how-it-works"
            className="relative border-t border-border/60 bg-gradient-to-b from-muted/40 via-background to-background py-20 sm:py-28"
        >
            <div
                aria-hidden
                className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-primary/25 to-transparent"
            />
            <div className="relative mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
                <div className="mx-auto mb-14 max-w-2xl text-center sm:mb-16">
                    <motion.p
                        initial={{ opacity: 0, y: 8 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true, margin: '-40px' }}
                        className="mb-3 inline-flex items-center gap-2 rounded-full border border-primary/15 bg-primary/[0.06] px-3 py-1 text-xs font-medium text-primary"
                    >
                        <span className="size-1.5 rounded-full bg-primary shadow-[0_0_8px_hsl(var(--primary)/0.6)]" />
                        How it works
                    </motion.p>
                    <motion.h2
                        initial={{ opacity: 0, y: 12 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true, margin: '-40px' }}
                        transition={{ delay: 0.05 }}
                        className="text-balance text-3xl font-semibold tracking-tight text-foreground sm:text-4xl"
                    >
                        From upload to “ready to apply” in minutes
                    </motion.h2>
                    <motion.p
                        initial={{ opacity: 0, y: 12 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true, margin: '-40px' }}
                        transition={{ delay: 0.1 }}
                        className="mt-4 text-pretty text-base leading-relaxed text-muted-foreground sm:text-lg"
                    >
                        No templates to fight. Paste a job, review your score and insights, then send a file you trust.
                    </motion.p>
                </div>

                <motion.div
                    variants={container}
                    initial="hidden"
                    whileInView="show"
                    viewport={{ once: true, margin: '-60px' }}
                    className="grid gap-5 sm:gap-6 md:grid-cols-2"
                >
                    {steps.map((step) => (
                        <motion.article
                            key={step.number}
                            variants={item}
                            className={cn(
                                'group relative overflow-hidden rounded-2xl border border-border/80 bg-card/90 p-6 shadow-sm',
                                'transition-all duration-300 hover:border-primary/20 hover:shadow-md hover:shadow-primary/[0.04]'
                            )}
                        >
                            <div
                                aria-hidden
                                className="pointer-events-none absolute -right-6 -top-8 select-none font-mono text-[5.5rem] font-bold leading-none text-primary/[0.06] transition-colors group-hover:text-primary/[0.09] sm:text-[6rem]"
                            >
                                {step.number}
                            </div>
                            <div className="relative flex gap-4">
                                <div
                                    className={cn(
                                        'flex size-12 shrink-0 items-center justify-center rounded-xl',
                                        'border border-primary/15 bg-gradient-to-br from-primary/12 to-teal-500/10',
                                        'text-primary shadow-sm'
                                    )}
                                >
                                    <step.icon className="size-5" strokeWidth={1.75} aria-hidden />
                                </div>
                                <div className="min-w-0 flex-1 pt-0.5">
                                    <p className="mb-1 font-mono text-[11px] font-semibold uppercase tracking-[0.16em] text-primary/90">
                                        {step.number}
                                    </p>
                                    <h3 className="text-lg font-semibold leading-snug tracking-tight text-foreground sm:text-xl">
                                        {step.title}
                                    </h3>
                                    <p className="mt-2.5 text-sm leading-relaxed text-muted-foreground sm:text-[15px]">
                                        {step.description}
                                    </p>
                                </div>
                            </div>
                        </motion.article>
                    ))}
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, y: 16 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.15 }}
                    className="mt-12 flex justify-center sm:mt-14"
                >
                    <Button asChild size="lg" className="h-12 rounded-full px-8 text-base font-medium shadow-sm">
                        <Link href="/auth/signup">
                            Try it free — no card needed
                            <ArrowRight className="ml-2 size-4" />
                        </Link>
                    </Button>
                </motion.div>
            </div>
        </section>
    );
}
