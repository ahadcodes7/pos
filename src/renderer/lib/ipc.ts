import type { IpcResponse } from "@/shared/ipc/contract";

export class IpcError extends Error {
  status: number;
  errors: unknown[];

  constructor(message: string, status: number, errors: unknown[] = []) {
    super(message);
    this.name = "IpcError";
    this.status = status;
    this.errors = errors;
  }
}

/** Resolves to the route's data, or throws IpcError with the message from main. */
export async function unwrap<T>(response: Promise<IpcResponse<T>>): Promise<T> {
  const res = await response;
  if (!res.success) {
    throw new IpcError(res.message || "Request failed", res.status, res.errors);
  }
  return res.data;
}
