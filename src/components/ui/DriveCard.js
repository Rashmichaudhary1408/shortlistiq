"use client";

import Link from "next/link";
import { Trash2 } from "lucide-react";

function formatDate(iso) {
  const date = new Date(iso);
  return Number.isNaN(date.getTime())
    ? ""
    : date.toLocaleDateString(undefined, {
        day: "numeric",
        month: "short",
        year: "numeric",
      });
}

export default function DriveCard({ entry, onDelete }) {
  const subtitle = [entry.company, entry.roleTitle].filter(Boolean).join(" · ");
  return (
    <div className="flex flex-wrap items-center justify-between gap-4 rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
      <div>
        <h3 className="text-lg font-semibold">{entry.name}</h3>
        {subtitle && <p className="text-sm text-slate-600">{subtitle}</p>}
        <p className="mt-1 text-sm text-slate-500">
          {entry.totalCount} students · {entry.eligibleCount} eligible ·{" "}
          {entry.shortlistedCount} shortlisted · {formatDate(entry.updatedAt)}
        </p>
      </div>
      <div className="flex items-center gap-2">
        <Link
          href={`/drive/${entry.id}`}
          className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700"
        >
          Open
        </Link>
        <button
          type="button"
          onClick={() => onDelete(entry.id)}
          aria-label={`Delete ${entry.name}`}
          className="rounded-lg border border-slate-300 p-2 text-slate-600 hover:bg-red-50 hover:text-red-700"
        >
          <Trash2 size={16} />
        </button>
      </div>
    </div>
  );
}