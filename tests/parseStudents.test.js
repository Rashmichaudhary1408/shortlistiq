import { describe, it, expect } from "vitest";
import { parseStudentRows } from "../src/lib/parseStudents.js";

const baseRow = {
  "Student ID": "23CS001",
  Name: "Priya Sharma",
  Branch: " cse  ",
  CGPA: "8.5",
  Backlogs: "1",
  "Graduation Year": 2027,
};

describe("parseStudentRows", () => {
  it("cleans a valid row", () => {
    const { students, errors } = parseStudentRows([baseRow]);
    expect(errors).toEqual([]);
    expect(students).toHaveLength(1);
    expect(students[0]).toMatchObject({
      studentId: "23CS001",
      name: "Priya Sharma",
      branch: "CSE",
      cgpa: 8.5,
      backlogs: 1,
      gradYear: 2027,
      resumeFile: "23CS001.pdf",
    });
    expect(students[0].dataWarnings).toEqual([]);
  });

  it("accepts alias headers", () => {
    const { students, errors } = parseStudentRows([
      {
        "Roll No": "R1",
        "Student Name": "Asha",
        Department: "it",
        GPA: 7.2,
        "Active Backlogs": 0,
        "Passout Year": 2026,
      },
    ]);
    expect(errors).toEqual([]);
    expect(students[0]).toMatchObject({
      studentId: "R1",
      branch: "IT",
      cgpa: 7.2,
      gradYear: 2026,
    });
  });

  it("reports missing required columns", () => {
    const { students, errors } = parseStudentRows([
      { "Student ID": "A1", Name: "X" },
    ]);
    expect(students).toHaveLength(0);
    expect(errors[0]).toContain("Branch");
    expect(errors[0]).toContain("CGPA");
  });

  it("nulls invalid numbers and records data warnings", () => {
    const { students } = parseStudentRows([
      { ...baseRow, CGPA: 11, Backlogs: -1, "Graduation Year": "abc" },
    ]);
    expect(students[0].cgpa).toBeNull();
    expect(students[0].backlogs).toBeNull();
    expect(students[0].gradYear).toBeNull();
    expect(students[0].dataWarnings).toHaveLength(3);
    expect(students[0].dataWarnings[0]).toContain("CGPA");
  });

  it("skips duplicate student IDs and keeps the first", () => {
    const { students, warnings } = parseStudentRows([
      baseRow,
      { ...baseRow, Name: "Someone Else" },
    ]);
    expect(students).toHaveLength(1);
    expect(students[0].name).toBe("Priya Sharma");
    expect(warnings.some((w) => w.includes("duplicate"))).toBe(true);
  });

  it("skips rows with a missing name", () => {
    const { students, warnings } = parseStudentRows([
      baseRow,
      { ...baseRow, "Student ID": "23CS002", Name: "" },
    ]);
    expect(students).toHaveLength(1);
    expect(warnings.some((w) => w.includes("missing Name"))).toBe(true);
  });

  it("ignores completely blank rows", () => {
    const { students, warnings } = parseStudentRows([
      baseRow,
      { "Student ID": "", Name: "", Branch: "", CGPA: "" },
    ]);
    expect(students).toHaveLength(1);
    expect(warnings.some((w) => w.includes("Row 3"))).toBe(false);
  });

  it("uses the Resume column when present", () => {
    const { students } = parseStudentRows([
      { ...baseRow, Resume: "priya_resume.pdf" },
    ]);
    expect(students[0].resumeFile).toBe("priya_resume.pdf");
  });

  it("returns an error for an empty sheet", () => {
    const { students, errors } = parseStudentRows([]);
    expect(students).toHaveLength(0);
    expect(errors).toHaveLength(1);
  });
});