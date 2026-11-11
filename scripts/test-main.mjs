// Runs the vitest "main" project inside Electron's Node runtime. better-sqlite3 (and other
// native modules) are compiled for Electron's ABI, so plain `node` cannot load them.
// Extra args are forwarded to vitest, e.g. `node scripts/test-main.mjs run` or `... --watch`.
import { spawn } from "node:child_process";
import { createRequire } from "node:module";
import path from "node:path";

const require = createRequire(import.meta.url);
const electron = require("electron"); // resolves to the Electron binary path when run in Node
const vitest = path.join(path.dirname(require.resolve("vitest/package.json")), "vitest.mjs");

const args = process.argv.slice(2);
const child = spawn(electron, [vitest, ...(args.length ? args : ["run"]), "--project", "main"], {
  stdio: "inherit",
  // node:sqlite (used to build the template DB) prints an ExperimentalWarning per worker.
  env: { ...process.env, ELECTRON_RUN_AS_NODE: "1", NODE_OPTIONS: "--disable-warning=ExperimentalWarning" },
});
child.on("exit", (code, signal) => process.exit(signal ? 1 : (code ?? 1)));
