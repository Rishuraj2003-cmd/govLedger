import { useEffect, useState } from "react";
import {
  ArrowLeft, BadgeCheck, Calendar, Building2, MapPin,
  Hash, Coins, TrendingUp, Clock, CheckCircle2, AlertCircle,
  ExternalLink, ArrowRight, UploadCloud, FileText, Image as ImageIcon
} from "lucide-react";
import { api, BACKEND_BASE_URL } from "../lib/api";

/** Fix file URLs that may have been saved with wrong base (e.g. localhost when on prod) */
function fixFileUrl(url) {
  if (!url) return url;
  // Cloudinary URLs should be returned as-is
  if (url.includes("res.cloudinary.com") || url.includes("cloudinary.com")) return url;
  // If url already uses the correct backend, return as-is
  if (url.startsWith(BACKEND_BASE_URL)) return url;
  // Replace whatever origin/base is in the stored URL with the correct one
  try {
    const parsed = new URL(url);
    return BACKEND_BASE_URL + parsed.pathname;
  } catch {
    return url;
  }
}

const ROLE_COLOR = {
  ADMIN: "bg-purple-100 text-purple-800",
  DISTRICT: "bg-blue-100 text-blue-800",
  DEPARTMENT: "bg-teal-100 text-teal-800",
  OFFICER: "bg-indigo-100 text-indigo-800",
  CONTRACTOR: "bg-orange-100 text-orange-800",
  VENDOR: "bg-yellow-100 text-yellow-800",
  PUBLIC: "bg-slate-100 text-slate-600",
};

const STATUS_COLOR = {
  ACTIVE: "bg-emerald-100 text-emerald-800",
  PLANNED: "bg-blue-100 text-blue-800",
  ON_HOLD: "bg-amber-100 text-amber-800",
  COMPLETED: "bg-slate-100 text-slate-700",
};

const ACTION_ICON = {
  PROJECT_CREATED: "🏗️",
  FUNDS_ALLOCATED: "💰",
  FUNDS_TRANSFERRED: "↔️",
};

function shortHash(hash) {
  if (!hash) return "—";
  return `${hash.slice(0, 8)}…${hash.slice(-6)}`;
}

function formatAmount(n) {
  return `₹${Number(n || 0).toLocaleString("en-IN")}`;
}

/* ─── Fund Flow Tree ─────────────────────────────────────── */
function FundFlowNode({ role, name, amount, wallet, children, isLast }) {
  return (
    <div className="flex flex-col items-start">
      <div className="flex items-center gap-3">
        <div className={`rounded-xl border px-4 py-3 text-sm font-semibold shadow-sm ${ROLE_COLOR[role] || "bg-slate-100 text-slate-700"}`}>
          <div className="text-xs font-medium opacity-70">{role}</div>
          <div>{name || "—"}</div>
          {amount > 0 && <div className="mt-1 text-xs font-bold">{formatAmount(amount)}</div>}
          {wallet && (
            <div className="mt-1 font-mono text-[10px] opacity-60">{shortHash(wallet)}</div>
          )}
        </div>
        {!isLast && children && (
          <div className="flex flex-col items-center">
            <ArrowRight size={18} className="text-slate-400" />
          </div>
        )}
      </div>
    </div>
  );
}

