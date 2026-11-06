import { afterEach, beforeEach, describe, expect, it, vi, type MockInstance } from "vitest";
import { z } from "zod";
import { Prisma } from "../generated/prisma/client.ts";
import ApiError from "./api-error";
import { OutputValidationError, toFailure } from "./error-handler";

const prismaKnown = (code: string, meta?: Record<string, unknown>) =>
  new Prisma.PrismaClientKnownRequestError(`prisma ${code}`, { code, clientVersion: "test", meta });

describe("toFailure", () => {
  let consoleError: MockInstance<typeof console.error>;

  beforeEach(() => {
    consoleError = vi.spyOn(console, "error").mockImplementation(() => {});
  });
  afterEach(() => {
    consoleError.mockRestore();
  });

  it("passes an ApiError through with its code, message and extra details, without logging", () => {
    const err = ApiError.conflict("Already taken", { fields: ["sku"] });

    expect(toFailure(err, "x:y")).toEqual({
      success: false,
      message: "Already taken",
      data: null,
      details: { code: "CONFLICT", fields: ["sku"] },
    });
    expect(consoleError).not.toHaveBeenCalled();
  });

  it("maps a ZodError to VALIDATION_ERROR using the first issue as the message and listing all issues", () => {
    const schema = z.object({ name: z.string().min(2, "Name too short"), age: z.number("Age required") });
    const err = schema.safeParse({ name: "a" }).error;

    expect(toFailure(err, "x:y")).toEqual({
      success: false,
      message: "Name too short",
      data: null,
      details: {
        code: "VALIDATION_ERROR",
        issues: [
          { path: "name", message: "Name too short" },
          { path: "age", message: "Age required" },
        ],
      },
    });
  });

  describe("Prisma errors", () => {
    it("maps P2002 (meta.target) to CONFLICT naming the model and fields", () => {
      const failure = toFailure(prismaKnown("P2002", { modelName: "User", target: ["username"] }), "x:y");
      expect(failure).toMatchObject({
        message: "User with this username already exists",
        details: { code: "CONFLICT", fields: ["username"] },
      });
    });

    it("maps P2002 reported by the SQLite driver adapter (driverAdapterError.cause.constraint)", () => {
      const meta = {
        modelName: "User",
        driverAdapterError: { cause: { kind: "UniqueConstraintViolation", constraint: { fields: ["username"] } } },
      };
      expect(toFailure(prismaKnown("P2002", meta), "x:y")).toMatchObject({
        message: "User with this username already exists",
        details: { code: "CONFLICT", fields: ["username"] },
      });
    });

    it("maps P2002 without field info to a generic conflict message", () => {
      expect(toFailure(prismaKnown("P2002", { modelName: "User" }), "x:y")).toMatchObject({
        message: "User already exists",
        details: { code: "CONFLICT", fields: [] },
      });
    });

    it("maps P2025 to NOT_FOUND", () => {
      expect(toFailure(prismaKnown("P2025", { modelName: "Product" }), "x:y")).toMatchObject({
        message: "Product not found",
        details: { code: "NOT_FOUND" },
      });
    });

    it("maps P2003 to CONFLICT and P2000 to VALIDATION_ERROR", () => {
      expect(toFailure(prismaKnown("P2003"), "x:y").details?.code).toBe("CONFLICT");
      expect(toFailure(prismaKnown("P2000"), "x:y").details?.code).toBe("VALIDATION_ERROR");
    });

    it("maps an initialization error to DB_UNAVAILABLE and logs it", () => {
      const err = new Prisma.PrismaClientInitializationError("cannot open database", "test");
      expect(toFailure(err, "x:y")).toMatchObject({ message: "Database unavailable", details: { code: "DB_UNAVAILABLE" } });
      expect(consoleError).toHaveBeenCalledOnce();
    });

    it("treats unmapped Prisma codes as internal errors", () => {
      expect(toFailure(prismaKnown("P2010"), "x:y")).toMatchObject({
        message: "Something went wrong",
        details: { code: "INTERNAL_ERROR" },
      });
    });
  });

  it.each([
    ["a plain Error", new Error("SQLITE_IOERR at C:\\secret\\path.db")],
    ["an output schema violation", new OutputValidationError("Output for x:y failed its schema: password leaked")],
    ["a thrown string", "kaboom"],
  ])("returns a generic INTERNAL_ERROR for %s, logs it, and never leaks its text", (_label, err) => {
    const failure = toFailure(err, "user:list");

    expect(failure).toEqual({
      success: false,
      message: "Something went wrong",
      data: null,
      details: { code: "INTERNAL_ERROR" },
    });
    expect(JSON.stringify(failure)).not.toMatch(/secret|password|kaboom/);
    expect(consoleError).toHaveBeenCalledWith(expect.stringContaining('IPC "user:list"'), err);
  });
});
