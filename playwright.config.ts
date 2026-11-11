import { defineConfig } from "@playwright/test";
import { findFreePort } from "./scripts/free-port.mjs";

// One Vite dev server (the way the app runs today) serves the renderer; every test launches
// its own Electron main process (own database copy, own credential-store namespace) against it.
// The config is evaluated again in every worker; pick the port once and let workers inherit it.
process.env.E2E_RENDERER_URL ??= `http://127.0.0.1:${await findFreePort(4780)}`;
const RENDERER_URL = process.env.E2E_RENDERER_URL;
const port = new URL(RENDERER_URL).port;

export default defineConfig({
  testDir: "e2e",
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: 0,
  reporter: [["list"]],
  timeout: 30_000,
  expect: { timeout: 10_000 },
  globalSetup: "./e2e/global-setup.ts",
  use: { trace: "retain-on-failure" },
  webServer: {
    command: `npx vite --host 127.0.0.1 --port ${port} --strictPort`,
    env: { NO_DEV_SERVER_URL_FILE: "1" },
    url: RENDERER_URL,
    reuseExistingServer: false,
    timeout: 60_000,
  },
});
