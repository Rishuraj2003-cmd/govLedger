import mongoose from "mongoose";

const workSubmissionSchema = new mongoose.Schema(
  {
    project: { type: mongoose.Schema.Types.ObjectId, ref: "Project", required: true },
    vendor: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    title: { type: String, required: true, trim: true },
    description: { type: String, required: true, trim: true },
    completionPercent: { type: Number, required: true, min: 0, max: 100 },
    proofFiles: [
      {
        originalName: { type: String },
        filename: { type: String },
        mimetype: { type: String },
        size: { type: Number },
        url: { type: String },
      },
    ],
    requestedAmount: { type: Number, required: true, min: 0 },
    status: {
      type: String,
      enum: ["PENDING", "APPROVED", "REJECTED"],
      default: "PENDING",
    },
    approvedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    approvedAt: { type: Date },
    rejectionReason: { type: String, default: "" },
    txHash: { type: String, default: "" },
    chainMode: { type: String, default: "mock-chain" },
  },
  { timestamps: true },
);

export const WorkSubmission = mongoose.model("WorkSubmission", workSubmissionSchema);
