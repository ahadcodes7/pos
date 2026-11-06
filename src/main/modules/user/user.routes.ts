import type { userRoutes } from "@/shared/contracts/user.contract";
import type { RouteHandlers } from "../../ipc/register";
import { createUserService, listUsersService } from "./user.service";

export const userHandlers: RouteHandlers<typeof userRoutes> = {
  create: (input) => createUserService(input),
  list: () => listUsersService(),
};
