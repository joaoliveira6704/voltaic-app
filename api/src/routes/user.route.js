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
  getVehicles,
  getFavorites,
  deleteOwnUser,
  addFavourite,
  removeFavorite,
} from "../controllers/user.controller.js";
import {
  checkOwnership,
  protect,
  requireRole,
} from "../middleware/auth.middleware.js";
import userModel from "../models/user.model.js";

const router = Router();

router.post("/");
router.get("/", getUsers);

router.get("/me", protect, getCurrentUser);
router.patch("/me", protect, updateOwnUser);
router.delete("/me", protect, deleteOwnUser);

router.get("/me/favourites", protect, getFavorites);
router.post("/me/favorites", protect, addFavorite);
router.delete("/me/favorites/:stationId", protect, removeFavorite);

router.get("/me/vehicles", protect, getVehicles);
router.post("/me/vehicles", protect, addVehicle);
router.patch("/me/vehicles/:plate", protect, editVehicle);
router.delete("/me/vehicles/:plate", protect, removeVehicle);

router.get("/:id", protect, getUserById);
router.patch("/:id", protect, requireRole("admin"), updateUser);
router.delete("/:id", protect, requireRole("admin"), deleteUser);

router.patch(
  "/:id/role",
  protect,
  requireRole("admin", "company-manager"),
  checkOwnership(userModel),
  updateRole,
);

export default router;
