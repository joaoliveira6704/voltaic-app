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
  editVehicle,
} from "../controllers/user.controller.js";
import { protect, requireRole } from "../middleware/auth.middleware.js";

const router = Router();

router.get("/", getUsers);
router.put("/:id", protect, updateUser);
router.delete("/:id", protect, requireRole("admin", "client"), deleteUser);
router.get("/me", protect, getCurrentUser);
router.get("/:id", protect, getUserById);
router.patch("/me", protect, updateOwnUser);
router.post("/me/vehicles", protect, addVehicle);
router.patch("/me/vehicles/:plate", protect, editVehicle);
router.delete("/me/vehicles/:plate", protect, removeVehicle);

export default router;
