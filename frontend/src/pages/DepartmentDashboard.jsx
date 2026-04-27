import { SectionTitle } from "../components/SectionTitle";

export function DepartmentDashboard({ projects, onTransferFunds }) {
  function handleSubmit(event, projectId) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    onTransferFunds(projectId, {
      senderRole: "DEPARTMENT",
      receiver: formData.get("receiver"),
      receiverRole: formData.get("receiverRole"),
      amount: formData.get("amount"),
      note: formData.get("note"),
    });
    event.currentTarget.reset();
  }

  return (
    <div className="space-y-8">
      <SectionTitle
        eyebrow="Department Operations"
        title="Record utilization and vendor payments"
        description="This screen is meant for easy day-to-day use by department teams. Record contractor payments, vendor releases, and a short utilization note for each transaction."
      />

      <div className="grid gap-6 xl:grid-cols-2">
        {projects.map((project) => (
          <div key={project.id} className="glass-panel rounded-[28px] p-6 shadow-panel">
            <h3 className="font-display text-2xl text-ink">{project.name}</h3>
            <p className="mt-2 text-sm leading-6 text-slate-600">
              Utilized ₹{Number(project.utilized).toLocaleString("en-IN")} of ₹{Number(project.budget).toLocaleString("en-IN")}
            </p>
            <form className="mt-6 grid gap-4" onSubmit={(event) => handleSubmit(event, project.id)}>
              <input
                name="receiver"
                required
                placeholder="Contractor or vendor wallet"
                className="rounded-2xl border border-slate-200 bg-white/80 px-4 py-3 text-sm outline-none"
              />
              <select
                name="receiverRole"
                className="rounded-2xl border border-slate-200 bg-white/80 px-4 py-3 text-sm outline-none"
                defaultValue="CONTRACTOR"
              >
                <option value="CONTRACTOR">Contractor</option>
                <option value="VENDOR">Vendor</option>
              </select>
              <input
                name="amount"
                required
                placeholder="Payment amount"
                className="rounded-2xl border border-slate-200 bg-white/80 px-4 py-3 text-sm outline-none"
              />
              <textarea
                name="note"
                rows="3"
                placeholder="Utilization details and purpose of payment"
                className="rounded-2xl border border-slate-200 bg-white/80 px-4 py-3 text-sm outline-none"
              />
              <button type="submit" className="rounded-full bg-[#f7941e] px-5 py-3 text-sm font-medium text-white">
                Record expenditure
              </button>
            </form>
          </div>
        ))}
      </div>
    </div>
  );
}
