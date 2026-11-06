import { vi } from "vitest";

type IpcHandler = (event: unknown, payload: unknown) => Promise<unknown>;

const handlers = new Map<string, IpcHandler>();

/**
 * Replaces Electron's ipcMain with a recorder. Call from a test file's vi.mock factory:
 *   vi.mock("electron", () => fakeElectronModule());
 * then register routes as production does and call them with `invokeIpc(channel, payload)`.
 */
export function fakeElectronModule() {
  return {
    ipcMain: { handle: vi.fn((channel: string, fn: IpcHandler) => handlers.set(channel, fn)) },
  };
}

/** Calls a registered channel exactly as ipcRenderer.invoke would reach it in main. */
export async function invokeIpc(channel: string, payload?: unknown) {
  const handler = handlers.get(channel);
  if (!handler) throw new Error(`IPC channel not registered: ${channel}`);
  return handler({ sender: {} }, payload);
}
