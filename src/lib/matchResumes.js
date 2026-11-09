// Pairs uploaded PDF files with students by file name. Pure logic, no network.

const MAX_PDF_BYTES = 10 * 1024 * 1024;

function lower(value) {
  return String(value ?? "").trim().toLowerCase();
}

// "resumes\23CS001.pdf" and "folder/23CS001" both become a bare file name.
function nameFromColumn(value) {
  const base = lower(String(value ?? "").split(/[\\/]/).pop());
  if (!base) return "";
  return base.endsWith(".pdf") ? base : `${base}.pdf`;
}

export function matchResumes(students, files) {
  const accepted = new Map(); // lowercase file name -> file
  const rejectedFiles = [];

  for (const file of Array.from(files || [])) {
    const name = String(file?.name ?? "");
    const key = lower(name);
    if (!key.endsWith(".pdf")) {
      rejectedFiles.push({ name, reason: "Not a PDF file" });
    } else if (!(Number(file.size) > 0)) {
      rejectedFiles.push({ name, reason: "File is empty" });
    } else if (Number(file.size) > MAX_PDF_BYTES) {
      rejectedFiles.push({ name, reason: "File is larger than 10 MB" });
    } else if (accepted.has(key)) {
      rejectedFiles.push({ name, reason: "Duplicate file name" });
    } else {
      accepted.set(key, file);
    }
  }

  const used = new Set();
  const fileMap = new Map(); // studentId -> File

  const updated = students.map((student) => {
    const candidates = [
      nameFromColumn(student.resumeFile),
      lower(`${student.studentId}.pdf`),
    ].filter(Boolean);
    const key = candidates.find((c) => accepted.has(c) && !used.has(c));
    if (key) {
      used.add(key);
      fileMap.set(student.studentId, accepted.get(key));
      return { ...student, resume: { status: "found", message: "Resume found" } };
    }
    return {
      ...student,
      resume: { status: "missing", message: "No matching PDF uploaded" },
    };
  });

  const unmatchedFiles = [...accepted.entries()]
    .filter(([key]) => !used.has(key))
    .map(([, file]) => file.name);

  return { students: updated, unmatchedFiles, rejectedFiles, fileMap };
}
