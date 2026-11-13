import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  LabelList,
  Line,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { Badge } from "@/renderer/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/renderer/components/ui/card";
import { ChartFrame, ChartLegend, ChartTooltip } from "@/renderer/components/ui/chart";
import { chartAxis, chartGrid } from "@/renderer/components/ui/chart-config";
import { formatMoney } from "@/renderer/lib/money";
import type { DailySales, HourlySales, PaymentSlice, RecentInvoice, TopProduct } from "./sample-data";

const money = (v: number) => formatMoney(v);
const compactMoney = (v: number) => formatMoney(v, { compact: true });

// Categorical order is fixed (index.css): payment methods always keep the same colour.
const SLICE_COLORS = ["var(--chart-1)", "var(--chart-2)", "var(--chart-3)", "var(--chart-4)"];

const cursorFill = { fill: "var(--muted)", opacity: 0.6 };

export function SalesTrendCard({ data }: { data: DailySales[] }) {
  const total = data.reduce((sum, d) => sum + d.current, 0);
  const previous = data.reduce((sum, d) => sum + d.previous, 0);
  const change = Math.round(((total - previous) / previous) * 100);

  return (
    <Card>
      <CardHeader className="flex-row flex-wrap items-start justify-between gap-3 space-y-0">
        <div className="space-y-1.5">
          <CardTitle>Sales trend</CardTitle>
          <CardDescription>Daily sales, last 30 days vs the 30 days before</CardDescription>
        </div>
        <div className="text-right">
          <p className="text-2xl font-bold tabular-nums">{formatMoney(total, { compact: true })}</p>
          <p className="text-xs text-muted-foreground">
            <span className="font-semibold text-success">{change >= 0 ? `+${change}%` : `${change}%`}</span> vs previous
          </p>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        <ChartLegend
          items={[
            { name: "This period", color: "var(--chart-1)" },
            { name: "Previous period", color: "var(--muted-foreground)", dashed: true },
          ]}
        />
        <ChartFrame className="h-72">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data} margin={{ top: 8, right: 8, bottom: 0, left: 0 }}>
              <defs>
                <linearGradient id="trend-fill" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="var(--chart-1)" stopOpacity={0.22} />
                  <stop offset="100%" stopColor="var(--chart-1)" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid {...chartGrid} />
              <XAxis dataKey="date" {...chartAxis} minTickGap={28} tickMargin={8} />
              <YAxis {...chartAxis} width={64} tickFormatter={compactMoney} />
              <Tooltip
                cursor={{ stroke: "var(--muted-foreground)", strokeWidth: 1, strokeDasharray: "3 3" }}
                content={(props) => <ChartTooltip {...props} format={money} />}
              />
              <Line
                name="Previous period"
                type="monotone"
                dataKey="previous"
                stroke="var(--muted-foreground)"
                strokeWidth={2}
                strokeDasharray="5 5"
                dot={false}
                activeDot={{ r: 4, strokeWidth: 2, stroke: "var(--card)" }}
                isAnimationActive={false}
              />
              <Area
                name="This period"
                type="monotone"
                dataKey="current"
                stroke="var(--chart-1)"
                strokeWidth={2}
                fill="url(#trend-fill)"
                activeDot={{ r: 5, strokeWidth: 2, stroke: "var(--card)" }}
                isAnimationActive={false}
              />
            </AreaChart>
          </ResponsiveContainer>
        </ChartFrame>
      </CardContent>
    </Card>
  );
}

