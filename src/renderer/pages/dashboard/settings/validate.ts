import type { AppSettings, SettingsGroup } from "./settings-data";

/** A field path such as "business.name". */
export type FieldPath = {
  [G in SettingsGroup]: `${G}.${Extract<keyof AppSettings[G], string>}`;
}[SettingsGroup];

export type SettingsErrors = Partial<Record<FieldPath, string>>;

const isWhole = (text: string) => /^\d+$/.test(text.trim());
const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/** Checks the settings form; returns one message per invalid field (empty when valid). */
export function validateSettings(s: AppSettings): SettingsErrors {
  const errors: SettingsErrors = {};

  if (!s.business.name.trim()) errors["business.name"] = "Business name is required";
  if (s.business.email.trim() && !EMAIL.test(s.business.email.trim())) errors["business.email"] = "Enter a valid email address";

  if (!s.invoices.prefix.trim()) errors["invoices.prefix"] = "Prefix is required";
  if (!isWhole(s.invoices.nextNumber) || Number(s.invoices.nextNumber) < 1)
    errors["invoices.nextNumber"] = "Use a whole number of 1 or more";

  const rate = s.tax.defaultRate.trim();
  if (!/^\d+(\.\d{1,2})?$/.test(rate) || Number(rate) > 100) errors["tax.defaultRate"] = "Use a rate from 0 to 100";
  if (!s.tax.label.trim()) errors["tax.label"] = "Tax label is required";

  if (!isWhole(s.inventory.lowStockThreshold)) errors["inventory.lowStockThreshold"] = "Use a whole number of 0 or more";

  return errors;
}

/** Which settings groups have at least one error, for the red dots in the section menu. */
export function groupsWithErrors(errors: SettingsErrors): Set<SettingsGroup> {
  return new Set(Object.keys(errors).map((path) => path.split(".")[0] as SettingsGroup));
}
