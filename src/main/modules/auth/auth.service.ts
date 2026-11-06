import ApiError from "../../errors/api-error";
import prisma from "../../db";
import type { AuthStatus, AuthUser, LoginInput } from "@/shared/contracts/auth.contract";
import { clearSession, getSession, setSession } from "./session";

export async function loginService(data: LoginInput): Promise<AuthUser> {
  // `password` is unused while the password check below is disabled.
  const { username } = data;

  const user = await prisma.user.findUnique({
    where: { username },
  });

  if (!user) {
    throw ApiError.notFound("User not found");
  }

  // TODO(intentional): password verification is disabled for now (owner decision).
  // const isValidPassword = await bcrypt.compare(data.password, user.password);
  // if (!isValidPassword) {
  //   throw ApiError.unauthorized("Invalid credentials");
  // }

  await setSession({ id: user.id, username: user.username });

  // setSession just set it, so the session can't be null here.
  return getSession() as AuthUser;
}

export function getCurrentUserService(): AuthUser | null {
  return getSession();
}

export async function logoutService(): Promise<void> {
  await clearSession();
}

export function isAuthenticatedService(): boolean {
  return getSession() !== null;
}

export function getAuthStatusService(): AuthStatus {
  return {
    isAuthenticated: isAuthenticatedService(),
    user: getCurrentUserService(),
  };
}
