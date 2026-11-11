import { authRoutes } from "../contracts/auth.contract";
import { chromeRoutes } from "../contracts/chrome.contract";
import { menuRoutes } from "../contracts/menu.contract";
import { userRoutes } from "../contracts/user.contract";
import type { ClientApi } from "./contract";

/** Every IPC route in the app, grouped by module. Main registers it; preload exposes it. */
export const ipcRoutes = {
  auth: authRoutes,
  user: userRoutes,
  menu: menuRoutes,
  chrome: chromeRoutes,
};

export type IpcRoutes = typeof ipcRoutes;
export type ElectronApi = ClientApi<IpcRoutes>;
