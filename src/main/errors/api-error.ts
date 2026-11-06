import type { ErrorCode, ErrorDetails } from "@/shared/ipc/errors";

type ExtraDetails = Omit<ErrorDetails, "code">;

/**
 * The only error services should throw. Its message is shown to the user as-is, so keep
 * it user-facing. Everything else that escapes a handler is mapped by error-handler.ts.
 */
class ApiError extends Error {
  readonly code: ErrorCode;
  readonly extra: ExtraDetails | undefined;

  constructor(code: ErrorCode, message: string, extra?: ExtraDetails) {
    super(message);
    this.name = "ApiError";
    this.code = code;
    this.extra = extra;

    Error.captureStackTrace(this, this.constructor);
  }

  static badRequest(message: string, extra?: ExtraDetails) {
    return new ApiError("BAD_REQUEST", message, extra);
  }

  static unauthorized(message = "Not signed in") {
    return new ApiError("UNAUTHORIZED", message);
  }

  static forbidden(message = "Not allowed") {
    return new ApiError("FORBIDDEN", message);
  }

  static notFound(message: string) {
    return new ApiError("NOT_FOUND", message);
  }

  static conflict(message: string, extra?: ExtraDetails) {
    return new ApiError("CONFLICT", message, extra);
  }
}

export default ApiError;
