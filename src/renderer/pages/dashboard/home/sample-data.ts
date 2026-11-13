import type { Money } from "@/shared/contracts/common";

/**
 * Placeholder analytics for the Home page until real reporting routes exist.
 * Deterministic (no Math.random) so screenshots and tests are stable.
 * All money is integer minor units (paisa).
 */

export interface DailySales {
  date: string; // e.g. "Oct 15"
  current: Money;
  previous: Money;
}

export interface HourlySales {
  hour: string; // e.g. "9a"
  sales: Money;
}

export interface PaymentSlice {
  method: string;
  amount: Money;
}

export interface TopProduct {
  name: string;
  revenue: Money;
}

export type InvoiceStatus = "Paid" | "Pending";

export interface RecentInvoice {
  number: string;
  customer: string;
  time: string;
  amount: Money;
  status: InvoiceStatus;
}

export interface Kpi {
  id: string;
  label: string;
  value: number;
  /** "money" values are minor units; "count" values are plain integers. */
  kind: "money" | "count";
  /** Change vs yesterday: whole percent, or a plain count when `deltaIsCount`. */
  delta: number;
  deltaIsCount?: boolean;
  /** For metrics where a rise is bad (e.g. low-stock items). */
  higherIsWorse?: boolean;
  spark?: number[];
}

// A smooth, repeatable wave: weekly rhythm + slow growth.
function wave(i: number, base: number, amp: number, phase = 0): number {
  const weekly = Math.sin(((i + phase) / 7) * Math.PI * 2);
  const ripple = Math.sin((i + phase) * 1.7) * 0.35;
  return Math.round(base + amp * (weekly + ripple) + i * base * 0.006);
}

const dayLabel = new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric" });

export function buildDailySales(today: Date, days = 30): DailySales[] {
  return Array.from({ length: days }, (_, i) => {
    const d = new Date(today);
    d.setDate(today.getDate() - (days - 1 - i));
    // Round to whole rupees so the minor-unit amounts stay realistic.
    const current = wave(i, 4_200_000, 900_000) - (wave(i, 4_200_000, 900_000) % 100);
    const previous = wave(i, 3_700_000, 800_000, 3) - (wave(i, 3_700_000, 800_000, 3) % 100);
    return { date: dayLabel.format(d), current, previous };
  });
}

export const hourlySales: HourlySales[] = [
  { hour: "9a", sales: 180_000 },
  { hour: "10a", sales: 320_000 },
  { hour: "11a", sales: 410_000 },
  { hour: "12p", sales: 560_000 },
  { hour: "1p", sales: 690_000 },
  { hour: "2p", sales: 470_000 },
  { hour: "3p", sales: 390_000 },
  { hour: "4p", sales: 440_000 },
  { hour: "5p", sales: 610_000 },
  { hour: "6p", sales: 780_000 },
  { hour: "7p", sales: 720_000 },
  { hour: "8p", sales: 520_000 },
  { hour: "9p", sales: 300_000 },
];

export const paymentMix: PaymentSlice[] = [
  { method: "Cash", amount: 58_400_000 },
  { method: "Card", amount: 31_200_000 },
  { method: "Bank transfer", amount: 17_900_000 },
  { method: "Credit", amount: 9_600_000 },
];

export const topProducts: TopProduct[] = [
  { name: "Basmati Rice 5kg", revenue: 14_850_000 },
  { name: "Cooking Oil 3L", revenue: 11_320_000 },
  { name: "Tea Leaves 900g", revenue: 8_640_000 },
  { name: "Sugar 2kg", revenue: 6_910_000 },
  { name: "Milk Pack 1L", revenue: 5_270_000 },
];

export const recentInvoices: RecentInvoice[] = [
  { number: "INV-1042", customer: "Walk-in customer", time: "6:42 pm", amount: 486_000, status: "Paid" },
  { number: "INV-1041", customer: "Bilal Traders", time: "6:15 pm", amount: 2_315_000, status: "Pending" },
  { number: "INV-1040", customer: "Walk-in customer", time: "5:58 pm", amount: 129_500, status: "Paid" },
  { number: "INV-1039", customer: "Sara Khan", time: "5:31 pm", amount: 742_000, status: "Paid" },
  { number: "INV-1038", customer: "Al-Madina Store", time: "4:47 pm", amount: 1_860_000, status: "Pending" },
];

export const kpis: Kpi[] = [
  {
    id: "sales",
    label: "Today's sales",
    value: 6_390_000,
    kind: "money",
    delta: 12,
    spark: [41, 38, 45, 43, 50, 47, 56, 52, 61, 64],
  },
  {
    id: "invoices",
    label: "Invoices today",
    value: 142,
    kind: "count",
    delta: 8,
    spark: [12, 14, 11, 15, 13, 17, 16, 18, 17, 20],
  },
  {
    id: "basket",
    label: "Average basket",
    value: 450_000,
    kind: "money",
    delta: -3,
    spark: [48, 47, 49, 46, 47, 45, 46, 44, 45, 45],
  },
  { id: "low-stock", label: "Low-stock items", value: 9, kind: "count", delta: 2, deltaIsCount: true, higherIsWorse: true },
];
