import VehiclesModel from "../models/vehicle.model.js";
import { success } from "../utils/response.js";

export const getVehicles = async (req, res, next) => {
  try {
    const vehicles = await VehiclesModel.find(
      {},
      { make: 1, model: 1, charge_ports: 1, year: 1, _id: 1 },
    ).lean();
    success(res, { data: vehicles });
  } catch (error) {
    next(error);
  }
};
