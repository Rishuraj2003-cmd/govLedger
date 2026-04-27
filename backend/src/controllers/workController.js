import { WorkSubmission } from "../models/WorkSubmission.js";
import { Project } from "../models/Project.js";
import { Transaction } from "../models/Transaction.js";
import { fileToAttachment } from "../middleware/upload.js";
import { transferFundsOnChain } from "../services/blockchainService.js";

const BASE_URL = process.env.BASE_URL || "http://localhost:4000";

/** POST /api/projects/:id/submit-work — vendor submits work proof */
export async function submitWork(request, response) {
  const project = await Project.findById(request.params.id);
  if (!project) {
    response.status(404).json({ error: "Project not found" });
    return;
  }

  const { title, description, completionPercent, requestedAmount } = request.body;

  if (!title || !description || !completionPercent || !requestedAmount) {
    response.status(422).json({ error: "title, description, completionPercent and requestedAmount are required" });
    return;
  }

  const amount = Number(requestedAmount);
  if (isNaN(amount) || amount <= 0) {
    response.status(422).json({ error: "requestedAmount must be a positive number" });
    return;
  }

  const attachments = (request.files || []).map((f) => fileToAttachment(f, BASE_URL));

  const submission = await WorkSubmission.create({
    project: project._id,
    vendor: request.user._id,
    title: title.trim(),
    description: description.trim(),
    completionPercent: Number(completionPercent),
    requestedAmount: amount,
    proofFiles: attachments,
  });

  response.status(201).json({ submission });
}

/** GET /api/projects/:id/submissions — admin/dept sees all submissions */
export async function getSubmissions(request, response) {
  const submissions = await WorkSubmission.find({ project: request.params.id })
    .populate("vendor", "firstName lastName email role departmentName")
    .sort({ createdAt: -1 });
  response.json({ submissions });
}

/** GET /api/submissions — all pending submissions across projects */
export async function getAllPendingSubmissions(request, response) {
  const query = { status: "PENDING" };
  // District/Dept heads only see their own district's projects
  if (request.user.role === "DISTRICT") {
    const projects = await Project.find({ district: request.user.district }).select("_id");
    query.project = { $in: projects.map((p) => p._id) };
  } else if (request.user.role === "DEPARTMENT") {
    const projects = await Project.find({ district: request.user.district, department: request.user.departmentName }).select("_id");
    query.project = { $in: projects.map((p) => p._id) };
  }

  const submissions = await WorkSubmission.find(query)
    .populate("vendor", "firstName lastName email")
    .populate("project", "name department district chainProjectId")
    .sort({ createdAt: -1 });

  response.json({ submissions });
}

/** POST /api/submissions/:subId/approve — approve and release payment */
export async function approveSubmission(request, response) {
  const submission = await WorkSubmission.findById(request.params.subId).populate("project");
  if (!submission) {
    response.status(404).json({ error: "Submission not found" });
    return;
  }
  if (submission.status !== "PENDING") {
    response.status(400).json({ error: "Submission already processed" });
    return;
  }

  const project = submission.project;
  const amount = submission.requestedAmount;

  if (project.allocatedFunds < amount) {
    response.status(400).json({ error: "Insufficient allocated funds for this project" });
    return;
  }

  // Trigger blockchain transfer
  const receiverWallet = request.body.receiverWallet || "";
  const chain = await transferFundsOnChain(
    project.chainProjectId || "",
    receiverWallet,
    amount,
    `Work approval: ${submission.title}`,
  );

  // Update project
  project.utilizedFunds = (project.utilizedFunds || 0) + amount;
  await project.save();

  // Mark submission approved
  submission.status = "APPROVED";
  submission.approvedBy = request.user._id;
  submission.approvedAt = new Date();
  submission.txHash = chain.txHash;
  submission.chainMode = chain.mode;
  await submission.save();

  // Record transaction
  await Transaction.create({
    project: project._id,
    actionType: "FUNDS_TRANSFERRED",
    senderName: `${request.user.firstName} ${request.user.lastName}`,
    senderRole: request.user.role,
    senderUser: request.user._id,
    receiverName: `${submission.vendor.firstName || ""} ${submission.vendor.lastName || ""}`.trim() || "Vendor",
    receiverRole: "VENDOR",
    receiverWallet,
    amount,
    note: `Work submission approved: ${submission.title} (${submission.completionPercent}% complete)`,
    stage: `${request.user.role} to VENDOR`,
    txHash: chain.txHash,
    chainMode: chain.mode,
  });

  response.json({ submission, chain });
}

/** POST /api/submissions/:subId/reject — reject a work submission */
export async function rejectSubmission(request, response) {
  const submission = await WorkSubmission.findById(request.params.subId);
  if (!submission) {
    response.status(404).json({ error: "Submission not found" });
    return;
  }
  if (submission.status !== "PENDING") {
    response.status(400).json({ error: "Submission already processed" });
    return;
  }

  submission.status = "REJECTED";
  submission.rejectionReason = request.body.reason || "No reason provided";
  await submission.save();

  response.json({ submission });
}
