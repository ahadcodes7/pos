import type { IpcResponse } from "@/shared/ipc/contract";
import type { ErrorCode, ErrorDetails } from "@/shared/ipc/errors";

export class IpcError extends Error {
  readonly code: ErrorCode;
  readonly details: ErrorDetails | undefined;

  constructor(message: string, details?: ErrorDetails) {
    super(message);
    this.name = "IpcError";
    this.code = details?.code ?? "INTERNAL_ERROR";
    this.details = details;
  }
}

/** Resolves to the route's data, or throws IpcError carrying main's message and details. */
export async function unwrap<T>(response: Promise<IpcResponse<T>>): Promise<T> {
  const res = await response;
  if (!res.success) {
    throw new IpcError(res.message || "Request failed", res.details);
  }
  return res.data;
}
