import usageModel from "../models/usage.model.js";
import stationModel from "../models/station.model.js";
import generateUniqueId from "../utils/utils.js";
import mongoose from "mongoose";

// POST /usages/start
export const startUsage = async (req, res, next) => {
  const session = await mongoose.startSession();
  session.startTransaction();
  try {
    const { stationId, plate } = req.body;
    const userId = req.user.userId;

    if (!stationId || !plate) {
      const error = new Error("stationId and plate are required");
      error.status = 400;
      await session.abortTransaction();
      return next(error);
    }

    const station = await stationModel.findOne({ stationId }).session(session);
    if (!station) {
      const error = new Error("Station not found");
      error.status = 404;
      await session.abortTransaction();
      return next(error);
    }
    if (station.state !== "available") {
      const error = new Error("Station is not available");
      error.status = 400;
      await session.abortTransaction();
      return next(error);
    }

    const usageId = generateUniqueId();
    const [usage] = await usageModel.create(
      [{ usageId, userId, stationId, plate }],
      { session }
    );

    await stationModel.findOneAndUpdate(
      { stationId },
      { state: "unavailable" },
      { session }
    );

    await session.commitTransaction();
    res.status(201).json(usage);
  } catch (error) {
    await session.abortTransaction();
    next(error);
  } finally {
    session.endSession();
  }
};

// PATCH /usages/:id/end
export const endUsage = async (req, res, next) => {
  const session = await mongoose.startSession();
  session.startTransaction();
  try {
    const usage = await usageModel.findOne({ usageId: req.params.id }).session(session);
    if (!usage) {
      const error = new Error("Usage not found");
      error.status = 404;
      await session.abortTransaction();
      return next(error);
    }
    if (usage.state === "completed") {
      const error = new Error("Usage already completed");
      error.status = 400;
      await session.abortTransaction();
      return next(error);
    }

    usage.endTime = new Date();
    usage.state = "completed";
    await usage.save({ session });

    await stationModel.findOneAndUpdate(
      { stationId: usage.stationId },
      { state: "available" },
      { session }
    );

    await session.commitTransaction();
    res.status(200).json(usage);
  } catch (error) {
    await session.abortTransaction();
    next(error);
  } finally {
    session.endSession();
  }
};

// GET /usages/:id
export const getUsage = async (req, res, next) => {
  try {
    const usage = await usageModel.findOne({ usageId: req.params.id });
    if (!usage) {
      const error = new Error("Usage not found");
      error.status = 404;
      return next(error);
    }
    res.status(200).json(usage);
  } catch (error) {
    next(error);
  }
};

// GET /usages/user/me
export const getUserUsages = async (req, res, next) => {
  try {
    const usages = await usageModel
      .find({ userId: req.user.userId })
      .sort({ createdAt: -1 });
    res.status(200).json(usages);
  } catch (error) {
    next(error);
  }
};

// GET /usages/station/:stationId
export const getStationUsages = async (req, res, next) => {
  try {
    const usages = await usageModel
      .find({ stationId: req.params.stationId })
      .sort({ createdAt: -1 });
    res.status(200).json(usages);
  } catch (error) {
    next(error);
  }
};

// GET /usages/active  (admin)
export const getActiveUsages = async (req, res, next) => {
  try {
    const usages = await usageModel
      .find({ state: "active" })
      .sort({ createdAt: -1 });
    res.status(200).json(usages);
  } catch (error) {
    next(error);
  }
};

// GET /usages  (admin)
export const getAllUsages = async (req, res, next) => {
  try {
    const usages = await usageModel
      .find()
      .sort({ createdAt: -1 });
    res.status(200).json(usages);
  } catch (error) {
    next(error);
  }
};
