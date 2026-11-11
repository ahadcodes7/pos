import type { IpcMainInvokeEvent } from "electron";
import type { z } from "zod";
import type { IpcResponse, RouteDef } from "@/shared/ipc/contract";
import { OutputValidationError, toFailure } from "../errors/error-handler";

/** Handler for a route: receives validated input, returns data matching the output schema. */
export type RouteHandler<R extends RouteDef> = (
  input: z.output<R["input"]>,
  event: IpcMainInvokeEvent,
) => z.input<R["output"]> | Promise<z.input<R["output"]>>;

/** Validates input, runs the handler, validates output and builds the reply envelope. */
export async function executeRoute<I extends z.ZodType, O extends z.ZodType>(
  route: RouteDef<I, O>,
  handler: RouteHandler<RouteDef<I, O>>,
  payload: unknown,
  event: IpcMainInvokeEvent,
): Promise<IpcResponse<z.output<O>>> {
  try {
    const input = route.input.parse(payload);
    const result = await handler(input, event);
    const parsed = route.output.safeParse(result);
    if (!parsed.success) {
      throw new OutputValidationError(`Output for "${route.channel}" failed its schema: ${parsed.error.message}`);
    }
    return { success: true, message: route.successMessage, data: parsed.data };
  } catch (err) {
    return toFailure(err, route.channel);
  }
}
