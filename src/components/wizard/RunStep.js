"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  Play,
  Square,
  Download,
  TriangleAlert,
  CircleCheck,
} from "lucide-react";
import { createDrive } from "@/lib/driveModel.js";
import { applyRules } from "@/lib/eligibility.js";
import { normalizeSkills } from "@/lib/skills.js";
import { runScreening } from "@/lib/runner.js";
import { rankStudents } from "@/lib/shortlist.js";
import { saveDrive } from "@/lib/storage.js";
import { exportDriveToXlsx } from "@/lib/exportXlsx.js";

// Freezes the wizard's choices into a drive object (skills and rules never change after this).
function buildDrive(state) {
  const students = applyRules(state.students, state.rules);
  const warnings = [
    ...state.sheetWarnings,
    ...state.unmatchedFiles.map((name) => `PDF "${name}" matches no student`),
    ...state.rejectedFiles.map(
      (file) => `File "${file.name}" was rejected (${file.reason})`
    ),
  ];
  return createDrive({
    name: state.driveName,
    company: state.company,
    roleTitle: state.roleTitle.trim() || "Role",
    jdText: state.jdText.trim(),
    skills: normalizeSkills(state.skills),
    rules: state.rules,
    students,
    warnings,
  });
}

function Stat({ label, value, tone = "text-slate-900" }) {
  return (
    <div className="rounded-lg border border-slate-200 bg-white p-4">
      <p className={`text-2xl font-bold ${tone}`}>{value}</p>
      <p className="text-sm text-slate-600">{label}</p>
    </div>
  );
}

