import { describe, it, expect } from "vitest";
import { repairScoreResult } from "../src/lib/scoreRepair.js";

const skills = [
  { name: "JavaScript", importance: "required" },
  { name: "Docker", importance: "preferred" },
  { name: "SQL", importance: "preferred" },
];

describe("repairScoreResult", () => {
  it("returns null for unusable output", () => {
    expect(repairScoreResult(null, skills)).toBeNull();
    expect(repairScoreResult([], skills)).toBeNull();
    expect(repairScoreResult("text", skills)).toBeNull();
  });

  it("includes every requested skill exactly once", () => {
    const out = repairScoreResult(
      {
        skillResults: [
          { name: "javascript", present: true, evidence: "Wrote JS" },
          { name: "JavaScript", present: true, evidence: "duplicate" },
        ],
        relevantExperience: [],
        relevanceRating: 3,
        explanation: "ok",
      },
      skills
    );
    expect(out.skillResults.map((r) => r.name)).toEqual([
      "JavaScript",
      "Docker",
      "SQL",
    ]);
    expect(out.skillResults[0]).toEqual({
      name: "JavaScript",
      present: true,
      evidence: "Wrote JS",
    });
    expect(out.skillResults[1]).toEqual({
      name: "Docker",
      present: false,
      evidence: "",
    });
  });

  it("turns present:true with empty evidence into false", () => {
    const out = repairScoreResult(
      {
        skillResults: [{ name: "Docker", present: true, evidence: "   " }],
        relevantExperience: [],
        relevanceRating: 2,
        explanation: "",
      },
      skills
    );
    expect(out.skillResults[1].present).toBe(false);
  });

  it("rounds and clamps the rating", () => {
    const rate = (value) =>
      repairScoreResult(
        { skillResults: [], relevantExperience: [], relevanceRating: value, explanation: "" },
        skills
      ).relevanceRating;
    expect(rate(7.6)).toBe(5);
    expect(rate(-2)).toBe(0);
    expect(rate(3.6)).toBe(4);
    expect(rate("abc")).toBe(0);
  });

  it("caps experience at 3, coerces type and trims text", () => {
    const out = repairScoreResult(
      {
        skillResults: [],
        relevantExperience: [
          { title: " A ", type: "project", why: "good" },
          { title: "B", type: "weird", why: "x" },
          { title: "C", type: "internship", why: "y" },
          { title: "D", type: "project", why: "z" },
          { title: "", type: "project", why: "no title" },
        ],
        relevanceRating: 1,
        explanation: "  Neutral   summary ",
      },
      skills
    );
    expect(out.relevantExperience).toHaveLength(3);
    expect(out.relevantExperience[0].title).toBe("A");
    expect(out.relevantExperience[1].type).toBe("other");
    expect(out.explanation).toBe("Neutral summary");
  });
});