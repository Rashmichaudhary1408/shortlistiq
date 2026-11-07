const STEPS = ["Upload", "Skills", "Rules", "Run"];

export default function Stepper({ current }) {
  return (
    <nav aria-label="Progress" className="mb-8">
      <ol className="flex items-center gap-2">
        {STEPS.map((label, index) => {
          const number = index + 1;
          const done = number < current;
          const active = number === current;
          return (
            <li
              key={label}
              aria-current={active ? "step" : undefined}
              className="flex flex-1 items-center gap-2"
            >
              <span
                aria-hidden="true"
                className={
                  "flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-sm font-semibold " +
                  (active
                    ? "bg-indigo-600 text-white"
                    : done
                    ? "bg-emerald-600 text-white"
                    : "bg-slate-200 text-slate-600")
                }
              >
                {done ? "✓" : number}
              </span>
              <span
                className={
                  "text-sm " +
                  (active
                    ? "font-semibold text-slate-900"
                    : "sr-only text-slate-500 sm:not-sr-only")
                }
              >
                <span className="sr-only">
                  Step {number} of {STEPS.length}:{" "}
                </span>
                {label}
                {done && <span className="sr-only"> (completed)</span>}
              </span>
              {number < STEPS.length && (
                <span className="h-px flex-1 bg-slate-300" aria-hidden="true" />
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
