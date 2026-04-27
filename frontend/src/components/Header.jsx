import { BellRing, CircleDot, Landmark, Wallet } from "lucide-react";
import { shortAddress } from "../lib/wallet";

export function Header({ account, role, onConnect }) {
  return (
    <header className="glass-panel rounded-[28px] p-5 shadow-panel">
      <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <p className="text-sm uppercase tracking-[0.25em] text-[#9b1c2d]">Government of Bihar</p>
          <h2 className="mt-2 font-display text-3xl text-ink">Transparent public fund tracking for Bihar projects</h2>
          <p className="mt-3 max-w-3xl text-sm leading-6 text-slate-600">
            Designed for easy access by citizens, district offices, and departments with simple screens, live status, and immutable blockchain-backed records.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <div className="rounded-full bg-[#172033] px-4 py-2 text-sm text-white">
            <span className="mr-2 inline-flex items-center gap-2">
              <CircleDot size={14} className="text-emerald-400" />
              {role || "Public User / नागरिक"}
            </span>
          </div>
          <div className="rounded-full border border-white/80 bg-white/70 px-4 py-2 text-sm text-slate-700">
            <span className="inline-flex items-center gap-2">
              <Wallet size={14} />
              {shortAddress(account)}
            </span>
          </div>
          <button
            type="button"
            onClick={onConnect}
            className="inline-flex items-center gap-2 rounded-full bg-[#b52130] px-4 py-2 text-sm font-medium text-white transition hover:brightness-105"
          >
            <BellRing size={15} />
            Connect Wallet
          </button>
        </div>
      </div>

      <div className="panel-divider mt-5 flex flex-wrap gap-3 pt-5 text-sm text-slate-700">
        <div className="inline-flex items-center gap-2 rounded-full bg-[#fff2df] px-4 py-2">
          <Landmark size={15} className="text-[#b52130]" />
          Bihar State to District to Department to Vendor
        </div>
        <div className="rounded-full bg-[#f5f7fb] px-4 py-2">Public dashboard available without login</div>
      </div>
    </header>
  );
}
