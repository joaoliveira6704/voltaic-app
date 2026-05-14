import { Router } from "express";
import {
  getStations,
  getCompanyStations,
  createStation,
  deleteStation,
  updateStation,
  getStationById,
  getStationsByRadius,
  executeStationCommand,
  checkStationOwnership,
} from "../controllers/station.controller.js";
import {
  protect,
  requireRole,
} from "../middleware/auth.middleware.js";

const router = Router();

router.get("/", getStations);
router.post("/", protect, requireRole("admin"), createStation);
router.delete("/:id", protect, requireRole("admin"), deleteStation);
router.patch(
  "/:id",
  protect,
  requireRole("admin", "company-manager", "worker"),
  checkStationOwnership,
  updateStation,
);
router.get("/company", protect, getCompanyStations);
router.get("/radius/:lat/:lng/:distance", getStationsByRadius);
router.get("/:id", protect, getStationById);
router.post(
  "/:stationId/execute",
  protect,
  requireRole("admin", "worker", "company-manager"),
  executeStationCommand,
);

export default router;
