// Factory functions that build correctly shaped data objects (see SCHEMA.md).
// Pure functions: no React, no network, no storage.

import {
  SCHEMA_VERSION,
  LIMITS,
  DEFAULT_RULES,
  RESUME_STATUS,
} from "./constants.js";

export function makeId() {
  if (globalThis.crypto && typeof globalThis.crypto.randomUUID === "function") {
    return globalThis.crypto.randomUUID();
  }
  return `id-${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

export function createRules(overrides = {}) {
  return {
    minCgpa: DEFAULT_RULES.minCgpa,
    branches: [],
    maxBacklogs: DEFAULT_RULES.maxBacklogs,
    graduationYear: DEFAULT_RULES.graduationYear,
    ...overrides,
  };
}

export function createSkill({ name, importance = "required", id } = {}) {
  return {
    id: id || makeId(),
    name: String(name ?? "").trim(),
    importance: importance === "preferred" ? "preferred" : "required",
  };
}

export function createScreening() {
  return {
    method: null,
    score: null,
    breakdown: {
      requiredMatched: null,
      requiredTotal: null,
      preferredMatched: null,
      preferredTotal: null,
      relevanceRating: null,
    },
    skillResults: [],
    relevantExperience: [],
    explanation: "",
  };
}

export function createStudent(fields = {}) {
  const studentId = String(fields.studentId ?? "").trim();
  return {
    studentId,
    name: String(fields.name ?? "").trim(),
    branch: String(fields.branch ?? "").trim(),
    cgpa: fields.cgpa ?? null,
    backlogs: fields.backlogs ?? null,
    gradYear: fields.gradYear ?? null,
    resumeFile: fields.resumeFile || (studentId ? `${studentId}.pdf` : ""),
    dataWarnings: fields.dataWarnings ? [...fields.dataWarnings] : [],
    eligibility: fields.eligibility || { eligible: true, failedRules: [] },
    resume: fields.resume || {
      status: RESUME_STATUS.missing,
      message: "Resume not matched yet",
    },
    screening: fields.screening || createScreening(),
    override: fields.override ?? null,
  };
}

export function defaultTopN(scoredCount) {
  const count = Number.isFinite(scoredCount) ? Math.floor(scoredCount) : 0;
  if (count <= 0) return 1;
  return Math.min(LIMITS.defaultTopN, count);
}

export function clampTopN(topN, scoredCount) {
  const max = Math.max(1, Math.floor(scoredCount) || 1);
  const value = Math.floor(Number(topN));
  if (!Number.isFinite(value)) return defaultTopN(scoredCount);
  return Math.min(Math.max(value, 1), max);
}

export function createDrive(fields = {}) {
  const now = new Date().toISOString();
  return {
    id: fields.id || makeId(),
    schemaVersion: SCHEMA_VERSION,
    name: String(fields.name ?? "").trim().slice(0, LIMITS.driveNameMax),
    company: String(fields.company ?? "").trim().slice(0, LIMITS.companyMax),
    roleTitle:
      String(fields.roleTitle ?? "").trim().slice(0, LIMITS.roleTitleMax) ||
      "Role",
    createdAt: fields.createdAt || now,
    updatedAt: fields.updatedAt || now,
    status: "completed",
    jdText: String(fields.jdText ?? ""),
    skills: fields.skills ? [...fields.skills] : [],
    rules: fields.rules || createRules(),
    topN: fields.topN ?? 1,
    usedFallbackCount: fields.usedFallbackCount ?? 0,
    warnings: fields.warnings ? [...fields.warnings] : [],
    students: fields.students ? [...fields.students] : [],
  };
}

export function createIndexEntry(drive, shortlistedCount = 0) {
  const students = drive.students || [];
  return {
    id: drive.id,
    name: drive.name,
    company: drive.company,
    roleTitle: drive.roleTitle,
    createdAt: drive.createdAt,
    updatedAt: drive.updatedAt,
    eligibleCount: students.filter((s) => s.eligibility?.eligible).length,
    shortlistedCount: Math.min(shortlistedCount, students.length),
    totalCount: students.length,
  };
}