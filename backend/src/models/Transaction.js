import mongoose from "mongoose";

const transactionSchema = new mongoose.Schema(
  {
    project: { type: mongoose.Schema.Types.ObjectId, ref: "Project", required: true },
    actionType: {
      type: String,
      enum: ["PROJECT_CREATED", "FUNDS_ALLOCATED", "FUNDS_TRANSFERRED", "ANNOUNCEMENT_POSTED"],
      required: true,
    },
    senderName: { type: String, required: true },
    senderRole: { type: String, required: true },
    senderUser: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null },
    receiverName: { type: String, default: "" },
    receiverRole: { type: String, default: "" },
    receiverWallet: { type: String, default: "" },
    amount: { type: Number, default: 0 },
    note: { type: String, default: "" },
    stage: { type: String, required: true },
    txHash: { type: String, default: "" },
    chainMode: { type: String, default: "mock-chain" },
  },
  { timestamps: true },
);

export const Transaction = mongoose.model("Transaction", transactionSchema);
