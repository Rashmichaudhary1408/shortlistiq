"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { Download, Search, TriangleAlert, ArrowLeft } from "lucide-react";
import SummaryCards from "@/components/results/SummaryCards.js";
import ResultsTable from "@/components/results/ResultsTable.js";
import CandidateDrawer from "@/components/results/CandidateDrawer.js";
import { getDrive, saveDrive } from "@/lib/storage.js";
import { clampTopN } from "@/lib/driveModel.js";
import {
  rankStudents,
  getFinalShortlistIds,
  getStudentState,
} from "@/lib/shortlist.js";
import { exportDriveToXlsx } from "@/lib/exportXlsx.js";

const FILTERS = [
  ["all", "All"],
  ["shortlisted", "Shortlisted"],
  ["eligible", "Eligible, not shortlisted"],
  ["resume_issue", "Resume issues"],
  ["ineligible", "Not eligible"],
];

function buildView(drive) {
  const ranked = rankStudents(drive);
  const rankOf = new Map(ranked.map((s, i) => [s.studentId, i + 1]));
  const finalSet = new Set(getFinalShortlistIds(drive));
  const others = drive.students.filter((s) => !rankOf.has(s.studentId));
  const rows = [...ranked, ...others].map((student) => ({
    student,
    rank: rankOf.get(student.studentId) ?? null,
    state: getStudentState(student, finalSet),
  }));
  return { scoredCount: ranked.length, finalSet, rows };
}

export default function DriveResultsPage() {
  const params = useParams();
  const id = Array.isArray(params.id) ? params.id[0] : params.id;

  const [drive, setDrive] = useState(null);
  const [status, setStatus] = useState("loading");
  const [filter, setFilter] = useState("all");
  const [query, setQuery] = useState("");
  const [selectedId, setSelectedId] = useState(null);
  const [notice, setNotice] = useState("");
  const [exporting, setExporting] = useState(false);

  useEffect(() => {
    const result = getDrive(id);
    if (result.ok) {
      setDrive(result.drive);
      setStatus("ready");
    } else {
      setStatus("missing");
    }
  }, [id]);

  const view = useMemo(() => (drive ? buildView(drive) : null), [drive]);

  function update(changes) {
    const next = { ...drive, ...changes };
    const saved = saveDrive(next);
    if (saved.ok) {
      setDrive(saved.drive);
      setNotice("");
    } else {
      setDrive(next);
      setNotice(saved.error);
    }
  }

  function toggleShortlist(studentId) {
    const student = drive.students.find((s) => s.studentId === studentId);
    const shortlisted = view.finalSet.has(studentId);
    let override;
    if (shortlisted) {
      override = student.override === "include" ? null : "exclude";
    } else {
      override = student.override === "exclude" ? null : "include";
    }
    update({
      students: drive.students.map((s) =>
        s.studentId === studentId ? { ...s, override } : s
      ),
    });
  }

  function changeTopN(text) {
    if (text === "") return;
    update({ topN: clampTopN(text, view.scoredCount) });
  }

  async function handleExport() {
    setExporting(true);
    const result = await exportDriveToXlsx(drive);
    setExporting(false);
    if (!result.ok) setNotice(result.error);
  }

  if (status === "loading") {
    return <p className="text-slate-600">Loading drive...</p>;
  }

  if (status === "missing") {
    return (
      <div className="rounded-xl border border-slate-200 bg-white p-8 shadow-sm">
        <h1 className="text-2xl font-bold">Drive not found</h1>
        <p className="mt-2 text-slate-600">
          It may have been deleted, or it was saved in a different browser.
          Drives are stored only in the browser where you ran them.
        </p>
        <Link
          href="/"
          className="mt-4 inline-flex items-center gap-2 rounded-lg bg-indigo-600 px-4 py-2 font-medium text-white hover:bg-indigo-700"
        >
          <ArrowLeft size={16} /> Back to home
        </Link>
      </div>
    );
  }

  const q = query.trim().toLowerCase();
  const visible = view.rows.filter(
    ({ student, state }) =>
      (filter === "all" || state === filter) &&
      (!q ||
        student.name.toLowerCase().includes(q) ||
        student.studentId.toLowerCase().includes(q))
  );
  const selectedRow = selectedId
    ? view.rows.find((r) => r.student.studentId === selectedId)
    : null;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">{drive.name}</h1>
          <p className="text-sm text-slate-600">
            {[drive.company, drive.roleTitle].filter(Boolean).join(" · ")}
          </p>
        </div>
        <button
          type="button"
          onClick={handleExport}
          disabled={exporting}
          className="inline-flex items-center gap-2 rounded-lg bg-indigo-600 px-4 py-2 font-medium text-white hover:bg-indigo-700 disabled:opacity-50"
        >
          <Download size={18} />
          {exporting ? "Preparing..." : "Download Excel (.xlsx)"}
        </button>
      </div>

      {notice && (
        <p className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-800">
          {notice}
        </p>
      )}

      <SummaryCards drive={drive} finalSet={view.finalSet} />

      {drive.usedFallbackCount > 0 && (
        <div className="rounded-lg border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
          <p className="flex items-center gap-2 font-medium">
            <TriangleAlert size={16} /> {drive.usedFallbackCount} resume(s) were
            scored with Basic match
          </p>
          <p className="mt-1">
            The AI was busy, so a keyword search was used. Basic match has no AI
            relevance rating, so read those resumes yourself before deciding.
          </p>
        </div>
      )}

      {drive.warnings?.length > 0 && (
        <details className="rounded-lg border border-slate-200 bg-white p-4 text-sm">
          <summary className="cursor-pointer font-medium">
            {drive.warnings.length} notice(s) from this run
          </summary>
          <ul className="mt-2 list-disc pl-6 text-slate-700">
            {drive.warnings.slice(0, 20).map((w, i) => (
              <li key={i}>{w}</li>
            ))}
          </ul>
        </details>
      )}

      <section className="flex flex-wrap items-end gap-4 rounded-xl border border-slate-200 bg-white p-4">
        <label className="text-sm">
          <span className="font-medium">Top N to shortlist</span>
          <input
            type="number"
            min={1}
            max={Math.max(view.scoredCount, 1)}
            value={drive.topN}
            disabled={view.scoredCount === 0}
            onChange={(e) => changeTopN(e.target.value)}
            className="mt-1 block w-28 rounded-lg border border-slate-300 px-3 py-2"
          />
        </label>
        <p className="pb-2 text-sm text-slate-600">
          of {view.scoredCount} scored students. Use Add or Remove in the table
          to override. Your overrides are kept when you change Top N.
        </p>
      </section>

      <section className="space-y-3">
        <div className="flex flex-wrap items-center gap-3">
          <div className="relative">
            <Search
              size={16}
              className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
            />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search name or ID"
              className="w-56 rounded-lg border border-slate-300 py-2 pl-9 pr-3 text-sm"
            />
          </div>
          {FILTERS.map(([value, label]) => (
            <button
              key={value}
              type="button"
              onClick={() => setFilter(value)}
              className={
                "rounded-full border px-3 py-1 text-sm " +
                (filter === value
                  ? "border-indigo-600 bg-indigo-600 text-white"
                  : "border-slate-300 bg-white text-slate-700 hover:bg-slate-100")
              }
            >
              {label}
            </button>
          ))}
        </div>
        <ResultsTable
          rows={visible}
          onToggle={toggleShortlist}
          onView={setSelectedId}
        />
      </section>

      {selectedRow && (
        <CandidateDrawer
          student={selectedRow.student}
          state={selectedRow.state}
          onClose={() => setSelectedId(null)}
        />
      )}
    </div>
  );
}