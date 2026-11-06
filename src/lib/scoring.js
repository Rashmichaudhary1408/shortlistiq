// Turns the AI's evidence into a 0 to 100 score. The AI never supplies the number.
import { LIMITS } from "./constants.js";

// Required 60, preferred 20, relevance 20. Parts that do not apply are left out
// and the remaining weights are rescaled to 100.
export const WEIGHTS = { required: 60, preferred: 20, relevance: 20 };

function cleanEvidence(value) {
  return String(value ?? "")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, LIMITS.evidenceMax);
}

// One result per drive skill. "present" is only true when evidence is non-empty.
export function buildSkillResults(skills, skillResults) {
  const byName = new Map();
  for (const result of Array.isArray(skillResults) ? skillResults : []) {
    const key = String(result?.name ?? "").trim().toLowerCase();
    if (key && !byName.has(key)) byName.set(key, result);
  }
  return (skills || []).map((skill) => {
    const result = byName.get(String(skill.name).trim().toLowerCase());
    const evidence = cleanEvidence(result?.evidence);
    const present = result?.present === true && evidence.length > 0;
    return {
      name: skill.name,
      importance: skill.importance === "preferred" ? "preferred" : "required",
      present,
      evidence: present ? evidence : "",
    };
  });
}

export function computeScore({ skills, skillResults, relevanceRating }) {
  const results = buildSkillResults(skills, skillResults);
  const required = results.filter((r) => r.importance === "required");
  const preferred = results.filter((r) => r.importance === "preferred");
  const requiredMatched = required.filter((r) => r.present).length;
  const preferredMatched = preferred.filter((r) => r.present).length;

  const rating = Number(relevanceRating);
  const hasRating =
    relevanceRating !== null &&
    relevanceRating !== undefined &&
    relevanceRating !== "" &&
    Number.isFinite(rating);
  const clamped = hasRating ? Math.min(5, Math.max(0, Math.round(rating))) : null;

  const parts = [];
  if (required.length > 0) {
    parts.push([WEIGHTS.required, requiredMatched / required.length]);
  }
  if (preferred.length > 0) {
    parts.push([WEIGHTS.preferred, preferredMatched / preferred.length]);
  }
  if (hasRating) parts.push([WEIGHTS.relevance, clamped / 5]);

  const totalWeight = parts.reduce((sum, [weight]) => sum + weight, 0);
  const score =
    totalWeight === 0
      ? 0
      : Math.round(
          (100 * parts.reduce((sum, [weight, ratio]) => sum + weight * ratio, 0)) /
            totalWeight
        );

  return {
    score,
    breakdown: {
      requiredMatched,
      requiredTotal: required.length,
      preferredMatched,
      preferredTotal: preferred.length,
      relevanceRating: clamped,
    },
    skillResults: results,
  };
}