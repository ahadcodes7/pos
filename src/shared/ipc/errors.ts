import { z } from "zod";

/** Machine-readable error categories. Main sets one on every failure (details.code). */
export const ErrorCode = z.enum([
  "VALIDATION_ERROR",
  "BAD_REQUEST",
  "UNAUTHORIZED",
  "FORBIDDEN",
  "NOT_FOUND",
  "CONFLICT",
  "DB_UNAVAILABLE",
  "INTERNAL_ERROR",
]);
export type ErrorCode = z.infer<typeof ErrorCode>;

export const FieldIssue = z.object({
  path: z.string(),
  message: z.string(),
});
export type FieldIssue = z.infer<typeof FieldIssue>;

/** Optional extra information on a failure. */
export const ErrorDetails = z.object({
  code: ErrorCode,
  /** Per-field validation problems. */
  issues: z.array(FieldIssue).optional(),
  /** Fields involved in a conflict (e.g. unique constraint). */
  fields: z.array(z.string()).optional(),
});
export type ErrorDetails = z.infer<typeof ErrorDetails>;
