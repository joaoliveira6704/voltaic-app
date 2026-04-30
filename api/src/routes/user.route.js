import { Router } from "express";
import {
  getUsers,
  deleteUser,
  updateUser,
  getCurrentUser,
  updateOwnUser,
  addVehicle,
  getUserById,
  removeVehicle,
} from "../controllers/user.controller.js";
import { protect } from "../middleware/auth.middleware.js";

const router = Router();

router.get("/", getUsers);
router.put("/:id", protect, updateUser);
router.delete("/:id", protect, deleteUser);
router.get("/me", protect, getCurrentUser);
router.get("/:id", protect, getUserById);
router.patch("/me", protect, updateOwnUser);
router.post("/me/vehicles", protect, addVehicle);
router.delete("/me/vehicles/:plate", protect, removeVehicle);

export default router;
