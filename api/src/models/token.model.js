import mongoose from "mongoose";
import crypto from "crypto";

const tokenSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
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
    default: () => new Date(DataTransfer.now() + 1000 * 60 * 5), //expires after 5 minutes
    index: { expires: 0 },
  },
});
