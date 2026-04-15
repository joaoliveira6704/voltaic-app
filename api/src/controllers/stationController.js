import Stations from "../models/Stations.js";
import generateUniqueId from "../utils/utils.js";

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
    const { title, location, connector, state, alive } = req.body;
    const newStation = new Stations({
      stationId: generateUniqueId(),
      title,
      location,
      connector,
      state,
      alive,
    });
    await newStation.save();
    res.status(201).json({ stationId: newStation.stationId });
  } catch (error) {
    next(error);
  }
};

export const deleteStation = async (req, res, next) => {
  try {
    const deletedStation = await Stations.findOneAndDelete({
      stationId: req.params.id,
    });
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

export const updateStation = async (req, res, next) => {
  try {
    const updatedStation = await Stations.findOneAndUpdate(
      { stationId: req.params.id },
      req.body,
      { new: true },
    );
    if (!updatedStation) {
      const err = new Error("Station not found");
      err.status = 404;
      return next(err);
    }
    res.json(updatedStation);
  } catch (error) {
    next(error);
  }
};
