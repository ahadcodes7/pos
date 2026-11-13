import { ArrowDownRight, ArrowUpRight } from "lucide-react";
import { Line, LineChart, ResponsiveContainer } from "recharts";
import { Card } from "@/renderer/components/ui/card";
import { formatMoney } from "@/renderer/lib/money";
import { cn } from "@/renderer/lib/utils";
import type { Kpi } from "./sample-data";

export function KpiTile({ kpi }: { kpi: Kpi }) {
  const up = kpi.delta >= 0;
  const good = kpi.higherIsWorse ? !up : up;
  const Arrow = up ? ArrowUpRight : ArrowDownRight;
  const value = kpi.kind === "money" ? formatMoney(kpi.value) : kpi.value.toLocaleString("en-PK");
  const deltaText = `${up ? "+" : "−"}${Math.abs(kpi.delta)}${kpi.deltaIsCount ? "" : "%"}`;

  return (
    <Card className="flex flex-col gap-3 p-5">
      <p className="text-sm font-medium text-muted-foreground">{kpi.label}</p>
      <div className="flex items-end justify-between gap-3">
        <p className="min-w-0 truncate text-2xl leading-none font-bold tracking-tight whitespace-nowrap tabular-nums">{value}</p>
        {kpi.spark && (
          <div aria-hidden="true" className="h-8 w-20 shrink-0">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={kpi.spark.map((v, i) => ({ i, v }))} margin={{ top: 4, right: 2, bottom: 4, left: 2 }}>
                <Line type="monotone" dataKey="v" stroke="var(--chart-1)" strokeWidth={2} dot={false} isAnimationActive={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>
      <p className="flex items-center gap-1.5 text-xs text-muted-foreground">
        <span
          className={cn(
            "inline-flex items-center gap-0.5 rounded-full px-1.5 py-0.5 font-semibold tabular-nums",
            good ? "bg-success-surface text-success" : "bg-destructive-surface text-destructive",
          )}
        >
          <Arrow aria-hidden="true" className="h-3.5 w-3.5" />
          {deltaText}
        </span>
        vs yesterday
      </p>
    </Card>
  );
}
