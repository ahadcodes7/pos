import { useMemo } from "react";
import { 
  Search, 
  Plus, 
  Trash2, 
  X,
  Grid3X3,
  List,
  Check,
} from "lucide-react";
import { Button } from "@/renderer/components/ui/button";
import { Input } from "@/renderer/components/ui/input";
import { useTableViewReducer, calculateTableTotals } from "./hooks/useTableViewReducer";
import type { ViewMode } from "./sale-data";
import { 
  mockProducts, 
  formatCurrency, 
  filterProducts 
} from "./sale-data";

interface TableViewProps {
  viewMode: ViewMode;
  setViewMode: (mode: ViewMode) => void;
}

function TableView({ viewMode, setViewMode }: TableViewProps) {
  const { state, actions } = useTableViewReducer();

  const filteredProducts = useMemo(
    () => filterProducts(mockProducts, state.searchQuery),
    [mockProducts, state.searchQuery]
  );

  const totals = useMemo(
    () => calculateTableTotals(state.items),
    [state.items]
  );

  return (
    <div className="flex flex-col h-full">
      {/* Header with View Toggle */}
      <div className="flex items-center justify-between mb-3 shrink-0">
        <h2 className="text-lg font-semibold">Sale Invoice</h2>
        <div className="flex items-center gap-1 bg-muted rounded-lg p-0.5 shrink-0">
          <Button
            variant={viewMode === "card" ? "default" : "ghost"}
            size="sm"
            className="h-7 px-2"
            onClick={() => setViewMode("card")}
          >
            <Grid3X3 className="w-3.5 h-3.5" />
          </Button>
          <Button
            variant={viewMode === "table" ? "default" : "ghost"}
            size="sm"
            className="h-7 px-2"
            onClick={() => setViewMode("table")}
          >
            <List className="w-3.5 h-3.5" />
          </Button>
        </div>
      </div>

      {/* Search */}
      <div className="mb-3 shrink-0">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search products to add..."
            value={state.searchQuery}
            onChange={(e) => actions.setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      {/* Staging Area */}
      {state.searchQuery && filteredProducts.length > 0 && (
        <div className="border rounded-lg p-3 bg-muted/30 mb-3 shrink-0">
          <div className="flex flex-wrap gap-2">
            {filteredProducts.slice(0, 8).map(product => (
              <Button
                key={product.id}
                variant="outline"
                size="sm"
                onClick={() => actions.addItem(product)}
              >
                <Plus className="w-3 h-3 mr-1" />
                {product.name}
              </Button>
            ))}
          </div>
        </div>
      )}

      {/* Main Table */}
      <div className="flex-1 border rounded-lg overflow-hidden flex flex-col">
        <div className="overflow-auto flex-1">
          <table className="w-full">
            <thead className="sticky top-0 bg-muted">
              <tr>
                <th className="text-left p-2 text-xs font-medium w-10">#</th>
                <th className="text-left p-2 text-xs font-medium">Item</th>
                <th className="text-left p-2 text-xs font-medium">SKU</th>
                <th className="text-right p-2 text-xs font-medium w-20">Qty</th>
                <th className="text-right p-2 text-xs font-medium w-24">Price</th>
                <th className="text-right p-2 text-xs font-medium w-20">Tax %</th>
                <th className="text-right p-2 text-xs font-medium w-24">Total</th>
                <th className="p-2 w-10"></th>
              </tr>
            </thead>
            <tbody>
              {state.items.length === 0 ? (
                <tr>
                  <td colSpan={8} className="p-8 text-center text-muted-foreground">
                    Search and add products above
                  </td>
                </tr>
              ) : (
                state.items.map((item, index) => {
                  // FLAG(money): float math; Number() mirrors the implicit coercion of the original `*`.
                  const lineTotal = (Number(item.price) * Number(item.quantity)) * (1 + Number(item.taxRate || 18) / 100);
                  return (
                    <tr key={item.id} className="border-t hover:bg-muted/50">
                      <td className="p-2 text-sm">{index + 1}</td>
                      <td className="p-2 text-sm font-medium">{item.name}</td>
                      <td className="p-2 text-sm text-muted-foreground">{item.sku}</td>
                      <td className="p-1">
                        <Input
                          type="number"
                          min="1"
                          value={item.quantity}
                          onChange={(e) => actions.updateItem(item.id, 'quantity', e.target.value)}
                          className="h-9 w-16 text-right"
                        />
                      </td>
                      <td className="p-1">
                        <Input
                          type="number"
                          min="0"
                          value={item.price}
                          onChange={(e) => actions.updateItem(item.id, 'price', e.target.value)}
                          className="h-9 w-20 text-right"
                        />
                      </td>
                      <td className="p-1">
                        <Input
                          type="number"
                          min="0"
                          max="100"
                          value={item.taxRate || 18}
                          onChange={(e) => actions.updateItem(item.id, 'taxRate', e.target.value)}
                          className="h-9 w-16 text-right"
                        />
                      </td>
                      <td className="p-2 text-sm font-medium text-right">
                        {formatCurrency(lineTotal)}
                      </td>
                      <td className="p-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-destructive"
                          onClick={() => actions.removeItem(item.id)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Table Footer */}
        {state.items.length > 0 && (
          <div className="border-t p-3 bg-muted/30 flex justify-end gap-6 shrink-0">
            <div className="text-right">
              <div className="text-xs text-muted-foreground">Items</div>
              <div className="font-medium">{totals.itemCount}</div>
            </div>
            <div className="text-right">
              <div className="text-xs text-muted-foreground">Total</div>
              <div className="font-bold text-lg">{formatCurrency(totals.total)}</div>
            </div>
          </div>
        )}
      </div>

      {/* Action Buttons */}
      <div className="flex gap-2 justify-end mt-3 shrink-0">
        <Button variant="outline" onClick={() => actions.clearAll()}>
          <X className="w-4 h-4 mr-2" />
          Clear
        </Button>
        <Button variant="commit" disabled={state.items.length === 0}>
          <Check className="w-4 h-4" />
          Create Invoice
        </Button>
      </div>
    </div>
  );
}

export default TableView;
