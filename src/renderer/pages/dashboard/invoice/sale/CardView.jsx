import { useMemo, useState } from "react";
import {
  Search,
  ShoppingCart,
  Plus,
  Minus,
  Trash2,
  X,
  Grid3X3,
  List,
} from "lucide-react";
import { Button } from "@/renderer/components/ui/button";
import { Input } from "@/renderer/components/ui/input";
import { Label } from "@/renderer/components/ui/label";
import { Separator } from "@/renderer/components/ui/separator";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/renderer/components/ui/select";
import { cn } from "@/renderer/lib/utils";
import {
  useCardViewReducer,
  calculateOrderTotals,
} from "./hooks/useCardViewReducer";
import {
  mockCategories,
  mockProducts,
  mockCustomers,
  formatCurrency,
  filterProducts,
  getStockStatus,
  useInfiniteCustomers,
  uomOptions,
  paymentModes,
} from "./sale-data";
import { SearchableSelect, AddCustomerDialog } from "@/renderer/components/common";

function CardView({ viewMode, setViewMode }) {
  const { state, activeOrder, actions } = useCardViewReducer();
  const customerQuery = useInfiniteCustomers({});
  
  const [paymentMode, setPaymentMode] = useState("cash");
  const [addCustomerOpen, setAddCustomerOpen] = useState(false);

  const filteredProducts = useMemo(
    () =>
      filterProducts(mockProducts, state.searchQuery, state.selectedCategory),
    [state.searchQuery, state.selectedCategory],
  );

  const totals = useMemo(
    () => calculateOrderTotals(activeOrder.items),
    [activeOrder.items],
  );

  const handleClearCart = () => {
    setPaymentMode("cash");
    actions.clearOrder();
  };

  const handleAddCustomer = (newCustomer) => {
    actions.setCustomer(newCustomer.id);
  };

  return (
    <div className="flex h-full gap-2">
      {/* Left Side - Products */}
      <div className="flex-1 flex flex-col h-full overflow-hidden min-w-0 m-2">
        {/* Row 1: Orders */}
        <div className="flex items-center gap-2 mb-2 shrink-0">
          {/* Orders - Scrollable */}
          <div className="flex-1 flex items-center gap-2 overflow-x-auto pb-1">
            {state.orders.map((order) => (
              <button
                key={order.id}
                onClick={() => actions.setActiveOrder(order.id)}
                className={cn(
                  "cursor-pointer flex items-center gap-2 px-3 py-1.5 rounded-lg border transition-all whitespace-nowrap text-sm",
                  state.activeOrderId === order.id
                    ? "bg-secondary text-secondary-foreground border-secondary"
                    : "bg-card border-border hover:bg-muted",
                )}
              >
                <span className="font-medium">{order.name}</span>
                <span className="text-xs opacity-70">
                  ({order.items.length})
                </span>
                {state.orders.length > 1 && (
                  <X
                    className="w-3 h-3 opacity-70 hover:opacity-100 cursor-pointer"
                    onClick={(e) => {
                      e.stopPropagation();
                      actions.deleteOrder(order.id);
                    }}
                  />
                )}
              </button>
            ))}
          </div>
          {/* New Order Button - Fixed */}
          <Button
            variant="outline"
            size="sm"
            onClick={() => actions.addOrder()}
            className="shrink-0"
          >
            <Plus className="w-4 h-4 mr-1" />
            New
          </Button>

          {/* View Toggle */}
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

        {/* Category Bar */}
        <div className="flex gap-2 mb-2 overflow-x-auto pb-1 shrink-0">
          {mockCategories.map((category) => (
            <button
              key={category.id}
              onClick={() => actions.setCategory(category.id)}
              className={cn(
                "cursor-pointer flex items-center gap-1.5 px-3 py-1.5 rounded-md border transition-all whitespace-nowrap text-xs font-medium",
                state.selectedCategory === category.id
                  ? "bg-secondary text-secondary-foreground border-secondary"
                  : "bg-card border-border hover:bg-muted",
              )}
            >
              <span className="text-sm">{category.icon}</span>
              <span className="font-medium">{category.name}</span>
            </button>
          ))}
        </div>

        {/* Search Bar */}
        <div className="relative mb-2 shrink-0 mx-2">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search products..."
            value={state.searchQuery}
            onChange={(e) => actions.setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>

        {/* Products Grid */}
        <div className="flex-1 overflow-y-auto pb-1">
          <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-2">
            {filteredProducts.map((product) => {
              const stockStatus = getStockStatus(product.stock);
              return (
                <button
                  key={product.id}
                  onClick={() => actions.addItem(product)}
                  disabled={product.stock === 0}
                  className={cn(
                    "cursor-pointer flex flex-col p-3 rounded-lg border bg-card hover:bg-muted transition-all text-left",
                    product.stock === 0 && "opacity-50 cursor-not-allowed",
                  )}
                >
                  <div className="text-3xl mb-2">{product.image}</div>
                  <div className="flex-1 min-w-0">
                    <h4 className="font-medium text-sm line-clamp-2 leading-snug">
                      {product.name}
                    </h4>
                    <p className="text-xs text-muted-foreground mt-1">
                      {product.sku}
                    </p>
                    {/* Stock Indicator */}
                    <p
                      className={cn(
                        "text-[10px] mt-1 font-medium",
                        stockStatus.color,
                      )}
                    >
                      {stockStatus.label}
                    </p>
                  </div>
                  <div className="mt-2 flex items-center justify-between">
                    <span className="font-bold text-base text-foreground">
                      Rs. {product.price}
                    </span>
                    <div
                      className={cn(
                        "w-6 h-6 rounded-full flex items-center justify-center",
                        product.stock > 0
                          ? "bg-primary text-primary-foreground"
                          : "bg-muted text-muted-foreground",
                      )}
                    >
                      <Plus className="w-4 h-4" />
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Right Side - Cart */}
      <div className="w-72 sm:w-80 md:w-80 lg:w-84 xl:w-96 flex flex-col bg-card border-l h-full overflow-hidden shrink-0">
        {/* Customer Select */}
        <div className="p-2 border-b shrink-0">
          <Label className="text-xs text-muted-foreground mb-1 block">
            Customer
          </Label>
          <div className="flex gap-2">
            <SearchableSelect
              value={activeOrder.customer?.id || null}
              onValueChange={(val) => actions.setCustomer(val)}
              placeholder="Select customer"
              fetchFn={useInfiniteCustomers}
              labelKey="name"
              valueKey="id"
              className="flex-1"
            />
            <Button
              variant="outline"
              size="icon"
              className="h-9 w-9 rounded-full shrink-0"
              onClick={() => setAddCustomerOpen(true)}
            >
              <Plus className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Cart Items */}
        <div className="flex-1 overflow-y-auto p-2 space-y-2">
          {activeOrder.items.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-muted-foreground">
              <ShoppingCart className="w-8 h-8 mb-1 opacity-20" />
              <p className="text-xs">Cart empty</p>
            </div>
          ) : (
            activeOrder.items.map((item) => (
              <CartItem
                key={item.id}
                item={item}
                actions={actions}
                formatCurrency={formatCurrency}
              />
            ))
          )}
        </div>

        {/* Cart Summary */}
        <div className="p-2 border-t bg-muted/30 space-y-1 shrink-0 mx-2">
          {/* Payment Mode - on top */}
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs text-muted-foreground">Payment</span>
            <Select value={paymentMode} onValueChange={setPaymentMode}>
              <SelectTrigger className="h-8 w-28 text-xs py-0">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {paymentModes.map((mode) => (
                  <SelectItem key={mode.id} value={mode.id} className="text-xs">
                    {mode.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Subtotal */}
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Subtotal</span>
            <span className="font-medium">
              {formatCurrency(totals.subTotal)}
            </span>
          </div>

          {/* Discount from products */}
          {totals.discount > 0 && (
            <div className="flex justify-between text-sm text-destructive">
              <span className="text-muted-foreground">Discount</span>
              <span>-{formatCurrency(totals.discount)}</span>
            </div>
          )}

          {/* Tax */}
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Tax (18%)</span>
            <span className="font-medium">
              {formatCurrency(totals.taxTotal)}
            </span>
          </div>

          <Separator className="my-1" />

          {/* Grand Total */}
          <div className="flex justify-between font-bold">
            <span>Total</span>
            <span className="text-base text-foreground">
              {formatCurrency(totals.grandTotal)}
            </span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="p-2 border-t flex gap-2 shrink-0">
          <Button
            variant="outline"
            className="flex-1"
            onClick={handleClearCart}
          >
            Cancel
          </Button>
          <Button className="flex-1" disabled={activeOrder.items.length === 0}>
            Complete
          </Button>
        </div>
      </div>

      {/* Add Customer Dialog */}
      <AddCustomerDialog
        open={addCustomerOpen}
        onOpenChange={setAddCustomerOpen}
        onAdd={handleAddCustomer}
      />
    </div>
  );
}

function CartItem({ item, actions, formatCurrency }) {
  const [localQty, setLocalQty] = useState(item.quantity.toString());

  const handleChange = (e) => {
    const val = e.target.value;
    setLocalQty(val);
  };

  const handleBlur = () => {
    const num = parseInt(localQty, 10);
    if (!localQty || isNaN(num) || num < 1) {
      setLocalQty("1");
      actions.updateItem(item.id, "quantity", "1");
    } else {
      setLocalQty(num.toString());
      actions.updateItem(item.id, "quantity", num.toString());
    }
  };

  return (
    <div className="flex gap-2 p-2 rounded-md bg-muted/30 border border-border/50">
      {/* Left col: Square Image */}
      <div className="w-14 h-14 rounded-md bg-background flex items-center justify-center text-2xl shrink-0">
        {item.image}
      </div>

      {/* Middle col: Name + Price + UOM */}
      <div className="flex-1 min-w-0 flex flex-col justify-center">
        {/* Row 1: Product name */}
        <h4 className="font-medium text-sm truncate leading-tight">
          {item.name}
        </h4>
        {/* Row 2: Price */}
        <span className="text-sm font-semibold text-foreground mt-0.5">
          {formatCurrency(item.price * item.quantity)}
        </span>
        {/* Row 3: UOM */}
        <div className="mt-1">
          <Select
            value={item.uom || "pc"}
            onValueChange={(val) => actions.updateItem(item.id, "uom", val)}
          >
            <SelectTrigger className="h-7 cursor-pointer text-xs font-medium w-18 bg-background/50 border-border/50">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {uomOptions.map((uom) => (
                <SelectItem key={uom.id} value={uom.id} className="text-xs">
                  {uom.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Right col: Delete + Qty */}
      <div className="flex flex-col items-end justify-between shrink-0">
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 rounded-full text-destructive hover:bg-destructive/10 hover:text-destructive"
          onClick={() => actions.removeItem(item.id)}
        >
          <Trash2 className="w-4 h-4" />
        </Button>
        <div className="flex items-center gap-1">
          <Button
            variant="outline"
            size="icon"
            className="h-8 w-8 rounded-full"
            onClick={() => {
              actions.decrementItem(item.id);
              setLocalQty((parseInt(localQty, 10) - 1).toString());
            }}
          >
            <Minus className="w-3 h-3" />
          </Button>
          <Input
            type="text"
            inputMode="numeric"
            pattern="[0-9]*"
            value={localQty}
            onChange={handleChange}
            onBlur={handleBlur}
            className="w-16 h-8 text-center text-sm font-medium rounded-md"
          />
          <Button
            variant="outline"
            size="icon"
            className="h-8 w-8 rounded-full"
            onClick={() => {
              actions.incrementItem(item.id);
              setLocalQty((parseInt(localQty, 10) + 1).toString());
            }}
          >
            <Plus className="w-3 h-3" />
          </Button>
        </div>
      </div>
    </div>
  );
}

export default CardView;
