import { Router } from "express";
import {
  getTickets,
  createTicket,
  updateTicket,
  deleteTicket,
} from "../controllers/ticket.controller.js";
import { protect, requireRole } from "../middleware/auth.middleware.js";

const router = Router();

/**
 * @openapi
 * /api/tickets:
 *   post:
 *     tags: [Tickets]
 *     summary: Criar ticket de suporte
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateTicketInput'
 *     responses:
 *       201:
 *         description: Ticket criado
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 ticketId:
 *                   type: string
 */
router.post("/", protect, createTicket);

/**
 * @openapi
 * /api/tickets:
 *   get:
 *     tags: [Tickets]
 *     summary: Listar tickets (admin)
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: view
 *         schema:
 *           type: string
 *           enum: [dashboard]
 *         description: "view=dashboard retorna contagens e recentes (cache 60s)"
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *       - in: query
 *         name: sort
 *         schema:
 *           type: string
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [open, closed, resolved, unresolved]
 *       - in: query
 *         name: stationId
 *         schema:
 *           type: string
 *         description: "Filtrar tickets por estação"
 *       - in: query
 *         name: stationless
 *         schema:
 *           type: string
 *         description: "Filtrar tickets sem estação (true)"
 *     responses:
 *       200:
 *         description: Lista de tickets (view=dashboard, cache 60s)
 *         content:
 *           application/json:
 *             schema:
 *               oneOf:
 *                 - $ref: '#/components/schemas/Pagination'
 *                 - type: object
 *                   properties:
 *                     total:
 *                       type: integer
 *                     open:
 *                       type: integer
 *                     closed:
 *                       type: integer
 *                     resolved:
 *                       type: integer
 *                     unresolved:
 *                       type: integer
 *                     recent:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/Ticket'
 */
router.get("/", protect, requireRole("admin"), getTickets);

/**
 * @openapi
 * /api/tickets/{id}:
 *   patch:
 *     tags: [Tickets]
 *     summary: Atualizar ticket
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UpdateTicketInput'
 *     responses:
 *       200:
 *         description: Ticket atualizado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Ticket'
 *       404:
 *         description: Ticket não encontrado
 */
router.patch(
  "/:id",
  protect,
  requireRole("admin", "company-manager"),
  updateTicket,
);

/**
 * @openapi
 * /api/tickets/{id}:
 *   delete:
 *     tags: [Tickets]
 *     summary: Eliminar ticket (admin)
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Ticket eliminado
 *       404:
 *         description: Ticket não encontrado
 */
router.delete("/:id", protect, requireRole("admin"), deleteTicket);

export default router;
