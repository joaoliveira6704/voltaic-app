import { Router } from "express";
import { getVehicles } from "../controllers/vehicle.controller.js";

const router = Router();

/**
 * @openapi
 * /api/vehicles:
 *   get:
 *     tags: [Vehicles]
 *     summary: Listar catálogo de veículos
 *     parameters:
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
 *         description: Lista de veículos
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Pagination'
 */
router.get("/", getVehicles);

export default router;
