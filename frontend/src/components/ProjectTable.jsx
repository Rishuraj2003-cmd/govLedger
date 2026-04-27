export function ProjectTable({ projects }) {
  return (
    <div className="glass-panel overflow-hidden rounded-[28px] shadow-panel">
      <div className="overflow-x-auto">
        <table className="min-w-full text-left">
          <thead className="bg-[#172033] text-xs uppercase tracking-[0.2em] text-white">
            <tr>
              <th className="px-5 py-4">Project / योजना</th>
              <th className="px-5 py-4">District</th>
              <th className="px-5 py-4">Department</th>
              <th className="px-5 py-4">Budget</th>
              <th className="px-5 py-4">Used</th>
              <th className="px-5 py-4">Remaining</th>
              <th className="px-5 py-4">Status</th>
            </tr>
          </thead>
          <tbody>
            {projects.map((project) => (
              <tr key={project.id} className="border-t border-slate-200/80 bg-white/60">
                <td className="px-5 py-4">
                  <p className="font-medium text-ink">{project.name}</p>
                  <p className="text-sm text-slate-500">{project.timeline}</p>
                </td>
                <td className="px-5 py-4 text-slate-600">{project.district}</td>
                <td className="px-5 py-4 text-slate-600">{project.department}</td>
                <td className="px-5 py-4 font-medium text-ink">₹{Number(project.budget).toLocaleString("en-IN")}</td>
                <td className="px-5 py-4 text-slate-600">₹{Number(project.utilized).toLocaleString("en-IN")}</td>
                <td className="px-5 py-4 text-slate-600">₹{Number(project.remaining).toLocaleString("en-IN")}</td>
                <td className="px-5 py-4">
                  <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-medium uppercase tracking-[0.15em] text-emerald-800">
                    {project.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
