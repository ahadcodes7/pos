import { ipcRoutes } from "@/shared/ipc/routes";
import { authHandlers } from "../modules/auth/auth.routes";
import { menuHandlers } from "../modules/menu/menu.routes";
import { userHandlers } from "../modules/user/user.routes";
import { registerRoutes } from "./register";

export function registerIPCHandlers() {
  registerRoutes(ipcRoutes, {
    auth: authHandlers,
    user: userHandlers,
    menu: menuHandlers,
  });
}
