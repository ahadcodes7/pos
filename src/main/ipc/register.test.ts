import { afterEach, beforeEach, describe, expect, it, vi, type MockInstance } from "vitest";
import { z } from "zod";
import { defineRoute } from "@/shared/ipc/contract";
import ApiError from "../errors/api-error";

// Capture what registerRoutes hands to ipcMain.handle so routes can be invoked directly.
const { handlers } = vi.hoisted(() => ({ handlers: new Map<string, (event: unknown, payload: unknown) => Promise<unknown>>() }));
vi.mock("electron", () => ({
  ipcMain: { handle: (channel: string, fn: (event: unknown, payload: unknown) => Promise<unknown>) => handlers.set(channel, fn) },
}));

const { registerRoutes } = await import("./register");

const invoke = (channel: string, payload?: unknown) => {
  const handler = handlers.get(channel);
  if (!handler) throw new Error(`not registered: ${channel}`);
  return handler({}, payload);
};

// Channels are unique per test: registerRoutes rejects duplicates for the whole process.
let n = 0;
const channel = (name: string) => `test:${name}-${++n}`;

describe("registerRoutes", () => {
  let consoleError: MockInstance<typeof console.error>;
  beforeEach(() => {
    consoleError = vi.spyOn(console, "error").mockImplementation(() => {});
  });
  afterEach(() => {
    consoleError.mockRestore();
  });

  it("validates input, calls the handler with parsed input and replies with the route's success message", async () => {
    const route = defineRoute({
      channel: channel("greet"),
      input: z.object({ name: z.string().trim() }),
      output: z.object({ greeting: z.string() }),
      successMessage: "Greeted successfully",
    });
    const handler = vi.fn((input: { name: string }) => ({ greeting: `hi ${input.name}` }));
    registerRoutes({ demo: { greet: route } }, { demo: { greet: handler } });

    await expect(invoke(route.channel, { name: "  ada " })).resolves.toEqual({
      success: true,
      message: "Greeted successfully",
      data: { greeting: "hi ada" },
    });
    expect(handler).toHaveBeenCalledWith({ name: "ada" }, expect.anything());
  });

  it("rejects invalid input with VALIDATION_ERROR and never calls the handler", async () => {
    const route = defineRoute({
      channel: channel("create"),
      input: z.object({ qty: z.int().positive("Quantity must be positive") }),
      output: z.null(),
      successMessage: "Created",
    });
    const handler = vi.fn(() => null);
    registerRoutes({ demo: { create: route } }, { demo: { create: handler } });

    await expect(invoke(route.channel, { qty: -1 })).resolves.toEqual({
      success: false,
      message: "Quantity must be positive",
      data: null,
      details: { code: "VALIDATION_ERROR", issues: [{ path: "qty", message: "Quantity must be positive" }] },
    });
    expect(handler).not.toHaveBeenCalled();
  });

  it("strips fields the output schema does not declare, so internals never reach the renderer", async () => {
    const route = defineRoute({
      channel: channel("me"),
      input: z.void(),
      output: z.object({ id: z.string(), username: z.string() }),
      successMessage: "Fetched",
    });
    registerRoutes({ demo: { me: route } }, { demo: { me: () => ({ id: "1", username: "ada", password: "hash" }) } });

    const reply = await invoke(route.channel);
    expect(reply).toEqual({ success: true, message: "Fetched", data: { id: "1", username: "ada" } });
  });

  it("turns a handler result that violates the output schema into a logged INTERNAL_ERROR", async () => {
    const route = defineRoute({
      channel: channel("broken"),
      input: z.void(),
      output: z.object({ total: z.int() }),
      successMessage: "Fetched",
    });
    // Deliberately wrong at runtime, as a buggy service might be.
    registerRoutes({ demo: { broken: route } }, { demo: { broken: () => ({ total: "12.5" }) as unknown as { total: number } } });

    await expect(invoke(route.channel)).resolves.toEqual({
      success: false,
      message: "Something went wrong",
      data: null,
      details: { code: "INTERNAL_ERROR" },
    });
    expect(consoleError).toHaveBeenCalledOnce();
  });

  it("routes errors thrown by the handler (sync or async) through the error pipeline", async () => {
    const sync = defineRoute({ channel: channel("sync"), input: z.void(), output: z.null(), successMessage: "ok" });
    const asyncRoute = defineRoute({ channel: channel("async"), input: z.void(), output: z.null(), successMessage: "ok" });
    registerRoutes(
      { demo: { sync, asyncRoute } },
      {
        demo: {
          sync: () => {
            throw ApiError.forbidden();
          },
          asyncRoute: async () => {
            throw ApiError.notFound("Order not found");
          },
        },
      },
    );

    await expect(invoke(sync.channel)).resolves.toMatchObject({ success: false, message: "Not allowed", details: { code: "FORBIDDEN" } });
    await expect(invoke(asyncRoute.channel)).resolves.toMatchObject({ message: "Order not found", details: { code: "NOT_FOUND" } });
  });

  it("refuses to register the same channel twice", () => {
    const route = defineRoute({ channel: channel("dup"), input: z.void(), output: z.null(), successMessage: "ok" });
    registerRoutes({ a: { r: route } }, { a: { r: () => null } });

    expect(() => registerRoutes({ b: { r: route } }, { b: { r: () => null } })).toThrow(`IPC channel registered twice: ${route.channel}`);
  });

  it("refuses a registry entry without a handler", () => {
    const route = defineRoute({ channel: channel("orphan"), input: z.void(), output: z.null(), successMessage: "ok" });
    // The type system already prevents this; the runtime check guards hand-built registries.
    const handlersWithGap = { a: {} } as unknown as Parameters<typeof registerRoutes<{ a: { r: typeof route } }>>[1];

    expect(() => registerRoutes({ a: { r: route } }, handlersWithGap)).toThrow("No handler for IPC route a.r");
  });
});
