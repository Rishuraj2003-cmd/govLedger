import { useMemo, useState } from "react";
import { ArrowLeftRight, BellPlus, IndianRupee, LayoutDashboard, LogOut, Shield, UserCircle, Users, Wallet, ClipboardCheck, FileText, Image as ImageIcon, Search, ChevronRight, Share2, FileBarChart } from "lucide-react";
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { LanguageSwitcher } from "../components/LanguageSwitcher";
import { Footer } from "../components/Footer";
import { ProjectDetail } from "../components/ProjectDetail";
import { t } from "../lib/i18n";
import { shortAddress } from "../lib/wallet";

function SectionCard({ title, subtitle, children, right, className = "" }) {
  return (
    <section className={`rounded-2xl border border-slate-200 bg-white p-6 shadow-sm ${className}`}>
      <div className="mb-6 flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h3 className="text-xl font-bold text-slate-900">{title}</h3>
          {subtitle ? <p className="mt-1 text-sm text-slate-500">{subtitle}</p> : null}
        </div>
        {right}
      </div>
      {children}
    </section>
  );
}

function FormInput({ label, ...props }) {
  return (
    <label className="block text-sm font-semibold text-slate-700">
      <span className="mb-1.5 block">{label}</span>
      <input
        {...props}
        className="w-full rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm outline-none transition-all focus:border-[#0F172A] focus:ring-2 focus:ring-[#0F172A]/10 disabled:bg-slate-50 disabled:text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-[#0F172A] file:text-white hover:file:bg-slate-800"
      />
    </label>
  );
}

function FormSelect({ label, children, ...props }) {
  return (
    <label className="block text-sm font-semibold text-slate-700">
      <span className="mb-1.5 block">{label}</span>
      <select
        {...props}
        className="w-full rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm outline-none transition-all focus:border-[#0F172A] focus:ring-2 focus:ring-[#0F172A]/10 disabled:bg-slate-50 disabled:text-slate-500"
      >
        {children}
      </select>
    </label>
  );
}

function NumberFormatInput({ label, value, onChangeRaw, ...props }) {
  const [displayValue, setDisplayValue] = useState(value ? Number(value).toLocaleString('en-IN') : "");

  const handleChange = (e) => {
    let raw = e.target.value.replace(/[^0-9.]/g, '');
    const parts = raw.split('.');
    if (parts.length > 2) return;

    let formatted = "";
    if (raw) {
      let intPart = parts[0];
      if (intPart) {
        formatted = Number(intPart).toLocaleString('en-IN');
      }
      if (parts.length > 1) {
        formatted += '.' + parts[1];
      }
    }
    // Allow trailing dot during typing
    if (e.target.value.endsWith('.')) {
      formatted += '.';
    }
    setDisplayValue(formatted);
    onChangeRaw(raw);
  };

  return (
    <FormInput
      label={label}
      type="text"
      value={displayValue}
      onChange={handleChange}
      {...props}
    />
  );
}

const ROLE_COLORS = {
  ADMIN: "bg-purple-100 text-purple-800",
  DISTRICT: "bg-blue-100 text-blue-800",
  DEPARTMENT: "bg-teal-100 text-teal-800",
  OFFICER: "bg-indigo-100 text-indigo-800",
  CONTRACTOR: "bg-orange-100 text-orange-800",
  VENDOR: "bg-yellow-100 text-yellow-800",
  PUBLIC: "bg-slate-100 text-slate-600",
};

