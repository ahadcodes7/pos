import { beforeEach, describe, expect, it, vi } from "vitest";
import { createUser, uniqueUsername } from "@tests/setup/factories";
import { keytarMock } from "@tests/setup/keytar.mock";
import { fakeElectronModule, invokeIpc } from "@tests/setup/main-ipc";
import { useTestDatabase } from "@tests/setup/test-db";

vi.mock("electron", () => fakeElectronModule());

// Production wiring: shared route registry + real handlers + real services + real SQLite.
const { registerIPCHandlers } = await import("../../ipc");
const { clearSession, getSession } = await import("./session");

useTestDatabase();
registerIPCHandlers();

const SERVICE = process.env.SERVICE_NAME!;

// NOTE: password verification is intentionally disabled in loginService (owner decision),
// so these tests deliberately make no assertion about wrong passwords either way.

describe("auth IPC routes", () => {
  beforeEach(async () => {
    // The session is process state in main; start every test signed out.
    await clearSession();
  });

  describe("auth:login", () => {
    it("signs in an existing user, returning only id and username", async () => {
      const user = await createUser();

      const reply = await invokeIpc("auth:login", { username: user.username, password: user.plainPassword });

      expect(reply).toEqual({
        success: true,
        message: "Login successful",
        data: { id: user.id, username: user.username },
      });
      expect(getSession()).toEqual({ id: user.id, username: user.username });
      await expect(keytarMock.getPassword(SERVICE, "lastUserId")).resolves.toBe(user.id);
    });

    it("returns NOT_FOUND for an unknown username and stays signed out", async () => {
      const reply = await invokeIpc("auth:login", { username: uniqueUsername(), password: "password123" });

      expect(reply).toEqual({ success: false, message: "User not found", data: null, details: { code: "NOT_FOUND" } });
      expect(getSession()).toBeNull();
      await expect(keytarMock.getPassword(SERVICE, "lastUserId")).resolves.toBeNull();
    });

    it("returns VALIDATION_ERROR before touching the database when credentials are malformed", async () => {
      const reply = await invokeIpc("auth:login", { username: "ab", password: "password123" });

      expect(reply).toMatchObject({
        success: false,
        message: "Username must be at least 3 characters long",
        data: null,
        details: { code: "VALIDATION_ERROR", issues: [{ path: "username" }] },
      });
    });

    it("rejects a payload that is not an object", async () => {
      const reply = await invokeIpc("auth:login", "adi710");
      expect(reply).toMatchObject({ success: false, details: { code: "VALIDATION_ERROR" } });
    });
  });

  describe("auth:status and auth:currentUser", () => {
    it("report signed out before login", async () => {
      await expect(invokeIpc("auth:status")).resolves.toEqual({
        success: true,
        message: "Auth status fetched successfully",
        data: { isAuthenticated: false, user: null },
      });
      await expect(invokeIpc("auth:currentUser")).resolves.toMatchObject({ success: true, data: null });
    });

    it("report the signed-in user after login", async () => {
      const user = await createUser();
      await invokeIpc("auth:login", { username: user.username, password: user.plainPassword });

      await expect(invokeIpc("auth:status")).resolves.toMatchObject({
        data: { isAuthenticated: true, user: { id: user.id, username: user.username } },
      });
      await expect(invokeIpc("auth:currentUser")).resolves.toMatchObject({
        data: { id: user.id, username: user.username },
      });
    });
  });

  describe("auth:logout", () => {
    it("clears the session and the stored last user id, replying with null data", async () => {
      const user = await createUser();
      await invokeIpc("auth:login", { username: user.username, password: user.plainPassword });

      await expect(invokeIpc("auth:logout")).resolves.toEqual({ success: true, message: "Logout successful", data: null });
      expect(getSession()).toBeNull();
      await expect(keytarMock.getPassword(SERVICE, "lastUserId")).resolves.toBeNull();
      await expect(invokeIpc("auth:status")).resolves.toMatchObject({ data: { isAuthenticated: false, user: null } });
    });

    it("is safe to call when already signed out", async () => {
      await expect(invokeIpc("auth:logout")).resolves.toMatchObject({ success: true, data: null });
    });
  });
});
