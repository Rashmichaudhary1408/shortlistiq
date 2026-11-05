import { describe, it, expect } from "vitest";
import {
  defaultRules,
  evaluateStudent,
  applyRules,
  validateRules,
} from "../src/lib/eligibility.js";
import { createStudent, createRules } from "../src/lib/driveModel.js";

const rules = createRules({
  minCgpa: 7.0,
  branches: ["CSE", "IT", "ECE"],
  maxBacklogs: 0,
  graduationYear: 2027,
});

const good = createStudent({
  studentId: "A1",
  name: "A",
  branch: "CSE",
  cgpa: 8,
  backlogs: 0,
  gradYear: 2027,
});

describe("evaluateStudent", () => {
  it("passes a student who meets every rule", () => {
    expect(evaluateStudent(good, rules)).toEqual({
      eligible: true,
      failedRules: [],
    });
  });

  it("uses the exact failure messages", () => {
    const bad = {
      ...good,
      cgpa: 6.8,
      branch: "ME",
      backlogs: 1,
      gradYear: 2026,
    };
    const result = evaluateStudent(bad, rules);
    expect(result.eligible).toBe(false);
    expect(result.failedRules.map((f) => f.message)).toEqual([
      "CGPA 6.8 < 7.0",
      "Branch ME not in CSE, IT, ECE",
      "Backlogs 1 > 0",
      "Graduation year 2026 is not 2027",
    ]);
  });

  it("records every failed rule, one entry per rule", () => {
    const result = evaluateStudent({ ...good, cgpa: 5, backlogs: 3 }, rules);
    expect(result.failedRules.map((f) => f.rule)).toEqual(["cgpa", "backlogs"]);
  });

  it("fails missing values with a clear message", () => {
    const result = evaluateStudent(
      { ...good, cgpa: null, backlogs: null, gradYear: null },
      rules
    );
    expect(result.failedRules.map((f) => f.message)).toEqual([
      "CGPA missing or invalid",
      "Backlogs missing or invalid",
      "Graduation year missing or invalid",
    ]);
  });

  it("ignores the year rule when set to Any", () => {
    const anyYear = { ...rules, graduationYear: null };
    expect(evaluateStudent({ ...good, gradYear: 1999 }, anyYear).eligible).toBe(
      true
    );
  });

  it("treats a CGPA equal to the minimum as passing", () => {
    expect(evaluateStudent({ ...good, cgpa: 7 }, rules).eligible).toBe(true);
  });
});

describe("applyRules and defaultRules", () => {
  it("sets eligibility on every student", () => {
    const out = applyRules([good, { ...good, studentId: "A2", cgpa: 5 }], rules);
    expect(out.map((s) => s.eligibility.eligible)).toEqual([true, false]);
  });

  it("builds default rules from the sheet's branches", () => {
    const r = defaultRules([
      createStudent({ studentId: "1", name: "a", branch: "IT" }),
      createStudent({ studentId: "2", name: "b", branch: "CSE" }),
      createStudent({ studentId: "3", name: "c", branch: "IT" }),
    ]);
    expect(r.branches).toEqual(["CSE", "IT"]);
    expect(r.minCgpa).toBe(6);
    expect(r.maxBacklogs).toBe(0);
    expect(r.graduationYear).toBeNull();
  });
});

describe("validateRules", () => {
  it("accepts valid rules", () => {
    expect(validateRules(rules)).toEqual([]);
  });

  it("flags bad values", () => {
    const errors = validateRules({
      minCgpa: 12,
      branches: [],
      maxBacklogs: -1,
      graduationYear: 1800,
    });
    expect(errors).toHaveLength(4);
  });

  it("flags an empty CGPA box", () => {
    expect(validateRules({ ...rules, minCgpa: "" })).toHaveLength(1);
  });
});