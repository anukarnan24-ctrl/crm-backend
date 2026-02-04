import { Router } from "express";
import { requireAuth } from "../middlewares/auth.js";
import * as timelineController from "../controllers/timeline.controller.js";

const router = Router();

router.get("/contacts/:contactId/timeline", requireAuth, timelineController.contactTimeline);

export default router;