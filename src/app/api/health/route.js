import { NextResponse } from "next/server";
import { guardRequest, toErrorResponse } from "@/lib/server/apiGuard.js";
import { generateJson, getGeminiConfig } from "@/lib/server/gemini.js";

export const maxDuration = 30;
export const dynamic = "force-dynamic";

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

  try {
    const { model } = getGeminiConfig();
    const result = await generateJson({
      prompt:
        "Return JSON with ok set to true and reply set to a one-word greeting.",
      schema: HEALTH_SCHEMA,
      temperature: 0,
    });
    return NextResponse.json({
      ok: true,
      model,
      reply: String(result?.reply ?? ""),
    });
  } catch (err) {
    return toErrorResponse(err, { ok: false });
  }
}