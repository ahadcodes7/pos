import type { IpcMainInvokeEvent } from "electron";
import { ZodError } from "zod";
import ApiError from "../utils/apiError.util";

// Payload arrives from the renderer untyped; handlers validate it with Zod.
type Handler = (payload: unknown, event: IpcMainInvokeEvent) => unknown;

export function ipcHandler(handler: Handler) {
  return async (event: IpcMainInvokeEvent, payload: unknown) => {
    try {
      const data = await handler(payload, event);
      return {
        success: true,
        data,
      };
    } catch (err) {
      if (err instanceof ApiError) {
        return {
          success: false,
          message: err.message,
          errors: err.errors,
          status: err.status,
        };
      }

      if (err instanceof ZodError) {
        return {
          success: false,
          message: err.issues[0]?.message || "Validation Failed",
          status: 400,
        };
      }

      console.error("Unhandled IPC error:", err);

      return {
        success: false,
        message: "Internal error",
        status: 500,
      };
    }
  };
}
