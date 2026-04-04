import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { createServiceRoleClient } from "@/lib/supabase/admin";
import OpenAI from "openai";
import {
  aiOptimizeResponseSchema,
  resumeTemplateIdSchema,
  TEMPLATE_META,
  ALL_TEMPLATE_IDS,
  type ResumeTemplateId,
} from "@/lib/resume/types";
import { evaluateFreeOptimizationGate, utcTodayString, type FreePlanRow } from "@/lib/subscription/freePlan";
import { sanitizeOptimizedResumeData } from "@/lib/resume/sanitizeResumeText";
import { normalizeAiOptimizePayload } from "@/lib/resume/normalizeAiOptimizePayload";
import { jdKeywordMatchScore, flattenOptimizedResumeText } from "@/lib/resume/jdKeywordMatchScore";

const MODEL = "google/gemini-2.5-flash";

/** Lazy init: constructing OpenAI at module load breaks `next build` when env vars are absent (e.g. Vercel build). */
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

async function callAI(prompt: string, maxTokens = 12000): Promise<string> {
  const res = await getOpenRouterClient().chat.completions.create({
    model: MODEL,
    messages: [{ role: "user", content: prompt }],
    max_tokens: maxTokens,
  });
  return res.choices[0]?.message?.content || "";
}

function parseJSON(raw: string): unknown {
  const cleaned = raw
    .replace(/```json\s*/gi, "")
    .replace(/```\s*/g, "")
    .replace(/<think>[\s\S]*?<\/think>/gi, "")
    .replace(/<redacted_thinking>[\s\S]*?<\/redacted_thinking>/gi, "")
    .trim();
  const match = cleaned.match(/\{[\s\S]*\}/);
  if (!match) throw new Error("No JSON found");
  return JSON.parse(match[0]);
}

const CANADIAN_RULES = `
Canadian resume rules (MUST follow):
- Reverse-chronological order for experience (most recent first).
- No photo, date of birth, gender, marital status, age, or SIN.
- No full street address — location as City, Province (or City, Province, Country) only.
- One column, ATS-friendly structure; do not use tables for the main body.
- Start each bullet with a strong action verb; keep lines scannable.
- Quantify only where the source material supports it — never invent metrics.
- Target roughly 1–2 pages when rendered; tighten wording rather than padding.
- Do not invent employers, titles, dates, degrees, or certifications.
- Preserve factual employers, titles, dates, and education; rephrase bullets and summary for clarity and JD keywords.
- Prefer Canadian spelling when it reads naturally (e.g. behaviour, centre) if the rest of the resume is consistent.
- Omit "references available upon request" unless the user’s source clearly includes it.
`.trim();

const JSON_INSTRUCTION = `
Return ONLY valid JSON, no markdown fences, no commentary.
All string values must be PLAIN TEXT only — never HTML tags, never markdown, no <p>, <br>, or <b>.

Use this exact shape (do not include ats_score or ai_score — the server computes match scores):
{
  "job_title": "string — target role from JD or user hint",
  "company_name": "string — from JD or empty",
  "matched_keywords": ["from JD that appear in optimized content"],
  "missing_keywords": ["important JD terms still light or absent — be honest"],
  "strengths": ["short"],
  "weaknesses": ["short"],
  "suggestions": ["2-4 short next steps for the candidate"],
  "what_to_add": ["3-6 concrete additions ONLY if they could be truthful — e.g. a missing cert, tool, project, or metric they might have"],
  "improvements": ["3-5 bullets on what you changed for ATS and clarity"],
  "suggested_template": "classic" | "executive" | "compact" | "modern" | "minimal",
  "optimized_resume_data": {
    "full_name": "string",
    "headline": "target title line aligned to JD",
    "email": "",
    "phone": "",
    "location": "City, Province",
    "linkedin": "URL or empty",
    "summary": "2-4 sentences",
    "skills": ["keyword-rich, truthful"],
    "experience": [
      {
        "title": "",
        "company": "",
        "location": "",
        "dates": "Month Year – Month Year or Present",
        "bullets": ["action + context + result"]
      }
    ],
    "education": [
      { "institution": "", "credential": "Degree / program", "dates": "", "details": [] }
    ],
    "certifications": [],
    "projects": []
  }
}

suggested_template rules:
- "compact" — entry-level, career change, sparse work history, or student/new grad
- "executive" — several years of experience, leadership/professional roles
- "modern" — tech-forward or design-conscious roles; strong visual hierarchy without tables
- "minimal" — lots of whitespace, very clean; early-career or when content is concise
- "classic" — default for most applicants
`.trim();

