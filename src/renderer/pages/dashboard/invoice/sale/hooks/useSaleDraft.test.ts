import { describe, expect, it } from "vitest";
import { mockProducts } from "../sale-data";
import { initialSaleDraft, saleDraftReducer, type SaleDraftAction, type SaleDraftState } from "./useSaleDraft";

const coffee = mockProducts.find((p) => p.name === "Cold Coffee")!;
const karahi = mockProducts.find((p) => p.name === "Chicken Karahi")!;

const run = (...actions: SaleDraftAction[]) => actions.reduce<SaleDraftState>(saleDraftReducer, initialSaleDraft);
const lines = (s: SaleDraftState) => s.orders.find((o) => o.id === s.activeOrderId)!.lines;

describe("saleDraftReducer", () => {
  it("adding the same product twice gives one line with quantity 2", () => {
    const s = run({ type: "ADD_PRODUCT", product: coffee, lineId: "a" }, { type: "ADD_PRODUCT", product: coffee, lineId: "b" });
    expect(lines(s)).toHaveLength(1);
    expect(lines(s)[0]).toMatchObject({ id: "a", quantity: 2, unitPrice: coffee.price, discountPct: 15 });
  });

  it("adds numerically after a quantity is edited", () => {
    const s = run(
      { type: "ADD_PRODUCT", product: coffee, lineId: "a" },
      { type: "UPDATE_LINE", lineId: "a", patch: { quantity: 3 } },
      { type: "ADD_PRODUCT", product: coffee, lineId: "b" },
    );
    expect(lines(s)[0]!.quantity).toBe(4);
  });

  it("fills a blank line from the chosen product and keeps its quantity", () => {
    const s = run(
      { type: "ADD_BLANK_LINE", lineId: "a" },
      { type: "UPDATE_LINE", lineId: "a", patch: { quantity: 2 } },
      { type: "SET_LINE_PRODUCT", lineId: "a", product: karahi },
    );
    expect(lines(s)[0]).toMatchObject({ id: "a", productId: karahi.id, name: karahi.name, quantity: 2, unitPrice: karahi.price, taxPct: 18 });
  });

  it("keeps each order's lines separate and never deletes the last order", () => {
    let s = run({ type: "ADD_PRODUCT", product: coffee, lineId: "a" }, { type: "ADD_ORDER" });
    expect(s.activeOrderId).toBe(2);
    expect(lines(s)).toEqual([]);

    s = saleDraftReducer(s, { type: "DELETE_ORDER", orderId: 2 });
    expect(s.activeOrderId).toBe(1);
    expect(lines(s)).toHaveLength(1);

    expect(saleDraftReducer(s, { type: "DELETE_ORDER", orderId: 1 })).toBe(s);
  });

  it("clearing an order empties its lines, resets payment and keeps the customer", () => {
    const s = run(
      { type: "SET_CUSTOMER", customerId: "3" },
      { type: "SET_PAYMENT_MODE", paymentMode: "card" },
      { type: "ADD_PRODUCT", product: coffee, lineId: "a" },
      { type: "CLEAR_ORDER" },
    );
    expect(s.orders[0]).toMatchObject({ customerId: "3", paymentMode: "cash", lines: [] });
  });
});
