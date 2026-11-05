import { describe, it, expect } from "vitest";
import { matchResumes } from "../src/lib/matchResumes.js";
import { createStudent } from "../src/lib/driveModel.js";

const pdf = (name, size = 1000) => ({ name, size });

describe("matchResumes", () => {
  it("matches by student ID, ignoring case", () => {
    const students = [createStudent({ studentId: "A1", name: "A" })];
    const file = pdf("a1.PDF");
    const result = matchResumes(students, [file]);
    expect(result.students[0].resume.status).toBe("found");
    expect(result.fileMap.get("A1")).toBe(file);
    expect(result.unmatchedFiles).toEqual([]);
  });

  it("prefers the file name from the Resume column", () => {
    const students = [
      createStudent({ studentId: "A1", name: "A", resumeFile: "priya.pdf" }),
    ];
    const result = matchResumes(students, [pdf("priya.pdf")]);
    expect(result.students[0].resume.status).toBe("found");
  });

  it("marks students without a PDF as missing", () => {
    const students = [createStudent({ studentId: "A1", name: "A" })];
    const result = matchResumes(students, []);
    expect(result.students[0].resume.status).toBe("missing");
    expect(result.fileMap.size).toBe(0);
  });

  it("lists PDFs that match nobody", () => {
    const students = [createStudent({ studentId: "A1", name: "A" })];
    const result = matchResumes(students, [pdf("A1.pdf"), pdf("stranger.pdf")]);
    expect(result.unmatchedFiles).toEqual(["stranger.pdf"]);
  });

  it("rejects non-PDF, empty and duplicate files", () => {
    const students = [createStudent({ studentId: "A1", name: "A" })];
    const result = matchResumes(students, [
      pdf("notes.docx"),
      pdf("empty.pdf", 0),
      pdf("A1.pdf"),
      pdf("a1.pdf"),
    ]);
    const reasons = result.rejectedFiles.map((f) => f.reason);
    expect(reasons).toEqual([
      "Not a PDF file",
      "File is empty",
      "Duplicate file name",
    ]);
    expect(result.students[0].resume.status).toBe("found");
  });
});