import bcrypt from "bcryptjs";
import { validationResult } from "express-validator";
import { User } from "../models/User.js";

function validationFailed(request, response) {
  const result = validationResult(request);
  if (result.isEmpty()) {
    return false;
  }

  console.log("Validation failed details:", result.array());
  response.status(422).json({ error: "Please check the submitted details", details: result.array() });
  return true;
}

export async function listUsers(request, response) {
  let query = {};
  if (request.user.role === "DISTRICT") {
    query.district = request.user.district;
  } else if (request.user.role === "DEPARTMENT") {
    query.departmentName = request.user.departmentName;
    query.district = request.user.district;
  }

  const users = await User.find(query).select("-passwordHash -verificationOtp -resetOtp").sort({ createdAt: -1 });
  response.json({ users });
}

export async function createUserByAdmin(request, response) {
  if (validationFailed(request, response)) {
    return;
  }

  const { role, district, departmentName } = request.body;
  const creatorRole = request.user.role;

  // Hierarchy enforcement
  if (creatorRole === "DISTRICT") {
    if (!["DEPARTMENT", "OFFICER", "CONTRACTOR", "VENDOR"].includes(role)) {
      return response.status(403).json({ error: "District Admin can only create Department, Officer, Contractor, or Vendor roles." });
    }
    // Auto-fill so the user is linked to the creating district
    request.body.district = request.user.district;
  } else if (creatorRole === "DEPARTMENT") {
    if (!["OFFICER", "CONTRACTOR", "VENDOR"].includes(role)) {
      return response.status(403).json({ error: "Department Head can only create Officer, Contractor, or Vendor roles." });
    }
    if (request.body.district !== request.user.district || request.body.departmentName !== request.user.departmentName) {
      return response.status(403).json({ error: "You can only create users for your own department and district." });
    }
  }

  const existingUser = await User.findOne({ email: request.body.email.toLowerCase() });
  if (existingUser) {
    response.status(409).json({ error: "A user with this email already exists" });
    return;
  }

  const passwordHash = await bcrypt.hash(request.body.password, 10);
  const user = await User.create({
    ...request.body,
    email: request.body.email.toLowerCase(),
    passwordHash,
    isVerified: true,
    createdBy: request.user._id,
  });

  response.status(201).json({
    user: {
      id: user._id,
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      mobileNumber: user.mobileNumber,
      city: user.city,
      district: user.district,
      state: user.state,
      role: user.role,
      isVerified: user.isVerified,
      walletAddress: user.walletAddress,
    },
  });
}
