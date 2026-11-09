// Reads the officer's spreadsheet and turns it into clean student objects.
// parseStudentRows and matrixToRows are pure (easy to test).
// parseStudentsFile reads a File in the browser.

import { LIMITS } from "./constants.js";
import { createStudent } from "./driveModel.js";

const MAX_SHEET_BYTES = 5 * 1024 * 1024;
const HEADER_SCAN_ROWS = 10;

// Accepted header names, compared after lowercasing and removing symbols.
const HEADER_ALIASES = {
  studentId: [
    "studentid", "id", "rollno", "rollnumber", "enrollmentno",
    "enrollmentnumber", "studentno", "regno", "registrationnumber", "usn",
  ],
  name: ["name", "studentname", "fullname"],
  branch: ["branch", "department", "dept", "stream", "course"],
  cgpa: ["cgpa", "gpa", "cgpaoutof10"],
  backlogs: [
    "backlogs", "backlog", "activebacklogs", "currentbacklogs", "arrears",
  ],
  gradYear: [
    "graduationyear", "gradyear", "passoutyear", "passingyear",
    "yearofpassing", "yearofgraduation", "batch",
  ],
  resume: ["resume", "resumefile", "resumefilename", "cv", "resumepdf"],
};

const KNOWN_HEADERS = new Set(Object.values(HEADER_ALIASES).flat());

const FIELD_LABELS = {
  studentId: "Student ID",
  name: "Name",
  branch: "Branch",
  cgpa: "CGPA",
  backlogs: "Backlogs",
  gradYear: "Graduation Year",
  resume: "Resume",
};

const REQUIRED_FIELDS = ["studentId", "name", "branch", "cgpa"];
const OPTIONAL_FIELDS = ["backlogs", "gradYear"];

function normalizeHeader(header) {
  return String(header ?? "").toLowerCase().replace(/[^a-z0-9]/g, "");
}

function cleanText(value) {
  return String(value ?? "").trim();
}

function detectColumns(rows) {
  const headers = new Set();
  for (const row of rows) {
    Object.keys(row || {}).forEach((key) => headers.add(key));
  }
  const columns = {};
  for (const [field, aliases] of Object.entries(HEADER_ALIASES)) {
    for (const header of headers) {
      if (aliases.includes(normalizeHeader(header))) {
        columns[field] = header;
        break;
      }
    }
  }
  return columns;
}

function isBlankRow(row) {
  return Object.values(row || {}).every((value) => cleanText(value) === "");
}

// Returns a number within range, or null (and records a warning).
function readNumber(raw, { min, max, integer }, label, dataWarnings) {
  let value = null;
  if (typeof raw === "number" && Number.isFinite(raw)) {
    value = raw;
  } else if (typeof raw === "string" && raw.trim() !== "") {
    const parsed = Number(raw.trim());
    value = Number.isFinite(parsed) ? parsed : null;
  }
  const valid =
    value !== null &&
    value >= min &&
    value <= max &&
    (!integer || Number.isInteger(value));
  if (!valid) {
    dataWarnings.push(`${label} is missing or invalid`);
    return null;
  }
  return value;
}

// Turns a grid of cells (array of arrays) into row objects. The header row is the
// first of the top 10 rows that contains at least 3 known column names, so a title
// line above the headers is skipped. Falls back to the first row.
// Returns { rows, headerRowIndex } where headerRowIndex is 0-based.
export function matrixToRows(matrix) {
  if (!Array.isArray(matrix) || matrix.length === 0) {
    return { rows: [], headerRowIndex: 0 };
  }

  let headerRowIndex = -1;
  const limit = Math.min(matrix.length, HEADER_SCAN_ROWS);
  for (let i = 0; i < limit; i += 1) {
    const row = matrix[i];
    if (!Array.isArray(row)) continue;
    const known = row.filter((cell) =>
      KNOWN_HEADERS.has(normalizeHeader(cell))
    ).length;
    if (known >= 3) {
      headerRowIndex = i;
      break;
    }
  }
  if (headerRowIndex === -1) headerRowIndex = 0;

  const headerCells = Array.isArray(matrix[headerRowIndex])
    ? matrix[headerRowIndex]
    : [];
  const seen = new Map();
  const headers = headerCells.map((cell, column) => {
    const text = cleanText(cell) || `Column ${column + 1}`;
    const count = (seen.get(text) || 0) + 1;
    seen.set(text, count);
    return count === 1 ? text : `${text} (${count})`;
  });

  const rows = matrix.slice(headerRowIndex + 1).map((cells) => {
    const object = {};
    headers.forEach((header, column) => {
      object[header] = Array.isArray(cells) ? cells[column] ?? "" : "";
    });
    return object;
  });
  return { rows, headerRowIndex };
}

