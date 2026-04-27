import { ShieldCheck, WalletCards } from "lucide-react";

export function LoginPage({ account, role, onConnect, roleDirectory }) {
  return (
    <div className="grid gap-8 lg:grid-cols-[1.1fr_0.9fr]">
      <div className="glass-panel rounded-[32px] p-8 shadow-panel">
        <p className="text-sm uppercase tracking-[0.25em] text-[#9b1c2d]">Wallet Access</p>
        <h3 className="mt-3 font-display text-4xl leading-tight text-ink">
          Secure sign-in for Bihar government officers and authorized vendors.
        </h3>
        <p className="mt-4 max-w-2xl text-base leading-7 text-slate-600">
          Citizens do not need a wallet to view public information. MetaMask access is only for the operational side of the system such as state-level sanctioning, district transfer approval, department usage, and contractor payments.
        </p>
        <button
          type="button"
          onClick={onConnect}
          className="mt-8 inline-flex items-center gap-3 rounded-full bg-[#172033] px-6 py-3 text-sm font-medium text-white transition hover:translate-y-[-1px]"
        >
          <WalletCards size={18} />
          {account ? "Reconnect wallet" : "Connect MetaMask"}
        </button>
        <div className="mt-8 rounded-[28px] border border-emerald-100 bg-emerald-50 p-5">
          <div className="flex items-start gap-3">
            <ShieldCheck className="mt-1 text-emerald-700" />
            <div>
              <p className="font-medium text-emerald-900">Current access</p>
              <p className="mt-1 text-sm text-emerald-800">
                {account ? `${account} mapped to ${role || "Public User"}.` : "No wallet connected yet. Public dashboard remains available."}
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="glass-panel rounded-[32px] p-8 shadow-panel">
        <p className="text-sm uppercase tracking-[0.25em] text-[#9b1c2d]">Demo Wallet Directory</p>
        <div className="mt-6 space-y-4">
          {roleDirectory.map((user) => (
            <div key={user.address} className="rounded-3xl border border-white/80 bg-white/70 p-4">
              <p className="font-medium text-ink">{user.role}</p>
              <p className="mt-1 text-sm text-slate-500">{user.name}</p>
              <p className="mt-2 font-mono text-xs text-slate-600">{user.address}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
