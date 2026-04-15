import mongoose from "mongoose";

const ticketSchema = new mongoose.Schema(
  {
    ticketId: { type: String, unique: true, required: true },
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
    state: {
      type: String,
      required: true,
      default: "open",
      enum: ["open", "closed", "resolved"],
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

export default mongoose.model("Ticket", ticketSchema);