// options.rowOffset is the number of spreadsheet rows above the header row,
// so warnings can name the real spreadsheet row.
export function parseStudentRows(rows, options = {}) {
  const rowOffset = Number(options.rowOffset) || 0;
  const errors = [];
  const warnings = [];
  const students = [];

  if (!Array.isArray(rows) || rows.length === 0) {
    errors.push("The spreadsheet has no data rows.");
    return { students, errors, warnings };
  }

  const columns = detectColumns(rows);
  const missing = REQUIRED_FIELDS.filter((field) => !columns[field]);
  if (missing.length > 0) {
    errors.push(
      `Missing required column(s): ${missing
        .map((field) => FIELD_LABELS[field])
        .join(", ")}. Check the header row.`
    );
    return { students, errors, warnings };
  }
  for (const field of OPTIONAL_FIELDS) {
    if (!columns[field]) {
      warnings.push(
        `No "${FIELD_LABELS[field]}" column found. Rules using it will fail for every student.`
      );
    }
  }

  const read = (row, field) => (columns[field] ? row[columns[field]] : "");
  const seen = new Set();
  let limitWarned = false;

  rows.forEach((row, index) => {
    const rowNumber = index + 2 + rowOffset; // the header row is above the first data row
    if (isBlankRow(row)) return;

    const studentId = cleanText(read(row, "studentId"));
    const name = cleanText(read(row, "name"));
    if (!studentId) {
      warnings.push(`Row ${rowNumber}: skipped (missing Student ID)`);
      return;
    }
    if (!name) {
      warnings.push(`Row ${rowNumber}: skipped (missing Name for ${studentId})`);
      return;
    }
    const key = studentId.toLowerCase();
    if (seen.has(key)) {
      warnings.push(
        `Row ${rowNumber}: skipped (duplicate Student ID ${studentId})`
      );
      return;
    }
    if (students.length >= LIMITS.studentsMax) {
      if (!limitWarned) {
        warnings.push(
          `Only the first ${LIMITS.studentsMax} students were imported.`
        );
        limitWarned = true;
      }
      return;
    }
    seen.add(key);

    const dataWarnings = [];
    const branch = cleanText(read(row, "branch"))
      .replace(/\s+/g, " ")
      .toUpperCase();
    if (!branch) dataWarnings.push("Branch is missing");

    const cgpa = readNumber(
      read(row, "cgpa"),
      { min: 0, max: 10, integer: false },
      "CGPA",
      dataWarnings
    );
    const backlogs = columns.backlogs
      ? readNumber(
          read(row, "backlogs"),
          { min: 0, max: 99, integer: true },
          "Backlogs",
          dataWarnings
        )
      : null;
    const gradYear = columns.gradYear
      ? readNumber(
          read(row, "gradYear"),
          { min: 2000, max: 2100, integer: true },
          "Graduation year",
          dataWarnings
        )
      : null;

    students.push(
      createStudent({
        studentId,
        name,
        branch,
        cgpa,
        backlogs,
        gradYear,
        resumeFile: cleanText(read(row, "resume")),
        dataWarnings,
      })
    );
  });

  if (students.length === 0) {
    errors.push("No valid student rows were found.");
  }
  return { students, errors, warnings };
}

// Browser only: reads an .xlsx, .xls or .csv File and parses it.
export async function parseStudentsFile(file) {
  const fail = (message) => ({ students: [], errors: [message], warnings: [] });
  const fileName = String(file?.name ?? "");
  if (!/\.(xlsx|xls|csv)$/i.test(fileName)) {
    return fail("Please upload an .xlsx, .xls or .csv file.");
  }
  if (Number(file.size) > MAX_SHEET_BYTES) {
    return fail("That file is too large. Keep it under 5 MB.");
  }
  try {
    const mod = await import("xlsx");
    const XLSX = mod.read ? mod : mod.default;
    const buffer = await file.arrayBuffer();
    const workbook = XLSX.read(buffer, { type: "array" });
    const sheetName = workbook.SheetNames[0];
    if (!sheetName) return fail("The file has no sheets.");
    const matrix = XLSX.utils.sheet_to_json(workbook.Sheets[sheetName], {
      header: 1,
      defval: "",
      raw: true,
    });
    const { rows, headerRowIndex } = matrixToRows(matrix);
    return parseStudentRows(rows, { rowOffset: headerRowIndex });
  } catch {
    return fail("Could not read that file. Is it a valid spreadsheet?");
  }
}
