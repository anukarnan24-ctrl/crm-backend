import { Router } from "express";
import { requireAuth } from "../middlewares/auth.js";
import * as tasksController from "../controllers/task.controller.js";

const router = Router();

// contact-scoped
router.post("/contacts/:contactId/tasks", requireAuth, tasksController.createToContact);
router.get("/contacts/:contactId/tasks", requireAuth, tasksController.listForContact);

// task-scoped
router.patch("/tasks/:id", requireAuth, tasksController.update);

// pending tasks
router.get("/tasks/pending", requireAuth, tasksController.pending);

export default router;