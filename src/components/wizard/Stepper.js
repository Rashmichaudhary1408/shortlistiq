const STEPS = ["Upload", "Skills", "Rules", "Run"];

export default function Stepper({ current }) {
  return (
    <ol className="mb-8 flex items-center gap-2">
      {STEPS.map((label, index) => {
        const number = index + 1;
        const done = number < current;
        const active = number === current;
        return (
          <li key={label} className="flex flex-1 items-center gap-2">
            <span
              className={
                "flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-sm font-semibold " +
                (active
                  ? "bg-indigo-600 text-white"
                  : done
                  ? "bg-emerald-500 text-white"
                  : "bg-slate-200 text-slate-600")
              }
            >
              {done ? "✓" : number}
            </span>
            <span
              className={
                "text-sm " +
                (active ? "font-semibold text-slate-900" : "text-slate-500")
              }
            >
              {label}
            </span>
            {number < STEPS.length && (
              <span className="h-px flex-1 bg-slate-300" aria-hidden="true" />
            )}
          </li>
        );
      })}
    </ol>
  );
}