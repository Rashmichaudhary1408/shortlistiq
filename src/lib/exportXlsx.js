// Builds the Excel export. buildSheets is pure (easy to test).
// exportDriveToXlsx runs in the browser and downloads the file.
import {
  rankStudents,
  getFinalShortlistIds,
  getStudentState,
} from "./shortlist.js";

const STATE_LABELS = {
  shortlisted: "Shortlisted",
  eligible: "Eligible (not in Top N)",
  resume_issue: "Resume problem",
  ineligible: "Not eligible",
};
const METHOD_LABELS = { ai: "AI", fallback: "Basic match" };

const SHORTLIST_HEADERS = [
  "Rank",
  "Student ID",
  "Name",
  "Branch",
  "CGPA",
  "Score",
  "Method",
  "Required skills matched",
  "Preferred skills matched",
  "Relevance (0-5)",
  "Explanation",
  "Selection",
];

const ALL_HEADERS = [
  "Student ID",
  "Name",
  "Branch",
  "CGPA",
  "Backlogs",
  "Graduation year",
  "Status",
  "Score",
  "Method",
  "Notes",
  "Manual override",
];

function orderedStudents(drive) {
  const ranked = rankStudents(drive);
  const rankedIds = new Set(ranked.map((s) => s.studentId));
  return [
    ...ranked,
    ...drive.students.filter((s) => !rankedIds.has(s.studentId)),
  ];
}

export function buildSheets(drive) {
  const finalIds = getFinalShortlistIds(drive);
  const finalSet = new Set(finalIds);
  const byId = new Map(drive.students.map((s) => [s.studentId, s]));

  const shortlist = [
    SHORTLIST_HEADERS,
    ...finalIds.map((id, index) => {
      const s = byId.get(id);
      const sc = s.screening || {};
      const b = sc.breakdown || {};
      const scored = typeof sc.score === "number";
      return [
        index + 1,
        s.studentId,
        s.name,
        s.branch,
        s.cgpa ?? "",
        scored ? sc.score : "",
        METHOD_LABELS[sc.method] || "",
        scored ? `${b.requiredMatched}/${b.requiredTotal}` : "",
        scored ? `${b.preferredMatched}/${b.preferredTotal}` : "",
        b.relevanceRating ?? "",
        sc.explanation || "",
        s.override === "include" ? "Added manually" : "Top N",
      ];
    }),
  ];

  const all = [
    ALL_HEADERS,
    ...orderedStudents(drive).map((s) => {
      const sc = s.screening || {};
      const scored = typeof sc.score === "number";
      let notes = "";
      if (!s.eligibility?.eligible) {
        notes = (s.eligibility?.failedRules || [])
          .map((f) => f.message)
          .join("; ");
      } else if (s.resume?.status === "ok") {
        notes = sc.explanation || "";
      } else {
        notes = s.resume?.message || "";
      }
      return [
        s.studentId,
        s.name,
        s.branch,
        s.cgpa ?? "",
        s.backlogs ?? "",
        s.gradYear ?? "",
        STATE_LABELS[getStudentState(s, finalSet)],
        scored ? sc.score : "",
        METHOD_LABELS[sc.method] || "",
        notes,
        s.override === "include"
          ? "Added"
          : s.override === "exclude"
          ? "Removed"
          : "",
      ];
    }),
  ];

  const rules = drive.rules || {};
  const names = (importance) =>
    drive.skills
      .filter((skill) => skill.importance === importance)
      .map((skill) => skill.name)
      .join(", ");
  const info = [
    ["Field", "Value"],
    ["Drive name", drive.name],
    ["Company", drive.company || ""],
    ["Role", drive.roleTitle],
    ["Created", drive.createdAt],
    ["Minimum CGPA", rules.minCgpa ?? ""],
    ["Allowed branches", (rules.branches || []).join(", ")],
    ["Maximum backlogs", rules.maxBacklogs ?? ""],
    ["Graduation year", rules.graduationYear ?? "Any"],
    ["Top N", drive.topN],
    ["Required skills", names("required")],
    ["Preferred skills", names("preferred")],
    ["Students in drive", drive.students.length],
    ["Shortlisted", finalIds.length],
    ["Scored with Basic match", drive.usedFallbackCount || 0],
    [
      "Note",
      "Rules decided eligibility. Scores come from AI evidence plus a fixed formula. Review resumes before making decisions.",
    ],
  ];

  return { shortlist, all, info };
}

function fileNameFor(drive) {
  const base =
    String(drive.name || "drive")
      .replace(/[^a-z0-9]+/gi, "-")
      .replace(/^-+|-+$/g, "") || "drive";
  return `${base}-shortlist.xlsx`;
}

function widths(rows) {
  return rows[0].map((_, col) => ({
    wch: Math.min(
      60,
      Math.max(...rows.map((row) => String(row[col] ?? "").length), 8) + 2
    ),
  }));
}

// Browser only. Returns { ok: true, fileName } or { ok: false, error }.
export async function exportDriveToXlsx(drive) {
  try {
    const mod = await import("xlsx");
    const XLSX = mod.utils ? mod : mod.default;
    const sheets = buildSheets(drive);
    const workbook = XLSX.utils.book_new();
    const add = (rows, name) => {
      const sheet = XLSX.utils.aoa_to_sheet(rows);
      sheet["!cols"] = widths(rows);
      XLSX.utils.book_append_sheet(workbook, sheet, name);
    };
    add(sheets.shortlist, "Shortlist");
    add(sheets.all, "All students");
    add(sheets.info, "Drive Info");
    const fileName = fileNameFor(drive);
    XLSX.writeFile(workbook, fileName);
    return { ok: true, fileName };
  } catch {
    return { ok: false, error: "Could not create the Excel file." };
  }
}