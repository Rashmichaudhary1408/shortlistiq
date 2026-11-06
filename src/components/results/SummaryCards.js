import { getStudentState } from "@/lib/shortlist.js";

function Card({ label, value, tone = "text-slate-900" }) {
  return (
    <div className="rounded-lg border border-slate-200 bg-white p-4">
      <p className={`text-2xl font-bold ${tone}`}>{value}</p>
      <p className="text-sm text-slate-600">{label}</p>
    </div>
  );
}

export default function SummaryCards({ drive, finalSet }) {
  const students = drive.students;
  const count = (state) =>
    students.filter((s) => getStudentState(s, finalSet) === state).length;
  const eligible = students.filter((s) => s.eligibility?.eligible).length;
  const scored = students.filter(
    (s) => typeof s.screening?.score === "number"
  ).length;

  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
      <Card label="Total students" value={students.length} />
      <Card label="Eligible" value={eligible} tone="text-indigo-700" />
      <Card label="Scored" value={scored} />
      <Card label="Shortlisted" value={finalSet.size} tone="text-emerald-700" />
      <Card label="Resume issues" value={count("resume_issue")} tone="text-amber-700" />
      <Card label="Not eligible" value={count("ineligible")} tone="text-red-700" />
    </div>
  );
}