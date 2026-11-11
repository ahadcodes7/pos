import { useReducer, useMemo } from "react";
import type { Customer, SaleProduct } from "../sale-data";

// FLAG(money): price/discount/tax are floats and totals use float math. Must move to
// integer minor units before real invoices. Kept as-is (no behavior change in migration).
export interface CartLine {
  id: number;
  productId: string;
  name: string;
  sku: string;
  price: number;
  taxRate: number;
  // FLAG: becomes a string after the qty input is edited (CardView handleBlur), so
  // INCREMENT_ITEM then concatenates ("3" + 1 = "31"). Pre-existing; typed as-is.
  quantity: number | string;
  image: string;
  uom: string;
  discount: number;
}

export interface Order {
  id: number;
  name: string;
  items: CartLine[];
  customer: Customer | null;
}

interface CardViewState {
  orders: Order[];
  activeOrderId: number;
  searchQuery: string;
  selectedCategory: string;
}

type CartLineField = keyof CartLine;

type CardViewAction =
  | { type: "SET_ACTIVE_ORDER"; payload: number }
  | { type: "ADD_ORDER" }
  | { type: "DELETE_ORDER"; payload: number }
  | { type: "SET_CUSTOMER"; payload: { orderId: number; customerId: string | number | null } }
  | { type: "ADD_ITEM"; payload: { orderId: number; product: SaleProduct } }
  | { type: "UPDATE_ITEM"; payload: { orderId: number; itemId: number; field: CartLineField; value: CartLine[CartLineField] } }
  | { type: "REMOVE_ITEM"; payload: { orderId: number; itemId: number } }
  | { type: "CLEAR_ORDER"; payload: number }
  | { type: "INCREMENT_ITEM"; payload: { orderId: number; itemId: number } }
  | { type: "DECREMENT_ITEM"; payload: { orderId: number; itemId: number } }
  | { type: "SET_SEARCH_QUERY"; payload: string }
  | { type: "SET_CATEGORY"; payload: string };

const initialState: CardViewState = {
  orders: [{ id: 1, name: "Order 1", items: [], customer: null }],
  activeOrderId: 1,
  searchQuery: "",
  selectedCategory: "all",
};

const ACTION_TYPES = {
  SET_ACTIVE_ORDER: "SET_ACTIVE_ORDER",
  ADD_ORDER: "ADD_ORDER",
  DELETE_ORDER: "DELETE_ORDER",
  SET_CUSTOMER: "SET_CUSTOMER",
  ADD_ITEM: "ADD_ITEM",
  UPDATE_ITEM: "UPDATE_ITEM",
  REMOVE_ITEM: "REMOVE_ITEM",
  CLEAR_ORDER: "CLEAR_ORDER",
  INCREMENT_ITEM: "INCREMENT_ITEM",
  DECREMENT_ITEM: "DECREMENT_ITEM",
  SET_SEARCH_QUERY: "SET_SEARCH_QUERY",
  SET_CATEGORY: "SET_CATEGORY",
} as const;

const mockCustomers: Customer[] = [
  { id: "1", name: "Walk-in Customer", phone: "" },
  { id: "2", name: "Ahmed Khan", phone: "03001234567" },
  { id: "3", name: "Sara Ali", phone: "03019876543" },
  { id: "4", name: "Bilal Hussain", phone: "03005678901" },
  { id: "5", name: "Fatima Zahra", phone: "03001112223" },
];

// Preserves pre-existing behavior: a string quantity concatenates ("3" + 1 = "31"). See FLAG on CartLine.
const incrementQuantity = (q: number | string) => (typeof q === "string" ? q + 1 : q + 1);

