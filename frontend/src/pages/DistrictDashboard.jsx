import { SectionTitle } from "../components/SectionTitle";

export function DistrictDashboard({ projects, onTransferFunds }) {
  function handleSubmit(event, projectId) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    onTransferFunds(projectId, {
      senderRole: "DISTRICT",
      receiver: formData.get("receiver"),
      receiverRole: "DEPARTMENT",
      amount: formData.get("amount"),
      note: formData.get("note"),
    });
    event.currentTarget.reset();
  }

  return (
    <div className="space-y-8">
      <SectionTitle
        eyebrow="District Office"
        title="Approve departmental fund releases"
        description="Designed for district-level officers in Bihar to review scheme balances and send approved amounts to the concerned department with a clear note."
      />

      <div className="grid gap-6 xl:grid-cols-2">
        {projects.map((project) => (
          <div key={project.id} className="glass-panel rounded-[28px] p-6 shadow-panel">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h3 className="font-display text-2xl text-ink">{project.name}</h3>
                <p className="mt-2 text-sm text-slate-600">
                  {project.district} | {project.department}
                </p>
              </div>
              <div className="rounded-full bg-[#172033] px-3 py-2 text-xs uppercase tracking-[0.2em] text-white">
                ₹{Number(project.remaining).toLocaleString("en-IN")} left
              </div>
            </div>

            <form className="mt-6 grid gap-4" onSubmit={(event) => handleSubmit(event, project.id)}>
              <input
                name="receiver"
                required
                placeholder="Department wallet address"
                className="rounded-2xl border border-slate-200 bg-white/80 px-4 py-3 text-sm outline-none"
              />
              <input
                name="amount"
                required
                placeholder="Transfer amount"
                className="rounded-2xl border border-slate-200 bg-white/80 px-4 py-3 text-sm outline-none"
              />
              <textarea
                name="note"
                rows="3"
                placeholder="Approval note for district release"
                className="rounded-2xl border border-slate-200 bg-white/80 px-4 py-3 text-sm outline-none"
              />
              <button type="submit" className="rounded-full bg-[#4d8f78] px-5 py-3 text-sm font-medium text-white">
                Transfer to department
              </button>
            </form>
          </div>
        ))}
      </div>
    </div>
  );
}
