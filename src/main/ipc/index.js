import { registerUserIPC } from "./user.ipc.js";
import { registerAuthIPC } from "./auth.ipc.js";
import { registerMenuIPC } from "./menu.ipc.js";

export function registerIPCHandlers() {
  registerUserIPC();
  registerAuthIPC();
  registerMenuIPC();
}
