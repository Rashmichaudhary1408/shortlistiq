export function Skeleton({ className = "" }) {
  return (
    <div
      aria-hidden="true"
      className={`rounded-md bg-slate-200 motion-safe:animate-pulse ${className}`}
    />
  );
}

export function DriveListSkeleton() {
  return (
    <div role="status" className="space-y-3">
      <span className="sr-only">Loading your drives</span>
      {[0, 1].map((i) => (
        <div
          key={i}
          className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm"
        >
          <Skeleton className="h-5 w-48" />
          <Skeleton className="mt-3 h-4 w-72 max-w-full" />
        </div>
      ))}
    </div>
  );
}

export function ResultsSkeleton() {
  return (
    <div role="status" className="space-y-6">
      <span className="sr-only">Loading drive</span>
      <div>
        <Skeleton className="h-7 w-56" />
        <Skeleton className="mt-2 h-4 w-40" />
      </div>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
        {[0, 1, 2, 3, 4, 5].map((i) => (
          <div
            key={i}
            className="rounded-lg border border-slate-200 bg-white p-4"
          >
            <Skeleton className="h-7 w-10" />
            <Skeleton className="mt-2 h-4 w-20" />
          </div>
        ))}
      </div>
      <div className="space-y-2 rounded-lg border border-slate-200 bg-white p-4">
        {[0, 1, 2, 3, 4].map((i) => (
          <Skeleton key={i} className="h-8 w-full" />
        ))}
      </div>
    </div>
  );
}
