import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";
import { createClient } from "@/lib/supabase/server";
import type { ScratchFormState } from "@/lib/resume/serializeScratchResume";
import { mergePolishedScratchForm } from "@/lib/resume/polishScratchMerge";

const MODEL = "google/gemini-2.5-flash";

function getOpenRouterClient(): OpenAI {
  const apiKey = process.env.OPENROUTER_API_KEY;
  if (!apiKey) {
    throw new Error("OPENROUTER_API_KEY is not configured");
  }
  return new OpenAI({
    baseURL: "https://openrouter.ai/api/v1",
    apiKey,
    defaultHeaders: {
      "HTTP-Referer": process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000",
      "X-Title": "Resumify",
    },
  });
}

async function callAI(prompt: string): Promise<string> {
  const res = await getOpenRouterClient().chat.completions.create({
    model: MODEL,
    messages: [{ role: "user", content: prompt }],
    max_tokens: 8000,
  });
  return res.choices[0]?.message?.content || "";
}

function parseJSON(raw: string): unknown {
  const cleaned = raw
    .replace(/```json\s*/gi, "")
    .replace(/```\s*/g, "")
    .trim();
  const match = cleaned.match(/\{[\s\S]*\}/);
  if (!match) throw new Error("No JSON found");
  return JSON.parse(match[0]);
}

export async function POST(request: NextRequest) {
  try {
    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    if (!process.env.OPENROUTER_API_KEY) {
      return NextResponse.json(
        { error: "AI is not configured. Add OPENROUTER_API_KEY to your environment." },
        { status: 503 }
      );
    }

    const body = (await request.json()) as { form?: ScratchFormState };
    const form = body.form;
    if (!form || typeof form !== "object") {
      return NextResponse.json({ error: "Invalid form" }, { status: 400 });
    }

    const prompt = `
You are an expert Canadian resume coach. Improve this draft for clarity, ATS-friendly keywords, and strong action-led bullets.
Rules:
- Do NOT invent employers, job titles, degrees, schools, dates, or metrics. Only rephrase and tighten what is present or clearly implied.
- Canadian style: no photo/SIN; location as City, Province when shown; reverse-chronological experience.
- Bullets: start with strong verbs; add quantified results ONLY if the source already implies a number or scale.
- Summary: 2–4 tight sentences aligned to a general professional search (no job posting yet).
- Skills: dedupe, group logically, comma or line separated as in "skills" string.

Return ONLY valid JSON (no markdown fences) with this exact shape and camelCase keys:
{
  "fullName": "string",
  "headline": "string",
  "email": "string",
  "phone": "string",
  "location": "string",
  "linkedin": "string",
  "summary": "string",
  "skills": "string",
  "experience": [
    {
      "title": "string",
      "company": "string",
      "location": "string",
      "dates": "string",
      "bullets": "string with one bullet per line, optional leading • or -"
    }
  ],
  "education": [
    { "institution": "string", "credential": "string", "dates": "string" }
  ]
}

Draft to improve:
${JSON.stringify(form, null, 2)}
`.trim();

    const raw = await callAI(prompt);
    const parsed = parseJSON(raw);
    const merged = mergePolishedScratchForm(parsed, form);

    return NextResponse.json({ form: merged });
  } catch (e) {
    console.error("polish-scratch:", e);
    const message = e instanceof Error ? e.message : "Polish failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
