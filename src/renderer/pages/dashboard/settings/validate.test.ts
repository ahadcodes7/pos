import { describe, expect, it } from "vitest";
import { defaultSettings, type AppSettings } from "./settings-data";
import { groupsWithErrors, validateSettings } from "./validate";

const withPatch = <G extends keyof AppSettings>(group: G, patch: Partial<AppSettings[G]>): AppSettings => ({
  ...defaultSettings,
  [group]: { ...defaultSettings[group], ...patch },
});

describe("validateSettings", () => {
  it("accepts the default settings", () => {
    expect(validateSettings(defaultSettings)).toEqual({});
  });

  it("requires a business name and a well-formed email when one is given", () => {
    expect(validateSettings(withPatch("business", { name: "  " }))).toHaveProperty("business.name");
    expect(validateSettings(withPatch("business", { email: "accounts@" }))).toHaveProperty("business.email");
    expect(validateSettings(withPatch("business", { email: "" }))).toEqual({});
  });

  it("needs a next invoice number of 1 or more", () => {
    expect(validateSettings(withPatch("invoices", { nextNumber: "0" }))).toHaveProperty("invoices.nextNumber");
    expect(validateSettings(withPatch("invoices", { nextNumber: "1.5" }))).toHaveProperty("invoices.nextNumber");
    expect(validateSettings(withPatch("invoices", { nextNumber: "1" }))).toEqual({});
  });

  it("keeps the tax rate between 0 and 100 with up to two decimals", () => {
    for (const ok of ["0", "100", "17.5", "16.25"]) expect(validateSettings(withPatch("tax", { defaultRate: ok }))).toEqual({});
    for (const bad of ["100.01", "-1", "", "abc", "1.234"])
      expect(validateSettings(withPatch("tax", { defaultRate: bad }))).toHaveProperty("tax.defaultRate");
  });

  it("allows a low-stock threshold of 0 but not a negative or fractional one", () => {
    expect(validateSettings(withPatch("inventory", { lowStockThreshold: "0" }))).toEqual({});
    expect(validateSettings(withPatch("inventory", { lowStockThreshold: "-2" }))).toHaveProperty("inventory.lowStockThreshold");
    expect(validateSettings(withPatch("inventory", { lowStockThreshold: "2.5" }))).toHaveProperty("inventory.lowStockThreshold");
  });

  it("reports which groups have errors", () => {
    const errors = validateSettings({ ...withPatch("tax", { defaultRate: "120" }), business: { ...defaultSettings.business, name: "" } });
    expect(groupsWithErrors(errors)).toEqual(new Set(["tax", "business"]));
  });
});
