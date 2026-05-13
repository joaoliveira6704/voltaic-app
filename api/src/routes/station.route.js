import { Router } from "express";
import {
  getStations,
  createStation,
  deleteStation,
  updateStation,
  getStationById,
  getStationsByRadius,
  executeStationCommand,
} from "../controllers/station.controller.js";
import {
  checkOwnership,
  protect,
  requireRole,
} from "../middleware/auth.middleware.js";
import stationModel from "../models/station.model.js";

const router = Router();

router.get("/", getStations);
router.post("/", protect, requireRole("admin"), createStation);
router.delete("/:id", protect, requireRole("admin"), deleteStation);
router.patch(
  "/:id",
  protect,
  requireRole("admin", "company-manager", "worker"),
  checkOwnership(stationModel),
  updateStation,
);
router.get("/:id", protect, getStationById);
router.get("/radius/:lat/:lng/:distance", getStationsByRadius);
router.post(
  "/:stationId/execute",
  protect,
  requireRole("admin", "worker", "company-manager"),
  executeStationCommand,
);

export default router;