export function PaymentMixCard({ data }: { data: PaymentSlice[] }) {
  const total = data.reduce((sum, d) => sum + d.amount, 0);

  return (
    <Card className="flex flex-col">
      <CardHeader className="space-y-1.5">
        <CardTitle>Payment mix</CardTitle>
        <CardDescription>Share of sales by method, last 30 days</CardDescription>
      </CardHeader>
      <CardContent className="flex flex-1 flex-col justify-between gap-4">
        <div className="relative">
          <ChartFrame className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Tooltip content={(props) => <ChartTooltip {...props} format={money} hideLabel />} />
                <Pie
                  data={data}
                  dataKey="amount"
                  nameKey="method"
                  innerRadius="66%"
                  outerRadius="92%"
                  paddingAngle={2}
                  cornerRadius={4}
                  stroke="var(--card)"
                  strokeWidth={2}
                  isAnimationActive={false}
                >
                  {data.map((slice, i) => (
                    <Cell key={slice.method} fill={SLICE_COLORS[i % SLICE_COLORS.length]} />
                  ))}
                </Pie>
              </PieChart>
            </ResponsiveContainer>
          </ChartFrame>
          <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-xs text-muted-foreground">Total</span>
            <span className="text-lg font-bold tabular-nums">{formatMoney(total, { compact: true })}</span>
          </div>
        </div>
        <ul className="space-y-2 text-sm">
          {data.map((slice, i) => (
            <li key={slice.method} className="flex items-center justify-between gap-3">
              <span className="flex items-center gap-2 text-muted-foreground">
                <span aria-hidden="true" className="h-2.5 w-2.5 rounded-sm" style={{ background: SLICE_COLORS[i] }} />
                {slice.method}
              </span>
              <span className="font-semibold tabular-nums">{Math.round((slice.amount / total) * 100)}%</span>
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  );
}

export function HourlySalesCard({ data }: { data: HourlySales[] }) {
  const peak = data.reduce<HourlySales | undefined>((best, d) => (!best || d.sales > best.sales ? d : best), undefined);

  return (
    <Card>
      <CardHeader className="space-y-1.5">
        <CardTitle>Sales by hour</CardTitle>
        <CardDescription>
          Today
          {peak && (
            <>
              {" "}
              · busiest at <span className="font-semibold text-foreground">{peak.hour.replace("a", " am").replace("p", " pm")}</span>
            </>
          )}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ChartFrame>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data} margin={{ top: 8, right: 8, bottom: 0, left: 0 }} barCategoryGap="22%">
              <CartesianGrid {...chartGrid} />
              <XAxis dataKey="hour" {...chartAxis} tickMargin={8} />
              <YAxis {...chartAxis} width={56} tickFormatter={compactMoney} />
              <Tooltip cursor={cursorFill} content={(props) => <ChartTooltip {...props} format={money} />} />
              <Bar name="Sales" dataKey="sales" fill="var(--chart-1)" radius={[4, 4, 0, 0]} isAnimationActive={false} />
            </BarChart>
          </ResponsiveContainer>
        </ChartFrame>
      </CardContent>
    </Card>
  );
}

export function TopProductsCard({ data }: { data: TopProduct[] }) {
  return (
    <Card>
      <CardHeader className="space-y-1.5">
        <CardTitle>Top products</CardTitle>
        <CardDescription>By revenue, last 30 days</CardDescription>
      </CardHeader>
      <CardContent>
        <ChartFrame>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data} layout="vertical" margin={{ top: 0, right: 64, bottom: 0, left: 0 }} barCategoryGap="28%">
              <XAxis type="number" hide />
              <YAxis
                type="category"
                dataKey="name"
                {...chartAxis}
                width={150}
                tick={{ fill: "var(--foreground)", fontSize: 12 }}
              />
              <Tooltip cursor={cursorFill} content={(props) => <ChartTooltip {...props} format={money} />} />
              <Bar name="Revenue" dataKey="revenue" fill="var(--chart-2)" radius={[0, 4, 4, 0]} isAnimationActive={false}>
                <LabelList
                  dataKey="revenue"
                  position="right"
                  formatter={(v: unknown) => (typeof v === "number" ? compactMoney(v) : "")}
                  className="fill-foreground text-xs font-semibold tabular-nums"
                />
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </ChartFrame>
      </CardContent>
    </Card>
  );
}

export function RecentInvoicesCard({ data }: { data: RecentInvoice[] }) {
  return (
    <Card>
      <CardHeader className="space-y-1.5">
        <CardTitle>Recent invoices</CardTitle>
        <CardDescription>Latest sales from today</CardDescription>
      </CardHeader>
      <CardContent className="px-3">
        <ul className="divide-y divide-border/70">
          {data.map((invoice) => (
            <li key={invoice.number} className="flex items-center justify-between gap-4 rounded-lg px-3 py-3">
              <div className="min-w-0">
                <p className="truncate text-sm font-semibold">{invoice.customer}</p>
                <p className="text-xs text-muted-foreground">
                  {invoice.number} · {invoice.time}
                </p>
              </div>
              <div className="flex shrink-0 items-center gap-3">
                <span className="text-sm font-semibold tabular-nums">{formatMoney(invoice.amount)}</span>
                <Badge variant={invoice.status === "Paid" ? "success" : "warning"} className="w-16">
                  {invoice.status}
                </Badge>
              </div>
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  );
}
