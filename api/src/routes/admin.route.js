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

export default router;
