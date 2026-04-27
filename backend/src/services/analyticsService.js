import { Announcement } from "../models/Announcement.js";
import { Project } from "../models/Project.js";
import { Transaction } from "../models/Transaction.js";
import { User } from "../models/User.js";

export async function buildOverview() {
  const [projects, transactions, announcements, users] = await Promise.all([
    Project.find().sort({ createdAt: -1 }).lean(),
    Transaction.find().sort({ createdAt: -1 }).limit(6).lean(),
    Announcement.find().sort({ createdAt: -1 }).limit(5).lean(),
    User.find({ isVerified: true }).lean(),
  ]);

  const totals = projects.reduce(
    (acc, project) => {
      acc.totalBudget += project.budget;
      acc.totalAllocated += project.allocatedFunds;
      acc.totalUtilized += project.utilizedFunds;
      return acc;
    },
    { totalBudget: 0, totalAllocated: 0, totalUtilized: 0 },
  );

  return {
    totalBudget: totals.totalBudget,
    totalAllocated: totals.totalAllocated,
    totalUtilized: totals.totalUtilized,
    remainingFunds: totals.totalBudget - totals.totalUtilized,
    alertCount: projects.filter((project) => project.utilizedFunds > project.allocatedFunds * 0.85).length,
    totalUsers: users.length,
    projects: projects.map((project) => ({
      ...project,
      remainingFunds: project.budget - project.utilizedFunds,
    })),
    transactions,
    announcements,
  };
}

export async function buildAnalytics() {
  const projects = await Project.find().lean();
  const groupedDistrict = new Map();
  const groupedDepartment = new Map();
  const alerts = [];

  for (const project of projects) {
    // District grouping
    const currentDist = groupedDistrict.get(project.district) || {
      district: project.district,
      allocated: 0,
      utilized: 0,
      count: 0,
    };
    currentDist.allocated += project.allocatedFunds || 0;
    currentDist.utilized += project.utilizedFunds || 0;
    currentDist.count += 1;
    groupedDistrict.set(project.district, currentDist);

    // Department grouping (for pie chart)
    const currentDept = groupedDepartment.get(project.department) || {
      name: project.department,
      value: 0, // Total Budget for pie chart
      allocated: 0,
      utilized: 0,
    };
    currentDept.value += project.budget || 0;
    currentDept.allocated += project.allocatedFunds || 0;
    currentDept.utilized += project.utilizedFunds || 0;
    groupedDepartment.set(project.department, currentDept);

    if (project.utilizedFunds > project.allocatedFunds * 0.85 && project.allocatedFunds > 0) {
      alerts.push({
        id: `${project._id}-burn`,
        title: `${project.name} is close to its current allocation limit`,
        description: "This project has used more than 85% of the released funds and should be reviewed before another release.",
      });
    }
  }

  // Monthly trend grouping (Bar/Line chart)
  const txs = await Transaction.find().lean();
  const monthlyData = {};
  for (const tx of txs) {
    const month = new Date(tx.createdAt).toLocaleString('default', { month: 'short', year: 'numeric' });
    if (!monthlyData[month]) {
      monthlyData[month] = { name: month, allocated: 0, utilized: 0 };
    }
    if (tx.actionType === "FUNDS_ALLOCATED") {
      monthlyData[month].allocated += tx.amount || 0;
    } else if (tx.actionType === "FUNDS_TRANSFERRED" && tx.receiverRole === "VENDOR") {
      monthlyData[month].utilized += tx.amount || 0;
    }
  }
  
  // Sort months chronologically
  const monthlyTrend = Object.values(monthlyData).sort((a, b) => new Date(a.name) - new Date(b.name));

  return {
    utilizationByDistrict: [...groupedDistrict.values()],
    allocationByDepartment: [...groupedDepartment.values()],
    monthlyTrend,
    alerts,
  };
}

export async function buildAuditReport() {
  const [overview, analytics, topTransactions] = await Promise.all([
    buildOverview(),
    buildAnalytics(),
    Transaction.find().sort({ createdAt: -1 }).limit(10).lean(),
  ]);

  return {
    generatedAt: new Date().toISOString(),
    summary: {
      totalProjects: overview.projects.length,
      totalUsers: overview.totalUsers,
      totalBudget: overview.totalBudget,
      totalAllocated: overview.totalAllocated,
      totalUtilized: overview.totalUtilized,
      remainingFunds: overview.remainingFunds,
    },
    alerts: analytics.alerts,
    topTransactions,
  };
}
