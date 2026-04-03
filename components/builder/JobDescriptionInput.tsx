"use client";

import { useState } from "react";
import { Briefcase, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface JobDescriptionInputProps {
  jobTitle: string;
  onJobTitleChange: (value: string) => void;
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
}

const MAX_CHARS = 5000;

export function JobDescriptionInput({
  jobTitle,
  onJobTitleChange,
  value,
  onChange,
  disabled,
}: JobDescriptionInputProps) {
  const [focused, setFocused] = useState(false);
  const charCount = value.length;
  const isNearLimit = charCount > MAX_CHARS * 0.9;

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="job-title" className="text-sm text-muted-foreground">
          Job title
        </Label>
        <Input
          id="job-title"
          type="text"
          placeholder="e.g. Line Cook, Project Manager"
          value={jobTitle}
          onChange={(e) => onJobTitleChange(e.target.value.slice(0, 120))}
          disabled={disabled}
          className="rounded-2xl border-border bg-card text-foreground placeholder:text-muted-foreground/50 h-11"
        />
        <p className="text-xs text-muted-foreground">Helps weight keywords for your match score.</p>
      </div>

      <div
        className={cn(
          "relative border rounded-2xl transition-all duration-200 bg-card/80",
          focused ? "border-border ring-1 ring-ring/40" : "border-border",
          disabled && "opacity-60"
        )}
      >
        <div className="flex items-center gap-2 px-4 pt-4 pb-2 border-b border-border">
          <Briefcase className="w-4 h-4 text-muted-foreground shrink-0" strokeWidth={1.25} />
          <span className="text-sm font-medium text-muted-foreground">Job description</span>
          {value && (
            <button
              type="button"
              onClick={() => onChange("")}
              className="ml-auto text-muted-foreground/50 hover:text-foreground transition-colors p-1 rounded-md hover:bg-muted"
              disabled={disabled}
            >
              <X className="w-3.5 h-3.5" strokeWidth={1.25} />
            </button>
          )}
        </div>

        <textarea
          value={value}
          onChange={(e) => onChange(e.target.value.slice(0, MAX_CHARS))}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          disabled={disabled}
          placeholder="Paste the full job posting here — role, requirements, skills, and responsibilities."
          className={cn(
            "w-full bg-transparent text-foreground placeholder:text-muted-foreground/45 text-sm",
            "px-4 py-3 resize-none outline-none min-h-[200px]"
          )}
          rows={10}
        />

        <div
          className={cn(
            "flex justify-end px-4 pb-3 text-xs",
            isNearLimit ? "text-amber-400/90" : "text-muted-foreground/60"
          )}
        >
          {charCount.toLocaleString()} / {MAX_CHARS.toLocaleString()}
        </div>
      </div>

      {!value && (
        <div className="grid grid-cols-2 gap-2">
          {[
            { title: "Senior Software Engineer", company: "Google" },
            { title: "Product Manager", company: "Stripe" },
            { title: "Data Scientist", company: "OpenAI" },
            { title: "UX Designer", company: "Apple" },
          ].map(({ title, company }) => (
            <button
              key={title}
              type="button"
              onClick={() => {
                if (disabled) return;
                onJobTitleChange(`${title} — ${company}`);
                onChange(
                  `${title} at ${company}\n\nRequirements:\n• 5+ years of experience\n• Strong problem-solving skills\n• Experience with agile methodologies\n• Excellent communication skills\n• Bachelor's degree in relevant field`
                );
              }}
              className="text-left px-3 py-2.5 text-xs text-muted-foreground hover:text-foreground border border-border hover:border-border hover:bg-muted/50 rounded-xl transition-colors"
              disabled={disabled}
            >
              Try: {title} at {company}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
