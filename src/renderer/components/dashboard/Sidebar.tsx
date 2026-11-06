import { useState, useEffect } from "react";
import type { LucideIcon } from "lucide-react";
import { useLocation, useNavigate } from "react-router-dom";
import {
  Package,
  FileText,
  ChevronDown,
  ChevronLeft,
  PlusCircle,
  Receipt,
  Home,
  Menu,
  Settings as SettingsIcon,
} from "lucide-react";
import { cn } from "@/renderer/lib/utils";

interface MenuSubItem {
  id: string;
  label: string;
  icon: LucideIcon;
  path: string;
}

interface MenuItem {
  id: string;
  label: string;
  icon: LucideIcon;
  path?: string;
  subItems?: MenuSubItem[];
}

const menuItems: MenuItem[] = [
  {
    id: "home",
    label: "Home",
    icon: Home,
    path: "/dashboard",
  },
  {
    id: "inventory",
    label: "Inventory",
    icon: Package,
    subItems: [
      {
        id: "add-product",
        label: "Add Product",
        icon: PlusCircle,
        path: "/dashboard/product/add",
      },
    ],
  },
  {
    id: "invoice",
    label: "Invoice",
    icon: FileText,
    subItems: [
      {
        id: "sale-invoice",
        label: "Sale Invoice",
        icon: Receipt,
        path: "/dashboard/invoice/sale/create",
      },
    ],
  },
  {
    id: "settings",
    label: "Settings",
    icon: SettingsIcon,
    path: "/dashboard/settings",
  },
];

const Sidebar = ({ className }: { className?: string }) => {
  const [expandedItems, setExpandedItems] = useState<string[]>([]);
  const [collapsed, setCollapsed] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  const isActive = (path: string) => location.pathname === path;

  const hasActiveChild = (item: MenuItem) => {
    if (!item.subItems) return false;
    return item.subItems.some((subItem) => location.pathname === subItem.path);
  };

  useEffect(() => {
    menuItems.forEach((item) => {
      if (
        item.subItems &&
        hasActiveChild(item) &&
        !expandedItems.includes(item.id)
      ) {
        setExpandedItems((prev) => [...prev, item.id]);
      }
    });
  }, [location.pathname]);

  const toggleExpand = (itemId: string) => {
    setExpandedItems((prev) =>
      prev.includes(itemId)
        ? prev.filter((id) => id !== itemId)
        : [...prev, itemId],
    );
  };

  const isExpanded = (itemId: string) => expandedItems.includes(itemId);

  const handleItemClick = (item: MenuItem) => {
    if (item.subItems) {
      if (collapsed) {
        setCollapsed(false);
        setExpandedItems((prev) =>
          prev.includes(item.id) ? prev : [...prev, item.id],
        );
        return;
      }
      toggleExpand(item.id);
      return;
    }

    if (item.path) {
      navigate(item.path);
    }
  };

  return (
    <aside
      className={cn(
        "bg-sidebar text-sidebar-foreground border-r border-sidebar-border flex flex-col overflow-y-auto transition-all duration-200",
        collapsed ? "w-16" : "w-64",
        className,
      )}
    >
      <div className="h-16 flex items-center justify-between px-4 border-b border-sidebar-border">
      {!collapsed && (
        <div className="flex items-center gap-3 overflow-hidden">
          <div className="w-10 h-8 rounded-lg bg-primary flex items-center justify-center shrink-0">
            <span className="text-primary-foreground font-bold text-sm">
              POS
            </span>
          </div>
         
            <span className="font-semibold text-lg whitespace-nowrap">
              Dashboard
            </span>
        </div>
          )}
        <button
          type="button"
          onClick={() => setCollapsed((prev) => !prev)}
          className="cursor-pointer inline-flex h-7 w-7 items-center justify-center rounded-md border border-sidebar-border text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground transition-colors"
          aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          {collapsed ? (
            <div>
              <Menu className="h-5 w-5 justify-center" />
            </div>
          ) : (
            <ChevronLeft className="h-4 w-4" />
          )}
        </button>
      </div>

      <nav className="flex-1 py-4 px-2 overflow-y-auto">
        <ul className="space-y-1">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const hasSubItems = item.subItems && item.subItems.length > 0;
            const expanded = isExpanded(item.id);
            const active = item.path
              ? isActive(item.path)
              : hasActiveChild(item);

            return (
              <li key={item.id}>
                <button
                  onClick={() => handleItemClick(item)}
                  className={cn(
                    "cursor-pointer w-full flex items-center justify-between px-3 py-2.5 rounded-lg",
                    "text-sm font-medium transition-all duration-200",
                    "hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
                    "focus:outline-none focus-visible:ring-2 focus-visible:ring-sidebar-ring",
                    active && !collapsed && "active-item",
                    collapsed && "justify-center bg-popover",
                    active && collapsed && "bg-muted text-secondary",
                  )}
                >
                  <div
                    className={cn(
                      "flex items-center gap-3",
                      collapsed && "justify-center",
                    )}
                  >
                    <Icon className="w-5 h-5" />
                    {!collapsed && <span>{item.label}</span>}
                  </div>
                  {hasSubItems && !collapsed && (
                    <div
                      className={cn(
                        "transition-transform duration-200",
                        expanded && "rotate-180",
                      )}
                    >
                      <ChevronDown className="w-4 h-4" />
                    </div>
                  )}
                </button>

                {hasSubItems && !collapsed && (
                  <div
                    className={cn(
                      "overflow-hidden transition-all duration-200 ease-in-out",
                      expanded ? "max-h-40 opacity-100" : "max-h-0 opacity-0",
                    )}
                  >
                    <ul className="mt-1 ml-4 pl-4 border-l border-sidebar-border space-y-1">
                      {item.subItems?.map((subItem) => {
                        const SubIcon = subItem.icon;
                        const subActive = isActive(subItem.path);

                        return (
                          <li key={subItem.id}>
                            <button
                              onClick={() => navigate(subItem.path)}
                              className={cn(
                                "cursor-pointer w-full flex items-center gap-3 px-3 py-2 rounded-lg",
                                "text-sm transition-all duration-200",
                                "hover:text-secondary",
                                "focus:outline-none focus-visible:ring-2 focus-visible:ring-sidebar-ring",
                                subActive && "text-secondary",
                                !subActive && "text-sidebar-foreground/80",
                              )}
                            >
                              <SubIcon className="w-4 h-4" />
                              <span>{subItem.label}</span>
                            </button>
                          </li>
                        );
                      })}
                    </ul>
                  </div>
                )}
              </li>
            );
          })}
        </ul>
      </nav>

      {!collapsed && (
        <div className="p-4 border-t border-sidebar-border">
          <p className="text-xs text-sidebar-foreground/50 text-center">
            © 2026 POS System
          </p>
        </div>
      )}
    </aside>
  );
};

export default Sidebar;
