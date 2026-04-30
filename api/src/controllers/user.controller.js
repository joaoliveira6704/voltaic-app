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
    // 1. Fetch user (ensure password is selected for comparison)
    const user = await userModel
      .findOne({ userId: req.user.userId })
      .select("+password");

    if (!user) {
      const err = new Error("User not found");
      err.status = 404;
      return next(err);
    }

    const { newPassword, currentPassword, ...otherUpdates } = req.body;

    // 2. Handle Password Change Logic
    if (newPassword) {
      if (!currentPassword) {
        const err = new Error(
          "Current password is required to set a new password",
        );
        err.status = 400;
        return next(err);
      }

      // Check if current password is correct
      const isPasswordValid = await user.correctPassword(
        currentPassword,
        user.password,
      );
      if (!isPasswordValid) {
        const err = new Error("The current password you entered is incorrect");
        err.status = 401;
        return next(err);
      }

      // Set the new password (Mongoose 'pre-save' hook will hash this)
      user.password = newPassword;
    }

    // 3. Update other fields
    // Use Object.assign on the document to keep it reactive
    Object.assign(user, otherUpdates);

    // 4. Save and trigger validation/hooks
    const updatedUser = await user.save();

    // 5. Security: Don't send the password back in the response
    updatedUser.password = undefined;

    res.json(updatedUser);
  } catch (error) {
    if (error.code === 11000) {
      error.status = 400;
      const field = Object.keys(error.keyValue)[0];
      error.message = `${field.charAt(0).toUpperCase() + field.slice(1)} already exists`;
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

export const editVehicle = async (req, res, next) => {
  try {
    const { plate } = req.params; // Get plate from URL
    const { model, color, connector, slug } = req.body;

    const updatedUser = await userModel.findOneAndUpdate(
      {
        userId: req.user.userId,
        "vehicles.plate": plate,
      },
      {
        $set: {
          "vehicles.$.model": model,
          "vehicles.$.color": color,
          "vehicles.$.connector": connector,
          "vehicles.$.slug": slug,
        },
      },
      { new: true },
    );
    if (!updatedUser) {
      let err = new Error();
      err.status = 404;
      err.message = "Vehicle not found";
      return next(err);
    }
    res.json(updatedUser);
  } catch (error) {
    next(error);
  }
};
