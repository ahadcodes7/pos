import { ipcMain, type IpcMainInvokeEvent } from "electron";
import type { z } from "zod";
import { ZodError } from "zod";
import ApiError from "../utils/apiError.util";
import type { IpcResponse, RouteDef, RouteGroup } from "@/shared/ipc/contract";

/** Handler for a route: receives validated input, returns data matching the output schema. */
export type RouteHandler<R extends RouteDef> = (
  input: z.output<R["input"]>,
  event: IpcMainInvokeEvent,
) => z.input<R["output"]> | Promise<z.input<R["output"]>>;

export type RouteHandlers<G extends RouteGroup> = { [K in keyof G]: RouteHandler<G[K]> };

export type RegistryHandlers<Reg extends Record<string, RouteGroup>> = {
  [M in keyof Reg]: RouteHandlers<Reg[M]>;
};

class OutputValidationError extends Error {}

const registered = new Set<string>();

function toFailure(err: unknown, channel: string): IpcResponse<never> {
  if (err instanceof ApiError) {
    return { success: false, message: err.message, errors: err.errors, status: err.status };
  }
  if (err instanceof ZodError) {
    return { success: false, message: err.issues[0]?.message || "Validation Failed", status: 400 };
  }
  console.error(`Unhandled IPC error on "${channel}":`, err);
  return { success: false, message: "Internal error", status: 500 };
}

function registerRoute<I extends z.ZodType, O extends z.ZodType>(
  route: RouteDef<I, O>,
  handler: RouteHandler<RouteDef<I, O>>,
) {
  if (registered.has(route.channel)) {
    throw new Error(`IPC channel registered twice: ${route.channel}`);
  }
  registered.add(route.channel);

  ipcMain.handle(route.channel, async (event, payload: unknown): Promise<IpcResponse<z.output<O>>> => {
    try {
      const input = route.input.parse(payload);
      const result = await handler(input, event);
      const parsed = route.output.safeParse(result);
      if (!parsed.success) {
        throw new OutputValidationError(`Output for "${route.channel}" failed its schema: ${parsed.error.message}`);
      }
      return { success: true, data: parsed.data };
    } catch (err) {
      return toFailure(err, route.channel);
    }
  });
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
