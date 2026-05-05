import mongoose from "mongoose";

const companySchema = new mongoose.Schema(
  {
    companyId: { type: String, required: true, unique: true, trim: true },
    name: { type: String, required: true, unique: true, trim: true },
    groups: [{ type: String, ref: "Group" }],
  },
  { timestamps: true },
);

companySchema.index({ workingArea: "2dsphere" });

export default mongoose.model("companies", companySchema);
