import type { Money } from "@/shared/contracts/common";

/** The money-relevant part of an invoice line. Amounts are integer paisa; rates are percents. */
export interface PricedLine {
  productId: string | null;
  quantity: number;
  unitPrice: Money;
  discountPct: number;
  taxPct: number;
}

export interface LineAmounts {
  gross: Money;
  discount: Money;
  tax: Money;
  total: Money;
}

export interface InvoiceTotals {
  subTotal: Money;
  discount: Money;
  tax: Money;
  grandTotal: Money;
  /** Lines that have a product (blank grid lines are not counted). */
  lineCount: number;
}

/**
 * Integer line maths. Each step is rounded to whole paisa once, so the line parts always add up
 * exactly: total = gross - discount + tax.
 */
export function lineAmounts(line: PricedLine): LineAmounts {
  const gross = Math.round(line.quantity * line.unitPrice);
  const discount = Math.round((gross * line.discountPct) / 100);
  const tax = Math.round(((gross - discount) * line.taxPct) / 100);
  return { gross, discount, tax, total: gross - discount + tax };
}

/** Sums the line amounts; blank lines (no product yet) are skipped. */
export function invoiceTotals(lines: readonly PricedLine[]): InvoiceTotals {
  const totals: InvoiceTotals = { subTotal: 0, discount: 0, tax: 0, grandTotal: 0, lineCount: 0 };
  for (const line of lines) {
    if (line.productId === null) continue;
    const a = lineAmounts(line);
    totals.subTotal += a.gross;
    totals.discount += a.discount;
    totals.tax += a.tax;
    totals.grandTotal += a.total;
    totals.lineCount += 1;
  }
  return totals;
}

/**
 * Converts a typed rupee amount ("12.5", "1,200") to paisa without float maths; null when it is
 * not a non-negative amount with at most two decimals.
 */
export function rupeesToPaisa(text: string): Money | null {
  const match = /^(\d+)(?:\.(\d{0,2}))?$/.exec(text.trim().replaceAll(",", ""));
  if (!match) return null;
  const [, whole = "0", fraction = ""] = match;
  return Number(whole) * 100 + Number(fraction.padEnd(2, "0"));
}

/** A typed quantity: a positive number with at most three decimals (e.g. 1.25 kg); else null. */
export function parseQuantity(text: string): number | null {
  if (!/^\d+(?:\.\d{0,3})?$/.test(text.trim())) return null;
  const value = Number(text.trim());
  return value > 0 ? value : null;
}

/** A typed percent between 0 and 100 with at most two decimals; else null. */
export function parsePercent(text: string): number | null {
  if (!/^\d+(?:\.\d{0,2})?$/.test(text.trim())) return null;
  const value = Number(text.trim());
  return value <= 100 ? value : null;
}

/** Paisa as a plain editable rupee string (no currency symbol or grouping): 12550 -> "125.5". */
export function paisaToRupeesText(minor: Money): string {
  return String(minor / 100);
}
