import { describe, expect, it } from "vitest";
import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Route } from "react-router-dom";
import { installFakeElectronApi } from "@tests/setup/fake-electron-api";
import { renderRoutes } from "@tests/setup/render";
import AddProduct from "./AddProduct";

function renderForm() {
  installFakeElectronApi({ auth: { status: () => ({ isAuthenticated: false, user: null }) } });
  renderRoutes(<Route path="/product/add" element={<AddProduct />} />, { initialPath: "/product/add" });
  return userEvent.setup();
}

describe("AddProduct", () => {
  it("summarises the missing required fields and marks each one invalid", async () => {
    const ue = renderForm();

    await ue.click(screen.getByRole("button", { name: "Create Product" }));

    const summary = await screen.findByRole("alert");
    expect(summary).toHaveTextContent("Fix 4 fields before saving");
    expect(summary).toHaveTextContent("Product name, SKU, Selling price, Category are required.");
    expect(screen.getByLabelText(/^Product name/)).toHaveAttribute("aria-invalid", "true");
    expect(screen.getByLabelText(/^Product name/)).toHaveAccessibleDescription("Product name is required");
  });

  it("clears a field's error as soon as it is edited and updates the summary", async () => {
    const ue = renderForm();
    await ue.click(screen.getByRole("button", { name: "Create Product" }));

    await ue.type(screen.getByLabelText(/^Product name/), "Rice");

    expect(screen.getByLabelText(/^Product name/)).not.toHaveAttribute("aria-invalid");
    expect(screen.getByRole("alert")).toHaveTextContent("Fix 3 fields before saving");
  });

  it("adds a tag on Enter without submitting the form, and removes it on click", async () => {
    const ue = renderForm();

    await ue.type(screen.getByLabelText(/^Tags/), "grocery{Enter}");

    expect(screen.getByRole("button", { name: "Remove tag grocery" })).toBeInTheDocument();
    expect(screen.getByLabelText(/^Tags/)).toHaveValue("");
    expect(screen.queryByRole("alert")).not.toBeInTheDocument();

    await ue.click(screen.getByRole("button", { name: "Remove tag grocery" }));
    expect(screen.queryByRole("button", { name: "Remove tag grocery" })).not.toBeInTheDocument();
  });
});
