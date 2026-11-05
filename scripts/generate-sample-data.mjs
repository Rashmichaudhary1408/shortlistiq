// Creates FAKE demo data: sample-data/students.xlsx and sample-data/resumes/*.pdf
// Run with: node scripts/generate-sample-data.mjs
import fs from "node:fs";
import path from "node:path";
import PDFDocument from "pdfkit";
import * as XLSXns from "xlsx";

const XLSX = XLSXns.utils ? XLSXns : XLSXns.default;

const outDir = path.join(process.cwd(), "sample-data");
const resumeDir = path.join(outDir, "resumes");
fs.mkdirSync(resumeDir, { recursive: true });

const students = [
  ["23CS001", "Priya Sharma", "CSE", 8.6, 0, 2027, ["JavaScript", "React", "Node.js", "MongoDB", "Logistics Tracker (full-stack web app)"]],
  ["23CS002", "Rahul Verma", "CSE", 7.4, 0, 2027, ["Python", "Django", "PostgreSQL", "Docker", "Internship: backend developer at a startup"]],
  ["23IT003", "Ananya Iyer", "IT", 9.1, 0, 2027, ["TypeScript", "React", "Next.js", "Tailwind CSS", "Portfolio builder project"]],
  ["23EC004", "Karan Mehta", "ECE", 7.9, 0, 2027, ["C", "Embedded systems", "Python", "Arduino", "Smart irrigation project"]],
  ["23ME005", "Rohan Das", "ME", 8.2, 0, 2027, ["AutoCAD", "SolidWorks", "Python", "Thermal systems project"]],
  ["23CS006", "Sneha Rao", "CSE", 6.8, 0, 2027, ["Java", "Spring Boot", "MySQL", "Library management system"]],
  ["23CS007", "Vikram Singh", "CSE", 8.0, 2, 2027, ["JavaScript", "Node.js", "Express", "REST APIs", "Chat application project"]],
  ["23IT008", "Meera Nair", "IT", 7.7, 0, 2026, ["Python", "Machine learning", "Pandas", "Scikit-learn", "Sales forecasting project"]],
  ["23CS009", "Arjun Patel", "CSE", 8.8, 0, 2027, ["JavaScript", "TypeScript", "React", "Node.js", "Docker", "AWS", "Internship: full-stack engineer"]],
  ["23EC010", "Divya Menon", "ECE", 7.2, 0, 2027, null],
  ["23CS011", "Imran Khan", "CSE", 7.5, 0, 2027, ["HTML", "CSS", "JavaScript", "Git", "Weather dashboard project"]],
  ["23IT012", "Neha Joshi", "IT", 8.4, 0, 2027, ["Python", "Flask", "SQL", "Docker", "Expense tracker project"]],
];

function makePdf(filePath, name, lines) {
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({ margin: 50 });
    const out = fs.createWriteStream(filePath);
    doc.pipe(out);
    doc.fontSize(20).text(name);
    doc.moveDown();
    doc.fontSize(12).text("Fresh graduate seeking a software role. This is a fake demo resume.");
    doc.moveDown();
    doc.fontSize(14).text("Skills, projects and experience");
    doc.fontSize(12);
    for (const line of lines) doc.text(`- ${line}`);
    doc.moveDown();
    doc.text("Education: B.Tech, final year. Interests: building useful products and learning new tools every week.");
    doc.end();
    out.on("finish", resolve);
    out.on("error", reject);
  });
}

const sheetRows = [
  ["Student ID", "Name", "Branch", "CGPA", "Backlogs", "Graduation Year"],
  ...students.map(([id, name, branch, cgpa, backlogs, year]) => [id, name, branch, cgpa, backlogs, year]),
];
const workbook = XLSX.utils.book_new();
XLSX.utils.book_append_sheet(workbook, XLSX.utils.aoa_to_sheet(sheetRows), "Students");
fs.writeFileSync(
  path.join(outDir, "students.xlsx"),
  XLSX.write(workbook, { type: "buffer", bookType: "xlsx" })
);

let made = 0;
for (const [id, name, , , , , lines] of students) {
  if (!lines) continue; // this student deliberately has no resume
  await makePdf(path.join(resumeDir, `${id}.pdf`), name, lines);
  made += 1;
}
await makePdf(path.join(resumeDir, "stranger.pdf"), "Unknown Person", [
  "This file matches no student, so the app should list it as unmatched.",
]);

console.log(`Created students.xlsx (${students.length} students) and ${made + 1} PDFs in sample-data/`);