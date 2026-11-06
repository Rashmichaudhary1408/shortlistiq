// Ranking, Top N and manual overrides. Pure functions. Nothing here is stored:
// overrides live on each student, so changing Top N never loses them.
import { clampTopN } from "./driveModel.js";

function isScored(student) {
  return typeof student.screening?.score === "number";
}

// Eligible, scored students ordered by score, then CGPA, then Student ID.
export function rankStudents(drive) {
  return drive.students
    .filter((s) => s.eligibility?.eligible && isScored(s))
    .sort(
      (a, b) =>
        b.screening.score - a.screening.score ||
        (b.cgpa ?? -1) - (a.cgpa ?? -1) ||
        a.studentId.localeCompare(b.studentId)
    );
}

export function getAutoShortlistIds(drive) {
  const ranked = rankStudents(drive);
  if (ranked.length === 0) return [];
  const count = clampTopN(drive.topN, ranked.length);
  return ranked.slice(0, count).map((s) => s.studentId);
}

// Auto shortlist, plus manual includes, minus manual excludes.
// Ranked students come first in rank order, then manually included others.
export function getFinalShortlistIds(drive) {
  const chosen = new Set(getAutoShortlistIds(drive));
  for (const student of drive.students) {
    if (student.override === "include") chosen.add(student.studentId);
    if (student.override === "exclude") chosen.delete(student.studentId);
  }
  const rankedIds = rankStudents(drive).map((s) => s.studentId);
  const rankedPart = rankedIds.filter((id) => chosen.has(id));
  const rankedSet = new Set(rankedIds);
  const extraPart = [...chosen]
    .filter((id) => !rankedSet.has(id))
    .sort((a, b) => a.localeCompare(b));
  return [...rankedPart, ...extraPart];
}

// Returns "shortlisted", "eligible", "resume_issue" or "ineligible".
export function getStudentState(student, finalIdSet) {
  if (finalIdSet.has(student.studentId)) return "shortlisted";
  if (!student.eligibility?.eligible) return "ineligible";
  const status = student.resume?.status;
  if (status === "missing" || status === "unreadable") return "resume_issue";
  return "eligible";
}