import mongoose from "mongoose";

const stationSchema = new mongoose.Schema(
  {
    stationId: { type: String, required: true, unique: true, trim: true },
    title: { type: String, required: true },
    companyId: { type: String, required: true, unique: true, trim: true },
    location: {
      type: {
        type: String,
        enum: ["Point"],
        default: "Point",
      },
      coordinates: {
        type: [Number], // [longitude, latitude]
        required: true,
        index: "2dsphere",
      },
    },
    groupId: { type: String, ref: "Group", required: false },
    connector: {
      socketTypes: [
        {
          type: String,
          enum: [
            "Type2",
            "CHAdeMO",
            "CCS/SAE",
            "Type3",
            "Tesla",
            "J-1772",
            "Wall_Euro",
            "Caravan_Mains_Socket",
            "Dual_J-1772",
            "Dual_CHAdeMO",
            "Mennekes",
            "Dual_Mennekes",
            "Other",
          ],
        },
      ],
      maxPower: {
        type: Number,
        required: true,
      },
    },

    telemetry: {
      amperage: {
        type: Number,
        min: 0,
      },
      voltage: {
        type: Number,
        min: 0,
      },
      temperature: {
        type: Number,
        required: true,
      },
    },

    state: {
      type: String,
      required: true,
      default: "available",
      enum: ["available", "unavailable", "maintenance"],
    },

    alive: {
      type: Boolean,
      required: true,
      default: true,
    },
  },
  { timestamps: true },
);

stationSchema.index({ location: "2dsphere" });

export default mongoose.model("stations", stationSchema);
