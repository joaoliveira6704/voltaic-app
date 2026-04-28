import { Router } from "express";
import { getVehicles } from "../controllers/vehicle.controller";

const router = Router();

router.get("/", getVehicles);

export default router;
