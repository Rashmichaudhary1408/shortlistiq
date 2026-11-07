"use client";

import Badge from "@/components/ui/Badge.js";
import ScoreBar from "@/components/ui/ScoreBar.js";

const STATE_BADGES = {
  shortlisted: { tone: "green", label: "Shortlisted" },
  eligible: { tone: "indigo", label: "Eligible" },
  resume_issue: { tone: "amber", label: "Resume issue" },
  ineligible: { tone: "red", label: "Not eligible" },
};

export default function ResultsTable({ rows, onToggle, onView }) {
  if (rows.length === 0) {
    return (
      <div className="rounded-lg border border-dashed border-slate-300 bg-white p-8 text-center text-sm text-slate-600">
        No students match this filter. Try another filter or clear the search
        box.
      </div>
    );
  }
  return (
    <div className="overflow-x-auto rounded-lg border border-slate-200 bg-white">
      <table className="w-full min-w-[34rem] text-left text-sm">
        <caption className="sr-only">
          Students ranked by score. Use the button in the last column to add a
          student to the shortlist or remove one.
        </caption>
        <thead className="bg-slate-100 text-slate-600">
          <tr>
            <th scope="col" className="px-3 py-2">
              Rank
            </th>
            <th scope="col" className="px-3 py-2">
              Student
            </th>
            <th scope="col" className="hidden px-3 py-2 sm:table-cell">
              Branch
            </th>
            <th scope="col" className="hidden px-3 py-2 sm:table-cell">
              CGPA
            </th>
            <th scope="col" className="px-3 py-2">
              Score
            </th>
            <th scope="col" className="px-3 py-2">
              Method
            </th>
            <th scope="col" className="px-3 py-2">
              Status
            </th>
            <th scope="col" className="px-3 py-2">
              <span className="sr-only">Action</span>
            </th>
          </tr>
        </thead>
        <tbody>
          {rows.map(({ student, rank, state }) => {
            const badge = STATE_BADGES[state];
            const score = student.screening?.score;
            const method = student.screening?.method;
            const shortlisted = state === "shortlisted";
            return (
              <tr
                key={student.studentId}
                className={
                  "border-t border-slate-200 " +
                  (shortlisted ? "bg-emerald-50/50" : "")
                }
              >
                <td className="px-3 py-2">{rank ?? "-"}</td>
                <td className="px-3 py-2">
                  <button
                    type="button"
                    onClick={() => onView(student.studentId)}
                    aria-haspopup="dialog"
                    className="text-left font-medium text-indigo-700 hover:underline"
                  >
                    <span className="block">{student.name}</span>
                    <span className="block text-xs font-normal text-slate-500">
                      {student.studentId}
                    </span>
                  </button>
                </td>
                <td className="hidden px-3 py-2 sm:table-cell">
                  {student.branch}
                </td>
                <td className="hidden px-3 py-2 sm:table-cell">
                  {student.cgpa ?? "-"}
                </td>
                <td className="px-3 py-2">
                  <ScoreBar score={score} />
                </td>
                <td className="px-3 py-2">
                  {method === "ai" && <Badge tone="green">AI</Badge>}
                  {method === "fallback" && (
                    <Badge tone="amber">Basic match</Badge>
                  )}
                </td>
                <td className="px-3 py-2">
                  <Badge tone={badge.tone}>{badge.label}</Badge>
                  {student.override === "include" && (
                    <span className="mt-1 block text-xs text-slate-500">
                      added manually
                    </span>
                  )}
                  {student.override === "exclude" && (
                    <span className="mt-1 block text-xs text-slate-500">
                      removed manually
                    </span>
                  )}
                </td>
                <td className="px-3 py-2 whitespace-nowrap">
                  <button
                    type="button"
                    onClick={() => onToggle(student.studentId)}
                    aria-label={
                      shortlisted
                        ? `Remove ${student.name} from the shortlist`
                        : `Add ${student.name} to the shortlist`
                    }
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
