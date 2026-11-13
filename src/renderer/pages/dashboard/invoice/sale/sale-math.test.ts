import { describe, expect, it } from "vitest";
import { invoiceTotals, lineAmounts, parseQuantity, rupeesToPaisa, type PricedLine } from "./sale-math";

const line = (over: Partial<PricedLine> = {}): PricedLine => ({
  productId: "p1",
  quantity: 1,
  unitPrice: 0,
  discountPct: 0,
  taxPct: 0,
  ...over,
});

describe("lineAmounts", () => {
  it("applies discount before tax, in whole paisa", () => {
    // 3 x Rs 1,200 = 360000; 10% off = 36000; 18% tax on 324000 = 58320.
    expect(lineAmounts(line({ quantity: 3, unitPrice: 120000, discountPct: 10, taxPct: 18 }))).toEqual({
      gross: 360000,
      discount: 36000,
      tax: 58320,
      total: 382320,
    });
  });

  it("rounds each part once so the parts always add up to the total", () => {
    // 1.5 kg x Rs 3.33 = 499.5 -> 500 paisa; 7% of 500 = 35; 18% of 465 = 83.7 -> 84.
    const a = lineAmounts(line({ quantity: 1.5, unitPrice: 333, discountPct: 7, taxPct: 18 }));
    expect(a).toEqual({ gross: 500, discount: 35, tax: 84, total: 549 });
    expect(Number.isInteger(a.total)).toBe(true);
  });
});

describe("invoiceTotals", () => {
  it("sums the line amounts and skips blank lines", () => {
    const lines = [
      line({ quantity: 2, unitPrice: 35000, taxPct: 18 }),
      line({ quantity: 1, unitPrice: 15000, discountPct: 15, taxPct: 18 }),
      line({ productId: null, quantity: 5, unitPrice: 99999 }),
    ];
    const expected = lines.slice(0, 2).map(lineAmounts);

    expect(invoiceTotals(lines)).toEqual({
      subTotal: expected[0]!.gross + expected[1]!.gross,
      discount: expected[0]!.discount + expected[1]!.discount,
      tax: expected[0]!.tax + expected[1]!.tax,
      grandTotal: expected[0]!.total + expected[1]!.total,
      lineCount: 2,
    });
  });
});

describe("input parsing", () => {
  it("turns typed rupees into paisa without float error", () => {
    expect(rupeesToPaisa("1.15")).toBe(115);
    expect(rupeesToPaisa("1,200.5")).toBe(120050);
    expect(rupeesToPaisa("12.345")).toBeNull();
    expect(rupeesToPaisa("-3")).toBeNull();
    expect(rupeesToPaisa("")).toBeNull();
  });

  it("accepts only positive quantities", () => {
    expect(parseQuantity("2.5")).toBe(2.5);
    expect(parseQuantity("0")).toBeNull();
    expect(parseQuantity("abc")).toBeNull();
  });
});
