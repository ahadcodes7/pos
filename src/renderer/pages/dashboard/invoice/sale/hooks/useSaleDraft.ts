import { useMemo, useReducer } from "react";
import type { Money } from "@/shared/contracts/common";
import { mockCustomers, type SaleProduct } from "../sale-data";
import { invoiceTotals } from "../sale-math";

/**
 * One invoice draft shared by the Card, Staged and Quick entry views, so switching views never
 * loses work. Money is integer paisa; quantity is always a positive number.
 */
export interface InvoiceLine {
  id: string;
  /** null marks a blank Quick entry line that has no product yet. */
  productId: string | null;
  name: string;
  sku: string;
  image: string;
  uom: string;
  quantity: number;
  unitPrice: Money;
  discountPct: number;
  taxPct: number;
}

export type LinePatch = Partial<Pick<InvoiceLine, "quantity" | "uom" | "unitPrice" | "discountPct" | "taxPct">>;

/** What the Staged view hands over when it adds a line: a product plus the edited details. */
export type StagedLine = { product: SaleProduct } & Required<LinePatch>;

export interface Order {
  id: number;
  name: string;
  customerId: string | null;
  paymentMode: string;
  lines: InvoiceLine[];
}

export interface SaleDraftState {
  orders: Order[];
  activeOrderId: number;
}

export type SaleDraftAction =
  | { type: "ADD_ORDER" }
  | { type: "DELETE_ORDER"; orderId: number }
  | { type: "SET_ACTIVE_ORDER"; orderId: number }
  | { type: "SET_CUSTOMER"; customerId: string | null }
  | { type: "SET_PAYMENT_MODE"; paymentMode: string }
  | { type: "CLEAR_ORDER" }
  | { type: "ADD_PRODUCT"; product: SaleProduct; lineId: string }
  | { type: "ADD_LINE"; line: StagedLine; lineId: string }
  | { type: "ADD_BLANK_LINE"; lineId: string }
  | { type: "SET_LINE_PRODUCT"; lineId: string; product: SaleProduct }
  | { type: "UPDATE_LINE"; lineId: string; patch: LinePatch }
  | { type: "REMOVE_LINE"; lineId: string };

const WALK_IN_ID = mockCustomers[0]?.id ?? null;

const newOrder = (id: number): Order => ({
  id,
  name: `Order ${id}`,
  customerId: WALK_IN_ID,
  paymentMode: "cash",
  lines: [],
});

export const initialSaleDraft: SaleDraftState = { orders: [newOrder(1)], activeOrderId: 1 };

/** A line filled from a product's defaults. */
export const lineFromProduct = (id: string, product: SaleProduct): InvoiceLine => ({
  id,
  productId: product.id,
  name: product.name,
  sku: product.sku,
  image: product.image,
  uom: product.uom || "pc",
  quantity: 1,
  unitPrice: product.price,
  discountPct: product.discount ?? 0,
  taxPct: product.taxRate,
});

const blankLine = (id: string): InvoiceLine => ({
  id,
  productId: null,
  name: "",
  sku: "",
  image: "",
  uom: "pc",
  quantity: 1,
  unitPrice: 0,
  discountPct: 0,
  taxPct: 0,
});

/** Applies `update` to the active order's lines. */
const withLines = (state: SaleDraftState, update: (lines: InvoiceLine[]) => InvoiceLine[]): SaleDraftState => ({
  ...state,
  orders: state.orders.map((o) => (o.id === state.activeOrderId ? { ...o, lines: update(o.lines) } : o)),
});

const withOrder = (state: SaleDraftState, patch: Partial<Order>): SaleDraftState => ({
  ...state,
  orders: state.orders.map((o) => (o.id === state.activeOrderId ? { ...o, ...patch } : o)),
});

