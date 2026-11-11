import { beforeEach, describe, expect, it, vi } from "vitest";
import { act, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Route } from "react-router-dom";
import type { AuthUser } from "@/shared/contracts/auth.contract";
import ProtectedRoute from "@/renderer/routes/ProtectedRoute";
import { deferred } from "@tests/setup/deferred";
import { failure, installFakeElectronApi } from "@tests/setup/fake-electron-api";
import { renderRoutes } from "@tests/setup/render";
import Login from "./Login";

const { toast } = vi.hoisted(() => ({ toast: { success: vi.fn(), error: vi.fn() } }));
vi.mock("sonner", () => ({ toast }));

const user = { id: "6f1c2a52-9d7e-4a3b-8f10-2b5d4c3e1a90", username: "cashier1" };

/**
 * Mirrors main's session: auth:status reflects a successful auth:login, because the
 * protected route refetches status when it mounts (exactly as against the real main process).
 */
function fakeSession() {
  let current: AuthUser | null = null;
  return {
    status: () => ({ isAuthenticated: current !== null, user: current }),
    signIn: (u: AuthUser) => {
      current = u;
      return u;
    },
  };
}

const app = (
  <>
    <Route path="/login" element={<Login />} />
    <Route path="/dashboard" element={<ProtectedRoute />}>
      <Route index element={<div>Dashboard home</div>} />
    </Route>
  </>
);

async function submitCredentials(username: string, password: string) {
  const ue = userEvent.setup();
  await ue.type(screen.getByLabelText("Username"), username);
  await ue.type(screen.getByLabelText("Password"), password);
  await ue.click(screen.getByRole("button", { name: "Login" }));
}

describe("Login", () => {
  beforeEach(() => {
    toast.success.mockClear();
    toast.error.mockClear();
  });

  it("sends the typed credentials and lands on the protected dashboard", async () => {
    const session = fakeSession();
    const api = installFakeElectronApi({ auth: { status: session.status, login: () => session.signIn(user) } });
    renderRoutes(app, { initialPath: "/login" });

    await submitCredentials("cashier1", "secret123");

    expect(await screen.findByText("Dashboard home")).toBeInTheDocument();
    expect(screen.getByTestId("location")).toHaveTextContent("/dashboard");
    expect(api.auth.login).toHaveBeenCalledWith({ username: "cashier1", password: "secret123" });
    expect(toast.success).toHaveBeenCalledWith("Welcome back, cashier1!");
  });

  it("shows main's error message and stays on /login when the user does not exist", async () => {
    installFakeElectronApi({ auth: { status: fakeSession().status, login: () => failure("NOT_FOUND", "User not found") } });
    renderRoutes(app, { initialPath: "/login" });

    await submitCredentials("nobody", "secret123");

    expect(await screen.findByText("User not found")).toBeInTheDocument();
    expect(toast.error).toHaveBeenCalledWith("User not found");
    expect(screen.getByTestId("location")).toHaveTextContent("/login");
  });

  it("shows the first validation message from main", async () => {
    installFakeElectronApi({
      auth: {
        status: fakeSession().status,
        login: () =>
          failure("VALIDATION_ERROR", "Username must be at least 3 characters long", {
            issues: [{ path: "username", message: "Username must be at least 3 characters long" }],
          }),
      },
    });
    renderRoutes(app, { initialPath: "/login" });

    await submitCredentials("ab", "secret123");

    expect(await screen.findByText("Username must be at least 3 characters long")).toBeInTheDocument();
  });

  it("disables the form while the request is in flight and clears a previous error on retry", async () => {
    const session = fakeSession();
    const pending = deferred<AuthUser>();
    let attempt = 0;
    installFakeElectronApi({
      auth: {
        status: session.status,
        login: () => (++attempt === 1 ? failure("NOT_FOUND", "User not found") : pending.promise.then(session.signIn)),
      },
    });
    renderRoutes(app, { initialPath: "/login" });

    await submitCredentials("cashier1", "secret123");
    expect(await screen.findByText("User not found")).toBeInTheDocument();

    await userEvent.setup().click(screen.getByRole("button", { name: "Login" }));

    expect(await screen.findByRole("button", { name: "Logging in..." })).toBeDisabled();
    expect(screen.getByLabelText("Username")).toBeDisabled();
    expect(screen.getByLabelText("Password")).toBeDisabled();
    expect(screen.queryByText("User not found")).not.toBeInTheDocument();

    await act(async () => pending.resolve(user));
    expect(await screen.findByText("Dashboard home")).toBeInTheDocument();
  });
});
