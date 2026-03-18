const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    usedId: { type: String, required: true, unique: true },
    username: { type: String, required: true, unique: true, trim: true },
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    password: {
      type: String,
      required: true,
      select: false,
    },
    type: {
      type: String,
      required: true,
      enum: ["client", "admin", "company"],
    },
    vehicles: [
      {
        plate: { type: String, required: true },
        model: { type: String, required: true },
        color: { type: String, required: true },
        connector: {
          type: String,
          required: true,
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
      },
    ],
    favorites: [
      {
        type: String,
        ref: "Station",
      },
    ],
  },
  { timestamps: true },
);

module.exports = mongoose.model("User", userSchema);
