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

async function assertCanAccessNote(currentUser, noteId) {
  const note = await prisma.note.findUnique({
    where: { id: noteId },
    select: { id: true, contactId: true, contact: { select: { ownerId: true } } },
  });

  if (!note) {
    const err = new Error("Note not found");
    err.statusCode = 404;
    throw err;
  }

  const isPrivileged = ["ADMIN", "DEV"].includes(currentUser.role);
  const isOwner = note.contact.ownerId === currentUser.id;

  if (!isOwner && !isPrivileged) {
    const err = new Error("Forbidden");
    err.statusCode = 403;
    throw err;
  }

  return note;
}

/**
 * Add note to contact
 */
export async function addNote(currentUser, contactId, data) {
  await assertCanAccessContact(currentUser, contactId);

  const { body } = data;

  if (!body || typeof body !== "string" || !body.trim()) {
    const err = new Error("body is required");
    err.statusCode = 400;
    throw err;
  }

  const note = await prisma.note.create({
    data: {
      contactId,
      body: body.trim(),
    },
  });

  return { note };
}

/**
 * Edit note
 */
export async function updateNote(currentUser, noteId, data) {
  await assertCanAccessNote(currentUser, noteId);

  const { body } = data;

  if (!body || typeof body !== "string" || !body.trim()) {
    const err = new Error("body is required");
    err.statusCode = 400;
    throw err;
  }

  const note = await prisma.note.update({
    where: { id: noteId },
    data: { body: body.trim() },
  });

  return { note };
}

/**
 * Delete note
 */
export async function deleteNote(currentUser, noteId) {
  await assertCanAccessNote(currentUser, noteId);

  await prisma.note.delete({ where: { id: noteId } });

  return { success: true };
}

/**
 * Timeline view per contact (notes only for now)
 * Later we’ll merge tasks here.
 */
export async function listNotesForContact(currentUser, contactId) {
  await assertCanAccessContact(currentUser, contactId);

  const notes = await prisma.note.findMany({
    where: { contactId },
    orderBy: { createdAt: "desc" },
  });

  return { notes };
}