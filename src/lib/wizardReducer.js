// Holds everything the "New drive" wizard remembers. Pure logic, no React.
import { createRules } from "./driveModel.js";
import { defaultRules } from "./eligibility.js";
import { normalizeSkills, applyHintsToRules } from "./skills.js";
import { LIMITS } from "./constants.js";

export const TOTAL_STEPS = 4;

export function createInitialState() {
  return {
    step: 1,
    driveName: "",
    company: "",
    sheetName: "",
    students: [],
    sheetErrors: [],
    sheetWarnings: [],
    pdfFiles: [],
    fileMap: new Map(),
    unmatchedFiles: [],
    rejectedFiles: [],
    jdText: "",
    roleTitle: "",
    skills: [],
    eligibilityHints: null,
    hintsApplied: false,
    rules: createRules(),
  };
}

export function canLeaveUpload(state) {
  return (
    state.students.length > 0 &&
    state.sheetErrors.length === 0 &&
    state.driveName.trim().length > 0
  );
}

export function canLeaveSkills(state) {
  const jdLength = state.jdText.trim().length;
  return (
    jdLength >= LIMITS.jdMin &&
    jdLength <= LIMITS.jdMax &&
    normalizeSkills(state.skills).length >= 1
  );
}

export function wizardReducer(state, action) {
  const payload = action.payload || {};
  switch (action.type) {
    case "SET_SHEET": {
      const match = payload.match || null;
      const students = match ? match.students : payload.students || [];
      return {
        ...state,
        sheetName: payload.fileName || "",
        students,
        sheetErrors: payload.errors || [],
        sheetWarnings: payload.warnings || [],
        fileMap: match ? match.fileMap : new Map(),
        unmatchedFiles: match ? match.unmatchedFiles : [],
        rejectedFiles: match ? match.rejectedFiles : [],
        hintsApplied: false,
        rules: students.length > 0 ? defaultRules(students) : createRules(),
      };
    }
    case "SET_PDFS": {
      const match = payload.match;
      return {
        ...state,
        pdfFiles: payload.files || [],
        students: match ? match.students : state.students,
        fileMap: match ? match.fileMap : new Map(),
        unmatchedFiles: match ? match.unmatchedFiles : [],
        rejectedFiles: match ? match.rejectedFiles : [],
      };
    }
    case "SET_FIELD":
      return { ...state, [payload.field]: payload.value };
    case "SET_EXTRACTION":
      return {
        ...state,
        roleTitle: payload.roleTitle || state.roleTitle,
        skills: normalizeSkills(payload.skills),
        eligibilityHints: payload.eligibilityHints || null,
        hintsApplied: false,
      };
    case "SET_SKILLS":
      return { ...state, skills: payload.skills || [] };
    case "APPLY_HINTS":
      if (!state.eligibilityHints) return state;
      return {
        ...state,
        hintsApplied: true,
        rules: applyHintsToRules(
          state.rules,
          state.eligibilityHints,
          state.students
        ),
      };
    case "SET_RULES":
      return { ...state, rules: { ...state.rules, ...payload.rules } };
    case "GO_TO_STEP": {
      const step = Math.min(
        Math.max(Math.floor(Number(payload.step)) || 1, 1),
        TOTAL_STEPS
      );
      return { ...state, step };
    }
    case "RESET":
      return createInitialState();
    default:
      return state;
  }
}