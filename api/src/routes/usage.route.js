import { Router } from "express";
import {
  startUsage,
  endUsage,
  getUsage,
  getUserUsages,
  getStationUsages,
  getActiveUsages,
  getAllUsages,
} from "../controllers/usage.controller.js";
import { protect, requireRole } from "../middleware/auth.middleware.js";

const router = Router();

// Admin routes
router.get("/active", protect, requireRole("admin"), getActiveUsages);
router.get("/", protect, requireRole("admin"), getAllUsages);

// User routes
router.post("/start", protect, startUsage);
router.patch("/:id/end", protect, endUsage);
router.get("/:id", protect, getUsage);
router.get("/user/me", protect, getUserUsages);
router.get("/station/:stationId", protect, getStationUsages);

export default router;
