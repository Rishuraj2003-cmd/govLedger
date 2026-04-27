import mongoose from "mongoose";

const projectSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    description: { type: String, required: true, trim: true },
    budget: { type: Number, required: true, min: 0 },
    chainProjectId: { type: String, default: "" }, // uint256 returned by smart contract
    allocatedFunds: { type: Number, default: 0, min: 0 },
    utilizedFunds: { type: Number, default: 0, min: 0 },
    department: { type: String, required: true, trim: true },
    projectType: { type: String, trim: true, default: "General" },
    district: { type: String, required: true, trim: true },
    city: { type: String, required: false, trim: true },
    state: { type: String, required: true, trim: true, default: "Bihar" },
    timelineStart: { type: Date, required: true },
    timelineEnd: { type: Date, required: true },
    status: {
      type: String,
      enum: ["PLANNED", "ACTIVE", "ON_HOLD", "COMPLETED"],
      default: "ACTIVE",
    },
    visibility: {
      type: String,
      enum: ["PUBLIC", "PRIVATE"],
      default: "PUBLIC",
    },
    districtOfficerName: { type: String, default: "" },
    departmentHeadName: { type: String, default: "" },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  },
  { timestamps: true },
);

projectSchema.virtual("remainingFunds").get(function remainingFunds() {
  return this.budget - this.utilizedFunds;
});

projectSchema.set("toJSON", { virtuals: true });

export const Project = mongoose.model("Project", projectSchema);
