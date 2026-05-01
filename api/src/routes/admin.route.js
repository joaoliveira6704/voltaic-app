// routes/admin.routes.js
import { Router } from "express";
import { protect, requireRole } from "../middleware/auth.js";
import { deleteUser } from "../controllers/user.controller.js";

const router = Router();

router.use(protect, requireRole("admin"));

router.get("/users", getUsers);
router.delete("/users/:id", deleteUser);

export default router;
