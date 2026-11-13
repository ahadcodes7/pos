import { describe, expect, it } from "vitest";
import { screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Route } from "react-router-dom";
import { ThemeProvider } from "@/renderer/context/theme-context";
import { installFakeElectronApi } from "@tests/setup/fake-electron-api";
import { renderRoutes } from "@tests/setup/render";
import Dashboard from "./Dashboard";
import Home from "./home/Home";
import ProtectedRoute from "@/renderer/routes/ProtectedRoute";

const user = { id: "6f1c2a52-9d7e-4a3b-8f10-2b5d4c3e1a90", username: "cashier1" };

const app = (
  <>
    <Route path="/login" element={<div>Login page</div>} />
    <Route path="/dashboard" element={<ProtectedRoute />}>
      <Route
        element={
          <ThemeProvider>
            <Dashboard />
          </ThemeProvider>
        }
      >
        <Route index element={<Home />} />
        <Route path="product/add" element={<div>Add product page</div>} />
        <Route path="invoice/sale/create" element={<div>Sale page</div>} />
        <Route path="settings" element={<div>Settings page</div>} />
      </Route>
    </Route>
  </>
);

function renderDashboard(initialPath: string) {
  // Keeps state like main does: after logout, status reports signed out.
  let signedIn = true;
  const api = installFakeElectronApi({
    auth: {
      status: () => (signedIn ? { isAuthenticated: true, user } : { isAuthenticated: false, user: null }),
      logout: () => {
        signedIn = false;
        return null;
      },
    },
  });
  renderRoutes(app, { initialPath });
  return api;
}

describe("Dashboard shell", () => {
  it("keeps Settings out of the main menu and marks the footer gear on settings pages", async () => {
    renderDashboard("/dashboard/settings");

    const nav = await screen.findByRole("navigation");
    expect(within(nav).queryByRole("button", { name: "Settings" })).not.toBeInTheDocument();
    expect(within(nav).getByRole("button", { name: "Home" })).not.toHaveAttribute("aria-current");
    expect(screen.getByRole("button", { name: "Settings" })).toHaveAttribute("aria-current", "page");
    expect(screen.getByRole("heading", { level: 1, name: "Settings" })).toBeInTheDocument();
  });

  it("opens Settings from the sidebar gear", async () => {
    renderDashboard("/dashboard");
    const ue = userEvent.setup();

    await ue.click(await screen.findByRole("button", { name: "Settings" }));

    expect(await screen.findByText("Settings page")).toBeInTheDocument();
    expect(screen.getByTestId("location")).toHaveTextContent("/dashboard/settings");
  });

  it("opens the account menu from the navbar avatar and goes to Settings", async () => {
    renderDashboard("/dashboard");
    const ue = userEvent.setup();

    const navbar = await screen.findByRole("banner");
    await ue.click(await within(navbar).findByRole("button", { name: "Account menu for cashier1" }));
    const menu = await screen.findByRole("menu");
    expect(within(menu).getByText("cashier1")).toBeInTheDocument();
    expect(within(menu).getByRole("menuitem", { name: "Dark mode" })).toBeInTheDocument();

    await ue.click(within(menu).getByRole("menuitem", { name: "Settings" }));
    expect(await screen.findByText("Settings page")).toBeInTheDocument();
  });

  it("signs out from the account menu and returns to the login screen", async () => {
    const api = renderDashboard("/dashboard");
    const ue = userEvent.setup();

    const sidebar = await screen.findByRole("complementary");
    await ue.click(await within(sidebar).findByRole("button", { name: "Account menu for cashier1" }));
    await ue.click(await screen.findByRole("menuitem", { name: "Sign out" }));

    expect(await screen.findByText("Login page")).toBeInTheDocument();
    expect(api.auth.logout).toHaveBeenCalledTimes(1);
    expect(screen.getByTestId("location")).toHaveTextContent("/login");
  });

  it("opens the parent of the current child page and shows the section in the navbar", async () => {
    renderDashboard("/dashboard/product/add");

    const nav = await screen.findByRole("navigation");
    expect(within(nav).getByRole("button", { name: "Inventory" })).toHaveAttribute("aria-expanded", "true");
    expect(within(nav).getByRole("button", { name: "Invoice" })).toHaveAttribute("aria-expanded", "false");
    expect(within(nav).getByRole("button", { name: "Add Product" })).toHaveAttribute("aria-current", "page");
    expect(screen.getByRole("heading", { level: 1, name: "Add Product" })).toBeInTheDocument();
    expect(screen.getByRole("banner")).toHaveTextContent("Inventory");
  });

  it("navigates from a child menu item and moves the current-page marker", async () => {
    renderDashboard("/dashboard");
    const ue = userEvent.setup();
    const nav = await screen.findByRole("navigation");

    await ue.click(within(nav).getByRole("button", { name: "Invoice" }));
    await ue.click(within(nav).getByRole("button", { name: "Sale Invoice" }));

    expect(await screen.findByText("Sale page")).toBeInTheDocument();
    expect(screen.getByTestId("location")).toHaveTextContent("/dashboard/invoice/sale/create");
    expect(within(nav).getByRole("button", { name: "Sale Invoice" })).toHaveAttribute("aria-current", "page");
    expect(within(nav).getByRole("button", { name: "Home" })).not.toHaveAttribute("aria-current");
  });

  it("shows the signed-in user's initials once auth status arrives", async () => {
    renderDashboard("/dashboard/settings");

    const triggers = await screen.findAllByRole("button", { name: "Account menu for cashier1" });
    for (const trigger of triggers) expect(trigger).toHaveTextContent("CA");
  });
});

describe("Home", () => {
  it("greets the user and shows the sample analytics sections", async () => {
    renderDashboard("/dashboard");

    expect(await screen.findByRole("heading", { level: 2, name: /cashier1$/ })).toBeInTheDocument();
    expect(screen.getByText("Sample data")).toBeInTheDocument();
    const figures = screen.getByRole("region", { name: "Key figures" });
    for (const label of ["Today's sales", "Invoices today", "Average basket", "Low-stock items"]) {
      expect(within(figures).getByText(label)).toBeInTheDocument();
    }
    for (const title of ["Sales trend", "Payment mix", "Sales by hour", "Top products", "Recent invoices"]) {
      expect(screen.getByText(title)).toBeInTheDocument();
    }
  });
});
