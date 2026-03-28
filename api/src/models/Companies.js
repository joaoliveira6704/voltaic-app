const mongoose = require("mongoose");

const companySchema = new mongoose.Schema(
  {
    companyId: { type: String, required: true, unique: true },
    name: { type: String, required: true, unique: true, trim: true },
    workingArea: {
      type: {
        type: String,
        enum: ["Point"],
        default: "Point",
      },
      coordinates: {
        type: [Number], // [longitude, latitude]
        required: true,
      },
    },
  },
  { timestamps: true },
);

companySchema.index({ workingArea: "2dsphere" });

module.exports = mongoose.model("Company", companySchema);
