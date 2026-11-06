// Bundles the Electron main and preload processes into dist-electron/.
// Renderer is built separately by Vite. Type-checking is done by `npm run typecheck`.
import { build } from "esbuild";

const common = {
  bundle: true,
  platform: "node",
  target: "node22",
  sourcemap: true,
  tsconfig: "tsconfig.node.json",
  logLevel: "info",
};

await Promise.all([
  build({
    ...common,
    entryPoints: ["src/main/index.js"],
    outfile: "dist-electron/main.js",
    format: "esm",
    // node_modules (electron, prisma runtime, native modules) are loaded at runtime.
    packages: "external",
  }),
  build({
    ...common,
    entryPoints: ["src/preload/index.cjs"],
    outfile: "dist-electron/preload.cjs",
    format: "cjs",
    // Sandboxed preload can only require "electron"; everything else is bundled.
    external: ["electron"],
  }),
]);
