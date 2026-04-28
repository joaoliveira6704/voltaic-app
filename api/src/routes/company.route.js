import { Router } from "express";
import {
  getCompanies,
  createCompany,
  deleteCompany,
  updateCompany,
} from "../controllers/company.controller.js";

const router = Router();

router.get("/", getCompanies);
router.post("/", createCompany);
router.delete("/:id", deleteCompany);
router.patch("/:id", updateCompany);

export default router;
