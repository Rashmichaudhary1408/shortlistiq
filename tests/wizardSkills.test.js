import { describe, it, expect } from "vitest";
import {
  wizardReducer,
  createInitialState,
  canLeaveSkills,
} from "../src/lib/wizardReducer.js";
import { createStudent } from "../src/lib/driveModel.js";

const students = [
  createStudent({ studentId: "A1", name: "A", branch: "CSE", gradYear: 2027 }),
  createStudent({ studentId: "A2", name: "B", branch: "IT", gradYear: 2027 }),
];

const withSheet = () =>
  wizardReducer(createInitialState(), {
    type: "SET_SHEET",
    payload: { fileName: "s.xlsx", students, errors: [], warnings: [] },
  });

describe("skills actions", () => {
  it("SET_EXTRACTION stores role, skills with ids and hints", () => {
    const s = wizardReducer(createInitialState(), {
      type: "SET_EXTRACTION",
      payload: {
        roleTitle: "Engineer",
        skills: [{ name: "React", importance: "required" }],
        eligibilityHints: {
          minCgpa: 7,
          branches: null,
          maxBacklogs: null,
          graduationYear: null,
        },
      },
    });
    expect(s.roleTitle).toBe("Engineer");
    expect(s.skills).toHaveLength(1);
    expect(typeof s.skills[0].id).toBe("string");
    expect(s.eligibilityHints.minCgpa).toBe(7);
    expect(s.hintsApplied).toBe(false);
  });

  it("SET_SKILLS keeps the raw list so typing is not interrupted", () => {
    const s = wizardReducer(createInitialState(), {
      type: "SET_SKILLS",
      payload: { skills: [{ id: "x", name: "", importance: "required" }] },
    });
    expect(s.skills).toHaveLength(1);
    expect(s.skills[0].name).toBe("");
  });

  it("APPLY_HINTS copies hints into the rules", () => {
    let s = withSheet();
    s = wizardReducer(s, {
      type: "SET_EXTRACTION",
      payload: {
        roleTitle: "",
        skills: [],
        eligibilityHints: {
          minCgpa: 8,
          branches: ["CSE"],
          maxBacklogs: null,
          graduationYear: 2027,
        },
      },
    });
    s = wizardReducer(s, { type: "APPLY_HINTS" });
    expect(s.rules).toMatchObject({
      minCgpa: 8,
      branches: ["CSE"],
      graduationYear: 2027,
    });
    expect(s.hintsApplied).toBe(true);
  });

  it("canLeaveSkills needs a valid job description and at least one skill", () => {
    let s = createInitialState();
    expect(canLeaveSkills(s)).toBe(false);
    s = wizardReducer(s, {
      type: "SET_FIELD",
      payload: { field: "jdText", value: "x".repeat(60) },
    });
    expect(canLeaveSkills(s)).toBe(false);
    s = wizardReducer(s, {
      type: "SET_SKILLS",
      payload: { skills: [{ id: "1", name: "React", importance: "required" }] },
    });
    expect(canLeaveSkills(s)).toBe(true);
    s = wizardReducer(s, {
      type: "SET_FIELD",
      payload: { field: "jdText", value: "too short" },
    });
    expect(canLeaveSkills(s)).toBe(false);
  });
});