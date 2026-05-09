import { Router } from "express";
import {
  getCompanies,
  createCompany,
  deleteCompany,
  updateCompany,
  getCompanyById,
} from "../controllers/company.controller.js";
import {
  protect,
  requireRole,
  checkOwnership,
} from "../middleware/auth.middleware.js";
import companyModel from "../models/company.model.js";

const router = Router();

router.get("/", getCompanies);
router.post("/", protect, requireRole("admin"), createCompany);
router.delete(
  "/:id",
  protect,
  requireRole("admin", "company-manager"),
  checkOwnership(companyModel),
  deleteCompany,
);
router.patch(
  "/:id",
  protect,
  requireRole("admin", "company-manager"),
  checkOwnership(companyModel),
  updateCompany,
);
router.get("/:id", protect, getCompanyById);

export default router;
