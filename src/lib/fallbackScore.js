// Free keyword matcher used when the AI is unavailable. Labelled "Basic match".
import { computeScore } from "./scoring.js";

// Extra names for common skills (keys are lowercase with symbols removed).
const ALIASES = {
  sql: ["mysql", "postgresql", "postgres", "sqlite", "mssql"],
  react: ["reactjs", "react.js"],
  nodejs: ["node"],
  javascript: ["ecmascript"],
  typescript: ["ts"],
  mongodb: ["mongo"],
  restapis: ["restful", "rest api"],
  restapi: ["restful", "rest apis"],
  machinelearning: ["ml"],
  html: ["html5"],
  css: ["css3"],
};

function escapeRegex(text) {
  return text.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function variantsFor(name) {
  const lower = String(name).trim().toLowerCase();
  const variants = new Set([lower]);
  const compact = lower.replace(/[^a-z0-9+#]/g, "");
  variants.add(compact);
  variants.add(lower.replace(/[.\-_/]/g, " "));
  if (lower.length > 3 && lower.endsWith("s")) variants.add(lower.slice(0, -1));
  for (const alias of ALIASES[compact] || []) variants.add(alias);
  return [...variants].filter(Boolean);
}

function mentions(textLower, name) {
  return variantsFor(name).some((variant) =>
    new RegExp(`(?<![a-z0-9])${escapeRegex(variant)}(?![a-z0-9])`).test(textLower)
  );
}

export function fallbackScore({ skills, resumeText }) {
  const textLower = String(resumeText ?? "").toLowerCase();
  const skillResults = (skills || []).map((skill) => {
    const found = mentions(textLower, skill.name);
    return {
      name: skill.name,
      present: found,
      evidence: found ? `Resume mentions "${skill.name}"` : "",
    };
  });
  const { score, breakdown, skillResults: finalResults } = computeScore({
    skills,
    skillResults,
    relevanceRating: null,
  });
  return { score, breakdown, skillResults: finalResults };
}