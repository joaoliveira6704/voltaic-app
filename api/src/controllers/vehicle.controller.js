import VehiclesModel from "../models/vehicle.model.js";
import { success } from "../utils/response.js";
import { wrap } from "../utils/cache.js";

const CACHE_KEY = "vehicles:catalog";
const CACHE_TTL = 3600; // 1 hour

export const getVehicles = async (req, res, next) => {
  try {
    const vehicles = await wrap(CACHE_KEY, async () => {
      return await VehiclesModel.find(
        {},
        { make: 1, model: 1, charge_ports: 1, year: 1, _id: 1 },
      ).lean();
    }, CACHE_TTL);
    success(res, { data: vehicles });
  } catch (error) {
    next(error);
  }
};
