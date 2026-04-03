"use client";

import { motion } from "framer-motion";
import { CheckCircle, FileCheck, Layers, GraduationCap, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { stripHtmlFromText } from "@/lib/resume/sanitizeResumeText";

interface ResumeVersion {
  template: string;
  ats_score: number;
  content: string;
  improvements: string[];
}

interface ResumeCardProps {
  version: ResumeVersion;
  index: number;
  isSelected: boolean;
  onSelect: () => void;
  onPreview: () => void;
}

const templateIcons: Record<string, React.ReactNode> = {
  "Classic Canadian ATS": <FileCheck className="size-4" />,
  "Modern Hybrid": <Layers className="size-4" />,
  "Skills-First Entry-Level": <GraduationCap className="size-4" />,
};

export function ResumeCard({ version, index, isSelected, onSelect, onPreview }: ResumeCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.08 }}
      className={cn(
        "relative cursor-pointer rounded-2xl border bg-card p-5 transition-all duration-200",
        isSelected
          ? "border-primary ring-2 ring-primary/20"
          : "border-border hover:border-primary/30 hover:shadow-sm"
      )}
      onClick={onSelect}
    >
      {isSelected && (
        <div className="absolute right-3 top-3">
          <CheckCircle className="size-5 text-primary" />
        </div>
      )}

      <div className="mb-4 flex items-center gap-2.5">
        <div className="flex size-8 items-center justify-center rounded-lg bg-primary/10 border border-primary/15 text-primary">
          {templateIcons[version.template] || <FileText className="size-4" />}
        </div>
        <div>
          <h3 className="text-sm font-semibold text-foreground">{version.template}</h3>
          <p className="text-xs text-muted-foreground">Version {index + 1}</p>
        </div>
        <div className="ml-auto text-right">
          <span className="text-2xl font-bold text-primary">{version.ats_score}%</span>
          <p className="text-xs text-muted-foreground">ATS score</p>
        </div>
      </div>

      <div className="mb-4 h-1.5 overflow-hidden rounded-full bg-secondary">
        <motion.div
          className="h-full rounded-full bg-primary"
          initial={{ width: 0 }}
          animate={{ width: `${version.ats_score}%` }}
          transition={{ duration: 0.85, ease: "easeOut", delay: index * 0.08 + 0.2 }}
        />
      </div>

      <div className="mb-4 space-y-1.5">
        {version.improvements.slice(0, 3).map((imp, i) => (
          <div key={i} className="flex items-start gap-2">
            <span className="mt-0.5 text-xs text-primary">✓</span>
            <span className="text-xs leading-relaxed text-muted-foreground">{imp}</span>
          </div>
        ))}
      </div>

      <div className="mb-4 line-clamp-3 rounded-xl bg-secondary/60 p-3 text-xs leading-relaxed text-muted-foreground whitespace-pre-wrap">
        {(() => {
          const plain = stripHtmlFromText(version.content);
          return plain.length > 200 ? `${plain.slice(0, 200)}…` : plain;
        })()}
      </div>

      <div className="flex gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={(e) => { e.stopPropagation(); onPreview(); }}
          className="flex-1 text-xs"
        >
          Preview
        </Button>
        <Button
          size="sm"
          onClick={(e) => { e.stopPropagation(); onSelect(); }}
          className={cn(
            "flex-1 text-xs",
            isSelected ? "" : "bg-secondary text-foreground hover:bg-secondary/80 border border-border"
          )}
          variant={isSelected ? "default" : "outline"}
        >
          {isSelected ? "Selected" : "Select"}
        </Button>
      </div>
    </motion.div>
  );
}
