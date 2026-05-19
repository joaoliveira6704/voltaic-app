import { Router } from "express";
import {
  getTickets,
  createTicket,
  updateTicket,
  deleteTicket,
} from "../controllers/ticket.controller.js";
import { protect, requireRole } from "../middleware/auth.middleware.js";

const router = Router();

router.post("/", protect, createTicket);
router.get("/", protect, requireRole("admin"), getTickets);
router.patch(
  "/:id",
  protect,
  requireRole("admin", "company-manager"),
  updateTicket,
);
router.delete("/:id", protect, requireRole("admin"), deleteTicket);

export default router;
