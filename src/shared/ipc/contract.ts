import type { z } from "zod";

/**
 * One IPC route: channel name plus runtime schemas for what crosses the boundary.
 * Main validates `input` before the handler runs and `output` before replying.
 */
export interface RouteDef<I extends z.ZodType = z.ZodType, O extends z.ZodType = z.ZodType> {
  channel: string;
  input: I;
  output: O;
}

export type RouteGroup = Record<string, RouteDef>;

export function defineRoute<I extends z.ZodType, O extends z.ZodType>(def: RouteDef<I, O>): RouteDef<I, O> {
  return def;
}

/** Envelope every IPC reply is wrapped in (built by src/main/ipc/register.ts). */
export type IpcSuccess<T> = { success: true; data: T };
export type IpcFailure = { success: false; message: string; status: number; errors?: unknown[] };
export type IpcResponse<T> = IpcSuccess<T> | IpcFailure;

export type RouteInput<R extends RouteDef> = z.input<R["input"]>;
export type RouteOutput<R extends RouteDef> = z.output<R["output"]>;

/** Renderer-side function for a route; routes whose input accepts `undefined` take no argument. */
export type RouteCaller<R extends RouteDef> =
  undefined extends RouteInput<R>
    ? (input?: RouteInput<R>) => Promise<IpcResponse<RouteOutput<R>>>
    : (input: RouteInput<R>) => Promise<IpcResponse<RouteOutput<R>>>;

/** Shape of `window.electronAPI` derived from a route registry. */
export type ClientApi<Reg extends Record<string, RouteGroup>> = {
  [M in keyof Reg]: { [N in keyof Reg[M]]: RouteCaller<Reg[M][N]> };
};
