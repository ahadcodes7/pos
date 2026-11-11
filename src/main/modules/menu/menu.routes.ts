import { BrowserWindow } from "electron";
import type { menuRoutes } from "@/shared/contracts/menu.contract";
import type { RouteHandlers } from "../../ipc/register";
import { runEditCommand, runMenuCommand } from "./menu.service";

// Handlers only delegate: input is already validated, output is validated by registerRoutes.
export const menuHandlers: RouteHandlers<typeof menuRoutes> = {
  invoke: (command, event) => {
    const win = BrowserWindow.fromWebContents(event.sender);
    if (win) runMenuCommand(command, win);
    return null;
  },
  edit: (command, event) => {
    runEditCommand(command, event.sender);
    return null;
  },
};
