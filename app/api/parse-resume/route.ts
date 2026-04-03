import path from "node:path";
import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

let cachedPdfjsWorkerPath: string | null = null;

/** Resolved path to pdf.worker.mjs (same as require.resolve; avoids webpack createRequire warnings). */
function getPdfjsWorkerPath(): string {
  if (cachedPdfjsWorkerPath) return cachedPdfjsWorkerPath;
  cachedPdfjsWorkerPath = path.join(
    process.cwd(),
    "node_modules/pdfjs-dist/legacy/build/pdf.worker.mjs"
  );
  return cachedPdfjsWorkerPath;
}

async function extractPDFTextWithPdfjs(buffer: Buffer): Promise<string> {
  const pdfjsLib = (await import(
    "pdfjs-dist/legacy/build/pdf.mjs" as string
  )) as typeof import("pdfjs-dist");

  pdfjsLib.GlobalWorkerOptions.workerSrc = getPdfjsWorkerPath();

  const data = new Uint8Array(buffer);
  const doc = await pdfjsLib
    .getDocument({ data, useSystemFonts: true, disableFontFace: true })
    .promise;

  let text = "";
  try {
    for (let i = 1; i <= doc.numPages; i++) {
      const page = await doc.getPage(i);
      const content = await page.getTextContent();
      const pageText = content.items
        .map((item) => ("str" in item ? item.str : ""))
        .join(" ");
      text += pageText + "\n";
    }
    return text.trim();
  } finally {
    await doc.destroy().catch(() => {});
  }
}

async function extractPDFTextWithPdfParse(buffer: Buffer): Promise<string> {
  const { PDFParse } = await import("pdf-parse");
  PDFParse.setWorker(getPdfjsWorkerPath());
  const parser = new PDFParse({ data: buffer });
  try {
    const result = await parser.getText();
    return (result.text ?? "").trim();
  } finally {
    await parser.destroy().catch(() => {});
  }
}

async function extractPDFText(buffer: Buffer): Promise<string> {
  try {
    return await extractPDFTextWithPdfjs(buffer);
  } catch (primaryErr) {
    console.error(
      "[parse-resume] pdfjs extraction failed, trying pdf-parse:",
      primaryErr instanceof Error ? primaryErr.message : primaryErr
    );
    try {
      const text = await extractPDFTextWithPdfParse(buffer);
      if (text.length > 0) return text;
      throw new Error("pdf-parse returned empty text");
    } catch (fallbackErr) {
      console.error(
        "[parse-resume] pdf-parse fallback failed:",
        fallbackErr instanceof Error ? fallbackErr.message : fallbackErr
      );
      throw primaryErr;
    }
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const formData = await request.formData();
    const file = formData.get("file") as File;

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    const allowedTypes = [
      "application/pdf",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      "application/msword",
      "text/plain",
    ];

    if (!allowedTypes.includes(file.type) && !file.name.match(/\.(pdf|docx|doc|txt)$/i)) {
      return NextResponse.json(
        { error: "Invalid file type. Please upload PDF, DOCX, or TXT." },
        { status: 400 }
      );
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    let parsedText = "";

    if (
      file.type === "application/vnd.openxmlformats-officedocument.wordprocessingml.document" ||
      file.name.endsWith(".docx")
    ) {
      const mammoth = await import("mammoth");
      const result = await mammoth.extractRawText({ buffer });
      parsedText = result.value.trim();
    } else if (file.type === "text/plain" || file.name.endsWith(".txt")) {
      parsedText = buffer.toString("utf-8").trim();
    } else {
      parsedText = await extractPDFText(buffer);
    }

    if (!parsedText || parsedText.length < 50) {
      return NextResponse.json(
        { error: "Could not extract text from this file. Please try a DOCX file." },
        { status: 422 }
      );
    }

    const { data: upload } = await supabase
      .from("resume_uploads")
      .insert({
        user_id: user.id,
        file_name: file.name,
        parsed_text: parsedText,
      })
      .select()
      .single();

    return NextResponse.json({
      success: true,
      parsedText,
      uploadId: upload?.id,
      fileName: file.name,
    });
  } catch (error) {
    console.error(
      "Parse resume error:",
      error instanceof Error ? error.message : error,
      error instanceof Error ? error.stack : ""
    );
    return NextResponse.json({ error: "Failed to parse resume" }, { status: 500 });
  }
}
