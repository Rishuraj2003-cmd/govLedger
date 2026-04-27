import bcrypt from "bcryptjs";
import { OAuth2Client } from "google-auth-library";
import { validationResult } from "express-validator";
import { User } from "../models/User.js";
import { sendOtpEmail } from "../services/emailService.js";
import { generateOtp, getOtpExpiry } from "../utils/otp.js";
import { signAuthToken } from "../utils/token.js";

const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID || "");

function validationFailed(request, response) {
  const result = validationResult(request);
  if (result.isEmpty()) {
    return false;
  }

  response.status(422).json({
    error: "Please check the submitted details",
    details: result.array(),
  });
  return true;
}

function sanitizeUser(user) {
  return {
    id: user._id,
    firstName: user.firstName,
    lastName: user.lastName,
    email: user.email,
    mobileNumber: user.mobileNumber,
    departmentName: user.departmentName || "",
    city: user.city,
    district: user.district,
    state: user.state,
    role: user.role,
    isVerified: user.isVerified,
    walletAddress: user.walletAddress,
  };
}

export async function getAuthStatus(_request, response) {
  const adminExists = await User.exists({ role: "ADMIN" });
  response.json({
    adminExists: Boolean(adminExists),
  });
}

export async function setupAdmin(request, response) {
  if (validationFailed(request, response)) {
    return;
  }

  const adminExists = await User.exists({ role: "ADMIN" });
  if (adminExists) {
    response.status(400).json({ error: "Admin account already exists" });
    return;
  }

  const passwordHash = await bcrypt.hash(request.body.password, 10);
  const admin = await User.create({
    firstName: request.body.departmentName,
    lastName: "Admin",
    mobileNumber: "0000000000",
    email: request.body.email.toLowerCase(),
    city: request.body.district,
    district: request.body.district,
    state: request.body.state,
    passwordHash,
    role: "ADMIN",
    isVerified: true,
  });

  const token = signAuthToken(admin);
  response.status(201).json({ token, user: sanitizeUser(admin) });
}

export async function registerUser(request, response) {
  if (validationFailed(request, response)) {
    return;
  }

  const existingUser = await User.findOne({ email: request.body.email.toLowerCase() });
  if (existingUser) {
    response.status(409).json({ error: "An account with this email already exists" });
    return;
  }

  const passwordHash = await bcrypt.hash(request.body.password, 10);
  const otp = generateOtp();

  const user = await User.create({
    firstName: request.body.firstName,
    lastName: request.body.lastName,
    mobileNumber: request.body.mobileNumber,
    email: request.body.email.toLowerCase(),
    city: request.body.city,
    district: request.body.district,
    state: request.body.state,
    passwordHash,
    role: "PUBLIC",
    verificationOtp: otp,
    verificationOtpExpiresAt: getOtpExpiry(),
    isVerified: false,
  });

  await sendOtpEmail({
    email: user.email,
    otp,
    purpose: "email verification",
    name: `${user.firstName} ${user.lastName}`,
  });

  response.status(201).json({
    message: "Account created. Enter the OTP sent to your email to verify your account.",
    email: user.email,
  });
}

export async function verifyEmailOtp(request, response) {
  if (validationFailed(request, response)) {
    return;
  }

  const user = await User.findOne({ email: request.body.email.toLowerCase() });
  if (!user) {
    response.status(404).json({ error: "User not found" });
    return;
  }

  if (user.verificationOtp !== request.body.otp || !user.verificationOtpExpiresAt || user.verificationOtpExpiresAt < new Date()) {
    response.status(400).json({ error: "Invalid or expired OTP" });
    return;
  }

  user.isVerified = true;
  user.verificationOtp = "";
  user.verificationOtpExpiresAt = null;
  await user.save();

  const token = signAuthToken(user);
  response.json({
    token,
    user: sanitizeUser(user),
  });
}

export async function resendVerificationOtp(request, response) {
  const user = await User.findOne({ email: request.body.email.toLowerCase() });
  if (!user) {
    response.status(404).json({ error: "User not found" });
    return;
  }

  const otp = generateOtp();
  user.verificationOtp = otp;
  user.verificationOtpExpiresAt = getOtpExpiry();
  await user.save();

  await sendOtpEmail({
    email: user.email,
    otp,
    purpose: "email verification",
    name: `${user.firstName} ${user.lastName}`,
  });

  response.json({ message: "A new OTP has been sent to your email." });
}

