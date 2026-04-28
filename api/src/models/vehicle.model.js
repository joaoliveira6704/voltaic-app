import mongoose from "mongoose";

const vehicleSchema = new mongoose.Schema(
  {
    make: { type: Object, required: true },
    model: { type: Object, required: true },
    charge_ports: { type: Array, required: false },
  },
  { timestamps: true },
);

export default mongoose.model("vehicles", vehicleSchema);
