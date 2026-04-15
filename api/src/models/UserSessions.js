import mongoose from "mongoose";

const { Schema } = mongoose;

const userSessionSchema = new Schema(
  {
    userId: {
      type: String,
      ref: "User",
      required: true,
      index: true,
    },
    token: {
      type: String,
      required: true,
      unique: true,
    },
    //
    deviceInfo: {
      browser: String,
      os: String,
      ip: String,
    },
    isValid: {
      type: Boolean,
      default: true,
    },
    expireAt: {
      type: Date,
      default: () => new Date(Date.now() + 24 * 60 * 60 * 1000),
      index: { expires: 0 },
    },
  },
  { timestamps: true },
);

export default mongoose.model("UserSession", userSessionSchema);
