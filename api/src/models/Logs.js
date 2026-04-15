import mongoose from "mongoose";

const logSchema = new mongoose.Schema(
  {
    userId: { type: String, required: false },
    stationId: { type: String, required: false },
    type: { type: String, required: true },
    action: { type: String, required: true },
    details: { type: String, required: true },
  },
  { timestamps: true },
);

export default mongoose.model("Log", logSchema);
