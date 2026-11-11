import { app, BrowserWindow, Menu } from "electron";
import { registerIPCHandlers } from "./ipc/index.js";
import { createMainWindow } from "./window.js";

export async function bootstrapApp() {
  await app.whenReady();

  // The app draws its own themed menu bar, so remove Electron's default menu.
  Menu.setApplicationMenu(null);

  registerIPCHandlers();

  createMainWindow();

  app.on("activate", () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createMainWindow();
    }
  });
}
