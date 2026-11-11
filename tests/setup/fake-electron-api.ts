import { vi } from "vitest";
import { ipcRoutes, type ElectronApi, type IpcRoutes } from "@/shared/ipc/routes";
import type { IpcFailure, RouteDef, RouteOutput } from "@/shared/ipc/contract";
import type { ErrorCode, ErrorDetails } from "@/shared/ipc/errors";

type OutputOf<R> = R extends RouteDef ? RouteOutput<R> : never;

/** A failure reply exactly as main's toFailure builds it. */
export function failure(code: ErrorCode, message: string, extra?: Omit<ErrorDetails, "code">): IpcFailure {
  return { success: false, message, data: null, details: { code, ...extra } };
}

type Handlers = {
  [M in keyof IpcRoutes]?: {
    [N in keyof IpcRoutes[M]]?: (input: unknown) => OutputOf<IpcRoutes[M][N]> | IpcFailure | Promise<OutputOf<IpcRoutes[M][N]> | IpcFailure>;
  };
};

function isFailure(value: unknown): value is IpcFailure {
  return typeof value === "object" && value !== null && (value as { success?: unknown }).success === false;
}

/**
 * Installs a fake window.electronAPI built from the real route registry. Handlers return
 * plain data (or failure(...)); success data is parsed with the route's output schema, so a
 * fake can never return something the real main process could not.
 * Routes without a handler reject, so tests must declare every call they rely on.
 */
export function installFakeElectronApi(handlers: Handlers) {
  const api: Record<string, Record<string, ReturnType<typeof vi.fn>>> = {};

  for (const [moduleName, group] of Object.entries(ipcRoutes)) {
    api[moduleName] = {};
    for (const [routeName, route] of Object.entries(group)) {
      const handler = (handlers as Record<string, Record<string, (input: unknown) => unknown> | undefined>)[moduleName]?.[routeName];
      api[moduleName][routeName] = vi.fn(async (input?: unknown) => {
        if (!handler) throw new Error(`fake electronAPI: no handler for ${route.channel}`);
        const result = await handler(input);
        if (isFailure(result)) return result;
        return { success: true, message: route.successMessage, data: route.output.parse(result) };
      });
    }
  }

  // The loop above builds exactly the ElectronApi structure from the same registry.
  window.electronAPI = api as unknown as ElectronApi;
  return window.electronAPI as unknown as {
    [M in keyof ElectronApi]: { [N in keyof ElectronApi[M]]: ReturnType<typeof vi.fn> };
  };
}
