import { BrowserWindow } from "electron";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export async function createMainWindow() {
  const preloadPath = path.join(__dirname, "../preload/index.cjs");

  const win = new BrowserWindow({
    width: 1200,
    height: 800,
    minWidth: 960,
    minHeight: 640,
    titleBarStyle: "hidden",
    titleBarOverlay: {
      color: "#0B0B0C",
      symbolColor: "#FFFFFF",
      height: 36,
    },
    backgroundColor: "#0B0B0C",
    show: false,
    webPreferences: {
      preload: preloadPath,
      contextIsolation: true,
      nodeIntegration: false,
      backgroundThrottling: false,
    },
  });

  // The default menu is replaced by the themed menu bar in the renderer.
  win.webContents.on("before-input-event", (event, input) => {
    if (process.env.NODE_ENV === "production" || input.type !== "keyDown") {
      return;
    }

    const key = input.key.toLowerCase();

    if (input.key === "F12" || (input.control && input.shift && key === "i")) {
      win.webContents.toggleDevTools();
      event.preventDefault();
    } else if (input.control && key === "r") {
      win.webContents.reload();
      event.preventDefault();
    }
  });

  win.once("ready-to-show", () => {
    win.show();
  });

  await win.loadURL("http://localhost:5173");

  if (process.env.NODE_ENV !== "production") {
    win.webContents.openDevTools({ mode: "detach" });
  }

  return win;
}
