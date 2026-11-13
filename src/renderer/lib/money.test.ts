import { describe, expect, it } from "vitest";
import { formatMoney } from "./money";

describe("formatMoney", () => {
  it("formats minor units as rupees with thousands separators", () => {
    expect(formatMoney(1245000)).toBe("Rs 12,450");
    expect(formatMoney(1245050)).toBe("Rs 12,450.5");
    expect(formatMoney(99)).toBe("Rs 0.99");
    expect(formatMoney(0)).toBe("Rs 0");
  });

  it("puts the sign before the currency for negative amounts", () => {
    expect(formatMoney(-250000)).toBe("-Rs 2,500");
  });

  it("shortens large amounts in compact mode", () => {
    expect(formatMoney(12345000, { compact: true })).toBe("Rs 123.5K");
  });
});
