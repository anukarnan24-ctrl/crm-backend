import * as notesService from "../services/note.service.js";

export async function addToContact(req, res) {
  const parsed = Number(req.params.contactId);
  if (Number.isNaN(parsed)) {
    return res.status(400).json({ message: "Invalid leadId" });
  }
  req.params.contactId = parsed;
  try {
    const result = await notesService.addNote(
      req.user,
      req.params.contactId,
      req.body,
    );
    return res.status(201).json(result);
  } catch (err) {
    return res
      .status(err.statusCode || 500)
      .json({ message: err.message || "Server error" });
  }
}

export async function update(req, res) {
  const parsed = Number(req.params.id);

  if (Number.isNaN(parsed)) {
    return res.status(400).json({ message: "Invalid leadId" });
  }

  req.params.id = parsed;
  try {
    const result = await notesService.updateNote(
      req.user,
      req.params.id,
      req.body,
    );
    return res.json(result);
  } catch (err) {
    return res
      .status(err.statusCode || 500)
      .json({ message: err.message || "Server error" });
  }
}

export async function remove(req, res) {
  const parsed = Number(req.params.id);

  if (Number.isNaN(parsed)) {
    return res.status(400).json({ message: "Invalid leadId" });
  }

  req.params.id = parsed;
  try {
    const result = await notesService.deleteNote(req.user, req.params.id);
    return res.json(result);
  } catch (err) {
    return res
      .status(err.statusCode || 500)
      .json({ message: err.message || "Server error" });
  }
}

export async function listForContact(req, res) {
  const parsed = Number(req.params.contactId);

  if (Number.isNaN(parsed)) {
    return res.status(400).json({ message: "Invalid leadId" });
  }

  req.params.contactId = parsed;
  try {
    const result = await notesService.listNotesForContact(
      req.user,
      req.params.contactId,
    );
    return res.json(result);
  } catch (err) {
    return res
      .status(err.statusCode || 500)
      .json({ message: err.message || "Server error" });
  }
}
