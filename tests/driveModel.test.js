import { describe, it, expect } from "vitest";
import {
  createDrive,
  createStudent,
  createRules,
  createSkill,
  createIndexEntry,
  defaultTopN,
  clampTopN,
} from "../src/lib/driveModel.js";

describe("createStudent", () => {
  it("trims fields and defaults the resume file name", () => {
    const s = createStudent({ studentId: " 23CS001 ", name: " Priya " });
    expect(s.studentId).toBe("23CS001");
    expect(s.name).toBe("Priya");
    expect(s.resumeFile).toBe("23CS001.pdf");
    expect(s.override).toBeNull();
    expect(s.screening.score).toBeNull();
  });
});

describe("createRules and createSkill", () => {
  it("uses schema defaults", () => {
    const r = createRules();
    expect(r.minCgpa).toBe(6.0);
    expect(r.maxBacklogs).toBe(0);
    expect(r.graduationYear).toBeNull();
  });

  it("coerces unknown importance to required", () => {
    expect(createSkill({ name: " React ", importance: "x" })).toMatchObject({
      name: "React",
      importance: "required",
    });
    expect(createSkill({ name: "Docker", importance: "preferred" }).importance).toBe(
      "preferred"
    );
  });
});

describe("topN helpers", () => {
  it("defaults to 30 or the scored count if fewer", () => {
    expect(defaultTopN(50)).toBe(30);
    expect(defaultTopN(12)).toBe(12);
    expect(defaultTopN(0)).toBe(1);
  });

  it("clamps between 1 and the scored count", () => {
    expect(clampTopN(100, 20)).toBe(20);
    expect(clampTopN(0, 20)).toBe(1);
    expect(clampTopN("abc", 20)).toBe(20);
  });
});

describe("createDrive and createIndexEntry", () => {
  it("builds a v1 completed drive and a matching index entry", () => {
    const students = [
      createStudent({ studentId: "A1", name: "A" }),
      createStudent({
        studentId: "A2",
        name: "B",
        eligibility: { eligible: false, failedRules: [] },
      }),
    ];
    const drive = createDrive({ name: " Nimbus Drive ", students });
    expect(drive.schemaVersion).toBe(1);
    expect(drive.status).toBe("completed");
    expect(drive.name).toBe("Nimbus Drive");
    expect(drive.roleTitle).toBe("Role");

    const entry = createIndexEntry(drive, 1);
    expect(entry).toMatchObject({
      id: drive.id,
      totalCount: 2,
      eligibleCount: 1,
      shortlistedCount: 1,
    });
  });
});