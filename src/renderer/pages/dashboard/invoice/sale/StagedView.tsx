import { useState, type FormEvent } from "react";
import { ClipboardList, PackagePlus, Pencil, Trash2 } from "lucide-react";
import { Button } from "@/renderer/components/ui/button";
import { Callout } from "@/renderer/components/ui/callout";
import { Label } from "@/renderer/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/renderer/components/ui/select";
import { fieldVariants } from "@/renderer/components/ui/field";
import { InputGroup } from "@/renderer/components/common/InputGroup";
import { formatMoney } from "@/renderer/lib/money";
import { cn } from "@/renderer/lib/utils";
import type { Money } from "@/shared/contracts/common";
import type { InvoiceLine, SaleDraft } from "./hooks/useSaleDraft";
import { getStockStatus, mockProducts, uomOptions, type SaleProduct } from "./sale-data";
import { lineAmounts, paisaToRupeesText, parsePercent, rupeesToPaisa } from "./sale-math";
import { CustomerPicker } from "./components/CustomerPicker";
import { NumberInput } from "./components/NumberInput";
import { ProductCombobox } from "./components/ProductCombobox";
import { QuantityStepper } from "./components/QuantityStepper";
import { TotalsPanel } from "./components/TotalsPanel";

/** The line being prepared in the staging card (local form state, committed on Add/Update). */
interface Stage {
  editingLineId: string | null;
  product: SaleProduct | null;
  quantity: number;
  uom: string;
  unitPrice: Money;
  discountPct: number;
  taxPct: number;
}

const emptyStage: Stage = { editingLineId: null, product: null, quantity: 1, uom: "pc", unitPrice: 0, discountPct: 0, taxPct: 0 };

const stageFromProduct = (product: SaleProduct): Stage => ({
  editingLineId: null,
  product,
  quantity: 1,
  uom: product.uom || "pc",
  unitPrice: product.price,
  discountPct: product.discount ?? 0,
  taxPct: product.taxRate,
});

const formatPct = (v: number) => String(v);
const parseMoney = (text: string) => rupeesToPaisa(text);

