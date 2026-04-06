"use client";

import { useState } from "react";
import { Copy, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";

type Prep = {
  strengths: string[];
  whatToAdd: string[];
  suggestions: string[];
};

export function DashboardTalkingPointsCopy({ prep }: { prep: Prep }) {
  const { toast } = useToast();
  const [done, setDone] = useState(false);

  const lines: string[] = [
    "Talking points (from your latest Resumify run)",
    "",
    ...(prep.strengths.length ? ["Strengths to emphasize:", ...prep.strengths.map((s) => `• ${s}`), ""] : []),
    ...(prep.whatToAdd.length ? ["Ideas to add (only if true):", ...prep.whatToAdd.map((s) => `• ${s}`), ""] : []),
    ...(prep.suggestions.length ? ["Next steps:", ...prep.suggestions.map((s) => `• ${s}`)] : []),
  ].filter((_, i, arr) => !(i === arr.length - 1 && arr[i] === ""));

  const text = lines.join("\n").trim();
  if (!text) return null;

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(text);
      setDone(true);
      toast({ title: "Copied", description: "Paste into notes, email, or a cover letter draft." });
      setTimeout(() => setDone(false), 2000);
    } catch {
      toast({ title: "Copy failed", description: "Select and copy manually if needed.", variant: "destructive" });
    }
  };

  return (
    <Button
      type="button"
      variant="outline"
      size="sm"
      className="mt-2 rounded-full h-8 text-xs gap-1.5 border-border"
      onClick={handleCopy}
    >
      {done ? <Check className="size-3.5 text-emerald-600" /> : <Copy className="size-3.5" />}
      Copy talking points
    </Button>
  );
}
