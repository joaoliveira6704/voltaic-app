import userModel from "../models/user.model.js";
import generateUniqueId from "../utils/utils.js";

export const getUsers = async (req, res, next) => {
  try {
    const users = await userModel.find();
    console.log(`Found ${users.length} users in the database.`);
    res.json(users);
  } catch (error) {
    next(error);
  }
};

export const deleteUser = async (req, res, next) => {
  try {
    const deletedUser = await userModel.findOneAndDelete({
      userId: req.params.id,
    });
    if (!deletedUser) {
      const err = new Error("User not found");
      err.status = 404;
      return next(err);
    }
    res.json({ message: "User deleted successfully" });
  } catch (error) {
    next(error);
  }
};

export const updateUser = async (req, res, next) => {
  try {
    const updatedUser = await userModel.findOneAndUpdate(
      { userId: req.params.id },
      req.body,
      { new: true },
    );
    if (!updatedUser) {
      const err = new Error("User not found");
      err.status = 404;
      return next(err);
    }
    res.json(updatedUser);
  } catch (error) {
    next(error);
  }
};

export const getCurrentUser = async (req, res, next) => {
  try {
    const user = await userModel.findOne({ userId: req.user.userId });
    if (!user) {
      const err = new Error("User not found");
      err.status = 404;
      return next(err);
    }
    res.json(user);
  } catch (error) {
    next(error);
  }
};

export const getUserById = async (req, res, next) => {
  try {
    const user = await userModel.findOne({ userId: req.params.id });
    if (!user) {
      const err = new Error("User not found");
      err.status = 404;
      return next(err);
    }
    res.json(user);
  } catch (error) {
    next(error);
  }
};
