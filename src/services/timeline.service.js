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

export async function getContactTimeline(currentUser, contactId) {
  await assertCanAccessContact(currentUser, contactId);

  const [notes, tasks] = await Promise.all([
    prisma.note.findMany({
      where: { contactId },
      orderBy: { createdAt: "desc" },
      select: { id: true, body: true, createdAt: true, updatedAt: true },
    }),
    prisma.task.findMany({
      where: { contactId },
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        title: true,
        dueDate: true,
        completedAt: true,
        createdAt: true,
        updatedAt: true,
      },
    }),
  ]);

  const items = [
    ...notes.map((n) => ({
      type: "note",
      id: n.id,
      content: n.body,
      createdAt: n.createdAt,
      updatedAt: n.updatedAt,
    })),
    ...tasks.map((t) => ({
      type: "task",
      id: t.id,
      content: t.title,
      dueDate: t.dueDate,
      completedAt: t.completedAt,
      createdAt: t.createdAt,
      updatedAt: t.updatedAt,
    })),
  ].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

  return { items };
}