"use client";

import { useRef, useState } from "react";
import {
  ArrowLeft,
  Play,
  Square,
  TriangleAlert,
  CircleCheck,
} from "lucide-react";
import { createDrive } from "@/lib/driveModel.js";
import { applyRules } from "@/lib/eligibility.js";
import { normalizeSkills } from "@/lib/skills.js";
import { runScreening } from "@/lib/runner.js";
import { rankStudents } from "@/lib/shortlist.js";

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
  const [phase, setPhase] = useState("ready");
  const [progress, setProgress] = useState({ done: 0, total: 0, message: "" });
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");
  const controllerRef = useRef(null);

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
        <div className="mt-4 h-3 w-full overflow-hidden rounded-full bg-slate-200">
          <div
            className="h-3 rounded-full bg-indigo-600 transition-all"
            style={{ width: `${percent}%` }}
          />
        </div>
        <p className="mt-2 text-sm text-slate-700">
          {progress.done} of {progress.total} students processed ({percent}%)
        </p>
        <p className="mt-1 text-sm text-slate-500">{progress.message}</p>
        <p className="mt-3 text-sm text-slate-500">
          Keep this tab open. Closing it stops the run.
        </p>
        <button
          type="button"
          onClick={cancel}
          className="mt-4 inline-flex items-center gap-2 rounded-lg border border-red-300 bg-white px-4 py-2 font-medium text-red-700 hover:bg-red-50"
        >
          <Square size={16} /> Cancel run
        </button>
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
        <section className="rounded-xl border border-emerald-200 bg-emerald-50 p-6">
          <p className="flex items-center gap-2 text-lg font-semibold text-emerald-900">
            <CircleCheck size={20} /> Screening complete
          </p>
          <p className="mt-1 text-sm text-emerald-900">
            Saving, Top N selection and Excel export arrive in the next step.
          </p>
        </section>

        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
          <Stat label="Scored by AI" value={aiCount} tone="text-emerald-700" />
          <Stat label="Basic match" value={basicCount} tone="text-amber-700" />
          <Stat label="Not eligible" value={count("not_scanned")} tone="text-red-700" />
          <Stat label="No resume" value={count("missing")} tone="text-amber-700" />
          <Stat label="Unreadable" value={count("unreadable")} tone="text-amber-700" />
          <Stat label="Total students" value={students.length} />
        </div>

        {result.warnings.length > 0 && (
          <div className="rounded-lg border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
            <p className="flex items-center gap-2 font-medium">
              <TriangleAlert size={16} /> Notices
            </p>
            <ul className="mt-1 list-disc pl-6">
              {result.warnings.slice(0, 10).map((warning, i) => (
                <li key={i}>{warning}</li>
              ))}
            </ul>
          </div>
        )}

        <section className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-lg font-semibold">Ranked students</h2>
          {ranked.length === 0 ? (
            <p className="mt-2 text-sm text-slate-600">
              No student could be scored. Check the notices above.
            </p>
          ) : (
            <div className="mt-3 max-h-[28rem] overflow-auto rounded-lg border border-slate-200">
              <table className="w-full text-left text-sm">
                <thead className="sticky top-0 bg-slate-100 text-slate-600">
                  <tr>
                    <th className="px-3 py-2">#</th>
                    <th className="px-3 py-2">Student</th>
                    <th className="px-3 py-2">Score</th>
                    <th className="px-3 py-2">Method</th>
                    <th className="px-3 py-2">Summary</th>
                  </tr>
                </thead>
                <tbody>
                  {ranked.map((student, i) => (
                    <tr key={student.studentId} className="border-t border-slate-200 align-top">
                      <td className="px-3 py-2">{i + 1}</td>
                      <td className="px-3 py-2 whitespace-nowrap">
                        {student.studentId} {student.name}
                      </td>
                      <td className="px-3 py-2 font-semibold">
                        {student.screening.score}
                      </td>
                      <td className="px-3 py-2 whitespace-nowrap">
                        {student.screening.method === "ai" ? (
                          <span className="rounded-full bg-emerald-100 px-2 py-1 text-xs text-emerald-800">
                            AI
                          </span>
                        ) : (
                          <span className="rounded-full bg-amber-100 px-2 py-1 text-xs text-amber-800">
                            Basic match
                          </span>
                        )}
                      </td>
                      <td className="px-3 py-2 text-slate-700">
                        {student.screening.explanation}
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
          free keyword &quot;Basic match&quot; instead.
        </p>

        {phase === "cancelled" && (
          <p className="mt-3 rounded-lg border border-amber-200 bg-amber-50 p-3 text-sm text-amber-900">
            The run was cancelled. Nothing was saved. You can start again.
          </p>
        )}
        {phase === "error" && (
          <p className="mt-3 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-800">
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
          <ArrowLeft size={18} /> Back
        </button>
        <button
          type="button"
          onClick={start}
          disabled={toScore === 0}
          className="inline-flex items-center gap-2 rounded-lg bg-indigo-600 px-5 py-3 font-medium text-white hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-40"
        >
          <Play size={18} />{" "}
          {phase === "cancelled" || phase === "error"
            ? "Start again"
            : "Start screening"}
        </button>
      </div>
    </div>
  );
}