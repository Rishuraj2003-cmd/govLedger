export function StatCard({ label, value, helper, accent = "bg-moss" }) {
  return (
    <div className="glass-panel rounded-[24px] p-5 shadow-panel">
      <div className={`mb-4 h-2 w-20 rounded-full ${accent}`} />
      <p className="text-sm uppercase tracking-[0.2em] text-slate-500">{label}</p>
      <p className="mt-3 text-3xl font-display text-ink">{value}</p>
      <p className="mt-2 text-sm text-slate-600">{helper}</p>
    </div>
  );
}
