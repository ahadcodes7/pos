import { app, BrowserWindow, dialog, ipcMain } from "electron";

const editCommands = new Set([
  "undo",
  "redo",
  "cut",
  "copy",
  "paste",
  "selectAll",
]);

export function registerMenuIPC() {
  ipcMain.handle("menu:edit", (event, command) => {
    if (!editCommands.has(command)) return;
    const contents = event.sender;
    if (typeof contents[command] === "function") {
      contents[command]();
    }
  });

  ipcMain.handle("menu:invoke", (event, command) => {
    const win = BrowserWindow.fromWebContents(event.sender);
    if (!win) return;

    switch (command) {
      case "quit":
        app.quit();
        break;
      case "reload":
        win.webContents.reload();
        break;
      case "toggleDevTools":
        win.webContents.toggleDevTools();
        break;
      case "actualSize":
        win.webContents.setZoomLevel(0);
        break;
      case "zoomIn":
        win.webContents.setZoomLevel(win.webContents.getZoomLevel() + 0.5);
        break;
      case "zoomOut":
        win.webContents.setZoomLevel(win.webContents.getZoomLevel() - 0.5);
        break;
      case "toggleFullScreen":
        win.setFullScreen(!win.isFullScreen());
        break;
      case "about":
        dialog.showMessageBox(win, {
          type: "info",
          title: "NayaHisab",
          message: "NayaHisab POS",
          detail: `Version ${app.getVersion()}`,
          buttons: ["OK"],
        });
        break;
      default:
        break;
    }
  });
}
