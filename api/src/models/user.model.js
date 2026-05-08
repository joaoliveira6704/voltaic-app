import mongoose from "mongoose";
import bcrypt from "bcrypt";
import validator from "validator";
import isEmail from "validator/lib/isEmail.js";

const userSchema = new mongoose.Schema(
  {
    userId: { type: String, required: false, unique: true, trim: true },
    username: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      validate: {
        validator: function (value) {
          return validator.isLength(value, { min: 8, max: 20 });
        },
        message: "Username must be at least 8 characters long",
      },
    },
    email: {
      type: String,
      required: true,
      unique: true,
      validate: {
        validator: validator.isEmail,
        message: "Invalid email address",
      },
    },
    firstName: {
      type: String,
      required: true,
    },
    lastName: { type: String, required: true },
    password: {
      type: String,
      required: true,
      select: false,
      validate: {
        validator: function (value) {
          return validator.isStrongPassword(value, {
            minLength: 8,
            minLowercase: 1,
            minUppercase: 1,
            minSymbols: 1,
          });
        },
        message: `Password must contain at least 8 characters, with one uppercase, one lowercase and a special character`,
      },
    },
    role: {
      type: String,
      required: true,
      enum: ["client", "admin", "worker", "company-manager"],
    },
    companyId: { type: String, required: false, ref: "Company" },
    preferences: {
      darkMode: { type: Boolean, required: false, default: false },
      hidePlates: { type: Boolean, required: false, default: false },
      language: { type: String, required: false, default: "en" },
    },
    vehicles: [
      {
        plate: { type: String, required: true },
        model: { type: String, required: true },
        color: { type: String, required: true },
        slug: { type: String, required: true },
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
            "ccs2",
            "nacs",
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
  { timestamps: true, collection: "users" },
);

// Hash the password before saving the user
userSchema.pre("save", async function () {
  if (!this.isModified("password")) return;

  this.password = await bcrypt.hash(this.password, 12);
});

// Remove 'next' from arguments and make the function async
userSchema.pre("save", async function () {
  // 1. Only run if vehicles are modified
  if (!this.isModified("vehicles")) return;

  // 2. Get and clean the plates
  const plates = this.vehicles.map((v) => v.plate.toLowerCase().trim());

  // 3. Check for duplicates
  const hasDuplicates = plates.some((plate, index) => {
    return plates.indexOf(plate) !== index;
  });

  if (hasDuplicates) {
    const err = new Error("Duplicate plate detected in your vehicle list.");
    err.status = 400;
    // Just throw the error; Mongoose catches it and sends it to your controller's catch block
    throw err;
  }
});

// Method to compare passwords
userSchema.methods.correctPassword = async function (
  candidatePassword,
  userPassword,
) {
  return await bcrypt.compare(candidatePassword, userPassword);
};

export default mongoose.model("users", userSchema);
