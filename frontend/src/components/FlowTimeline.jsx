const roleColors = {
  ADMIN: "bg-[#172033] text-white",
  STATE: "bg-ink text-white",
  DISTRICT: "bg-sky text-ink",
  DEPARTMENT: "bg-moss text-white",
  CONTRACTOR: "bg-amber-100 text-amber-950",
  VENDOR: "bg-emerald-100 text-emerald-950",
};

export function FlowTimeline({ transactions }) {
  return (
    <div className="glass-panel rounded-[28px] p-6 shadow-panel">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <p className="text-sm uppercase tracking-[0.25em] text-[#9b1c2d]">Transaction Flow</p>
          <h3 className="mt-2 font-display text-2xl text-ink">Fund movement timeline</h3>
        </div>
        <div className="rounded-full bg-[#172033] px-3 py-2 text-xs uppercase tracking-[0.2em] text-white">
          Immutable trail
        </div>
      </div>

      <div className="mt-8 space-y-5">
        {transactions.map((tx) => (
          <div key={tx.id} className="relative flex gap-4">
            <div className="flex w-12 justify-center">
              <div className="mt-1 h-3 w-3 rounded-full bg-ember" />
            </div>
            <div className="flex-1 rounded-3xl border border-white/70 bg-white/70 p-5">
              <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
                <div>
                  <p className="text-lg font-medium text-ink">
                    {tx.senderName} to {tx.receiverName}
                  </p>
                  <p className="mt-1 text-sm text-slate-500">
                    {tx.stage} | Project #{tx.projectId} | {new Date(tx.timestamp).toLocaleString()}
                  </p>
                </div>
                <div className="text-right">
                  <p className="font-display text-2xl text-ink">₹{Number(tx.amount).toLocaleString("en-IN")}</p>
                  <p className="mt-1 text-xs uppercase tracking-[0.2em] text-slate-500">{tx.txHash}</p>
                </div>
              </div>
              <div className="mt-4 flex flex-wrap gap-2">
                <span className={`rounded-full px-3 py-1 text-xs font-medium ${roleColors[tx.senderRole] || "bg-slate-100"}`}>
                  {tx.senderRole}
                </span>
                <span className={`rounded-full px-3 py-1 text-xs font-medium ${roleColors[tx.receiverRole] || "bg-slate-100"}`}>
                  {tx.receiverRole}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
