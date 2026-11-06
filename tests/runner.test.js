import { describe, it, expect } from "vitest";
import { runScreening } from "../src/lib/runner.js";
import { createDrive, createStudent } from "../src/lib/driveModel.js";

const skills = [
  { id: "1", name: "React", importance: "required" },
  { id: "2", name: "Docker", importance: "preferred" },
];

const eligible = (id) =>
  createStudent({
    studentId: id,
    name: `Student ${id}`,
    cgpa: 8,
    eligibility: { eligible: true, failedRules: [] },
  });

const ineligible = (id) =>
  createStudent({
    studentId: id,
    name: `Student ${id}`,
    eligibility: {
      eligible: false,
      failedRules: [{ rule: "cgpa", message: "CGPA 5.0 < 7.0" }],
    },
  });

const makeDrive = (students) =>
  createDrive({ name: "Drive", roleTitle: "Engineer", skills, students });

const goodPdf = { name: "good.pdf", kind: "good" };
const emptyPdf = { name: "empty.pdf", kind: "empty" };

const extractPdfText = async (file) =>
  file.kind === "empty"
    ? { status: "unreadable", text: "", pages: 1 }
    : { status: "ok", text: "React and Docker experience", pages: 1 };

const aiAnswer = {
  skillResults: [
    { name: "React", present: true, evidence: "Used React" },
    { name: "Docker", present: false, evidence: "" },
  ],
  relevantExperience: [{ title: "Tracker", type: "project", why: "Relevant" }],
  relevanceRating: 4,
  explanation: "Solid fit.",
};

function makeDeps(scoreImpl) {
  const state = { scoreCalls: 0, sleeps: [] };
  return {
    state,
    deps: {
      extractPdfText,
      scoreResume: async (payload) => {
        state.scoreCalls += 1;
        return scoreImpl(payload);
      },
      sleep: async (ms) => {
        state.sleeps.push(ms);
      },
    },
  };
}

describe("runScreening", () => {
  it("scores eligible resumes and skips everyone else", async () => {
    const { state, deps } = makeDeps(async () => ({ ok: true, data: aiAnswer }));
    const drive = makeDrive([
      eligible("A"),
      ineligible("B"),
      eligible("C"),
      eligible("D"),
    ]);
    const files = new Map([
      ["A", goodPdf],
      ["B", goodPdf],
      ["D", emptyPdf],
    ]);
    const result = await runScreening({ drive, resumeFiles: files }, deps);
    const by = Object.fromEntries(result.students.map((s) => [s.studentId, s]));

    expect(by.A.resume.status).toBe("ok");
    expect(by.A.screening.method).toBe("ai");
    expect(by.A.screening.score).toBe(76);
    expect(by.B.resume.status).toBe("not_scanned");
    expect(by.B.screening.score).toBeNull();
    expect(by.C.resume.status).toBe("missing");
    expect(by.D.resume.status).toBe("unreadable");
    expect(state.scoreCalls).toBe(1);
    expect(result.topN).toBe(1);
    expect(result.warnings.some((w) => w.includes("could not be read"))).toBe(true);
  });

  it("retries twice then falls back to Basic match", async () => {
    const { state, deps } = makeDeps(async () => ({
      ok: false,
      error: "down",
      code: "AI_UNAVAILABLE",
      retryable: true,
    }));
    const result = await runScreening(
      { drive: makeDrive([eligible("A")]), resumeFiles: new Map([["A", goodPdf]]) },
      deps
    );
    const student = result.students[0];
    expect(state.scoreCalls).toBe(3);
    expect(state.sleeps).toEqual([2000, 4000]);
    expect(student.screening.method).toBe("fallback");
    expect(student.screening.score).toBe(100);
    expect(student.resume.status).toBe("ok");
    expect(result.usedFallbackCount).toBe(1);
    expect(result.warnings.some((w) => w.includes("Basic match"))).toBe(true);
  });

  it("does not retry a non-retryable failure", async () => {
    const { state, deps } = makeDeps(async () => ({
      ok: false,
      error: "bad",
      code: "INVALID_INPUT",
      retryable: false,
    }));
    const result = await runScreening(
      { drive: makeDrive([eligible("A")]), resumeFiles: new Map([["A", goodPdf]]) },
      deps
    );
    expect(state.scoreCalls).toBe(1);
    expect(result.students[0].screening.method).toBe("fallback");
  });

  it("pauses for 10 seconds after three rate limits in a row", async () => {
    const { state, deps } = makeDeps(async () => ({
      ok: false,
      error: "busy",
      code: "RATE_LIMITED",
      retryable: true,
    }));
    await runScreening(
      { drive: makeDrive([eligible("A")]), resumeFiles: new Map([["A", goodPdf]]) },
      deps
    );
    expect(state.sleeps).toEqual([2000, 4000, 10000]);
  });

  it("rejects with cancelled when the signal is aborted", async () => {
    const { deps } = makeDeps(async () => ({ ok: true, data: aiAnswer }));
    const controller = new AbortController();
    controller.abort();
    await expect(
      runScreening(
        {
          drive: makeDrive([eligible("A")]),
          resumeFiles: new Map([["A", goodPdf]]),
          signal: controller.signal,
        },
        deps
      )
    ).rejects.toMatchObject({ cancelled: true });
  });

  it("reports progress up to the total", async () => {
    const { deps } = makeDeps(async () => ({ ok: true, data: aiAnswer }));
    const updates = [];
    await runScreening(
      {
        drive: makeDrive([eligible("A"), ineligible("B")]),
        resumeFiles: new Map([["A", goodPdf]]),
        onProgress: (p) => updates.push(p),
      },
      deps
    );
    const last = updates[updates.length - 1];
    expect(last.total).toBe(2);
    expect(last.done).toBe(2);
  });
});