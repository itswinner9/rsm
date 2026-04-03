"use client";

import { useCallback, useState } from "react";
import { useDropzone } from "react-dropzone";
import { Upload, FileText, X, CheckCircle, Loader2, ClipboardPaste } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

interface UploadSectionProps {
  onParsed: (text: string, uploadId: string, fileName: string) => void;
  isLoading?: boolean;
}

const iconMuted = "text-muted-foreground";

export function UploadSection({ onParsed, isLoading }: UploadSectionProps) {
  const [tab, setTab] = useState<"upload" | "paste">("upload");

  const [file, setFile] = useState<File | null>(null);
  const [parsing, setParsing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [parsed, setParsed] = useState(false);

  const [pasteText, setPasteText] = useState("");
  const [pasteSubmitted, setPasteSubmitted] = useState(false);

  const handleFile = useCallback(
    async (acceptedFile: File) => {
      setFile(acceptedFile);
      setError(null);
      setParsed(false);
      setParsing(true);

      try {
        const formData = new FormData();
        formData.append("file", acceptedFile);
        const response = await fetch("/api/parse-resume", { method: "POST", body: formData });
        const data = await response.json();
        if (!response.ok) throw new Error(data.error || "Failed to parse resume");
        setParsed(true);
        onParsed(data.parsedText, data.uploadId, data.fileName);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to parse resume");
        setFile(null);
      } finally {
        setParsing(false);
      }
    },
    [onParsed]
  );

  const onDrop = useCallback(
    (acceptedFiles: File[]) => {
      if (acceptedFiles.length > 0) handleFile(acceptedFiles[0]);
    },
    [handleFile]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "application/pdf": [".pdf"],
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document": [".docx"],
      "application/msword": [".doc"],
      "text/plain": [".txt"],
    },
    maxFiles: 1,
    maxSize: 5 * 1024 * 1024,
    disabled: parsing || isLoading,
  });

  const handlePasteSubmit = async () => {
    if (pasteText.trim().length < 50) {
      setError("Please paste at least a few lines of your resume.");
      return;
    }
    setParsing(true);
    setError(null);
    try {
      const response = await fetch("/api/parse-resume/paste", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: pasteText }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Failed to save resume");
      setPasteSubmitted(true);
      onParsed(pasteText, data.uploadId, "pasted-resume.txt");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save resume");
    } finally {
      setParsing(false);
    }
  };

  return (
    <div className="space-y-3">
      <div className="flex rounded-2xl border border-border bg-card/50 p-1 gap-1">
        <button
          type="button"
          onClick={() => {
            setTab("upload");
            setError(null);
          }}
          className={cn(
            "flex-1 flex items-center justify-center gap-2 rounded-xl py-2.5 text-sm font-medium transition-colors min-h-11",
            tab === "upload"
              ? "bg-muted text-foreground"
              : "text-muted-foreground hover:text-foreground hover:bg-muted/70"
          )}
        >
          <Upload className="size-4 shrink-0" strokeWidth={1.25} />
          Upload file
        </button>
        <button
          type="button"
          onClick={() => {
            setTab("paste");
            setError(null);
          }}
          className={cn(
            "flex-1 flex items-center justify-center gap-2 rounded-xl py-2.5 text-sm font-medium transition-colors min-h-11",
            tab === "paste"
              ? "bg-muted text-foreground"
              : "text-muted-foreground hover:text-foreground hover:bg-muted/70"
          )}
        >
          <ClipboardPaste className="size-4 shrink-0" strokeWidth={1.25} />
          Paste text
        </button>
      </div>

      {tab === "upload" && (
        <>
          <div
            {...getRootProps()}
            className={cn(
              "relative border border-dashed rounded-2xl p-8 text-center cursor-pointer transition-all duration-200",
              isDragActive
                ? "border-muted-foreground/40 bg-muted/50"
                : parsed
                  ? "border-emerald-500/35 bg-emerald-500/[0.06]"
                  : "border-border bg-card/40 hover:bg-muted/40 hover:border-muted-foreground/25",
              (parsing || isLoading) && "opacity-60 cursor-not-allowed"
            )}
          >
            <input {...getInputProps()} />
            {parsing ? (
              <div className="flex flex-col items-center gap-3">
                <Loader2 className={cn("w-10 h-10 animate-spin", iconMuted)} strokeWidth={1.25} />
                <p className="text-sm text-muted-foreground">Parsing your resume…</p>
              </div>
            ) : parsed && file ? (
              <div className="flex flex-col items-center gap-3">
                <CheckCircle className="w-10 h-10 text-emerald-400/90" strokeWidth={1.25} />
                <div>
                  <p className="text-foreground font-medium">{file.name}</p>
                  <p className="text-emerald-400/80 text-sm mt-0.5">Ready to continue</p>
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center gap-3">
                <div className="w-14 h-14 rounded-2xl bg-muted/50 border border-border flex items-center justify-center">
                  <Upload className={cn("w-7 h-7", iconMuted)} strokeWidth={1.25} />
                </div>
                <div>
                  <p className="text-foreground font-medium">
                    {isDragActive ? "Drop your file here" : "Upload your resume"}
                  </p>
                  <p className="text-muted-foreground text-sm mt-1">PDF, DOCX, or TXT — max 5MB</p>
                </div>
                <p className="text-xs text-muted-foreground">Click or drag and drop</p>
              </div>
            )}
          </div>

          {parsed && file && (
            <div className="flex items-center justify-between bg-card/60 rounded-xl px-4 py-3 border border-border">
              <div className="flex items-center gap-3 min-w-0">
                <FileText className={cn("w-4 h-4 shrink-0", iconMuted)} strokeWidth={1.25} />
                <span className="text-foreground/90 text-sm truncate">{file.name}</span>
              </div>
              <button
                type="button"
                onClick={() => {
                  setFile(null);
                  setParsed(false);
                  setError(null);
                }}
                className="text-muted-foreground hover:text-foreground transition-colors p-1 rounded-md hover:bg-muted shrink-0"
              >
                <X className="w-4 h-4" strokeWidth={1.25} />
              </button>
            </div>
          )}
        </>
      )}

      {tab === "paste" && (
        <div className="space-y-3">
          {pasteSubmitted ? (
            <div className="flex flex-col items-center gap-3 py-6">
              <CheckCircle className="w-10 h-10 text-emerald-400/90" strokeWidth={1.25} />
              <p className="text-foreground font-medium text-sm">Resume text saved</p>
              <button
                type="button"
                onClick={() => {
                  setPasteSubmitted(false);
                  setPasteText("");
                }}
                className="text-muted-foreground hover:text-foreground text-xs underline underline-offset-2"
              >
                Change
              </button>
            </div>
          ) : (
            <>
              <textarea
                value={pasteText}
                onChange={(e) => setPasteText(e.target.value)}
                placeholder="Paste your full resume text here (select all in your document, then paste)."
                className="w-full min-h-[220px] rounded-2xl border border-border bg-card/60 px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground/45 outline-none focus:ring-1 focus:ring-ring/50 resize-none transition-colors"
                disabled={parsing}
              />
              <div className="flex items-center justify-between gap-3">
                <span className="text-xs text-muted-foreground">{pasteText.length} characters</span>
                <Button
                  onClick={handlePasteSubmit}
                  disabled={parsing || pasteText.trim().length < 50}
                  size="sm"
                  className="rounded-full px-6 min-h-10"
                >
                  {parsing ? (
                    <>
                      <Loader2 className="size-4 mr-2 animate-spin" />
                      Saving…
                    </>
                  ) : (
                    "Use this resume"
                  )}
                </Button>
              </div>
            </>
          )}
        </div>
      )}

      {error && <p className="text-destructive text-sm text-center">{error}</p>}
    </div>
  );
}
