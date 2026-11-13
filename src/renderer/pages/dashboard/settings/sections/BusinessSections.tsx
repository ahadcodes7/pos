import { Building2, Calculator, Hash, ImagePlus, Package, Percent, ReceiptText } from "lucide-react";
import { FormField } from "@/renderer/components/common/FormField";
import { FormSection } from "@/renderer/components/common/FormSection";
import { Callout } from "@/renderer/components/ui/callout";
import { Input } from "@/renderer/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/renderer/components/ui/select";
import { Textarea } from "@/renderer/components/ui/textarea";
import { formatMoney } from "@/renderer/lib/money";
import { cn } from "@/renderer/lib/utils";
import { paymentModes, uomOptions } from "../../invoice/sale/sale-data";
import { paperSizes, roundingOptions, type Rounding } from "../settings-data";
import { useSettingsForm } from "../settings-store";
import { SectionHeading, SwitchSetting, TextSetting } from "./fields";

export function BusinessSection() {
  const { draft } = useSettingsForm();
  const b = draft.business;

  return (
    <>
      <SectionHeading id="business" />
      <FormSection icon={Building2} title="Business details" description="Shown on receipts, invoices and reports.">
        <div className="grid gap-5 sm:grid-cols-2">
          <TextSetting group="business" field="name" label="Business name" required placeholder="e.g. Naya Mart" />
          <TextSetting group="business" field="legalName" label="Legal name" optional />
          <TextSetting group="business" field="ntn" label="NTN" optional hint="National Tax Number, e.g. 1234567-8" />
          <TextSetting group="business" field="strn" label="STRN" optional hint="Sales Tax Registration Number" />
          <TextSetting group="business" field="phone" label="Phone" inputMode="tel" />
          <TextSetting group="business" field="email" label="Email" optional inputMode="email" />
          <TextSetting group="business" field="address" label="Address" className="sm:col-span-2" />
          <TextSetting group="business" field="city" label="City" />
        </div>
      </FormSection>

      <FormSection icon={ImagePlus} title="Logo & receipt header" description="How the top of every receipt looks.">
        <div className="grid gap-5 sm:grid-cols-[10rem_1fr]">
          <button
            type="button"
            disabled
            title="Coming soon"
            className="flex aspect-square flex-col items-center justify-center gap-2 rounded-xl border border-dashed border-border bg-muted/40 text-center text-xs text-muted-foreground disabled:cursor-not-allowed"
          >
            <ImagePlus aria-hidden="true" className="size-6 opacity-60" />
            Upload logo
            <span className="text-[11px] opacity-80">Coming soon</span>
          </button>
          <div aria-label="Receipt header preview" role="figure" className="rounded-xl border border-border/70 bg-background p-5 text-center font-mono text-xs leading-relaxed">
            <div className="text-sm font-bold tracking-wide uppercase">{b.name.trim() || "Your business"}</div>
            {b.address && <div>{b.address}</div>}
            {b.city && <div>{b.city}</div>}
            {b.phone && <div>Tel: {b.phone}</div>}
            {(b.ntn || b.strn) && (
              <div className="mt-1 text-muted-foreground">
                {b.ntn && `NTN ${b.ntn}`}
                {b.ntn && b.strn && " · "}
                {b.strn && `STRN ${b.strn}`}
              </div>
            )}
            <div className="mt-3 border-t border-dashed border-border pt-2 text-muted-foreground">SALE RECEIPT</div>
          </div>
        </div>
      </FormSection>
    </>
  );
}

