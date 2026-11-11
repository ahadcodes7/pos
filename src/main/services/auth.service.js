import ApiError from "../utils/apiError.util.js";

import prisma from "../db.js";

import bcrypt from "bcryptjs";

import { clearSession, getSession, setSession } from "../auth/session.js";

export async function loginService(data) {
  const { username, password } = data;

  const user = await prisma.user.findUnique({
    where: { username },
  });

  if (!user) {
    throw new ApiError("User not found", 404);
  }

  const isValidPassword = await bcrypt.compare(password, user.password);

  if (!isValidPassword) {
    throw new ApiError("Invalid credentials", 401);
  }

  const session = {
    id: user.id,
    username: user.username,
  };

  await setSession(session);

  return {
    success: true,
    message: "Login successful",
    user: getSession(),
  };
}

export function getCurrentUserService() {
  return getSession();
}

export async function logoutService() {
  clearSession();
  return { success: true };
}

export function isAuthenticatedService() {
  return getSession() !== null;
}
