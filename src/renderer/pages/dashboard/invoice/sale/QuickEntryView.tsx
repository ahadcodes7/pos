import { useEffect, useRef, type KeyboardEvent } from "react";
import { Plus, Rows3, X } from "lucide-react";
import { Button } from "@/renderer/components/ui/button";
import { Label } from "@/renderer/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/renderer/components/ui/select";
import { formatMoney } from "@/renderer/lib/money";
import { cn } from "@/renderer/lib/utils";
import type { InvoiceLine, SaleDraft } from "./hooks/useSaleDraft";
import { uomOptions } from "./sale-data";
import { lineAmounts, paisaToRupeesText, parsePercent, parseQuantity, rupeesToPaisa } from "./sale-math";
import { CustomerPicker } from "./components/CustomerPicker";
import { NumberInput } from "./components/NumberInput";
import { ProductCombobox } from "./components/ProductCombobox";
import { TotalsPanel } from "./components/TotalsPanel";

/** Borderless cell input: blends into the row, shows a ring inside the cell when focused. */
const cell =
  "h-8 w-full min-w-0 rounded-md bg-transparent px-2 text-right text-sm outline-none transition-colors hover:bg-foreground/[0.04] focus:bg-card focus:ring-2 focus:ring-inset focus:ring-ring/40 disabled:pointer-events-none disabled:opacity-0";

const formatPlain = (v: number) => String(v);

/** QuickBooks-style entry: one compact row per line, a product dropdown in each, totals below. */
export default function QuickEntryView({ draft }: { draft: SaleDraft }) {
  const { activeOrder, totals, actions } = draft;
  const lines = activeOrder.lines;
  const productRefs = useRef(new Map<string, HTMLButtonElement>());
  // A newly added line's product cell gets focus once it has rendered (adding it changes `lines`).
  const pendingFocus = useRef<string | null>(null);

  useEffect(() => {
    const el = pendingFocus.current ? productRefs.current.get(pendingFocus.current) : undefined;
    if (el) {
      el.focus();
      pendingFocus.current = null;
    }
  }, [lines]);

  const addLine = () => {
    pendingFocus.current = actions.addBlankLine();
  };

  // Enter in the last cell of the last line starts a new line, so entry never leaves the keyboard.
  const onLastCellKeyDown = (index: number) => (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && index === lines.length - 1) {
      e.preventDefault();
      addLine();
    }
  };

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <div className="flex flex-wrap items-center gap-3 px-5 pb-3 pt-4">
        <Label className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Customer</Label>
        <CustomerPicker customerId={activeOrder.customerId} onChange={actions.setCustomer} className="w-full max-w-sm" />
      </div>

      <div className="mx-5 mb-4 flex min-h-0 flex-1 flex-col overflow-hidden rounded-2xl border border-border/70 bg-card shadow-xs">
        <div className="min-h-0 flex-1 overflow-auto">
          <table className="w-full min-w-[56rem] table-fixed border-collapse text-sm">
            <caption className="sr-only">Invoice lines</caption>
            <colgroup>
              <col className="w-11" />
              <col />
              <col className="w-24" />
              <col className="w-24" />
              <col className="w-32" />
              <col className="w-24" />
              <col className="w-24" />
              <col className="w-36" />
              <col className="w-11" />
            </colgroup>
            <thead className="sticky top-0 z-10 bg-muted/80 text-xs text-muted-foreground backdrop-blur">
              <tr className="[&>th]:h-9 [&>th]:border-b [&>th]:border-border/70 [&>th]:px-2 [&>th]:font-semibold">
                <th scope="col" className="text-center">#</th>
                <th scope="col" className="text-left">Product</th>
                <th scope="col" className="text-right">Qty</th>
                <th scope="col" className="text-left">Unit</th>
                <th scope="col" className="text-right">Rate (Rs)</th>
                <th scope="col" className="text-right">Disc %</th>
                <th scope="col" className="text-right">Tax %</th>
                <th scope="col" className="pr-4 text-right">Amount</th>
                <th scope="col"><span className="sr-only">Remove</span></th>
              </tr>
            </thead>
            <tbody>
              {lines.map((line, i) => (
                <GridRow
                  key={line.id}
                  line={line}
                  index={i}
                  draft={draft}
                  productRef={(el) => {
                    if (el) productRefs.current.set(line.id, el);
                    else productRefs.current.delete(line.id);
                  }}
                  onLastCellKeyDown={onLastCellKeyDown(i)}
                />
              ))}
            </tbody>
          </table>

          {lines.length === 0 && (
            <div className="flex flex-col items-center justify-center gap-2 py-14 text-center">
              <span className="flex size-12 items-center justify-center rounded-2xl bg-muted text-muted-foreground">
                <Rows3 aria-hidden="true" className="size-5" />
              </span>
              <p className="text-sm font-medium">No lines yet</p>
              <p className="text-xs text-muted-foreground">Add a line and pick a product to start.</p>
            </div>
          )}

          <div className="flex items-center gap-3 border-t border-border/60 px-3 py-2">
            <Button type="button" variant="ghost" size="sm" className="text-primary hover:text-primary" onClick={addLine}>
              <Plus />
              Add line
            </Button>
            {lines.length > 0 && (
              <span className="text-xs text-muted-foreground">or press Enter in the last row's Tax cell</span>
            )}
          </div>
        </div>
      </div>

      <TotalsPanel
        layout="bar"
        totals={totals}
        paymentMode={activeOrder.paymentMode}
        onPaymentModeChange={actions.setPaymentMode}
        onClear={actions.clearOrder}
      />
    </div>
  );
}

