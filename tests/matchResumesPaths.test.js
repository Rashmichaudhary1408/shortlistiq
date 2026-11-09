import { describe, it, expect } from "vitest";
import { matchResumes } from "../src/lib/matchResumes.js";
import { createStudent } from "../src/lib/driveModel.js";

const pdf = (name, size = 100) => ({ name, size });
const statusOf = (student, files) =>
  matchResumes([student], files).students[0].resume.status;

describe("matchResumes with messy Resume column values", () => {
  it("matches a Windows path in the Resume column", () => {
    const s = createStudent({
      studentId: "A1",
      name: "A",
      resumeFile: "resumes\\A1.pdf",
    });
    expect(statusOf(s, [pdf("A1.pdf")])).toBe("found");
  });

  it("matches a folder path with forward slashes, ignoring case", () => {
    const s = createStudent({
      studentId: "A1",
      name: "A",
      resumeFile: "folder/sub/priya.pdf",
    });
    expect(statusOf(s, [pdf("Priya.PDF")])).toBe("found");
  });

  it("matches a Resume column value that has no .pdf ending", () => {
    const s = createStudent({
      studentId: "A1",
      name: "A",
      resumeFile: "priya",
    });
    expect(statusOf(s, [pdf("priya.pdf")])).toBe("found");
  });

  it("falls back to the Student ID when the named file was not uploaded", () => {
    const s = createStudent({
      studentId: "A1",
      name: "A",
      resumeFile: "other.pdf",
    });
    expect(statusOf(s, [pdf("a1.pdf")])).toBe("found");
  });
});
