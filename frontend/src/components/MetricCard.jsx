export function MetricCard({ label, value, accent }) {
  return (
    <div className="rounded-[28px] border border-slate-200 bg-white p-5 shadow-[0_12px_40px_rgba(15,23,42,0.07)]">
      <div className="mb-4 h-2 w-20 rounded-full" style={{ backgroundColor: accent }} />
      <p className="text-sm text-slate-500">{label}</p>
      <p className="mt-2 text-3xl font-bold text-slate-900">{value}</p>
    </div>
  );
}
