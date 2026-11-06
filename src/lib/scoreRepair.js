// Cleans the AI's answer so the rest of the app can trust its shape.
import { LIMITS } from "./constants.js";

const EXPERIENCE_TYPES = ["project", "internship", "other"];

function text(value, max) {
  return String(value ?? "")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, max);
}

// Returns a clean result, or null if the output is unusable.
export function repairScoreResult(raw, skills) {
  if (!raw || typeof raw !== "object" || Array.isArray(raw)) return null;

  const byName = new Map();
  for (const item of Array.isArray(raw.skillResults) ? raw.skillResults : []) {
    const key = text(item?.name, LIMITS.skillNameMax).toLowerCase();
    if (key && !byName.has(key)) byName.set(key, item);
  }

  const skillResults = (skills || []).map((skill) => {
    const item = byName.get(String(skill.name).trim().toLowerCase());
    const evidence = text(item?.evidence, LIMITS.evidenceMax);
    const present = item?.present === true && evidence.length > 0;
    return { name: skill.name, present, evidence: present ? evidence : "" };
  });

  const relevantExperience = (
    Array.isArray(raw.relevantExperience) ? raw.relevantExperience : []
  )
    .map((item) => ({
      title: text(item?.title, 100),
      type: EXPERIENCE_TYPES.includes(item?.type) ? item.type : "other",
      why: text(item?.why, LIMITS.evidenceMax),
    }))
    .filter((item) => item.title)
    .slice(0, LIMITS.experienceMax);

  const rating = Number(raw.relevanceRating);
  const relevanceRating = Number.isFinite(rating)
    ? Math.min(5, Math.max(0, Math.round(rating)))
    : 0;

  return {
    skillResults,
    relevantExperience,
    relevanceRating,
    explanation: text(raw.explanation, 300),
  };
}