import mongoose from "mongoose";

const usageSchema = new mongoose.Schema(
  {
    userId:    { type: mongoose.Schema.Types.ObjectId, ref: "User",    required: true },
    stationId: { type: mongoose.Schema.Types.ObjectId, ref: "Station", required: true },
    plate:     { type: String, required: true },
    endTime:   { type: Date, default: null },
    state:     { type: String, enum: ["active", "completed"], default: "active" },
  },
  { timestamps: true },
);

usageSchema.index({ stationId: 1, state: 1 });
usageSchema.index({ userId: 1, createdAt: -1 });

export default mongoose.model("usage", usageSchema, "stations_usage");
