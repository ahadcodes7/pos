import { Minus, Plus } from "lucide-react";
import { cn } from "@/renderer/lib/utils";
import { parseQuantity } from "../sale-math";
import { NumberInput } from "./NumberInput";

const formatQty = (q: number) => String(q);

/** − / quantity / + in one pill. − stops at 1; typed quantities may have decimals (e.g. kg). */
export function QuantityStepper({
  value,
  onChange,
  label,
  size = "md",
  className,
}: {
  value: number;
  onChange: (value: number) => void;
  /** Accessible name of the input, e.g. "Quantity of Cold Coffee". */
  label: string;
  size?: "sm" | "md";
  className?: string;
}) {
  const h = size === "sm" ? "h-8" : "h-10";
  const btn = cn(
    "flex shrink-0 cursor-pointer items-center justify-center text-muted-foreground transition-colors hover:bg-foreground/[0.06] hover:text-foreground disabled:pointer-events-none disabled:opacity-40 [&_svg]:size-3.5",
    size === "sm" ? "w-8" : "w-10",
  );

  return (
    <div className={cn("inline-flex items-stretch overflow-hidden rounded-field border border-border bg-card", h, className)}>
      <button type="button" className={btn} aria-label={`Decrease ${label}`} disabled={value <= 1} onClick={() => onChange(Math.max(1, value - 1))}>
        <Minus />
      </button>
      <NumberInput
        aria-label={label}
        value={value}
        format={formatQty}
        parse={parseQuantity}
        onCommit={onChange}
        className="w-11 min-w-0 border-x border-border bg-transparent text-center text-sm font-semibold outline-none focus-visible:bg-accent/60"
      />
      <button type="button" className={btn} aria-label={`Increase ${label}`} onClick={() => onChange(value + 1)}>
        <Plus />
      </button>
    </div>
  );
}
