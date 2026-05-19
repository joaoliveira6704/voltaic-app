import mongoose from "mongoose";
import crypto from "crypto";

const tokenSchema = new mongoose.Schema({
  userId: {
    type: String,
    ref: "User",
    required: true,
    unique: true,
  },
  token: {
    type: String,
    required: true,
    unique: true,
  },
  expiresAt: {
    type: Date,
    required: true,
    default: () => new Date(Date.now() + 1000 * 60 * 20), //expires after 5 minutes
    index: { expires: 0 },
  },
});

export default mongoose.model("resetTokens", tokenSchema);
