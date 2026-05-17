import VehiclesModel from "../models/vehicle.model.js";
import { paginate } from "../utils/paginate.js";

export const getVehicles = async (req, res, next) => {
  try {
    const result = await paginate(VehiclesModel, {}, { page: req.query.page, limit: req.query.limit });
    res.json(result);
  } catch (error) {
    next(error);
  }
};
