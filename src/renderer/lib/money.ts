import type { Money } from "@/shared/contracts/common";

const MINOR_PER_MAJOR = 100;

const fullFormat = new Intl.NumberFormat("en-PK", { minimumFractionDigits: 0, maximumFractionDigits: 2 });
const compactFormat = new Intl.NumberFormat("en-PK", { notation: "compact", maximumFractionDigits: 1 });

/**
 * Display-only formatting of an integer minor-unit amount (paisa), e.g. 1245050 -> "Rs 12,450.5".
 * The division happens only here, at the UI edge; never feed the result back into arithmetic.
 */
export function formatMoney(minor: Money, { compact = false }: { compact?: boolean } = {}): string {
  const major = Math.abs(minor) / MINOR_PER_MAJOR;
  const text = (compact ? compactFormat : fullFormat).format(major);
  return `${minor < 0 ? "-" : ""}Rs ${text}`;
}
