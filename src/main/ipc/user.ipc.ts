import { ipcMain } from "electron";
import { createUserService, listUsersService } from "../services/user.service";
import { createUserSchema } from "../schemas/user.schema";
import { ipcHandler } from "./ipcWrapper";

export function registerUserIPC() {
  ipcMain.handle(
    "user:create",
    ipcHandler(async (payload) => {
      const validatedData = createUserSchema.parse(payload);
      return await createUserService(validatedData);
    })
  );

  ipcMain.handle(
    "user:list",
    ipcHandler(async () => {
      return await listUsersService();
    })
  );
}
