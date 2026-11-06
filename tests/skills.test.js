import { describe, it, expect } from "vitest";
import {
  normalizeSkills,
  validateExtraction,
  applyHintsToRules,
} from "../src/lib/skills.js";
import { createRules, createStudent } from "../src/lib/driveModel.js";

describe("normalizeSkills", () => {
  it("trims, dedupes, coerces importance and adds ids", () => {
    const out = normalizeSkills([
      { name: " React ", importance: "required" },
      { name: "react", importance: "preferred" },
      { name: "Docker", importance: "weird" },
      { name: "   " },
    ]);
    expect(out.map((s) => s.name)).toEqual(["React", "Docker"]);
    expect(out.map((s) => s.importance)).toEqual(["required", "required"]);
    expect(out.every((s) => typeof s.id === "string" && s.id.length > 0)).toBe(
      true
    );
  });

  it("lets required win when a duplicate is marked required", () => {
    const out = normalizeSkills([
      { name: "SQL", importance: "preferred" },
      { name: "sql", importance: "required" },
    ]);
    expect(out).toHaveLength(1);
    expect(out[0]).toMatchObject({ name: "SQL", importance: "required" });
  });

  it("caps the list at 25 skills", () => {
    const many = Array.from({ length: 30 }, (_, i) => ({ name: `Skill ${i}` }));
    expect(normalizeSkills(many)).toHaveLength(25);
  });
});

describe("validateExtraction", () => {
  it("cleans a valid extraction", () => {
    const result = validateExtraction({
      roleTitle: "  Associate Software Engineer ",
      skills: [
        { name: "JavaScript", importance: "required" },
        { name: "typescript", importance: "preferred" },
        { name: "javascript", importance: "preferred" },
      ],
      eligibilityHints: {
        minCgpa: 7,
        branches: ["cse", " it ", "CSE"],
        maxBacklogs: 0,
        graduationYear: 2027,
      },
    });
    expect(result.roleTitle).toBe("Associate Software Engineer");
    expect(result.skills).toEqual([
      { name: "JavaScript", importance: "required" },
      { name: "typescript", importance: "preferred" },
    ]);
    expect(result.eligibilityHints).toEqual({
      minCgpa: 7,
      branches: ["CSE", "IT"],
      maxBacklogs: 0,
      graduationYear: 2027,
    });
  });

  it("nulls out-of-range hints and keeps unstated hints null", () => {
    const bad = validateExtraction({
      roleTitle: "X",
      skills: [],
      eligibilityHints: {
        minCgpa: 11,
        branches: [],
        maxBacklogs: -1,
        graduationYear: 1800,
      },
    });
    expect(bad.eligibilityHints).toEqual({
      minCgpa: null,
      branches: null,
      maxBacklogs: null,
      graduationYear: null,
    });

    const partial = validateExtraction({
      roleTitle: "X",
      skills: [],
      eligibilityHints: { minCgpa: null, maxBacklogs: 0 },
    });
    expect(partial.eligibilityHints.minCgpa).toBeNull();
    expect(partial.eligibilityHints.maxBacklogs).toBe(0);
  });

  it("returns null for unusable output", () => {
    expect(validateExtraction(null)).toBeNull();
    expect(validateExtraction([])).toBeNull();
    expect(validateExtraction({ skills: "React" })).toBeNull();
  });
});

describe("applyHintsToRules", () => {
  const students = [
    createStudent({ studentId: "1", name: "a", branch: "CSE", gradYear: 2027 }),
    createStudent({ studentId: "2", name: "b", branch: "IT", gradYear: 2027 }),
  ];

  it("applies hints that match the student sheet", () => {
    const next = applyHintsToRules(
      createRules({ branches: ["CSE", "IT"] }),
      {
        minCgpa: 7.5,
        branches: ["CSE", "ME"],
        maxBacklogs: 1,
        graduationYear: 2027,
      },
      students
    );
    expect(next).toMatchObject({
      minCgpa: 7.5,
      branches: ["CSE"],
      maxBacklogs: 1,
      graduationYear: 2027,
    });
  });

  it("skips branches and years that are not in the sheet", () => {
    const rules = createRules({ branches: ["CSE", "IT"] });
    const next = applyHintsToRules(
      rules,
      { minCgpa: null, branches: ["ME"], maxBacklogs: null, graduationYear: 2030 },
      students
    );
    expect(next.branches).toEqual(["CSE", "IT"]);
    expect(next.graduationYear).toBeNull();
    expect(applyHintsToRules(rules, null, students)).toBe(rules);
  });
});