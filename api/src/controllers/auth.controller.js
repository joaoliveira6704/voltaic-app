import userModel from "../models/user.model.js";
import resetTokenModel from "../models/resetToken.model.js";
import refreshTokenModel from "../models/refreshToken.model.js";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import generateUniqueId, { generateUniqueToken } from "../utils/utils.js";
import sendResetEmail from "../utils/mailer.js";
import mongoose from "mongoose";
import { success, error as sendError } from "../utils/response.js";

const signAccessToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  });
};

const signRefreshToken = (userId) => {
  return jwt.sign({ userId }, process.env.JWT_REFRESH_SECRET, {
    expiresIn: process.env.JWT_REFRESH_EXPIRES_IN,
  });
};

const createAndStoreRefreshToken = async (userId) => {
  const refreshToken = signRefreshToken(userId);

  const { exp } = jwt.decode(refreshToken);

  await refreshTokenModel.create({
    userId,
    token: refreshToken,
    expiresAt: new Date(exp * 1000),
  });

  return refreshToken;
};

export const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return sendError(res, {
        message: "Please provide email and password",
        statusCode: 400,
      });
    }

    const user = await userModel.findOne({ email }).select("+password");
    if (!user || !(await user.correctPassword(password, user.password))) {
      return sendError(res, { message: "Invalid Credentials", statusCode: 401 });
    }

    const accessToken = signAccessToken(user._id);
    const refreshToken = await createAndStoreRefreshToken(user.userId);

    user.password = undefined;

    success(res, {
      data: { user, token: accessToken, refreshToken },
    });
  } catch (error) {
    next(error);
  }
};

export const refresh = async (req, res, next) => {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      const err = new Error("Refresh token is required");
      err.status = 400;
      return next(err);
    }

    const decoded = jwt.verify(
      refreshToken,
      process.env.JWT_REFRESH_SECRET,
    );

    const storedToken = await refreshTokenModel.findOne({
      token: refreshToken,
    });

    if (!storedToken) {
      const err = new Error("Refresh token is invalid or has been revoked");
      err.status = 401;
      return next(err);
    }

    const user = await userModel.findOne({ userId: decoded.userId });
    if (!user) {
      const err = new Error("User no longer exists");
      err.status = 401;
      return next(err);
    }

    // Rotação — apagar o refresh token usado
    await refreshTokenModel.deleteOne({ token: refreshToken });

    // Emitir novo par
    const newAccessToken = signAccessToken(user._id);
    const newRefreshToken = await createAndStoreRefreshToken(user.userId);

    success(res, {
      data: { token: newAccessToken, refreshToken: newRefreshToken },
    });
  } catch (error) {
    if (error.name === "JsonWebTokenError" || error.name === "TokenExpiredError") {
      error.status = 401;
      error.message = "Invalid or expired refresh token";
    }
    next(error);
  }
};

export const logout = async (req, res, next) => {
  try {
    const { refreshToken } = req.body;

    if (refreshToken) {
      await refreshTokenModel.deleteOne({ token: refreshToken });
    }

    success(res, { message: "Logged out successfully" });
  } catch (error) {
    next(error);
  }
};

export const logoutAll = async (req, res, next) => {
  try {
    await refreshTokenModel.deleteMany({ userId: req.user.userId });

    success(res, { message: "Logged out from all devices successfully" });
  } catch (error) {
    next(error);
  }
};

export const register = async (req, res, next) => {
  console.log("Received Register Request", req.body);
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
      role: "client",
      vehicles: [],
    });

    await newUser.save();

    console.log("User created successfully", newUser);

    success(res, {
      message: "User created successfully",
      data: { userId: newUser.userId },
      statusCode: 201,
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
  success(res, {
    data: {
      valid: true,
      userId: req.user.userId,
      role: req.user.role,
      isAdmin: req.user.role === "admin",
    },
  });
};

export const createResetToken = async (req, res, next) => {
  try {
    console.log("creating token");
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
      console.log("generated token: ", newToken.token);

      await sendResetEmail(email, newToken.token);
    }

    return success(res, {
      message:
        "If an account with that email exists, you'll receive a reset link shortly.",
    });
    console.log("reached");
  } catch (err) {
    next(err);
  }
};

export const validateResetToken = async (req, res, next) => {
  console.log("validateReseToken");

  try {
    const token = req.params.token;

    if (!token) {
      const err = new Error();
      err.status = 400;
      err.message = "Token is not valid or has expired";
      return next(err);
    }

    const resetToken = await resetTokenModel.findOne({ token: token });

    if (!resetToken) {
      const err = new Error();
      err.status = 404;
      err.message = "Token is not valid or has expired";
      return next(err);
    }

    return success(res, { message: "Token is valid." });
  } catch (err) {
    next(err);
  }
};

export const resetPassword = async (req, res, next) => {
  try {
    const { token, newPassword } = req.body;

    if (!token || !newPassword) {
      const err = new Error("Token and new password are required");
      err.status = 400;
      return next(err);
    }

    const resetToken = await resetTokenModel.findOne({ token });
    if (!resetToken) {
      const err = new Error("Invalid or expired token");
      err.status = 400;
      return next(err);
    }

    const user = await userModel
      .findOne({ userId: resetToken.userId })
      .select("+password");
    if (!user) {
      const err = new Error("User not found");
      err.status = 404;
      return next(err);
    }

    const isSamePassword = await user.correctPassword(
      newPassword,
      user.password,
    );
    if (isSamePassword) {
      const err = new Error("New password must differ from current password");
      err.status = 400;
      return next(err);
    }

    user.password = newPassword;
    console.log("saving user");
    await user.save();
    console.log("deleting token");
    await resetTokenModel.deleteOne({ token });

    return success(res, { message: "Password updated successfully." });
  } catch (err) {
    next(err);
  }
};
