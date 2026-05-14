import userModel from "../models/user.model.js";
import resetTokenModel from "../models/resetToken.model.js";
import jwt from "jsonwebtoken";
import generateUniqueId, { generateUniqueToken } from "../utils/utils.js";
import sendResetEmail from "../utils/mailer.js";
import mongoose from "mongoose";

const signToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  });
};

export const login = async (req, res) => {
  console.log("Request Login");

  const { email, password } = req.body;

  if (!email || !password) {
    return res
      .status(400)
      .json({ message: "Please provide email and password" });
  }

  const user = await userModel.findOne({ email }).select("+password");
  if (!user || !(await user.correctPassword(password, user.password))) {
    return res.status(401).json({ message: "Invalid Credentials" });
  }

  const token = signToken(user._id);

  user.password = undefined;

  res.status(200).json({
    status: "success",
    token,
    data: { user },
  });
};

export const register = async (req, res, next) => {
  try {
    const { username, email, firstName, lastName, password, role } = req.body;
    let userId = generateUniqueId();
    const newUser = new userModel({
      userId,
      username,
      email,
      firstName,
      lastName,
      password,
      role,
    });

    await newUser.save();

    res.status(201).json({
      userId: newUser.userId,
      message: "User created successfully",
    });
  } catch (error) {
    if (error.code === 11000) {
      error.status = 400;
      error.message = "Email or username already exists";
    }
    next(error);
  }
};

export const validateToken = (req, res) => {
  // If the code reaches here, the 'protect' middleware already verified the token
  res.status(200).json({
    valid: true,
    userId: req.user.userId,
    role: req.user.role,
    isAdmin: req.user.role === "admin",
  });
};

export const createResetToken = async (req, res, next) => {
  try {
    const email = req.body.email;

    if (!email || email === "") {
      const err = new Error();
      err.status = 400;
      err.message = "Email can´t be empty";
      return next(err);
    }

    const user = await userModel.findOne({ email });
    console.log("User found:", user);

    if (user) {
      await resetTokenModel.findOneAndDelete({ userId: user.userId });

      const newToken = new resetTokenModel({
        userId: user.userId,
        token: await generateUniqueToken(),
      });

      await newToken.save();
      //await sendResetEmail(email, newToken.token);
    }

    return res.status(200).json({
      message:
        "If an account with that email exists, you'll receive a reset link shortly.",
    });
    console.log("reached");
  } catch (err) {
    next(err);
  }
};

export const validateResetToken = async (req, res, next) => {
  try {
    const token = req.params.token;

    if (!token) {
      const err = new Error();
      err.status = 400;
      err.message = "Token is not valid";
      return next(err);
    }

    const resetToken = await resetTokenModel.findOne({ token: token });

    if (!resetToken) {
      const err = new Error();
      err.status = 400;
      err.message = "Token is not valid or has expired";
      return next(err);
    }

    return res.status(200).json({ message: "Token is valid." });
  } catch (err) {
    next(err);
  }
};
