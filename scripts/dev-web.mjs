// Runs the renderer in a browser: Vite plus a local bridge to the real auth code.
// The bridge uses Electron's Node because better-sqlite3 is compiled for Electron's ABI.
import { spawn } from "node:child_process";
import { createRequire } from "node:module";
import path from "node:path";
import { findFreePort } from "./free-port.mjs";

const require = createRequire(import.meta.url);
const electron = require("electron"); // resolves to the Electron binary path when run in Node
const vite = path.join(path.dirname(require.resolve("vite/package.json")), "bin", "vite.js");

const port = String(await findFreePort(5199));

const children = [
  spawn(electron, ["dist-electron/web-bridge.js"], {
    stdio: "inherit",
    env: { ...process.env, ELECTRON_RUN_AS_NODE: "1", WEB_BRIDGE_PORT: port },
  }),
  spawn(process.execPath, [vite], {
    stdio: "inherit",
    env: { ...process.env, VITE_WEB_BRIDGE: "1", WEB_BRIDGE_PORT: port, NO_DEV_SERVER_URL_FILE: "1" },
  }),
];

let stopping = false;
function stopAll(code) {
  if (stopping) return;
  stopping = true;
  for (const child of children) child.kill();
  process.exitCode = code;
}

for (const child of children) child.on("exit", (code) => stopAll(code ?? 1));
process.on("SIGINT", () => stopAll(0));
process.on("SIGTERM", () => stopAll(0));