function GridRow({
  line,
  index,
  draft,
  productRef,
  onLastCellKeyDown,
}: {
  line: InvoiceLine;
  index: number;
  draft: SaleDraft;
  productRef: (el: HTMLButtonElement | null) => void;
  onLastCellKeyDown: (e: KeyboardEvent<HTMLInputElement>) => void;
}) {
  const { actions } = draft;
  const blank = line.productId === null;
  const n = index + 1;
  const update = actions.updateLine.bind(null, line.id);

  return (
    <tr className="group border-b border-border/50 hover:bg-muted/30 [&>td]:h-10 [&>td]:px-1">
      <td className="text-center text-xs text-muted-foreground tabular-nums">{n}</td>
      <td>
        <ProductCombobox
          ref={productRef}
          variant="cell"
          aria-label={`Product, line ${n}`}
          value={line.productId}
          onSelect={(product) => actions.setLineProduct(line.id, product)}
        />
      </td>
      <td>
        <NumberInput aria-label={`Quantity, line ${n}`} disabled={blank} value={line.quantity} format={formatPlain} parse={parseQuantity} onCommit={(quantity) => update({ quantity })} className={cell} />
      </td>
      <td>
        <Select value={line.uom} onValueChange={(uom) => update({ uom })} disabled={blank}>
          <SelectTrigger
            aria-label={`Unit, line ${n}`}
            className={cn(
              "h-8 w-full border-transparent bg-transparent px-2 text-sm shadow-none hover:bg-foreground/[0.04] focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-ring/40 data-[state=open]:ring-2 data-[state=open]:ring-inset",
              blank && "disabled:opacity-0",
            )}
          >
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {uomOptions.map((u) => (
              <SelectItem key={u.id} value={u.id}>
                {u.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </td>
      <td>
        <NumberInput aria-label={`Rate, line ${n}`} disabled={blank} value={line.unitPrice} format={paisaToRupeesText} parse={rupeesToPaisa} onCommit={(unitPrice) => update({ unitPrice })} className={cell} />
      </td>
      <td>
        <NumberInput aria-label={`Discount percent, line ${n}`} disabled={blank} value={line.discountPct} format={formatPlain} parse={parsePercent} onCommit={(discountPct) => update({ discountPct })} className={cell} />
      </td>
      <td>
        <NumberInput
          aria-label={`Tax percent, line ${n}`}
          disabled={blank}
          value={line.taxPct}
          format={formatPlain}
          parse={parsePercent}
          onCommit={(taxPct) => update({ taxPct })}
          onKeyDown={onLastCellKeyDown}
          className={cell}
        />
      </td>
      <td className="pr-4 text-right font-semibold tabular-nums">
        {blank ? <span className="text-muted-foreground">—</span> : formatMoney(lineAmounts(line).total)}
      </td>
      <td className="text-center">
        <button
          type="button"
          aria-label={`Remove line ${n}`}
          title="Remove line"
          onClick={() => actions.removeLine(line.id)}
          className="flex size-7 cursor-pointer items-center justify-center rounded-md text-muted-foreground opacity-60 transition hover:bg-destructive/10 hover:text-destructive group-hover:opacity-100 focus-visible:opacity-100"
        >
          <X className="size-3.5" />
        </button>
      </td>
    </tr>
  );
}
