import { useMemo } from "react";
import { FundUtilizationChart } from "../components/FundUtilizationChart";
import { FlowTimeline } from "../components/FlowTimeline";
import { ProjectTable } from "../components/ProjectTable";
import { SectionTitle } from "../components/SectionTitle";
import { StatCard } from "../components/StatCard";

export function PublicDashboard({ overview, analytics, transactions }) {
  const chartData = useMemo(
    () =>
      analytics.utilizationByDistrict.map((item) => ({
        label: item.district,
        allocated: item.allocated,
        spent: item.utilized,
      })),
    [analytics],
  );

  return (
    <div className="space-y-8">
      <section className="glass-panel rounded-[32px] p-6 shadow-panel">
        <div className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr] lg:items-center">
          <div>
            <p className="text-sm uppercase tracking-[0.25em] text-[#9b1c2d]">Bihar Public Transparency Portal</p>
            <h3 className="mt-3 font-display text-4xl leading-tight text-ink">
              Track Bihar government funds from sanction to final payment.
            </h3>
            <p className="mt-4 max-w-3xl text-base leading-7 text-slate-600">
              Citizens can review project budgets, district-wise spending, audit alerts, and transaction movement without any editing rights. The layout is simplified so information is easy to read on desktop and mobile.
            </p>
          </div>
          <div className="rounded-[28px] bg-[#172033] p-6 text-white">
            <p className="text-sm uppercase tracking-[0.2em] text-[#ffd59a]">Quick Access</p>
            <div className="mt-4 space-y-3 text-sm leading-6 text-slate-100">
              <p>1. Open public dashboard to see all projects.</p>
              <p>2. Search the ledger to track any transfer.</p>
              <p>3. Use wallet login only for government workflow actions.</p>
            </div>
          </div>
        </div>
      </section>

      <section className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Tracked Budget" value={`₹${Number(overview.totalBudget).toLocaleString("en-IN")}`} helper="Across active Bihar government projects." />
        <StatCard label="Funds Utilized" value={`₹${Number(overview.totalUtilized).toLocaleString("en-IN")}`} helper="Payments already recorded on the ledger." accent="bg-[#f7941e]" />
        <StatCard label="Available Balance" value={`₹${Number(overview.remainingFunds).toLocaleString("en-IN")}`} helper="Budget still available for approved release." accent="bg-[#4d8f78]" />
        <StatCard label="Audit Alerts" value={overview.alertCount} helper="Cases that need officer review." accent="bg-[#b52130]" />
      </section>

      <section>
        <SectionTitle
          eyebrow="Citizen View / नागरिक डैशबोर्ड"
          title="Public view of Bihar schemes and fund flow"
          description="This section is designed for easy reading. Citizens can review district, department, budget, spent amount, and remaining balance without needing any login."
        />
        <ProjectTable projects={overview.projects} />
      </section>

      <section className="grid gap-8 xl:grid-cols-[1.2fr_1fr]">
        <FundUtilizationChart data={chartData} />
        <div className="glass-panel rounded-[28px] p-6 shadow-panel">
          <p className="text-sm uppercase tracking-[0.25em] text-[#9b1c2d]">Audit Monitoring</p>
          <h3 className="mt-2 font-display text-2xl text-ink">Alerts and review points</h3>
          <div className="mt-6 space-y-4">
            {analytics.alerts.map((alert) => (
              <div key={alert.id} className="rounded-3xl border border-amber-200 bg-amber-50 p-4">
                <p className="font-medium text-amber-900">{alert.title}</p>
                <p className="mt-1 text-sm leading-6 text-amber-800">{alert.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section>
        <FlowTimeline transactions={transactions.slice(0, 6)} />
      </section>
    </div>
  );
}
