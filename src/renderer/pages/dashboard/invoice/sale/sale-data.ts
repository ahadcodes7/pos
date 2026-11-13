import type { OptionValue } from "@/renderer/components/common/SearchableSelect";
import type { Money } from "@/shared/contracts/common";

export interface SaleProduct {
  id: string;
  name: string;
  sku: string;
  /** Unit price in paisa. */
  price: Money;
  /** Percent, e.g. 18. */
  taxRate: number;
  category: string;
  image: string;
  stock: number;
  uom: string;
  /** Default line discount in percent. */
  discount?: number;
}

// A type alias (not interface) so it is assignable to SearchableSelect's option records.
export type Customer = {
  id: string;
  name: string;
  phone: string;
};

export type ViewMode = "card" | "staged" | "grid";

export const viewModes: readonly ViewMode[] = ["card", "staged", "grid"];

export const mockCategories = [
  { id: "all", name: "All", icon: "📦" },
  { id: "food", name: "Food", icon: "🍔" },
  { id: "drinks", name: "Drinks", icon: "🥤" },
  { id: "snacks", name: "Snacks", icon: "🍿" },
  { id: "dairy", name: "Dairy", icon: "🥛" },
  { id: "frozen", name: "Frozen", icon: "🧊" },
];

export const uomOptions = [
  { id: "pc", name: "pc" },
  { id: "kg", name: "kg" },
  { id: "g", name: "g" },
  { id: "L", name: "L" },
  { id: "ml", name: "ml" },
  { id: "dozen", name: "dozen" },
];

export const paymentModes = [
  { id: "cash", name: "Cash" },
  { id: "credit", name: "Credit" },
  { id: "card", name: "Card" },
  { id: "bank_transfer", name: "Bank Transfer" },
  { id: "wallet", name: "Digital Wallet" },
];

export const mockProducts: SaleProduct[] = [
  {
    id: "1",
    name: "Chicken Biryani",
    sku: "FOOD-001",
    price: 35000,
    taxRate: 18,
    category: "food",
    image: "🍚",
    stock: 45,
    uom: "pc",
    discount: 0,
  },
  {
    id: "2",
    name: "Beef Pulao",
    sku: "FOOD-002",
    price: 40000,
    taxRate: 18,
    category: "food",
    image: "🍲",
    stock: 28,
    uom: "pc",
    discount: 0,
  },
  {
    id: "3",
    name: "Chicken Karahi",
    sku: "FOOD-003",
    price: 120000,
    taxRate: 18,
    category: "food",
    image: "🍗",
    stock: 12,
    uom: "pc",
    discount: 10,
  },
  {
    id: "4",
    name: "Seekh Kabab (4 pcs)",
    sku: "FOOD-004",
    price: 45000,
    taxRate: 18,
    category: "food",
    image: "🥩",
    stock: 5,
    uom: "pc",
    discount: 5,
  },
  {
    id: "5",
    name: "Chicken Tikka",
    sku: "FOOD-005",
    price: 55000,
    taxRate: 18,
    category: "food",
    image: "🍖",
    stock: 0,
    uom: "pc",
    discount: 0,
  },
  {
    id: "6",
    name: "Fresh Lime Soda",
    sku: "DRINK-001",
    price: 8000,
    taxRate: 18,
    category: "drinks",
    image: "🍋",
    stock: 120,
    uom: "pc",
    discount: 0,
  },
  {
    id: "7",
    name: "Cold Coffee",
    sku: "DRINK-002",
    price: 15000,
    taxRate: 18,
    category: "drinks",
    image: "☕",
    stock: 35,
    uom: "pc",
    discount: 15,
  },
  {
    id: "8",
    name: "Mint Margarita",
    sku: "DRINK-003",
    price: 12000,
    taxRate: 18,
    category: "drinks",
    image: "🍃",
    stock: 8,
    uom: "pc",
    discount: 0,
  },
  {
    id: "9",
    name: "Lassi (Sweet)",
    sku: "DRINK-004",
    price: 10000,
    taxRate: 18,
    category: "drinks",
    image: "🥛",
    stock: 55,
    uom: "pc",
    discount: 0,
  },
  {
    id: "10",
    name: "Soft Drink (500ml)",
    sku: "DRINK-005",
    price: 6000,
    taxRate: 18,
    category: "drinks",
    image: "🥤",
    stock: 200,
    uom: "pc",
    discount: 0,
  },
  {
    id: "11",
    name: "Samosa (2 pcs)",
    sku: "SNACK-001",
    price: 5000,
    taxRate: 18,
    category: "snacks",
    image: "🥟",
    stock: 3,
    uom: "pc",
    discount: 0,
  },
  {
    id: "12",
    name: "Pakora (200g)",
    sku: "SNACK-002",
    price: 8000,
    taxRate: 18,
    category: "snacks",
    image: "🍤",
    stock: 15,
    uom: "pc",
    discount: 0,
  },
  {
    id: "13",
    name: "French Fries (L)",
    sku: "SNACK-003",
    price: 25000,
    taxRate: 18,
    category: "snacks",
    image: "🍟",
    stock: 22,
    uom: "pc",
    discount: 20,
  },
  {
    id: "14",
    name: "Chicken Wings (6 pcs)",
    sku: "SNACK-004",
    price: 35000,
    taxRate: 18,
    category: "snacks",
    image: "🍗",
    stock: 0,
    uom: "pc",
    discount: 0,
  },
  {
    id: "15",
    name: "Fresh Milk (1L)",
    sku: "DAIRY-001",
    price: 12000,
    taxRate: 18,
    category: "dairy",
    image: "🥛",
    stock: 80,
    uom: "L",
    discount: 0,
  },
  {
    id: "16",
    name: "Yogurt (500g)",
    sku: "DAIRY-002",
    price: 8000,
    taxRate: 18,
    category: "dairy",
    image: "🥛",
    stock: 40,
    uom: "pc",
    discount: 0,
  },
  {
    id: "17",
    name: "Ice Cream (500ml)",
    sku: "FROZEN-001",
    price: 25000,
    taxRate: 18,
    category: "frozen",
    image: "🍨",
    stock: 18,
    uom: "pc",
    discount: 0,
  },
  {
    id: "18",
    name: "Shake (Any flavor)",
    sku: "FROZEN-002",
    price: 18000,
    taxRate: 18,
    category: "frozen",
    image: "🥤",
    stock: 6,
    uom: "pc",
  },
];

