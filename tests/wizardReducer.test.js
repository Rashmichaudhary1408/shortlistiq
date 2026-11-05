import { describe, it, expect } from "vitest";
import {
  wizardReducer,
  createInitialState,
  canLeaveUpload,
} from "../src/lib/wizardReducer.js";
import { createStudent } from "../src/lib/driveModel.js";

const students = [
  createStudent({ studentId: "A1", name: "A", branch: "CSE" }),
  createStudent({ studentId: "A2", name: "B", branch: "IT" }),
];

describe("wizardReducer", () => {
  it("starts on step 1 with nothing loaded", () => {
    const s = createInitialState();
    expect(s.step).toBe(1);
    expect(s.students).toEqual([]);
    expect(canLeaveUpload(s)).toBe(false);
  });

  it("SET_SHEET stores students and derives default rules", () => {
    const s = wizardReducer(createInitialState(), {
      type: "SET_SHEET",
      payload: { fileName: "s.xlsx", students, errors: [], warnings: ["w"] },
    });
    expect(s.students).toHaveLength(2);
    expect(s.sheetName).toBe("s.xlsx");
    expect(s.sheetWarnings).toEqual(["w"]);
    expect(s.rules.branches).toEqual(["CSE", "IT"]);
  });

  it("SET_PDFS applies a match result", () => {
    const base = wizardReducer(createInitialState(), {
      type: "SET_SHEET",
      payload: { fileName: "s.xlsx", students, errors: [], warnings: [] },
    });
    const matched = students.map((x) => ({
      ...x,
      resume: { status: "found", message: "Resume found" },
    }));
    const s = wizardReducer(base, {
      type: "SET_PDFS",
      payload: {
        files: [{ name: "A1.pdf" }],
        match: {
          students: matched,
          fileMap: new Map([["A1", {}]]),
          unmatchedFiles: ["x.pdf"],
          rejectedFiles: [],
        },
      },
    });
    expect(s.students[0].resume.status).toBe("found");
    expect(s.unmatchedFiles).toEqual(["x.pdf"]);
    expect(s.pdfFiles).toHaveLength(1);
  });

  it("requires a drive name and a clean sheet to leave the upload step", () => {
    let s = wizardReducer(createInitialState(), {
      type: "SET_SHEET",
      payload: { fileName: "s.xlsx", students, errors: [], warnings: [] },
    });
    expect(canLeaveUpload(s)).toBe(false);
    s = wizardReducer(s, {
      type: "SET_FIELD",
      payload: { field: "driveName", value: "Nimbus Drive" },
    });
    expect(canLeaveUpload(s)).toBe(true);
  });

  it("SET_RULES merges into the existing rules", () => {
    const s = wizardReducer(createInitialState(), {
      type: "SET_RULES",
      payload: { rules: { minCgpa: 7.5 } },
    });
    expect(s.rules.minCgpa).toBe(7.5);
    expect(s.rules.maxBacklogs).toBe(0);
  });

  it("GO_TO_STEP clamps between 1 and 4", () => {
    const base = createInitialState();
    expect(wizardReducer(base, { type: "GO_TO_STEP", payload: { step: 9 } }).step).toBe(4);
    expect(wizardReducer(base, { type: "GO_TO_STEP", payload: { step: 0 } }).step).toBe(1);
  });

  it("RESET returns to the initial state", () => {
    const s = wizardReducer(
      wizardReducer(createInitialState(), {
        type: "SET_FIELD",
        payload: { field: "driveName", value: "x" },
      }),
      { type: "RESET" }
    );
    expect(s.driveName).toBe("");
    expect(s.step).toBe(1);
  });
});