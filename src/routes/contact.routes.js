import { Router } from "express";
import { requireAuth } from "../middlewares/auth.js";
import * as contactsController from "../controllers/contact.controller.js";

const router = Router();

router.post("/", requireAuth, contactsController.create);
router.get("/", requireAuth, contactsController.list);
router.get("/:id", requireAuth, contactsController.getOne);
router.patch("/:id", requireAuth, contactsController.update);

export default router;