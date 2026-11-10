import { ipcRoutes, type ElectronApi } from "@/shared/ipc/routes";
import type { IpcFailure } from "@/shared/ipc/contract";

const unreachable: IpcFailure = {
  success: false,
  message: "Can't reach the login service. Is `npm run dev:web` running?",
  data: null,
  details: { code: "INTERNAL_ERROR" },
};

async function callBridge(channel: string, input: unknown) {
  try {
    const res = await fetch(`/__bridge/${encodeURIComponent(channel)}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: input === undefined ? "" : JSON.stringify(input),
    });
    return await res.json();
  } catch {
    return unreachable;
  }
}

// Stands in for the preload when the app is opened in a browser through `npm run dev:web`.
if (import.meta.env.VITE_WEB_BRIDGE === "1" && !window.electronAPI) {
  window.electronAPI = Object.fromEntries(
    Object.entries(ipcRoutes).map(([moduleName, group]) => [
      moduleName,
      Object.fromEntries(
        Object.entries(group).map(([routeName, route]) => [
          routeName,
          (input?: unknown) => callBridge(route.channel, input),
        ]),
      ),
    ]),
    // Object.fromEntries erases key types; the structure above mirrors ElectronApi exactly.
  ) as ElectronApi;
}
