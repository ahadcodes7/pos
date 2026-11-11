import { describe, expect, it } from "vitest";
import { act, screen } from "@testing-library/react";
import { Route } from "react-router-dom";
import type { AuthStatus } from "@/shared/contracts/auth.contract";
import ProtectedRoute from "@/renderer/routes/ProtectedRoute";
import { deferred } from "@tests/setup/deferred";
import { installFakeElectronApi } from "@tests/setup/fake-electron-api";
import { renderRoutes } from "@tests/setup/render";

const user = { id: "6f1c2a52-9d7e-4a3b-8f10-2b5d4c3e1a90", username: "cashier1" };

const protectedApp = (
  <>
    <Route path="/login" element={<div>Login screen</div>} />
    <Route path="/dashboard" element={<ProtectedRoute />}>
      <Route index element={<div>Dashboard home</div>} />
    </Route>
  </>
);

describe("AuthProvider + ProtectedRoute", () => {
  it("shows a loading state until the auth status arrives", async () => {
    const status = deferred<AuthStatus>();
    installFakeElectronApi({ auth: { status: () => status.promise } });

    renderRoutes(protectedApp, { initialPath: "/dashboard" });

    expect(screen.getByText("Loading...")).toBeInTheDocument();
    expect(screen.queryByText("Dashboard home")).not.toBeInTheDocument();

    await act(async () => status.resolve({ isAuthenticated: true, user }));
    expect(await screen.findByText("Dashboard home")).toBeInTheDocument();
  });

  it("redirects to /login when main reports no session", async () => {
    installFakeElectronApi({ auth: { status: () => ({ isAuthenticated: false, user: null }) } });

    renderRoutes(protectedApp, { initialPath: "/dashboard" });

    expect(await screen.findByText("Login screen")).toBeInTheDocument();
    expect(screen.getByTestId("location")).toHaveTextContent("/login");
  });

  it("keeps the user on the protected page when main still has a session (e.g. after a renderer reload)", async () => {
    const api = installFakeElectronApi({ auth: { status: () => ({ isAuthenticated: true, user }) } });

    renderRoutes(protectedApp, { initialPath: "/dashboard" });

    expect(await screen.findByText("Dashboard home")).toBeInTheDocument();
    expect(screen.getByTestId("location")).toHaveTextContent("/dashboard");
    expect(api.auth.status).toHaveBeenCalledOnce();
  });

  it("treats a failed status call as signed out", async () => {
    installFakeElectronApi({ auth: { status: () => Promise.reject(new Error("IPC unavailable")) } });

    renderRoutes(protectedApp, { initialPath: "/dashboard" });

    expect(await screen.findByText("Login screen")).toBeInTheDocument();
  });
});
