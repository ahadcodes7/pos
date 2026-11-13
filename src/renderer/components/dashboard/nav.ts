import type { LucideIcon } from "lucide-react";
import {
  Boxes,
  Building2,
  DatabaseBackup,
  FileText,
  Home,
  Package,
  Palette,
  Percent,
  PlusCircle,
  Printer,
  Receipt,
  ReceiptText,
  Users,
} from "lucide-react";

export interface NavLeaf {
  id: string;
  label: string;
  icon: LucideIcon;
  path: string;
}

export interface NavItem {
  id: string;
  label: string;
  icon: LucideIcon;
  path?: string;
  subItems?: NavLeaf[];
}

export interface NavGroup {
  label: string;
  items: NavItem[];
}

/** The dashboard menu. The sidebar renders it and the navbar derives page titles from it. */
export const navGroups: NavGroup[] = [
  {
    label: "Overview",
    items: [{ id: "home", label: "Home", icon: Home, path: "/dashboard" }],
  },
  {
    label: "Operations",
    items: [
      {
        id: "inventory",
        label: "Inventory",
        icon: Package,
        subItems: [{ id: "add-product", label: "Add Product", icon: PlusCircle, path: "/dashboard/product/add" }],
      },
      {
        id: "invoice",
        label: "Invoice",
        icon: FileText,
        subItems: [{ id: "sale-invoice", label: "Sale Invoice", icon: Receipt, path: "/dashboard/invoice/sale/create" }],
      },
    ],
  },
];

export const SETTINGS_PATH = "/dashboard/settings";

export interface SettingsSection {
  id: string;
  label: string;
  icon: LucideIcon;
  description: string;
  group: "Business" | "App" | "Admin";
}

/** Settings live in the user menu, not the main menu. These are the settings page's sections. */
export const settingsSections: SettingsSection[] = [
  { id: "business", label: "Business profile", icon: Building2, description: "Name, tax numbers and contact details printed on receipts.", group: "Business" },
  { id: "invoices", label: "Invoices & receipts", icon: ReceiptText, description: "Numbering, paper size and what each receipt shows.", group: "Business" },
  { id: "tax", label: "Tax & currency", icon: Percent, description: "Default tax, rounding and how prices are entered.", group: "Business" },
  { id: "inventory", label: "Inventory", icon: Boxes, description: "Stock tracking defaults and low-stock alerts.", group: "Business" },
  { id: "appearance", label: "Appearance", icon: Palette, description: "How NayaHisab looks on this device.", group: "App" },
  { id: "hardware", label: "Hardware & printing", icon: Printer, description: "Receipt printer, scanner and cash drawer.", group: "App" },
  { id: "users", label: "Users & roles", icon: Users, description: "Who can sign in and what they can do.", group: "Admin" },
  { id: "data", label: "Data & backup", icon: DatabaseBackup, description: "Where your data lives and how it is backed up.", group: "Admin" },
];

export interface PageTitle {
  /** The parent menu label for nested pages, e.g. "Inventory". */
  section?: string;
  title: string;
}

/** Title (and parent section, for child pages) of the menu entry matching `pathname`. */
export function pageTitleFor(pathname: string): PageTitle {
  if (pathname === SETTINGS_PATH || pathname.startsWith(`${SETTINGS_PATH}/`)) {
    const id = pathname.slice(SETTINGS_PATH.length + 1);
    const section = settingsSections.find((s) => s.id === id);
    return section ? { section: "Settings", title: section.label } : { title: "Settings" };
  }
  for (const group of navGroups) {
    for (const item of group.items) {
      if (item.path === pathname) return { title: item.label };
      const child = item.subItems?.find((sub) => sub.path === pathname);
      if (child) return { section: item.label, title: child.label };
    }
  }
  return { title: "Dashboard" };
}

/** Up to two initials from a username like "ahad710" or "Sara Khan". */
export function initialsOf(name: string): string {
  const words = name.trim().split(/[\s._-]+/).filter(Boolean);
  if (words.length === 0) return "U";
  const [first = "", second = ""] = words;
  const letters = second ? first.charAt(0) + second.charAt(0) : first.slice(0, 2);
  return letters.toUpperCase();
}
