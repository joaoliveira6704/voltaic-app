import { Router } from "express";
import {
  getLogs,
  createLog,
  deleteLog,
} from "../controllers/log.controller.js";

const router = Router();

router.get("/", getLogs);
router.post("/", createLog);
router.delete("/:id", deleteLog);

export default router;
