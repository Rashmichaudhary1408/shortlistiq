"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

function Mark() {
  return (
    <svg width="28" height="28" viewBox="0 0 28 28" aria-hidden="true">
      <rect width="28" height="28" rx="7" className="fill-indigo-700" />
      <path
        d="M8 9h12M8 14h7M8 19h5"
        stroke="white"
        strokeWidth="2"
        strokeLinecap="round"
        fill="none"
      />
      <path
        d="M16.5 18.5l2.2 2.2 4-4.6"
        stroke="#aed9d4"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
    </svg>
  );
}

export default function Header() {
  const pathname = usePathname();
  const onHome = pathname === "/";
  const onNew = pathname === "/drive/new";

  return (
    <header className="sticky top-0 z-40 border-b border-slate-200 bg-white/90 backdrop-blur">
      <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-3">
        <Link
          href="/"
          className="flex items-center gap-2 text-lg font-bold tracking-tight text-indigo-800"
        >
          <Mark />
          ShortlistIQ
        </Link>
        <nav aria-label="Main" className="flex items-center gap-2 text-sm">
          <Link
            href="/"
            aria-current={onHome ? "page" : undefined}
            className={
              "rounded-lg px-3 py-2 font-medium " +
              (onHome
                ? "bg-slate-100 text-slate-900"
                : "text-slate-600 hover:bg-slate-100 hover:text-slate-900")
            }
          >
            Home
          </Link>
          <Link
            href="/drive/new"
            aria-current={onNew ? "page" : undefined}
            className={
              "rounded-lg px-3 py-2 font-medium text-white " +
              (onNew ? "bg-indigo-800" : "bg-indigo-600 hover:bg-indigo-700")
            }
          >
            New drive
          </Link>
        </nav>
      </div>
    </header>
  );
}
