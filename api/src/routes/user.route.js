import { Router } from "express";
import {
  getUsers,
  deleteUser,
  updateUser,
  getCurrentUser,
  updateOwnUser,
  addVehicle,
  getUserById,
  removeVehicle,
  editVehicle,
  getVehicles,
  getFavorites,
  getFavoriteStations,
  deleteOwnUser,
  addFavorite,
  removeFavorite,
  updateRole,
  getCurrentCompany,
} from "../controllers/user.controller.js";
import { register } from "../controllers/auth.controller.js";
import { getActiveUserUsages } from "../controllers/usage.controller.js";
import {
  getMyTickets,
  getCompanyTickets,
} from "../controllers/ticket.controller.js";
import { getCompanyStations } from "../controllers/station.controller.js";
import {
  checkOwnership,
  protect,
  requireRole,
} from "../middleware/auth.middleware.js";
import userModel from "../models/user.model.js";

const router = Router();

router.get("/", protect, requireRole("admin", "company-manager"), getUsers);
router.post("/", register);

/**
 * @openapi
 * /api/users/me:
 *   get:
 *     tags: [Users]
 *     summary: Obter perfil do utilizador autenticado
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: profile
 *         schema:
 *           type: string
 *         description: Se definido, retorna perfil completo com histórico
 *     responses:
 *       200:
 *         description: Perfil do utilizador
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/User'
 *       401:
 *         description: Não autenticado
 */
router.get("/me", protect, getCurrentUser);

/**
 * @openapi
 * /api/users/me:
 *   patch:
 *     tags: [Users]
 *     summary: Atualizar próprio perfil
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UpdateOwnUserInput'
 *     responses:
 *       200:
 *         description: Perfil atualizado
 *       400:
 *         description: Dados inválidos
 *       401:
 *         description: Password atual incorreta
 */
router.patch("/me", protect, updateOwnUser);

/**
 * @openapi
 * /api/users/me:
 *   delete:
 *     tags: [Users]
 *     summary: Eliminar própria conta
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Conta eliminada
 *       404:
 *         description: Utilizador não encontrado
 */
router.delete("/me", protect, deleteOwnUser);

/**
 * @openapi
 * /api/users/me/favorites:
 *   get:
 *     tags: [Users]
 *     summary: Listar favoritos
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Lista de IDs de estações favoritas
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: string
 */
router.get("/me/favorites", protect, getFavorites);

/**
 * @openapi
 * /api/users/me/favorites:
 *   post:
 *     tags: [Users]
 *     summary: Adicionar estação aos favoritos
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/AddFavoriteInput'
 *     responses:
 *       201:
 *         description: Favorito adicionado
 *       400:
 *         description: Estação já nos favoritos
 *       404:
 *         description: Estação não encontrada
 */
router.post("/me/favorites", protect, addFavorite);

/**
 * @openapi
 * /api/users/me/favorites/stations:
 *   get:
 *     tags: [Users]
 *     summary: Obter estações favoritas (detalhes completos)
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Lista de estações favoritas
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Station'
 */
router.get("/me/favorites/stations", protect, getFavoriteStations);

/**
 * @openapi
 * /api/users/me/favorites/{stationId}:
 *   delete:
 *     tags: [Users]
 *     summary: Remover estação dos favoritos
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: stationId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Favorito removido
 */
router.delete("/me/favorites/:stationId", protect, removeFavorite);

/**
 * @openapi
 * /api/users/me/company:
 *   get:
 *     tags: [Users]
 *     summary: Obter empresa do utilizador
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Dados da empresa
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Company'
 *       404:
 *         description: Empresa não encontrada
 */
router.get(
  "/me/company",
  protect,
  requireRole("company-manager", "worker"),
  getCurrentCompany,
);

/**
 * @openapi
 * /api/users/me/company/stations:
 *   get:
 *     tags: [Users]
 *     summary: Obter estações da empresa do utilizador
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Lista de estações
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Station'
 */
router.get(
  "/me/company/stations",
  protect,
  requireRole("company-manager", "worker"),
  getCompanyStations,
);

/**
 * @openapi
 * /api/users/me/company/tickets:
 *   get:
 *     tags: [Users]
 *     summary: Obter tickets da empresa do utilizador
 *     security:
 *       - bearerAuth: []
 *     parameters:
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
  "/me/company/tickets",
  protect,
  requireRole("company-manager", "worker"),
  getCompanyTickets,
);

/**
 * @openapi
 * /api/users/me/vehicles:
 *   get:
 *     tags: [Users]
 *     summary: Listar veículos do utilizador
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Lista de veículos
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Vehicle'
 */
router.get("/me/vehicles", protect, getVehicles);

/**
 * @openapi
 * /api/users/me/vehicles:
 *   post:
 *     tags: [Users]
 *     summary: Adicionar veículo ao utilizador
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/AddVehicleInput'
 *     responses:
 *       201:
 *         description: Veículo adicionado
 *       400:
 *         description: Limite de 4 veículos ou duplicado
 */
router.post("/me/vehicles", protect, addVehicle);

/**
 * @openapi
 * /api/users/me/vehicles/{plate}:
 *   patch:
 *     tags: [Users]
 *     summary: Editar veículo
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: plate
 *         required: true
 *         schema:
 *           type: string
 *         description: Matrícula do veículo
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/EditVehicleInput'
 *     responses:
 *       200:
 *         description: Veículo atualizado
 *       404:
 *         description: Veículo não encontrado
 */
router.patch("/me/vehicles/:plate", protect, editVehicle);

/**
 * @openapi
 * /api/users/me/vehicles/{plate}:
 *   delete:
 *     tags: [Users]
 *     summary: Remover veículo
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: plate
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Veículo removido
 *       404:
 *         description: Utilizador não encontrado
 */
router.delete("/me/vehicles/:plate", protect, removeVehicle);

/**
 * @openapi
 * /api/users/me/usages:
 *   get:
 *     tags: [Users]
 *     summary: Obter sessões de carregamento ativas do utilizador
 *     security:
 *       - bearerAuth: []
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
 *         description: Sessões de carregamento
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Pagination'
 */
router.get("/me/usages", protect, getActiveUserUsages);

/**
 * @openapi
 * /api/users/me/tickets:
 *   get:
 *     tags: [Users]
 *     summary: Obter tickets do utilizador autenticado
 *     security:
 *       - bearerAuth: []
 *     parameters:
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
 *         description: Lista de tickets do utilizador
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Pagination'
 */
router.get("/me/tickets", protect, getMyTickets);

/**
 * @openapi
 * /api/users/{id}:
 *   get:
 *     tags: [Users]
 *     summary: Obter utilizador por ID
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
 *         description: Dados do utilizador
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/User'
 *       404:
 *         description: Utilizador não encontrado
 */
router.get("/:id", protect, getUserById);
router.patch(
  "/:id",
  protect,
  requireRole("admin", "company-manager"),
  updateUser,
);
router.delete("/:id", protect, requireRole("admin"), deleteUser);

/**
 * @openapi
 * /api/users/{id}/role:
 *   patch:
 *     tags: [Users]
 *     summary: Alterar role de um utilizador
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
 *             $ref: '#/components/schemas/UpdateRoleInput'
 *     responses:
 *       200:
 *         description: Role atualizado
 *       404:
 *         description: Utilizador não encontrado
 */
router.patch(
  "/:id/role",
  protect,
  requireRole("admin", "company-manager"),
  updateRole,
);

export default router;
