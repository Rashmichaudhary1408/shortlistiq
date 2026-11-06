import { NextResponse } from "next/server";
import {
  guardRequest,
  errorResponse,
  toErrorResponse,
} from "@/lib/server/apiGuard.js";
import { generateJson, GeminiError } from "@/lib/server/gemini.js";
import { scoreResumePrompt } from "@/lib/server/prompts.js";
import { repairScoreResult } from "@/lib/scoreRepair.js";
import { LIMITS, ERROR_CODES } from "@/lib/constants.js";

export const maxDuration = 30;

function invalid(message) {
  return errorResponse(400, ERROR_CODES.invalidInput, message, false);
}

export async function POST(request) {
  const guard = await guardRequest(request);
  if (!guard.ok) return guard.response;
  const body = guard.body;

  const roleTitle =
    typeof body.roleTitle === "string" ? body.roleTitle.trim() : "";
  if (roleTitle.length < 1 || roleTitle.length > LIMITS.roleTitleMax) {
    return invalid("Role title must be 1 to 150 characters");
  }

  if (
    !Array.isArray(body.skills) ||
    body.skills.length < 1 ||
    body.skills.length > LIMITS.skillsMax
  ) {
    return invalid("Skills must be a list of 1 to 25 items");
  }
  const skills = [];
  for (const item of body.skills) {
    const name = typeof item?.name === "string" ? item.name.trim() : "";
    if (
      name.length < 1 ||
      name.length > LIMITS.skillNameMax ||
      (item.importance !== "required" && item.importance !== "preferred")
    ) {
      return invalid(
        "Each skill needs a name (1 to 60 characters) and an importance of required or preferred"
      );
    }
    skills.push({ name, importance: item.importance });
  }

  const resumeText =
    typeof body.resumeText === "string" ? body.resumeText.trim() : "";
  if (!resumeText) return invalid("Resume text is empty");
  const truncated = resumeText.slice(0, LIMITS.resumeTextMax);

  try {
    const { prompt, schema } = scoreResumePrompt({
      roleTitle,
      skills,
      resumeText: truncated,
    });
    const raw = await generateJson({ prompt, schema, temperature: 0 });
    const result = repairScoreResult(raw, skills);
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