import { Router } from "express";
import {
  getCompanies,
  createCompany,
  deleteCompany,
  updateCompany,
  getCompanyById,
  getCompanyGroups,
  assignGroup,
  unassignGroup,
  getDashboard,
  getDashboardWeek,
} from "../controllers/company.controller.js";
import {
  protect,
  requireRole,
  checkOwnership,
} from "../middleware/auth.middleware.js";
import companyModel from "../models/company.model.js";

const router = Router();

/**
 * @openapi
 * /api/companies:
 *   get:
 *     tags: [Companies]
 *     summary: Listar empresas
 *     parameters:
 *       - in: query
 *         name: companyIds
 *         schema:
 *           type: string
 *         description: "Filtrar por IDs (separados por vírgula)"
 *       - in: query
 *         name: view
 *         schema:
 *           type: string
 *           enum: [dashboard, admin]
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
 *         description: Lista de empresas
 *         content:
 *           application/json:
 *             schema:
 *               oneOf:
 *                 - $ref: '#/components/schemas/Pagination'
 *                 - type: array
 *                   items:
 *                     $ref: '#/components/schemas/Company'
 *                 - type: object
 *                   properties:
 *                     total:
 *                       type: integer
 *                     companies:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/Company'
 */
router.get("/", getCompanies);

/**
 * @openapi
 * /api/companies:
 *   post:
 *     tags: [Companies]
 *     summary: Criar empresa (admin)
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateCompanyInput'
 *     responses:
 *       201:
 *         description: Empresa criada
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 companyId:
 *                   type: string
 */
router.post("/", protect, requireRole("admin"), createCompany);

/**
 * @openapi
 * /api/companies/{id}:
 *   delete:
 *     tags: [Companies]
 *     summary: Eliminar empresa
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
 *         description: Empresa eliminada
 *       404:
 *         description: Empresa não encontrada
 */
router.delete(
  "/:id",
  protect,
  requireRole("admin", "company-manager"),
  checkOwnership(companyModel),
  deleteCompany,
);

/**
 * @openapi
 * /api/companies/{id}:
 *   patch:
 *     tags: [Companies]
 *     summary: Atualizar empresa
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
 *             $ref: '#/components/schemas/CreateCompanyInput'
 *     responses:
 *       200:
 *         description: Empresa atualizada
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Company'
 *       404:
 *         description: Empresa não encontrada
 */
router.patch(
  "/:id",
  protect,
  requireRole("admin", "company-manager"),
  checkOwnership(companyModel),
  updateCompany,
);

/**
 * @openapi
 * /api/companies/me/dashboard:
 *   get:
 *     tags: [Companies]
 *     summary: Obter dashboard da empresa
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Dados do dashboard
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/CompanyDashboard'
 */
router.get(
  "/me/dashboard",
  protect,
  requireRole("company-manager", "admin"),
  getDashboard,
);

/**
 * @openapi
 * /api/companies/me/dashboard/week:
 *   get:
 *     tags: [Companies]
 *     summary: Obter dados semanais do dashboard
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: start
 *         required: true
 *         schema:
 *           type: string
 *           format: date
 *         description: Data de início da semana (YYYY-MM-DD)
 *     responses:
 *       200:
 *         description: Dados semanais agrupados por dia/grupo
 */
router.get(
  "/me/dashboard/week",
  protect,
  requireRole("company-manager", "admin"),
  getDashboardWeek,
);

/**
 * @openapi
 * /api/companies/{id}:
 *   get:
 *     tags: [Companies]
 *     summary: Obter empresa por ID
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
 *         description: Dados da empresa
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Company'
 *       404:
 *         description: Empresa não encontrada
 */
router.get("/:id", protect, getCompanyById);

/**
 * @openapi
 * /api/companies/{id}/groups:
 *   get:
 *     tags: [Companies]
 *     summary: Obter grupos (atribuídos e não atribuídos) de uma empresa
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
 *         description: Grupos da empresa
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 assigned:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Group'
 *                 unassigned:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Group'
 */
router.get("/:id/groups", protect, getCompanyGroups);

/**
 * @openapi
 * /api/companies/{id}/groups/assign:
 *   patch:
 *     tags: [Companies]
 *     summary: Atribuir grupo a uma empresa (admin)
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
 *             properties:
 *               groupId:
 *                 type: string
 *     responses:
 *       200:
 *         description: Grupo atribuído
 *       400:
 *         description: Grupo já atribuído a outra empresa
 *       404:
 *         description: Grupo não encontrado
 */
router.patch("/:id/groups/assign", protect, requireRole("admin"), assignGroup);

/**
 * @openapi
 * /api/companies/{id}/groups/unassign:
 *   patch:
 *     tags: [Companies]
 *     summary: Remover grupo de uma empresa (admin)
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
 *             properties:
 *               groupId:
 *                 type: string
 *     responses:
 *       200:
 *         description: Grupo removido
 */
router.patch(
  "/:id/groups/unassign",
  protect,
  requireRole("admin"),
  unassignGroup,
);

export default router;
