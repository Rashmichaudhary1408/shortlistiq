// Rules decide eligibility. Every failed rule is recorded, not just the first.
import { createRules } from "./driveModel.js";

function fmt(n) {
  const s = String(Number(Number(n).toFixed(2)));
  return s.includes(".") ? s : `${s}.0`;
}

function toNum(value) {
  if (value === "" || value === null || value === undefined) return NaN;
  return Number(value);
}

export function defaultRules(students) {
  const branches = [
    ...new Set((students || []).map((s) => s.branch).filter(Boolean)),
  ].sort();
  return createRules({ branches });
}

// Returns a list of problems with the rule values (empty list means valid).
export function validateRules(rules) {
  const errors = [];
  const minCgpa = toNum(rules.minCgpa);
  if (!Number.isFinite(minCgpa) || minCgpa < 0 || minCgpa > 10) {
    errors.push("Minimum CGPA must be a number from 0 to 10.");
  }
  if (!Array.isArray(rules.branches) || rules.branches.length === 0) {
    errors.push("Select at least one branch.");
  }
  const maxBacklogs = toNum(rules.maxBacklogs);
  if (!Number.isInteger(maxBacklogs) || maxBacklogs < 0) {
    errors.push("Maximum backlogs must be a whole number, 0 or more.");
  }
  const year = rules.graduationYear;
  if (year !== null && year !== undefined && year !== "") {
    const y = toNum(year);
    if (!Number.isInteger(y) || y < 2000 || y > 2100) {
      errors.push("Graduation year must be between 2000 and 2100, or Any.");
    }
  }
  return errors;
}

export function evaluateStudent(student, rules) {
  const failedRules = [];

  const minCgpa = toNum(rules.minCgpa);
  if (Number.isFinite(minCgpa)) {
    if (student.cgpa === null || student.cgpa === undefined) {
      failedRules.push({ rule: "cgpa", message: "CGPA missing or invalid" });
    } else if (student.cgpa < minCgpa) {
      failedRules.push({
        rule: "cgpa",
        message: `CGPA ${fmt(student.cgpa)} < ${fmt(minCgpa)}`,
      });
    }
  }

  const branches = (rules.branches || [])
    .map((b) => String(b).trim().toUpperCase())
    .filter(Boolean);
  if (branches.length > 0) {
    if (!student.branch) {
      failedRules.push({ rule: "branch", message: "Branch missing or invalid" });
    } else if (!branches.includes(String(student.branch).toUpperCase())) {
      failedRules.push({
        rule: "branch",
        message: `Branch ${student.branch} not in ${branches.join(", ")}`,
      });
    }
  }

  const maxBacklogs = toNum(rules.maxBacklogs);
  if (Number.isFinite(maxBacklogs)) {
    if (student.backlogs === null || student.backlogs === undefined) {
      failedRules.push({
        rule: "backlogs",
        message: "Backlogs missing or invalid",
      });
    } else if (student.backlogs > maxBacklogs) {
      failedRules.push({
        rule: "backlogs",
        message: `Backlogs ${student.backlogs} > ${maxBacklogs}`,
      });
    }
  }

  const wantedYear = rules.graduationYear;
  if (wantedYear !== null && wantedYear !== undefined && wantedYear !== "") {
    const wanted = toNum(wantedYear);
    if (Number.isFinite(wanted)) {
      if (student.gradYear === null || student.gradYear === undefined) {
        failedRules.push({
          rule: "year",
          message: "Graduation year missing or invalid",
        });
      } else if (student.gradYear !== wanted) {
        failedRules.push({
          rule: "year",
          message: `Graduation year ${student.gradYear} is not ${wanted}`,
        });
      }
    }
  }

  return { eligible: failedRules.length === 0, failedRules };
}

export function applyRules(students, rules) {
  return (students || []).map((student) => ({
    ...student,
    eligibility: evaluateStudent(student, rules),
  }));
}