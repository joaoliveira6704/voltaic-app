import { Router } from "express";
import {
  getCompanies,
  createCompany,
  deleteCompany,
  updateCompany,
  getCompanyById,
} from "../controllers/company.controller.js";
import { protect } from "../middleware/auth.middleware";

const router = Router();

router.get("/", getCompanies);
router.post("/", createCompany);
router.delete("/:id", deleteCompany);
router.patch("/:id", updateCompany);
router.get("/:id", protect, getCompanyById);

export default router;