function ProfileSection({ user, language, referenceData, onUpdateProfile }) {
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({
    firstName: user.firstName || "",
    lastName: user.lastName || "",
    mobileNumber: user.mobileNumber || "",
    district: user.district || "",
    departmentName: user.departmentName || "",
    profilePicUrl: user.profilePicUrl || "",
  });
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const set = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }));

  async function handleSave(e) {
    e.preventDefault();
    setSaving(true);
    try {
      await onUpdateProfile(form);
      setSaved(true);
      setEditing(false);
      setTimeout(() => setSaved(false), 3000);
    } catch { /* parent handles error */ }
    finally { setSaving(false); }
  }

  const handleProfilePicUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setForm(f => ({ ...f, profilePicUrl: reader.result }));
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <SectionCard title="My Profile" subtitle="Your account information and profile details.">
      <div className="grid gap-6 lg:grid-cols-[1fr_2fr]">
        <div className="flex flex-col items-center gap-4 rounded-2xl bg-slate-50 p-6 text-center border border-slate-200">
          <div className="flex h-24 w-24 overflow-hidden items-center justify-center rounded-full bg-[#0F172A] text-3xl font-bold text-white shadow-lg border-[4px] border-slate-200">
            {user.profilePicUrl ? (
              <img src={user.profilePicUrl} alt="Avatar" className="h-full w-full object-cover" />
            ) : (
              `${user.firstName?.[0] || ""}${user.lastName?.[0] || ""}`
            )}
          </div>
          <div>
            <p className="text-xl font-bold text-slate-900">{user.firstName} {user.lastName}</p>
            <p className="text-sm font-medium text-slate-500">{user.email}</p>
          </div>
          <span className={`rounded-full px-3 py-1 text-xs font-bold uppercase tracking-wider ${ROLE_COLORS[user.role] || "bg-slate-100 text-slate-600"}`}>
            {user.role}
          </span>
          {!editing && (
            <button onClick={() => setEditing(true)} className="mt-4 w-full rounded-xl bg-[#0F172A] px-4 py-2.5 text-sm font-bold text-white hover:bg-slate-800 transition">
              Edit Profile
            </button>
          )}
          {saved && <p className="text-xs font-bold text-emerald-600 mt-2">✓ Profile updated successfully!</p>}
        </div>

        {editing ? (
          <form onSubmit={handleSave} className="grid gap-5 sm:grid-cols-2">
            <FormInput label="First Name" value={form.firstName} onChange={set("firstName")} required />
            <FormInput label="Last Name" value={form.lastName} onChange={set("lastName")} required />
            <FormInput label="Mobile Number" value={form.mobileNumber} onChange={set("mobileNumber")} />

            <label className="block text-sm font-semibold text-slate-700">
              <span className="mb-1.5 block">Profile Picture (Upload)</span>
              <input type="file" accept="image/*" onChange={handleProfilePicUpload} className="w-full rounded-xl border border-slate-300 bg-white px-4 py-2 text-sm outline-none transition-all file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-[#0F172A] file:text-white hover:file:bg-slate-800" />
            </label>

            <FormInput label="Department Name" value={form.departmentName} onChange={set("departmentName")} />
            {user.role !== "DEPARTMENT" && user.role !== "ADMIN" && (
              <FormSelect label="District" value={form.district} onChange={set("district")} required>
                <option value="">Select District</option>
                {(referenceData?.districts || []).map((d) => <option key={d} value={d}>{d}</option>)}
              </FormSelect>
            )}

            <div className="col-span-full flex gap-3 mt-4">
              <button type="submit" disabled={saving} className="rounded-xl bg-[#0F172A] px-6 py-2.5 text-sm font-bold text-white shadow-md disabled:opacity-60">
                {saving ? "Saving…" : "Save Changes"}
              </button>
              <button type="button" onClick={() => setEditing(false)} className="rounded-xl border border-slate-300 px-6 py-2.5 text-sm font-bold text-slate-700 hover:bg-slate-50">
                Cancel
              </button>
            </div>
          </form>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 content-start">
            {[
              { label: "First Name", value: user.firstName },
              { label: "Last Name", value: user.lastName },
              { label: "Email", value: user.email },
              { label: "Mobile", value: user.mobileNumber || "Not set" },
              { label: "Department", value: user.departmentName || "—" },
              { label: "District", value: user.district },
              { label: "State", value: user.state || "Bihar" },
              { label: "Wallet", value: user.walletAddress ? `${user.walletAddress.slice(0, 10)}…` : "Not connected" },
            ].map(({ label, value }) => (
              <div key={label} className="rounded-xl border border-slate-200 bg-slate-50 px-5 py-3">
                <p className="text-xs font-bold text-slate-400 uppercase tracking-wide">{label}</p>
                <p className="mt-1 text-sm font-semibold text-slate-800">{value}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </SectionCard>
  );
}

function FundFlowVisualizer({ totalBudget, allocated, utilized }) {
  return (
    <div className="w-full overflow-x-auto pb-4">
      <div className="flex min-w-max items-center justify-between gap-2 px-4 py-8 bg-slate-50 rounded-2xl border border-slate-200">

        <div className="flex flex-col items-center min-w-[140px] relative group">
          <div className="absolute -top-10 bg-[#0F172A] text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-20">State Govt.</div>
          <div className="w-24 h-24 rounded-full bg-[#0F172A] text-white flex items-center justify-center font-bold shadow-xl border-[6px] border-slate-200 z-10 transition-transform group-hover:scale-105">
            State
          </div>
          <p className="mt-3 font-bold text-slate-900">₹{Number(totalBudget || 0).toLocaleString("en-IN")}</p>
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Total Budget</p>
        </div>

        <div className="flex-1 flex items-center min-w-[80px]">
          <div className="h-1 w-full bg-blue-200 relative">
            <div className="absolute top-0 left-0 h-full bg-blue-500 animate-[flowRight_2s_linear_infinite]" style={{ width: '50%' }}></div>
          </div>
          <ChevronRight className="text-blue-500 -ml-3 z-10" />
        </div>

        <div className="flex flex-col items-center min-w-[140px] relative group">
          <div className="w-20 h-20 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold shadow-lg border-[4px] border-blue-100 z-10 transition-transform group-hover:scale-105">
            Dept
          </div>
          <p className="mt-3 font-bold text-slate-900">₹{Number(allocated || 0).toLocaleString("en-IN")}</p>
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Allocated</p>
        </div>

        <div className="flex-1 flex items-center min-w-[80px]">
          <div className="h-1 w-full bg-green-200 relative">
            <div className="absolute top-0 left-0 h-full bg-green-500 animate-[flowRight_2s_linear_infinite]" style={{ width: '50%', animationDelay: '0.5s' }}></div>
          </div>
          <ChevronRight className="text-green-500 -ml-3 z-10" />
        </div>

        <div className="flex flex-col items-center min-w-[140px] relative group">
          <div className="w-16 h-16 rounded-full bg-[#16A34A] text-white flex items-center justify-center font-bold shadow-lg border-[4px] border-green-100 z-10 transition-transform group-hover:scale-105">
            Dist
          </div>
          <p className="mt-3 font-bold text-slate-900">₹{Number(utilized || 0).toLocaleString("en-IN")}</p>
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Utilized</p>
        </div>

        <div className="flex-1 flex items-center min-w-[80px]">
          <div className="h-1 w-full bg-orange-200 relative">
            <div className="absolute top-0 left-0 h-full bg-orange-500 animate-[flowRight_2s_linear_infinite]" style={{ width: '50%', animationDelay: '1s' }}></div>
          </div>
          <ChevronRight className="text-orange-500 -ml-3 z-10" />
        </div>

        <div className="flex flex-col items-center min-w-[140px] relative group">
          <div className="w-16 h-16 rounded-lg bg-[#F97316] text-white flex items-center justify-center font-bold shadow-lg border-[4px] border-orange-100 z-10 transition-transform group-hover:scale-105 transform rotate-3">
            Proj
          </div>
          <p className="mt-3 font-bold text-slate-900">Execution</p>
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Project</p>
        </div>

      </div>
      <style>{`
        @keyframes flowRight {
          0% { left: -50%; }
          100% { left: 100%; }
        }
      `}</style>
    </div>
  );
}

export function DashboardPage({
  language,
  setLanguage,
  user,
  overview,
  analytics,
  users,
  pendingSubmissions,
  referenceData,
  walletAddress,
  onLogout,
  onConnectWallet,
  onUpdateProfile,
  onCreateProject,
  onAllocateFunds,
  onTransferFunds,
  onCreateAnnouncement,
  onCreateUser,
  onGetProject,
  onSubmitWork,
  onApproveWork,
  onRejectWork,
}) {
  const [tab, setTab] = useState("dashboard");
  const [selectedProjectId, setSelectedProjectId] = useState(null);

  // Forms
  const [projectForm, setProjectForm] = useState({
    name: "", description: "", budget: "", department: "", district: "", state: "Bihar", timelineStart: "", timelineEnd: "",
  });
  const [allocationForm, setAllocationForm] = useState({
    projectId: "", receiverName: "", receiverRole: "DEPARTMENT", receiverWallet: "", amount: "", note: "",
  });
  const [transferForm, setTransferForm] = useState({
    projectId: "", senderRole: user.role, receiverName: "", receiverRole: user.role === "DEPARTMENT" ? "DISTRICT" : "VENDOR", receiverWallet: "", amount: "", note: "",
  });
  const [announcementForm, setAnnouncementForm] = useState({ title: "", message: "", audience: "ALL", priority: "NORMAL", expiryDate: "", fileUrl: "" });

  const [userForm, setUserForm] = useState({
    firstName: "", lastName: "", mobileNumber: "", email: "", departmentName: user.role === "DEPARTMENT" ? user.departmentName : "", district: (user.role === "DISTRICT" || user.role === "DEPARTMENT") ? user.district : "", state: "Bihar", role: user.role === "ADMIN" ? "DISTRICT" : user.role === "DISTRICT" ? "DEPARTMENT" : "OFFICER", password: "",
  });
  const [userCreated, setUserCreated] = useState(false);
  const [userSearch, setUserSearch] = useState("");
  const [userRoleFilter, setUserRoleFilter] = useState("ALL");
  const transactions = overview.transactions || [];
  const announcements = overview.announcements || [];
  const projects = overview.projects || [];

  const departmentOptions = useMemo(() => {
    const deps = users
      .filter(u => u.departmentName && u.departmentName.trim() !== "")
      .map(u => u.departmentName.trim());
    return [...new Set(deps)].sort();
  }, [users]);

  const tabItems = useMemo(() => {
    const base = [
      { key: "dashboard", label: t(language, "dashboard"), icon: LayoutDashboard },
      { key: "fund-flow", label: "Fund Flow", icon: Share2 },
      { key: "projects", label: t(language, "projects"), icon: IndianRupee },
      { key: "transactions", label: t(language, "transactions"), icon: ArrowLeftRight },
      { key: "announcements", label: t(language, "announcements"), icon: BellPlus },
    ];
    if (["ADMIN", "DISTRICT", "DEPARTMENT"].includes(user.role)) {
      base.push({ key: "approvals", label: "Approvals", icon: ClipboardCheck });
      base.push({ key: "fund-management", label: "Fund Management", icon: Shield });
    }
    if (user.role === "ADMIN") {
      base.push({ key: "people", label: t(language, "people"), icon: Users });
    }
    return base;
  }, [user.role, language]);

  const handleAllocationReceiverChange = (e) => {
    const name = e.target.value;
    const selectedUser = users.find(u => `${u.firstName} ${u.lastName}` === name);
    setAllocationForm(prev => ({
      ...prev,
      receiverName: name,
      receiverWallet: selectedUser ? selectedUser.walletAddress : prev.receiverWallet
    }));
  };

  const handleTransferReceiverChange = (e) => {
    const name = e.target.value;
    const selectedUser = users.find(u => `${u.firstName} ${u.lastName}` === name);
    setTransferForm(prev => ({
      ...prev,
      receiverName: name,
      receiverWallet: selectedUser ? selectedUser.walletAddress : prev.receiverWallet,
      receiverRole: selectedUser ? selectedUser.role : prev.receiverRole
    }));
  };

  const handleAnnouncementFileUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setAnnouncementForm(prev => ({ ...prev, fileUrl: reader.result }));
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex flex-col md:flex-row">
      <aside className="w-full md:w-64 bg-[#0F172A] text-white flex-shrink-0 md:min-h-screen flex flex-col shadow-xl z-20">
        <div className="p-6 border-b border-white/10 flex items-center gap-3">
          <div className="w-8 h-8 rounded bg-[#DC2626] flex items-center justify-center font-bold shadow-lg">B</div>
          <span className="font-bold text-lg tracking-wide uppercase">{t(language, "appName")}</span>
        </div>
        <nav className="flex-1 py-6 px-3 flex flex-col gap-1 overflow-y-auto">
          {tabItems.map(({ key, label, icon: Icon }) => (
            <button
              key={key}
              onClick={() => { setTab(key); setSelectedProjectId(null); }}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all ${tab === key ? "bg-[#DC2626] text-white shadow-md" : "text-slate-300 hover:bg-white/10 hover:text-white"
                }`}
            >
              <Icon size={18} />
              {label}
            </button>
          ))}
        </nav>
        <div className="p-4 border-t border-white/10">
          <button onClick={onLogout} className="flex items-center gap-3 w-full px-4 py-3 rounded-xl text-sm font-semibold text-slate-300 hover:bg-white/10 hover:text-white transition-all">
            <LogOut size={18} />
            {t(language, "logout")}
          </button>
        </div>
      </aside>

      <div className="flex-1 flex flex-col min-w-0 h-screen overflow-hidden">
        <header className="bg-white border-b border-slate-200 h-20 px-6 flex items-center justify-between shadow-sm z-10 flex-shrink-0">
          <div className="flex items-center bg-slate-100 rounded-full px-4 py-2 w-full max-w-md border border-slate-200 focus-within:ring-2 focus-within:ring-[#0F172A]/10 transition-all">
            <Search className="text-slate-400" size={18} />
            <input type="text" placeholder="Search..." className="bg-transparent border-none outline-none ml-3 w-full text-sm font-medium text-slate-700 placeholder:text-slate-400" />
          </div>

          <div className="flex items-center gap-4">
            <LanguageSwitcher language={language} setLanguage={setLanguage} />
            <button className="relative p-2 text-slate-400 hover:text-slate-600 transition-colors">
              <BellPlus size={20} />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-[#DC2626] rounded-full border border-white"></span>
            </button>
            <button onClick={onConnectWallet} className={`px-4 py-2 rounded-full text-sm font-bold shadow-sm transition-all flex items-center gap-2 ${walletAddress ? 'bg-[#16A34A]/10 text-[#16A34A] border border-[#16A34A]/20' : 'bg-[#0F172A] text-white hover:bg-slate-800'}`}>
              <Wallet size={16} />
              {walletAddress ? shortAddress(walletAddress) : t(language, "connectWallet")}
            </button>
            <div className="h-8 w-px bg-slate-200 mx-2"></div>
            <div className="flex items-center gap-3 cursor-pointer" onClick={() => setTab('profile')}>
              <div className="text-right hidden sm:block">
                <p className="text-sm font-bold text-slate-900 leading-tight">{user.firstName} {user.lastName}</p>
                <p className="text-xs font-semibold text-slate-500">{user.role}</p>
              </div>
              <div className="w-10 h-10 overflow-hidden rounded-full bg-blue-100 border-2 border-[#0F172A] shadow-sm flex items-center justify-center text-blue-800 font-bold">
                {user.profilePicUrl ? <img src={user.profilePicUrl} alt="P" className="w-full h-full object-cover" /> : `${user.firstName?.[0] || ""}${user.lastName?.[0] || ""}`}
              </div>
            </div>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-6 md:p-8">

          {tab === "profile" ? (
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
              <ProfileSection user={user} language={language} referenceData={referenceData} onUpdateProfile={onUpdateProfile} />
            </div>
          ) : null}

          {tab === "dashboard" ? (
            <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
                <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm relative overflow-hidden group">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-[#0F172A]/5 rounded-bl-full -mr-10 -mt-10 transition-transform group-hover:scale-110"></div>
                  <p className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-1">{t(language, "totalBudget")}</p>
                  <p className="text-3xl font-bold text-slate-900">₹{(overview.totalBudget ? overview.totalBudget / 10000000 : 0).toFixed(2)} Cr</p>
                </div>
                <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm relative overflow-hidden group">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-[#16A34A]/5 rounded-bl-full -mr-10 -mt-10 transition-transform group-hover:scale-110"></div>
                  <p className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-1">{t(language, "totalAllocated")}</p>
                  <p className="text-3xl font-bold text-slate-900">₹{(overview.totalAllocated ? overview.totalAllocated / 10000000 : 0).toFixed(2)} Cr</p>
                </div>
                <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm relative overflow-hidden group">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-[#F97316]/5 rounded-bl-full -mr-10 -mt-10 transition-transform group-hover:scale-110"></div>
                  <p className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-1">{t(language, "totalUtilized")}</p>
                  <p className="text-3xl font-bold text-slate-900">₹{(overview.totalUtilized ? overview.totalUtilized / 10000000 : 0).toFixed(2)} Cr</p>
                </div>
                <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm relative overflow-hidden group">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-[#DC2626]/5 rounded-bl-full -mr-10 -mt-10 transition-transform group-hover:scale-110"></div>
                  <p className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-1">{t(language, "remainingFunds")}</p>
                  <p className="text-3xl font-bold text-slate-900">₹{(overview.remainingFunds ? overview.remainingFunds / 10000000 : 0).toFixed(2)} Cr</p>
                </div>
              </div>

              <SectionCard
                title="Fund Flow Overview"
                subtitle="Live pipeline tracking of government funds"
                right={<button onClick={() => setTab("fund-flow")} className="text-sm font-bold text-[#DC2626] hover:underline">View Full Flow &rarr;</button>}
              >
                <FundFlowVisualizer totalBudget={overview.totalBudget} allocated={overview.totalAllocated} utilized={overview.totalUtilized} />
              </SectionCard>
            </div>
          ) : null}

          {tab === "fund-flow" ? (
            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
              <SectionCard title="Fund Flow Visualization" subtitle="Track the complete journey of funds">
                <div className="p-8 bg-slate-50 rounded-2xl border border-slate-200">
                  <FundFlowVisualizer totalBudget={overview.totalBudget} allocated={overview.totalAllocated} utilized={overview.totalUtilized} />
                </div>
              </SectionCard>
            </div>
          ) : null}

          {tab === "projects" ? (
            selectedProjectId ? (
              <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                <ProjectDetail projectId={selectedProjectId} user={user} onBack={() => setSelectedProjectId(null)} onGetProject={onGetProject} onSubmitWork={onSubmitWork} />
              </div>
            ) : (
              <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                <h2 className="text-2xl font-bold text-slate-900">{t(language, "projects")}</h2>
                <SectionCard className="!p-0 overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm">
                      <thead className="bg-white text-slate-500 border-b border-slate-200">
                        <tr>
                          <th className="px-6 py-4 font-bold">{t(language, "projectName")}</th>
                          <th className="px-6 py-4 font-bold">{t(language, "department")}</th>
                          <th className="px-6 py-4 font-bold">{t(language, "district")}</th>
                          <th className="px-6 py-4 font-bold">{t(language, "budget")}</th>
                          <th className="px-6 py-4 font-bold">Status</th>
                          <th className="px-6 py-4 font-bold">Action</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {projects.length > 0 ? projects.map(p => (
                          <tr key={p._id} className="hover:bg-slate-50 transition-colors">
                            <td className="px-6 py-4 font-bold text-slate-900">{p.name}</td>
                            <td className="px-6 py-4 font-medium text-slate-700">{p.department}</td>
                            <td className="px-6 py-4 font-medium text-slate-700">{p.district}</td>
                            <td className="px-6 py-4 font-bold text-slate-900">₹{(p.budget / 10000000).toFixed(2)} Cr</td>
                            <td className="px-6 py-4"><span className="px-2.5 py-1 rounded-md text-xs font-bold bg-[#16A34A]/10 text-[#16A34A]">{p.status}</span></td>
                            <td className="px-6 py-4">
                              <button onClick={() => setSelectedProjectId(p._id)} className="p-2 text-slate-400 hover:text-[#0F172A] hover:bg-slate-100 rounded-lg"><Share2 size={16} /></button>
                            </td>
                          </tr>
                        )) : (
                          <tr><td colSpan="6" className="px-6 py-8 text-center text-slate-500">{t(language, "emptyProjects")}</td></tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </SectionCard>
              </div>
            )
          ) : null}

          {tab === "transactions" ? (
            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
              <h2 className="text-2xl font-bold text-slate-900">{t(language, "transactions")}</h2>
              <SectionCard className="!p-0 overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-sm">
                    <thead className="bg-white text-slate-500 border-b border-slate-200">
                      <tr>
                        <th className="px-6 py-4 font-bold">TX Hash</th>
                        <th className="px-6 py-4 font-bold">From</th>
                        <th className="px-6 py-4 font-bold">To</th>
                        <th className="px-6 py-4 font-bold">{t(language, "amount")}</th>
                        <th className="px-6 py-4 font-bold">Purpose</th>
                        <th className="px-6 py-4 font-bold">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {transactions.map(tx => (
                        <tr key={tx._id} className="hover:bg-slate-50 transition-colors">
                          <td className="px-6 py-4 font-mono text-xs text-blue-600">{tx.txHash ? shortAddress(tx.txHash) : "Pending"}</td>
                          <td className="px-6 py-4 font-medium text-slate-700">{tx.senderName}</td>
                          <td className="px-6 py-4 font-medium text-slate-700">{tx.receiverName || "System"}</td>
                          <td className="px-6 py-4 font-bold text-slate-900">₹{(tx.amount / 10000000).toFixed(2)} Cr</td>
                          <td className="px-6 py-4 font-medium text-slate-600 truncate max-w-[200px]">{tx.note || tx.actionType}</td>
                          <td className="px-6 py-4"><span className="px-2.5 py-1 rounded-md text-xs font-bold bg-[#16A34A]/10 text-[#16A34A]">Success</span></td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </SectionCard>
            </div>
          ) : null}

          {tab === "announcements" ? (
            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
              <h2 className="text-2xl font-bold text-slate-900">{t(language, "announcements")}</h2>
              {announcements.length > 0 ? (
                <div className="grid gap-6 md:grid-cols-2">
                  {announcements.map((a) => (
                    <SectionCard key={a._id} className="hover:shadow-md transition-shadow" title={a.title} subtitle={new Date(a.createdAt).toLocaleDateString()}>
                      <p className="mt-4 text-sm text-slate-700 leading-relaxed">{a.message}</p>
                      {a.fileUrl && (
                        <div className="mt-4">
                          <img src={a.fileUrl} alt="Announcement Attachment" className="rounded-xl w-full max-h-48 object-cover border border-slate-200" />
                        </div>
                      )}
                      <div className="mt-5 flex items-center justify-between">
                        <span className="text-xs font-bold text-[#0F172A] bg-slate-100 px-3 py-1 rounded-full uppercase tracking-wider">{a.audience}</span>
                      </div>
                    </SectionCard>
                  ))}
                </div>
              ) : (
                <SectionCard>
                  <p className="text-center text-slate-500 py-10">{t(language, "emptyAnnouncements")}</p>
                </SectionCard>
              )}
            </div>
          ) : null}

          {tab === "fund-management" && ["ADMIN", "DISTRICT", "DEPARTMENT"].includes(user.role) ? (
            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
              <h2 className="text-2xl font-bold text-slate-900 mb-2">Fund Management</h2>

              <div className="grid gap-8 xl:grid-cols-2 items-start">
                {user.role === "DISTRICT" && (
                  <SectionCard title={t(language, "createProject")} subtitle="Setup a new district project">
                    <form className="grid gap-5" onSubmit={(e) => { e.preventDefault(); onCreateProject(projectForm); }}>
                      <div className="grid grid-cols-2 gap-5">
                        <FormInput label={t(language, "projectName")} required value={projectForm.name} onChange={e => setProjectForm(c => ({ ...c, name: e.target.value }))} />
                        <NumberFormatInput label={t(language, "budget")} required value={projectForm.budget} onChangeRaw={val => setProjectForm(c => ({ ...c, budget: val }))} />
                      </div>
                      <FormInput label={t(language, "description")} required value={projectForm.description} onChange={e => setProjectForm(c => ({ ...c, description: e.target.value }))} />

                      <div className="grid grid-cols-2 gap-5">
                        <FormSelect label={t(language, "department")} required value={projectForm.department} onChange={e => setProjectForm(c => ({ ...c, department: e.target.value }))}>
                          <option value="">Select department</option>
                          {departmentOptions.map(d => <option key={d} value={d}>{d}</option>)}
                        </FormSelect>
                        <FormSelect label={t(language, "district")} required value={projectForm.district} onChange={e => setProjectForm(c => ({ ...c, district: e.target.value }))}>
                          <option value="">Select district</option>
                          {referenceData?.districts?.map(d => <option key={d} value={d}>{d}</option>)}
                        </FormSelect>
                      </div>

                      <div className="grid grid-cols-2 gap-5">
                        <FormInput label={t(language, "timelineStart")} type="date" required value={projectForm.timelineStart} onChange={e => setProjectForm(c => ({ ...c, timelineStart: e.target.value }))} />
                        <FormInput label={t(language, "timelineEnd")} type="date" required value={projectForm.timelineEnd} onChange={e => setProjectForm(c => ({ ...c, timelineEnd: e.target.value }))} />
                      </div>

                      <div className="flex justify-end mt-4">
                        <button type="submit" className="px-6 py-2.5 rounded-xl font-bold text-sm bg-[#0F172A] text-white shadow-md hover:bg-slate-800 transition-colors">{t(language, "createProject")}</button>
                      </div>
                    </form>
                  </SectionCard>
                )}

                {user.role === "DISTRICT" && (
                  <SectionCard title="Add Vendor Entity" subtitle="Register a vendor wallet for payments">
                    <form className="grid gap-5" onSubmit={async (e) => {
                      e.preventDefault();
                      try {
                        await onCreateUser({ ...userForm, role: "VENDOR", departmentName: "N/A", password: "vendor_placeholder_password", email: `vendor_${Date.now()}@example.com` });
                        setUserForm(c => ({ ...c, firstName: "", lastName: "", walletAddress: "" }));
                        alert("Vendor created successfully!");
                      } catch (err) {
                        alert(err.message);
                      }
                    }}>
                      <div className="grid grid-cols-2 gap-5">
                        <FormInput label="Vendor Agency Name" required value={userForm.firstName} onChange={e => setUserForm(c => ({ ...c, firstName: e.target.value, lastName: "Agency" }))} />
                        <FormInput label="Wallet Address" required value={userForm.walletAddress} onChange={e => setUserForm(c => ({ ...c, walletAddress: e.target.value }))} placeholder="0x..." />
                      </div>
                      <div className="flex justify-end mt-4">
                        <button type="submit" className="px-6 py-2.5 rounded-xl font-bold text-sm bg-[#3B82F6] text-white shadow-md hover:bg-blue-700 transition-colors">Add Vendor</button>
                      </div>
                    </form>
                  </SectionCard>
                )}

                {user.role === "ADMIN" && (
                  <SectionCard title={t(language, "allocateFunds")} subtitle="Release budget from State to Department">
                    <form className="grid gap-5" onSubmit={(e) => { e.preventDefault(); onAllocateFunds(allocationForm.projectId, allocationForm); }}>
                      <FormSelect label={t(language, "projects")} required value={allocationForm.projectId} onChange={e => setAllocationForm(c => ({ ...c, projectId: e.target.value }))}>
                        <option value="">Select project</option>
                        {projects.map(p => <option key={p._id} value={p._id}>{p.name} ({p.department})</option>)}
                      </FormSelect>

                      <NumberFormatInput label={t(language, "amount")} required value={allocationForm.amount} onChangeRaw={val => setAllocationForm(c => ({ ...c, amount: val }))} />

                      <FormSelect label="Receiver (Auto-filtered)" required value={allocationForm.receiverName} onChange={handleAllocationReceiverChange}>
                        <option value="">Select receiver</option>
                        {users.filter(u => u.role === "DEPARTMENT").map(u => (
                          <option key={u._id} value={`${u.firstName} ${u.lastName}`}>{u.firstName} {u.lastName} - {u.district}</option>
                        ))}
                      </FormSelect>

                      <FormInput label="Receiver Wallet (Auto-filled)" required readOnly value={allocationForm.receiverWallet} placeholder="0x000..." className="w-full rounded-xl border border-slate-300 bg-slate-100 px-4 py-2.5 text-sm text-slate-500 cursor-not-allowed" />
                      <FormInput label={t(language, "note")} required value={allocationForm.note} onChange={e => setAllocationForm(c => ({ ...c, note: e.target.value }))} />

                      <div className="flex justify-end mt-4">
                        <button type="submit" className="px-6 py-2.5 rounded-xl font-bold text-sm bg-[#DC2626] text-white shadow-md hover:bg-red-700 transition-colors">{t(language, "allocateFunds")}</button>
                      </div>
                    </form>
                  </SectionCard>
                )}

                {(user.role === "DEPARTMENT" || user.role === "DISTRICT") && (
                  <SectionCard title={t(language, "transferFunds")} subtitle={user.role === "DEPARTMENT" ? "Transfer to District" : "Transfer to Vendor/Project"}>
                    <form className="grid gap-5" onSubmit={(e) => { e.preventDefault(); onTransferFunds(transferForm.projectId, transferForm); }}>
                      <FormSelect label={t(language, "projects")} required value={transferForm.projectId} onChange={e => setTransferForm(c => ({ ...c, projectId: e.target.value }))}>
                        <option value="">Select project</option>
                        {projects.map(p => <option key={p._id} value={p._id}>{p.name}</option>)}
                      </FormSelect>

                      <div className="grid grid-cols-2 gap-5">
                        <FormSelect label="Receiver" required value={transferForm.receiverName} onChange={handleTransferReceiverChange}>
                          <option value="">Select receiver</option>
                          {users.filter(u => user.role === "DEPARTMENT" ? u.role === "DISTRICT" : (u.role === "VENDOR" || u.role === "CONTRACTOR" || u.role === "OFFICER")).map(u => (
                            <option key={u._id} value={`${u.firstName} ${u.lastName}`}>{u.firstName} {u.lastName}</option>
                          ))}
                        </FormSelect>
                        <NumberFormatInput label={t(language, "amount")} required value={transferForm.amount} onChangeRaw={val => setTransferForm(c => ({ ...c, amount: val }))} />
                      </div>

                      <FormInput label="Receiver Wallet" required readOnly value={transferForm.receiverWallet} className="w-full rounded-xl bg-slate-100 cursor-not-allowed" />
                      <FormInput label={t(language, "note")} required value={transferForm.note} onChange={e => setTransferForm(c => ({ ...c, note: e.target.value }))} />

                      <div className="flex justify-end mt-4">
                        <button type="submit" className="px-6 py-2.5 rounded-xl font-bold text-sm bg-[#16A34A] text-white shadow-md hover:bg-green-700 transition-colors">{t(language, "transferFunds")}</button>
                      </div>
                    </form>
                  </SectionCard>
                )}

                {user.role === "ADMIN" && (
                  <SectionCard title="Post Announcement" subtitle="Broadcast updates to users">
                    <form className="grid gap-5" onSubmit={(e) => { e.preventDefault(); onCreateAnnouncement(announcementForm); }}>
                      <FormInput label="Title" required value={announcementForm.title} onChange={e => setAnnouncementForm(c => ({ ...c, title: e.target.value }))} placeholder="Enter announcement title" />

                      <label className="block text-sm font-semibold text-slate-700">
                        <span className="mb-1.5 block">Message</span>
                        <textarea
                          required
                          rows="4"
                          value={announcementForm.message}
                          onChange={e => setAnnouncementForm(c => ({ ...c, message: e.target.value }))}
                          placeholder="Type your message here..."
                          className="w-full rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm outline-none transition-all focus:border-[#0F172A] focus:ring-2 focus:ring-[#0F172A]/10 resize-none"
                        />
                      </label>

                      <div className="grid grid-cols-3 gap-5">
                        <FormSelect label="Audience" value={announcementForm.audience} onChange={e => setAnnouncementForm(c => ({ ...c, audience: e.target.value }))}>
                          <option value="ALL">All Users</option>
                          <option value="PUBLIC">Public</option>
                          <option value="DEPARTMENT">Department</option>
                          <option value="DISTRICT">District</option>
                        </FormSelect>
                        <FormSelect label="Priority" value={announcementForm.priority} onChange={e => setAnnouncementForm(c => ({ ...c, priority: e.target.value }))}>
                          <option value="NORMAL">Normal</option>
                          <option value="HIGH">High</option>
                        </FormSelect>
                        <FormInput label="Expiry Date (Optional)" type="date" value={announcementForm.expiryDate} onChange={e => setAnnouncementForm(c => ({ ...c, expiryDate: e.target.value }))} />
                      </div>

                      <label className="block text-sm font-semibold text-slate-700">
                        <span className="mb-1.5 block">Upload Image or Document (Optional)</span>
                        <input type="file" accept="image/*,.pdf" onChange={handleAnnouncementFileUpload} className="w-full rounded-xl border border-slate-300 bg-white px-4 py-2 text-sm outline-none transition-all file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-[#0F172A] file:text-white hover:file:bg-slate-800" />
                      </label>

                      <div className="flex justify-end mt-4 gap-3">
                        <button type="button" onClick={() => setAnnouncementForm({ title: "", message: "", audience: "ALL", priority: "NORMAL", expiryDate: "", fileUrl: "" })} className="px-6 py-2.5 rounded-xl font-bold text-sm border border-slate-300 text-slate-700 hover:bg-slate-50 transition-colors">Reset</button>
                        <button type="submit" className="px-6 py-2.5 rounded-xl font-bold text-sm bg-[#F97316] text-white shadow-md hover:bg-orange-600 transition-colors">Post Announcement</button>
                      </div>
                    </form>
                  </SectionCard>
                )}
              </div>
            </div>
          ) : null}

          {tab === "people" && user.role === "ADMIN" ? (
            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
              <h2 className="text-2xl font-bold text-slate-900 mb-2">{t(language, "people")}</h2>
              <div className="grid gap-6 xl:grid-cols-[0.95fr_1.05fr]">
                <SectionCard title={t(language, "createUserByAdmin")}>
                  {userCreated && (
                    <div className="mb-4 rounded-xl bg-emerald-50 p-4 border border-emerald-100 flex items-center gap-3">
                      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-emerald-100 text-emerald-600">
                        <ClipboardCheck size={18} />
                      </div>
                      <p className="text-sm font-semibold text-emerald-800">User account created successfully!</p>
                    </div>
                  )}
                  <form className="grid gap-4" onSubmit={async (e) => {
                    e.preventDefault();
                    try {
                      await onCreateUser(userForm);
                      setUserCreated(true);
                      setTimeout(() => setUserCreated(false), 5000);
                      setUserForm({ firstName: "", lastName: "", email: "", departmentName: "", district: "", state: "Bihar", role: "DEPARTMENT", password: "" });
                    } catch (err) { }
                  }}>
                    <FormInput label={t(language, "firstName")} value={userForm.firstName} onChange={e => setUserForm(c => ({ ...c, firstName: e.target.value }))} required />
                    <FormInput label={t(language, "lastName")} value={userForm.lastName} onChange={e => setUserForm(c => ({ ...c, lastName: e.target.value }))} required />
                    <FormInput label={t(language, "email")} type="email" value={userForm.email} onChange={e => setUserForm(c => ({ ...c, email: e.target.value }))} required />

                    <FormSelect label={t(language, "role")} value={userForm.role} onChange={e => setUserForm(c => ({ ...c, role: e.target.value, departmentName: "", district: "" }))}>
                      <option value="DEPARTMENT">Department Admin</option>
                      <option value="DISTRICT">District Admin</option>
                    </FormSelect>

                    {(userForm.role === "DEPARTMENT" || userForm.role === "DISTRICT") && (
                      <FormInput label="Department Name" value={userForm.departmentName} onChange={e => setUserForm(c => ({ ...c, departmentName: e.target.value }))} placeholder="E.g. Road Construction" required />
                    )}

                    {userForm.role === "DISTRICT" && (
                      <FormSelect label={t(language, "district")} value={userForm.district} onChange={e => setUserForm(c => ({ ...c, district: e.target.value }))} required>
                        <option value="">Select district</option>
                        {referenceData.districts.map(i => <option key={i} value={i}>{i}</option>)}
                      </FormSelect>
                    )}

                    <FormInput label={t(language, "password")} type="password" value={userForm.password} onChange={e => setUserForm(c => ({ ...c, password: e.target.value }))} required />
                    <button type="submit" className="rounded-xl bg-[#0F172A] px-5 py-3 text-sm font-bold text-white w-full">{t(language, "createUserByAdmin")}</button>
                  </form>
                </SectionCard>

                <SectionCard title="Created Users" right={
                  <div className="flex gap-2">
                    <select
                      value={userRoleFilter}
                      onChange={(e) => setUserRoleFilter(e.target.value)}
                      className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-semibold text-slate-700 outline-none focus:border-[#0F172A]"
                    >
                      <option value="ALL">ALL ROLES</option>
                      <option value="ADMIN">ADMIN</option>
                      <option value="DISTRICT">DISTRICT</option>
                      <option value="DEPARTMENT">DEPARTMENT</option>
                      <option value="OFFICER">OFFICER</option>
                      <option value="CONTRACTOR">CONTRACTOR</option>
                      <option value="VENDOR">VENDOR</option>
                      <option value="PUBLIC">PUBLIC</option>
                    </select>
                    <div className="relative">
                      <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
                      <input
                        type="text"
                        placeholder="Search users..."
                        value={userSearch}
                        onChange={(e) => setUserSearch(e.target.value)}
                        className="w-40 rounded-xl border border-slate-200 bg-slate-50 pl-8 pr-3 py-1.5 text-xs outline-none focus:border-[#0F172A]"
                      />
                    </div>
                  </div>
                }>
                  <div className="space-y-3 max-h-[600px] overflow-y-auto pr-2">
                    {users.filter(u => {
                      const matchRole = userRoleFilter === "ALL" || u.role === userRoleFilter;
                      const searchLower = userSearch.toLowerCase();
                      const matchSearch = (u.firstName + " " + u.lastName).toLowerCase().includes(searchLower) ||
                        u.email.toLowerCase().includes(searchLower);
                      return matchRole && matchSearch;
                    }).length === 0 ? (
                      <p className="text-sm text-slate-500 text-center py-8">No users found.</p>
                    ) : (
                      users.filter(u => {
                        const matchRole = userRoleFilter === "ALL" || u.role === userRoleFilter;
                        const searchLower = userSearch.toLowerCase();
                        const matchSearch = (u.firstName + " " + u.lastName).toLowerCase().includes(searchLower) ||
                          u.email.toLowerCase().includes(searchLower);
                        return matchRole && matchSearch;
                      }).map(u => (
                        <div key={u._id} className="flex items-center justify-between p-4 rounded-xl border border-slate-100 bg-slate-50 hover:bg-slate-100 transition-colors">
                          <div>
                            <p className="font-bold text-slate-900 text-sm">{u.firstName} {u.lastName}</p>
                            <p className="text-xs text-slate-500">{u.email}</p>
                            {(u.departmentName || u.district) && (
                              <p className="text-[10px] text-slate-400 font-semibold mt-1">
                                {u.departmentName} {u.district && `(${u.district})`}
                              </p>
                            )}
                          </div>
                          <span className={`px-2.5 py-1 rounded-md text-[10px] font-bold ${ROLE_COLORS[u.role]}`}>
                            {u.role}
                          </span>
                        </div>
                      ))
                    )}
                  </div>
                </SectionCard>
              </div>
            </div>
          ) : null}

        </main>
      </div>
    </div>
  );
}
