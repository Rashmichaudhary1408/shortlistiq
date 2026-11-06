// The only browser code that calls our API routes.
// Every function returns { ok: true, data } or { ok: false, error, code, retryable }.

const TIMEOUT_MS = 45000;

async function postJson(path, payload) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);
  try {
    const response = await fetch(path, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
      signal: controller.signal,
    });
    let data = null;
    try {
      data = await response.json();
    } catch {
      data = null;
    }
    if (response.ok && data) return { ok: true, data };

    // A hosting timeout (504) or crash returns a page, not our JSON. Treat any
    // server-side failure like that as retryable so the runner tries again.
    const status = response.status;
    return {
      ok: false,
      error:
        data?.error ||
        (status === 504
          ? "The AI took too long to answer"
          : "The AI request failed"),
      code: data?.code || (status === 504 ? "AI_TIMEOUT" : "SERVER_ERROR"),
      retryable: data ? Boolean(data.retryable) : status >= 500,
    };
  } catch (err) {
    if (err?.name === "AbortError") {
      return {
        ok: false,
        error: "The AI took too long to answer",
        code: "AI_TIMEOUT",
        retryable: true,
      };
    }
    return {
      ok: false,
      error: "Could not reach the server. Check your internet connection.",
      code: "NETWORK_ERROR",
      retryable: true,
    };
  } finally {
    clearTimeout(timer);
  }
}

export function extractSkills(jd) {
  return postJson("/api/extract-skills", { jd });
}

export function scoreResume(payload) {
  return postJson("/api/score-resume", payload);
}