import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import fs from "node:fs";
import net from "node:net";
import path from "path";

const DEV_HOST = "127.0.0.1";
const FIRST_PORT = 5173;
const DEV_URL_FILE = path.resolve(__dirname, ".dev-server-url");

// True if anything accepts a connection on host:port.
function isListening(host, port) {
  return new Promise((resolve) => {
    const socket = net.connect({ host, port });
    socket.setTimeout(300);
    socket.once("connect", () => (socket.destroy(), resolve(true)));
    socket.once("timeout", () => (socket.destroy(), resolve(false)));
    socket.once("error", () => resolve(false));
  });
}

// Check both IPv4 and IPv6 loopback: another server may hold the port on a different
// address (e.g. 0.0.0.0 vs ::1), which Vite's own port check does not detect.
async function findFreePort(start) {
  for (let port = start; port < start + 100; port++) {
    const taken = (await isListening("127.0.0.1", port)) || (await isListening("::1", port));
    if (!taken) return port;
  }
  throw new Error(`No free dev server port in ${start}-${start + 99}`);
}

// Writes the dev server URL so the Electron main process can load it (src/main/window.ts).
function devServerUrlFile() {
  const remove = () => fs.rmSync(DEV_URL_FILE, { force: true });
  return {
    name: "dev-server-url-file",
    apply: "serve",
    configureServer(server) {
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
      ? { host: DEV_HOST, port: await findFreePort(FIRST_PORT), strictPort: true }
      : undefined,
}));
