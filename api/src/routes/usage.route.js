import { Router } from "express";
import {
  getUsage,
  getUsageById,
  getUsageByStationId,
  getUsageByUserId,
} from "../controllers/usage.controller.js";
import { protect } from "../middleware/auth.middleware.js";

const router = Router();

router.get("/", getUsage);
router.get("/:id", protect, getUsageById);
router.get("/station/:stationId", protect, getUsageByStationId);
router.get("/user/:userId", protect, getUsageByUserId);

export default router;