export function InvoicesSection() {
  const { draft, update } = useSettingsForm();
  const inv = draft.invoices;
  const nextValid = /^\d+$/.test(inv.nextNumber.trim()) && Number(inv.nextNumber) >= 1;
  const preview = `${inv.prefix}${nextValid ? inv.nextNumber.trim().padStart(6, "0") : "——————"}`;

  return (
    <>
      <SectionHeading id="invoices" />
      <FormSection
        icon={Hash}
        title="Numbering"
        description="Each sale gets the next number in sequence."
        aside={
          <span className="rounded-lg border border-border/70 bg-muted/50 px-2.5 py-1 font-mono text-xs font-semibold" aria-label={`Next invoice number ${preview}`}>
            {preview}
          </span>
        }
      >
        <div className="grid gap-5 sm:grid-cols-2">
          <TextSetting group="invoices" field="prefix" label="Prefix" required hint="Letters before the number, e.g. INV-" />
          <TextSetting group="invoices" field="nextNumber" label="Next number" required inputMode="numeric" hint="Can only move forward once sales exist." />
        </div>
      </FormSection>

      <FormSection icon={ReceiptText} title="Receipts" description="Paper, payment default and what gets printed.">
        <fieldset className="space-y-2">
          <legend className="mb-2 text-sm font-medium">Paper size</legend>
          <div role="radiogroup" aria-label="Paper size" className="grid gap-3 sm:grid-cols-3">
            {paperSizes.map((p) => {
              const selected = inv.paperSize === p.id;
              return (
                <button
                  key={p.id}
                  type="button"
                  role="radio"
                  aria-checked={selected}
                  onClick={() => update("invoices", { paperSize: p.id })}
                  className={cn(
                    "rounded-xl border p-3 text-left transition-colors outline-none focus-visible:ring-[3px] focus-visible:ring-ring/30",
                    selected ? "border-primary bg-accent" : "border-border/80 hover:bg-muted/50",
                  )}
                >
                  <span className="block text-sm font-semibold">{p.name}</span>
                  <span className="block text-xs text-muted-foreground">{p.hint}</span>
                </button>
              );
            })}
          </div>
        </fieldset>

        <FormField htmlFor="invoices-defaultPayment" label="Default payment method">
          <Select value={inv.defaultPayment} onValueChange={(defaultPayment) => update("invoices", { defaultPayment })}>
            <SelectTrigger id="invoices-defaultPayment" className="w-full sm:w-64">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {paymentModes.map((m) => (
                <SelectItem key={m.id} value={m.id}>
                  {m.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </FormField>

        <div className="space-y-2">
          <SwitchSetting group="invoices" field="printAfterSale" label="Print after each sale" description="Send the receipt to the printer when a sale completes." />
          <SwitchSetting group="invoices" field="showTaxBreakdown" label="Show tax breakdown" description="List tax separately on the receipt." />
          <SwitchSetting group="invoices" field="askCustomerOnCredit" label="Require a customer for credit sales" description="Walk-in customers can't buy on credit." />
        </div>

        <FormField htmlFor="invoices-footerNote" label="Receipt footer" optional hint={`${inv.footerNote.length}/200 characters`}>
          <Textarea
            id="invoices-footerNote"
            rows={3}
            maxLength={200}
            value={inv.footerNote}
            onChange={(e) => update("invoices", { footerNote: e.target.value })}
            aria-describedby="invoices-footerNote-hint"
          />
        </FormField>
      </FormSection>
    </>
  );
}

const ROUND_TO: Record<Rounding, number> = { none: 1, rupee: 100, five: 500 };

/** The worked example for Rs 1,000, in integer paisa. */
function taxExample(ratePct: number, inclusive: boolean, rounding: Rounding) {
  const price = 100000;
  const step = ROUND_TO[rounding];
  if (inclusive) {
    const net = Math.round((price * 100) / (100 + ratePct));
    return { net, tax: price - net, total: Math.round(price / step) * step };
  }
  const tax = Math.round((price * ratePct) / 100);
  return { net: price, tax, total: Math.round((price + tax) / step) * step };
}

export function TaxSection() {
  const { draft, errors, update } = useSettingsForm();
  const t = draft.tax;
  const example = errors["tax.defaultRate"] ? null : taxExample(Number(t.defaultRate), t.pricesIncludeTax, t.rounding);

  return (
    <>
      <SectionHeading id="tax" />
      <FormSection icon={Percent} title="Tax" description="Applied to new products and invoice lines unless changed.">
        <div className="grid gap-5 sm:grid-cols-2">
          <TextSetting group="tax" field="label" label="Tax label" required hint="Printed on receipts, e.g. GST" />
          <TextSetting group="tax" field="defaultRate" label="Default tax rate" required inputMode="decimal" trailing="%" />
          <FormField htmlFor="tax-currency" label="Currency" hint="Fixed for this business.">
            <Input id="tax-currency" value="PKR · Pakistani Rupee" disabled aria-describedby="tax-currency-hint" />
          </FormField>
          <FormField htmlFor="tax-rounding" label="Round totals">
            <Select value={t.rounding} onValueChange={(rounding) => update("tax", { rounding: rounding as Rounding })}>
              <SelectTrigger id="tax-rounding" className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {roundingOptions.map((r) => (
                  <SelectItem key={r.id} value={r.id}>
                    {r.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </FormField>
        </div>
        <SwitchSetting group="tax" field="pricesIncludeTax" label="Prices include tax" description="Selling prices you enter already contain tax." />
      </FormSection>

      <FormSection icon={Calculator} title="Example" description="How a Rs 1,000 item is billed with these settings.">
        {example ? (
          <dl className="grid grid-cols-3 gap-3 text-sm">
            {[
              [t.pricesIncludeTax ? "Price before tax" : "Price", formatMoney(example.net)],
              [`${t.label.trim() || "Tax"} ${t.defaultRate}%`, formatMoney(example.tax)],
              ["Customer pays", formatMoney(example.total)],
            ].map(([label, value], i) => (
              <div key={label} className={cn("rounded-xl border border-border/70 p-3", i === 2 && "border-primary/30 bg-primary/[0.05]")}>
                <dt className="text-xs text-muted-foreground">{label}</dt>
                <dd className="mt-1 text-base font-semibold tabular-nums">{value}</dd>
              </div>
            ))}
          </dl>
        ) : (
          <p className="text-sm text-muted-foreground">Enter a valid tax rate to see the example.</p>
        )}
      </FormSection>
    </>
  );
}

export function InventorySection() {
  const { draft, update } = useSettingsForm();
  const inv = draft.inventory;

  return (
    <>
      <SectionHeading id="inventory" />
      <FormSection icon={Package} title="Stock" description="Defaults for new products and how stock limits sales.">
        <div className="grid gap-5 sm:grid-cols-2">
          <TextSetting
            group="inventory"
            field="lowStockThreshold"
            label="Low-stock alert at"
            required
            inputMode="numeric"
            trailing="units"
            hint="Products at or below this count show as low stock."
          />
          <FormField htmlFor="inventory-defaultUnit" label="Default unit">
            <Select value={inv.defaultUnit} onValueChange={(defaultUnit) => update("inventory", { defaultUnit })}>
              <SelectTrigger id="inventory-defaultUnit" className="w-full">
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
          </FormField>
        </div>
        <div className="space-y-2">
          <SwitchSetting group="inventory" field="trackByDefault" label="Track stock for new products" description="New products start with stock tracking turned on." />
          <SwitchSetting group="inventory" field="allowNegativeStock" label="Allow selling below zero" description="Let sales continue when the counted stock runs out." />
        </div>
        {inv.allowNegativeStock && (
          <Callout tone="warning" compact>
            Stock counts can go negative, so low-stock alerts and reports may be off until you restock or adjust.
          </Callout>
        )}
      </FormSection>
    </>
  );
}

