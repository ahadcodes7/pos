import type { KeyboardEvent } from "react";
import { LayoutGrid, ListChecks, Plus, Rows3, X } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { Button } from "@/renderer/components/ui/button";
import { cn } from "@/renderer/lib/utils";
import { viewModes, type ViewMode } from "../sale-data";
import type { Order } from "../hooks/useSaleDraft";

const VIEW_META: Record<ViewMode, { label: string; hint: string; Icon: LucideIcon }> = {
  card: { label: "Card", hint: "Tap products to add them", Icon: LayoutGrid },
  staged: { label: "Staged", hint: "Edit each line before adding it", Icon: ListChecks },
  grid: { label: "Quick entry", hint: "Type lines straight into a table", Icon: Rows3 },
};

function ViewSwitcher({ value, onChange }: { value: ViewMode; onChange: (v: ViewMode) => void }) {
  // Arrow keys move between options, like a native radio group.
  const onKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
    const step = e.key === "ArrowRight" ? 1 : e.key === "ArrowLeft" ? -1 : 0;
    if (!step) return;
    e.preventDefault();
    const next = viewModes[(viewModes.indexOf(value) + step + viewModes.length) % viewModes.length]!;
    onChange(next);
    e.currentTarget.querySelector<HTMLButtonElement>(`[data-view="${next}"]`)?.focus();
  };

  return (
    <div role="radiogroup" aria-label="Invoice view" onKeyDown={onKeyDown} className="flex shrink-0 items-center gap-0.5 rounded-xl bg-muted p-1">
      {viewModes.map((mode) => {
        const { label, hint, Icon } = VIEW_META[mode];
        const active = mode === value;
        return (
          <button
            key={mode}
            type="button"
            role="radio"
            data-view={mode}
            aria-checked={active}
            tabIndex={active ? 0 : -1}
            title={hint}
            onClick={() => onChange(mode)}
            className={cn(
              "flex h-8 cursor-pointer items-center gap-1.5 rounded-lg px-3 text-xs font-semibold transition-colors outline-none focus-visible:ring-2 focus-visible:ring-ring/40",
              active ? "bg-card text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground",
            )}
          >
            <Icon aria-hidden="true" className={cn("size-3.5", active && "text-primary")} />
            {label}
          </button>
        );
      })}
    </div>
  );
}

/** Held-order tabs, "New order" and the view switcher, shared by all three views. */
export function InvoiceToolbar({
  orders,
  activeOrderId,
  onSelectOrder,
  onAddOrder,
  onDeleteOrder,
  view,
  onViewChange,
}: {
  orders: Order[];
  activeOrderId: number;
  onSelectOrder: (id: number) => void;
  onAddOrder: () => void;
  onDeleteOrder: (id: number) => void;
  view: ViewMode;
  onViewChange: (v: ViewMode) => void;
}) {
  return (
    <div className="flex items-center gap-3">
      <div role="tablist" aria-label="Open orders" className="flex min-w-0 flex-1 items-center gap-1.5 overflow-x-auto py-0.5">
        {orders.map((order) => {
          const active = order.id === activeOrderId;
          const count = order.lines.filter((l) => l.productId !== null).length;
          return (
            <div
              key={order.id}
              className={cn(
                "group flex h-9 shrink-0 items-center rounded-lg border transition-colors",
                active ? "border-primary/30 bg-primary/[0.07] text-foreground" : "border-border/70 bg-card text-muted-foreground hover:text-foreground",
              )}
            >
              <button
                type="button"
                role="tab"
                aria-selected={active}
                onClick={() => onSelectOrder(order.id)}
                className="flex h-full cursor-pointer items-center gap-2 rounded-lg pl-3 pr-2 text-sm font-medium outline-none focus-visible:ring-2 focus-visible:ring-ring/40"
              >
                {order.name}
                <span
                  className={cn(
                    "min-w-5 rounded-full px-1.5 text-center text-[11px] font-semibold leading-5 tabular-nums",
                    active ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground",
                  )}
                >
                  {count}
                </span>
              </button>
              {orders.length > 1 && (
                <button
                  type="button"
                  aria-label={`Close ${order.name}`}
                  title={`Close ${order.name}`}
                  onClick={() => onDeleteOrder(order.id)}
                  className="mr-1 flex size-6 cursor-pointer items-center justify-center rounded-md text-muted-foreground outline-none hover:bg-foreground/[0.07] hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring/40"
                >
                  <X className="size-3.5" />
                </button>
              )}
            </div>
          );
        })}
        <Button type="button" variant="ghost" size="sm" className="h-9 shrink-0 text-muted-foreground hover:text-foreground" onClick={onAddOrder}>
          <Plus />
          New order
        </Button>
      </div>
      <ViewSwitcher value={view} onChange={onViewChange} />
    </div>
  );
}
