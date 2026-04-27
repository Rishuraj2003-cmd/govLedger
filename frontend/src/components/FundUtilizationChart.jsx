import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

export function FundUtilizationChart({ data }) {
  return (
    <div className="glass-panel rounded-[28px] p-6 shadow-panel">
      <p className="text-sm uppercase tracking-[0.25em] text-[#9b1c2d]">Utilization Analytics</p>
      <h3 className="mt-2 font-display text-2xl text-ink">District-wise allocation versus utilization</h3>
      <div className="mt-6 h-80">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data}>
            <defs>
              <linearGradient id="allocated" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#2f5d50" stopOpacity={0.8} />
                <stop offset="95%" stopColor="#2f5d50" stopOpacity={0.1} />
              </linearGradient>
              <linearGradient id="spent" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#d97745" stopOpacity={0.8} />
                <stop offset="95%" stopColor="#d97745" stopOpacity={0.1} />
              </linearGradient>
            </defs>
            <CartesianGrid vertical={false} strokeDasharray="3 3" stroke="#d8dfdb" />
            <XAxis dataKey="label" stroke="#64748b" />
            <YAxis stroke="#64748b" />
            <Tooltip />
            <Area type="monotone" dataKey="allocated" stroke="#2f5d50" fillOpacity={1} fill="url(#allocated)" />
            <Area type="monotone" dataKey="spent" stroke="#d97745" fillOpacity={1} fill="url(#spent)" />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
