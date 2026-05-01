// routes/admin.routes.js
import { Router } from "express";
import { protect, requireRole } from "../middleware/auth.js";
import {
  deleteUser,
  updateUser,
  updateRole,
} from "../controllers/user.controller.js";
import { createCompany } from "../controllers/company.controller.js";
import {
  createStation,
  updateStation,
} from "../controllers/station.controller.js";

const router = Router();

router.use(protect, requireRole("admin"));

router.patch("/users", updateUser);
router.delete("/users/:id", deleteUser);
router.patch("/users/:id/role", updateRole);
router.post("/companies", createCompany);
router.post("/stations", createStation);
router.patch("/stations/:id", updateStation);

export default router;
