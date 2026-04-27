import { validationResult } from "express-validator";
import { Announcement } from "../models/Announcement.js";
import { Project } from "../models/Project.js";
import { Transaction } from "../models/Transaction.js";
import { buildAnalytics, buildAuditReport, buildOverview } from "../services/analyticsService.js";
import { allocateFundsOnChain, createProjectOnChain, getBlockchainMode, transferFundsOnChain } from "../services/blockchainService.js";
import { fileToAttachment } from "../middleware/upload.js";

function validationFailed(request, response) {
  const result = validationResult(request);
  if (result.isEmpty()) {
    return false;
  }

  response.status(422).json({ error: "Please check the submitted details", details: result.array() });
  return true;
}

export async function getReferenceData(_request, response) {
  const { biharCities, biharDistricts, states } = await import("../utils/constants.js");
  response.json({ districts: biharDistricts, cities: biharCities, states });
}

export async function getOverview(_request, response) {
  const [overview, analytics] = await Promise.all([buildOverview(), buildAnalytics()]);
  response.json({
    ...overview,
    blockchainMode: getBlockchainMode(),
    alerts: analytics.alerts,
  });
}

export async function getProjects(_request, response) {
  const projects = await Project.find().sort({ createdAt: -1 });
  response.json({
    projects: projects.map((project) => ({
      ...project.toJSON(),
      remainingFunds: project.budget - project.utilizedFunds,
    })),
  });
}

export async function getProjectById(request, response) {
  const project = await Project.findById(request.params.id);
  if (!project) {
    response.status(404).json({ error: "Project not found" });
    return;
  }

  const history = await Transaction.find({ project: project._id }).sort({ createdAt: -1 });
  response.json({
    project: {
      ...project.toJSON(),
      remainingFunds: project.budget - project.utilizedFunds,
    },
    history,
  });
}

export async function getTransactions(_request, response) {
  const transactions = await Transaction.find().sort({ createdAt: -1 });
  response.json({ transactions });
}

export async function getAnalytics(_request, response) {
  response.json(await buildAnalytics());
}

export async function getAuditReport(_request, response) {
  response.json(await buildAuditReport());
}

export async function getAnnouncements(_request, response) {
  const announcements = await Announcement.find().sort({ createdAt: -1 });
  response.json({ announcements });
}

export async function createAnnouncement(request, response) {
  if (validationFailed(request, response)) {
    return;
  }

  const baseUrl = process.env.BASE_URL || "http://localhost:4000";
  const attachments = (request.files || []).map((f) => fileToAttachment(f, baseUrl));

  const announcement = await Announcement.create({
    title: request.body.title,
    message: request.body.message,
    audience: request.body.audience || "ALL",
    createdBy: request.user._id,
    attachments,
  });

  response.status(201).json({ announcement });
}

export async function createProject(request, response) {
  if (validationFailed(request, response)) {
    return;
  }

  const project = await Project.create({
    ...request.body,
    budget: Number(request.body.budget),
    timelineStart: new Date(request.body.timelineStart),
    timelineEnd: new Date(request.body.timelineEnd),
    createdBy: request.user._id,
  });

  const chain = await createProjectOnChain({
    id: project._id.toString(),
    name: project.name,
    budget: project.budget,
    department: project.department,
    district: project.district,
    timeline: `${project.timelineStart.toISOString().slice(0, 10)} to ${project.timelineEnd.toISOString().slice(0, 10)}`,
    districtOfficer: request.body.districtOfficerWallet || "0x000000000000000000000000000000000000dEaD",
    departmentHead: request.body.departmentHeadWallet || "0x000000000000000000000000000000000000bEEF",
  });

  // Save the on-chain project ID so allocate/transfer can reference it
  if (chain.chainProjectId) {
    project.chainProjectId = chain.chainProjectId;
    await project.save();
  }

  await Transaction.create({
    project: project._id,
    actionType: "PROJECT_CREATED",
    senderName: `${request.user.firstName} ${request.user.lastName}`,
    senderRole: request.user.role,
    senderUser: request.user._id,
    receiverName: project.department,
    receiverRole: "DEPARTMENT",
    amount: 0,
    note: `Project created: ${project.name}`,
    stage: "Project Created",
    txHash: chain.txHash,
    chainMode: chain.mode,
  });

  response.status(201).json({ project, chain });
}

export async function allocateFunds(request, response) {
  if (validationFailed(request, response)) {
    return;
  }

  const project = await Project.findById(request.params.id);
  if (!project) {
    response.status(404).json({ error: "Project not found" });
    return;
  }

  const amount = Number(request.body.amount);
  if (project.allocatedFunds + amount > project.budget) {
    response.status(400).json({ error: "Allocation exceeds project budget" });
    return;
  }

  if (!request.body.receiverWallet || request.body.receiverWallet === "") {
    return response.status(400).json({ error: "Receiver must have a bound wallet address to receive funds" });
  }

  // Use on-chain project ID (stored when project was created); fallback to empty string (mock mode)
  const chain = await allocateFundsOnChain(project.chainProjectId || "", request.body.receiverWallet, amount, request.body.note || "");
  project.allocatedFunds += amount;
  await project.save();

  const transaction = await Transaction.create({
    project: project._id,
    actionType: "FUNDS_ALLOCATED",
    senderName: `${request.user.firstName} ${request.user.lastName}`,
    senderRole: request.user.role,
    senderUser: request.user._id,
    receiverName: request.body.receiverName,
    receiverRole: request.body.receiverRole || "DISTRICT",
    receiverWallet: request.body.receiverWallet,
    amount,
    note: request.body.note || "",
    stage: "State to District",
    txHash: chain.txHash,
    chainMode: chain.mode,
  });

  response.status(201).json({ transaction, project });
}

export async function transferFunds(request, response) {
  if (validationFailed(request, response)) {
    return;
  }

  const project = await Project.findById(request.params.id);
  if (!project) {
    response.status(404).json({ error: "Project not found" });
    return;
  }

  const amount = Number(request.body.amount);
  if (project.allocatedFunds < amount) {
    response.status(400).json({ error: "Transfer amount exceeds allocated funds" });
    return;
  }

  if (!request.body.receiverWallet || request.body.receiverWallet === "") {
    return response.status(400).json({ error: "Receiver must have a bound wallet address to receive funds" });
  }

  const senderRole = request.body.senderRole || request.user.role;
  const receiverRole = request.body.receiverRole;
  const stage = `${senderRole} to ${receiverRole}`;
  const chain = await transferFundsOnChain(project.chainProjectId || "", request.body.receiverWallet, amount, request.body.note || "");

  if (senderRole === "DEPARTMENT" || receiverRole === "CONTRACTOR" || receiverRole === "VENDOR") {
    project.utilizedFunds += amount;
  }

  await project.save();

  const transaction = await Transaction.create({
    project: project._id,
    actionType: "FUNDS_TRANSFERRED",
    senderName: `${request.user.firstName} ${request.user.lastName}`,
    senderRole,
    senderUser: request.user._id,
    receiverName: request.body.receiverName,
    receiverRole,
    receiverWallet: request.body.receiverWallet,
    amount,
    note: request.body.note || "",
    stage,
    txHash: chain.txHash,
    chainMode: chain.mode,
  });

  response.status(201).json({ transaction, project });
}
