import { Router } from "express";
import { requireAuth } from "../middlewares/auth.js";
import * as notesController from "../controllers/note.controller.js";

const router = Router();

// // contact-scoped
router.post("/contacts/:contactId/notes", requireAuth, notesController.addToContact);
router.get("/contacts/:contactId/notes", requireAuth, notesController.listForContact);

// // note-scoped
router.patch("/notes/:id", requireAuth, notesController.update);
router.delete("/notes/:id", requireAuth, notesController.remove);

export default router;