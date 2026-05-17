import mongoose from "mongoose";

const usageSchema = new mongoose.Schema(
  {
    usageId: { type: String, required: true, unique: true, trim: true },
    userId: { type: String, ref: "User", required: true },
    stationId: { type: String, ref: "Station", required: true },
    plate: { type: String, required: true },
    endTime: { type: Date, default: null },
    state: { type: String, enum: ["active", "completed"], default: "active" },
  },
  { timestamps: true },
);

usageSchema.index({ stationId: 1, state: 1 });
usageSchema.index({ userId: 1, createdAt: -1 });

// Usages Collection
usageSchema.index({ usageId: 1 });
usageSchema.index({ userId: 1, endTime: 1 });
usageSchema.index({ stationId: 1, createdAt: -1 });
usageSchema.index({ state: 1 });

export default mongoose.model("usages", usageSchema);
