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
        index: "2dsphere",
      },
    },
    groupId: { type: String, ref: "Group", required: true },
    connector: {
      socketTypes: [
        {
          type: String,
          enum: [
            "ccs1",
            "ccs2",
            "chademo",
            "gb_t_ac",
            "gb_t_dc",
            "nacs",
            "type1",
            "type2",
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
