import { contextBridge, ipcRenderer } from "electron";
import { ipcRoutes, type ElectronApi } from "@/shared/ipc/routes";

// Build one invoke function per registered route. Only these functions are exposed;
// the renderer never sees ipcRenderer or arbitrary channels.
const electronAPI = Object.fromEntries(
  Object.entries(ipcRoutes).map(([moduleName, group]) => [
    moduleName,
    Object.fromEntries(
      Object.entries(group).map(([routeName, route]) => [
        routeName,
        (input?: unknown) => ipcRenderer.invoke(route.channel, input),
      ]),
    ),
  ]),
  // Object.fromEntries erases key types; the structure above mirrors ElectronApi exactly.
) as ElectronApi;

contextBridge.exposeInMainWorld("electronAPI", electronAPI);
