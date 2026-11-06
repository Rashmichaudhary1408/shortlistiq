import { describe, it, expect } from "vitest";
import { fallbackScore } from "../src/lib/fallbackScore.js";

const skills = [
  { name: "React", importance: "required" },
  { name: "Node.js", importance: "required" },
  { name: "Git", importance: "required" },
  { name: "Docker", importance: "preferred" },
  { name: "SQL", importance: "preferred" },
];

describe("fallbackScore", () => {
  it("finds skills by name and common aliases", () => {
    const out = fallbackScore({
      skills,
      resumeText: "Built apps with React and Node.js. Used Docker and PostgreSQL.",
    });
    const present = Object.fromEntries(
      out.skillResults.map((r) => [r.name, r.present])
    );
    expect(present).toEqual({
      React: true,
      "Node.js": true,
      Git: false,
      Docker: true,
      SQL: true,
    });
    expect(out.score).toBe(75);
    expect(out.breakdown.relevanceRating).toBeNull();
  });

  it("does not match a skill inside a longer word", () => {
    const out = fallbackScore({
      skills: [{ name: "Java", importance: "required" }],
      resumeText: "JavaScript developer",
    });
    expect(out.skillResults[0].present).toBe(false);
    expect(out.score).toBe(0);
  });

  it("accepts ReactJS for React and is case-insensitive", () => {
    const out = fallbackScore({
      skills: [{ name: "React", importance: "required" }],
      resumeText: "Experienced with REACTJS",
    });
    expect(out.skillResults[0].present).toBe(true);
    expect(out.skillResults[0].evidence).toContain("React");
  });
});