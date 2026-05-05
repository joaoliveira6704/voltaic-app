import mongoose from "mongoose";

const groupSchema = new mongoose.Schema(
  {
    groupId: { type: String, required: false },
    name: { type: String, required: false },
  },
  { timestamps: true },
);

export default mongoose.model("groups", groupSchema);