export default function RunStep({ state, onBack }) {
  const router = useRouter();
  const [phase, setPhase] = useState("ready");
  const [progress, setProgress] = useState({ done: 0, total: 0, message: "" });
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");
  const [saveError, setSaveError] = useState("");
  const controllerRef = useRef(null);

  // Warn before the tab is closed or reloaded mid-run, because that stops the run.
  useEffect(() => {
    if (phase !== "running") return undefined;
    const warn = (event) => {
      event.preventDefault();
      event.returnValue = "";
    };
    window.addEventListener("beforeunload", warn);
    return () => window.removeEventListener("beforeunload", warn);
  }, [phase]);

  const evaluated = applyRules(state.students, state.rules);
  const eligible = evaluated.filter((s) => s.eligibility.eligible);
  const toScore = eligible.filter((s) => state.fileMap.has(s.studentId)).length;
  const noResume = eligible.length - toScore;
  const minutes = Math.max(1, Math.round((toScore * 5) / 2 / 60));

  async function start() {
    const drive = buildDrive(state);
    const controller = new AbortController();
    controllerRef.current = controller;
    setError("");
    setSaveError("");
    setResult(null);
    setProgress({ done: 0, total: drive.students.length, message: "Starting..." });
    setPhase("running");
    try {
      const finished = await runScreening({
        drive,
        resumeFiles: state.fileMap,
        onProgress: setProgress,
        signal: controller.signal,
      });
      const saved = saveDrive(finished);
      if (saved.ok) {
        setResult(saved.drive);
        setPhase("saved");
        router.push(`/drive/${saved.drive.id}`);
        return;
      }
      setSaveError(saved.error);
      setResult(finished);
      setPhase("done");
    } catch (err) {
      if (err && err.cancelled) {
        setPhase("cancelled");
      } else {
        setError("Something went wrong while screening. Please try again.");
        setPhase("error");
      }
    }
  }

  function cancel() {
    if (controllerRef.current) controllerRef.current.abort();
  }

  const percent =
    progress.total > 0 ? Math.round((progress.done / progress.total) * 100) : 0;

  if (phase === "running") {
    return (
      <section className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="text-lg font-semibold">Screening in progress</h2>
        <div
          role="progressbar"
          aria-label="Screening progress"
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuenow={percent}
          className="mt-4 h-3 w-full overflow-hidden rounded-full bg-slate-200"
        >
          <div
            className="h-3 rounded-full bg-indigo-600 transition-all"
            style={{ width: `${percent}%` }}
          />
        </div>
        <p className="mt-2 text-sm text-slate-700">
          {progress.done} of {progress.total} students processed ({percent}%)
        </p>
        <p aria-live="polite" className="mt-1 text-sm text-slate-500">
          {progress.message}
        </p>
        <p className="mt-3 text-sm text-slate-500">
          Keep this tab open. Closing it stops the run.
        </p>
        <button
          type="button"
          onClick={cancel}
          className="mt-4 inline-flex items-center gap-2 rounded-lg border border-red-300 bg-white px-4 py-2 font-medium text-red-700 hover:bg-red-50"
        >
          <Square size={16} aria-hidden="true" /> Cancel run
        </button>
      </section>
    );
  }

  if (phase === "saved" && result) {
    return (
      <section
        role="status"
        className="rounded-xl border border-emerald-200 bg-emerald-50 p-6"
      >
        <p className="flex items-center gap-2 text-lg font-semibold text-emerald-900">
          <CircleCheck size={20} aria-hidden="true" /> Screening complete and
          saved
        </p>
        <p className="mt-1 text-sm text-emerald-900">
          Opening your results...{" "}
          <Link href={`/drive/${result.id}`} className="font-medium underline">
            Click here if nothing happens
          </Link>
        </p>
      </section>
    );
  }

  if (phase === "done" && result) {
    const students = result.students;
    const ranked = rankStudents(result);
    const aiCount = students.filter((s) => s.screening.method === "ai").length;
    const basicCount = students.filter(
      (s) => s.screening.method === "fallback"
    ).length;
    const count = (status) =>
      students.filter((s) => s.resume.status === status).length;

    return (
      <div className="space-y-6">
        <section
          role="alert"
          className="rounded-xl border border-red-200 bg-red-50 p-6"
        >
          <p className="flex items-center gap-2 text-lg font-semibold text-red-900">
            <TriangleAlert size={20} aria-hidden="true" /> Screening complete,
            but it could not be saved
          </p>
          <p className="mt-1 text-sm text-red-900">{saveError}</p>
          <button
            type="button"
            onClick={() => exportDriveToXlsx(result)}
            className="mt-3 inline-flex items-center gap-2 rounded-lg bg-indigo-600 px-4 py-2 font-medium text-white hover:bg-indigo-700"
          >
            <Download size={18} aria-hidden="true" /> Download Excel (.xlsx)
          </button>
        </section>

        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
          <Stat label="Scored by AI" value={aiCount} tone="text-emerald-700" />
          <Stat label="Basic match" value={basicCount} tone="text-amber-700" />
          <Stat label="Not eligible" value={count("not_scanned")} tone="text-red-700" />
          <Stat label="No resume" value={count("missing")} tone="text-amber-700" />
          <Stat label="Unreadable" value={count("unreadable")} tone="text-amber-700" />
          <Stat label="Total students" value={students.length} />
        </div>

        <section className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-lg font-semibold">Ranked students</h2>
          {ranked.length === 0 ? (
            <p className="mt-2 text-sm text-slate-600">
              No student could be scored.
            </p>
          ) : (
            <div className="mt-3 max-h-[28rem] overflow-auto rounded-lg border border-slate-200">
              <table className="w-full text-left text-sm">
                <thead className="sticky top-0 bg-slate-100 text-slate-600">
                  <tr>
                    <th scope="col" className="px-3 py-2">#</th>
                    <th scope="col" className="px-3 py-2">Student</th>
                    <th scope="col" className="px-3 py-2">Score</th>
                    <th scope="col" className="px-3 py-2">Method</th>
                  </tr>
                </thead>
                <tbody>
                  {ranked.map((student, i) => (
                    <tr key={student.studentId} className="border-t border-slate-200">
                      <td className="px-3 py-2">{i + 1}</td>
                      <td className="px-3 py-2 whitespace-nowrap">
                        {student.studentId} {student.name}
                      </td>
                      <td className="px-3 py-2 font-semibold">
                        {student.screening.score}
                      </td>
                      <td className="px-3 py-2">
                        {student.screening.method === "ai" ? "AI" : "Basic match"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <section className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="text-lg font-semibold">Ready to screen</h2>
        <ul className="mt-3 list-disc space-y-1 pl-6 text-sm text-slate-700">
          <li>
            <strong>{state.students.length}</strong> students imported,{" "}
            <strong>{eligible.length}</strong> eligible under your rules.
          </li>
          <li>
            <strong>{toScore}</strong> eligible resumes will be read and scored
            (about {minutes} minute{minutes === 1 ? "" : "s"}).
          </li>
          {noResume > 0 && (
            <li>
              <strong>{noResume}</strong> eligible student(s) have no PDF and
              will not get a score.
            </li>
          )}
          <li>
            Students who fail a rule are never sent to the AI. Skills and rules
            are locked once the run starts.
          </li>
        </ul>
        <p className="mt-3 text-sm text-slate-500">
          Scoring uses Google&apos;s free Gemini AI. If it is busy, the app uses a
          free keyword &quot;Basic match&quot; instead. The finished drive is saved
          in this browser only.
        </p>

        {phase === "cancelled" && (
          <p
            role="alert"
            className="mt-3 rounded-lg border border-amber-200 bg-amber-50 p-3 text-sm text-amber-900"
          >
            The run was cancelled. Nothing was saved. You can start again.
          </p>
        )}
        {phase === "error" && (
          <p
            role="alert"
            className="mt-3 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-800"
          >
            {error}
          </p>
        )}
      </section>

      <div className="flex justify-between">
        <button
          type="button"
          onClick={onBack}
          className="inline-flex items-center gap-2 rounded-lg border border-slate-300 bg-white px-5 py-3 font-medium hover:bg-slate-100"
        >
          <ArrowLeft size={18} aria-hidden="true" /> Back
        </button>
        <button
          type="button"
          onClick={start}
          disabled={toScore === 0}
          className="inline-flex items-center gap-2 rounded-lg bg-indigo-600 px-5 py-3 font-medium text-white hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-40"
        >
          <Play size={18} aria-hidden="true" />{" "}
          {phase === "cancelled" || phase === "error"
            ? "Start again"
            : "Start screening"}
        </button>
      </div>
    </div>
  );
}
