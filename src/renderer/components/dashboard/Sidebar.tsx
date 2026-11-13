import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { ChevronDown, ChevronLeft, ChevronsUpDown, Menu, Settings } from "lucide-react";
import { cn } from "@/renderer/lib/utils";
import { BrandLockup, BrandMark } from "@/renderer/components/brand/BrandMark";
import { useAuth } from "@/renderer/context/auth-context";
import { initialsOf, navGroups, SETTINGS_PATH, type NavItem } from "./nav";
import { UserMenu } from "./UserMenu";

const Sidebar = ({ className }: { className?: string }) => {
  const [openState, setOpenState] = useState<Record<string, boolean>>({});
  const [collapsed, setCollapsed] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useAuth();

  const isActive = (path: string) => location.pathname === path;
  const onSettings = location.pathname.startsWith(SETTINGS_PATH);

  const hasActiveChild = (item: NavItem) =>
    item.subItems?.some((subItem) => location.pathname === subItem.path) ?? false;

  const isExpanded = (item: NavItem) => openState[item.id] ?? hasActiveChild(item);

  const toggleExpand = (item: NavItem) => {
    setOpenState((prev) => ({
      ...prev,
      [item.id]: !(prev[item.id] ?? hasActiveChild(item)),
    }));
  };

  const handleItemClick = (item: NavItem) => {
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
        "flex flex-col overflow-hidden border-r border-sidebar-border bg-sidebar pt-5 text-sidebar-foreground transition-[width] duration-200",
        collapsed ? "w-16" : "w-[18rem]",
        className,
      )}
    >
      <div
        className={cn(
          "flex h-12 shrink-0 items-center gap-2",
          collapsed ? "flex-col justify-center px-2" : "justify-between px-5",
        )}
      >
        {collapsed ? (
          <BrandMark className="h-9 w-9" />
        ) : (
          <BrandLockup className="overflow-hidden text-sidebar-foreground" />
        )}
        {!collapsed && (
          <button
            type="button"
            onClick={() => setCollapsed(true)}
            className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-sidebar-foreground/60 transition-colors hover:bg-sidebar-active/[0.06] hover:text-sidebar-foreground focus-visible:ring-2 focus-visible:ring-sidebar-ring focus-visible:outline-none"
            aria-label="Collapse sidebar"
            title="Collapse sidebar"
          >
            <ChevronLeft aria-hidden="true" className="h-4 w-4" />
          </button>
        )}
      </div>

      {collapsed && (
        <button
          type="button"
          onClick={() => setCollapsed(false)}
          className="mx-auto mt-3 inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-sidebar-foreground/60 transition-colors hover:bg-sidebar-active/[0.06] hover:text-sidebar-foreground focus-visible:ring-2 focus-visible:ring-sidebar-ring focus-visible:outline-none"
          aria-label="Expand sidebar"
          title="Expand sidebar"
        >
          <Menu aria-hidden="true" className="h-4 w-4" />
        </button>
      )}

      <nav className={cn("mt-5 min-h-0 flex-1 overflow-y-auto pb-4", collapsed ? "px-2" : "px-3")}>
        {navGroups.map((group, groupIndex) => (
          <div key={group.label} className={cn(groupIndex > 0 && "mt-5")}>
            {collapsed ? (
              groupIndex > 0 && <div className="mx-auto mb-3 h-px w-6 bg-sidebar-border" />
            ) : (
              <p className="mb-1.5 px-3 text-[11px] font-semibold tracking-[0.12em] text-sidebar-foreground/45 uppercase">
                {group.label}
              </p>
            )}

            <ul className="space-y-0.5">
              {group.items.map((item) => {
                const Icon = item.icon;
                const hasSubItems = Boolean(item.subItems?.length);
                const expanded = isExpanded(item);
                const active = item.path ? isActive(item.path) : hasActiveChild(item);
                // The current page and the parent of the current page share the tinted row;
                // aria-current stays on the page itself so screen readers announce the child.
                const current = Boolean(item.path) && active;
                const submenuId = `sidebar-submenu-${item.id}`;

                return (
                  <li key={item.id}>
                    <button
                      type="button"
                      onClick={() => handleItemClick(item)}
                      aria-current={current ? "page" : undefined}
                      aria-expanded={hasSubItems && !collapsed ? expanded : undefined}
                      aria-controls={hasSubItems && !collapsed ? submenuId : undefined}
                      aria-label={collapsed ? item.label : undefined}
                      title={collapsed ? item.label : undefined}
                      className={cn(
                        "group/item flex w-full items-center justify-between gap-3 rounded-xl text-sm transition-colors",
                        "focus-visible:ring-2 focus-visible:ring-sidebar-ring focus-visible:outline-none",
                        collapsed ? "mx-auto h-10 w-10 justify-center p-0" : "h-10 pr-3 pl-2",
                        active && !collapsed
                          ? "bg-sidebar-active/[0.07] font-semibold text-sidebar-foreground ring-1 ring-sidebar-active/10 ring-inset dark:bg-sidebar-active/[0.09]"
                          : "font-medium text-sidebar-foreground/80 hover:bg-sidebar-active/[0.04] hover:text-sidebar-foreground dark:hover:bg-sidebar-active/[0.06]",
                      )}
                    >
                      <span className={cn("flex min-w-0 items-center gap-3", collapsed && "justify-center")}>
                        <span
                          className={cn(
                            "flex h-7 w-7 shrink-0 items-center justify-center rounded-lg transition-colors",
                            active
                              ? "bg-sidebar-active text-sidebar-active-foreground shadow-sm"
                              : "text-sidebar-foreground/70 group-hover/item:text-sidebar-foreground",
                          )}
                        >
                          <Icon aria-hidden="true" className="h-4 w-4" />
                        </span>
                        {!collapsed && <span className="truncate">{item.label}</span>}
                      </span>
                      {hasSubItems && !collapsed && (
                        <ChevronDown
                          aria-hidden="true"
                          className={cn(
                            "h-4 w-4 shrink-0 text-sidebar-foreground/50 transition-transform duration-200",
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
                        {/* Guide line sits under the parent's icon centre (pl-2 + half of the 28px chip). */}
                        <ul className="mt-0.5 mb-1 ml-[1.375rem] space-y-0.5 border-l border-sidebar-border py-0.5">
                          {item.subItems?.map((subItem) => {
                            const subActive = isActive(subItem.path);

                            return (
                              <li key={subItem.id} className="relative">
                                {subActive && (
                                  <span
                                    aria-hidden="true"
                                    className="absolute top-1.5 bottom-1.5 -left-px w-0.5 rounded-full bg-sidebar-primary"
                                  />
                                )}
                                <button
                                  type="button"
                                  onClick={() => navigate(subItem.path)}
                                  aria-current={subActive ? "page" : undefined}
                                  className={cn(
                                    "ml-3 flex h-8 w-[calc(100%-0.75rem)] items-center rounded-lg px-2.5 text-[13px] transition-colors",
                                    "focus-visible:ring-2 focus-visible:ring-sidebar-ring focus-visible:outline-none",
                                    subActive
                                      ? "font-semibold text-sidebar-primary"
                                      : "text-sidebar-foreground/65 hover:bg-sidebar-active/[0.04] hover:text-sidebar-foreground dark:hover:bg-sidebar-active/[0.06]",
                                  )}
                                >
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
          </div>
        ))}
      </nav>

      {user && (
        <div
          className={cn(
            "flex shrink-0 items-center gap-1 border-t border-sidebar-border",
            collapsed ? "flex-col px-2 py-3" : "px-3 py-3",
          )}
        >
          <UserMenu
            side={collapsed ? "right" : "top"}
            align={collapsed ? "end" : "start"}
            trigger={
              <button
                type="button"
                aria-label={`Account menu for ${user.username}`}
                title={collapsed ? user.username : undefined}
                className={cn(
                  "group/user flex min-w-0 items-center gap-3 rounded-xl text-left transition-colors outline-none",
                  "hover:bg-sidebar-active/[0.05] focus-visible:ring-2 focus-visible:ring-sidebar-ring data-[state=open]:bg-sidebar-active/[0.07] dark:hover:bg-sidebar-active/[0.07]",
                  collapsed ? "size-10 justify-center" : "h-12 flex-1 px-2",
                )}
              >
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-primary to-primary-hover text-xs font-semibold text-primary-foreground">
                  {initialsOf(user.username)}
                </span>
                {!collapsed && (
                  <>
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-sm font-semibold">{user.username}</span>
                      <span className="block text-xs text-sidebar-foreground/55">Signed in</span>
                    </span>
                    <ChevronsUpDown aria-hidden="true" className="h-4 w-4 shrink-0 text-sidebar-foreground/45 group-hover/user:text-sidebar-foreground/70" />
                  </>
                )}
              </button>
            }
          />
          {!collapsed && (
            <button
              type="button"
              onClick={() => navigate(SETTINGS_PATH)}
              aria-label="Settings"
              title="Settings"
              aria-current={onSettings ? "page" : undefined}
              className={cn(
                "flex size-10 shrink-0 items-center justify-center rounded-xl transition-colors outline-none focus-visible:ring-2 focus-visible:ring-sidebar-ring",
                onSettings
                  ? "bg-sidebar-active/[0.08] text-sidebar-primary ring-1 ring-sidebar-active/10 ring-inset"
                  : "text-sidebar-foreground/60 hover:bg-sidebar-active/[0.05] hover:text-sidebar-foreground",
              )}
            >
              <Settings aria-hidden="true" className="h-[18px] w-[18px]" />
            </button>
          )}
        </div>
      )}
    </aside>
  );
};

export default Sidebar;
