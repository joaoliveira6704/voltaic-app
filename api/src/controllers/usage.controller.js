import usageModel from "../models/usage.model.js";
import generateUniqueId from "../utils/utils.js";

export const getUsage = async (req, res, next) => {
  try {
    const usage = await usageModel.find();

    console.log(`Found ${usage.length} usage records in the database.`);
    res.json(usage);
  } catch (error) {
    next(error);
  }
};

export const getUsageById = async (req, res, next) => {
  try {
    const usage = await usageModel.findOne({ stationUsageId: req.params.id });
    if (!usage) {
      const err = new Error("Usage record not found");
      err.status = 404;
      return next(err);
    }
    res.json(usage);
  } catch (error) {
    next(error);
  }
};

export const getUsageByStationId = async (req, res, next) => {
  try {
    const usage = await usageModel.find({ stationId: req.params.id });
    if (!usage) {
      const err = new Error("Usage record not found");
      err.status = 404;
      return next(err);
    }
    res.json(usage);
  } catch (error) {
    next(error);
  }
};

export const getUsageByUserId = async (req, res, next) => {
  try {
    const usage = await usageModel.find({ userId: req.params.userId });
    console.log(
      `Found ${usage.length} usage records for user ${req.params.userId}.`,
    );
    if (!usage) {
      const err = new Error("Usage record not found");
      err.status = 404;
      return next(err);
    }
    res.json(usage);
  } catch (error) {
    next(error);
  }
};
