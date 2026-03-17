const mongoose = require("mongoose");

const ticketSchema = new mongoose.Schema(
  {
    stationId: { type: mongoose.Schema.Types.ObjectId, ref: "Station" },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    title: {
      type: String,
      required: true,
      select: false,
    },
    description: {
      type: String,
      required: true,
    },
    remarks: {
      type: String,
      required: true,
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

module.exports = mongoose.model("Ticket", ticketSchema);
