import { describe, expect, it } from "vitest";
import { filterProducts, getStockStatus, mockProducts } from "./sale-data";

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

describe("filterProducts", () => {
  it("matches name or SKU across all categories when no category is given", () => {
    expect(filterProducts(mockProducts, "drink-00").map((p) => p.sku)).toEqual([
      "DRINK-001",
      "DRINK-002",
      "DRINK-003",
      "DRINK-004",
      "DRINK-005",
    ]);
    expect(filterProducts(mockProducts, "lassi").map((p) => p.name)).toEqual(["Lassi (Sweet)"]);
  });

  it("narrows to the selected category", () => {
    expect(filterProducts(mockProducts, "chicken", "snacks").map((p) => p.name)).toEqual(["Chicken Wings (6 pcs)"]);
  });
});
