import { Router } from "express";
import {
  getCompanies,
  createCompany,
  deleteCompany,
  updateCompany,
  getCompanyById,
  getCompanyGroups,
  assignGroup,
  unassignGroup,
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

router.get("/:id/groups", protect, getCompanyGroups);
router.patch("/:id/groups/assign", protect, requireRole("admin"), assignGroup);
router.patch(
  "/:id/groups/unassign",
  protect,
  requireRole("admin"),
  unassignGroup,
);

export default router;
