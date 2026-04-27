import { Router } from "express";
import { body } from "express-validator";
import {
  forgotPassword,
  getAuthStatus,
  getMe,
  googleLogin,
  loginUser,
  registerUser,
  resendVerificationOtp,
  resetPassword,
  setupAdmin,
  updateWallet,
  updateProfile,
  validateResetOtp,
  verifyEmailOtp,
} from "../controllers/authController.js";
import { requireAuth } from "../middleware/auth.js";

const router = Router();

const baseRegistrationValidation = [
  body("firstName").trim().notEmpty(),
  body("lastName").trim().notEmpty(),

  body("email").isEmail(),
  body("district").optional({ checkFalsy: true }).trim(),
  body("state").optional({ checkFalsy: true }).trim(),
  body("password").isLength({ min: 6 }),
];

const adminSetupValidation = [
  body("departmentName").trim().notEmpty(),
  body("email").isEmail(),
  body("district").optional({ checkFalsy: true }).trim(),
  body("state").optional({ checkFalsy: true }).trim(),
  body("password").isLength({ min: 6 }),
];

router.get("/status", getAuthStatus);
router.post("/setup-admin", adminSetupValidation, setupAdmin);
router.post("/register", baseRegistrationValidation, registerUser);
router.post("/verify-email", [body("email").isEmail(), body("otp").trim().isLength({ min: 6, max: 6 })], verifyEmailOtp);
router.post("/resend-otp", [body("email").isEmail()], resendVerificationOtp);
router.post("/login", [body("email").isEmail(), body("password").notEmpty()], loginUser);
router.post("/forgot-password", [body("email").isEmail()], forgotPassword);
router.post("/validate-reset-otp", [body("email").isEmail(), body("otp").trim().isLength({ min: 6, max: 6 })], validateResetOtp);
router.post(
  "/reset-password",
  [body("email").isEmail(), body("otp").trim().isLength({ min: 6, max: 6 }), body("password").isLength({ min: 6 })],
  resetPassword,
);
router.post("/google", googleLogin);
router.get("/me", requireAuth, getMe);
router.patch("/me/wallet", requireAuth, [body("walletAddress").trim().notEmpty()], updateWallet);
router.patch("/me/profile", requireAuth, updateProfile);

export default router;
