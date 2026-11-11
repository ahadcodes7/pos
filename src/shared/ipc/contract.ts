import { z } from "zod";
import { ErrorDetails } from "./errors";

/**
 * One IPC route: channel name, runtime schemas for what crosses the boundary, and the
 * message sent with a successful reply. Main validates `input` before the handler runs
 * and `output` before replying.
 */
export interface RouteDef<I extends z.ZodType = z.ZodType, O extends z.ZodType = z.ZodType> {
  channel: string;
  input: I;
  output: O;
  successMessage: string;
}

export type RouteGroup = Record<string, RouteDef>;

export function defineRoute<I extends z.ZodType, O extends z.ZodType>(def: RouteDef<I, O>): RouteDef<I, O> {
  return def;
}

/**
 * Standard reply envelope for every IPC call (built only by src/main/ipc/register.ts).
 * success: `message` describes the result; failure: `message` is the first, most obvious
 * error, `data` is null and `details` carries the error code and optional specifics.
 */
export const IpcFailure = z.object({
  success: z.literal(false),
  message: z.string(),
  data: z.null(),
  details: ErrorDetails.optional(),
});
export type IpcFailure = z.infer<typeof IpcFailure>;

export type IpcSuccess<T> = { success: true; message: string; data: T };

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
