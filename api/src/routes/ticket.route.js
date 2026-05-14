import { Router } from "express";
import {
  getTickets,
  getMyTickets,
  getCompanyTickets,
  getAdminTickets,
  getStationTickets,
  createTicket,
  updateTicket,
  deleteTicket,
} from "../controllers/ticket.controller.js";
import { protect, requireRole } from "../middleware/auth.middleware.js";

const router = Router();

router.post("/", protect, createTicket);
router.get("/my", protect, getMyTickets);
router.get("/company", protect, requireRole("company-manager", "worker"), getCompanyTickets);
router.get("/admin", protect, requireRole("admin"), getAdminTickets);
router.get("/station/:stationId", protect, requireRole("company-manager", "worker"), getStationTickets);
router.get("/", protect, requireRole("admin"), getTickets);
router.patch("/:id", protect, requireRole("admin", "company-manager"), updateTicket);
router.delete("/:id", protect, requireRole("admin"), deleteTicket);

export default router;
