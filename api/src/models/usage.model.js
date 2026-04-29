import mongoose from "mongoose";

const usageSchema = new mongoose.Schema(
  {
    userId: { type: String, required: true },
    stationId: { type: String, required: true },
    plate: { type: String, required: true },
    startTime: { type: Date, required: true },
    endTime: { type: Date, required: false },
  },
  { timestamps: true },
);

export default mongoose.model("usage", usageSchema, "stations_usage");
