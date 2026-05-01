import { Router } from "express";
import {
  getStations,
  createStation,
  deleteStation,
  updateStation,
  getStationById,
} from "../controllers/station.controller.js";
import { protect, requireRole } from "../middleware/auth.middleware";

const router = Router();

router.get("/", getStations);
router.post("/", protect, requireRole("admin"), createStation);
router.delete("/:id", deleteStation);
router.patch("/:id", protect, requireRole("admin", "worker"), updateStation);
router.get("/:id", protect, getStationById);

export default router;
