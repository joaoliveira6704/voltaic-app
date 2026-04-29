import { Router } from "express";
import {
  getUsers,
  deleteUser,
  updateUser,
  getCurrentUser,
  getUserById,
} from "../controllers/user.controller.js";
import { protect } from "../middleware/auth.middleware.js";

const router = Router();

router.get("/", getUsers);
router.put("/:id", protect, updateUser);
router.delete("/:id", protect, deleteUser);
router.get("/me", protect, getCurrentUser);
router.get("/:id", protect, getUserById);

export default router;