function FundFlowTree({ transactions }) {
  // Group by actionType to build a flow
  const stages = [
    { key: "PROJECT_CREATED", label: "Project Created" },
    { key: "FUNDS_ALLOCATED", label: "State → District" },
    { key: "FUNDS_TRANSFERRED", label: "District → Department / Vendor" },
  ];

  const grouped = {};
  for (const tx of transactions) {
    if (!grouped[tx.actionType]) grouped[tx.actionType] = [];
    grouped[tx.actionType].push(tx);
  }

  return (
    <div className="rounded-2xl border border-slate-100 bg-slate-50 p-6">
      <h3 className="mb-4 text-sm font-bold text-slate-700 uppercase tracking-wider">
        Fund Flow Hierarchy
      </h3>
      <div className="flex flex-wrap items-center gap-4">
        {transactions.length === 0 && (
          <p className="text-sm text-slate-400">No transactions yet for this project.</p>
        )}
        {transactions.map((tx, i) => (
          <div key={tx._id || i} className="flex items-center gap-2">
            <FundFlowNode
              role={tx.senderRole}
              name={tx.senderName}
              amount={tx.amount}
              wallet={null}
              isLast={false}
            />
            <ArrowRight size={16} className="text-slate-300 flex-shrink-0" />
            <FundFlowNode
              role={tx.receiverRole}
              name={tx.receiverName}
              amount={tx.amount}
              wallet={tx.receiverWallet}
              isLast={true}
            />
            {i < transactions.length - 1 && (
              <div className="mx-2 h-8 w-px bg-slate-200" />
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

/* ─── Transaction Timeline ───────────────────────────────── */
function TxTimeline({ transactions }) {
  return (
    <div className="space-y-4">
      {transactions.map((tx, i) => (
        <div key={tx._id || i} className="relative flex gap-4">
          {/* Vertical line */}
          {i < transactions.length - 1 && (
            <div className="absolute left-5 top-10 bottom-0 w-px bg-slate-200" />
          )}
          {/* Icon */}
          <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full border-2 border-white bg-white shadow text-xl z-10">
            {ACTION_ICON[tx.actionType] || "📋"}
          </div>
          {/* Content */}
          <div className="flex-1 rounded-2xl border border-slate-100 bg-white p-4 shadow-sm">
            <div className="flex flex-wrap items-start justify-between gap-2">
              <div>
                <span className={`inline-block rounded-full px-2 py-0.5 text-xs font-semibold ${ROLE_COLOR[tx.senderRole] || "bg-slate-100 text-slate-600"}`}>
                  {tx.senderRole}
                </span>
                <span className="mx-2 text-slate-400">→</span>
                <span className={`inline-block rounded-full px-2 py-0.5 text-xs font-semibold ${ROLE_COLOR[tx.receiverRole] || "bg-slate-100 text-slate-600"}`}>
                  {tx.receiverRole}
                </span>
              </div>
              {tx.amount > 0 && (
                <span className="text-sm font-bold text-emerald-700">{formatAmount(tx.amount)}</span>
              )}
            </div>
            <div className="mt-2 text-sm text-slate-700">
              <span className="font-medium">{tx.senderName}</span>
              <span className="text-slate-400"> → </span>
              <span className="font-medium">{tx.receiverName}</span>
            </div>
            {tx.note && <p className="mt-1 text-xs text-slate-500">{tx.note}</p>}
            <div className="mt-2 flex flex-wrap items-center gap-3 text-xs text-slate-400">
              <span className="flex items-center gap-1">
                <Clock size={11} />
                {new Date(tx.createdAt).toLocaleString("en-IN")}
              </span>
              {tx.txHash && (
                <span className="flex items-center gap-1 font-mono">
                  <Hash size={11} />
                  {shortHash(tx.txHash)}
                  <span className={`rounded px-1 py-px text-[10px] ${tx.chainMode === "live-chain" ? "bg-emerald-100 text-emerald-700" : "bg-amber-100 text-amber-700"}`}>
                    {tx.chainMode === "live-chain" ? "On-Chain" : "Mock"}
                  </span>
                </span>
              )}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

/* ─── Main Component ─────────────────────────────────────── */
export function ProjectDetail({ projectId, user, onBack, onGetProject, onSubmitWork }) {
  const [data, setData] = useState(null);
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [showWorkForm, setShowWorkForm] = useState(false);
  const [workForm, setWorkForm] = useState({ title: "", description: "", completionPercent: "", requestedAmount: "" });
  const [workFiles, setWorkFiles] = useState([]);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!projectId) return;
    setLoading(true);
    Promise.all([
      onGetProject(projectId),
      api.getProjectSubmissions(projectId).catch(() => ({ submissions: [] }))
    ])
      .then(([projData, subData]) => {
        setData(projData);
        setSubmissions(subData.submissions || []);
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [projectId]);

  async function handleSubmitWork(e) {
    e.preventDefault();
    setSubmitting(true);
    const fd = new FormData();
    fd.append("title", workForm.title);
    fd.append("description", workForm.description);
    fd.append("completionPercent", workForm.completionPercent);
    fd.append("requestedAmount", workForm.requestedAmount);
    for (const f of workFiles) {
      fd.append("proofFiles", f);
    }

    try {
      await onSubmitWork(projectId, fd);
      setShowWorkForm(false);
      setWorkForm({ title: "", description: "", completionPercent: "", requestedAmount: "" });
      setWorkFiles([]);
      // Refresh submissions
      const subData = await api.getProjectSubmissions(projectId);
      setSubmissions(subData.submissions || []);
    } catch (err) {
      alert("Error submitting work: " + err.message);
    } finally {
      setSubmitting(false);
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-slate-200 border-t-[#172033]" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-2xl bg-rose-50 p-6 text-rose-700">
        <AlertCircle className="mb-2" />
        {error}
      </div>
    );
  }

  const { project, history = [] } = data || {};
  if (!project) return null;

  const utilized = project.utilizedFunds || 0;
  const allocated = project.allocatedFunds || 0;
  const budget = project.budget || 1;
  const utilPct = Math.min(100, Math.round((utilized / budget) * 100));
  const allocPct = Math.min(100, Math.round((allocated / budget) * 100));

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <button
          onClick={onBack}
          className="flex h-9 w-9 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 transition"
        >
          <ArrowLeft size={16} />
        </button>
        <div>
          <h2 className="text-xl font-bold text-slate-900">{project.name}</h2>
          <p className="text-sm text-slate-500">{project.description}</p>
        </div>
        <span className={`ml-auto rounded-full px-3 py-1 text-xs font-semibold ${STATUS_COLOR[project.status] || "bg-slate-100 text-slate-600"}`}>
          {project.status}
        </span>
      </div>

      {/* Key metrics */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        {[
          { label: "Total Budget", value: formatAmount(project.budget), icon: Coins, color: "#172033" },
          { label: "Allocated", value: formatAmount(project.allocatedFunds), icon: TrendingUp, color: "#f7941e" },
          { label: "Utilized", value: formatAmount(project.utilizedFunds), icon: CheckCircle2, color: "#2d7c62" },
          { label: "Remaining", value: formatAmount(project.budget - project.utilizedFunds), icon: BadgeCheck, color: "#b52130" },
        ].map(({ label, value, icon: Icon, color }) => (
          <div key={label} className="rounded-2xl border border-slate-100 bg-white p-4 shadow-sm">
            <div className="mb-1 flex items-center justify-between">
              <span className="text-xs text-slate-500">{label}</span>
              <Icon size={14} style={{ color }} />
            </div>
            <div className="text-lg font-bold" style={{ color }}>{value}</div>
          </div>
        ))}
      </div>

      {/* Progress bars */}
      <div className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm space-y-3">
        <div>
          <div className="mb-1 flex justify-between text-xs text-slate-500">
            <span>Allocation Progress</span><span>{allocPct}%</span>
          </div>
          <div className="h-2 rounded-full bg-slate-100">
            <div className="h-2 rounded-full bg-[#f7941e]" style={{ width: `${allocPct}%` }} />
          </div>
        </div>
        <div>
          <div className="mb-1 flex justify-between text-xs text-slate-500">
            <span>Utilization Progress</span><span>{utilPct}%</span>
          </div>
          <div className="h-2 rounded-full bg-slate-100">
            <div className="h-2 rounded-full bg-[#2d7c62]" style={{ width: `${utilPct}%` }} />
          </div>
        </div>
      </div>

      {/* Project meta */}
      <div className="grid grid-cols-2 gap-3 text-sm sm:grid-cols-4">
        {[
          { icon: Building2, label: "Department", value: project.department },
          { icon: MapPin, label: "District", value: project.district },
          { icon: Calendar, label: "Start", value: project.timelineStart ? new Date(project.timelineStart).toLocaleDateString("en-IN") : "—" },
          { icon: Calendar, label: "End", value: project.timelineEnd ? new Date(project.timelineEnd).toLocaleDateString("en-IN") : "—" },
        ].map(({ icon: Icon, label, value }) => (
          <div key={label} className="flex items-start gap-2 rounded-xl border border-slate-100 bg-white p-3">
            <Icon size={14} className="mt-0.5 text-slate-400 flex-shrink-0" />
            <div>
              <div className="text-[11px] text-slate-400">{label}</div>
              <div className="font-medium text-slate-800">{value}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Fund Flow Tree */}
      <FundFlowTree transactions={history} />

      {/* Work Submissions & Proofs */}
      <div className="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between mb-6">
          <div>
            <h3 className="text-lg font-bold text-slate-900">Work Updates & Proofs</h3>
            <p className="text-sm text-slate-500">Public gallery of work completed by vendors.</p>
          </div>
          {(user?.role === "VENDOR" || user?.role === "CONTRACTOR") && (
            <button
              onClick={() => setShowWorkForm(!showWorkForm)}
              className="rounded-full bg-[#172033] px-5 py-2 text-sm font-semibold text-white shadow-sm"
            >
              {showWorkForm ? "Cancel" : "Submit Work Proof"}
            </button>
          )}
        </div>

        {showWorkForm && (
          <form onSubmit={handleSubmitWork} className="mb-8 rounded-xl border border-slate-200 bg-slate-50 p-5">
            <h4 className="mb-4 font-semibold text-slate-800">Submit New Work Update</h4>
            <div className="grid gap-4 sm:grid-cols-2">
              <label className="text-sm font-medium text-slate-700">
                Title
                <input type="text" required value={workForm.title} onChange={e => setWorkForm(f => ({ ...f, title: e.target.value }))} className="mt-1 w-full rounded-lg border px-3 py-2" placeholder="e.g. Foundation Completed" />
              </label>
              <label className="text-sm font-medium text-slate-700">
                Completion %
                <input type="number" required min="1" max="100" value={workForm.completionPercent} onChange={e => setWorkForm(f => ({ ...f, completionPercent: e.target.value }))} className="mt-1 w-full rounded-lg border px-3 py-2" placeholder="e.g. 25" />
              </label>
              <label className="text-sm font-medium text-slate-700 sm:col-span-2">
                Description
                <textarea required value={workForm.description} onChange={e => setWorkForm(f => ({ ...f, description: e.target.value }))} className="mt-1 w-full rounded-lg border px-3 py-2" rows="2" placeholder="Detailed update..." />
              </label>
              <label className="text-sm font-medium text-slate-700">
                Requested Payment Amount (₹)
                <input type="number" required min="1" value={workForm.requestedAmount} onChange={e => setWorkForm(f => ({ ...f, requestedAmount: e.target.value }))} className="mt-1 w-full rounded-lg border px-3 py-2" />
              </label>
              <label className="text-sm font-medium text-slate-700">
                Attach Proof (Images/PDF)
                <input type="file" multiple accept="image/*,.pdf" onChange={e => setWorkFiles(Array.from(e.target.files))} className="mt-1 w-full rounded-lg border bg-white px-3 py-1.5 text-sm file:mr-4 file:rounded-full file:border-0 file:bg-slate-100 file:px-4 file:py-1 file:text-sm file:font-semibold hover:file:bg-slate-200" />
              </label>
            </div>
            <button type="submit" disabled={submitting} className="mt-5 rounded-lg bg-[#2d7c62] px-6 py-2 text-sm font-bold text-white disabled:opacity-50">
              {submitting ? "Uploading..." : "Submit & Request Verification"}
            </button>
          </form>
        )}

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {submissions.length > 0 ? submissions.map((sub) => (
            <div key={sub._id} className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
              <div className="flex items-start justify-between">
                <span className={`rounded px-2 py-0.5 text-xs font-bold ${sub.status === "APPROVED" ? "bg-emerald-100 text-emerald-800" : sub.status === "REJECTED" ? "bg-rose-100 text-rose-800" : "bg-amber-100 text-amber-800"}`}>{sub.status}</span>
                <span className="text-xs font-semibold text-slate-400">{sub.completionPercent}% done</span>
              </div>
              <h4 className="mt-3 font-semibold text-slate-800">{sub.title}</h4>
              <p className="mt-1 text-sm text-slate-600 line-clamp-2">{sub.description}</p>
              
              {sub.proofFiles?.length > 0 && (
                <div className="mt-3 flex flex-wrap gap-2">
                  {sub.proofFiles.map((file, i) => (
                    <a key={i} href={fixFileUrl(file.url)} target="_blank" rel="noreferrer" className="flex items-center gap-1 rounded bg-slate-100 px-2 py-1 text-xs text-blue-600 hover:bg-slate-200">
                      {file.mimetype.includes("image") ? <ImageIcon size={12} /> : <FileText size={12} />}
                      Proof {i+1}
                    </a>
                  ))}
                </div>
              )}
              
              <div className="mt-4 border-t pt-3 flex justify-between items-center text-xs text-slate-500">
                <span>By: {sub.vendor?.firstName} {sub.vendor?.lastName}</span>
                <span className="font-semibold text-slate-700">{formatAmount(sub.requestedAmount)}</span>
              </div>
            </div>
          )) : (
            <div className="col-span-full py-8 text-center text-sm text-slate-400">
              No work updates or proofs submitted yet.
            </div>
          )}
        </div>
      </div>

      {/* Transaction Timeline */}
      <div>
        <h3 className="mb-4 text-sm font-bold text-slate-700 uppercase tracking-wider">
          Transaction History ({history.length})
        </h3>
        {history.length > 0 ? (
          <TxTimeline transactions={history} />
        ) : (
          <div className="rounded-2xl border border-dashed border-slate-200 p-8 text-center text-sm text-slate-400">
            No transactions yet for this project.
          </div>
        )}
      </div>
    </div>
  );
}
