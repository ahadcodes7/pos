/**
 * Dummy settings for the preview settings page. Nothing here is stored: values live in memory
 * until the app closes. Number fields are kept as the typed text (form state) and checked by
 * validateSettings; they become real numbers when settings move to the database.
 */
export interface AppSettings {
  business: {
    name: string;
    legalName: string;
    ntn: string;
    strn: string;
    phone: string;
    email: string;
    address: string;
    city: string;
  };
  invoices: {
    prefix: string;
    nextNumber: string;
    defaultPayment: string;
    paperSize: PaperSize;
    showTaxBreakdown: boolean;
    printAfterSale: boolean;
    askCustomerOnCredit: boolean;
    footerNote: string;
  };
  tax: {
    label: string;
    defaultRate: string;
    pricesIncludeTax: boolean;
    rounding: Rounding;
  };
  inventory: {
    lowStockThreshold: string;
    defaultUnit: string;
    trackByDefault: boolean;
    allowNegativeStock: boolean;
  };
  hardware: {
    printerId: string;
    scannerEnabled: boolean;
    cashDrawer: boolean;
  };
}

export type SettingsGroup = keyof AppSettings;
export type PaperSize = "80mm" | "58mm" | "a4";
export type Rounding = "none" | "rupee" | "five";

export const defaultSettings: AppSettings = {
  business: {
    name: "Naya Mart",
    legalName: "Naya Mart (Private) Limited",
    ntn: "1234567-8",
    strn: "32-77-8761-234-56",
    phone: "0300 1234567",
    email: "accounts@nayamart.pk",
    address: "Shop 12, Main Boulevard, Gulberg III",
    city: "Lahore",
  },
  invoices: {
    prefix: "INV-",
    nextNumber: "124",
    defaultPayment: "cash",
    paperSize: "80mm",
    showTaxBreakdown: true,
    printAfterSale: true,
    askCustomerOnCredit: true,
    footerNote: "Thank you for shopping with us! Goods once sold can be exchanged within 7 days with receipt.",
  },
  tax: {
    label: "GST",
    defaultRate: "18",
    pricesIncludeTax: false,
    rounding: "rupee",
  },
  inventory: {
    lowStockThreshold: "5",
    defaultUnit: "pc",
    trackByDefault: true,
    allowNegativeStock: false,
  },
  hardware: {
    printerId: "epson-tm-t20",
    scannerEnabled: true,
    cashDrawer: true,
  },
};

export const paperSizes: { id: PaperSize; name: string; hint: string }[] = [
  { id: "80mm", name: "80 mm roll", hint: "Standard thermal receipt" },
  { id: "58mm", name: "58 mm roll", hint: "Compact thermal receipt" },
  { id: "a4", name: "A4 page", hint: "Full invoice for B2B customers" },
];

export const roundingOptions: { id: Rounding; name: string }[] = [
  { id: "none", name: "No rounding" },
  { id: "rupee", name: "Nearest Rs 1" },
  { id: "five", name: "Nearest Rs 5" },
];

export const printers = [
  { id: "epson-tm-t20", name: "Epson TM-T20III (USB)", status: "Connected" },
  { id: "xprinter-58", name: "XPrinter XP-58 (Bluetooth)", status: "Not found" },
  { id: "system", name: "System default printer", status: "Available" },
] as const;

export type Role = "Owner" | "Manager" | "Cashier";

/** Sample teammates; the signed-in user is shown above these as the Owner. */
export const demoUsers: { id: string; name: string; username: string; role: Role; active: boolean; lastActive: string }[] = [
  { id: "u2", name: "Sana Malik", username: "sana.m", role: "Manager", active: true, lastActive: "2 hours ago" },
  { id: "u3", name: "Bilal Ahmed", username: "bilal.c", role: "Cashier", active: true, lastActive: "Yesterday" },
  { id: "u4", name: "Hira Khan", username: "hira.k", role: "Cashier", active: false, lastActive: "3 weeks ago" },
];

export const backupInfo = {
  location: "%APPDATA%\\NayaHisab\\data\\nayahisab.db",
  lastBackup: "Today, 9:41 AM",
  size: "4.2 MB",
};
