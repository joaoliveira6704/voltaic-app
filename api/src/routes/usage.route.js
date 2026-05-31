import { Router } from "express";
import {
  startUsage,
  endUsage,
  getUsage,
  getActiveUsages,
  getUsages,
} from "../controllers/usage.controller.js";
import { protect, requireRole } from "../middleware/auth.middleware.js";

const router = Router();

/**
 * @openapi
 * /api/usages:
 *   post:
 *     tags: [Usages]
 *     summary: Iniciar sessão de carregamento
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/StartUsageInput'
 *     responses:
 *       201:
 *         description: Sessão iniciada
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Usage'
 *       400:
 *         description: Estação não disponível
 *       404:
 *         description: Estação não encontrada
 */
router.post("/", protect, startUsage);

/**
 * @openapi
 * /api/usages/{id}:
 *   patch:
 *     tags: [Usages]
 *     summary: Terminar sessão de carregamento
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
 *         description: Sessão terminada
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Usage'
 *       400:
 *         description: Sessão já terminada
 *       404:
 *         description: Sessão não encontrada
 */
router.patch("/:id", protect, endUsage);

/**
 * @openapi
 * /api/usages/{id}:
 *   get:
 *     tags: [Usages]
 *     summary: Obter sessão de carregamento por ID
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
 *         description: Dados da sessão
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Usage'
 *       404:
 *         description: Sessão não encontrada
 */
router.get("/:id", protect, getUsage);

/**
 * @openapi
 * /api/usages:
 *   get:
 *     tags: [Usages]
 *     summary: Listar sessões de carregamento
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: userId
 *         schema:
 *           type: string
 *         description: ID do utilizador (apenas o próprio)
 *       - in: query
 *         name: active
 *         schema:
 *           type: string
 *         description: "active=true — filtrar apenas sessões ativas (endTime: null)"
 *       - in: query
 *         name: state
 *         schema:
 *           type: string
 *           enum: [active]
 *         description: "state=active — listar todas as sessões ativas (admin)"
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
 *         description: Lista de sessões
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Pagination'
 *       403:
 *         description: userId diferente do próprio utilizador
 */
router.get("/", protect, (req, res, next) => {
  if (req.query.state === "active") {
    return requireRole("admin")(req, res, next);
  }
  next();
}, (req, res, next) => {
  if (req.query.state === "active") {
    return getActiveUsages(req, res, next);
  }
  return getUsages(req, res, next);
});

export default router;
