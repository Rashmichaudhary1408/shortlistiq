"use client";

import { useEffect } from "react";
import Link from "next/link";
import { TriangleAlert } from "lucide-react";

export default function ErrorPage({ error, reset }) {
  useEffect(() => {
    // Log only the error id, never page content.
    console.error("Page error", error?.digest || "unknown");
  }, [error]);

  return (
    <div
      role="alert"
      className="rounded-xl border border-red-200 bg-white p-8 shadow-sm"
    >
      <p className="flex items-center gap-2 text-red-700">
        <TriangleAlert size={20} aria-hidden="true" />
        <span className="font-semibold">This page hit a problem</span>
      </p>
      <h1 className="mt-3 text-2xl font-bold">Something went wrong</h1>
      <p className="mt-2 max-w-xl text-slate-600">
        Your saved drives are not affected. Try again, or go back to the home
        page. If it keeps happening, open the drive and download the Excel
        file first.
      </p>
      <div className="mt-5 flex flex-wrap gap-3">
        <button
          type="button"
          onClick={() => reset()}
          className="rounded-lg bg-indigo-600 px-4 py-2 font-medium text-white hover:bg-indigo-700"
        >
          Try again
        </button>
        <Link
          href="/"
          className="rounded-lg border border-slate-300 bg-white px-4 py-2 font-medium hover:bg-slate-100"
        >
          Go to home
        </Link>
      </div>
    </div>
  );
}
