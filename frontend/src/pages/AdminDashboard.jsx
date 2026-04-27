import { useState } from "react";
import { SectionTitle } from "../components/SectionTitle";

const initialProject = {
  name: "",
  department: "",
  district: "",
  timeline: "",
  budget: "",
};

const initialAllocation = {
  receiver: "",
  amount: "",
  note: "",
};

export function AdminDashboard({ overview, onCreateProject, onAllocateFunds }) {
  const [projectForm, setProjectForm] = useState(initialProject);
  const [allocationForm, setAllocationForm] = useState(initialAllocation);
  const [selectedProject, setSelectedProject] = useState(overview.projects[0]?.id || 1);

  function submitProject(event) {
    event.preventDefault();
    onCreateProject(projectForm);
    setProjectForm(initialProject);
  }

  function submitAllocation(event) {
    event.preventDefault();
    onAllocateFunds(selectedProject, allocationForm);
    setAllocationForm(initialAllocation);
  }

  return (
    <div className="space-y-8">
      <SectionTitle
        eyebrow="Bihar State Admin"
        title="Create Bihar projects and release district allocations"
        description="This screen is simplified for state finance and nodal officers who need to create schemes, set budgets, and release the first installment to district-level authorities."
      />

      <div className="grid gap-8 xl:grid-cols-2">
        <form onSubmit={submitProject} className="glass-panel rounded-[28px] p-6 shadow-panel">
          <h3 className="font-display text-2xl text-ink">Create new project</h3>
          <div className="mt-6 grid gap-4">
            {[
              ["Project name", "name", "Patna Smart Drainage Upgrade"],
              ["Department", "department", "Urban Development and Housing Department"],
              ["District", "district", "Patna"],
              ["Timeline", "timeline", "Apr 2026 - Dec 2026"],
              ["Budget", "budget", "25000000"],
            ].map(([label, key, placeholder]) => (
              <label key={key} className="text-sm font-medium text-slate-700">
                {label}
                <input
                  required
                  value={projectForm[key]}
                  onChange={(event) => setProjectForm((current) => ({ ...current, [key]: event.target.value }))}
                  placeholder={placeholder}
                  className="mt-2 w-full rounded-2xl border border-slate-200 bg-white/80 px-4 py-3 text-sm outline-none transition focus:border-moss"
                />
              </label>
            ))}
          </div>
          <button type="submit" className="mt-6 rounded-full bg-[#172033] px-5 py-3 text-sm font-medium text-white">
            Create project
          </button>
        </form>

        <form onSubmit={submitAllocation} className="glass-panel rounded-[28px] p-6 shadow-panel">
          <h3 className="font-display text-2xl text-ink">Allocate funds to district</h3>
          <div className="mt-6 grid gap-4">
            <label className="text-sm font-medium text-slate-700">
              Project
              <select
                value={selectedProject}
                onChange={(event) => setSelectedProject(Number(event.target.value))}
                className="mt-2 w-full rounded-2xl border border-slate-200 bg-white/80 px-4 py-3 text-sm outline-none"
              >
                {overview.projects.map((project) => (
                  <option key={project.id} value={project.id}>
                    {project.name}
                  </option>
                ))}
              </select>
            </label>
            <label className="text-sm font-medium text-slate-700">
              District wallet
              <input
                required
                value={allocationForm.receiver}
                onChange={(event) => setAllocationForm((current) => ({ ...current, receiver: event.target.value }))}
                placeholder="0xDistrictWallet"
                className="mt-2 w-full rounded-2xl border border-slate-200 bg-white/80 px-4 py-3 text-sm outline-none"
              />
            </label>
            <label className="text-sm font-medium text-slate-700">
              Amount
              <input
                required
                value={allocationForm.amount}
                onChange={(event) => setAllocationForm((current) => ({ ...current, amount: event.target.value }))}
                placeholder="5000000"
                className="mt-2 w-full rounded-2xl border border-slate-200 bg-white/80 px-4 py-3 text-sm outline-none"
              />
            </label>
            <label className="text-sm font-medium text-slate-700">
              Sanction note
              <textarea
                rows="4"
                value={allocationForm.note}
                onChange={(event) => setAllocationForm((current) => ({ ...current, note: event.target.value }))}
                placeholder="First installment for ward-level implementation"
                className="mt-2 w-full rounded-2xl border border-slate-200 bg-white/80 px-4 py-3 text-sm outline-none"
              />
            </label>
          </div>
          <button type="submit" className="mt-6 rounded-full bg-[#b52130] px-5 py-3 text-sm font-medium text-white">
            Release funds
          </button>
        </form>
      </div>
    </div>
  );
}
