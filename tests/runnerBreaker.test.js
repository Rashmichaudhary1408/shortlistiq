import { describe, it, expect } from "vitest";
import { runScreening } from "../src/lib/runner.js";
import { createDrive, createStudent } from "../src/lib/driveModel.js";

const skills = [{ id: "1", name: "React", importance: "required" }];

const eligible = (id) =>
  createStudent({
    studentId: id,
    name: `Student ${id}`,
    cgpa: 8,
    eligibility: { eligible: true, failedRules: [] },
  });

const makeDrive = (students) =>
  createDrive({ name: "Drive", roleTitle: "Engineer", skills, students });

const goodPdf = { name: "good.pdf" };
const filesFor = (students) =>
  new Map(students.map((s) => [s.studentId, goodPdf]));

const aiAnswer = {
  skillResults: [{ name: "React", present: true, evidence: "Used React" }],
  relevantExperience: [],
  relevanceRating: 4,
  explanation: "Good fit.",
};

const baseDeps = {
  extractPdfText: async () => ({ status: "ok", text: "resume text", pages: 1 }),
  sleep: async () => {},
  concurrency: 1,
};

describe("runScreening AI circuit breaker", () => {
  it("stops calling the AI after three students in a row fail", async () => {
    let calls = 0;
    const students = ["A", "B", "C", "D", "E"].map(eligible);
    const result = await runScreening(
      { drive: makeDrive(students), resumeFiles: filesFor(students) },
      {
        ...baseDeps,
        scoreResume: async () => {
          calls += 1;
          return { ok: false, code: "AI_UNAVAILABLE", retryable: true };
        },
      }
    );
    // 3 students x 3 tries each, then the AI is skipped for the last two.
    expect(calls).toBe(9);
    expect(result.students.every((s) => s.screening.method === "fallback")).toBe(
      true
    );
    expect(result.usedFallbackCount).toBe(5);
    expect(result.warnings.some((w) => w.includes("paused"))).toBe(true);
  });

  it("does not open when a success breaks the streak", async () => {
    let calls = 0;
    const students = ["A", "B", "C", "D", "E"].map(eligible);
    const result = await runScreening(
      { drive: makeDrive(students), resumeFiles: filesFor(students) },
      {
        ...baseDeps,
        scoreResume: async () => {
          calls += 1;
          return calls === 3
            ? { ok: true, data: aiAnswer }
            : { ok: false, code: "INVALID_INPUT", retryable: false };
        },
      }
    );
    expect(calls).toBe(5);
    expect(result.students.map((s) => s.screening.method)).toEqual([
      "fallback",
      "fallback",
      "ai",
      "fallback",
      "fallback",
    ]);
    expect(result.warnings.some((w) => w.includes("paused"))).toBe(false);
  });
});
