import express from "express";
import {
  login,
  validateToken,
} from "../controllers/auth.controller.js";
import { protect } from "../middleware/auth.middleware.js";

const router = express.Router();

router.post("/login", login);
router.get("/me", protect, validateToken);

export default router;
