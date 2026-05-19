import { Router } from "express";
import {
  getLogs,
  createLog,
  deleteLog,
} from "../controllers/log.controller.js";
import { protect, requireRole } from "../middleware/auth.middleware.js";

const router = Router();

router.get("/", protect, getLogs);
router.post("/", protect, createLog);
router.delete("/:id", protect, requireRole("admin"), deleteLog);

export default router;
