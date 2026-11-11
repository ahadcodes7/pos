import { BrowserWindow } from "electron";
import type { chromeRoutes } from "@/shared/contracts/chrome.contract";
import type { RouteHandlers } from "../../ipc/register";

// OS glue only: `setTitleBarOverlay` exists on Windows; elsewhere the call is a no-op.
export const chromeHandlers: RouteHandlers<typeof chromeRoutes> = {
  set: (colors, event) => {
    if (process.platform === "win32") {
      BrowserWindow.fromWebContents(event.sender)?.setTitleBarOverlay({
        color: colors.color,
        symbolColor: colors.symbolColor,
        height: 36,
      });
    }
    return null;
  },
};
