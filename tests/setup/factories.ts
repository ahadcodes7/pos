import { randomUUID } from "node:crypto";
import bcrypt from "bcryptjs";
import prisma from "@/main/db";

/** A username unique across all tests and files, so data can never collide. */
export const uniqueUsername = (prefix = "user") => `${prefix}_${randomUUID().slice(0, 8)}`;

/** Inserts a user the same way user.service does (bcrypt-hashed password). */
export async function createUser({ username = uniqueUsername(), password = "password123" } = {}) {
  const user = await prisma.user.create({
    data: { username, password: await bcrypt.hash(password, 4) },
  });
  return { ...user, plainPassword: password };
}
