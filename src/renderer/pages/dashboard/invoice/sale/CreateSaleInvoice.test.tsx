import { beforeEach, describe, expect, it } from "vitest";
import { screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Route } from "react-router-dom";
import { installFakeElectronApi } from "@tests/setup/fake-electron-api";
import { renderRoutes } from "@tests/setup/render";
import CreateSaleInvoice from "./CreateSaleInvoice";

function renderInvoice() {
  installFakeElectronApi({ auth: { status: () => ({ isAuthenticated: false, user: null }) } });
  renderRoutes(<Route path="/sale" element={<CreateSaleInvoice />} />, { initialPath: "/sale" });
  return userEvent.setup();
}

const switchView = (ue: ReturnType<typeof userEvent.setup>, name: string) => ue.click(screen.getByRole("radio", { name }));

/** The big "Total" figure in the totals panel. */
const grandTotal = () => screen.getByText("Total").nextElementSibling;

describe("CreateSaleInvoice", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("keeps the order when switching from Card to Quick entry, and remembers the view", async () => {
    const ue = renderInvoice();

    // Cold Coffee: Rs 150, 15% off, 18% tax -> 15000 - 2250 + 2295 = Rs 150.45.
    await ue.click(screen.getByRole("button", { name: /^Add Cold Coffee/ }));
    await ue.click(screen.getByRole("button", { name: /^Add Cold Coffee/ }));
    expect(screen.getByRole("button", { name: /^Add Cold Coffee.*2 in cart/ })).toBeInTheDocument();

    await switchView(ue, "Quick entry");

    expect(screen.getByRole("combobox", { name: "Product, line 1" })).toHaveTextContent("Cold Coffee");
    expect(screen.getByRole("textbox", { name: "Quantity, line 1" })).toHaveValue("2");
    expect(grandTotal()).toHaveTextContent("Rs 300.9");
    expect(localStorage.getItem("nayahisab.sale.view")).toBe("grid");
  });

  it("Quick entry: Add line, pick a product, type a quantity and the amount updates", async () => {
    localStorage.setItem("nayahisab.sale.view", "grid");
    const ue = renderInvoice();

    await ue.click(screen.getByRole("button", { name: "Add line" }));
    const product = screen.getByRole("combobox", { name: "Product, line 1" });
    expect(product).toHaveFocus();

    await ue.click(product);
    await ue.click(await screen.findByRole("option", { name: /Fresh Milk/ }));
    await ue.type(screen.getByRole("textbox", { name: "Quantity, line 1" }), "3{Enter}");

    // 3 x Rs 120 = 36000 paisa, +18% tax = 42480 -> Rs 424.8.
    const row = product.closest("tr")!;
    expect(within(row).getByText("Rs 424.8")).toBeInTheDocument();
    expect(grandTotal()).toHaveTextContent("Rs 424.8");
  });

  it("Staged: stage a product, add it, then edit the line from the table", async () => {
    localStorage.setItem("nayahisab.sale.view", "staged");
    const ue = renderInvoice();

    await ue.click(screen.getByRole("combobox", { name: "Product" }));
    await ue.click(await screen.findByRole("option", { name: /Lassi/ }));
    await ue.click(screen.getByRole("button", { name: "Increase quantity" }));
    await ue.click(screen.getByRole("button", { name: "Add to invoice" }));

    // 2 x Rs 100 + 18% tax = Rs 236.
    const table = screen.getByRole("table");
    const row = within(table).getByText("Lassi (Sweet)").closest("tr")!;
    expect(within(row).getByText("Rs 236")).toBeInTheDocument();

    await ue.click(within(row).getByRole("button", { name: "Edit Lassi (Sweet)" }));
    expect(screen.getByRole("form", { name: "Edit line" })).toBeInTheDocument();
    await ue.type(screen.getByRole("textbox", { name: "Discount percent" }), "50{Enter}");

    // Enter commits the discount and submits: 20000 - 10000 = 10000, +18% = Rs 118.
    expect(within(row).getByText("Rs 118")).toBeInTheDocument();
    expect(screen.getByRole("form", { name: "Stage a line" })).toBeInTheDocument();
  });
});
