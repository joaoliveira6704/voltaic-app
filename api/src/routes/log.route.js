import { Router } from "express";
import {
  getLogs,
  createLog,
  deleteLog,
} from "../controllers/log.controller.js";
import { protect, requireRole } from "../middleware/auth.middleware.js";

const router = Router();

/**
 * @openapi
 * /api/logs:
 *   get:
 *     tags: [Logs]
 *     summary: Listar logs
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: stationId
 *         schema:
 *           type: string
 *         description: Filtrar logs por estação
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Lista de logs
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Pagination'
 */
router.get("/", protect, getLogs);

/**
 * @openapi
 * /api/logs:
 *   post:
 *     tags: [Logs]
 *     summary: Criar log
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateLogInput'
 *     responses:
 *       201:
 *         description: Log criado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Log'
 */
router.post("/", protect, createLog);

/**
 * @openapi
 * /api/logs/{id}:
 *   delete:
 *     tags: [Logs]
 *     summary: Eliminar log (admin)
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
 *         description: Log eliminado
 *       404:
 *         description: Log não encontrado
 */
router.delete("/:id", protect, requireRole("admin"), deleteLog);

export default router;
