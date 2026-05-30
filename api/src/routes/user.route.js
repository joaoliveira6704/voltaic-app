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
  getFavoriteStations,
  deleteOwnUser,
  addFavorite,
  removeFavorite,
  updateRole,
  getCurrentCompany,
} from "../controllers/user.controller.js";
import { register } from "../controllers/auth.controller.js";
import { getActiveUserUsages } from "../controllers/usage.controller.js";
import {
  getMyTickets,
  getCompanyTickets,
} from "../controllers/ticket.controller.js";
import { getCompanyStations } from "../controllers/station.controller.js";
import {
  checkOwnership,
  protect,
  requireRole,
} from "../middleware/auth.middleware.js";
import userModel from "../models/user.model.js";

const router = Router();

router.get("/", protect, requireRole("admin", "company-manager"), getUsers);
router.post("/", register);

router.get("/me", protect, getCurrentUser);
router.patch("/me", protect, updateOwnUser);
router.delete("/me", protect, deleteOwnUser);

router.get("/me/favorites", protect, getFavorites);
router.post("/me/favorites", protect, addFavorite);
router.get("/me/favorites/stations", protect, getFavoriteStations);
router.delete("/me/favorites/:stationId", protect, removeFavorite);

router.get(
  "/me/company",
  protect,
  requireRole("company-manager", "worker"),
  getCurrentCompany,
);
router.get(
  "/me/company/stations",
  protect,
  requireRole("company-manager", "worker"),
  getCompanyStations,
);
router.get(
  "/me/company/tickets",
  protect,
  requireRole("company-manager", "worker"),
  getCompanyTickets,
);

router.get("/me/vehicles", protect, getVehicles);
router.post("/me/vehicles", protect, addVehicle);
router.patch("/me/vehicles/:plate", protect, editVehicle);
router.delete("/me/vehicles/:plate", protect, removeVehicle);

router.get("/me/usages", protect, getActiveUserUsages);
router.get("/me/tickets", protect, getMyTickets);

router.get("/:id", protect, getUserById);
router.patch(
  "/:id",
  protect,
  requireRole("admin", "company-manager"),
  updateUser,
);
router.delete("/:id", protect, requireRole("admin"), deleteUser);

router.patch(
  "/:id/role",
  protect,
  requireRole("admin", "company-manager"),
  checkOwnership(userModel),
  updateRole,
);

export default router;
