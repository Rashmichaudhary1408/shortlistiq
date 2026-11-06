// Cleans skill lists and validates the AI's extraction. Pure logic, no network.
import { LIMITS } from "./constants.js";
import { createSkill } from "./driveModel.js";

function cleanName(value) {
  return String(value ?? "")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, LIMITS.skillNameMax);
}

// Trim, dedupe (case-insensitive, "required" wins), cap at 25, coerce importance.
function cleanSkills(list) {
  const out = [];
  const seen = new Map();
  for (const item of Array.isArray(list) ? list : []) {
    const raw = typeof item === "string" ? { name: item } : item;
    const name = cleanName(raw?.name);
    if (!name) continue;
    const importance = raw?.importance === "preferred" ? "preferred" : "required";
    const key = name.toLowerCase();
    if (seen.has(key)) {
      if (importance === "required") out[seen.get(key)].importance = "required";
      continue;
    }
    if (out.length >= LIMITS.skillsMax) break;
    seen.set(key, out.length);
    const skill = { name, importance };
    if (typeof raw?.id === "string" && raw.id) skill.id = raw.id;
    out.push(skill);
  }
  return out;
}

// Returns skills with stable ids (used as React keys and stored in the drive).
export function normalizeSkills(list) {
  return cleanSkills(list).map((skill) => createSkill(skill));
}

function numberOrNull(value) {
  if (value === null || value === undefined || value === "") return null;
  const n = Number(value);
  return Number.isFinite(n) ? n : null;
}

// Validates the raw AI output. Returns a clean object, or null if unusable.
export function validateExtraction(raw) {
  if (!raw || typeof raw !== "object" || Array.isArray(raw)) return null;
  if (!Array.isArray(raw.skills)) return null;

  const hints =
    raw.eligibilityHints &&
    typeof raw.eligibilityHints === "object" &&
    !Array.isArray(raw.eligibilityHints)
      ? raw.eligibilityHints
      : {};

  let minCgpa = numberOrNull(hints.minCgpa);
  if (minCgpa !== null && (minCgpa < 0 || minCgpa > 10)) minCgpa = null;

  let maxBacklogs = numberOrNull(hints.maxBacklogs);
  if (maxBacklogs !== null && (!Number.isInteger(maxBacklogs) || maxBacklogs < 0)) {
    maxBacklogs = null;
  }

  let graduationYear = numberOrNull(hints.graduationYear);
  if (
    graduationYear !== null &&
    (!Number.isInteger(graduationYear) || graduationYear < 2000 || graduationYear > 2100)
  ) {
    graduationYear = null;
  }

  let branches = null;
  if (Array.isArray(hints.branches)) {
    const cleaned = [
      ...new Set(
        hints.branches.map((b) => cleanName(b).toUpperCase()).filter(Boolean)
      ),
    ];
    branches = cleaned.length > 0 ? cleaned : null;
  }

  return {
    roleTitle: String(raw.roleTitle ?? "")
      .trim()
      .slice(0, LIMITS.roleTitleMax),
    skills: cleanSkills(raw.skills),
    eligibilityHints: { minCgpa, branches, maxBacklogs, graduationYear },
  };
}

// Copies stated hints into the rules. Branches and years that are not in the
// student sheet are skipped, so the Rules screen never shows an impossible value.
export function applyHintsToRules(rules, hints, students) {
  if (!hints) return rules;
  const next = { ...rules };

  if (hints.minCgpa !== null && hints.minCgpa !== undefined) {
    next.minCgpa = hints.minCgpa;
  }
  if (hints.maxBacklogs !== null && hints.maxBacklogs !== undefined) {
    next.maxBacklogs = hints.maxBacklogs;
  }

  const sheetYears = new Set((students || []).map((s) => s.gradYear));
  if (
    hints.graduationYear !== null &&
    hints.graduationYear !== undefined &&
    sheetYears.has(hints.graduationYear)
  ) {
    next.graduationYear = hints.graduationYear;
  }

  if (Array.isArray(hints.branches) && hints.branches.length > 0) {
    const sheetBranches = new Set((students || []).map((s) => s.branch));
    const matching = hints.branches.filter((b) => sheetBranches.has(b)).sort();
    if (matching.length > 0) next.branches = matching;
  }
  return next;
}