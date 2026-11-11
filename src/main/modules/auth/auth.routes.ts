import type { authRoutes } from "@/shared/contracts/auth.contract";
import type { RouteHandlers } from "../../ipc/register";
import {
  getAuthStatusService,
  getCurrentUserService,
  loginService,
  logoutService,
} from "./auth.service";

// Handlers only delegate: input is already validated, output is validated by registerRoutes.
export const authHandlers: RouteHandlers<typeof authRoutes> = {
  login: (input) => loginService(input),
  logout: async () => {
    await logoutService();
    return null;
  },
  status: () => getAuthStatusService(),
  currentUser: () => getCurrentUserService(),
};
