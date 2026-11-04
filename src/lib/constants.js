// Shared constants for ShortlistIQ. Values come from SCHEMA.md and API.md.

export const SCHEMA_VERSION = 1;

export const STORAGE_KEYS = {
  index: "shortlistiq:index",
  drivePrefix: "shortlistiq:drive:",
};

export const LIMITS = {
  jdMin: 50,
  jdMax: 8000,
  skillsMax: 25,
  skillNameMax: 60,
  roleTitleMax: 150,
  driveNameMax: 100,
  companyMax: 100,
  resumeTextMax: 12000,
  resumeMinChars: 150,
  evidenceMax: 150,
  experienceMax: 3,
  studentsMax: 100,
  defaultTopN: 30,
};

export const API_LIMITS = {
  bodyMaxBytes: 200 * 1024,
  rateLimitRequests: 150,
  rateLimitWindowMs: 10 * 60 * 1000,
  maxDurationSeconds: 30,
};

export const IMPORTANCE = {
  required: "required",
  preferred: "preferred",
};

export const OVERRIDE = {
  include: "include",
  exclude: "exclude",
};

export const RESUME_STATUS = {
  found: "found",
  missing: "missing",
  ok: "ok",
  unreadable: "unreadable",
  notScanned: "not_scanned",
};

export const RULE_NAMES = {
  cgpa: "cgpa",
  branch: "branch",
  backlogs: "backlogs",
  year: "year",
};

export const DEFAULT_RULES = {
  minCgpa: 6.0,
  maxBacklogs: 0,
  graduationYear: null,
};

export const SCORING_METHOD = {
  ai: "ai",
  fallback: "fallback",
};

export const ERROR_CODES = {
  invalidInput: "INVALID_INPUT",
  payloadTooLarge: "PAYLOAD_TOO_LARGE",
  unsupportedMediaType: "UNSUPPORTED_MEDIA_TYPE",
  rateLimited: "RATE_LIMITED",
  aiRateLimited: "AI_RATE_LIMITED",
  aiUnavailable: "AI_UNAVAILABLE",
  aiBadOutput: "AI_BAD_OUTPUT",
  aiTimeout: "AI_TIMEOUT",
  serverError: "SERVER_ERROR",
};