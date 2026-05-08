import { Router } from "express";
import { getVehicles } from "../controllers/vehicle.controller.js";

const router = Router();

router.get("/", getVehicles);

export default router;
