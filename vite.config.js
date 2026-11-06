import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import fs from "node:fs";
import path from "path";
import { findFreePort } from "./scripts/free-port.mjs";

const DEV_HOST = "127.0.0.1";
const FIRST_PORT = 5173;
const DEV_URL_FILE = path.resolve(__dirname, ".dev-server-url");

// Writes the dev server URL so the Electron main process can load it (src/main/window.ts).
function devServerUrlFile() {
  const remove = () => fs.rmSync(DEV_URL_FILE, { force: true });
  return {
    name: "dev-server-url-file",
    apply: "serve",
    configureServer(server) {
      // The E2E suite runs its own dev server; it must not replace a developer's session file.
      if (process.env.NO_DEV_SERVER_URL_FILE) return;
      server.httpServer?.once("listening", () => {
        const { port } = server.httpServer.address();
        fs.writeFileSync(DEV_URL_FILE, `http://${DEV_HOST}:${port}`);
      });
      server.httpServer?.once("close", remove);
      process.once("exit", remove);
    },
  };
}

// https://vite.dev/config/
export default defineConfig(async ({ command }) => ({
  plugins: [react(), tailwindcss(), devServerUrlFile()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  server:
    command === "serve"
      ? {
          host: DEV_HOST,
          port: await findFreePort(FIRST_PORT),
          strictPort: true,
          // Transform the app's module graph at startup instead of on the first page load.
          warmup: { clientFiles: ["./src/renderer/main.tsx"] },
        }
      : undefined,
}));
