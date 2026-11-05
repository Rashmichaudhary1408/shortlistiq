"use client";

import { useState } from "react";
import {
  FileSpreadsheet,
  FileText,
  ArrowRight,
  TriangleAlert,
  CircleCheck,
} from "lucide-react";
import { parseStudentsFile } from "@/lib/parseStudents.js";
import { matchResumes } from "@/lib/matchResumes.js";
import { canLeaveUpload } from "@/lib/wizardReducer.js";

function FileList({ title, items }) {
  if (!items || items.length === 0) return null;
  const shown = items.slice(0, 8);
  return (
    <div className="mt-3 rounded-lg border border-amber-200 bg-amber-50 p-3 text-sm text-amber-900">
      <p className="flex items-center gap-2 font-medium">
        <TriangleAlert size={16} /> {title}
      </p>
      <ul className="mt-1 list-disc pl-6">
        {shown.map((item, i) => (
          <li key={i}>{item}</li>
        ))}
      </ul>
      {items.length > shown.length && (
        <p className="mt-1 pl-6">and {items.length - shown.length} more</p>
      )}
    </div>
  );
}

export default function UploadStep({ state, dispatch, onNext }) {
  const [busy, setBusy] = useState(false);

  async function handleSheet(event) {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;
    setBusy(true);
    const result = await parseStudentsFile(file);
    const match =
      result.errors.length === 0 && state.pdfFiles.length > 0
        ? matchResumes(result.students, state.pdfFiles)
        : null;
    dispatch({
      type: "SET_SHEET",
      payload: { fileName: file.name, ...result, match },
    });
    setBusy(false);
  }

  function handlePdfs(event) {
    const files = Array.from(event.target.files || []);
    event.target.value = "";
    if (files.length === 0) return;
    const match = matchResumes(state.students, files);
    dispatch({ type: "SET_PDFS", payload: { files, match } });
  }

  const total = state.students.length;
  const found = state.students.filter((s) => s.resume?.status === "found").length;
  const missing = total - found;
  const rowWarnings = state.students.flatMap((s) =>
    s.dataWarnings.map((w) => `${s.studentId}: ${w}`)
  );

  return (
    <div className="space-y-6">
      <div className="rounded-xl border border-indigo-200 bg-indigo-50 p-4 text-sm text-indigo-900">
        <strong>Privacy:</strong> your spreadsheet and PDFs stay in this
        browser. Only the extracted text of eligible students is sent to
        Google&apos;s free Gemini AI. Free-tier content may be used by Google to
        improve its products, so use <strong>fake data for demos</strong>.
      </div>

      <section className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="text-lg font-semibold">Drive details</h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <label className="block text-sm">
            <span className="font-medium">Drive name (required)</span>
            <input
              type="text"
              maxLength={100}
              value={state.driveName}
              onChange={(e) =>
                dispatch({
                  type: "SET_FIELD",
                  payload: { field: "driveName", value: e.target.value },
                })
              }
              placeholder="e.g. Nimbus Labs - SDE 2027"
              className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2"
            />
          </label>
          <label className="block text-sm">
            <span className="font-medium">Company (optional)</span>
            <input
              type="text"
              maxLength={100}
              value={state.company}
              onChange={(e) =>
                dispatch({
                  type: "SET_FIELD",
                  payload: { field: "company", value: e.target.value },
                })
              }
              placeholder="e.g. Nimbus Labs"
              className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2"
            />
          </label>
        </div>
      </section>

      <section className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="flex items-center gap-2 text-lg font-semibold">
          <FileSpreadsheet size={20} /> 1. Student spreadsheet
        </h2>
        <p className="mt-1 text-sm text-slate-600">
          .xlsx, .xls or .csv with columns: Student ID, Name, Branch, CGPA,
          Backlogs, Graduation Year (and optionally Resume).
        </p>
        <input
          type="file"
          accept=".xlsx,.xls,.csv"
          onChange={handleSheet}
          className="mt-3 block w-full text-sm file:mr-4 file:rounded-lg file:border-0 file:bg-indigo-600 file:px-4 file:py-2 file:text-white hover:file:bg-indigo-700"
        />
        {busy && <p className="mt-3 text-sm text-slate-500">Reading file...</p>}

        {state.sheetErrors.map((message) => (
          <p
            key={message}
            className="mt-3 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-800"
          >
            {message}
          </p>
        ))}

        {total > 0 && (
          <p className="mt-3 flex items-center gap-2 text-sm text-emerald-700">
            <CircleCheck size={16} /> {state.sheetName}: {total} students
            imported
          </p>
        )}
        <FileList title="Import notices" items={state.sheetWarnings} />
        <FileList title="Rows with problems" items={rowWarnings} />
      </section>

      <section className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="flex items-center gap-2 text-lg font-semibold">
          <FileText size={20} /> 2. Resume PDFs
        </h2>
        <p className="mt-1 text-sm text-slate-600">
          Name each file after the Student ID, for example 23CS001.pdf. Select
          many files at once (Ctrl+A in the file window).
        </p>
        <input
          type="file"
          accept=".pdf,application/pdf"
          multiple
          disabled={total === 0}
          onChange={handlePdfs}
          className="mt-3 block w-full text-sm file:mr-4 file:rounded-lg file:border-0 file:bg-indigo-600 file:px-4 file:py-2 file:text-white hover:file:bg-indigo-700 disabled:opacity-50"
        />
        {total === 0 && (
          <p className="mt-2 text-sm text-slate-500">
            Upload the spreadsheet first.
          </p>
        )}

        {state.pdfFiles.length > 0 && (
          <p className="mt-3 text-sm text-slate-700">
            {state.pdfFiles.length} PDFs selected. Matched:{" "}
            <strong className="text-emerald-700">{found}</strong>. Students
            without a resume: <strong className="text-amber-700">{missing}</strong>.
          </p>
        )}
        <FileList
          title="PDFs that match no student"
          items={state.unmatchedFiles}
        />
        <FileList
          title="Files that were rejected"
          items={state.rejectedFiles.map((f) => `${f.name} (${f.reason})`)}
        />
        <FileList
          title="Students with no matching resume"
          items={state.students
            .filter((s) => s.resume?.status === "missing")
            .map((s) => `${s.studentId} ${s.name}`)}
        />
      </section>

      <div className="flex justify-end">
        <button
          type="button"
          onClick={onNext}
          disabled={!canLeaveUpload(state)}
          className="inline-flex items-center gap-2 rounded-lg bg-indigo-600 px-5 py-3 font-medium text-white hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-40"
        >
          Continue <ArrowRight size={18} />
        </button>
      </div>
    </div>
  );
}