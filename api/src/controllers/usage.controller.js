import usageModel from "../models/usage.model.js";
import stationModel from "../models/station.model.js";
import generateUniqueId from "../utils/utils.js";
import { paginate, paginateAggregate } from "../utils/paginate.js";
import { success, error as sendError } from "../utils/response.js";

// POST /usages/start
export const startUsage = async (req, res, next) => {
  try {
    const { stationId, plate } = req.body;
    const userId = req.user?.userId;

    if (!stationId || !plate) {
      const error = new Error("stationId and plate are required");
      error.status = 400;
      return next(error);
    }

    // Atomically claim the station only if it's currently available
    const station = await stationModel.findOneAndUpdate(
      { stationId, state: "available" },
      { state: "unavailable" },
      { new: true },
    );

    if (!station) {
      // Pinpoint if it's missing or just busy without an extra read
      const exists = await stationModel.exists({ stationId });
      const error = exists
        ? new Error("Station is not available")
        : new Error("Station not found");
      error.status = exists ? 400 : 404;
      return next(error);
    }

    const usageId = generateUniqueId();
    const [usage] = await usageModel.create([
      { usageId, userId, stationId, plate, state: "active" },
    ]);

    success(res, { data: usage, statusCode: 201 });
  } catch (error) {
    next(error);
  }
};

// PATCH /usages/:id/end
export const endUsage = async (req, res, next) => {
  try {
    // Atomically complete the usage only if it's not already completed
    const usage = await usageModel.findOneAndUpdate(
      { usageId: req.params.id, state: { $ne: "completed" } },
      { state: "completed", endTime: new Date() },
      { new: true },
    );

    if (!usage) {
      const exists = await usageModel.exists({ usageId: req.params.id });
      const error = exists
        ? new Error("Usage already completed")
        : new Error("Usage not found");
      error.status = exists ? 400 : 404;
      return next(error);
    }

    // Free up the station
    await stationModel.findOneAndUpdate(
      { stationId: usage.stationId },
      { state: "available" },
    );

    success(res, { data: usage });
  } catch (error) {
    next(error);
  }
};

// GET /usages/:id
export const getUsage = async (req, res, next) => {
  try {
    const usage = await usageModel.findOne({ usageId: req.params.id }).lean();
    if (!usage) {
      const error = new Error("Usage not found");
      error.status = 404;
      return next(error);
    }
    success(res, { data: usage });
  } catch (error) {
    next(error);
  }
};

// GET /usages
export const getUsages = async (req, res, next) => {
  try {
    const { userId, active } = req.query;

    if (userId && userId === req.user?.userId) {
      const matchQuery = active ? { userId, endTime: null } : { userId };
      const pipeline = buildUsagePipeline(matchQuery);
      const result = await paginateAggregate(usageModel, pipeline, {
        page: req.query.page,
        limit: req.query.limit,
      });
      return success(res, { data: result });
    }

    const err = new Error("Invalid user");
    err.status = 403;
    return next(err);
  } catch (error) {
    next(error);
  }
};

// GET /users/me/usages
export const getActiveUserUsages = async (req, res, next) => {
  try {
    const result = await paginate(
      usageModel,
      { userId: req.user.userId, endTime: null },
      { page: req.query.page, limit: req.query.limit, sort: { createdAt: -1 } },
    );
    success(res, { data: result });
  } catch (error) {
    next(error);
  }
};

// GET /stations/:stationId/usages
export const getStationUsages = async (req, res, next) => {
  try {
    const result = await paginate(
      usageModel,
      { stationId: req.params.stationId },
      { page: req.query.page, limit: req.query.limit, sort: { createdAt: -1 } },
    );
    success(res, { data: result });
  } catch (error) {
    next(error);
  }
};

// GET /usages?state=active (admin)
export const getActiveUsages = async (req, res, next) => {
  try {
    const result = await paginate(
      usageModel,
      { state: "active" },
      { page: req.query.page, limit: req.query.limit, sort: { createdAt: -1 } },
    );
    success(res, { data: result });
  } catch (error) {
    next(error);
  }
};

// Usage aggregation pipeline builder
const buildUsagePipeline = (matchQuery) => [
  { $match: matchQuery },
  {
    $lookup: {
      from: "stations",
      localField: "stationId",
      foreignField: "stationId",
      as: "stationDetails",
    },
  },
  {
    $addFields: {
      stationObj: { $arrayElemAt: ["$stationDetails", 0] },
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
                    hours: { $floor: { $divide: ["$$totalMinutes", 60] } },
                    minutes: { $mod: ["$$totalMinutes", 60] },
                  },
                  in: {
                    $cond: {
                      if: { $eq: ["$$hours", 0] },
                      then: { $concat: [{ $toString: "$$minutes" }, "m"] },
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
  {
    $project: {
      usageId: 1,
      userId: 1,
      plate: 1,
      createdAt: 1,
      duration: 1,
      state: 1,
      endTime: 1,
      stationId: 1,
      _id: 0,
      stationName: { $ifNull: ["$stationObj.title", "Unknown"] },
    },
  },
  { $sort: { createdAt: -1 } },
];
