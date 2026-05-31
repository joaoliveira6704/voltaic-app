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

/**
 * @openapi
 * /api/stations:
 *   get:
 *     tags: [Stations]
 *     summary: Listar estações
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: view
 *         schema:
 *           type: string
 *           enum: [dashboard]
 *         description: "view=dashboard (admin) retorna estatísticas"
 *       - in: query
 *         name: near
 *         schema:
 *           type: string
 *         description: "lat,lng — coordenadas para pesquisa geográfica"
 *       - in: query
 *         name: maxDistance
 *         schema:
 *           type: string
 *         description: Distância máxima em km (usado com near)
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *       - in: query
 *         name: sort
 *         schema:
 *           type: string
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
 *         description: Lista de estações
 *         content:
 *           application/json:
 *             schema:
 *               oneOf:
 *                 - $ref: '#/components/schemas/Pagination'
 *                 - type: array
 *                   items:
 *                     $ref: '#/components/schemas/Station'
 *                 - $ref: '#/components/schemas/StationDashboard'
 */
router.get("/", protect, (req, res, next) => {
  if (req.query.view === "dashboard") {
    return requireRole("admin")(req, res, next);
  }
  next();
}, getStations);

/**
 * @openapi
 * /api/stations:
 *   post:
 *     tags: [Stations]
 *     summary: Criar estação (admin)
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateStationInput'
 *     responses:
 *       201:
 *         description: Estação criada
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 stationId:
 *                   type: string
 */
router.post("/", protect, requireRole("admin"), createStation);

/**
 * @openapi
 * /api/stations/{id}:
 *   delete:
 *     tags: [Stations]
 *     summary: Eliminar estação (admin)
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
 *         description: Estação eliminada
 *       404:
 *         description: Estação não encontrada
 */
router.delete("/:id", protect, requireRole("admin"), deleteStation);

/**
 * @openapi
 * /api/stations/{id}:
 *   patch:
 *     tags: [Stations]
 *     summary: Atualizar estação
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
 *             type: object
 *     responses:
 *       200:
 *         description: Estação atualizada
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Station'
 *       404:
 *         description: Estação não encontrada
 */
router.patch(
  "/:id",
  protect,
  requireRole("admin", "company-manager", "worker"),
  checkStationOwnership,
  updateStation,
);

/**
 * @openapi
 * /api/stations/{id}:
 *   get:
 *     tags: [Stations]
 *     summary: Obter estação por ID
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
 *         description: Dados da estação
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Station'
 *       404:
 *         description: Estação não encontrada
 */
router.get("/:id", protect, getStationById);

/**
 * @openapi
 * /api/stations/{stationId}/commands:
 *   post:
 *     tags: [Stations]
 *     summary: Executar comando numa estação
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: stationId
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/ExecuteCommandInput'
 *     responses:
 *       200:
 *         description: Comando executado
 *       404:
 *         description: Estação não encontrada
 */
router.post(
  "/:stationId/commands",
  protect,
  requireRole("admin", "worker", "company-manager"),
  executeStationCommand,
);

/**
 * @openapi
 * /api/stations/{stationId}/usages:
 *   get:
 *     tags: [Stations]
 *     summary: Obter sessões de carregamento de uma estação
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: stationId
 *         required: true
 *         schema:
 *           type: string
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
 *         description: Sessões de carregamento
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Pagination'
 */
router.get(
  "/:stationId/usages",
  protect,
  getStationUsages,
);

/**
 * @openapi
 * /api/stations/{stationId}/tickets:
 *   get:
 *     tags: [Stations]
 *     summary: Obter tickets de uma estação
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: stationId
 *         required: true
 *         schema:
 *           type: string
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
 *     responses:
 *       200:
 *         description: Lista de tickets
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Pagination'
 */
router.get(
  "/:stationId/tickets",
  protect,
  requireRole("company-manager", "worker"),
  getStationTickets,
);

export default router;
