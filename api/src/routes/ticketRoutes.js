import { Router } from "express";
import {
  getTickets,
  createTicket,
  deleteTicket,
  updateTicket,
} from "../controllers/ticketController.js";

const router = Router();

router.get("/", getTickets);
router.post("/", createTicket);
router.delete("/:id", deleteTicket);
router.patch("/:id", updateTicket);

export default router;
