const statusStyles = {
  UP: "border-emerald-200 bg-emerald-50 text-emerald-700",
  DOWN: "border-red-200 bg-red-50 text-red-700",
  DEGRADED: "border-amber-200 bg-amber-50 text-amber-800",
  UNKNOWN: "border-slate-200 bg-slate-50 text-slate-600",
  SUCCESS: "border-emerald-200 bg-emerald-50 text-emerald-700",
  FAILURE: "border-red-200 bg-red-50 text-red-700",
  PAUSED: "border-slate-200 bg-slate-100 text-slate-700",
};

export function StatusBadge({ className = "", status = "UNKNOWN" }) {
  return (
    <span
      className={`inline-flex h-7 w-fit items-center rounded-full border px-2.5 text-xs font-semibold ${
        statusStyles[status] || statusStyles.UNKNOWN
      } ${className}`}
    >
      {status}
    </span>
  );
}