/** Pick a product, check every detail in the staging card, then add it. Click a row to edit it. */
export default function StagedView({ draft }: { draft: SaleDraft }) {
  const { activeOrder, totals, actions } = draft;
  const [stage, setStage] = useState<Stage>(emptyStage);
  const lines = activeOrder.lines.filter((l) => l.productId !== null);

  // If the line being edited disappears (removed, cleared, other order), drop out of edit mode.
  const editing = stage.editingLineId !== null && lines.some((l) => l.id === stage.editingLineId);
  const preview = stage.product ? lineAmounts({ ...stage, productId: stage.product.id }) : null;
  const overStock = stage.product !== null && stage.quantity > stage.product.stock;

  const set = (patch: Partial<Stage>) => setStage((s) => ({ ...s, ...patch }));

  const editLine = (line: InvoiceLine) => {
    const product = mockProducts.find((p) => p.id === line.productId) ?? null;
    setStage({ editingLineId: line.id, product, quantity: line.quantity, uom: line.uom, unitPrice: line.unitPrice, discountPct: line.discountPct, taxPct: line.taxPct });
  };

  const submit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!stage.product) return;
    const details = { quantity: stage.quantity, uom: stage.uom, unitPrice: stage.unitPrice, discountPct: stage.discountPct, taxPct: stage.taxPct };
    if (editing && stage.editingLineId) actions.updateLine(stage.editingLineId, details);
    else actions.addLine({ product: stage.product, ...details });
    setStage(emptyStage);
  };

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <div className="flex min-h-0 flex-1 flex-col gap-4 overflow-y-auto p-5 pt-4">
        <div className="flex flex-wrap items-center gap-3">
          <Label className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Customer</Label>
          <CustomerPicker customerId={activeOrder.customerId} onChange={actions.setCustomer} className="w-full max-w-sm" />
        </div>

        {/* Staging card */}
        <form
          onSubmit={submit}
          aria-label={editing ? "Edit line" : "Stage a line"}
          className={cn(
            "rounded-2xl border bg-card p-5 shadow-xs transition-colors",
            editing ? "border-primary/40 ring-1 ring-primary/15" : "border-border/70",
          )}
        >
          <div className="mb-4 flex items-center gap-3">
            <span aria-hidden="true" className="flex size-9 items-center justify-center rounded-xl bg-primary/10 text-primary">
              {editing ? <Pencil className="size-[18px]" /> : <PackagePlus className="size-[18px]" />}
            </span>
            <div>
              <h2 className="text-base font-semibold">{editing ? "Edit line" : "Stage a line"}</h2>
              <p className="text-sm text-muted-foreground">
                {editing ? "Change the details, then update the line." : "Choose a product and check its details before adding it."}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 xl:grid-cols-[minmax(14rem,2fr)_9.5rem_6rem_minmax(8rem,1fr)_7rem_7rem]">
            <div className="col-span-2 space-y-2 sm:col-span-3 xl:col-span-1">
              <Label>Product</Label>
              <ProductCombobox
                aria-label="Product"
                value={stage.product?.id ?? null}
                onSelect={(p) => setStage((s) => ({ ...stageFromProduct(p), editingLineId: editing ? s.editingLineId : null }))}
              />
              {stage.product && (
                <p className="flex items-center gap-1.5 text-xs text-muted-foreground">
                  {stage.product.sku}
                  <span aria-hidden="true">·</span>
                  {getStockStatus(stage.product.stock).label}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label>Quantity</Label>
              <QuantityStepper value={stage.quantity} label="quantity" onChange={(quantity) => set({ quantity })} className="w-full [&>input]:flex-1" />
            </div>

            <div className="space-y-2">
              <Label>Unit</Label>
              <Select value={stage.uom} onValueChange={(uom) => set({ uom })}>
                <SelectTrigger aria-label="Unit" className="w-full">
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
            </div>

            <div className="space-y-2">
              <Label>Rate</Label>
              <InputGroup leading="Rs">
                <NumberInput aria-label="Rate" value={stage.unitPrice} format={paisaToRupeesText} parse={parseMoney} onCommit={(unitPrice) => set({ unitPrice })} className={cn(fieldVariants, "text-right")} />
              </InputGroup>
            </div>

            <div className="space-y-2">
              <Label>Discount</Label>
              <InputGroup trailing="%">
                <NumberInput aria-label="Discount percent" value={stage.discountPct} format={formatPct} parse={parsePercent} onCommit={(discountPct) => set({ discountPct })} className={cn(fieldVariants, "text-right")} />
              </InputGroup>
            </div>

            <div className="space-y-2">
              <Label>Tax</Label>
              <InputGroup trailing="%">
                <NumberInput aria-label="Tax percent" value={stage.taxPct} format={formatPct} parse={parsePercent} onCommit={(taxPct) => set({ taxPct })} className={cn(fieldVariants, "text-right")} />
              </InputGroup>
            </div>
          </div>

          {overStock && stage.product && (
            <Callout tone="warning" compact className="mt-4">
              Only {stage.product.stock} in stock. You can still add {stage.quantity}, but stock will go negative.
            </Callout>
          )}

          <div className="mt-5 flex flex-wrap items-center gap-x-6 gap-y-3 border-t border-border/70 pt-4">
            <dl aria-label="Line preview" className="flex flex-wrap items-baseline gap-x-5 gap-y-1 text-sm">
              {preview ? (
                <>
                  <div className="flex gap-1.5">
                    <dt className="text-muted-foreground">Gross</dt>
                    <dd className="font-medium tabular-nums">{formatMoney(preview.gross)}</dd>
                  </div>
                  <div className="flex gap-1.5">
                    <dt className="text-muted-foreground">Discount</dt>
                    <dd className="font-medium tabular-nums">{preview.discount ? `−${formatMoney(preview.discount)}` : formatMoney(0)}</dd>
                  </div>
                  <div className="flex gap-1.5">
                    <dt className="text-muted-foreground">Tax</dt>
                    <dd className="font-medium tabular-nums">{formatMoney(preview.tax)}</dd>
                  </div>
                  <div className="flex items-baseline gap-1.5">
                    <dt className="font-semibold">Line total</dt>
                    <dd className="text-lg font-bold tabular-nums">{formatMoney(preview.total)}</dd>
                  </div>
                </>
              ) : (
                <div className="text-muted-foreground">The line total appears here once a product is chosen.</div>
              )}
            </dl>
            <div className="ml-auto flex gap-2">
              {(stage.product || editing) && (
                <Button type="button" variant="ghost" onClick={() => setStage(emptyStage)}>
                  {editing ? "Cancel edit" : "Reset"}
                </Button>
              )}
              <Button type="submit" disabled={!stage.product}>
                {editing ? "Update line" : "Add to invoice"}
              </Button>
            </div>
          </div>
        </form>

        {/* Lines */}
        <div className="overflow-hidden rounded-2xl border border-border/70 bg-card shadow-xs">
          <table className="w-full text-sm">
            <caption className="sr-only">Invoice lines. Select a row to edit it.</caption>
            <thead className="bg-muted/50 text-xs font-semibold text-muted-foreground">
              <tr className="[&>th]:h-10 [&>th]:px-3 [&>th]:font-semibold">
                <th scope="col" className="w-10 text-left">#</th>
                <th scope="col" className="text-left">Item</th>
                <th scope="col" className="w-20 text-right">Qty</th>
                <th scope="col" className="w-16 text-left">Unit</th>
                <th scope="col" className="w-28 text-right">Rate</th>
                <th scope="col" className="w-20 text-right">Disc</th>
                <th scope="col" className="w-20 text-right">Tax</th>
                <th scope="col" className="w-32 text-right">Amount</th>
                <th scope="col" className="w-20"><span className="sr-only">Actions</span></th>
              </tr>
            </thead>
            <tbody>
              {lines.length === 0 ? (
                <tr>
                  <td colSpan={9} className="px-3 py-12 text-center">
                    <ClipboardList aria-hidden="true" className="mx-auto mb-2 size-8 text-muted-foreground/50" />
                    <p className="font-medium">No lines yet</p>
                    <p className="text-xs text-muted-foreground">Choose a product above to stage your first line.</p>
                  </td>
                </tr>
              ) : (
                lines.map((line, i) => {
                  const selected = editing && stage.editingLineId === line.id;
                  return (
                    <tr
                      key={line.id}
                      aria-selected={selected}
                      onClick={() => editLine(line)}
                      className={cn(
                        "cursor-pointer border-t border-border/60 transition-colors [&>td]:h-12 [&>td]:px-3",
                        selected ? "bg-primary/[0.06]" : "hover:bg-muted/40",
                      )}
                    >
                      <td className="text-muted-foreground tabular-nums">{i + 1}</td>
                      <td>
                        <div className="flex items-center gap-2.5">
                          <span aria-hidden="true" className="text-lg leading-none">{line.image}</span>
                          <div className="min-w-0">
                            <div className="truncate font-medium">{line.name}</div>
                            <div className="text-xs text-muted-foreground">{line.sku}</div>
                          </div>
                        </div>
                      </td>
                      <td className="text-right tabular-nums">{line.quantity}</td>
                      <td className="text-muted-foreground">{line.uom}</td>
                      <td className="text-right tabular-nums">{formatMoney(line.unitPrice)}</td>
                      <td className="text-right tabular-nums text-muted-foreground">{line.discountPct ? `${line.discountPct}%` : "—"}</td>
                      <td className="text-right tabular-nums text-muted-foreground">{line.taxPct}%</td>
                      <td className="text-right font-semibold tabular-nums">{formatMoney(lineAmounts(line).total)}</td>
                      <td>
                        <div className="flex justify-end gap-0.5">
                          <button
                            type="button"
                            aria-label={`Edit ${line.name}`}
                            title="Edit"
                            onClick={(e) => {
                              e.stopPropagation();
                              editLine(line);
                            }}
                            className="flex size-8 cursor-pointer items-center justify-center rounded-lg text-muted-foreground hover:bg-foreground/[0.06] hover:text-foreground"
                          >
                            <Pencil className="size-3.5" />
                          </button>
                          <button
                            type="button"
                            aria-label={`Remove ${line.name}`}
                            title="Remove"
                            onClick={(e) => {
                              e.stopPropagation();
                              actions.removeLine(line.id);
                            }}
                            className="flex size-8 cursor-pointer items-center justify-center rounded-lg text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
                          >
                            <Trash2 className="size-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
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
