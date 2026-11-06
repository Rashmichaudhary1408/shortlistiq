import { describe, it, expect } from "vitest";
import {
  rankStudents,
  getAutoShortlistIds,
  getFinalShortlistIds,
  getStudentState,
} from "../src/lib/shortlist.js";
import {
  createDrive,
  createStudent,
  createScreening,
} from "../src/lib/driveModel.js";

function student(id, score, cgpa, extra = {}) {
  return createStudent({
    studentId: id,
    name: id,
    cgpa,
    eligibility: { eligible: true, failedRules: [] },
    resume: { status: "ok", message: "Scored" },
    screening: { ...createScreening(), method: "ai", score },
    ...extra,
  });
}

const baseStudents = () => [
  student("A", 80, 7),
  student("B", 90, 8),
  student("C", 80, 9),
  student("D", 80, 9),
  student("E", 99, 9, { eligibility: { eligible: false, failedRules: [] } }),
  student("F", null, 9, {
    resume: { status: "missing", message: "No PDF" },
    screening: createScreening(),
  }),
];

const drive = (extra = {}, students = baseStudents()) =>
  createDrive({ name: "D", students, topN: 2, ...extra });

describe("rankStudents", () => {
  it("orders by score, then CGPA, then ID, and skips ineligible or unscored", () => {
    expect(rankStudents(drive()).map((s) => s.studentId)).toEqual([
      "B",
      "C",
      "D",
      "A",
    ]);
  });
});

describe("shortlist ids", () => {
  it("takes the top N and clamps it to the scored count", () => {
    expect(getAutoShortlistIds(drive())).toEqual(["B", "C"]);
    expect(getAutoShortlistIds(drive({ topN: 99 }))).toHaveLength(4);
    expect(getAutoShortlistIds(drive({}, []))).toEqual([]);
  });

  it("applies include and exclude overrides", () => {
    const students = baseStudents();
    students.find((s) => s.studentId === "A").override = "include";
    students.find((s) => s.studentId === "B").override = "exclude";
    expect(getFinalShortlistIds(drive({}, students))).toEqual(["C", "A"]);
  });

  it("lists a manually included ineligible student after the ranked ones", () => {
    const students = baseStudents();
    students.find((s) => s.studentId === "E").override = "include";
    expect(getFinalShortlistIds(drive({}, students))).toEqual(["B", "C", "E"]);
  });

  it("keeps overrides when Top N changes", () => {
    const students = baseStudents();
    students.find((s) => s.studentId === "A").override = "include";
    expect(getFinalShortlistIds(drive({ topN: 1 }, students))).toEqual(["B", "A"]);
    expect(getFinalShortlistIds(drive({ topN: 3 }, students))).toEqual([
      "B",
      "C",
      "D",
      "A",
    ]);
  });
});

describe("getStudentState", () => {
  it("returns the right state for each kind of student", () => {
    const d = drive();
    const finalIds = new Set(getFinalShortlistIds(d));
    const by = Object.fromEntries(d.students.map((s) => [s.studentId, s]));
    expect(getStudentState(by.B, finalIds)).toBe("shortlisted");
    expect(getStudentState(by.A, finalIds)).toBe("eligible");
    expect(getStudentState(by.E, finalIds)).toBe("ineligible");
    expect(getStudentState(by.F, finalIds)).toBe("resume_issue");
  });
});