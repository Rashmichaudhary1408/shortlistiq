import "server-only";
import { GoogleGenAI } from "@google/genai";
import { ERROR_CODES } from "@/lib/constants.js";

// Error type carrying everything the route needs to build the response.
export class GeminiError extends Error {
  constructor(message, { status, code, retryable }) {
    super(message);
    this.name = "GeminiError";
    this.status = status;
    this.code = code;
    this.retryable = retryable;
  }
}

const ATTEMPT_TIMEOUT_MS = 25000;
const RETRY_WAIT_MS = 2000;

export function getGeminiConfig() {
  const apiKey = process.env.GEMINI_API_KEY;
  const model = process.env.GEMINI_MODEL;
  if (!apiKey || !model) {
    throw new GeminiError("AI is not configured on the server", {
      status: 500,
      code: ERROR_CODES.serverError,
      retryable: false,
    });
  }
  return { apiKey, model };
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function withTimeout(promise, ms) {
  let timer;
  const timeout = new Promise((_, reject) => {
    timer = setTimeout(() => {
      const err = new Error("Gemini call timed out");
      err.isTimeout = true;
      reject(err);
    }, ms);
  });
  return Promise.race([promise, timeout]).finally(() => clearTimeout(timer));
}

// Turn any SDK or network error into a GeminiError with a safe message.
function classify(err) {
  if (err instanceof GeminiError) return err;
  const raw = Number(err?.status ?? err?.code ?? 0);
  const text = String(err?.message ?? "").toLowerCase();

  if (err?.isTimeout || text.includes("timed out") || text.includes("abort")) {
    return new GeminiError("The AI took too long to answer", {
      status: 504,
      code: ERROR_CODES.aiTimeout,
      retryable: true,
    });
  }
  if (raw === 429 || text.includes("resource_exhausted")) {
    return new GeminiError("The AI is busy right now (free limit reached)", {
      status: 429,
      code: ERROR_CODES.aiRateLimited,
      retryable: true,
    });
  }
  return new GeminiError("The AI service is unavailable", {
    status: 502,
    code: ERROR_CODES.aiUnavailable,
    retryable: true,
  });
}

function parseJsonText(text) {
  const cleaned = String(text ?? "")
    .replace(/^```(?:json)?/i, "")
    .replace(/```$/, "")
    .trim();
  try {
    return JSON.parse(cleaned);
  } catch {
    throw new GeminiError("The AI returned an unreadable answer", {
      status: 502,
      code: ERROR_CODES.aiBadOutput,
      retryable: true,
    });
  }
}

// Sends one prompt to Gemini in JSON mode and returns the parsed object.
// Retries once (after 2 s) on a busy or temporarily unavailable AI.
export async function generateJson({ prompt, schema, temperature = 0 }) {
  const { apiKey, model } = getGeminiConfig();
  const ai = new GoogleGenAI({ apiKey });
  const started = Date.now();

  for (let attempt = 1; attempt <= 2; attempt += 1) {
    try {
      const response = await withTimeout(
        ai.models.generateContent({
          model,
          contents: prompt,
          config: {
            temperature,
            responseMimeType: "application/json",
            responseSchema: schema,
          },
        }),
        ATTEMPT_TIMEOUT_MS
      );
      return parseJsonText(response.text);
    } catch (err) {
      const failure = classify(err);
      const status = Number(err?.status ?? err?.code ?? 0);
      const canRetry =
        attempt === 1 && (failure.status === 429 || status === 503);
      if (canRetry) {
        await sleep(RETRY_WAIT_MS);
        continue;
      }
      // Log only the code, upstream status and duration. Never log prompt or resume text.
      console.error(
        `[gemini] ${failure.code} upstream=${status || "none"} name=${err?.name || "Error"} after ${Date.now() - started} ms (attempt ${attempt})`
      );
      throw failure;
    }
  }
  // Unreachable, but keeps the function total.
  throw new GeminiError("The AI service is unavailable", {
    status: 502,
    code: ERROR_CODES.aiUnavailable,
    retryable: true,
  });
}