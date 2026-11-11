import { Menubar as MenubarPrimitive } from "radix-ui";
import { invokeEditCommand, invokeMenuCommand } from "@/renderer/modules/menu/api";
import { cn } from "@/renderer/lib/utils";
import type { EditCommand, MenuCommand } from "@/shared/contracts/menu.contract";

const isDev = import.meta.env.DEV;

type AppMenuItem = {
  type?: "item";
  label: string;
  shortcut?: string;
  command: MenuCommand;
  edit?: false;
};

type EditMenuItem = {
  type?: "item";
  label: string;
  shortcut?: string;
  command: EditCommand;
  edit: true;
};

type Separator = { type: "separator" };
type MenuEntry = AppMenuItem | EditMenuItem | Separator;
type Menu = { label: string; items: MenuEntry[] };

const developerItems: MenuEntry[] = isDev
  ? [{ label: "Toggle Developer Tools", shortcut: "F12", command: "toggleDevTools" }]
  : [];

const menus: Menu[] = [
  {
    label: "File",
    items: [{ label: "Quit", shortcut: "Alt+F4", command: "quit" }],
  },
  {
    label: "Edit",
    items: [
      { label: "Undo", shortcut: "Ctrl+Z", command: "undo", edit: true },
      { label: "Redo", shortcut: "Ctrl+Y", command: "redo", edit: true },
      { type: "separator" },
      { label: "Cut", shortcut: "Ctrl+X", command: "cut", edit: true },
      { label: "Copy", shortcut: "Ctrl+C", command: "copy", edit: true },
      { label: "Paste", shortcut: "Ctrl+V", command: "paste", edit: true },
      { label: "Select All", shortcut: "Ctrl+A", command: "selectAll", edit: true },
    ],
  },
  {
    label: "View",
    items: [
      { label: "Reload", shortcut: "Ctrl+R", command: "reload" },
      ...developerItems,
      { type: "separator" },
      { label: "Actual Size", command: "actualSize" },
      { label: "Zoom In", shortcut: "Ctrl++", command: "zoomIn" },
      { label: "Zoom Out", shortcut: "Ctrl+-", command: "zoomOut" },
      { type: "separator" },
      { label: "Toggle Full Screen", shortcut: "F11", command: "toggleFullScreen" },
    ],
  },
  {
    label: "Help",
    items: [{ label: "About NayaHisab", command: "about" }],
  },
];

function runCommand(item: AppMenuItem | EditMenuItem) {
  // Best-effort: commands are OS glue and dev:web does not forward menu routes.
  const pending = item.edit
    ? invokeEditCommand(item.command)
    : invokeMenuCommand(item.command);
  void pending.catch(() => {});
}

export default function MenuBar() {
  return (
    <header className="flex h-9 shrink-0 select-none items-center justify-center border-b border-white/5 bg-sidebar text-sidebar-foreground [-webkit-app-region:drag]">
      <MenubarPrimitive.Root className="flex h-full items-center [-webkit-app-region:no-drag]">
        {menus.map((menu) => (
          <MenubarPrimitive.Menu key={menu.label}>
            <MenubarPrimitive.Trigger
              className={cn(
                "flex h-full select-none items-center rounded-none px-3 text-[12px] font-medium",
                "text-sidebar-foreground/70 outline-none transition-colors",
                "hover:bg-white/10 hover:text-sidebar-foreground",
                "data-[state=open]:bg-white/10 data-[state=open]:text-sidebar-foreground",
              )}
            >
              {menu.label}
            </MenubarPrimitive.Trigger>

            <MenubarPrimitive.Portal>
              <MenubarPrimitive.Content
                align="start"
                sideOffset={2}
                className="z-50 min-w-[210px] rounded-md border border-border bg-popover p-1 text-popover-foreground shadow-lg"
              >
                {menu.items.map((item, index) =>
                  item.type === "separator" ? (
                    <MenubarPrimitive.Separator
                      key={`separator-${index}`}
                      className="my-1 h-px bg-border"
                    />
                  ) : (
                    <MenubarPrimitive.Item
                      key={item.label}
                      onSelect={() => runCommand(item)}
                      className="flex cursor-default select-none items-center justify-between gap-8 rounded-sm px-2 py-1.5 text-[12.5px] outline-none data-[highlighted]:bg-accent data-[highlighted]:text-accent-foreground"
                    >
                      <span>{item.label}</span>
                      {item.shortcut && (
                        <span className="text-[10.5px] tracking-[0.06em] text-muted-foreground">
                          {item.shortcut}
                        </span>
                      )}
                    </MenubarPrimitive.Item>
                  ),
                )}
              </MenubarPrimitive.Content>
            </MenubarPrimitive.Portal>
          </MenubarPrimitive.Menu>
        ))}
      </MenubarPrimitive.Root>
    </header>
  );
}
