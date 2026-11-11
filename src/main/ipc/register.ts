import { ipcMain } from "electron";
import type { z } from "zod";
import type { RouteDef, RouteGroup } from "@/shared/ipc/contract";
import { executeRoute, type RouteHandler } from "./execute";

export type { RouteHandler };

export type RouteHandlers<G extends RouteGroup> = { [K in keyof G]: RouteHandler<G[K]> };

export type RegistryHandlers<Reg extends Record<string, RouteGroup>> = {
  [M in keyof Reg]: RouteHandlers<Reg[M]>;
};

const registered = new Set<string>();

function registerRoute<I extends z.ZodType, O extends z.ZodType>(
  route: RouteDef<I, O>,
  handler: RouteHandler<RouteDef<I, O>>,
) {
  if (registered.has(route.channel)) {
    throw new Error(`IPC channel registered twice: ${route.channel}`);
  }
  registered.add(route.channel);

  ipcMain.handle(route.channel, (event, payload: unknown) => executeRoute(route, handler, payload, event));
}

/** Registers every route of every module; the type requires a handler for each route. */
export function registerRoutes<Reg extends Record<string, RouteGroup>>(registry: Reg, handlers: RegistryHandlers<Reg>) {
  // The public signature guarantees handlers match the registry; iterating needs the widened shape.
  const byModule = handlers as Record<string, Record<string, RouteHandler<RouteDef>>>;
  for (const [moduleName, group] of Object.entries(registry)) {
    for (const [routeName, route] of Object.entries(group)) {
      const handler = byModule[moduleName]?.[routeName];
      if (!handler) throw new Error(`No handler for IPC route ${moduleName}.${routeName}`);
      registerRoute(route, handler);
    }
  }
}
