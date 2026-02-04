import { Router } from "express";
import { requireAuth } from "../middlewares/auth.js";
import * as leadsController from "../controllers/lead.controller.js";

const router = Router();

router.post("/", requireAuth, leadsController.create);
router.patch("/:id", requireAuth, leadsController.update);
router.get("/", requireAuth, leadsController.list);
router.post("/:id/convert", requireAuth, leadsController.convert);

export default router;