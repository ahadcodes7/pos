import { describe, expect, it } from "vitest";
import { getStockStatus } from "./sale-data";

describe("getStockStatus", () => {
  it("flags zero stock as out of stock", () => {
    expect(getStockStatus(0)).toEqual({
      label: "Out of Stock",
      variant: "danger",
    });
  });

  it("flags five or fewer units as low stock", () => {
    expect(getStockStatus(5)).toEqual({
      label: "Low Stock (5)",
      variant: "warning",
    });
  });

  it("flags more than five units as in stock", () => {
    expect(getStockStatus(6)).toEqual({
      label: "In Stock (6)",
      variant: "success",
    });
  });
});
