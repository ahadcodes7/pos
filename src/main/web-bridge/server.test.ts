import type { AddressInfo } from "node:net";
import { afterAll, beforeAll, beforeEach, describe, expect, it } from "vitest";
import { createUser, uniqueUsername } from "@tests/setup/factories";
import { useTestDatabase } from "@tests/setup/test-db";
import { clearSession, getSession } from "../modules/auth/session";
import { createBridgeServer } from "./server";

useTestDatabase();

const server = createBridgeServer();
let base: string;

beforeAll(async () => {
  await new Promise<void>((resolve) => server.listen(0, "127.0.0.1", resolve));
  base = `http://127.0.0.1:${(server.address() as AddressInfo).port}/__bridge/`;
});

afterAll(async () => {
  await new Promise((resolve) => server.close(resolve));
});

beforeEach(async () => {
  await clearSession();
});

function post(channel: string, body?: unknown, headers: Record<string, string> = {}) {
  return fetch(base + encodeURIComponent(channel), {
    method: "POST",
    headers: { "Content-Type": "application/json", ...headers },
    body: body === undefined ? "" : JSON.stringify(body),
  });
}

describe("web auth bridge", () => {
  it("logs in an existing user through the real auth route", async () => {
    const user = await createUser();

    const res = await post("auth:login", { username: user.username, password: user.plainPassword });

    expect(await res.json()).toEqual({
      success: true,
      message: "Login successful",
      data: { id: user.id, username: user.username },
    });
    expect(getSession()).toEqual({ id: user.id, username: user.username });
  });

  it("returns the normal failure envelope for an unknown user", async () => {
    const res = await post("auth:login", { username: uniqueUsername(), password: "password123" });

    expect(await res.json()).toEqual({
      success: false,
      message: "User not found",
      data: null,
      details: { code: "NOT_FOUND" },
    });
  });

  it("reports the signed-in user from auth:status after login", async () => {
    const user = await createUser();
    await post("auth:login", { username: user.username, password: user.plainPassword });

    const res = await post("auth:status");

    expect(await res.json()).toMatchObject({
      success: true,
      data: { isAuthenticated: true, user: { id: user.id, username: user.username } },
    });
  });

  it("does not expose routes outside auth", async () => {
    const res = await post("user:create", { username: uniqueUsername(), password: "password123" });

    expect(res.status).toBe(404);
    expect(await res.json()).toMatchObject({ success: false, data: null, details: { code: "NOT_FOUND" } });
  });

  it("refuses requests sent from another website", async () => {
    const user = await createUser();

    const res = await post(
      "auth:login",
      { username: user.username, password: user.plainPassword },
      { "Sec-Fetch-Site": "cross-site" },
    );

    expect(res.status).toBe(403);
    expect(getSession()).toBeNull();
  });

  it("refuses non-JSON requests, which browsers can send without a CORS check", async () => {
    const user = await createUser();

    const res = await fetch(`${base}auth%3Alogin`, {
      method: "POST",
      headers: { "Content-Type": "text/plain" },
      body: JSON.stringify({ username: user.username, password: user.plainPassword }),
    });

    expect(res.status).toBe(415);
    expect(getSession()).toBeNull();
  });
});
