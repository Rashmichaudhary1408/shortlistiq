"use client";

import { ArrowLeft, ArrowRight } from "lucide-react";
import { applyRules, validateRules } from "@/lib/eligibility.js";

export default function RulesStep({ state, dispatch, onBack, onNext }) {
  const { rules, students } = state;
  const branchOptions = [
    ...new Set(students.map((s) => s.branch).filter(Boolean)),
  ].sort();
  const yearOptions = [
    ...new Set(students.map((s) => s.gradYear).filter((y) => y !== null)),
  ].sort((a, b) => a - b);

  const errors = validateRules(rules);
  const evaluated = errors.length === 0 ? applyRules(students, rules) : [];
  const eligible = evaluated.filter((s) => s.eligibility.eligible);
  const rejected = evaluated.filter((s) => !s.eligibility.eligible);

  function setRules(partial) {
    dispatch({ type: "SET_RULES", payload: { rules: partial } });
  }

  function toggleBranch(branch) {
    const has = rules.branches.includes(branch);
    setRules({
      branches: has
        ? rules.branches.filter((b) => b !== branch)
        : [...rules.branches, branch].sort(),
    });
  }

  function numberValue(text) {
    return text === "" ? "" : Number(text);
  }

  return (
    <div className="space-y-6">
      <section className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="text-lg font-semibold">Eligibility rules</h2>
        <p className="mt-1 text-sm text-slate-600">
          Rules decide who is eligible. Students who fail any rule are never
          sent to the AI.
        </p>

        <div className="mt-4 grid gap-4 sm:grid-cols-3">
          <label className="block text-sm">
            <span className="font-medium">Minimum CGPA</span>
            <input
              type="number"
              step="0.1"
              min="0"
              max="10"
              value={rules.minCgpa}
              onChange={(e) => setRules({ minCgpa: numberValue(e.target.value) })}
              className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2"
            />
          </label>
          <label className="block text-sm">
            <span className="font-medium">Maximum backlogs</span>
            <input
              type="number"
              step="1"
              min="0"
              value={rules.maxBacklogs}
              onChange={(e) =>
                setRules({ maxBacklogs: numberValue(e.target.value) })
              }
              className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2"
            />
          </label>
          <label className="block text-sm">
            <span className="font-medium">Graduation year</span>
            <select
              value={rules.graduationYear === null ? "" : String(rules.graduationYear)}
              onChange={(e) =>
                setRules({
                  graduationYear: e.target.value === "" ? null : Number(e.target.value),
                })
              }
              className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2"
            >
              <option value="">Any</option>
              {yearOptions.map((year) => (
                <option key={year} value={year}>
                  {year}
                </option>
              ))}
            </select>
          </label>
        </div>

        <fieldset className="mt-4">
          <legend className="text-sm font-medium">Allowed branches</legend>
          <div className="mt-2 flex flex-wrap gap-3">
            {branchOptions.map((branch) => (
              <label
                key={branch}
                className="flex items-center gap-2 rounded-lg border border-slate-300 px-3 py-2 text-sm"
              >
                <input
                  type="checkbox"
                  checked={rules.branches.includes(branch)}
                  onChange={() => toggleBranch(branch)}
                />
                {branch}
              </label>
            ))}
          </div>
        </fieldset>

        {errors.map((message) => (
          <p
            key={message}
            className="mt-3 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-800"
          >
            {message}
          </p>
        ))}
      </section>

      {errors.length === 0 && (
        <section className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-lg font-semibold">Live preview</h2>
          <p className="mt-1 text-sm text-slate-700">
            <strong className="text-emerald-700">{eligible.length}</strong>{" "}
            eligible, <strong className="text-red-700">{rejected.length}</strong>{" "}
            not eligible, out of {students.length} students.
          </p>

          {rejected.length > 0 && (
            <div className="mt-4 max-h-80 overflow-auto rounded-lg border border-slate-200">
              <table className="w-full text-left text-sm">
                <thead className="sticky top-0 bg-slate-100 text-slate-600">
                  <tr>
                    <th className="px-3 py-2">Student</th>
                    <th className="px-3 py-2">Why not eligible</th>
                  </tr>
                </thead>
                <tbody>
                  {rejected.map((s) => (
                    <tr key={s.studentId} className="border-t border-slate-200">
                      <td className="px-3 py-2 whitespace-nowrap">
                        {s.studentId} {s.name}
                      </td>
                      <td className="px-3 py-2">
                        {s.eligibility.failedRules.map((f) => f.message).join("; ")}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      )}

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
          onClick={onNext}
          disabled={errors.length > 0}
          className="inline-flex items-center gap-2 rounded-lg bg-indigo-600 px-5 py-3 font-medium text-white hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-40"
        >
          Continue <ArrowRight size={18} />
        </button>
      </div>
    </div>
  );
}