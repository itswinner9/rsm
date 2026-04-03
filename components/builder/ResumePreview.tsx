"use client";

import { useRef } from "react";
import { X, Download, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface ResumeVersion {
  template: string;
  ats_score: number;
  content: string;
  improvements: string[];
}

interface ResumePreviewProps {
  version: ResumeVersion;
  onClose: () => void;
  onDownload: () => void;
  isDownloading?: boolean;
}

function formatResumeContent(content: string) {
  const lines = content.split("\n");
  const elements: React.ReactNode[] = [];

  lines.forEach((line, i) => {
    const trimmed = line.trim();

    if (!trimmed) {
      elements.push(<div key={i} className="h-3" />);
      return;
    }

    // Section headers (all caps or ends with :)
    if (
      trimmed === trimmed.toUpperCase() && trimmed.length > 2 && trimmed.length < 30 ||
      /^(SUMMARY|EXPERIENCE|EDUCATION|SKILLS|CERTIFICATIONS|PROJECTS|AWARDS|REFERENCES|OBJECTIVE|PROFESSIONAL EXPERIENCE|WORK EXPERIENCE)$/i.test(trimmed)
    ) {
      elements.push(
        <div key={i} className="mt-4 mb-1">
          <h2 className="text-xs font-bold text-slate-800 uppercase tracking-widest border-b border-slate-300 pb-1">
            {trimmed}
          </h2>
        </div>
      );
      return;
    }

    // Bullet points
    if (trimmed.startsWith("•") || trimmed.startsWith("-") || trimmed.startsWith("*")) {
      elements.push(
        <div key={i} className="flex items-start gap-2 ml-2 my-0.5">
          <span className="text-slate-600 mt-0.5 text-xs">•</span>
          <p className="text-xs text-slate-700 leading-relaxed">{trimmed.replace(/^[•\-*]\s*/, "")}</p>
        </div>
      );
      return;
    }

    // Email/phone line (contact info)
    if (trimmed.includes("@") || trimmed.match(/\|/) || trimmed.match(/\d{3}[-.\s]\d{3}/)) {
      elements.push(
        <p key={i} className="text-xs text-slate-500 text-center">{trimmed}</p>
      );
      return;
    }

    // First line = name (large)
    if (i === 0 || (i < 3 && trimmed.split(" ").length <= 4 && !trimmed.includes("|"))) {
      elements.push(
        <h1 key={i} className="text-xl font-bold text-slate-900 text-center mb-0.5">{trimmed}</h1>
      );
      return;
    }

    // Job title / company line (medium weight)
    if (trimmed.includes("|") || trimmed.match(/\d{4}/)) {
      elements.push(
        <p key={i} className="text-xs font-semibold text-slate-800 mt-2">{trimmed}</p>
      );
      return;
    }

    // Regular text
    elements.push(
      <p key={i} className="text-xs text-slate-700 leading-relaxed">{trimmed}</p>
    );
  });

  return elements;
}

export function ResumePreview({ version, onClose, onDownload, isDownloading }: ResumePreviewProps) {
  const resumeRef = useRef<HTMLDivElement>(null);

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-white/20 rounded-2xl w-full max-w-3xl max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/10">
          <div>
            <h3 className="text-white font-semibold">{version.template}</h3>
            <p className="text-white/50 text-sm">ATS Score: <span className="text-green-400 font-bold">{version.ats_score}%</span></p>
          </div>
          <div className="flex items-center gap-3">
            <Button
              onClick={onDownload}
              disabled={isDownloading}
              className="bg-blue-600 hover:bg-blue-500 text-white"
              size="sm"
            >
              {isDownloading ? (
                <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Downloading...</>
              ) : (
                <><Download className="w-4 h-4 mr-2" />Download PDF</>
              )}
            </Button>
            <button
              onClick={onClose}
              className="text-white/50 hover:text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Resume paper */}
        <div className="flex-1 overflow-auto p-6">
          <div
            ref={resumeRef}
            id="resume-preview"
            className="bg-white mx-auto shadow-2xl"
            style={{
              width: "210mm",
              minHeight: "297mm",
              padding: "20mm 18mm",
              fontFamily: "'Georgia', 'Times New Roman', serif",
            }}
          >
            {formatResumeContent(version.content)}
          </div>
        </div>
      </div>
    </div>
  );
}
