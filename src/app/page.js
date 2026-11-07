"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Plus, ShieldCheck } from "lucide-react";
import DriveCard from "@/components/ui/DriveCard.js";
import ConfirmDialog from "@/components/ui/ConfirmDialog.js";
import ScoreBar from "@/components/ui/ScoreBar.js";
import Badge from "@/components/ui/Badge.js";
import { DriveListSkeleton } from "@/components/ui/Skeleton.js";
import { useToast } from "@/components/ui/Toast.js";
import { listDrives, deleteDrive } from "@/lib/storage.js";

const STEPS = [
  {
    title: "Upload",
    text: "Add your student spreadsheet and the resume PDFs, named by Student ID.",
  },
  {
    title: "Paste the job description",
    text: "Gemini suggests the skills. You edit the list.",
  },
  {
    title: "Set the rules",
    text: "CGPA, branches, backlogs and graduation year. Every failed rule is shown.",
  },
  {
    title: "Review the shortlist",
    text: "Ranked scores with evidence. Add or remove anyone, then export to Excel.",
  },
];

function ExampleResult() {
  return (
    <div
      role="img"
      aria-label="Example result using fake data. Priya Sharma scores 86 and is shortlisted. Karan Mehta scores 41 and is eligible. Sneha Rao is not eligible because her CGPA of 6.8 is below 7.0, so her resume is never sent to the AI."
      className="rounded-xl border border-slate-200 bg-white shadow-sm"
    >
      <p className="border-b border-slate-200 px-4 py-3 text-sm text-slate-500">
        Example result, using fake data
      </p>
      <ul className="divide-y divide-slate-200 text-sm">
        <li className="space-y-1 px-4 py-3">
          <div className="flex items-center justify-between gap-3">
            <span className="font-medium">Priya Sharma</span>
            <Badge tone="green">Shortlisted</Badge>
          </div>
          <ScoreBar score={86} />
          <p className="text-slate-600">
            Built a logistics tracker with React and Node.js.
          </p>
        </li>
        <li className="space-y-1 px-4 py-3">
          <div className="flex items-center justify-between gap-3">
            <span className="font-medium">Karan Mehta</span>
            <Badge tone="indigo">Eligible</Badge>
          </div>
          <ScoreBar score={41} />
          <p className="text-slate-600">
            Embedded projects. No web framework shown.
          </p>
        </li>
        <li className="space-y-1 px-4 py-3">
          <div className="flex items-center justify-between gap-3">
            <span className="font-medium">Sneha Rao</span>
            <Badge tone="red">Not eligible</Badge>
          </div>
          <p className="font-medium text-red-800">CGPA 6.8 &lt; 7.0</p>
          <p className="text-slate-600">
            Failed a rule, so the resume is never sent to the AI.
          </p>
        </li>
      </ul>
    </div>
  );
}

export default function HomePage() {
  const toast = useToast();
  const [drives, setDrives] = useState(null);
  const [error, setError] = useState("");
  const [pending, setPending] = useState(null);

  function refresh() {
    const result = listDrives();
    setDrives(result.drives);
    setError(result.ok ? "" : result.error);
  }

  useEffect(() => {
    refresh();
  }, []);

  function confirmDelete() {
    if (!pending) return;
    const { id, name } = pending;
    const result = deleteDrive(id);
    setPending(null);
    refresh();
    if (result.ok) {
      toast.show(`Deleted "${name}"`);
    } else {
      toast.show(result.error, { tone: "error" });
    }
  }

  return (
    <div className="space-y-12">
      <section className="grid items-center gap-8 lg:grid-cols-2">
        <div>
          <h1 className="text-3xl font-bold leading-tight tracking-tight sm:text-4xl">
            Shortlist students with reasons you can show.
          </h1>
          <p className="mt-4 max-w-xl text-slate-600">
            Upload your spreadsheet and resumes, set your eligibility rules, and
            get a ranked list. Rules decide who is eligible. AI only checks how
            well each resume fits.
          </p>
          <Link
            href="/drive/new"
            className="mt-6 inline-flex items-center gap-2 rounded-lg bg-indigo-600 px-5 py-3 font-medium text-white shadow-sm hover:bg-indigo-700"
          >
            <Plus size={18} aria-hidden="true" /> Start a new drive
          </Link>
          <p className="mt-4 flex max-w-xl items-start gap-2 text-sm text-slate-500">
            <ShieldCheck
              size={16}
              className="mt-0.5 shrink-0 text-indigo-700"
              aria-hidden="true"
            />
            Your files stay in this browser. Only the text of eligible
            students&apos; resumes goes to Google&apos;s free Gemini AI.
          </p>
        </div>
        <ExampleResult />
      </section>

      <section aria-labelledby="how-it-works">
        <h2 id="how-it-works" className="text-xl font-semibold">
          How it works
        </h2>
        <ol className="mt-4 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {STEPS.map((step, index) => (
            <li key={step.title} className="border-t-2 border-indigo-600 pt-3">
              <h3 className="font-semibold">
                {index + 1}. {step.title}
              </h3>
              <p className="mt-1 text-sm text-slate-600">{step.text}</p>
            </li>
          ))}
        </ol>
      </section>

      <section aria-labelledby="past-drives">
        <h2 id="past-drives" className="text-xl font-semibold">
          Past drives
        </h2>
        <p className="mt-1 text-sm text-slate-500">
          Saved in this browser only. Export to Excel to keep a permanent copy.
        </p>
        {error && (
          <p
            role="alert"
            className="mt-3 rounded-lg border border-amber-200 bg-amber-50 p-3 text-sm text-amber-900"
          >
            {error}
          </p>
        )}
        <div className="mt-4 space-y-3">
          {drives === null && <DriveListSkeleton />}
          {drives && drives.length === 0 && (
            <div className="rounded-xl border border-dashed border-slate-300 bg-white p-8 text-center">
              <p className="font-medium">No drives yet</p>
              <p className="mt-1 text-sm text-slate-600">
                Your finished drives will show up here, ready to reopen.
              </p>
              <Link
                href="/drive/new"
                className="mt-4 inline-flex items-center gap-2 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700"
              >
                <Plus size={16} aria-hidden="true" /> Start your first drive
              </Link>
            </div>
          )}
          {drives &&
            drives.map((entry) => (
              <DriveCard key={entry.id} entry={entry} onDelete={setPending} />
            ))}
        </div>
      </section>

      <ConfirmDialog
        open={Boolean(pending)}
        title="Delete this drive?"
        message={
          pending
            ? `"${pending.name}" will be removed from this browser. This cannot be undone. Export it to Excel first if you need a copy.`
            : ""
        }
        confirmLabel="Delete drive"
        danger
        onConfirm={confirmDelete}
        onCancel={() => setPending(null)}
      />
    </div>
  );
}
