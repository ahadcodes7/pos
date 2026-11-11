import { app, BrowserWindow } from "electron";
import fs from "node:fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const DEFAULT_DEV_URL = "http://127.0.0.1:5173";

// `npm run dev` picks a free port (5173 first) and writes its URL to .dev-server-url.
function resolveDevServerUrl(): string {
  if (process.env.DEV_SERVER_URL) return process.env.DEV_SERVER_URL;
  const file = path.join(app.getAppPath(), ".dev-server-url");
  try {
    return fs.readFileSync(file, "utf8").trim() || DEFAULT_DEV_URL;
  } catch {
    console.warn(`No ${file}; start the renderer with \`npm run dev\` first. Falling back to ${DEFAULT_DEV_URL}.`);
    return DEFAULT_DEV_URL;
  }
}

export async function createMainWindow() {
  const preloadPath = path.join(__dirname, "preload.cjs");

  const win = new BrowserWindow({
    width: 1200,
    height: 800,
    minWidth: 960,
    minHeight: 640,
    titleBarStyle: "hidden",
    titleBarOverlay: {
      color: "#FFFDF8",
      symbolColor: "#181A1F",
      height: 36,
    },
    backgroundColor: "#F7F3EA",
    show: false,
    webPreferences: {
      preload: preloadPath,
      contextIsolation: true,
      nodeIntegration: false,
      backgroundThrottling: false,
    },
  });

  // The default menu is replaced by the themed menu bar in the renderer, so keep
  // the developer shortcuts alive here.
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

  await win.loadURL(resolveDevServerUrl());

  if (process.env.NODE_ENV !== "production") {
    win.webContents.openDevTools({ mode: "detach" });
  }

  return win;
}
