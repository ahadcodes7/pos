import { useMemo, useState } from "react";
import { PackageSearch, Search, ShoppingBag, Trash2, X } from "lucide-react";
import { Badge } from "@/renderer/components/ui/badge";
import { Input } from "@/renderer/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/renderer/components/ui/select";
import { formatMoney } from "@/renderer/lib/money";
import { cn } from "@/renderer/lib/utils";
import type { InvoiceLine, SaleDraft } from "./hooks/useSaleDraft";
import { filterProducts, getStockStatus, mockCategories, mockProducts, uomOptions } from "./sale-data";
import { lineAmounts } from "./sale-math";
import { CustomerPicker } from "./components/CustomerPicker";
import { QuantityStepper } from "./components/QuantityStepper";
import { TotalsPanel } from "./components/TotalsPanel";

/** Tap-to-add product grid with the cart on the right. Fast for counter sales. */
export default function CardView({ draft }: { draft: SaleDraft }) {
  const { activeOrder, totals, actions } = draft;
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("all");

  const products = useMemo(() => filterProducts(mockProducts, search, category), [search, category]);
  const categoryCounts = useMemo(() => {
    const matches = filterProducts(mockProducts, search);
    return Object.fromEntries(
      mockCategories.map((c) => [c.id, c.id === "all" ? matches.length : matches.filter((p) => p.category === c.id).length]),
    );
  }, [search]);

  const lines = activeOrder.lines.filter((l) => l.productId !== null);
  const qtyInCart = (productId: string) =>
    lines.filter((l) => l.productId === productId).reduce((sum, l) => sum + l.quantity, 0);

  return (
    <div className="flex min-h-0 flex-1">
      {/* Products */}
      <section aria-label="Products" className="flex min-w-0 flex-1 flex-col gap-3 p-5 pt-4">
        <div className="relative">
          <Search aria-hidden="true" className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            type="search"
            aria-label="Search products"
            placeholder="Search by name or SKU"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10 pr-10 [&::-webkit-search-cancel-button]:hidden"
          />
          {search && (
            <button
              type="button"
              aria-label="Clear search"
              onClick={() => setSearch("")}
              className="absolute right-2 top-1/2 flex size-7 -translate-y-1/2 cursor-pointer items-center justify-center rounded-md text-muted-foreground hover:bg-foreground/[0.06] hover:text-foreground"
            >
              <X className="size-4" />
            </button>
          )}
        </div>

        <div role="group" aria-label="Categories" className="flex shrink-0 gap-1.5 overflow-x-auto pb-1">
          {mockCategories.map((c) => {
            const active = category === c.id;
            return (
              <button
                key={c.id}
                type="button"
                aria-pressed={active}
                onClick={() => setCategory(c.id)}
                className={cn(
                  "flex h-8 shrink-0 cursor-pointer items-center gap-1.5 rounded-full border px-3 text-xs font-semibold transition-colors outline-none focus-visible:ring-2 focus-visible:ring-ring/40",
                  active
                    ? "border-primary bg-primary text-primary-foreground"
                    : "border-border/70 bg-card text-muted-foreground hover:border-border hover:text-foreground",
                )}
              >
                <span aria-hidden="true">{c.icon}</span>
                {c.name}
                <span className={cn("tabular-nums", active ? "text-primary-foreground/75" : "text-muted-foreground/80")}>
                  {categoryCounts[c.id]}
                </span>
              </button>
            );
          })}
        </div>

        <div className="-mx-1 min-h-0 flex-1 overflow-y-auto px-1 pb-2">
          {products.length === 0 ? (
            <div className="flex h-full flex-col items-center justify-center gap-2 text-center text-muted-foreground">
              <PackageSearch aria-hidden="true" className="size-9 opacity-40" />
              <p className="text-sm font-medium text-foreground">No products match</p>
              <p className="text-xs">Try another name, SKU or category.</p>
            </div>
          ) : (
            <ul className="grid grid-cols-[repeat(auto-fill,minmax(10.5rem,1fr))] gap-3">
              {products.map((product) => {
                const stock = getStockStatus(product.stock);
                const inCart = qtyInCart(product.id);
                const out = product.stock === 0;
                return (
                  <li key={product.id}>
                    <button
                      type="button"
                      disabled={out}
                      onClick={() => actions.addProduct(product)}
                      aria-label={`Add ${product.name}, ${formatMoney(product.price)}${inCart ? `, ${inCart} in cart` : ""}`}
                      className={cn(
                        "group relative flex h-full w-full cursor-pointer flex-col rounded-2xl border bg-card p-3 text-left shadow-xs transition-[border-color,box-shadow,transform] outline-none",
                        "hover:-translate-y-px hover:border-primary/40 hover:shadow-md focus-visible:ring-[3px] focus-visible:ring-ring/30 active:translate-y-0",
                        inCart ? "border-primary/50 ring-1 ring-primary/20" : "border-border/70",
                        out && "cursor-not-allowed opacity-55 hover:translate-y-0 hover:border-border/70 hover:shadow-xs",
                      )}
                    >
                      {inCart > 0 && (
                        <span className="absolute right-2.5 top-2.5 min-w-6 rounded-full bg-primary px-1.5 text-center text-xs font-bold leading-6 text-primary-foreground tabular-nums">
                          {inCart}
                        </span>
                      )}
                      <span aria-hidden="true" className="mb-3 flex aspect-[4/3] w-full items-center justify-center rounded-xl bg-muted/70 text-4xl">
                        {product.image}
                      </span>
                      <span className="line-clamp-2 text-sm font-semibold leading-snug">{product.name}</span>
                      <span className="mt-0.5 text-xs text-muted-foreground">{product.sku}</span>
                      <span className="mt-auto flex items-end justify-between gap-2 pt-3">
                        <span className="text-base font-bold tabular-nums">{formatMoney(product.price)}</span>
                        <Badge variant={stock.variant} className="h-5 gap-1 px-1.5 text-[10px] leading-none">
                          <span aria-hidden="true" className="size-1.5 rounded-full bg-current" />
                          {out ? "Out of stock" : product.stock <= 5 ? `${product.stock} left` : `${product.stock} in stock`}
                        </Badge>
                      </span>
                    </button>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      </section>

      {/* Cart */}
      <aside aria-label="Cart" className="flex w-[22rem] shrink-0 flex-col border-l border-border/70 bg-card xl:w-96">
        <div className="space-y-2 border-b border-border/70 p-4">
          <div className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Customer</div>
          <CustomerPicker customerId={activeOrder.customerId} onChange={actions.setCustomer} />
        </div>

        <div className="flex items-center justify-between px-4 pb-1 pt-3">
          <h2 className="text-sm font-semibold">Cart</h2>
          <span className="text-xs text-muted-foreground">
            {lines.length} {lines.length === 1 ? "item" : "items"}
          </span>
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto px-3 pb-3">
          {lines.length === 0 ? (
            <div className="flex h-full flex-col items-center justify-center gap-2 px-6 text-center text-muted-foreground">
              <span className="flex size-12 items-center justify-center rounded-2xl bg-muted">
                <ShoppingBag aria-hidden="true" className="size-5" />
              </span>
              <p className="text-sm font-medium text-foreground">Cart is empty</p>
              <p className="text-xs">Tap a product to add it.</p>
            </div>
          ) : (
            <ul className="space-y-2 pt-1">
              {lines.map((line) => (
                <CartLine key={line.id} line={line} draft={draft} />
              ))}
            </ul>
          )}
        </div>

        <TotalsPanel
          layout="stack"
          totals={totals}
          paymentMode={activeOrder.paymentMode}
          onPaymentModeChange={actions.setPaymentMode}
          onClear={actions.clearOrder}
        />
      </aside>
    </div>
  );
}

function CartLine({ line, draft }: { line: InvoiceLine; draft: SaleDraft }) {
  const { actions } = draft;
  const amounts = lineAmounts(line);
  return (
    <li className="rounded-xl border border-border/70 bg-background/60 p-2.5">
      <div className="flex gap-3">
        <span aria-hidden="true" className="flex size-11 shrink-0 items-center justify-center rounded-lg bg-muted text-2xl">
          {line.image}
        </span>
        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-2">
            <h3 className="truncate text-sm font-semibold leading-tight">{line.name}</h3>
            <span className="shrink-0 text-sm font-bold tabular-nums">{formatMoney(amounts.total)}</span>
          </div>
          <p className="mt-0.5 text-xs text-muted-foreground tabular-nums">
            {formatMoney(line.unitPrice)} × {line.quantity}
            {line.discountPct > 0 && <span className="text-success"> · {line.discountPct}% off</span>}
          </p>
        </div>
      </div>
      <div className="mt-2 flex items-center gap-2 pl-14">
        <QuantityStepper size="sm" value={line.quantity} label={`quantity of ${line.name}`} onChange={(quantity) => actions.updateLine(line.id, { quantity })} />
        <Select value={line.uom} onValueChange={(uom) => actions.updateLine(line.id, { uom })}>
          <SelectTrigger aria-label={`Unit of ${line.name}`} className="h-8 w-[4.5rem] px-2.5 text-xs">
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
        <button
          type="button"
          aria-label={`Remove ${line.name}`}
          title="Remove"
          onClick={() => actions.removeLine(line.id)}
          className="ml-auto flex size-8 cursor-pointer items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive"
        >
          <Trash2 className="size-4" />
        </button>
      </div>
    </li>
  );
}
