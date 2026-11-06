import { registerUserIPC } from "./user.ipc";
import { registerAuthIPC } from "./auth.ipc";

export function registerIPCHandlers() {
  registerUserIPC();
  registerAuthIPC();
}
