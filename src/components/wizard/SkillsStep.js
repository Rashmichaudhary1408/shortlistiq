"use client";

import { useState } from "react";
import {
  ArrowLeft,
  ArrowRight,
  Sparkles,
  Plus,
  Trash2,
  TriangleAlert,
  CircleCheck,
} from "lucide-react";
import { extractSkills } from "@/lib/aiClient.js";
import { createSkill } from "@/lib/driveModel.js";
import { normalizeSkills } from "@/lib/skills.js";
import { canLeaveSkills } from "@/lib/wizardReducer.js";
import { LIMITS } from "@/lib/constants.js";

export default function SkillsStep({ state, dispatch, onBack, onNext }) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  const jdLength = state.jdText.trim().length;
  const jdOk = jdLength >= LIMITS.jdMin && jdLength <= LIMITS.jdMax;
  const hints = state.eligibilityHints;
  const filledSkills = state.skills.filter((s) => s.name.trim() !== "").length;
  const mergedCount = filledSkills - normalizeSkills(state.skills).length;

  const hintLines = hints
    ? [
        hints.minCgpa !== null && `Minimum CGPA ${hints.minCgpa}`,
        hints.branches && `Branches ${hints.branches.join(", ")}`,
        hints.maxBacklogs !== null && `Maximum backlogs ${hints.maxBacklogs}`,
        hints.graduationYear !== null &&
          `Graduation year ${hints.graduationYear}`,
      ].filter(Boolean)
    : [];

  function setField(field, value) {
    dispatch({ type: "SET_FIELD", payload: { field, value } });
  }

  function setSkills(skills) {
    dispatch({ type: "SET_SKILLS", payload: { skills } });
  }

  function updateSkill(id, changes) {
    setSkills(state.skills.map((s) => (s.id === id ? { ...s, ...changes } : s)));
  }

  async function handleExtract() {
    setError("");
    setNotice("");
    setBusy(true);
    const result = await extractSkills(state.jdText.trim());
    setBusy(false);
    if (!result.ok) {
      setError(result.error);
      return;
    }
    dispatch({ type: "SET_EXTRACTION", payload: result.data });
    const count = result.data.skills?.length ?? 0;
    setNotice(
      count > 0
        ? `Found ${count} skills. Review and edit them below.`
        : "No skills were found. Add them yourself below."
    );
  }

  function handleNext() {
    setSkills(normalizeSkills(state.skills));
    onNext();
  }

  return (
    <div className="space-y-6">
      <section className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="text-lg font-semibold">Job description</h2>
        <p className="mt-1 text-sm text-slate-600">
          Paste the job description. Google&apos;s free Gemini AI will suggest the
          role title and skills. You can edit everything.
        </p>
        <textarea
          value={state.jdText}
          onChange={(e) => setField("jdText", e.target.value)}
          rows={10}
          maxLength={LIMITS.jdMax + 500}
          placeholder="Paste the job description here..."
          className="mt-3 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
        />
        <div className="mt-2 flex flex-wrap items-center justify-between gap-3">
          <span
            className={
              "text-sm " + (jdOk || jdLength === 0 ? "text-slate-500" : "text-red-700")
            }
          >
            {jdLength} characters (needs {LIMITS.jdMin} to {LIMITS.jdMax})
          </span>
          <button
            type="button"
            onClick={handleExtract}
            disabled={!jdOk || busy}
            className="inline-flex items-center gap-2 rounded-lg bg-indigo-600 px-4 py-2 font-medium text-white hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-40"
          >
            <Sparkles size={18} />
            {busy ? "Extracting... (up to 30 seconds)" : "Extract skills with AI"}
          </button>
        </div>

        {error && (
          <div className="mt-3 rounded-lg border border-amber-200 bg-amber-50 p-3 text-sm text-amber-900">
            <p className="flex items-center gap-2 font-medium">
              <TriangleAlert size={16} /> {error}
            </p>
            <p className="mt-1">
              You can still add the skills yourself below, or try again in a
              minute.
            </p>
          </div>
        )}
        {notice && (
          <p className="mt-3 flex items-center gap-2 text-sm text-emerald-700">
            <CircleCheck size={16} /> {notice}
          </p>
        )}
      </section>

      <section className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="text-lg font-semibold">Role and skills</h2>
        <label className="mt-3 block text-sm">
          <span className="font-medium">Role title</span>
          <input
            type="text"
            maxLength={LIMITS.roleTitleMax}
            value={state.roleTitle}
            onChange={(e) => setField("roleTitle", e.target.value)}
            placeholder="e.g. Associate Software Engineer"
            className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2"
          />
        </label>

        <div className="mt-4 space-y-2">
          {state.skills.length === 0 && (
            <p className="text-sm text-slate-500">
              No skills yet. Use the AI button above or add a skill.
            </p>
          )}
          {state.skills.map((skill) => (
            <div key={skill.id} className="flex items-center gap-2">
              <input
                type="text"
                maxLength={LIMITS.skillNameMax}
                value={skill.name}
                onChange={(e) => updateSkill(skill.id, { name: e.target.value })}
                placeholder="Skill name"
                aria-label="Skill name"
                className="flex-1 rounded-lg border border-slate-300 px-3 py-2 text-sm"
              />
              <select
                value={skill.importance}
                onChange={(e) =>
                  updateSkill(skill.id, { importance: e.target.value })
                }
                aria-label="Importance"
                className="rounded-lg border border-slate-300 px-3 py-2 text-sm"
              >
                <option value="required">Required</option>
                <option value="preferred">Preferred</option>
              </select>
              <button
                type="button"
                onClick={() =>
                  setSkills(state.skills.filter((s) => s.id !== skill.id))
                }
                aria-label={`Remove ${skill.name || "skill"}`}
                className="rounded-lg border border-slate-300 p-2 text-slate-600 hover:bg-red-50 hover:text-red-700"
              >
                <Trash2 size={16} />
              </button>
            </div>
          ))}
        </div>

        <div className="mt-3 flex items-center justify-between">
          <button
            type="button"
            onClick={() =>
              setSkills([
                ...state.skills,
                createSkill({ name: "", importance: "required" }),
              ])
            }
            disabled={state.skills.length >= LIMITS.skillsMax}
            className="inline-flex items-center gap-2 rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm font-medium hover:bg-slate-100 disabled:opacity-40"
          >
            <Plus size={16} /> Add skill
          </button>
          <span className="text-sm text-slate-500">
            {state.skills.length} of {LIMITS.skillsMax} skills
          </span>
        </div>
        {mergedCount > 0 && (
          <p className="mt-2 text-sm text-amber-800">
            {mergedCount} duplicate skill(s) will be merged when you continue.
          </p>
        )}
      </section>

      {hints && (
        <section className="rounded-xl border border-indigo-200 bg-indigo-50 p-6">
          <h2 className="text-lg font-semibold text-indigo-900">
            Eligibility hints from the job description
          </h2>
          {hintLines.length === 0 ? (
            <p className="mt-1 text-sm text-indigo-900">
              The job description did not state any eligibility requirements.
            </p>
          ) : (
            <>
              <ul className="mt-2 list-disc pl-6 text-sm text-indigo-900">
                {hintLines.map((line) => (
                  <li key={line}>{line}</li>
                ))}
              </ul>
              {state.hintsApplied ? (
                <p className="mt-3 flex items-center gap-2 text-sm text-emerald-700">
                  <CircleCheck size={16} /> Applied. You can adjust them in the
                  Rules step.
                </p>
              ) : (
                <button
                  type="button"
                  onClick={() => dispatch({ type: "APPLY_HINTS" })}
                  className="mt-3 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700"
                >
                  Apply to rules
                </button>
              )}
            </>
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
          onClick={handleNext}
          disabled={!canLeaveSkills(state)}
          className="inline-flex items-center gap-2 rounded-lg bg-indigo-600 px-5 py-3 font-medium text-white hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-40"
        >
          Continue <ArrowRight size={18} />
        </button>
      </div>
    </div>
  );
}