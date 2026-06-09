import { Router } from "express";
import { getStats } from "../controllers/stats.controller.js";

const router = Router();

/**
 * @openapi
 * /api/stats:
 *   get:
 *     tags: [Stats]
 *     summary: Estatísticas públicas da plataforma
 *     description: >
 *       Retorna contagens agregadas para a landing page.
 *       Não requer autenticação. Cache público de 5 minutos (Redis + Cache-Control).
 *     responses:
 *       200:
 *         description: Estatísticas da plataforma (cache 300s)
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: success
 *                 data:
 *                   type: object
 *                   properties:
 *                     totalUsers:
 *                       type: integer
 *                       example: 1240
 *                     totalStations:
 *                       type: integer
 *                       example: 85
 *                     totalCompanies:
 *                       type: integer
 *                       example: 32
 *                     totalCompletedUsages:
 *                       type: integer
 *                       example: 9800
 */
router.get("/", getStats);

export default router;
