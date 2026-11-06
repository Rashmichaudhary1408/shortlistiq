"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import DriveCard from "@/components/ui/DriveCard.js";
import { listDrives, deleteDrive } from "@/lib/storage.js";

export default function HomePage() {
  const [drives, setDrives] = useState(null);
  const [error, setError] = useState("");

  function refresh() {
    const result = listDrives();
    setDrives(result.drives);
    setError(result.ok ? "" : result.error);
  }

  useEffect(() => {
    refresh();
  }, []);

  function handleDelete(id) {
    const confirmed = window.confirm(
      "Delete this drive from this browser? This cannot be undone."
    );
    if (!confirmed) return;
    deleteDrive(id);
    refresh();
  }

  return (
    <div className="space-y-8">
      <section className="rounded-xl border border-slate-200 bg-white p-8 shadow-sm">
        <h1 className="text-3xl font-bold">Welcome to ShortlistIQ</h1>
        <p className="mt-3 max-w-2xl text-slate-600">
          Upload your student spreadsheet and resumes, set your eligibility
          rules, and get a ranked shortlist with reasons. Rules decide who is
          eligible. AI only judges how well a resume fits.
        </p>
        <Link
          href="/drive/new"
          className="mt-6 inline-flex items-center gap-2 rounded-lg bg-indigo-600 px-5 py-3 font-medium text-white hover:bg-indigo-700"
        >
          Start a new drive <ArrowRight size={18} />
        </Link>
      </section>

      <section>
        <h2 className="text-xl font-semibold">Past drives</h2>
        <p className="mt-1 text-sm text-slate-500">
          Saved in this browser only. Export to Excel to keep a permanent copy.
        </p>
        {error && (
          <p className="mt-3 rounded-lg border border-amber-200 bg-amber-50 p-3 text-sm text-amber-900">
            {error}
          </p>
        )}
        <div className="mt-4 space-y-3">
          {drives === null && <p className="text-slate-500">Loading...</p>}
          {drives && drives.length === 0 && (
            <p className="rounded-lg border border-dashed border-slate-300 bg-white p-6 text-sm text-slate-600">
              No drives yet. Start a new drive to see it here.
            </p>
          )}
          {drives &&
            drives.map((entry) => (
              <DriveCard key={entry.id} entry={entry} onDelete={handleDelete} />
            ))}
        </div>
      </section>
    </div>
  );
}