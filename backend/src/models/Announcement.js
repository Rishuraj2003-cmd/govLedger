import mongoose from "mongoose";

const announcementSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    message: { type: String, required: true, trim: true },
    audience: {
      type: String,
      enum: ["ALL", "PUBLIC", "OFFICIALS"],
      default: "ALL",
    },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    attachments: [
      {
        originalName: { type: String },
        filename:     { type: String },
        mimetype:     { type: String },
        size:         { type: Number },
        url:          { type: String },
      },
    ],
  },
  { timestamps: true },
);

export const Announcement = mongoose.model("Announcement", announcementSchema);
