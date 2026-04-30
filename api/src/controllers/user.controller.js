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

export const updateOwnUser = async (req, res, next) => {
  try {
    const user = await userModel.findOne({ userId: req.user.userId });

    if (!user) {
      const err = new Error("User not found");
      err.status = 404;
      return next(err);
    }

    Object.assign(user, req.body);
    const updatedUser = await user.save(); // This triggers the duplicate check!

    res.json(updatedUser);
  } catch (error) {
    if (error.code === 11000) {
      error.status = 400;
      error.message = "Email or username already exists";
    }
    next(error);
  }
};

export const addVehicle = async (req, res, next) => {
  try {
    const { plate, model, color, connector, slug } = req.body;

    const user = await userModel.findOne({
      userId: req.user.userId,
      "vehicles.plate": plate.trim(),
    });

    if (user) {
      let err = new Error();
      err.status = 400;
      err.message = "Vehicle with same plate already exists";
      return next(err);
    }
    console.log("Adding vehicle", plate, model, color, connector, slug);
    // Add the vehicle using $push
    const updatedUser = await userModel.findOneAndUpdate(
      { userId: req.user.userId },
      {
        $push: {
          vehicles: { plate, model, color, connector, slug },
        },
      },
      { new: true, runValidators: true },
    );

    res.status(201).json(updatedUser);
  } catch (error) {
    next(error);
  }
};

export const removeVehicle = async (req, res, next) => {
  try {
    const { plate } = req.params; // Get plate from URL

    const updatedUser = await userModel.findOneAndUpdate(
      { userId: req.user.userId },
      { $pull: { vehicles: { plate: plate } } }, // MongoDB removes exactly this item
      { new: true },
    );

    if (!updatedUser) {
      let err = new Error();
      err.status = 404;
      err.message = "User not found";
      return next(err);
    }

    res.json(updatedUser);
  } catch (error) {
    next(error);
  }
};
