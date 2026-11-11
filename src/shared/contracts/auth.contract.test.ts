import { describe, expect, it } from "vitest";
import { LoginInput } from "./auth.contract";

describe("LoginInput", () => {
  it("accepts a username of 3+ chars and a password of 6+ chars", () => {
    expect(LoginInput.parse({ username: "abc", password: "secret" })).toEqual({ username: "abc", password: "secret" });
  });

  it("rejects a short username with the message shown on the login screen", () => {
    const result = LoginInput.safeParse({ username: "ab", password: "secret" });
    expect(result.success).toBe(false);
    expect(result.error?.issues).toEqual([
      expect.objectContaining({ path: ["username"], message: "Username must be at least 3 characters long" }),
    ]);
  });

  it("rejects a short password", () => {
    const result = LoginInput.safeParse({ username: "abc", password: "12345" });
    expect(result.error?.issues).toEqual([
      expect.objectContaining({ path: ["password"], message: "Password must be at least 6 characters long" }),
    ]);
  });

  it("strips unknown keys", () => {
    expect(LoginInput.parse({ username: "abc", password: "secret", admin: true })).not.toHaveProperty("admin");
  });
});
