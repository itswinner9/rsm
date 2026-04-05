'use client';

import { motion } from 'framer-motion';
import { FileText, Zap, Sparkles, Download, BarChart2, ShieldCheck } from 'lucide-react';

const features = [
    {
        icon: FileText,
        title: 'Smart parsing',
        description:
            'Drop in PDF or DOCX—we surface roles, skills, and dates so you skip retyping. Spend time on applications, not formatting.',
    },
    {
        icon: BarChart2,
        title: 'Keyword match you can use',
        description:
            'See overlap with the posting before you submit. Spot gaps, add what’s true, and skip the guesswork.',
    },
    {
        icon: Sparkles,
        title: 'AI that keeps your facts',
        description:
            'One tailored resume per job: sharper bullets and phrasing aligned to the role. We don’t invent employers, titles, or credentials.',
    },
    {
        icon: Zap,
        title: 'Layouts that fit the same story',
        description:
            'Swap looks on one optimized resume. Pick a layout; PDF and DOCX stay polished for upload.',
    },
    {
        icon: Download,
        title: 'Export in one click',
        description:
            'PDF or DOCX from any template—no watermarks, no extra tools. Your file, ready for Indeed, LinkedIn, or the company site.',
    },
    {
        icon: ShieldCheck,
        title: 'Your account, your data',
        description:
            'Hosted with row-level security. Generations and uploads stay under your login—never a shared folder.',
    },
];

export function FeaturesSection() {
    return (
        <section id="features" className="bg-background py-24 px-4 sm:px-6 lg:px-8 border-t border-border/50">
            <div className="mx-auto max-w-6xl">
                <div className="text-center mb-16">
                    <motion.p
                        initial={{ opacity: 0, y: 10 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        className="text-muted-foreground text-xs uppercase tracking-widest font-medium mb-4"
                    >
                        Why choose Resumify
                    </motion.p>
                    <motion.h2
                        initial={{ opacity: 0, y: 16 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.05 }}
                        className="text-foreground text-3xl sm:text-4xl font-bold tracking-tight mb-4"
                    >
                        Readable for humans—aligned to the job you paste
                    </motion.h2>
                    <motion.p
                        initial={{ opacity: 0, y: 16 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.1 }}
                        className="text-muted-foreground text-lg max-w-2xl mx-auto"
                    >
                        Built for real searches—Canadian norms first, works for Indeed, LinkedIn, and company career pages.
                        Every employer screens differently; we help you mirror the posting you paste—honestly.
                    </motion.p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                    {features.map((f, i) => (
                        <motion.div
                            key={f.title}
                            initial={{ opacity: 0, y: 24 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: i * 0.07 }}
                            className="bg-card border border-border rounded-2xl p-6 hover:border-primary/20 hover:shadow-sm transition-all duration-200"
                        >
                            <div className="inline-flex w-10 h-10 rounded-xl border border-primary/20 bg-primary/8 items-center justify-center mb-4">
                                <f.icon className="w-5 h-5 text-primary" />
                            </div>
                            <h3 className="text-foreground font-semibold mb-2">{f.title}</h3>
                            <p className="text-muted-foreground text-sm leading-relaxed">{f.description}</p>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    );
}
