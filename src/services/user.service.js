import prisma from "../prisma.js";
import bcrypt from "bcrypt";

/**
 * Returns current user profile
 */
export async function getMe(userId) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { id: true, name: true, email: true, role: true, createdAt: true },
  });

  if (!user) {
    const err = new Error("User not found");
    err.statusCode = 404;
    throw err;
  }

  return { user };
}

/**
 * Update current user's profile (MVP: name only; optional: password)
 */
export async function updateMe(userId, data) {
  const { name, password } = data;

  // keep MVP safe: only allow specific fields
  const updateData = {};

  if (typeof name === "string") {
    updateData.name = name.trim() || null;
  }

  // optional: allow password change
  if (typeof password === "string") {
    if (password.length < 6) {
      const err = new Error("password must be at least 6 characters");
      err.statusCode = 400;
      throw err;
    }
    updateData.password = await bcrypt.hash(password, 12);
  }

  if (Object.keys(updateData).length === 0) {
    const err = new Error("Nothing to update");
    err.statusCode = 400;
    throw err;
  }

  const user = await prisma.user.update({
    where: { id: userId },
    data: updateData,
    select: { id: true, name: true, email: true, role: true, createdAt: true },
  });

  return { user };
}

/**
 * Admin/dev only: list users (basic pagination + search)
 */
export async function listUsers({ q, page = 1, limit = 20 }) {
  const safePage = Math.max(1, Number(page) || 1);
  const safeLimit = Math.min(50, Math.max(1, Number(limit) || 20));
  const skip = (safePage - 1) * safeLimit;

  const where = q
    ? {
        OR: [
          { email: { contains: q, mode: "insensitive" } },
          { name: { contains: q, mode: "insensitive" } },
        ],
      }
    : {};

  const [items, total] = await Promise.all([
    prisma.user.findMany({
      where,
      skip,
      take: safeLimit,
      orderBy: { createdAt: "desc" },
      select: { id: true, name: true, email: true, role: true, createdAt: true },
    }),
    prisma.user.count({ where }),
  ]);

  return {
    items,
    page: safePage,
    limit: safeLimit,
    total,
    totalPages: Math.ceil(total / safeLimit),
  };
}