import VehiclesModel from "../models/vehicle.model";

export const getVehicles = async (req, res, next) => {
  try {
    const vehicles = await VehiclesModel.find();
    console.log(`Found ${vehicles.length} vehicles in the database.`);
    res.json(vehicles);
  } catch (error) {
    next(error);
  }
};
