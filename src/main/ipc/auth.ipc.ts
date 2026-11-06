import { ipcMain } from "electron";
import {
  loginService,
  logoutService,
  getCurrentUserService,
  isAuthenticatedService,
} from "../services/auth.service";
import { loginSchema } from "../schemas/auth.schema";
import { ipcHandler } from "./ipcWrapper";

export function registerAuthIPC() {
  ipcMain.handle(
    "auth:login",
    ipcHandler(async (payload) => {
      const validatedData = loginSchema.parse(payload);
      return await loginService(validatedData);
    })
  );

  ipcMain.handle(
    "auth:logout",
    ipcHandler(async () => {
      return await logoutService();
    })
  );

  ipcMain.handle(
    "auth:status",
    ipcHandler(async () => {
      return {
        isAuthenticated: isAuthenticatedService(),
        user: getCurrentUserService(),
      };
    })
  );

  ipcMain.handle(
    "auth:currentUser",
    ipcHandler(async () => {
      return await getCurrentUserService();
    })
  );
}
