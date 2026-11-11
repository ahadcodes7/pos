import path from "node:path";
import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";

// Standalone on purpose: vite.config.js probes ports and writes .dev-server-url when served.
const alias = {
  "@tests": path.resolve(import.meta.dirname, "tests"),
  "@": path.resolve(import.meta.dirname, "src"),
};

export default defineConfig({
  test: {
    projects: [
      {
        // Runs under Electron's Node (scripts/test-main.mjs): better-sqlite3 is built for it.
        resolve: { alias },
        test: {
          name: "main",
          environment: "node",
          include: ["src/main/**/*.test.ts", "src/shared/**/*.test.ts"],
          // One child process per test file: own module registry, globals and database copy.
          pool: "forks",
          globalSetup: ["tests/setup/main.global-setup.ts"],
          setupFiles: ["tests/setup/main.setup.ts"],
        },
      },
      {
        plugins: [react()],
        resolve: { alias },
        test: {
          name: "renderer",
          environment: "jsdom",
          include: ["src/renderer/**/*.test.{ts,tsx}"],
          setupFiles: ["tests/setup/renderer.setup.ts"],
        },
      },
    ],
    coverage: {
      provider: "v8",
      include: ["src/**/*.{ts,tsx}"],
      exclude: ["src/main/generated/**", "src/**/*.test.*", "src/renderer/components/ui/**"],
    },
  },
});
