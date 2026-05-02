import { Router } from "express";
import { body } from "express-validator";
import {
  allocateFunds,
  createAnnouncement,
  createProject,
  getAnalytics,
  getAnnouncements,
  getAuditReport,
  getOverview,
  getProjectById,
  getProjects,
  getReferenceData,
  getTransactions,
  transferFunds,
} from "../controllers/projectController.js";
import { requireAuth, requireRoles } from "../middleware/auth.js";
import { upload } from "../middleware/upload.js";
import {
  submitWork,
  getSubmissions,
  getAllPendingSubmissions,
  approveSubmission,
  rejectSubmission,
} from "../controllers/workController.js";

const router = Router();

router.get("/health", (_request, response) => response.json({ ok: true }));
router.get("/reference-data", getReferenceData);

router.use(requireAuth);

router.get("/overview", getOverview);
router.get("/projects", getProjects);
router.get("/projects/:id", getProjectById);
router.get("/transactions", getTransactions);
router.get("/analytics", getAnalytics);
router.get("/audit/report", getAuditReport);
router.get("/announcements", getAnnouncements);

router.post(
  "/projects",
  requireRoles("ADMIN", "DISTRICT"),
  [
    body("name").trim().notEmpty(),
    body("description").trim().notEmpty(),
    body("budget").isNumeric(),
    body("department").trim().notEmpty(),
    body("district").trim().notEmpty(),
    body("city").trim().optional(),
    body("state").trim().notEmpty(),
    body("timelineStart").notEmpty(),
    body("timelineEnd").notEmpty(),
  ],
  createProject,
);

router.post(
  "/projects/:id/allocate",
  requireRoles("ADMIN"),
  [body("receiverName").trim().notEmpty(), body("receiverWallet").trim().notEmpty(), body("amount").isNumeric()],
  allocateFunds,
);

router.post(
  "/projects/:id/transfer",
  requireRoles("ADMIN", "DISTRICT", "DEPARTMENT"),
  [
    body("receiverName").trim().notEmpty(),
    body("receiverWallet").trim().notEmpty(),
    body("receiverRole").trim().notEmpty(),
    body("amount").isNumeric(),
  ],
  transferFunds,
);

router.post(
  "/announcements",
  requireRoles("ADMIN", "DISTRICT", "DEPARTMENT"),
  upload.array("files", 5),           // up to 5 files, field name = "files"
  [body("title").trim().notEmpty(), body("message").trim().notEmpty()],
  createAnnouncement,
);

// ── Work Submission (Vendor → Approval → Instant Payment) ────────────────
router.post(
  "/projects/:id/submit-work",
  requireRoles("VENDOR", "CONTRACTOR"),
  upload.array("proofFiles", 5),
  submitWork,
);
router.get(
  "/projects/:id/submissions",
  getSubmissions,
);
router.get(
  "/submissions/pending",
  requireRoles("ADMIN", "DISTRICT", "DEPARTMENT"),
  getAllPendingSubmissions,
);
router.post(
  "/submissions/:subId/approve",
  requireRoles("DEPARTMENT"),
  approveSubmission,
);
router.post(
  "/submissions/:subId/reject",
  requireRoles("ADMIN", "DISTRICT", "DEPARTMENT"),
  rejectSubmission,
);

export default router;
