import type { ReactNode } from "react";
import type { TooltipContentProps } from "recharts";
import { cn } from "@/renderer/lib/utils";

/**
 * Shared chart chrome for recharts. Series colours come only from the `--chart-N` tokens
 * (validated palette in index.css); text always uses text tokens, never a series colour.
 * Axis/grid defaults live in `chart-config.ts`.
 */

/** Fixed-height plot area; recharts' ResponsiveContainer fills it. */
export function ChartFrame({ className, children }: { className?: string; children: ReactNode }) {
  return <div className={cn("h-64 w-full", className)}>{children}</div>;
}

type Formatter = (value: number) => string;

/**
 * Tooltip card: label on top, then one row per series with a colour key, the series name in
 * muted text and the value in tabular figures.
 */
export function ChartTooltip({
  active,
  payload,
  label,
  format,
  hideLabel = false,
}: Partial<TooltipContentProps> & { format: Formatter; hideLabel?: boolean }) {
  if (!active || !payload?.length) return null;

  return (
    <div className="min-w-36 rounded-xl border border-border bg-popover px-3 py-2 text-xs text-popover-foreground shadow-lg">
      {!hideLabel && label !== undefined && <p className="mb-1.5 font-semibold">{String(label)}</p>}
      <ul className="space-y-1">
        {payload.map((item) => (
          <li key={String(item.dataKey ?? item.name)} className="flex items-center justify-between gap-4">
            <span className="flex items-center gap-1.5 text-muted-foreground">
              <span
                aria-hidden="true"
                className="h-2.5 w-2.5 rounded-sm"
                style={{ background: item.color ?? (item.payload as { fill?: string } | undefined)?.fill }}
              />
              {item.name}
            </span>
            <span className="font-semibold tabular-nums">{typeof item.value === "number" ? format(item.value) : ""}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

/** A legend row: colour key + name (+ optional value), all text in text tokens. */
export function ChartLegend({
  items,
  className,
}: {
  items: { name: string; color: string; value?: string; dashed?: boolean }[];
  className?: string;
}) {
  return (
    <ul className={cn("flex flex-wrap items-center gap-x-4 gap-y-1.5 text-xs", className)}>
      {items.map((item) => (
        <li key={item.name} className="flex items-center gap-1.5">
          <span
            aria-hidden="true"
            className={cn("h-2.5 w-2.5 rounded-sm", item.dashed && "h-0.5 w-3.5 rounded-none border-t-2 border-dashed bg-transparent")}
            style={item.dashed ? { borderColor: item.color } : { background: item.color }}
          />
          <span className="text-muted-foreground">{item.name}</span>
          {item.value && <span className="font-semibold text-foreground tabular-nums">{item.value}</span>}
        </li>
      ))}
    </ul>
  );
}