export async function POST(request: NextRequest) {
  try {
    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    if (!process.env.OPENROUTER_API_KEY) {
      return NextResponse.json(
        {
          error:
            "AI is not configured. Add OPENROUTER_API_KEY to your project environment (e.g. Vercel → Settings → Environment Variables).",
        },
        { status: 503 }
      );
    }

    const { data: profile } = await supabase
      .from("user_profiles")
      .select(
        "subscription_status, subscription_trial_end, free_trial_started_at, free_trial_ends_at, last_free_use_date, total_free_uses"
      )
      .eq("user_id", user.id)
      .single();

    const subStatus = profile?.subscription_status ?? "inactive";
    const freeRow: FreePlanRow = {
      free_trial_started_at: profile?.free_trial_started_at ?? null,
      free_trial_ends_at: profile?.free_trial_ends_at ?? null,
      last_free_use_date: profile?.last_free_use_date ?? null,
      total_free_uses: profile?.total_free_uses ?? 0,
    };

    if (subStatus === "active") {
      // unlimited — no daily checks
    } else if (subStatus === "trialing") {
      const trialEnd = profile?.subscription_trial_end ? new Date(profile.subscription_trial_end) : null;
      if (trialEnd && Date.now() > trialEnd.getTime()) {
        return NextResponse.json(
          { error: "trial_ended", message: "Your trial has ended. Upgrade to continue." },
          { status: 403 }
        );
      }

      const todayUtc = utcTodayString();
      const { data: usedToday } = await supabase
        .from("trial_daily_optimizations")
        .select("id")
        .eq("user_id", user.id)
        .eq("usage_date", todayUtc)
        .maybeSingle();

      if (usedToday) {
        return NextResponse.json(
          {
            error: "trial_daily_limit",
            message: "Trial includes one optimization per day (UTC). Come back tomorrow or upgrade for unlimited runs.",
          },
          { status: 403 }
        );
      }
    } else {
      const gate = evaluateFreeOptimizationGate(freeRow);
      if (!gate.ok) {
        return NextResponse.json(
          { error: gate.code, message: gate.message },
          { status: 403 }
        );
      }
    }

    const { resumeText: rawResume, jobDescription: rawJD, jobTitle: userJobTitle, uploadId } =
      await request.json();
    if (!rawResume || !rawJD) {
      return NextResponse.json({ error: "Missing resume text or job description" }, { status: 400 });
    }

    const resumeText = rawResume.slice(0, 5000);
    const jobDescription = rawJD.slice(0, 3000);
    const titleHint =
      typeof userJobTitle === "string" && userJobTitle.trim()
        ? `\nUser-specified target job title: ${userJobTitle.trim()}\n`
        : "";

    const prompt = `You are an expert Canadian resume writer and ATS optimization specialist.

${CANADIAN_RULES}
${titleHint}

ORIGINAL RESUME (source of truth for facts):
${resumeText}

JOB DESCRIPTION:
${jobDescription}

Your task:
1. Infer structured data from the resume (do not add employers/roles/dates that are not implied by the source).
2. Analyze the job description: title, keywords, skills, responsibilities.
3. Produce ONE best ATS-optimized resume as structured JSON only — the same facts will be shown in five visual templates in the app; do not produce five different wordings.
4. Tailor summary, headline, skills ordering, and bullet phrasing to the JD using keywords naturally.
5. Set suggested_template per the rules below.

${JSON_INSTRUCTION}`;

    let raw: string;
    try {
      raw = await callAI(prompt);
    } catch (err) {
      console.error("OpenRouter call failed:", err);
      const status = (err as { status?: number })?.status;
      if (status === 429) {
        return NextResponse.json(
          { error: "AI service is rate-limited. Please wait 30 seconds and try again." },
          { status: 503 }
        );
      }
      throw err;
    }

    let parsedUnknown: unknown;
    try {
      parsedUnknown = parseJSON(raw);
    } catch (parseErr) {
      console.error("JSON extract failed. Snippet:", raw?.slice(0, 500));
      return NextResponse.json(
        { error: "AI returned an unexpected format. Please try again." },
        { status: 500 }
      );
    }

    const normalized = normalizeAiOptimizePayload(parsedUnknown);
    const safe = aiOptimizeResponseSchema.safeParse(normalized);
    if (!safe.success) {
      console.error("Zod validation failed:", safe.error.flatten());
      return NextResponse.json(
        { error: "AI output failed validation. Please try again." },
        { status: 500 }
      );
    }

    const result = safe.data;
    const optimized_resume_data = sanitizeOptimizedResumeData(result.optimized_resume_data);

    const originalAtsScore = jdKeywordMatchScore(resumeText, jobDescription);
    const optimizedPlain = flattenOptimizedResumeText(optimized_resume_data);
    let optimizedAts = jdKeywordMatchScore(optimizedPlain, jobDescription);
    optimizedAts = Math.min(100, Math.max(optimizedAts, originalAtsScore));

    const resolvedJobTitle =
      typeof userJobTitle === "string" && userJobTitle.trim()
        ? userJobTitle.trim()
        : result.job_title || "";

    let suggested: ResumeTemplateId = result.suggested_template;
    const st = resumeTemplateIdSchema.safeParse(suggested);
    if (!st.success) suggested = "classic";

    /** Only link uploads that exist and belong to this user (avoids FK failures misread as RLS). */
    let resolvedUploadId: string | null = null;
    if (typeof uploadId === "string" && uploadId.length > 0) {
      const { data: uploadRow } = await supabase
        .from("resume_uploads")
        .select("id")
        .eq("id", uploadId.trim())
        .eq("user_id", user.id)
        .maybeSingle();
      if (uploadRow?.id) resolvedUploadId = uploadRow.id;
    }

    const analysisPayload = {
      format: "master_v1" as const,
      matched_keywords: result.matched_keywords,
      missing_keywords: result.missing_keywords,
      strengths: result.strengths,
      weaknesses: result.weaknesses,
      suggestions: result.suggestions,
      what_to_add: result.what_to_add,
      improvements: result.improvements,
      suggested_template: suggested,
    };

    const insertPayload = {
      user_id: user.id,
      upload_id: resolvedUploadId,
      job_description: jobDescription,
      job_title: resolvedJobTitle,
      company_name: result.company_name || "",
      ats_score_original: originalAtsScore,
      ats_score_optimized: optimizedAts,
      optimized_resume_data,
      generated_resumes: analysisPayload,
      selected_template: suggested,
    };

    /** Prefer service role so INSERT succeeds even if JWT/RLS is misconfigured; user_id is trusted from getUser(). */
    const admin = createServiceRoleClient();
    const insertClient = admin ?? supabase;
    const { data: generation, error: generationError } = await insertClient
      .from("resume_generations")
      .insert(insertPayload)
      .select()
      .single();

    if (generationError || !generation?.id) {
      console.error("resume_generations insert failed:", {
        message: generationError?.message,
        code: generationError?.code,
        details: generationError?.details,
        hint: generationError?.hint,
        usedServiceRole: !!admin,
      });
      const msg = (generationError?.message ?? "").toLowerCase();
      const code = generationError?.code;
      if (code === "23503" || msg.includes("foreign key") || msg.includes("violates foreign key")) {
        return NextResponse.json(
          {
            error:
              "Could not link this run to your resume upload. Upload your resume again on the builder, then optimize.",
          },
          { status: 400 }
        );
      }
      if (code === "42501" || msg.includes("row-level security") || msg.includes("rls")) {
        return NextResponse.json(
          {
            error:
              "Could not save this optimization (database permissions). Set SUPABASE_SERVICE_ROLE_KEY on the server or fix resume_generations RLS in Supabase.",
          },
          { status: 500 }
        );
      }
      return NextResponse.json(
        {
          error:
            generationError?.message?.includes("column")
              ? `Could not save: ${generationError.message}`
              : "Could not save this optimization. Please try again.",
        },
        { status: 500 }
      );
    }

    if (subStatus === "trialing" && admin) {
      const todayUtc = new Date().toISOString().slice(0, 10);
      const { error: trialInsErr } = await admin.from("trial_daily_optimizations").insert({
        user_id: user.id,
        usage_date: todayUtc,
      });
      if (trialInsErr && trialInsErr.code !== "23505") {
        console.error("trial_daily_optimizations insert:", trialInsErr.message);
      }
    }

    if (subStatus !== "active" && subStatus !== "trialing" && admin) {
      const today = utcTodayString();
      const now = new Date();
      if (!freeRow.free_trial_started_at) {
        const ends = new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000);
        const { error: freeErr } = await admin
          .from("user_profiles")
          .update({
            free_trial_started_at: now.toISOString(),
            free_trial_ends_at: ends.toISOString(),
            last_free_use_date: today,
            total_free_uses: 1,
            updated_at: now.toISOString(),
          })
          .eq("user_id", user.id);
        if (freeErr) console.error("free plan init:", freeErr.message);
      } else {
        const { error: freeErr } = await admin
          .from("user_profiles")
          .update({
            last_free_use_date: today,
            total_free_uses: (freeRow.total_free_uses ?? 0) + 1,
            updated_at: now.toISOString(),
          })
          .eq("user_id", user.id);
        if (freeErr) console.error("free plan increment:", freeErr.message);
      }
    }

    revalidatePath("/dashboard");
    revalidatePath("/profile");

    const template_previews = ALL_TEMPLATE_IDS.map((id) => ({
      id,
      name: TEMPLATE_META[id].label,
      description: TEMPLATE_META[id].description,
    }));

    return NextResponse.json({
      success: true,
      generationId: generation.id,
      optimized_resume_data,
      ats_score: optimizedAts,
      matched_keywords: result.matched_keywords,
      missing_keywords: result.missing_keywords,
      suggested_template: suggested,
      template_previews,
      original_ats_score: originalAtsScore,
      job_title: resolvedJobTitle,
      company_name: result.company_name || "",
      strengths: result.strengths,
      weaknesses: result.weaknesses,
      suggestions: result.suggestions,
      what_to_add: result.what_to_add,
      improvements: result.improvements,
    });
  } catch (error) {
    console.error("Optimize resume error:", error);
    return NextResponse.json({ error: "Failed to optimize resume" }, { status: 500 });
  }
}
