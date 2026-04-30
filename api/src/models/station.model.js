import mongoose from "mongoose";

const stationSchema = new mongoose.Schema(
  {
    stationId: { type: String, required: true, unique: true, trim: true },
    title: { type: String, required: true },
    location: {
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
      enum: ["available", "unavailable", "inactive"],
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
