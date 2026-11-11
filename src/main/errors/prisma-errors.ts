import { Prisma } from "../generated/prisma/client.ts";
import ApiError from "./api-error";

/** Fields of a unique/FK violation; driver adapters report them under driverAdapterError.cause. */
function constraintFields(meta: Record<string, unknown> | undefined): string[] {
  const target = meta?.target;
  if (Array.isArray(target)) return target.map(String);
  if (typeof target === "string") return [target];

  const cause = (meta?.driverAdapterError as { cause?: { constraint?: { fields?: unknown } } } | undefined)?.cause;
  const fields = cause?.constraint?.fields;
  return Array.isArray(fields) ? fields.map(String) : [];
}

/**
 * Maps known Prisma errors to user-facing ApiErrors. Returns null for errors that are
 * programmer/engine faults; the caller treats those as internal errors.
 */
export function fromPrismaError(err: unknown): ApiError | null {
  if (err instanceof Prisma.PrismaClientInitializationError) {
    return new ApiError("DB_UNAVAILABLE", "Database unavailable");
  }

  if (!(err instanceof Prisma.PrismaClientKnownRequestError)) return null;

  const model = typeof err.meta?.modelName === "string" ? err.meta.modelName : "Record";

  switch (err.code) {
    case "P2002": {
      const fields = constraintFields(err.meta);
      const what = fields.length ? ` with this ${fields.join(", ")}` : "";
      return ApiError.conflict(`${model}${what} already exists`, { fields });
    }
    case "P2025":
      return ApiError.notFound(`${model} not found`);
    case "P2003":
      return ApiError.conflict("Related record constraint failed", { fields: constraintFields(err.meta) });
    case "P2000":
      return new ApiError("VALIDATION_ERROR", "A value is too long for its field");
    default:
      return null;
  }
}
