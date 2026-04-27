import { useState } from "react";
import { CheckCircle, User } from "lucide-react";

export function ProfileCompletion({ user, referenceData, onSave }) {
  const [form, setForm] = useState({
    firstName: user?.firstName || "",
    lastName: user?.lastName || "",
    mobileNumber: "",
    district: "",
    city: "",
  });
  const [saving, setSaving] = useState(false);
  const [done, setDone] = useState(false);

  const set = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }));

  async function handleSubmit(e) {
    e.preventDefault();
    setSaving(true);
    try {
      await onSave(form);
      setDone(true);
    } catch {
      /* error handled by parent */
    } finally {
      setSaving(false);
    }
  }

  if (done) {
    return (
      <div className="flex flex-col items-center justify-center gap-4 py-12 text-center">
        <CheckCircle size={56} className="text-emerald-500" />
        <h2 className="text-2xl font-bold text-slate-900">Profile Saved!</h2>
        <p className="text-slate-500">Redirecting to your dashboard…</p>
      </div>
    );
  }

  return (
    <div className="w-full">
      <div className="mb-6 flex items-center gap-3">
        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-teal-100">
          <User size={24} className="text-teal-700" />
        </div>
        <div>
          <h2 className="text-xl font-bold text-slate-900">Complete Your Profile</h2>
          <p className="text-sm text-slate-500">
            Signed in as <span className="font-medium text-teal-700">{user?.email}</span>
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">First Name</label>
            <input
              className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm focus:border-teal-500 focus:outline-none focus:ring-2 focus:ring-teal-100"
              value={form.firstName}
              onChange={set("firstName")}
              required
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">Last Name</label>
            <input
              className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm focus:border-teal-500 focus:outline-none focus:ring-2 focus:ring-teal-100"
              value={form.lastName}
              onChange={set("lastName")}
              required
            />
          </div>
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-slate-700">Mobile Number</label>
          <input
            type="tel"
            placeholder="10-digit mobile number"
            className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm focus:border-teal-500 focus:outline-none focus:ring-2 focus:ring-teal-100"
            value={form.mobileNumber}
            onChange={set("mobileNumber")}
            required
          />
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-slate-700">District</label>
          <select
            className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm focus:border-teal-500 focus:outline-none focus:ring-2 focus:ring-teal-100"
            value={form.district}
            onChange={set("district")}
            required
          >
            <option value="">Select District</option>
            {(referenceData?.districts || []).map((d) => (
              <option key={d} value={d}>{d}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-slate-700">City</label>
          <select
            className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm focus:border-teal-500 focus:outline-none focus:ring-2 focus:ring-teal-100"
            value={form.city}
            onChange={set("city")}
            required
          >
            <option value="">Select City</option>
            {(referenceData?.cities || []).map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
        </div>

        {/* Email — read only, came from Google */}
        <div className="rounded-xl border border-dashed border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-500">
          📧 Email locked: <span className="font-medium text-slate-700">{user?.email}</span> (from Google)
        </div>

        <button
          type="submit"
          disabled={saving}
          className="w-full rounded-xl bg-[#172033] py-3 text-sm font-semibold text-white transition hover:bg-[#0f1825] disabled:opacity-60"
        >
          {saving ? "Saving…" : "Save & Go to Dashboard →"}
        </button>
      </form>
    </div>
  );
}
