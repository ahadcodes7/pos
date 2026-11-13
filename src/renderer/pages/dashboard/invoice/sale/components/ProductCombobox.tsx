import { forwardRef, useState } from "react";
import { ChevronsUpDown } from "lucide-react";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/renderer/components/ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "@/renderer/components/ui/popover";
import { fieldVariants } from "@/renderer/components/ui/field";
import { formatMoney } from "@/renderer/lib/money";
import { cn } from "@/renderer/lib/utils";
import { getStockStatus, mockProducts, type SaleProduct } from "../sale-data";

const STOCK_DOT = { success: "bg-success", warning: "bg-warning", danger: "bg-destructive" } as const;

/**
 * Searchable product picker (name or SKU). `variant="field"` looks like any form field;
 * `variant="cell"` is borderless for the Quick entry grid. Out-of-stock products are disabled.
 */
export const ProductCombobox = forwardRef<
  HTMLButtonElement,
  {
    value: string | null;
    onSelect: (product: SaleProduct) => void;
    variant?: "field" | "cell";
    placeholder?: string;
    "aria-label"?: string;
    className?: string;
  }
>(function ProductCombobox({ value, onSelect, variant = "field", placeholder = "Select product", className, ...aria }, ref) {
  const [open, setOpen] = useState(false);
  const selected = value ? mockProducts.find((p) => p.id === value) : undefined;

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button
          ref={ref}
          type="button"
          role="combobox"
          aria-expanded={open}
          aria-label={aria["aria-label"]}
          className={cn(
            "flex min-w-0 cursor-pointer items-center gap-2 text-left text-sm",
            variant === "field"
              ? cn(fieldVariants, "data-[state=open]:border-ring data-[state=open]:bg-card data-[state=open]:ring-[3px] data-[state=open]:ring-ring/20")
              : "h-9 w-full rounded-md px-2 outline-none hover:bg-foreground/[0.04] focus-visible:bg-card focus-visible:ring-2 focus-visible:ring-ring/40 focus-visible:ring-inset data-[state=open]:bg-card data-[state=open]:ring-2 data-[state=open]:ring-ring/40 data-[state=open]:ring-inset",
            className,
          )}
        >
          {selected ? (
            <>
              <span aria-hidden="true" className="text-base leading-none">
                {selected.image}
              </span>
              <span className="truncate font-medium">{selected.name}</span>
            </>
          ) : (
            <span className="truncate text-muted-foreground">{placeholder}</span>
          )}
          <ChevronsUpDown aria-hidden="true" className="ml-auto size-3.5 shrink-0 text-muted-foreground" />
        </button>
      </PopoverTrigger>
      <PopoverContent align="start" className="w-[min(26rem,calc(100vw-2rem))] rounded-xl p-0">
        <Command>
          <CommandInput placeholder="Search name or SKU…" />
          <CommandList>
            <CommandEmpty>No products match.</CommandEmpty>
            <CommandGroup>
              {mockProducts.map((product) => {
                const stock = getStockStatus(product.stock);
                return (
                  <CommandItem
                    key={product.id}
                    value={`${product.name} ${product.sku}`}
                    disabled={product.stock === 0}
                    onSelect={() => {
                      onSelect(product);
                      setOpen(false);
                    }}
                    className="gap-3"
                  >
                    <span aria-hidden="true" className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-muted text-base">
                      {product.image}
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block truncate font-medium">{product.name}</span>
                      <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
                        {product.sku}
                        <span aria-hidden="true">·</span>
                        <span aria-hidden="true" className={cn("size-1.5 rounded-full", STOCK_DOT[stock.variant])} />
                        {stock.label}
                      </span>
                    </span>
                    <span className="shrink-0 text-sm font-semibold tabular-nums">{formatMoney(product.price)}</span>
                  </CommandItem>
                );
              })}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
});
