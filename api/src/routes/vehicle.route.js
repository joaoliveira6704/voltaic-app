import { Router } from "express";
import { getVehicles } from "../controllers/vehicle.controller.js";

const router = Router();

/**
 * @openapi
 * /api/vehicles:
 *   get:
 *     tags: [Vehicles]
 *     summary: Listar catálogo de veículos (sem paginação)
 *     responses:
 *       200:
 *         description: Lista de veículos (cache 1h)
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: success
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/CatalogVehicle'
 */
router.get("/", getVehicles);

export default router;
