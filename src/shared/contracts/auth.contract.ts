import { z } from "zod";
import { defineRoute } from "../ipc/contract";
import { Empty } from "./common";

export const LoginInput = z.object({
  username: z.string().min(3, "Username must be at least 3 characters long"),
  password: z.string().min(6, "Password must be at least 6 characters long"),
});
export type LoginInput = z.infer<typeof LoginInput>;

export const AuthUser = z.object({
  id: z.string(),
  username: z.string(),
});
export type AuthUser = z.infer<typeof AuthUser>;

export const AuthStatus = z.object({
  isAuthenticated: z.boolean(),
  user: AuthUser.nullable(),
});
export type AuthStatus = z.infer<typeof AuthStatus>;

export const authRoutes = {
  login: defineRoute({ channel: "auth:login", input: LoginInput, output: AuthUser }),
  logout: defineRoute({ channel: "auth:logout", input: Empty, output: Empty }),
  status: defineRoute({ channel: "auth:status", input: Empty, output: AuthStatus }),
  currentUser: defineRoute({ channel: "auth:currentUser", input: Empty, output: AuthUser.nullable() }),
};
