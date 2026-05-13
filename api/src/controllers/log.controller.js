import logModel from "../models/log.model.js";
import generateUniqueId from "../utils/utils.js";

export const getLogs = async (req, res, next) => {
  const { stationId } = req.query;
  if (stationId) {
    try {
      const logs = await logModel.find({ stationId });
      console.log(`Found ${logs.length} logs for station ${stationId}.`);
      res.json(logs);
    } catch (error) {
      next(error);
    }
  }
  try {
    const logs = await logModel.find();
    console.log(`Found ${logs.length} logs in the database.`);
    res.json(logs);
  } catch (error) {
    next(error);
  }
};

export const createLog = async (req, res, next) => {
  try {
    const { type, action, details } = req.body;

    const newLog = new logModel({
      type,
      action,
      details,
    });
    await newLog.save();
    res.status(201).json(newLog);
  } catch (error) {
    next(error);
  }
};

export const deleteLog = async (req, res, next) => {
  try {
    const deletedLog = await logModel.findOneAndDelete({
      userId: req.params.id,
    });
    if (!deletedLog) {
      const err = new Error("Log not found");
      err.status = 404;
      return next(err);
    }
    res.json({ message: "Log deleted successfully" });
  } catch (error) {
    next(error);
  }
};
