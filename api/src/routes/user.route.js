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
router.post("/");
router.patch("/:id", protect, updateUser);
router.delete("/:id", protect, requireRole("admin"), deleteUser);
router.get("/me", protect, getCurrentUser);
router.get("/:id", protect, getUserById);
router.patch("/me", protect, updateOwnUser);
router.patch("/users/:id/role", protect, requireRole("admin"), updateRole);
router.patch("/users/:id", protect, requireRole("admin"), updateUser);
router.post("/me/vehicles", protect, addVehicle);
router.patch("/me/vehicles/:plate", protect, editVehicle);
router.delete("/me/vehicles/:plate", protect, removeVehicle);

export default router;
