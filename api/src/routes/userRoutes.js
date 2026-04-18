import { Router } from "express";
import {
  getUsers,
  deleteUser,
  updateUser,
} from "../controllers/userController.js";

const router = Router();

router.get("/", getUsers);
router.put("/:id", updateUser);
router.delete("/:id", deleteUser);

export default router;
