import { app, BrowserWindow } from "electron";
import { registerIPCHandlers } from "./ipc/index";
import { createMainWindow } from "./window";

export async function bootstrapApp() {
  await app.whenReady();

  registerIPCHandlers();

  createMainWindow();

  app.on("activate", () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createMainWindow();
    }
  });
}
