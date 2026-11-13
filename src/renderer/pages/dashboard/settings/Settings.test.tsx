import { describe, expect, it } from "vitest";
import { screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Navigate, Route } from "react-router-dom";
import { ThemeProvider } from "@/renderer/context/theme-context";
import { installFakeElectronApi } from "@tests/setup/fake-electron-api";
import { renderRoutes } from "@tests/setup/render";
import { SettingsProvider } from "./SettingsProvider";
import SettingsLayout from "./SettingsLayout";
import SettingsSection from "./SettingsSection";

function renderSettings(initialPath = "/dashboard/settings/business") {
  installFakeElectronApi({ auth: { status: () => ({ isAuthenticated: true, user: { id: "6f1c2a52-9d7e-4a3b-8f10-2b5d4c3e1a90", username: "cashier1" } }) } });
  renderRoutes(
    <Route
      path="/dashboard/settings"
      element={
        <ThemeProvider>
          <SettingsProvider>
            <SettingsLayout />
          </SettingsProvider>
        </ThemeProvider>
      }
    >
      <Route index element={<Navigate to="business" replace />} />
      <Route path=":section" element={<SettingsSection />} />
    </Route>,
    { initialPath },
  );
  return userEvent.setup();
}

const unsavedBar = () => screen.queryByRole("region", { name: "Unsaved changes" });
const sectionLink = (name: RegExp) => within(screen.getByRole("navigation", { name: "Settings sections" })).getByRole("link", { name });

describe("Settings", () => {
  it("opens Business profile by default", async () => {
    renderSettings("/dashboard/settings");

    expect(await screen.findByRole("heading", { name: "Business profile" })).toBeInTheDocument();
    expect(screen.getByTestId("location")).toHaveTextContent("/dashboard/settings/business");
    expect(unsavedBar()).not.toBeInTheDocument();
  });

  it("shows the unsaved bar after an edit, and Save keeps the value across sections", async () => {
    const ue = renderSettings();
    const name = await screen.findByLabelText(/^Business name/);

    await ue.clear(name);
    await ue.type(name, "Corner Store");
    expect(unsavedBar()).toBeInTheDocument();
    expect(screen.getByRole("figure", { name: "Receipt header preview" })).toHaveTextContent("Corner Store");

    await ue.click(screen.getByRole("button", { name: "Save changes" }));
    expect(unsavedBar()).not.toBeInTheDocument();

    await ue.click(sectionLink(/Tax & currency/));
    await ue.click(sectionLink(/Business profile/));
    expect(screen.getByLabelText(/^Business name/)).toHaveValue("Corner Store");
  });

  it("Discard puts back the saved value", async () => {
    const ue = renderSettings();
    const name = await screen.findByLabelText(/^Business name/);

    await ue.type(name, " Extra");
    await ue.click(screen.getByRole("button", { name: "Discard" }));

    expect(screen.getByLabelText(/^Business name/)).toHaveValue("Naya Mart");
    expect(unsavedBar()).not.toBeInTheDocument();
  });

  it("blocks saving an out-of-range tax rate and flags the section", async () => {
    const ue = renderSettings("/dashboard/settings/tax");
    const rate = await screen.findByLabelText(/^Default tax rate/);

    await ue.clear(rate);
    await ue.type(rate, "120");

    expect(rate).toHaveAttribute("aria-invalid", "true");
    expect(rate).toHaveAccessibleDescription("Use a rate from 0 to 100");
    expect(screen.getByRole("button", { name: "Save changes" })).toBeDisabled();
    expect(sectionLink(/Tax & currency/)).toHaveTextContent("(has errors)");
  });

  it("keeps unsaved edits while moving between sections", async () => {
    const ue = renderSettings("/dashboard/settings/invoices");
    const prefix = await screen.findByLabelText(/^Prefix/);

    await ue.clear(prefix);
    await ue.type(prefix, "NH-");
    await ue.click(sectionLink(/Inventory/));
    await ue.click(sectionLink(/Invoices & receipts/));

    expect(screen.getByLabelText(/^Prefix/)).toHaveValue("NH-");
    expect(screen.getByLabelText("Next invoice number NH-000124")).toBeInTheDocument();
    expect(unsavedBar()).toBeInTheDocument();
  });
});
