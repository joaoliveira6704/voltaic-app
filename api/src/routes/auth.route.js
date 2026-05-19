import express from "express";
import {
  login,
  validateToken,
  createResetToken,
  validateResetToken,
  resetPassword,
} from "../controllers/auth.controller.js";
import { protect } from "../middleware/auth.middleware.js";

const router = express.Router();

router.post("/login", login);
router.post("/validate-token", protect, validateToken);
router.post("/forgot-password", createResetToken);
router.post("/forgot-password/:token", validateResetToken);
router.post("/reset-password", resetPassword);
router.get("/me", protect, validateToken);

export default router;
