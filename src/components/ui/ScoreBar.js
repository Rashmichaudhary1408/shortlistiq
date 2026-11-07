// Shows a score as a number plus a small bar, so a ranked list is easy to scan.
export default function ScoreBar({ score }) {
  if (typeof score !== "number") {
    return <span className="text-slate-400">-</span>;
  }
  const tone =
    score >= 60 ? "bg-emerald-600" : score >= 30 ? "bg-amber-500" : "bg-slate-400";
  return (
    <div
      role="img"
      aria-label={`Score ${score} out of 100`}
      className="flex items-center gap-2"
    >
      <span className="w-7 font-semibold tabular-nums">{score}</span>
      <span
        aria-hidden="true"
        className="h-1.5 w-14 overflow-hidden rounded-full bg-slate-200"
      >
        <span
          className={`block h-full rounded-full ${tone}`}
          style={{ width: `${Math.min(100, Math.max(0, score))}%` }}
        />
      </span>
    </div>
  );
}
