import * as tasksService from "../services/task.service.js";

export async function createToContact(req, res) {
  const parsed = Number(req.params.contactId);

  if (Number.isNaN(parsed)) {
    return res.status(400).json({ message: "Invalid leadId" });
  }

  req.params.contactId = parsed;
  try {
    const result = await tasksService.createTask(
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
    const result = await tasksService.updateTask(
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

export async function listForContact(req, res) {
  const parsed = Number(req.params.contactId);

  if (Number.isNaN(parsed)) {
    return res.status(400).json({ message: "Invalid leadId" });
  }

  req.params.contactId = parsed;
  try {
    const result = await tasksService.listTasksForContact(
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

export async function pending(req, res) {
  try {
    const result = await tasksService.listPendingTasks(req.user, req.query);
    return res.json(result);
  } catch (err) {
    return res
      .status(err.statusCode || 500)
      .json({ message: err.message || "Server error" });
  }
}
