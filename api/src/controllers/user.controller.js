import userModel from "../models/user.model.js";
import stationModel from "../models/station.model.js";
import generateUniqueId from "../utils/utils.js";
import companyModel from "../models/company.model.js";
import { paginate } from "../utils/paginate.js";
import { success, error as sendError } from "../utils/response.js";

const userSortFieldMap = {
  username: "username",
  name: "firstName",
  email: "email",
  role: "role",
  company: "companyName",
  vehicles: "vehicleQuantity",
};

const parseUserSort = (sort) => {
  if (!sort) return { createdAt: -1 };
  const [field, direction] = sort.split(":");
  const sortField = userSortFieldMap[field] || "createdAt";
  return { [sortField]: direction === "asc" ? 1 : -1 };
};

export const getUsers = async (req, res, next) => {
  try {
    const { view, search, sort, role } = req.query;

    if (view === "dashboard") {
      const total = await userModel.countDocuments();
      return success(res, { data: { total } });
    }

    if (view === "admin") {
      const pageNum = Math.max(1, parseInt(req.query.page) || 1);
      const limitNum = Math.min(
        100,
        Math.max(1, parseInt(req.query.limit) || 20),
      );
      const skip = (pageNum - 1) * limitNum;

      const pipeline = [
        ...(role ? [{ $match: { role } }] : []),
        {
          $lookup: {
            from: "companies",
            localField: "companyId",
            foreignField: "companyId",
            as: "company",
          },
        },
        {
          $addFields: {
            companyName: { $arrayElemAt: ["$company.name", 0] },
            vehicleQuantity: { $size: { $ifNull: ["$vehicles", []] } },
            isWorkerOrManager: {
              $in: ["$role", ["worker", "company-manager"]],
            },
          },
        },
        ...(search
          ? [
              {
                $match: {
                  $or: [
                    { username: { $regex: search, $options: "i" } },
                    { firstName: { $regex: search, $options: "i" } },
                    { lastName: { $regex: search, $options: "i" } },
                    { email: { $regex: search, $options: "i" } },
                  ],
                },
              },
            ]
          : []),
        {
          $project: {
            _id: 0,
            userId: 1,
            firstName: 1,
            lastName: 1,
            username: 1,
            email: 1,
            role: 1,
            companyName: 1,
            vehicleQuantity: 1,
            isWorkerOrManager: 1,
          },
        },
        { $sort: parseUserSort(sort) },
      ];

      const [countResult, data] = await Promise.all([
        userModel.aggregate([...pipeline, { $count: "total" }]),
        userModel.aggregate([
          ...pipeline,
          { $skip: skip },
          { $limit: limitNum },
        ]),
      ]);

      const total = countResult[0]?.total || 0;

      return success(res, {
        data: { data, page: pageNum, limit: limitNum, total, pages: Math.ceil(total / limitNum) },
      });
    }

    const filter = {};
    if (req.query.companyId) filter.companyId = req.query.companyId;
    if (req.query.search) {
      filter.$or = [
        { username: { $regex: req.query.search, $options: "i" } },
        { email: { $regex: req.query.search, $options: "i" } },
      ];
    }

    const result = await paginate(userModel, filter, {
      page: req.query.page,
      limit: req.query.limit,
    });
    success(res, { data: result });
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
    success(res, { message: "User deleted successfully" });
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
    success(res, { message: "User deleted successfully" });
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
    success(res, { data: updatedUser });
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
      console.log("Getting user profile", userId);
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
        {
          $unwind: {
            path: "$companyData",
            preserveNullAndEmptyArrays: true, // This keeps the user if companyData is empty
          },
        },
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

      return success(res, { data: userProfile[0] });
    }
    if (!user) {
      const err = new Error("User not found");
      err.status = 404;
      return next(err);
    }
    success(res, { data: user });
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
    success(res, { data: user });
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

    success(res, { data: updatedUser });
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
    const allowedRoles =
      req.user.role === "admin"
        ? ["client", "worker", "company-manager", "admin"]
        : ["worker", "company-manager"];

    if (!allowedRoles.includes(req.body.role)) {
      const err = new Error("Cannot assign this role");
      err.status = 403;
      return next(err);
    }

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
    success(res, { data: updatedUser });
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
    success(res, { data: user.vehicles });
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

    const currentUser = await userModel.findOne({ userId: req.user.userId });
    if (currentUser && currentUser.vehicles.length >= 4) {
      let err = new Error();
      err.status = 400;
      err.message = "Maximum of 4 vehicles per user";
      return next(err);
    }

    console.log("Adding vehicle", plate, model, color, connector, slug);
    const updatedUser = await userModel.findOneAndUpdate(
      { userId: req.user.userId },
      {
        $push: {
          vehicles: { plate, model, color, connector, slug },
        },
      },
      { new: true },
    );

    success(res, { data: updatedUser, statusCode: 201 });
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

    success(res, { data: updatedUser });
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
    success(res, { data: updatedUser });
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
    success(res, { data: user.favorites });
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
    success(res, { data: stations });
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

    success(res, { data: updatedUser.favorites, statusCode: 201 });
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

    success(res, { data: updatedUser.favorites });
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
    success(res, { data: company });
  } catch (error) {
    next(error);
  }
};
