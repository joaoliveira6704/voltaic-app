import { Router } from "express";
import {
  getCompanies,
  createCompany,
  deleteCompany,
  updateCompany,
} from "../controllers/companyController.js";

const router = Router();

router.get("/", getCompanies);
router.post("/", createCompany);
router.delete("/:id", deleteCompany);
router.patch("/:id", updateCompany);

export default router;
