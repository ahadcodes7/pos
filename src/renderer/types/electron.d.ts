import type { ElectronApi } from "@/shared/ipc/routes";

declare global {
  interface Window {
    /** Exposed by src/preload/index.ts. Only use it from src/renderer/modules/<domain>/api.ts. */
    electronAPI: ElectronApi;
  }
}

export {};
