import Stations from "../models/Stations.js";

export const getStations = async (req, res, next) => {
  try {
    const stations = await Stations.find();
    console.log(`Found ${stations.length} stations in the database.`);
    res.json(stations);
  } catch (error) {
    next(error);
  }
};

export const createStation = async (req, res, next) => {
  try {
    const { stationId, name, location, capacity } = req.body;
    const newStation = new Stations({
      stationId,
      name,
      location,
      capacity,
    });
    await newStation.save();
    res.status(201).json(newStation);
  } catch (error) {
    next(error);
  }
};

export const deleteStation = async (req, res, next) => {
  try {
    const deletedStation = await Stations.findOneAndDelete({ stationId: req.params.id });
    if (!deletedStation) {
      const err = new Error("Station not found");
      err.status = 404;
      return next(err);
    }
    res.json({ message: "Station deleted successfully" });
  } catch (error) {
    next(error);
  }
};
