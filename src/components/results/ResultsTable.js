"use client";

import Badge from "@/components/ui/Badge.js";

const STATE_BADGES = {
  shortlisted: { tone: "green", label: "Shortlisted" },
  eligible: { tone: "indigo", label: "Eligible" },
  resume_issue: { tone: "amber", label: "Resume issue" },
  ineligible: { tone: "red", label: "Not eligible" },
};

export default function ResultsTable({ rows, onToggle, onView }) {
  if (rows.length === 0) {
    return (
      <p className="rounded-lg border border-slate-200 bg-white p-6 text-sm text-slate-600">
        No students match this filter.
      </p>
    );
  }
  return (
    <div className="overflow-x-auto rounded-lg border border-slate-200 bg-white">
      <table className="w-full text-left text-sm">
        <thead className="bg-slate-100 text-slate-600">
          <tr>
            <th className="px-3 py-2">Rank</th>
            <th className="px-3 py-2">Student</th>
            <th className="px-3 py-2">Branch</th>
            <th className="px-3 py-2">CGPA</th>
            <th className="px-3 py-2">Score</th>
            <th className="px-3 py-2">Method</th>
            <th className="px-3 py-2">Status</th>
            <th className="px-3 py-2">Actions</th>
          </tr>
        </thead>
        <tbody>
          {rows.map(({ student, rank, state }) => {
            const badge = STATE_BADGES[state];
            const score = student.screening?.score;
            const method = student.screening?.method;
            const shortlisted = state === "shortlisted";
            return (
              <tr key={student.studentId} className="border-t border-slate-200">
                <td className="px-3 py-2">{rank ?? "-"}</td>
                <td className="px-3 py-2 whitespace-nowrap">
                  <button
                    type="button"
                    onClick={() => onView(student.studentId)}
                    className="text-left font-medium text-indigo-700 hover:underline"
                  >
                    {student.studentId} {student.name}
                  </button>
                </td>
                <td className="px-3 py-2">{student.branch}</td>
                <td className="px-3 py-2">{student.cgpa ?? "-"}</td>
                <td className="px-3 py-2 font-semibold">
                  {typeof score === "number" ? score : "-"}
                </td>
                <td className="px-3 py-2">
                  {method === "ai" && <Badge tone="green">AI</Badge>}
                  {method === "fallback" && <Badge tone="amber">Basic match</Badge>}
                </td>
                <td className="px-3 py-2">
                  <Badge tone={badge.tone}>{badge.label}</Badge>
                  {student.override === "include" && (
                    <span className="ml-2 text-xs text-slate-500">added manually</span>
                  )}
                  {student.override === "exclude" && (
                    <span className="ml-2 text-xs text-slate-500">removed manually</span>
                  )}
                </td>
                <td className="px-3 py-2 whitespace-nowrap">
                  <button
                    type="button"
                    onClick={() => onToggle(student.studentId)}
                    className={
                      "rounded-lg border px-3 py-1 text-xs font-medium " +
                      (shortlisted
                        ? "border-red-300 text-red-700 hover:bg-red-50"
                        : "border-emerald-300 text-emerald-700 hover:bg-emerald-50")
                    }
                  >
                    {shortlisted ? "Remove" : "Add"}
                  </button>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}