import "server-only";
import { NextResponse } from "next/server";
import { API_LIMITS, ERROR_CODES } from "@/lib/constants.js";

// In-memory per-IP request log (resets when the serverless instance restarts).
const hits = new Map();

function getClientIp(request) {
  const forwarded = request.headers.get("x-forwarded-for");
  if (forwarded) return forwarded.split(",")[0].trim();
  return request.headers.get("x-real-ip") || "unknown";
}

function underRateLimit(ip) {
  const now = Date.now();
  const recent = (hits.get(ip) || []).filter(
    (t) => now - t < API_LIMITS.rateLimitWindowMs
  );
  if (recent.length >= API_LIMITS.rateLimitRequests) {
    hits.set(ip, recent);
    return false;
  }
  recent.push(now);
  hits.set(ip, recent);
  if (hits.size > 2000) {
    for (const [key, times] of hits) {
      if (!times.some((t) => now - t < API_LIMITS.rateLimitWindowMs)) {
        hits.delete(key);
      }
    }
  }
  return true;
}

// Builds the standard error envelope: { error, code, retryable }.
export function errorResponse(status, code, message, retryable, extra = {}) {
  return NextResponse.json(
    { ...extra, error: message, code, retryable },
    { status }
  );
}

// Converts any thrown error into a safe response. No stack traces leak out.
export function toErrorResponse(err, extra = {}) {
  if (err && err.code && err.status) {
    return errorResponse(
      err.status,
      err.code,
      err.message,
      Boolean(err.retryable),
      extra
    );
  }
  console.error("[server] unexpected error");
  return errorResponse(
    500,
    ERROR_CODES.serverError,
    "Something went wrong on the server",
    false,
    extra
  );
}

// Checks rate limit, and for POST routes also content type, size and JSON.
// Returns { ok: true, body } or { ok: false, response }.
export async function guardRequest(request, options = {}) {
  const { expectBody = true, errorExtra = {} } = options;

  if (!underRateLimit(getClientIp(request))) {
    return {
      ok: false,
      response: errorResponse(
        429,
        ERROR_CODES.rateLimited,
        "Too many requests. Please wait a moment and try again.",
        true,
        errorExtra
      ),
    };
  }

  if (!expectBody) return { ok: true, body: null };

  const contentType = request.headers.get("content-type") || "";
  if (!contentType.toLowerCase().includes("application/json")) {
    return {
      ok: false,
      response: errorResponse(
        415,
        ERROR_CODES.unsupportedMediaType,
        "Request must be JSON",
        false,
        errorExtra
      ),
    };
  }

  const declared = Number(request.headers.get("content-length") || 0);
  if (declared > API_LIMITS.bodyMaxBytes) {
    return {
      ok: false,
      response: errorResponse(
        413,
        ERROR_CODES.payloadTooLarge,
        "Request is too large",
        false,
        errorExtra
      ),
    };
  }

  const text = await request.text();
  if (Buffer.byteLength(text) > API_LIMITS.bodyMaxBytes) {
    return {
      ok: false,
      response: errorResponse(
        413,
        ERROR_CODES.payloadTooLarge,
        "Request is too large",
        false,
        errorExtra
      ),
    };
  }

  let body;
  try {
    body = JSON.parse(text);
  } catch {
    body = undefined;
  }
  if (!body || typeof body !== "object" || Array.isArray(body)) {
    return {
      ok: false,
      response: errorResponse(
        400,
        ERROR_CODES.invalidInput,
        "Request body must be a JSON object",
        false,
        errorExtra
      ),
    };
  }

  return { ok: true, body };
}