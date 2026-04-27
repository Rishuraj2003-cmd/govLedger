import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    firstName: { type: String, required: true, trim: true },
    lastName: { type: String, required: true, trim: true },
    mobileNumber: { type: String, trim: true, default: "" },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    departmentName: { type: String, trim: true, default: "" },
    city: { type: String, trim: true },
    district: { type: String, trim: true, default: "" },
    state: { type: String, required: true, trim: true, default: "Bihar" },
    passwordHash: { type: String },
    profilePicUrl: { type: String, default: "" },
    role: {
      type: String,
      enum: ["PUBLIC", "ADMIN", "DISTRICT", "DEPARTMENT", "OFFICER", "CONTRACTOR", "VENDOR"],
      default: "PUBLIC",
    },
    isVerified: { type: Boolean, default: false },
    walletAddress: { type: String, trim: true, default: "" },
    googleId: { type: String, default: "" },
    verificationOtp: { type: String, default: "" },
    verificationOtpExpiresAt: { type: Date },
    resetOtp: { type: String, default: "" },
    resetOtpExpiresAt: { type: Date },
    lastLoginAt: { type: Date },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null },
  },
  { timestamps: true },
);

export const User = mongoose.model("User", userSchema);
