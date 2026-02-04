import prisma from "../prisma.js";

/**
 * Create contact
 * - default ownerId = current user
 * - if ownerId provided: allow only ADMIN/DEV to assign (optional rule)
 */
export async function createContact(currentUser, data) {
  const { name, email, phone, company, ownerId } = data;

  if (!name || typeof name !== "string" || !name.trim()) {
    const err = new Error("name is required");
    err.statusCode = 400;
    throw err;
  }

  // Ownership assignment rules:
  // - normal user can only assign to self
  // - ADMIN/DEV can assign to someone else
  let finalOwnerId = currentUser.id;

  if (ownerId && ownerId !== currentUser.id) {
    if (!["ADMIN", "DEV"].includes(currentUser.role)) {
      const err = new Error("You cannot assign ownerId");
      err.statusCode = 403;
      throw err;
    }
    finalOwnerId = ownerId;
  }

  const contact = await prisma.contact.create({
    data: {
      ownerId: finalOwnerId,
      name: name.trim(),
      email: email || null,
      phone: phone || null,
      company: company || null,
    },
  });

  return { contact };
}

/**
 * Update contact (owner only)
 * - allow ADMIN/DEV to update any contact? (currently: owner only)
 * - allow owner reassignment only for ADMIN/DEV
 */
export async function updateContact(currentUser, contactId, data) {
  const contact = await prisma.contact.findUnique({ where: { id: contactId } });

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

  const updateData = {};
  const allowed = ["name", "email", "phone", "company"];

  for (const key of allowed) {
    if (key in data) updateData[key] = data[key] ?? null;
  }

  if (typeof updateData.name === "string") {
    updateData.name = updateData.name.trim();
    if (!updateData.name) {
      const err = new Error("name cannot be empty");
      err.statusCode = 400;
      throw err;
    }
  }

  // owner assignment (ADMIN/DEV only)
  if ("ownerId" in data) {
    if (!isPrivileged) {
      const err = new Error("Only ADMIN/DEV can reassign owner");
      err.statusCode = 403;
      throw err;
    }
    updateData.ownerId = data.ownerId;
  }

  if (Object.keys(updateData).length === 0) {
    const err = new Error("Nothing to update");
    err.statusCode = 400;
    throw err;
  }

  const updated = await prisma.contact.update({
    where: { id: contactId },
    data: updateData,
  });

  return { contact: updated };
}

/**
 * List/search contacts
 * - normal user: only their contacts
 * - ADMIN/DEV: by default also only theirs (can add ?all=1 later if you want)
 */
export async function listContacts(currentUser, query) {
  const { q, page = 1, limit = 20 } = query;

  const safePage = Math.max(1, Number(page) || 1);
  const safeLimit = Math.min(50, Math.max(1, Number(limit) || 20));
  const skip = (safePage - 1) * safeLimit;
  

  const where = {
    ownerId: currentUser.id,
    ...(q
      ? {
          OR: [
            { name: { contains: q, mode: "insensitive" } },
            { email: { contains: q, mode: "insensitive" } },
            { phone: { contains: q, mode: "insensitive" } },
            { company: { contains: q, mode: "insensitive" } },
          ],
        }
      : {}),
  };

  const [items, total] = await Promise.all([
    prisma.contact.findMany({
      where,
      skip,
      take: safeLimit,
      orderBy: { createdAt: "desc" },
    }),
    prisma.contact.count({ where }),
  ]);

  return {
    items,
    page: safePage,
    limit: safeLimit,
    total,
    totalPages: Math.ceil(total / safeLimit),
  };
}

/**
 * Get a single contact (owner or admin/dev)
 */
export async function getContact(currentUser, contactId) {
  const contact = await prisma.contact.findUnique({
    where: { id: contactId },
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

  return { contact };
}