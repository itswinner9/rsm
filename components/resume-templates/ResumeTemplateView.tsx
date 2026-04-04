import type { OptimizedResumeData, ResumeTemplateId } from "@/lib/resume/types";
import { sanitizeOptimizedResumeData } from "@/lib/resume/sanitizeResumeText";
import { ResumeTemplateClassic } from "./ResumeTemplateClassic";
import { ResumeTemplateExecutive } from "./ResumeTemplateExecutive";
import { ResumeTemplateCompact } from "./ResumeTemplateCompact";
import { ResumeTemplateModern } from "./ResumeTemplateModern";
import { ResumeTemplateMinimal } from "./ResumeTemplateMinimal";
import { cn } from "@/lib/utils";

const body = "text-[10.5pt] leading-snug text-foreground";

export function ResumeTemplateView({
  templateId,
  data,
  className,
  id,
}: {
  templateId: ResumeTemplateId;
  data: OptimizedResumeData;
  className?: string;
  /** Optional DOM id for print/export targets */
  id?: string;
}) {
  const safe = sanitizeOptimizedResumeData(data);
  const inner = (() => {
    switch (templateId) {
      case "classic":
        return <ResumeTemplateClassic data={safe} bodyClass={body} />;
      case "executive":
        return <ResumeTemplateExecutive data={safe} bodyClass={body} />;
      case "compact":
        return <ResumeTemplateCompact data={safe} bodyClass={body} />;
      case "modern":
        return <ResumeTemplateModern data={safe} bodyClass={body} />;
      case "minimal":
        return <ResumeTemplateMinimal data={safe} bodyClass={body} />;
      default:
        return <ResumeTemplateClassic data={safe} bodyClass={body} />;
    }
  })();

  return (
    <div
      id={id}
      className={cn(
        "resume-template-root bg-white text-black antialiased font-sans",
        "w-[210mm] max-w-full min-h-[297mm] box-border px-[14mm] py-[12mm] shadow-sm",
        className
      )}
    >
      {inner}
    </div>
  );
}