export const mockCustomers: Customer[] = [
  { id: "1", name: "Walk-in Customer", phone: "" },
  { id: "2", name: "Ahmed Khan", phone: "03001234567" },
  { id: "3", name: "Sara Ali", phone: "03019876543" },
  { id: "4", name: "Bilal Hussain", phone: "03005678901" },
  { id: "5", name: "Fatima Zahra", phone: "03001112223" },
];

export const useInfiniteCustomers = (params?: Record<string, OptionValue>) => {
  const search = String(params?.search ?? "");
  const page = Number(params?.page ?? 1);
  const limit = Number(params?.limit ?? 20);

  const allCustomers: Customer[] = [
    ...mockCustomers,
    { id: "6", name: "Mohammad Ali", phone: "03001234568" },
    { id: "7", name: "Aisha Bibi", phone: "03001234569" },
    { id: "8", name: "Hassan Raza", phone: "03001234570" },
    { id: "9", name: "Imran Khan", phone: "03001234571" },
    { id: "10", name: "Nida Khan", phone: "03001234572" },
    { id: "11", name: "Saad Ahmed", phone: "03001234573" },
    { id: "12", name: "Mariam Sultana", phone: "03001234574" },
    { id: "13", name: "Omer Farooq", phone: "03001234575" },
    { id: "14", name: "Zainab Malik", phone: "03001234576" },
    { id: "15", name: "Ali Raza", phone: "03001234577" },
    { id: "16", name: "Sadia Noor", phone: "03001234578" },
    { id: "17", name: "Usman Ghani", phone: "03001234579" },
    { id: "18", name: "Kamran Akhtar", phone: "03001234580" },
    { id: "19", name: "Bushra Naz", phone: "03001234581" },
    { id: "20", name: "Adil Sheikh", phone: "03001234582" },
    { id: "21", name: "Sofia Khan", phone: "03001234583" },
    { id: "22", name: "Rashid Mehmood", phone: "03001234584" },
    { id: "23", name: "Maria Gul", phone: "03001234585" },
    { id: "24", name: "Junaid Akram", phone: "03001234586" },
    { id: "25", name: "Hira Shahid", phone: "03001234587" },
    { id: "26", name: "Waqas Ahmad", phone: "03001234588" },
    { id: "27", name: "Sana Ullah", phone: "03001234589" },
    { id: "28", name: "Aqsa Parveen", phone: "03001234590" },
    { id: "29", name: "Fahad Khan", phone: "03001234591" },
    { id: "30", name: "Naila Bano", phone: "03001234592" },
  ];

  const filtered = search
    ? allCustomers.filter((c) =>
        c.name.toLowerCase().includes(search.toLowerCase()),
      )
    : allCustomers;

  const start = (page - 1) * limit;
  const end = start + limit;
  const items = filtered.slice(start, end);
  const hasMore = end < filtered.length;

  return {
    data: {
      pages: [{ data: items, total: filtered.length }],
    },
    fetchNextPage: async () => {},
    hasNextPage: hasMore,
    isFetchingNextPage: false,
    isLoading: false,
    refetch: () => {},
  };
};

export const filterProducts = (products: SaleProduct[], searchQuery: string, selectedCategory = "all") => {
  return products.filter((product) => {
    const matchesSearch =
      product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product.sku.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory =
      selectedCategory === "all" || product.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });
};

export type StockStatus = {
  label: string;
  variant: "success" | "warning" | "danger";
};

export const getStockStatus = (stock: number): StockStatus => {
  if (stock === 0)
    return {
      label: "Out of Stock",
      variant: "danger",
    };
  if (stock <= 5)
    return {
      label: `Low Stock (${stock})`,
      variant: "warning",
    };
  return {
    label: `In Stock (${stock})`,
    variant: "success",
  };
};
