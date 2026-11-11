import { useReducer } from "react";
import type { SaleProduct } from "../sale-data";

// FLAG(money): price/tax are floats and totals use float math. Must move to integer minor
// units before real invoices. quantity/price/taxRate become strings when edited in the
// table inputs (pre-existing); typed as-is.
export interface TableLine {
  id: number;
  productId: string;
  name: string;
  sku: string;
  price: number | string;
  taxRate: number | string;
  quantity: number | string;
}

interface TableViewState {
  items: TableLine[];
  searchQuery: string;
}

type TableLineField = keyof TableLine;

type TableViewAction =
  | { type: "ADD_ITEM"; payload: { product: SaleProduct } }
  | { type: "UPDATE_ITEM"; payload: { itemId: number; field: TableLineField; value: TableLine[TableLineField] } }
  | { type: "REMOVE_ITEM"; payload: number }
  | { type: "CLEAR_ALL" }
  | { type: "SET_SEARCH_QUERY"; payload: string };

// Preserves pre-existing behavior: a string quantity concatenates ("3" + 1 = "31").
const incrementQuantity = (q: number | string) => (typeof q === "string" ? q + 1 : q + 1);

const initialState: TableViewState = {
  items: [],
  searchQuery: "",
};

const ACTION_TYPES = {
  ADD_ITEM: "ADD_ITEM",
  UPDATE_ITEM: "UPDATE_ITEM",
  REMOVE_ITEM: "REMOVE_ITEM",
  CLEAR_ALL: "CLEAR_ALL",
  SET_SEARCH_QUERY: "SET_SEARCH_QUERY",
} as const;

function tableViewReducer(state: TableViewState, action: TableViewAction): TableViewState {
  switch (action.type) {
    case ACTION_TYPES.ADD_ITEM: {
      const { product } = action.payload;
      const existingItem = state.items.find(item => item.productId === product.id);
      
      if (existingItem) {
        return {
          ...state,
          items: state.items.map(item =>
            item.productId === product.id
              ? { ...item, quantity: incrementQuantity(item.quantity) }
              : item
          ),
        };
      }
      
      return {
        ...state,
        items: [...state.items, {
          id: Date.now(),
          productId: product.id,
          name: product.name,
          sku: product.sku,
          price: product.price,
          taxRate: product.taxRate,
          quantity: 1,
        }],
      };
    }

    case ACTION_TYPES.UPDATE_ITEM: {
      const { itemId, field, value } = action.payload;
      return {
        ...state,
        items: state.items.map(item =>
          item.id === itemId ? { ...item, [field]: value } : item
        ),
      };
    }

    case ACTION_TYPES.REMOVE_ITEM: {
      return {
        ...state,
        items: state.items.filter(item => item.id !== action.payload),
      };
    }

    case ACTION_TYPES.CLEAR_ALL:
      return { ...state, items: [] };

    case ACTION_TYPES.SET_SEARCH_QUERY:
      return { ...state, searchQuery: action.payload };

    default:
      return state;
  }
}

const parseNumber = (val: unknown) => {
  const n = parseFloat(String(val));
  return Number.isFinite(n) ? n : 0;
};

export const calculateTableTotals = (items: TableLine[]) => {
  let total = 0;
  
  items.forEach(item => {
    const qty = parseNumber(item.quantity);
    const price = parseNumber(item.price);
    const taxRate = parseNumber(item.taxRate || 18);
    const lineBase = qty * price;
    const lineTax = (lineBase * taxRate) / 100;
    total += lineBase + lineTax;
  });
  
  return {
    itemCount: items.length,
    total,
  };
};

export function useTableViewReducer() {
  const [state, dispatch] = useReducer(tableViewReducer, initialState);

  const actions = {
    addItem: (product: SaleProduct) => dispatch({ type: ACTION_TYPES.ADD_ITEM, payload: { product } }),
    updateItem: <K extends TableLineField>(itemId: number, field: K, value: TableLine[K]) => dispatch({ 
      type: ACTION_TYPES.UPDATE_ITEM, 
      payload: { itemId, field, value } 
    }),
    removeItem: (itemId: number) => dispatch({ type: ACTION_TYPES.REMOVE_ITEM, payload: itemId }),
    clearAll: () => dispatch({ type: ACTION_TYPES.CLEAR_ALL }),
    setSearchQuery: (query: string) => dispatch({ type: ACTION_TYPES.SET_SEARCH_QUERY, payload: query }),
  };

  return { state, actions };
}
