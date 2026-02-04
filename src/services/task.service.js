import prisma from "../prisma.js";

async function assertCanAccessContact(currentUser, contactId) {
  const contact = await prisma.contact.findUnique({
    where: { id: contactId },
    select: { id: true, ownerId: true },
  });

  if (!contact) {
    const err = new Error("Contact not found");
    err.statusCode = 404;
    throw err;
  }

  const isPrivileged = ["ADMIN", "DEV"].includes(currentUser.role);
  const isOwner = contact.ownerId === currentUser.id;

  if (!isOwner && !isPrivileged) {
    const err = new Error("Forbidden");
    err.statusCode = 403;
    throw err;
  }

  return contact;
}

async function assertCanAccessTask(currentUser, taskId) {
  const task = await prisma.task.findUnique({
    where: { id: taskId },
    select: {
      id: true,
      ownerId: true,
      contactId: true,
      contact: { select: { ownerId: true } },
    },
  });

  if (!task) {
    const err = new Error("Task not found");
    err.statusCode = 404;
    throw err;
  }

  const isPrivileged = ["ADMIN", "DEV"].includes(currentUser.role);
  const isOwner = task.contact.ownerId === currentUser.id;

  if (!isOwner && !isPrivileged) {
    const err = new Error("Forbidden");
    err.statusCode = 403;
    throw err;
  }

  return task;
}

function parseDueDate(value) {
  if (!value) return null;
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) {
    const err = new Error("Invalid dueDate");
    err.statusCode = 400;
    throw err;
  }
  return d;
}

/**
 * Create task for a contact
 * ownerId will be contact owner (current user in normal flow)
 */
export async function createTask(currentUser, contactId, data) {
  await assertCanAccessContact(currentUser, contactId);

  const { title, dueDate } = data;

  if (!title || typeof title !== "string" || !title.trim()) {
    const err = new Error("title is required");
    err.statusCode = 400;
    throw err;
  }

  const task = await prisma.task.create({
    data: {
      ownerId: currentUser.id,
      contactId,
      title: title.trim(),
      dueDate: parseDueDate(dueDate),
    },
  });

  return { task };
}

/**
 * Update task fields (title/dueDate) or mark complete/uncomplete
 */
export async function updateTask(currentUser, taskId, data) {
  await assertCanAccessTask(currentUser, taskId);

  const updateData = {};

  if ("title" in data) {
    if (!data.title || typeof data.title !== "string" || !data.title.trim()) {
      const err = new Error("title cannot be empty");
      err.statusCode = 400;
      throw err;
    }
    updateData.title = data.title.trim();
  }

  if ("dueDate" in data) {
    updateData.dueDate = parseDueDate(data.dueDate);
  }

  // mark complete: pass { completed: true } or { completed: false }
  if ("completed" in data) {
    updateData.completedAt = data.completed ? new Date() : null;
  }

  if (Object.keys(updateData).length === 0) {
    const err = new Error("Nothing to update");
    err.statusCode = 400;
    throw err;
  }

  const task = await prisma.task.update({
    where: { id: taskId },
    data: updateData,
  });

  return { task };
}

/**
 * List tasks for a contact (useful for UI)
 */
export async function listTasksForContact(currentUser, contactId) {
  await assertCanAccessContact(currentUser, contactId);

  const tasks = await prisma.task.findMany({
    where: { contactId },
    orderBy: [{ completedAt: "asc" }, { dueDate: "asc" }, { createdAt: "desc" }],
  });

  return { tasks };
}

/**
 * List pending tasks for current user
 * - pending = completedAt is null
 * - optional: dueBefore (ISO date)
 */
export async function listPendingTasks(currentUser, query) {
  const { dueBefore } = query;

  const where = {
    ownerId: currentUser.id,
    completedAt: null,
    ...(dueBefore
      ? {
          dueDate: {
            lte: parseDueDate(dueBefore),
          },
        }
      : {}),
  };

  const tasks = await prisma.task.findMany({
    where,
    orderBy: [{ dueDate: "asc" }, { createdAt: "desc" }],
    include: {
      contact: { select: { id: true, name: true, company: true } },
    },
  });

  return { tasks };
}