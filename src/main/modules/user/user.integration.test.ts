import bcrypt from "bcryptjs";
import { describe, expect, it, vi } from "vitest";
import { createUser, uniqueUsername } from "@tests/setup/factories";
import { fakeElectronModule, invokeIpc } from "@tests/setup/main-ipc";
import { useTestDatabase } from "@tests/setup/test-db";

vi.mock("electron", () => fakeElectronModule());

const { registerIPCHandlers } = await import("../../ipc");

const prisma = useTestDatabase();
registerIPCHandlers();

describe("user IPC routes", () => {
  describe("user:create", () => {
    it("creates a user with a bcrypt-hashed password and returns only id and username", async () => {
      const username = uniqueUsername();

      const reply = await invokeIpc("user:create", { username, password: "password123" });

      expect(reply).toEqual({
        success: true,
        message: "User created successfully",
        data: { id: expect.any(String), username },
      });
      const stored = await prisma.user.findUniqueOrThrow({ where: { username } });
      expect(stored.password).not.toBe("password123");
      await expect(bcrypt.compare("password123", stored.password)).resolves.toBe(true);
    });

    it("returns CONFLICT naming the field when the username is taken (real SQLite constraint)", async () => {
      const existing = await createUser();

      const reply = await invokeIpc("user:create", { username: existing.username, password: "password123" });

      expect(reply).toEqual({
        success: false,
        message: "User with this username already exists",
        data: null,
        details: { code: "CONFLICT", fields: ["username"] },
      });
      await expect(prisma.user.count({ where: { username: existing.username } })).resolves.toBe(1);
    });

    it("returns VALIDATION_ERROR listing every invalid field", async () => {
      const reply = await invokeIpc("user:create", { username: "ab", password: "123" });

      expect(reply).toMatchObject({
        success: false,
        message: "Username must be at least 3 characters",
        details: {
          code: "VALIDATION_ERROR",
          issues: [
            { path: "username", message: "Username must be at least 3 characters" },
            { path: "password", message: "Password must be at least 6 characters" },
          ],
        },
      });
      await expect(prisma.user.count()).resolves.toBe(0);
    });
  });

  describe("user:list", () => {
    it("returns exactly this test's users, without password hashes", async () => {
      const a = await createUser();
      const b = await createUser();

      const reply = (await invokeIpc("user:list")) as { success: true; data: Record<string, unknown>[] };

      expect(reply.success).toBe(true);
      expect(reply.data.map((u) => u.username).sort()).toEqual([a.username, b.username].sort());
      for (const user of reply.data) {
        expect(Object.keys(user).sort()).toEqual(["createdAt", "id", "updatedAt", "username"]);
        expect(user.createdAt).toBeInstanceOf(Date);
      }
    });

    it("returns an empty list when there are no users", async () => {
      await expect(invokeIpc("user:list")).resolves.toEqual({ success: true, message: "Users fetched successfully", data: [] });
    });
  });
});
