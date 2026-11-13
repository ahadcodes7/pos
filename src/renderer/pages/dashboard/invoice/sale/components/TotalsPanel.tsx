import { Check, RotateCcw } from "lucide-react";
import { Button } from "@/renderer/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/renderer/components/ui/select";
import { formatMoney } from "@/renderer/lib/money";
import { cn } from "@/renderer/lib/utils";
import { paymentModes } from "../sale-data";
import type { InvoiceTotals } from "../sale-math";

interface TotalsPanelProps {
  totals: InvoiceTotals;
  paymentMode: string;
  onPaymentModeChange: (mode: string) => void;
  onClear: () => void;
  /** Saving is not wired to a backend yet; the button is enabled once there is a line. */
  onComplete?: () => void;
  /** "stack" for the card view's cart column, "bar" for the full-width table views. */
  layout: "stack" | "bar";
}

function PaymentSelect({ value, onChange, className }: { value: string; onChange: (v: string) => void; className?: string }) {
  return (
    <Select value={value} onValueChange={onChange}>
      <SelectTrigger aria-label="Payment method" className={cn("h-9", className)}>
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        {paymentModes.map((mode) => (
          <SelectItem key={mode.id} value={mode.id}>
            {mode.name}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}

function Figure({ label, value, muted = false }: { label: string; value: string; muted?: boolean }) {
  return (
    <div className="flex items-baseline justify-between gap-4">
      <dt className="text-muted-foreground">{label}</dt>
      <dd className={cn("tabular-nums", muted ? "text-muted-foreground" : "font-medium")}>{value}</dd>
    </div>
  );
}

/** Payment method, the money breakdown and the Clear / Complete sale actions. */
export function TotalsPanel({ totals, paymentMode, onPaymentModeChange, onClear, onComplete, layout }: TotalsPanelProps) {
  const empty = totals.lineCount === 0;
  const discount = totals.discount > 0 ? `−${formatMoney(totals.discount)}` : formatMoney(0);

  const actions = (
    <>
      <Button type="button" variant="outline" onClick={onClear} disabled={empty}>
        <RotateCcw />
        Clear
      </Button>
      <Button type="button" variant="commit" onClick={onComplete} disabled={empty}>
        <Check />
        Complete sale
      </Button>
    </>
  );

  if (layout === "stack") {
    return (
      <div className="space-y-4 border-t border-border/70 bg-muted/30 p-4">
        <div className="flex items-center justify-between gap-3">
          <span className="text-sm text-muted-foreground">Payment</span>
          <PaymentSelect value={paymentMode} onChange={onPaymentModeChange} className="w-40" />
        </div>
        <dl className="space-y-1.5 text-sm">
          <Figure label="Subtotal" value={formatMoney(totals.subTotal)} />
          <Figure label="Discount" value={discount} muted={totals.discount === 0} />
          <Figure label="Tax" value={formatMoney(totals.tax)} />
          <div className="flex items-baseline justify-between gap-4 border-t border-dashed border-border pt-3">
            <dt className="font-semibold">Total</dt>
            <dd className="text-2xl font-bold tracking-tight tabular-nums">{formatMoney(totals.grandTotal)}</dd>
          </div>
        </dl>
        <div className="grid grid-cols-[auto_1fr] gap-2">{actions}</div>
      </div>
    );
  }

  return (
    <div className="flex flex-wrap items-center gap-x-8 gap-y-3 border-t border-border/70 bg-muted/30 px-5 py-3">
      <div className="space-y-1">
        <div className="text-xs font-medium text-muted-foreground">Payment</div>
        <PaymentSelect value={paymentMode} onChange={onPaymentModeChange} className="h-8 w-36" />
      </div>
      <dl className="flex items-start gap-x-6 text-sm">
        {[
          ["Lines", String(totals.lineCount)],
          ["Subtotal", formatMoney(totals.subTotal)],
          ["Discount", discount],
          ["Tax", formatMoney(totals.tax)],
        ].map(([label, value]) => (
          <div key={label} className="space-y-1">
            <dt className="text-xs font-medium text-muted-foreground">{label}</dt>
            <dd className="font-semibold leading-8 tabular-nums">{value}</dd>
          </div>
        ))}
      </dl>
      <div className="ml-auto flex items-center gap-5">
        <div className="text-right">
          <div className="text-xs font-medium text-muted-foreground">Total</div>
          <div className="text-2xl font-bold leading-tight tracking-tight tabular-nums">{formatMoney(totals.grandTotal)}</div>
        </div>
        <div className="flex gap-2">{actions}</div>
      </div>
    </div>
  );
}
