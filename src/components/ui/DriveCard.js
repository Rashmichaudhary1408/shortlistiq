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
  const subtitle = entry.company
    ? `${entry.roleTitle || "Role"} at ${entry.company}`
    : entry.roleTitle || "";
  return (
    <div className="flex flex-wrap items-center justify-between gap-4 rounded-xl border border-slate-200 bg-white p-5 shadow-sm transition-colors hover:border-indigo-300">
      <div className="min-w-0">
        <h3 className="truncate text-lg font-semibold">{entry.name}</h3>
        {subtitle && <p className="text-sm text-slate-600">{subtitle}</p>}
        <p className="mt-2 flex flex-wrap gap-x-5 gap-y-1 text-sm text-slate-600">
          <span>
            <strong className="text-slate-900">{entry.totalCount}</strong>{" "}
            students
          </span>
          <span>
            <strong className="text-slate-900">{entry.eligibleCount}</strong>{" "}
            eligible
          </span>
          <span>
            <strong className="text-emerald-700">{entry.shortlistedCount}</strong>{" "}
            shortlisted
          </span>
          <span className="text-slate-500">
            Updated {formatDate(entry.updatedAt)}
          </span>
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
          onClick={() => onDelete(entry)}
          aria-label={`Delete ${entry.name}`}
          className="rounded-lg border border-slate-300 p-2 text-slate-600 hover:bg-red-50 hover:text-red-700"
        >
          <Trash2 size={16} aria-hidden="true" />
        </button>
      </div>
    </div>
  );
}
