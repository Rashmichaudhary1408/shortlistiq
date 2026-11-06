"use client";

import { useEffect } from "react";
import { X, Check, Minus } from "lucide-react";
import Badge from "@/components/ui/Badge.js";

const STATE_LABELS = {
  shortlisted: "Shortlisted",
  eligible: "Eligible",
  resume_issue: "Resume issue",
  ineligible: "Not eligible",
};

export default function CandidateDrawer({ student, state, onClose }) {
  useEffect(() => {
    const onKey = (event) => {
      if (event.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  const sc = student.screening || {};
  const b = sc.breakdown || {};
  const scored = typeof sc.score === "number";
  const failedRules = student.eligibility?.failedRules || [];

  return (
    <div
      className="fixed inset-0 z-50 flex justify-end bg-black/30"
      onClick={onClose}
    >
      <aside
        className="h-full w-full max-w-lg overflow-y-auto bg-white p-6 shadow-xl"
        onClick={(event) => event.stopPropagation()}
        role="dialog"
        aria-label={`Details for ${student.name}`}
      >
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 className="text-xl font-bold">{student.name}</h2>
            <p className="text-sm text-slate-600">
              {student.studentId} · {student.branch} · CGPA {student.cgpa ?? "-"} ·
              Backlogs {student.backlogs ?? "-"} · Year {student.gradYear ?? "-"}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="rounded-lg border border-slate-300 p-2 hover:bg-slate-100"
          >
            <X size={16} />
          </button>
        </div>

        <div className="mt-3 flex flex-wrap items-center gap-2">
          <Badge tone={state === "shortlisted" ? "green" : "slate"}>
            {STATE_LABELS[state]}
          </Badge>
          {sc.method === "ai" && <Badge tone="green">Scored by AI</Badge>}
          {sc.method === "fallback" && <Badge tone="amber">Basic match</Badge>}
          {student.override === "include" && <Badge tone="indigo">Added manually</Badge>}
          {student.override === "exclude" && <Badge tone="red">Removed manually</Badge>}
        </div>

        {failedRules.length > 0 && (
          <section className="mt-5">
            <h3 className="font-semibold">Why not eligible</h3>
            <ul className="mt-1 list-disc pl-6 text-sm text-red-800">
              {failedRules.map((f) => (
                <li key={f.rule}>{f.message}</li>
              ))}
            </ul>
          </section>
        )}

        <section className="mt-5">
          <h3 className="font-semibold">Resume</h3>
          <p className="mt-1 text-sm text-slate-700">
            {student.resume?.message || "No information"}
          </p>
        </section>

        {student.dataWarnings?.length > 0 && (
          <section className="mt-5">
            <h3 className="font-semibold">Data notices</h3>
            <ul className="mt-1 list-disc pl-6 text-sm text-amber-800">
              {student.dataWarnings.map((w, i) => (
                <li key={i}>{w}</li>
              ))}
            </ul>
          </section>
        )}

        {scored && (
          <>
            <section className="mt-5 rounded-lg bg-slate-50 p-4">
              <p className="text-3xl font-bold">{sc.score}<span className="text-base font-normal text-slate-500"> / 100</span></p>
              <p className="mt-1 text-sm text-slate-700">
                Required skills {b.requiredMatched}/{b.requiredTotal} · Preferred
                skills {b.preferredMatched}/{b.preferredTotal}
                {b.relevanceRating !== null && b.relevanceRating !== undefined
                  ? ` · Relevance ${b.relevanceRating}/5`
                  : ""}
              </p>
              <p className="mt-2 text-sm text-slate-700">{sc.explanation}</p>
            </section>

            <section className="mt-5">
              <h3 className="font-semibold">Skills</h3>
              <ul className="mt-2 space-y-2 text-sm">
                {sc.skillResults.map((r) => (
                  <li key={r.name} className="flex items-start gap-2">
                    {r.present ? (
                      <Check size={16} className="mt-0.5 shrink-0 text-emerald-600" />
                    ) : (
                      <Minus size={16} className="mt-0.5 shrink-0 text-slate-400" />
                    )}
                    <span>
                      <strong>{r.name}</strong>{" "}
                      <span className="text-slate-500">({r.importance})</span>
                      {r.present && (
                        <span className="block text-slate-600">{r.evidence}</span>
                      )}
                    </span>
                  </li>
                ))}
              </ul>
            </section>

            {sc.relevantExperience?.length > 0 && (
              <section className="mt-5">
                <h3 className="font-semibold">Relevant experience</h3>
                <ul className="mt-2 space-y-2 text-sm">
                  {sc.relevantExperience.map((e, i) => (
                    <li key={i}>
                      <strong>{e.title}</strong>{" "}
                      <span className="text-slate-500">({e.type})</span>
                      <span className="block text-slate-600">{e.why}</span>
                    </li>
                  ))}
                </ul>
              </section>
            )}
          </>
        )}

        <p className="mt-6 text-xs text-slate-500">
          Rules decided eligibility. The score comes from AI evidence plus a
          fixed formula. Always read the resume before deciding.
        </p>
      </aside>
    </div>
  );
}