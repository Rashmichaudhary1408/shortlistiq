const TONES = {
  green: "bg-emerald-100 text-emerald-800",
  amber: "bg-amber-100 text-amber-800",
  red: "bg-red-100 text-red-800",
  indigo: "bg-indigo-100 text-indigo-800",
  slate: "bg-slate-100 text-slate-700",
};

export default function Badge({ tone = "slate", children }) {
  return (
    <span
      className={`inline-block whitespace-nowrap rounded-full px-2 py-1 text-xs font-medium ${
        TONES[tone] || TONES.slate
      }`}
    >
      {children}
    </span>
  );
}