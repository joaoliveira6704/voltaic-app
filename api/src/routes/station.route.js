import { Router } from "express";
import {
  getStations,
  createStation,
  deleteStation,
  updateStation,
  getStationById,
  executeStationCommand,
  checkStationOwnership,
} from "../controllers/station.controller.js";
import {
  getStationUsages,
} from "../controllers/usage.controller.js";
import {
  getStationTickets,
} from "../controllers/ticket.controller.js";
import {
  protect,
  requireRole,
} from "../middleware/auth.middleware.js";

const router = Router();

router.get("/", (req, res, next) => {
  if (req.query.view === "dashboard") {
    return protect(req, res, (err) => {
      if (err) return next(err);
      requireRole("admin")(req, res, next);
    });
  }
  next();
}, getStations);
router.post("/", protect, requireRole("admin"), createStation);
router.delete("/:id", protect, requireRole("admin"), deleteStation);
router.patch(
  "/:id",
  protect,
  requireRole("admin", "company-manager", "worker"),
  checkStationOwnership,
  updateStation,
);
router.get("/:id", protect, getStationById);
router.post(
  "/:stationId/commands",
  protect,
  requireRole("admin", "worker", "company-manager"),
  executeStationCommand,
);
router.get(
  "/:stationId/usages",
  protect,
  getStationUsages,
);
router.get(
  "/:stationId/tickets",
  protect,
  requireRole("company-manager", "worker"),
  getStationTickets,
);

export default router;