function cardViewReducer(state: CardViewState, action: CardViewAction): CardViewState {
  switch (action.type) {
    case ACTION_TYPES.SET_ACTIVE_ORDER:
      return { ...state, activeOrderId: action.payload };

    case ACTION_TYPES.ADD_ORDER: {
      const newOrderId = Math.max(...state.orders.map((o) => o.id), 0) + 1;
      return {
        ...state,
        orders: [
          ...state.orders,
          {
            id: newOrderId,
            name: `Order ${newOrderId}`,
            items: [],
            customer: mockCustomers[0] ?? null,
          },
        ],
        activeOrderId: newOrderId,
      };
    }

    case ACTION_TYPES.DELETE_ORDER: {
      if (state.orders.length <= 1) return state;
      const updatedOrders = state.orders.filter((o) => o.id !== action.payload);
      return {
        ...state,
        orders: updatedOrders,
        activeOrderId:
          state.activeOrderId === action.payload
            ? updatedOrders[0]!.id
            : state.activeOrderId,
      };
    }

    case ACTION_TYPES.SET_CUSTOMER: {
      const { orderId, customerId } = action.payload;
      const customer = mockCustomers.find((c) => c.id === customerId);
      if (!customer) return state;
      return {
        ...state,
        orders: state.orders.map((order) =>
          order.id === orderId ? { ...order, customer } : order,
        ),
      };
    }

    case ACTION_TYPES.ADD_ITEM: {
      const { orderId, product } = action.payload;
      return {
        ...state,
        orders: state.orders.map((order) => {
          if (order.id !== orderId) return order;

          const existingItem = order.items.find(
            (item) => item.productId === product.id,
          );
          if (existingItem) {
            return {
              ...order,
              items: order.items.map((item) =>
                item.productId === product.id
                  ? { ...item, quantity: incrementQuantity(item.quantity) }
                  : item,
              ),
            };
          }

          return {
            ...order,
            items: [
              ...order.items,
              {
                id: Date.now() + Math.random(),
                productId: product.id,
                name: product.name,
                sku: product.sku,
                price: product.price,
                taxRate: product.taxRate,
                quantity: 1,
                image: product.image,
                uom: product.uom || "pc",
                discount: product.discount || 0,
              },
            ],
          };
        }),
      };
    }

    case ACTION_TYPES.UPDATE_ITEM: {
      const { orderId, itemId, field, value } = action.payload;
      return {
        ...state,
        orders: state.orders.map((order) => {
          if (order.id !== orderId) return order;
          return {
            ...order,
            items: order.items.map((item) =>
              item.id === itemId ? { ...item, [field]: value } : item,
            ),
          };
        }),
      };
    }

    case ACTION_TYPES.REMOVE_ITEM: {
      const { orderId, itemId } = action.payload;
      return {
        ...state,
        orders: state.orders.map((order) => {
          if (order.id !== orderId) return order;
          return {
            ...order,
            items: order.items.filter((item) => item.id !== itemId),
          };
        }),
      };
    }

    case ACTION_TYPES.CLEAR_ORDER: {
      const orderId = action.payload;
      return {
        ...state,
        orders: state.orders.map((order) =>
          order.id === orderId ? { ...order, items: [] } : order,
        ),
      };
    }

    case ACTION_TYPES.INCREMENT_ITEM: {
      const { orderId, itemId } = action.payload;
      return {
        ...state,
        orders: state.orders.map((order) => {
          if (order.id !== orderId) return order;
          return {
            ...order,
            items: order.items.map((item) =>
              item.id === itemId
                ? { ...item, quantity: incrementQuantity(item.quantity) }
                : item,
            ),
          };
        }),
      };
    }

    case ACTION_TYPES.DECREMENT_ITEM: {
      const { orderId, itemId } = action.payload;
      return {
        ...state,
        orders: state.orders.map((order) => {
          if (order.id !== orderId) return order;
          return {
            ...order,
            items: order.items.map((item) =>
              item.id === itemId
                ? { ...item, quantity: Math.max(1, Number(item.quantity) - 1) }
                : item,
            ),
          };
        }),
      };
    }

    case ACTION_TYPES.SET_SEARCH_QUERY:
      return { ...state, searchQuery: action.payload };

    case ACTION_TYPES.SET_CATEGORY:
      return { ...state, selectedCategory: action.payload };

    default:
      return state;
  }
}

const parseNumber = (val: unknown) => {
  const n = parseFloat(String(val));
  return Number.isFinite(n) ? n : 0;
};

export const calculateOrderTotals = (orderItems: CartLine[]) => {
  let subTotal = 0;
  let taxTotal = 0;
  let discountTotal = 0;

  orderItems.forEach((item) => {
    const qty = parseNumber(item.quantity);
    const price = parseNumber(item.price);
    const taxRate = parseNumber(item.taxRate || 18);
    const discount = parseNumber(item.discount || 0);
    const lineBase = qty * price;
    const lineDiscount = (lineBase * discount) / 100;
    const lineTax = ((lineBase - lineDiscount) * taxRate) / 100;
    subTotal += lineBase;
    discountTotal += lineDiscount;
    taxTotal += lineTax;
  });

  const grandTotal = subTotal - discountTotal + taxTotal;
  return { subTotal, discount: discountTotal, taxTotal, grandTotal };
};

export function useCardViewReducer() {
  const [state, dispatch] = useReducer(cardViewReducer, initialState);

  const activeOrder = useMemo(
    () =>
      // DELETE_ORDER never removes the last order, so orders[0] always exists.
      state.orders.find((o) => o.id === state.activeOrderId) || state.orders[0]!,
    [state.orders, state.activeOrderId],
  );

  const actions = {
    setActiveOrder: (orderId: number) =>
      dispatch({ type: ACTION_TYPES.SET_ACTIVE_ORDER, payload: orderId }),
    addOrder: () => dispatch({ type: ACTION_TYPES.ADD_ORDER }),
    deleteOrder: (orderId: number) =>
      dispatch({ type: ACTION_TYPES.DELETE_ORDER, payload: orderId }),
    setCustomer: (customerId: string | number | null) =>
      dispatch({
        type: ACTION_TYPES.SET_CUSTOMER,
        payload: { orderId: state.activeOrderId, customerId },
      }),
    addItem: (product: SaleProduct) =>
      dispatch({
        type: ACTION_TYPES.ADD_ITEM,
        payload: { orderId: state.activeOrderId, product },
      }),
    updateItem: <K extends CartLineField>(itemId: number, field: K, value: CartLine[K]) =>
      dispatch({
        type: ACTION_TYPES.UPDATE_ITEM,
        payload: { orderId: state.activeOrderId, itemId, field, value },
      }),
    removeItem: (itemId: number) =>
      dispatch({
        type: ACTION_TYPES.REMOVE_ITEM,
        payload: { orderId: state.activeOrderId, itemId },
      }),
    clearOrder: () =>
      dispatch({
        type: ACTION_TYPES.CLEAR_ORDER,
        payload: state.activeOrderId,
      }),
    incrementItem: (itemId: number) =>
      dispatch({
        type: ACTION_TYPES.INCREMENT_ITEM,
        payload: { orderId: state.activeOrderId, itemId },
      }),
    decrementItem: (itemId: number) =>
      dispatch({
        type: ACTION_TYPES.DECREMENT_ITEM,
        payload: { orderId: state.activeOrderId, itemId },
      }),
    setSearchQuery: (query: string) =>
      dispatch({ type: ACTION_TYPES.SET_SEARCH_QUERY, payload: query }),
    setCategory: (category: string) =>
      dispatch({ type: ACTION_TYPES.SET_CATEGORY, payload: category }),
  };

  return { state, activeOrder, actions };
}
