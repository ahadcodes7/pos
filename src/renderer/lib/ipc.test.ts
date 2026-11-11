import { describe, expect, it } from "vitest";
import { IpcError, unwrap } from "./ipc";

describe("unwrap", () => {
  it("resolves to data on success", async () => {
    await expect(unwrap(Promise.resolve({ success: true, message: "ok", data: { id: "1" } }))).resolves.toEqual({ id: "1" });
  });

  it("resolves null data as null (routes with no result)", async () => {
    await expect(unwrap(Promise.resolve({ success: true, message: "ok", data: null }))).resolves.toBeNull();
  });

  it("throws IpcError carrying main's message, code and details on failure", async () => {
    const details = { code: "CONFLICT" as const, fields: ["username"] };
    const error = await unwrap(
      Promise.resolve({ success: false as const, message: "User with this username already exists", data: null, details }),
    ).catch((e: unknown) => e);

    expect(error).toBeInstanceOf(IpcError);
    expect(error).toMatchObject({ message: "User with this username already exists", code: "CONFLICT", details });
  });

  it("defaults the code to INTERNAL_ERROR when main sent no details", async () => {
    const error = await unwrap(Promise.resolve({ success: false as const, message: "boom", data: null })).catch((e: unknown) => e);
    expect(error).toMatchObject({ code: "INTERNAL_ERROR", details: undefined });
  });
});
