import { app, dialog, type BrowserWindow, type WebContents } from "electron";
import type { EditCommand, MenuCommand } from "@/shared/contracts/menu.contract";

export function runEditCommand(command: EditCommand, contents: WebContents): void {
  switch (command) {
    case "undo":
      contents.undo();
      break;
    case "redo":
      contents.redo();
      break;
    case "cut":
      contents.cut();
      break;
    case "copy":
      contents.copy();
      break;
    case "paste":
      contents.paste();
      break;
    case "selectAll":
      contents.selectAll();
      break;
  }
}

export function runMenuCommand(command: MenuCommand, win: BrowserWindow): void {
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
      void dialog.showMessageBox(win, {
        type: "info",
        title: "NayaHisab",
        message: "NayaHisab POS",
        detail: `Version ${app.getVersion()}`,
        buttons: ["OK"],
      });
      break;
  }
}
