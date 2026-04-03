'use client';

import { motion } from 'framer-motion';
import { FileText, Zap, Sparkles, Download, BarChart2, ShieldCheck } from 'lucide-react';

const features = [
    {
        icon: FileText,
        title: 'Smart resume parsing',
        description:
            'Upload PDF or DOCX — we pull roles, skills, and dates so you’re not retyping. More time applying, less time formatting.',
    },
    {
        icon: BarChart2,
        title: 'Keyword match you can act on',
        description:
            'See overlap with the job description before you hit submit. Know what’s working, what’s missing, and what to add only if it’s true.',
    },
    {
        icon: Sparkles,
        title: 'AI that respects your facts',
        description:
            'One optimized resume per job—clearer bullets and JD-aligned phrasing. We don’t invent employers, titles, or credentials.',
    },
    {
        icon: Zap,
        title: 'Three ATS layouts, same story',
        description:
            'Classic, executive, and compact skins on one master resume. Pick the look; PDF and DOCX stay interview-ready.',
    },
    {
        icon: Download,
        title: 'Export and go',
        description:
            'Download PDF or DOCX in one click from any template. No watermarks, no extra tools—just your file, ready to upload.',
    },
    {
        icon: ShieldCheck,
        title: 'Your data, your account',
        description:
            'Hosted on Supabase with row-level security. Your generations and uploads stay tied to your login—not a shared folder.',
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
                        Why Resumify
                    </motion.p>
                    <motion.h2
                        initial={{ opacity: 0, y: 16 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.05 }}
                        className="text-foreground text-3xl sm:text-4xl font-bold tracking-tight mb-4"
                    >
                        Get past the bot, then impress the human
                    </motion.h2>
                    <motion.p
                        initial={{ opacity: 0, y: 16 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.1 }}
                        className="text-muted-foreground text-lg max-w-2xl mx-auto"
                    >
                        Built for real job searches—starting with Canadian resume norms, with ATS logic that applies on Indeed, LinkedIn, and company boards everywhere.
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
