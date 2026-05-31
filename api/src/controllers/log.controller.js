import logModel from "../models/log.model.js";
import generateUniqueId from "../utils/utils.js";
import { paginate } from "../utils/paginate.js";
import { success } from "../utils/response.js";

export const getLogs = async (req, res, next) => {
  try {
    const { stationId } = req.query;
    const filter = stationId ? { stationId } : {};
    const result = await paginate(logModel, filter, { page: req.query.page, limit: req.query.limit, sort: { createdAt: -1 } });
    success(res, { data: result });
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
    success(res, { data: newLog, statusCode: 201 });
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
    success(res, { data: { message: "Log deleted successfully" } });
  } catch (error) {
    next(error);
  }
};
