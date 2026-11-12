import { useState } from "react";
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
import { BrandLockup } from "@/renderer/components/brand/BrandMark";

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
  const [openState, setOpenState] = useState<Record<string, boolean>>({});
  const [collapsed, setCollapsed] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  const isActive = (path: string) => location.pathname === path;

  const hasActiveChild = (item: MenuItem) => {
    if (!item.subItems) return false;
    return item.subItems.some((subItem) => location.pathname === subItem.path);
  };

  const isExpanded = (item: MenuItem) =>
    openState[item.id] ?? hasActiveChild(item);

  const toggleExpand = (item: MenuItem) => {
    setOpenState((prev) => ({
      ...prev,
      [item.id]: !(prev[item.id] ?? hasActiveChild(item)),
    }));
  };

  const handleItemClick = (item: MenuItem) => {
    if (item.subItems) {
      if (collapsed) {
        setCollapsed(false);
        setOpenState((prev) => ({ ...prev, [item.id]: true }));
        return;
      }
      toggleExpand(item);
      return;
    }

    if (item.path) {
      navigate(item.path);
    }
  };

  return (
    <aside
      className={cn(
        "flex flex-col overflow-hidden border-r border-sidebar-border bg-sidebar pt-2 text-sidebar-foreground transition-[width] duration-200",
        collapsed ? "w-16" : "w-[17rem]",
        className,
      )}
    >
      <div
        className={cn(
          "flex h-16 shrink-0 items-center justify-between gap-2",
          collapsed ? "justify-center px-2" : "px-4",
        )}
      >
        {!collapsed && (
          <BrandLockup className="overflow-hidden text-sidebar-foreground" />
        )}
        <button
          type="button"
          onClick={() => setCollapsed((prev) => !prev)}
          className="inline-flex h-8 w-8 shrink-0 cursor-pointer items-center justify-center rounded-lg text-sidebar-foreground/70 transition-colors hover:bg-sidebar-accent hover:text-sidebar-accent-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sidebar-ring"
          aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          {collapsed ? (
            <Menu aria-hidden="true" className="h-5 w-5" />
          ) : (
            <ChevronLeft aria-hidden="true" className="h-4 w-4" />
          )}
        </button>
      </div>

      <nav
        className={cn(
          "min-h-0 flex-1 overflow-y-auto py-3",
          collapsed ? "px-2" : "px-3",
        )}
      >
        <ul className="space-y-1">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const hasSubItems = Boolean(item.subItems?.length);
            const expanded = isExpanded(item);
            const active = item.path ? isActive(item.path) : hasActiveChild(item);
            const submenuId = `sidebar-submenu-${item.id}`;

            return (
              <li key={item.id}>
                <button
                  type="button"
                  onClick={() => handleItemClick(item)}
                  aria-current={item.path && active ? "page" : undefined}
                  aria-expanded={
                    hasSubItems && !collapsed ? expanded : undefined
                  }
                  aria-controls={
                    hasSubItems && !collapsed ? submenuId : undefined
                  }
                  aria-label={collapsed ? item.label : undefined}
                  title={collapsed ? item.label : undefined}
                  className={cn(
                    "flex w-full cursor-pointer items-center justify-between gap-3 rounded-xl text-sm font-medium transition-colors",
                    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sidebar-ring",
                    collapsed
                      ? "mx-auto h-10 w-10 justify-center p-0"
                      : "h-10 px-3.5",
                    active
                      ? "bg-sidebar-active text-sidebar-active-foreground shadow-sm hover:bg-sidebar-active hover:text-sidebar-active-foreground"
                      : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
                  )}
                >
                  <div
                    className={cn(
                      "flex min-w-0 items-center gap-3",
                      collapsed && "justify-center",
                    )}
                  >
                    <span className="flex h-7 w-7 shrink-0 items-center justify-center">
                      <Icon
                        aria-hidden="true"
                        className="h-[18px] w-[18px]"
                      />
                    </span>
                    {!collapsed && <span className="truncate">{item.label}</span>}
                  </div>
                  {hasSubItems && !collapsed && (
                    <ChevronDown
                      aria-hidden="true"
                      className={cn(
                        "h-4 w-4 shrink-0 transition-transform duration-200",
                        expanded && "rotate-180",
                      )}
                    />
                  )}
                </button>

                {hasSubItems && !collapsed && (
                  <div
                    id={submenuId}
                    className={cn(
                      "overflow-hidden transition-all duration-200 ease-in-out",
                      expanded ? "max-h-40 opacity-100" : "max-h-0 opacity-0",
                    )}
                  >
                    <ul className="mt-1 ml-3 space-y-1">
                      {item.subItems?.map((subItem) => {
                        const SubIcon = subItem.icon;
                        const subActive = isActive(subItem.path);

                        return (
                          <li key={subItem.id}>
                            <button
                              type="button"
                              onClick={() => navigate(subItem.path)}
                              aria-current={subActive ? "page" : undefined}
                              className={cn(
                                "flex h-9 w-full cursor-pointer items-center gap-3 rounded-lg px-3 text-sm transition-colors",
                                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sidebar-ring",
                                subActive
                                  ? "font-semibold text-sidebar-primary hover:bg-sidebar-accent hover:text-sidebar-primary"
                                  : "text-sidebar-foreground/80 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
                              )}
                            >
                              <SubIcon
                                aria-hidden="true"
                                className="h-4 w-4 shrink-0"
                              />
                              <span className="truncate">{subItem.label}</span>
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
        <div className="shrink-0 border-t border-sidebar-border/70 px-4 py-3">
          <p className="text-center text-xs text-sidebar-foreground/60">
            © 2026 POS System
          </p>
        </div>
      )}
    </aside>
  );
};

export default Sidebar;
