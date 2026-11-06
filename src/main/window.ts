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
    webPreferences: {
      preload: preloadPath,
      contextIsolation: true,
      nodeIntegration: false,
      backgroundThrottling: false,
    },
  });

  await win.loadURL(resolveDevServerUrl());

  if (process.env.NODE_ENV !== "production") {
    win.webContents.openDevTools();
  }

  return win;
}
