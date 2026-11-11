import { z } from "zod";
import { defineRoute } from "../ipc/contract";
import { Empty, NoData } from "./common";

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
  login: defineRoute({
    channel: "auth:login",
    input: LoginInput,
    output: AuthUser,
    successMessage: "Login successful",
  }),
  logout: defineRoute({
    channel: "auth:logout",
    input: Empty,
    output: NoData,
    successMessage: "Logout successful",
  }),
  status: defineRoute({
    channel: "auth:status",
    input: Empty,
    output: AuthStatus,
    successMessage: "Auth status fetched successfully",
  }),
  currentUser: defineRoute({
    channel: "auth:currentUser",
    input: Empty,
    output: AuthUser.nullable(),
    successMessage: "Current user fetched successfully",
  }),
};
