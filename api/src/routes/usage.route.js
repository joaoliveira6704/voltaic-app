import { Router } from "express";
import {
  startUsage,
  endUsage,
  getUsage,
  getActiveUsages,
  getUsages,
} from "../controllers/usage.controller.js";
import { protect, requireRole } from "../middleware/auth.middleware.js";

const router = Router();

router.post("/", protect, startUsage);
router.patch("/:id", protect, endUsage);
router.get("/:id", protect, getUsage);
router.get("/active", protect, requireRole("admin"), getActiveUsages);
router.get("/", protect, getUsages);

export default router;
