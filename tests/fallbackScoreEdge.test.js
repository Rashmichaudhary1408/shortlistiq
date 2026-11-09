import { describe, it, expect } from "vitest";
import { fallbackScore } from "../src/lib/fallbackScore.js";

const has = (skill, text) =>
  fallbackScore({
    skills: [{ name: skill, importance: "required" }],
    resumeText: text,
  }).skillResults[0].present;

describe("fallbackScore whole-word matching", () => {
  it("matches a skill at the very start of the text", () => {
    expect(has("React", "React developer")).toBe(true);
  });

  it("does not match Git inside digital or GitHub", () => {
    expect(has("Git", "digital marketing")).toBe(false);
    expect(has("Git", "GitHub projects")).toBe(false);
    expect(has("Git", "uses git daily")).toBe(true);
  });

  it("matches skills with symbols such as C++ and C#", () => {
    expect(has("C++", "Experienced in C++ and Python")).toBe(true);
    expect(has("C#", "wrote c# services")).toBe(true);
  });

  it("accepts NodeJS for Node.js", () => {
    expect(has("Node.js", "Backend with NodeJS")).toBe(true);
  });

  it("does not treat JavaScript as Java", () => {
    expect(has("Java", "JavaScript developer")).toBe(false);
  });
});
