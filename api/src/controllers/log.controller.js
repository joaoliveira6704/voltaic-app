import logModel from "../models/log.model.js";
import generateUniqueId from "../utils/utils.js";
import { paginate } from "../utils/paginate.js";

export const getLogs = async (req, res, next) => {
  try {
    const { stationId } = req.query;
    const filter = stationId ? { stationId } : {};
    const result = await paginate(logModel, filter, { page: req.query.page, limit: req.query.limit, sort: { createdAt: -1 } });
    res.json(result);
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
      _id: req.params.id,
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
