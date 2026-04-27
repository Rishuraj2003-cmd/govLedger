import { NavLink } from "react-router-dom";
import { Building2, Landmark, LayoutDashboard, ScrollText, ShieldCheck, Workflow } from "lucide-react";

const links = [
  { to: "/", label: "Public Dashboard", icon: LayoutDashboard },
  { to: "/login", label: "Wallet Login", icon: ShieldCheck },
  { to: "/admin", label: "Admin Console", icon: Landmark },
  { to: "/district", label: "District View", icon: Building2 },
  { to: "/department", label: "Department Ops", icon: Workflow },
  { to: "/transactions", label: "Ledger", icon: ScrollText },
];

export function Sidebar() {
  return (
    <aside className="glass-panel soft-grid sticky top-6 hidden h-[calc(100vh-3rem)] w-72 shrink-0 rounded-[28px] p-6 shadow-panel lg:block">
      <div className="mb-10">
        <div className="inline-flex rounded-full bg-[#fff2df] px-3 py-1 text-xs font-semibold uppercase tracking-[0.25em] text-[#9b1c2d]">
          Bihar Treasury
        </div>
        <h1 className="mt-4 text-2xl font-display text-ink">Bihar Government Fund Tracking Portal</h1>
        <p className="mt-3 text-sm leading-6 text-slate-600">
          A citizen-friendly blockchain dashboard for tracking public money from the State Government of Bihar to district, department, contractor, and vendor.
        </p>
      </div>

      <nav className="space-y-2">
        {links.map(({ to, label, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              `flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-medium transition ${
                isActive
                  ? "bg-[#b52130] text-white shadow-lg"
                  : "text-slate-700 hover:bg-white hover:text-ink"
              }`
            }
          >
            <Icon size={18} />
            <span>{label}</span>
          </NavLink>
        ))}
      </nav>

      <div className="panel-divider mt-8 pt-6 text-sm text-slate-600">
        <p className="font-medium text-ink">Easy access design</p>
        <p className="mt-2 leading-6">
          Simple labels, large touch targets, clear contrast, and public read-only access for citizens across Bihar.
        </p>
      </div>
    </aside>
  );
}