export async function loginUser(request, response) {
  if (validationFailed(request, response)) {
    return;
  }

  const user = await User.findOne({ email: request.body.email.toLowerCase() });
  if (!user || !user.passwordHash) {
    response.status(401).json({ error: "Invalid email or password" });
    return;
  }

  const isValid = await bcrypt.compare(request.body.password, user.passwordHash);
  if (!isValid) {
    response.status(401).json({ error: "Invalid email or password" });
    return;
  }

  if (!user.isVerified) {
    response.status(403).json({ error: "Verify your email with OTP before logging in" });
    return;
  }

  user.lastLoginAt = new Date();
  // Only bind wallet on login if not already set in DB
  if (request.body.walletAddress && !user.walletAddress) {
    user.walletAddress = request.body.walletAddress;
  }
  await user.save();

  const token = signAuthToken(user);
  response.json({ token, user: sanitizeUser(user) });
}

export async function forgotPassword(request, response) {
  const user = await User.findOne({ email: request.body.email.toLowerCase() });
  if (!user) {
    response.json({ message: "If an account exists, an OTP has been sent to that email." });
    return;
  }

  const otp = generateOtp();
  user.resetOtp = otp;
  user.resetOtpExpiresAt = getOtpExpiry();
  await user.save();

  await sendOtpEmail({
    email: user.email,
    otp,
    purpose: "password reset",
    name: `${user.firstName} ${user.lastName}`,
  });

  response.json({ message: "If an account exists, an OTP has been sent to that email." });
}

export async function validateResetOtp(request, response) {
  const user = await User.findOne({ email: request.body.email.toLowerCase() });
  const isValid = Boolean(
    user &&
      user.resetOtp === request.body.otp &&
      user.resetOtpExpiresAt &&
      user.resetOtpExpiresAt >= new Date(),
  );

  response.json({
    valid: isValid,
    message: isValid ? "OTP matched successfully." : "OTP is incorrect or expired.",
  });
}

export async function resetPassword(request, response) {
  if (validationFailed(request, response)) {
    return;
  }

  const user = await User.findOne({ email: request.body.email.toLowerCase() });
  if (!user || user.resetOtp !== request.body.otp || !user.resetOtpExpiresAt || user.resetOtpExpiresAt < new Date()) {
    response.status(400).json({ error: "Invalid or expired OTP" });
    return;
  }

  user.passwordHash = await bcrypt.hash(request.body.password, 10);
  user.resetOtp = "";
  user.resetOtpExpiresAt = null;
  await user.save();

  response.json({ message: "Password reset successful. Please log in." });
}

export async function googleLogin(request, response) {
  if (!process.env.GOOGLE_CLIENT_ID) {
    response.status(400).json({ error: "Google login is not configured on the server yet" });
    return;
  }

  const ticket = await googleClient.verifyIdToken({
    idToken: request.body.credential,
    audience: process.env.GOOGLE_CLIENT_ID,
  });
  const payload = ticket.getPayload();

  if (!payload?.email) {
    response.status(400).json({ error: "Google account email not found" });
    return;
  }

  let user = await User.findOne({ email: payload.email.toLowerCase() });
  let isNewUser = false;

  if (!user) {
    isNewUser = true;
    user = await User.create({
      firstName: payload.given_name || "Google",
      lastName: payload.family_name || "User",
      mobileNumber: "0000000000",
      email: payload.email.toLowerCase(),
      city: "Patna",
      district: "Patna",
      state: "Bihar",
      role: "PUBLIC",
      googleId: payload.sub,
      isVerified: true,
      walletAddress: request.body.walletAddress || "",
    });
  }

  user.googleId = payload.sub;
  user.isVerified = true;
  user.lastLoginAt = new Date();
  // Only bind wallet on login if not already set in DB
  if (request.body.walletAddress && !user.walletAddress) {
    user.walletAddress = request.body.walletAddress;
  }
  await user.save();

  const token = signAuthToken(user);
  // New Google users need to complete their profile (mobile, district, city)
  response.json({ token, user: sanitizeUser(user), needsProfile: isNewUser });
}

export async function getMe(request, response) {
  response.json({ user: sanitizeUser(request.user) });
}

export async function updateWallet(request, response) {
  // One-time binding logic: if already set, don't allow change unless it's an admin reset (optional)
  if (request.user.walletAddress && request.user.walletAddress !== "") {
     return response.status(400).json({ error: "Wallet address is already bound to this account" });
  }
  request.user.walletAddress = request.body.walletAddress || "";
  await request.user.save();
  response.json({ user: sanitizeUser(request.user) });
}

export async function updateProfile(request, response) {
  const { firstName, lastName, mobileNumber, district, city, state, departmentName } = request.body;
  const u = request.user;
  if (firstName)      u.firstName = firstName.trim();
  if (lastName)       u.lastName = lastName.trim();
  if (mobileNumber)   u.mobileNumber = mobileNumber.trim();
  if (district)       u.district = district.trim();
  if (city)           u.city = city.trim();
  if (state)          u.state = state.trim();
  if (departmentName !== undefined) u.departmentName = departmentName.trim();
  await u.save();
  response.json({ user: sanitizeUser(u) });
}
