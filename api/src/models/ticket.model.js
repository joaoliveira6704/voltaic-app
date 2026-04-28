import mongoose from "mongoose";

const ticketSchema = new mongoose.Schema(
  {
    stationId: { type: String, ref: "Station" },
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
      required: false,
    },
    status: {
      type: String,
      required: true,
      default: "open",
      enum: ["open", "closed", "resolved", "unresolved"],
    },
    closedAt: {
      type: Date,
      required: false,
    },
  },
  {
    timestamps: true,
  },
);

export default mongoose.model("tickets", ticketSchema);
