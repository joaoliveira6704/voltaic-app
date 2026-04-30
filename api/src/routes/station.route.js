import { Router } from "express";
import {
  getStations,
  createStation,
  deleteStation,
  updateStation,
  getStationById,
} from "../controllers/station.controller.js";
import { protect } from "../middleware/auth.middleware";

const router = Router();

router.get("/", getStations);
router.post("/", createStation);
router.delete("/:id", deleteStation);
router.patch("/:id", updateStation);
router.get("/:id", protect, getStationById);

export default router;
