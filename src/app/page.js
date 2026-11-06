import Link from "next/link";
import { ArrowRight } from "lucide-react";

export default function HomePage() {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-8 shadow-sm">
      <h1 className="text-3xl font-bold">Welcome to ShortlistIQ</h1>
      <p className="mt-3 max-w-2xl text-slate-600">
        Upload your student spreadsheet and resumes, set your eligibility rules,
        and get a ranked shortlist with reasons. Rules decide who is eligible.
        AI only judges how well a resume fits.
      </p>
      <Link
        href="/drive/new"
        className="mt-6 inline-flex items-center gap-2 rounded-lg bg-indigo-600 px-5 py-3 font-medium text-white hover:bg-indigo-700"
      >
        Start a new drive <ArrowRight size={18} />
      </Link>
      <p className="mt-6 text-sm text-slate-500">
        Hello World version. The full home page with past drives arrives later.
      </p>
    </div>
  );
}