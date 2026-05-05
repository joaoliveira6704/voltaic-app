import mongoose from "mongoose";

const logSchema = new mongoose.Schema(
  {
    userId: { type: String, required: false },
    stationId: { type: String, required: false },
    type: { type: String, required: true },
    action: { type: String, required: false },
    details: { type: String, required: false },
  },
  { timestamps: true },
);

export default mongoose.model("logs", logSchema);
