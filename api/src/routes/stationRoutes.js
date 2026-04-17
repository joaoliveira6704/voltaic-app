import { Router } from "express";
import {
  getStations,
  createStation,
  deleteStation,
  updateStation,
} from "../controllers/stationController.js";

const router = Router();

router.get("/", getStations);
router.post("/", createStation);
router.delete("/:id", deleteStation);
router.patch("/:id", updateStation);

export default router;
