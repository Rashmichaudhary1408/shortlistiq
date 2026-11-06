import { NextResponse } from "next/server";
import {
  guardRequest,
  errorResponse,
  toErrorResponse,
} from "@/lib/server/apiGuard.js";
import { generateJson, GeminiError } from "@/lib/server/gemini.js";
import { extractSkillsPrompt } from "@/lib/server/prompts.js";
import { validateExtraction } from "@/lib/skills.js";
import { LIMITS, ERROR_CODES } from "@/lib/constants.js";

export const maxDuration = 30;

export async function POST(request) {
  const guard = await guardRequest(request);
  if (!guard.ok) return guard.response;

  const jd = typeof guard.body.jd === "string" ? guard.body.jd.trim() : "";
  if (jd.length < LIMITS.jdMin || jd.length > LIMITS.jdMax) {
    return errorResponse(
      400,
      ERROR_CODES.invalidInput,
      "Job description must be 50 to 8000 characters",
      false
    );
  }

  try {
    const { prompt, schema } = extractSkillsPrompt(jd);
    const raw = await generateJson({ prompt, schema, temperature: 0 });
    const result = validateExtraction(raw);
    if (!result) {
      throw new GeminiError("The AI returned an unusable answer", {
        status: 502,
        code: ERROR_CODES.aiBadOutput,
        retryable: true,
      });
    }
    return NextResponse.json(result);
  } catch (err) {
    return toErrorResponse(err);
  }
}