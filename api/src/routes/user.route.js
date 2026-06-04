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
  deleteOwnUser,
  addFavorite,
  removeFavorite,
  getCurrentCompany,
} from "../controllers/user.controller.js";
import {
  register,
  login,
  validateToken,
  createResetToken,
  validateResetToken,
  resetPassword,
  refresh,
  logout,
  logoutAll,
} from "../controllers/auth.controller.js";
import { getActiveUserUsages } from "../controllers/usage.controller.js";
import {
  getMyTickets,
  getCompanyTickets,
} from "../controllers/ticket.controller.js";
import { getCompanyStations } from "../controllers/station.controller.js";
import {
  authLimiter,
  loginLimiter,
  generalLimiter,
} from "../middleware/rateLimiter.middleware.js";
import {
  checkOwnership,
  protect,
  requireRole,
} from "../middleware/auth.middleware.js";
import userModel from "../models/user.model.js";

const router = Router();

/**
 * @openapi
 * /api/users:
 *   get:
 *     tags: [Users]
 *     summary: Listar utilizadores (admin/company-manager)
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: view
 *         schema:
 *           type: string
 *           enum: [dashboard, admin]
 *         description: "view=dashboard retorna total (cache 60s)"
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
 *         name: role
 *         schema:
 *           type: string
 *           enum: [client, admin, worker, company-manager]
 *       - in: query
 *         name: companyId
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Lista de utilizadores (view=dashboard, cache 60s)
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Pagination'
 *       401:
 *         description: Não autenticado
 *       403:
 *         description: Sem permissões
 */
router.get("/", protect, requireRole("admin", "company-manager"), getUsers);
router.post("/", authLimiter, register);

/**
 * @openapi
 * /api/users/login:
 *   post:
 *     tags: [Auth]
 *     summary: Autenticar utilizador
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/LoginInput'
 *     responses:
 *       200:
 *         description: Login bem-sucedido
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: success
 *                 token:
 *                   type: string
 *                 refreshToken:
 *                   type: string
 *                 data:
 *                   type: object
 *                   properties:
 *                     user:
 *                       $ref: '#/components/schemas/User'
 *       400:
 *         description: Credenciais não fornecidas
 *       401:
 *         description: Credenciais inválidas
 */
router.post("/login", loginLimiter, login);

/**
 * @openapi
 * /api/users/verify:
 *   post:
 *     tags: [Auth]
 *     summary: Validar token JWT
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Token válido
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 valid:
 *                   type: boolean
 *                 userId:
 *                   type: string
 *                 role:
 *                   type: string
 *                 isAdmin:
 *                   type: boolean
 *       401:
 *         description: Token inválido ou ausente
 */
router.post("/verify", protect, validateToken);

/**
 * @openapi
 * /api/users/forgot-password:
 *   post:
 *     tags: [Auth]
 *     summary: Solicitar reset de password
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/ForgotPasswordInput'
 *     responses:
 *       200:
 *         description: Email enviado se a conta existir
 */
router.post("/forgot-password", authLimiter, createResetToken);

/**
 * @openapi
 * /api/users/forgot-password/{token}:
 *   post:
 *     tags: [Auth]
 *     summary: Validar token de reset
 *     parameters:
 *       - in: path
 *         name: token
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Token válido
 *       404:
 *         description: Token inválido ou expirado
 */
router.post("/forgot-password/:token", generalLimiter, validateResetToken);

/**
 * @openapi
 * /api/users/reset-password:
 *   post:
 *     tags: [Auth]
 *     summary: Definir nova password
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/ResetPasswordInput'
 *     responses:
 *       200:
 *         description: Password atualizada com sucesso
 *       400:
 *         description: Token inválido ou password fraca
 */
router.post("/reset-password", generalLimiter, resetPassword);

/**
 * @openapi
 * /api/users/refresh:
 *   post:
 *     tags: [Auth]
 *     summary: Renovar access token com refresh token (rotação)
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/RefreshTokenInput'
 *     responses:
 *       200:
 *         description: Novo par de tokens emitido
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 token:
 *                   type: string
 *                 refreshToken:
 *                   type: string
 *       401:
 *         description: Refresh token inválido, expirado ou revogado
 */
router.post("/refresh", generalLimiter, refresh);

/**
 * @openapi
 * /api/users/logout:
 *   post:
 *     tags: [Auth]
 *     summary: Terminar sessão (revoga refresh token)
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/RefreshTokenInput'
 *     responses:
 *       200:
 *         description: Sessão terminada
 */
router.post("/logout", protect, logout);

/**
 * @openapi
 * /api/users/logout-all:
 *   post:
 *     tags: [Auth]
 *     summary: Terminar sessão em todos os dispositivos
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Todas as sessões terminadas
 */
router.post("/logout-all", protect, logoutAll);

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
 *         description: Se definido, retorna perfil completo com histórico (cache 5min)
 *     responses:
 *       200:
 *         description: Perfil do utilizador (com ?profile, cache 5min — invalidado ao atualizar)
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
 *         description: Perfil atualizado (invalida cache do perfil)
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
 *     summary: Listar estações favoritas
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
 * /api/users/my_company:
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
  "/my_company",
  protect,
  requireRole("company-manager", "worker"),
  getCurrentCompany,
);

/**
 * @openapi
 * /api/users/my_company/stations:
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
  "/my_company/stations",
  protect,
  requireRole("company-manager", "worker"),
  getCompanyStations,
);

/**
 * @openapi
 * /api/users/my_company/tickets:
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
  "/my_company/tickets",
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

export default router;
