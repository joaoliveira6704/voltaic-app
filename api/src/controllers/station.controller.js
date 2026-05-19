import stationModel from "../models/station.model.js";
import companyModel from "../models/company.model.js";
import logModel from "../models/log.model.js";
import generateUniqueId from "../utils/utils.js";
import { paginate } from "../utils/paginate.js";

export const getStations = async (req, res, next) => {
  try {
    const { near, maxDistance, view } = req.query;

    if (view === "dashboard") {
      const stats = await stationModel.aggregate([
        {
          $group: {
            _id: null,
            total: { $sum: 1 },
            available: {
              $sum: { $cond: [{ $eq: ["$state", "available"] }, 1, 0] },
            },
            unavailable: {
              $sum: { $cond: [{ $eq: ["$state", "unavailable"] }, 1, 0] },
            },
            maintenance: {
              $sum: { $cond: [{ $eq: ["$state", "maintenance"] }, 1, 0] },
            },
            alive: { $sum: { $cond: ["$alive", 1, 0] } },
          },
        },
      ]);
      return res.json(
        stats[0] || {
          total: 0,
          available: 0,
          unavailable: 0,
          maintenance: 0,
          alive: 0,
        },
      );
    }

    if (near) {
      const [lat, lng] = near.split(",").map(parseFloat);
      const distance = parseFloat(maxDistance || "10");
      const radius = distance / 6378;

      const result = await paginate(stationModel, {
        location: {
          $geoWithin: {
            $centerSphere: [[lng, lat], radius],
          },
        },
      }, { page: req.query.page, limit: req.query.limit });

      return res.json(result);
    }

    const result = await paginate(stationModel, {}, { page: req.query.page, limit: req.query.limit });
    res.json(result);
  } catch (error) {
    next(error);
  }
};

export const createStation = async (req, res, next) => {
  try {
    const { title, location, connector, state, alive } = req.body;
    const newStation = new stationModel({
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
    const deletedStation = await stationModel.findOneAndDelete({
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
    const updatedStation = await stationModel.findOneAndUpdate(
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

export const getCompanyStations = async (req, res, next) => {
  try {
    const company = await companyModel.findOne({ companyId: req.user.companyId });
    if (!company) {
      return res.json([]);
    }
    const stations = await stationModel.find({ groupId: { $in: company.groups } });
    res.json(stations);
  } catch (error) {
    next(error);
  }
};

export const checkStationOwnership = async (req, res, next) => {
  if (req.user.role === "admin") return next();

  const station = await stationModel.findOne({ stationId: req.params.id });
  if (!station) {
    const err = new Error("Station not found");
    err.status = 404;
    return next(err);
  }

  const company = await companyModel.findOne({ companyId: req.user.companyId });
  if (!company || !company.groups.includes(station.groupId)) {
    const err = new Error("Access denied.");
    err.status = 403;
    return next(err);
  }

  next();
};

export const getStationById = async (req, res, next) => {
  try {
    const station = await stationModel.findOne({ stationId: req.params.id });
    if (!station) {
      const err = new Error("Station not found");
      err.status = 404;
      return next(err);
    }
    res.json(station);
  } catch (error) {
    next(error);
  }
};

export const executeStationCommand = async (req, res, next) => {
  try {
    const { stationId } = req.params;
    const { command } = req.body;
    const userId = req.user?.id ?? null;

    const station = await stationModel.findOne({ stationId });
    if (!station) {
      const err = new Error("Station not found");
      err.status = 404;
      return next(err);
    }

    console.log("Executing command:", command, "for station:", stationId);

    if (command === "start") {
      await startStation(station);
      await logModel.create({
        userId,
        stationId,
        type: "info",
        action: "start",
        details: "Station started successfully",
      });
      res.json({ message: "Station started" });
    } else if (command === "restart") {
      await restartStation(station);
      await logModel.create({
        userId,
        stationId,
        type: "info",
        action: "restart",
        details: "Station restarted successfully",
      });
      res.json({ message: "Station restarted" });
    } else if (command === "shutdown") {
      await shutdownStation(station);
      await logModel.create({
        userId,
        stationId,
        type: "info",
        action: "shutdown",
        details: "Station shut down successfully",
      });
      res.json({ message: "Station shutdown" });
    } else {
      await logModel.create({
        userId,
        stationId,
        type: "critical",
        action: command,
        details: `Unknown command: ${command}`,
      });
      const result = await station.executeCommand(command);
      res.json(result);
    }
  } catch (error) {
    // Log failures too
    try {
      await logModel.create({
        userId: req.user?.id ?? null,
        stationId: req.params.stationId,
        type: "critical",
        action: req.body?.command ?? "unknown",
        details: `Command failed: ${error.message}`,
      });
    } catch (_) {}
    next(error);
  }
};

const restartStation = async (station) => {
  await stationModel.updateOne(
    { stationId: station.stationId },
    { $set: { state: "maintenance" } },
  );

  await new Promise((resolve) => setTimeout(resolve, 6000));

  await stationModel.updateOne(
    { stationId: station.stationId },
    { $set: { state: "available", alive: true } },
  );
};

const shutdownStation = async (station) => {
  await stationModel.updateOne(
    { stationId: station.stationId },
    { $set: { state: "maintenance", alive: false } },
  );
};

const startStation = async (station) => {
  await stationModel.updateOne(
    { stationId: station.stationId },
    { $set: { state: "available", alive: true } },
  );
};
