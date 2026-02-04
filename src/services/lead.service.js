import prisma from "../prisma.js";

/**
 * Create lead for current user (ownerId)
 */
export async function createLead(ownerId, data) {
  const { name, email, phone, company, source, status } = data;

  if (!name || typeof name !== "string") {
    const err = new Error("name is required");
    err.statusCode = 400;
    throw err;
  }

  const lead = await prisma.lead.create({
    data: {
      ownerId,
      name: name.trim(),
      email: email || null,
      phone: phone || null,
      company: company || null,
      source: source || null,
      status: status || undefined, // must match enum if provided
    },
  });

  return { lead };
}

/**
 * Update lead (owner only)
 */
export async function updateLead(ownerId, leadId, data) {
	console.log([ownerId,parseInt(leadId)]);
	 
  const existing = await prisma.lead.findFirst({
    where: { id: parseInt(leadId), ownerId },
  });

  if (!existing) {
    const err = new Error("Lead not found");
    err.statusCode = 404;
    throw err;
  }

  // Only allow editable fields
  const updateData = {};
  const allowed = ["name", "email", "phone", "company", "source", "status"];

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

  if (Object.keys(updateData).length === 0) {
    const err = new Error("Nothing to update");
    err.statusCode = 400;
    throw err;
  }

  const lead = await prisma.lead.update({
    where: { id: leadId },
    data: updateData,
  });

  return { lead };
}

/**
 * List/search leads (owner only)
 * query: q, status, page, limit
 */
export async function listLeads(ownerId, query) {
  const { q, status, page = 1, limit = 20 } = query;

  const safePage = Math.max(1, Number(page) || 1);
  const safeLimit = Math.min(50, Math.max(1, Number(limit) || 20));
  const skip = (safePage - 1) * safeLimit;

  const where = {
    ownerId,
    ...(status ? { status } : {}),
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
    prisma.lead.findMany({
      where,
      skip,
      take: safeLimit,
      orderBy: { createdAt: "desc" },
    }),
    prisma.lead.count({ where }),
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
 * Convert lead -> contact (owner only)
 * - create contact
 * - set convertedAt + link contact
 */
export async function convertLead(ownerId, leadId) {
  const lead = await prisma.lead.findFirst({
    where: { id: leadId, ownerId },
  });

  if (!lead) {
    const err = new Error("Lead not found");
    err.statusCode = 404;
    throw err;
  }

  if (lead.convertedAt || lead.convertedToContactId) {
    const err = new Error("Lead already converted");
    err.statusCode = 409;
    throw err;
  }

  const result = await prisma.$transaction(async (tx) => {
    const contact = await tx.contact.create({
      data: {
        ownerId,
        name: lead.name,
        email: lead.email,
        phone: lead.phone,
        company: lead.company,
        leadId: lead.id,
      },
    });

    const updatedLead = await tx.lead.update({
      where: { id: lead.id },
      data: {
        convertedAt: new Date(),
        convertedToContactId: contact.id,
        status: "WON",
      },
    });

    return { contact, lead: updatedLead };
  });

  return result;
}