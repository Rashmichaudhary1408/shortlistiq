import { describe, it, expect } from "vitest";
import { computeScore } from "../src/lib/scoring.js";

const skills = [
  { name: "JavaScript", importance: "required" },
  { name: "React", importance: "required" },
  { name: "Docker", importance: "preferred" },
  { name: "SQL", importance: "preferred" },
];

describe("computeScore", () => {
  it("blends required, preferred and relevance", () => {
    const out = computeScore({
      skills,
      skillResults: [
        { name: "JavaScript", present: true, evidence: "Built apps in JS" },
        { name: "React", present: false, evidence: "" },
        { name: "Docker", present: true, evidence: "Used Docker" },
        { name: "SQL", present: false, evidence: "" },
      ],
      relevanceRating: 4,
    });
    expect(out.score).toBe(56);
    expect(out.breakdown).toEqual({
      requiredMatched: 1,
      requiredTotal: 2,
      preferredMatched: 1,
      preferredTotal: 2,
      relevanceRating: 4,
    });
  });

  it("gives 100 for a perfect resume and 0 for an empty one", () => {
    const all = skills.map((s) => ({ name: s.name, present: true, evidence: "yes" }));
    const none = skills.map((s) => ({ name: s.name, present: false, evidence: "" }));
    expect(computeScore({ skills, skillResults: all, relevanceRating: 5 }).score).toBe(100);
    expect(computeScore({ skills, skillResults: none, relevanceRating: 0 }).score).toBe(0);
  });

  it("ignores present:true when evidence is empty", () => {
    const out = computeScore({
      skills: [{ name: "React", importance: "required" }],
      skillResults: [{ name: "React", present: true, evidence: "  " }],
      relevanceRating: 5,
    });
    expect(out.breakdown.requiredMatched).toBe(0);
    expect(out.skillResults[0].present).toBe(false);
  });

  it("rescales when there are no preferred skills", () => {
    const one = [{ name: "JavaScript", importance: "required" }];
    const present = [{ name: "JavaScript", present: true, evidence: "yes" }];
    expect(computeScore({ skills: one, skillResults: present, relevanceRating: 5 }).score).toBe(100);
    expect(computeScore({ skills: one, skillResults: present, relevanceRating: 0 }).score).toBe(75);
  });

  it("works without a relevance rating (basic match)", () => {
    const out = computeScore({
      skills,
      skillResults: [
        { name: "JavaScript", present: true, evidence: "x" },
        { name: "React", present: false, evidence: "" },
        { name: "Docker", present: true, evidence: "x" },
        { name: "SQL", present: false, evidence: "" },
      ],
      relevanceRating: null,
    });
    expect(out.score).toBe(50);
    expect(out.breakdown.relevanceRating).toBeNull();
  });

  it("matches skills case-insensitively and clamps the rating", () => {
    const out = computeScore({
      skills: [{ name: "React", importance: "required" }],
      skillResults: [{ name: "react", present: true, evidence: "ok" }],
      relevanceRating: 9,
    });
    expect(out.breakdown.requiredMatched).toBe(1);
    expect(out.breakdown.relevanceRating).toBe(5);
  });
});