export function saleDraftReducer(state: SaleDraftState, action: SaleDraftAction): SaleDraftState {
  switch (action.type) {
    case "ADD_ORDER": {
      const id = Math.max(0, ...state.orders.map((o) => o.id)) + 1;
      return { orders: [...state.orders, newOrder(id)], activeOrderId: id };
    }
    case "DELETE_ORDER": {
      if (state.orders.length <= 1) return state;
      const orders = state.orders.filter((o) => o.id !== action.orderId);
      const activeOrderId = state.activeOrderId === action.orderId ? orders[0]!.id : state.activeOrderId;
      return { orders, activeOrderId };
    }
    case "SET_ACTIVE_ORDER":
      return state.orders.some((o) => o.id === action.orderId) ? { ...state, activeOrderId: action.orderId } : state;
    case "SET_CUSTOMER":
      // Only known customers can be selected (a customer added in the dialog is not stored yet).
      if (action.customerId !== null && !mockCustomers.some((c) => c.id === action.customerId)) return state;
      return withOrder(state, { customerId: action.customerId });
    case "SET_PAYMENT_MODE":
      return withOrder(state, { paymentMode: action.paymentMode });
    case "CLEAR_ORDER":
      return withOrder(state, { lines: [], paymentMode: "cash" });
    case "ADD_PRODUCT":
      return withLines(state, (lines) => {
        const uom = action.product.uom || "pc";
        const existing = lines.find((l) => l.productId === action.product.id && l.uom === uom);
        if (existing) return lines.map((l) => (l === existing ? { ...l, quantity: l.quantity + 1 } : l));
        return [...lines, lineFromProduct(action.lineId, action.product)];
      });
    case "ADD_LINE": {
      const { product, ...details } = action.line;
      return withLines(state, (lines) => [...lines, { ...lineFromProduct(action.lineId, product), ...details }]);
    }
    case "ADD_BLANK_LINE":
      return withLines(state, (lines) => [...lines, blankLine(action.lineId)]);
    case "SET_LINE_PRODUCT":
      return withLines(state, (lines) =>
        lines.map((l) => (l.id === action.lineId ? { ...lineFromProduct(l.id, action.product), quantity: l.quantity } : l)),
      );
    case "UPDATE_LINE":
      return withLines(state, (lines) => lines.map((l) => (l.id === action.lineId ? { ...l, ...action.patch } : l)));
    case "REMOVE_LINE":
      return withLines(state, (lines) => lines.filter((l) => l.id !== action.lineId));
    default:
      return state;
  }
}

const newLineId = () => crypto.randomUUID();

export function useSaleDraft() {
  const [state, dispatch] = useReducer(saleDraftReducer, initialSaleDraft);

  // DELETE_ORDER never removes the last order, so orders[0] always exists.
  const activeOrder = state.orders.find((o) => o.id === state.activeOrderId) ?? state.orders[0]!;
  const totals = useMemo(() => invoiceTotals(activeOrder.lines), [activeOrder.lines]);

  const actions = useMemo(
    () => ({
      addOrder: () => dispatch({ type: "ADD_ORDER" }),
      deleteOrder: (orderId: number) => dispatch({ type: "DELETE_ORDER", orderId }),
      setActiveOrder: (orderId: number) => dispatch({ type: "SET_ACTIVE_ORDER", orderId }),
      setCustomer: (customerId: string | null) => dispatch({ type: "SET_CUSTOMER", customerId }),
      setPaymentMode: (paymentMode: string) => dispatch({ type: "SET_PAYMENT_MODE", paymentMode }),
      clearOrder: () => dispatch({ type: "CLEAR_ORDER" }),
      addProduct: (product: SaleProduct) => dispatch({ type: "ADD_PRODUCT", product, lineId: newLineId() }),
      addLine: (line: StagedLine) => dispatch({ type: "ADD_LINE", line, lineId: newLineId() }),
      /** Adds a blank line and returns its id so the caller can focus it. */
      addBlankLine: () => {
        const lineId = newLineId();
        dispatch({ type: "ADD_BLANK_LINE", lineId });
        return lineId;
      },
      setLineProduct: (lineId: string, product: SaleProduct) => dispatch({ type: "SET_LINE_PRODUCT", lineId, product }),
      updateLine: (lineId: string, patch: LinePatch) => dispatch({ type: "UPDATE_LINE", lineId, patch }),
      removeLine: (lineId: string) => dispatch({ type: "REMOVE_LINE", lineId }),
    }),
    [],
  );

  return { state, activeOrder, totals, actions };
}

export type SaleDraft = ReturnType<typeof useSaleDraft>;
