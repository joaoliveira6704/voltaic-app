import userModel from "../models/user.model.js";
import stationModel from "../models/station.model.js";
import generateUniqueId from "../utils/utils.js";
import companyModel from "../models/company.model.js";

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

export const deleteOwnUser = async (req, res, next) => {
  try {
    const deletedUser = await userModel.findOneAndDelete({
      userId: req.user.userId,
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
    const userId = req.user.userId;
    const isProfile = req.query.profile;

    const user = await userModel.findOne({ userId: userId });

    if (isProfile) {
      console.log("Getting user profile");
      const userProfile = await userModel.aggregate([
        { $match: { userId: userId } },
        {
          $lookup: {
            from: "companies",
            localField: "companyId",
            foreignField: "companyId",
            as: "companyData",
          },
        },
        { $unwind: "$companyData" },
        {
          $set: { companyName: "$companyData.name" },
        },
        {
          $lookup: {
            from: "usages",
            let: { userId: "$userId" },
            pipeline: [
              { $match: { $expr: { $eq: ["$userId", "$$userId"] } } },
              { $sort: { createdAt: -1 } },
              { $limit: 4 },
              {
                $lookup: {
                  from: "stations",
                  localField: "stationId",
                  foreignField: "stationId",
                  as: "stationData",
                },
              },
              {
                $unwind: {
                  path: "$stationData",
                  preserveNullAndEmptyArrays: true,
                },
              },
              {
                $addFields: {
                  stationName: "$stationData.title",
                  duration: {
                    $cond: {
                      if: { $eq: ["$state", "completed"] },
                      then: {
                        $let: {
                          vars: {
                            totalMinutes: {
                              $floor: {
                                $divide: [
                                  { $subtract: ["$endTime", "$createdAt"] },
                                  60000,
                                ],
                              },
                            },
                          },
                          in: {
                            $let: {
                              vars: {
                                hours: {
                                  $floor: { $divide: ["$$totalMinutes", 60] },
                                },
                                minutes: { $mod: ["$$totalMinutes", 60] },
                              },
                              in: {
                                $cond: {
                                  if: { $eq: ["$$hours", 0] },
                                  then: {
                                    $concat: [{ $toString: "$$minutes" }, "m"],
                                  },
                                  else: {
                                    $concat: [
                                      { $toString: "$$hours" },
                                      "h ",
                                      { $toString: "$$minutes" },
                                      "m",
                                    ],
                                  },
                                },
                              },
                            },
                          },
                        },
                      },
                      else: "$state",
                    },
                  },
                },
              },
              { $project: { stationData: 0 } },
            ],
            as: "chargingHistory",
          },
        },
        {
          $project: {
            endTime: 0,
            password: 0,
            _id: 0,
            companyId: 0,
            companyData: 0,
          },
        },
      ]);

      console.log(userProfile);

      return res.json(userProfile[0]);
    }
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
    const user = await userModel
      .findOne({ userId: req.user.userId })
      .select("+password");

    if (!user) {
      const err = new Error("User not found");
      err.status = 404;
      return next(err);
    }

    const { newPassword, currentPassword, preferences, ...scalarUpdates } =
      req.body;

    // 1. Handle password change
    if (newPassword) {
      if (!currentPassword) {
        const err = new Error(
          "Current password is required to set a new password",
        );
        err.status = 400;
        return next(err);
      }

      const isPasswordValid = await user.correctPassword(
        currentPassword,
        user.password,
      );
      if (!isPasswordValid) {
        const err = new Error("The current password you entered is incorrect");
        err.status = 401;
        return next(err);
      }

      user.password = newPassword;
    }

    // 2. Update allowlisted scalar fields
    const allowedScalars = ["username", "email", "firstName", "lastName"];
    for (const field of allowedScalars) {
      if (scalarUpdates[field] !== undefined) {
        if (
          typeof scalarUpdates[field] === "object" &&
          scalarUpdates[field] !== null
        ) {
          const err = new Error(`Invalid value for field: ${field}`);
          err.status = 400;
          return next(err);
        }
        user[field] = scalarUpdates[field];
      }
    }

    // 3. Patch preferences with dot-notation to avoid full subdoc replacement
    if (preferences && typeof preferences === "object") {
      if (!user.preferences) {
        user.preferences = {};
      }

      for (const [key, value] of Object.entries(preferences)) {
        user.set(`preferences.${key}`, value);
      }
    }

    // 4. Save and trigger validation/hooks
    const updatedUser = await user.save();

    // 5. Don't send password back
    updatedUser.password = undefined;

    res.json(updatedUser);
  } catch (error) {
    if (error.code === 11000) {
      error.status = 400;
      const field = Object.keys(error.keyValue)[0];
      error.message = "Invalid credentials";
    }
    next(error);
  }
};

export const updateRole = async (req, res, next) => {
  try {
    const updatedUser = await userModel.findOneAndUpdate(
      { userId: req.params.id },
      { role: req.body.role },
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

export const getVehicles = async (req, res, next) => {
  try {
    const user = await userModel.findOne({ userId: req.user.userId });
    if (!user) {
      const err = new Error("User not found");
      err.status = 404;
      return next(err);
    }
    res.json(user.vehicles);
  } catch (error) {
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

export const getFavorites = async (req, res, next) => {
  try {
    const user = await userModel.findOne({ userId: req.user.userId });
    if (!user) {
      const err = new Error("User not found");
      err.status = 404;
      return next(err);
    }
    res.json(user.favorites);
  } catch (error) {
    next(error);
  }
};

export const getFavoriteStations = async (req, res, next) => {
  try {
    const user = await userModel.findOne({ userId: req.user.userId });
    if (!user) {
      const err = new Error("User not found");
      err.status = 404;
      return next(err);
    }
    const stations = await stationModel.find({
      stationId: { $in: user.favorites },
    });
    res.json(stations);
  } catch (error) {
    next(error);
  }
};

export const addFavorite = async (req, res, next) => {
  try {
    if (!req.body || !req.body.stationId) {
      const err = new Error("stationId is required");
      err.status = 400;
      return next(err);
    }

    const { stationId } = req.body;

    // check if station exists
    const station = await stationModel.findOne({ stationId });
    if (!station) {
      const err = new Error("Station not found");
      err.status = 404;
      return next(err);
    }

    // check if already in favorites
    const duplicate = await userModel.findOne({
      userId: req.user.userId,
      favorites: stationId,
    });

    if (duplicate) {
      const err = new Error("Station already in favorites");
      err.status = 400;
      return next(err);
    }

    // Add the vehicle using $push
    const updatedUser = await userModel.findOneAndUpdate(
      { userId: req.user.userId },
      { $push: { favorites: stationId } },
      { new: true, runValidators: true },
    );

    res.status(201).json(updatedUser.favorites);
  } catch (error) {
    next(error);
  }
};

export const removeFavorite = async (req, res, next) => {
  try {
    const { stationId } = req.params;

    const updatedUser = await userModel.findOneAndUpdate(
      { userId: req.user.userId },
      { $pull: { favorites: stationId } },
      { new: true },
    );

    if (!updatedUser) {
      const err = new Error("User not found");
      err.status = 404;
      return next(err);
    }

    res.status(200).json(updatedUser.favorites);
  } catch (error) {
    next(error);
  }
};

export const getCurrentCompany = async (req, res, next) => {
  try {
    const company = await companyModel.findOne({
      companyId: req.user.companyId,
    });
    if (!company) {
      const err = new Error("Company not found");
      err.status = 404;
      return next(err);
    }
    res.status(200).json(company);
  } catch (error) {
    next(error);
  }
};
