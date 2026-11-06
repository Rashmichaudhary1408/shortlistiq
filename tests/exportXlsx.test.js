import { describe, it, expect } from "vitest";
import { buildSheets } from "../src/lib/exportXlsx.js";
import {
  createDrive,
  createStudent,
  createScreening,
  createRules,
} from "../src/lib/driveModel.js";

const toObjects = (rows) =>
  rows.slice(1).map((row) =>
    Object.fromEntries(rows[0].map((header, i) => [header, row[i]]))
  );

function makeDrive(overrides = {}) {
  const a = createStudent({
    studentId: "A",
    name: "Asha",
    branch: "CSE",
    cgpa: 8.5,
    eligibility: { eligible: true, failedRules: [] },
    resume: { status: "ok", message: "Scored" },
    screening: {
      ...createScreening(),
      method: "ai",
      score: 90,
      breakdown: {
        requiredMatched: 1,
        requiredTotal: 1,
        preferredMatched: 0,
        preferredTotal: 1,
        relevanceRating: 4,
      },
      explanation: "Strong fit.",
    },
  });
  const b = createStudent({
    studentId: "B",
    name: "Bela",
    branch: "ME",
    cgpa: 5,
    eligibility: {
      eligible: false,
      failedRules: [{ rule: "cgpa", message: "CGPA 5.0 < 7.0" }],
    },
    resume: { status: "not_scanned", message: "Not scanned" },
  });
  const c = createStudent({
    studentId: "C",
    name: "Chitra",
    branch: "CSE",
    cgpa: 8,
    eligibility: { eligible: true, failedRules: [] },
    resume: { status: "missing", message: "No matching PDF was uploaded" },
  });
  return createDrive({
    name: "Nimbus",
    company: "Nimbus Labs",
    roleTitle: "Engineer",
    skills: [
      { id: "1", name: "React", importance: "required" },
      { id: "2", name: "Docker", importance: "preferred" },
    ],
    rules: createRules({ branches: ["CSE"] }),
    students: [a, b, c],
    topN: 1,
    ...overrides,
  });
}

describe("buildSheets", () => {
  it("lists the final shortlist with scores", () => {
    const rows = toObjects(buildSheets(makeDrive()).shortlist);
    expect(rows).toHaveLength(1);
    expect(rows[0]).toMatchObject({
      Rank: 1,
      "Student ID": "A",
      Score: 90,
      Method: "AI",
      "Required skills matched": "1/1",
      "Relevance (0-5)": 4,
      Selection: "Top N",
    });
  });

  it("lists every student with status and notes", () => {
    const rows = toObjects(buildSheets(makeDrive()).all);
    expect(rows.map((r) => r["Student ID"])).toEqual(["A", "B", "C"]);
    expect(rows.map((r) => r.Status)).toEqual([
      "Shortlisted",
      "Not eligible",
      "Resume problem",
    ]);
    expect(rows[1].Notes).toBe("CGPA 5.0 < 7.0");
    expect(rows[2].Notes).toBe("No matching PDF was uploaded");
  });

  it("includes manually added students after the ranked ones", () => {
    const drive = makeDrive();
    drive.students.find((s) => s.studentId === "B").override = "include";
    const rows = toObjects(buildSheets(drive).shortlist);
    expect(rows.map((r) => r["Student ID"])).toEqual(["A", "B"]);
    expect(rows[1]).toMatchObject({
      Score: "",
      Method: "",
      Selection: "Added manually",
    });
  });

  it("fills the Drive Info sheet", () => {
    const info = Object.fromEntries(buildSheets(makeDrive()).info.slice(1));
    expect(info["Drive name"]).toBe("Nimbus");
    expect(info["Required skills"]).toBe("React");
    expect(info["Preferred skills"]).toBe("Docker");
    expect(info["Graduation year"]).toBe("Any");
    expect(info["Shortlisted"]).toBe(1);
    expect(info["Students in drive"]).toBe(3);
  });
});