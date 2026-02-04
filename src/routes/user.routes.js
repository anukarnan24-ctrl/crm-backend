import { Router } from "express";
import { requireAuth } from "../middlewares/auth.js";
import { requireRole } from "../middlewares/roles.js";
import * as usersController from "../controllers/user.controller.js";

const router = Router();

// current user
router.get("/me", requireAuth, usersController.me);
router.patch("/me", requireAuth, usersController.updateMe);

// admin/dev only
router.get("/", requireAuth, requireRole("ADMIN", "DEV"), usersController.list);

export default router;