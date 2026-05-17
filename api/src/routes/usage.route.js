import { Router } from "express";
import {
  startUsage,
  endUsage,
  getUsage,
  getStationUsages,
  getActiveUsages,
  getActiveUserUsages,
  getAllUsages,
  getUsages,
} from "../controllers/usage.controller.js";
import { protect, requireRole } from "../middleware/auth.middleware.js";

const router = Router();

// Admin routes
router.get("/active", protect, requireRole("admin"), getActiveUsages);
/* router.get("/", protect, requireRole("admin"), getAllUsages); */

// User routes
router.post("/start", protect, startUsage);
router.patch("/:id/end", protect, endUsage);
router.get("/:id", protect, getUsage);
router.get("/user/me/active", protect, getActiveUserUsages);
router.get("/station/:stationId", protect, getStationUsages);
router.get("/", protect, getUsages);

export default router;
