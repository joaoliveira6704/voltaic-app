import mongoose from "mongoose";

const ticketSchema = new mongoose.Schema(
  {
    ticketId: { type: String, required: true, unique: true, trim: true },
    stationId: { type: String, ref: "Station" },
    companyId: { type: String, ref: "Company" },
    createdBy: { type: String, ref: "User" },
    title: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    remarks: {
      type: String,
    },
    status: {
      type: String,
      required: true,
      default: "open",
      enum: ["open", "closed", "resolved", "unresolved"],
    },
    closedAt: {
      type: Date,
    },
  },
  {
    timestamps: true,
  },
);

export default mongoose.model("tickets", ticketSchema);
