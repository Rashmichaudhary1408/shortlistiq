import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

const { generate } = vi.hoisted(() => ({ generate: vi.fn() }));

// The real SDK and the server-only guard are replaced so no network call is made.
vi.mock("server-only", () => ({}));
vi.mock("@google/genai", () => ({
  GoogleGenAI: class {
    constructor() {
      this.models = { generateContent: generate };
    }
  },
}));

import { generateJson } from "../src/lib/server/gemini.js";

const call = () =>
  generateJson({ prompt: "p", schema: { type: "OBJECT" }, temperature: 0 });

describe("generateJson", () => {
  let errorSpy;

  beforeEach(() => {
    generate.mockReset();
    process.env.GEMINI_API_KEY = "test-key";
    process.env.GEMINI_MODEL = "test-model";
    errorSpy = vi.spyOn(console, "error").mockImplementation(() => {});
  });

  afterEach(() => {
    errorSpy.mockRestore();
  });

  it("returns the parsed JSON answer", async () => {
    generate.mockResolvedValueOnce({ text: '{"a":1}' });
    await expect(call()).resolves.toEqual({ a: 1 });
    expect(generate).toHaveBeenCalledTimes(1);
  });

  it("strips markdown code fences around the JSON", async () => {
    generate.mockResolvedValueOnce({ text: '```json\n{"a":2}\n```' });
    await expect(call()).resolves.toEqual({ a: 2 });
  });

  it(
    "retries once when the AI is rate limited, then succeeds",
    async () => {
      generate
        .mockRejectedValueOnce({ status: 429 })
        .mockResolvedValueOnce({ text: '{"ok":true}' });
      await expect(call()).resolves.toEqual({ ok: true });
      expect(generate).toHaveBeenCalledTimes(2);
    },
    10000
  );

  it(
    "gives up with AI_RATE_LIMITED after two rate-limited tries",
    async () => {
      generate.mockRejectedValue({ status: 429 });
      await expect(call()).rejects.toMatchObject({
        code: "AI_RATE_LIMITED",
        status: 429,
        retryable: true,
      });
      expect(generate).toHaveBeenCalledTimes(2);
    },
    10000
  );

  it("does not retry other server errors", async () => {
    generate.mockRejectedValue({ status: 500 });
    await expect(call()).rejects.toMatchObject({
      code: "AI_UNAVAILABLE",
      status: 502,
    });
    expect(generate).toHaveBeenCalledTimes(1);
  });

  it("reports unreadable output as AI_BAD_OUTPUT", async () => {
    generate.mockResolvedValueOnce({ text: "not json at all" });
    await expect(call()).rejects.toMatchObject({
      code: "AI_BAD_OUTPUT",
      retryable: true,
    });
  });

  it("reports missing settings as SERVER_ERROR without calling the AI", async () => {
    delete process.env.GEMINI_API_KEY;
    await expect(call()).rejects.toMatchObject({
      code: "SERVER_ERROR",
      retryable: false,
    });
    expect(generate).not.toHaveBeenCalled();
  });
});
