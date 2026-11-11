import { z } from "zod";
import { defineRoute } from "../ipc/contract";
import { Empty } from "./common";

export const CreateUserInput = z.object({
  username: z.string().min(3, "Username must be at least 3 characters"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});
export type CreateUserInput = z.infer<typeof CreateUserInput>;

export const UserFilter = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(20),
  search: z.string().optional(),
});
export type UserFilter = z.infer<typeof UserFilter>;

export const CreatedUser = z.object({
  id: z.string(),
  username: z.string(),
});
export type CreatedUser = z.infer<typeof CreatedUser>;

export const UserListItem = z.object({
  id: z.string(),
  username: z.string(),
  createdAt: z.date(),
  updatedAt: z.date(),
});
export type UserListItem = z.infer<typeof UserListItem>;

export const userRoutes = {
  create: defineRoute({
    channel: "user:create",
    input: CreateUserInput,
    output: CreatedUser,
    successMessage: "User created successfully",
  }),
  list: defineRoute({
    channel: "user:list",
    input: Empty,
    output: z.array(UserListItem),
    successMessage: "Users fetched successfully",
  }),
};
