import { Router } from "express";
import { requireAuth } from "../middlewares/auth.js";
import * as authController from "../controllers/auth.controller.js";

const router = Router();

router.post("/signup", authController.signup);
router.post("/login", authController.login);
router.get("/me", requireAuth, authController.me);

export default router;