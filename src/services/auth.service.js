import bcrypt from "bcrypt";
import prisma from "../prisma.js";
import { signToken } from "../utils/jwt.js";

export async function signup({ name, email, password }) {
  if (!email || !password) {
    const err = new Error("email and password are required");
    err.statusCode = 400;
    throw err;
  }

  if (typeof password !== "string" || password.length < 6) {
    const err = new Error("password must be at least 6 characters");
    err.statusCode = 400;
    throw err;
  }

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    const err = new Error("Email already in use");
    err.statusCode = 409;
    throw err;
  }

  const hashedPassword = await bcrypt.hash(password, 12);

  const user = await prisma.user.create({
    data: {
      name: name || null,
      email,
      password: hashedPassword,
    },
    select: { id: true, name: true, email: true, role: true, createdAt: true },
  });

  const token = signToken({ sub: user.id, role: user.role });

  return { user, token };
}

export async function login({ email, password }) {
  if (!email || !password) {
    const err = new Error("email and password are required");
    err.statusCode = 400;
    throw err;
  }

  const userWithPassword = await prisma.user.findUnique({ where: { email } });
  if (!userWithPassword) {
    const err = new Error("Invalid credentials");
    err.statusCode = 401;
    throw err;
  }

  const ok = await bcrypt.compare(password, userWithPassword.password);
  if (!ok) {
    const err = new Error("Invalid credentials");
    err.statusCode = 401;
    throw err;
  }

  const user = await prisma.user.findUnique({
    where: { email },
    select: { id: true, name: true, email: true, role: true, createdAt: true },
  });

  const token = signToken({ sub: user.id, role: user.role });

  return { user, token };
}

export async function me(userId) {
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