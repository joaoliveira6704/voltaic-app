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
  checkCompanyOwnership,
} from "../middleware/auth.middleware";

const router = Router();

router.get("/", getCompanies);
router.post("/", protect, requireRole("admin"), createCompany);
router.delete(
  "/:id",
  protect,
  requireRole("admin", "company-manager"),
  checkCompanyOwnership,
  deleteCompany,
);
router.patch(
  "/:id",
  protect,
  requireRole("admin", "company-manager"),
  checkCompanyOwnership,
  updateCompany,
);
router.get("/:id", protect, getCompanyById);

export default router;
