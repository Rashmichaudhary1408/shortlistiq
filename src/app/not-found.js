import Link from "next/link";

export default function NotFound() {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-8 shadow-sm">
      <h1 className="text-2xl font-bold">Page not found</h1>
      <p className="mt-2 max-w-xl text-slate-600">
        This address does not exist. Check the link, or start from the home
        page.
      </p>
      <div className="mt-5 flex flex-wrap gap-3">
        <Link
          href="/"
          className="rounded-lg bg-indigo-600 px-4 py-2 font-medium text-white hover:bg-indigo-700"
        >
          Go to home
        </Link>
        <Link
          href="/drive/new"
          className="rounded-lg border border-slate-300 bg-white px-4 py-2 font-medium hover:bg-slate-100"
        >
          Start a new drive
        </Link>
      </div>
    </div>
  );
}
