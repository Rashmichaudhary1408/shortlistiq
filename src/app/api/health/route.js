import { NextResponse } from "next/server";
import { guardRequest, toErrorResponse } from "@/lib/server/apiGuard.js";
import { generateJson, getGeminiConfig } from "@/lib/server/gemini.js";

export const maxDuration = 30;
export const dynamic = "force-dynamic";

// A good answer is reused for 60 seconds so that refreshing this public page
// cannot burn the free Gemini allowance. Errors are never cached.
const CACHE_MS = 60 * 1000;
let cached = null;

const HEALTH_SCHEMA = {
  type: "OBJECT",
  properties: {
    ok: { type: "BOOLEAN" },
    reply: { type: "STRING" },
  },
  required: ["ok", "reply"],
};

export async function GET(request) {
  const guard = await guardRequest(request, {
    expectBody: false,
    errorExtra: { ok: false },
  });
  if (!guard.ok) return guard.response;

  if (cached && Date.now() - cached.at < CACHE_MS) {
    return NextResponse.json({ ...cached.body, cached: true });
  }

  try {
    const { model } = getGeminiConfig();
    const result = await generateJson({
      prompt:
        "Return JSON with ok set to true and reply set to a one-word greeting.",
      schema: HEALTH_SCHEMA,
      temperature: 0,
    });
    const body = { ok: true, model, reply: String(result?.reply ?? "") };
    cached = { at: Date.now(), body };
    return NextResponse.json(body);
  } catch (err) {
    return toErrorResponse(err, { ok: false });
  }
}
