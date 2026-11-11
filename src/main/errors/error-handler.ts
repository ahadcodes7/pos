import { ZodError } from "zod";
import type { IpcFailure } from "@/shared/ipc/contract";
import ApiError from "./api-error";
import { fromPrismaError } from "./prisma-errors";

/** Thrown by register.ts when a handler's result does not match the route's output schema. */
export class OutputValidationError extends Error {
  override name = "OutputValidationError";
}

const GENERIC_MESSAGE = "Something went wrong";

export function logError(context: string, err: unknown) {
  console.error(`[error] ${context}:`, err);
}

function fromZodError(err: ZodError): ApiError {
  const issues = err.issues.map((issue) => ({ path: issue.path.join("."), message: issue.message }));
  return new ApiError("VALIDATION_ERROR", issues[0]?.message ?? "Validation failed", { issues });
}

/** Turns a known error into an ApiError, or null if it is unexpected. */
function toApiError(err: unknown): ApiError | null {
  if (err instanceof ApiError) return err;
  if (err instanceof ZodError) return fromZodError(err);
  return fromPrismaError(err);
}

/**
 * The single error pipeline for IPC: every failure from any route passes through here.
 * Known errors keep their user-facing message; anything else is logged and replaced by a
 * generic message so internals never reach the renderer.
 */
export function toFailure(err: unknown, channel: string): IpcFailure {
  const known = toApiError(err);

  if (!known || known.code === "INTERNAL_ERROR" || known.code === "DB_UNAVAILABLE") {
    logError(`IPC "${channel}"`, err);
  }

  if (!known) {
    return { success: false, message: GENERIC_MESSAGE, data: null, details: { code: "INTERNAL_ERROR" } };
  }

  return {
    success: false,
    message: known.message,
    data: null,
    details: { code: known.code, ...known.extra },
  };
}
