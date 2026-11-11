# Merge resolution plan — TS migration + UI branch

Status: locked. Decisions confirmed 2026-11-11.
Repository: `D:\projects\pos`

## Context

| | |
| --- | --- |
| HEAD | `143692d` — "refactor UI" (PC branch) |
| MERGE_HEAD | `2b41ba2` — "migrate js to ts" (laptop branch, origin/main) |
| State | merge in progress, nothing committed |

Goal: keep **both** the TS migration (contracts → modules → IPC registry → preload →
renderer modules) and the **UI work** (brand theme, centered themed menu bar, native
window chrome, sale-screen tweaks, login/layout fixes).

Locked decisions:

1. **Password check stays enabled** (`bcrypt.compare`), unlike the laptop branch's disabled TODO.
2. **Menu IPC is re-homed into the route architecture** — no raw `ipcMain` / raw channels.
3. **Delete the dead legacy `src/components/ui/*.jsx`** (5 files, nothing imports them).
4. **Remove `next-themes`** from `package.json` (only `sonner.tsx` used it; it is replaced by the app theme context).

Do not `git merge --abort`; the auto-merged files are already correct.

## Conflict inventory

Content conflicts (6):

- `package.json`
- `src/main/app.ts`
- `src/renderer/App.tsx`
- `src/renderer/components/ui/sonner.tsx`
- `src/renderer/context/theme-context.tsx`
- `src/renderer/pages/dashboard/invoice/sale/CardView.tsx`

Modify/delete (5 + jsconfig):

- `jsconfig.json`
- `src/main/window.js` → `src/main/window.ts`
- `src/preload/index.cjs` → `src/preload/index.ts`
- `src/main/ipc/index.js` → `src/main/ipc/index.ts`
- `src/main/services/auth.service.js` → `src/main/modules/auth/auth.service.ts`

HEAD-only files that still need porting:

- `src/main/ipc/menu.ipc.js` → new menu module
- `src/renderer/components/layout/MenuBar.jsx` → `MenuBar.tsx`

---

## Phase 1 — Resolve content conflicts

### 1.1 `package.json`

Keep the laptop branch's scripts and add `seed`; remove `next-themes`.

```json
"scripts": {
  "dev": "vite",
  "dev:web": "npm run build:electron && node scripts/dev-web.mjs",
  "build": "vite build && npm run build:electron",
  "build:electron": "node scripts/build-electron.mjs",
  "typecheck": "tsc -p tsconfig.node.json && tsc -p tsconfig.web.json && tsc -p tsconfig.test.json",
  "lint": "eslint .",
  "preview": "vite preview",
  "start": "npm run build:electron && electron-forge start",
  "package": "npm run build:electron && electron-forge package",
  "make": "npm run build:electron && electron-forge make",
  "seed": "node scripts/seed-user.js",
  "test": "concurrently -g -n renderer,main \"npm:test:renderer\" \"npm:test:main\"",
  "test:renderer": "vitest run --project renderer",
  "test:main": "node scripts/test-main.mjs run",
  "test:watch": "vitest --project renderer",
  "test:e2e": "npm run build:electron && playwright test",
  "coverage": "vitest run --project renderer --coverage && node scripts/test-main.mjs run --coverage"
}
```

Remove the `"next-themes": "^0.4.6"` dependency line.

### 1.2 `jsconfig.json`

Delete. tsconfig + the Vite `@` alias supersede it. Our side only reformatted it.

### 1.3 `src/main/app.ts`

Keep extensionless imports; add `Menu` and the call.

```ts
import { app, BrowserWindow, Menu } from "electron";
import { registerIPCHandlers } from "./ipc/index";
import { createMainWindow } from "./window";

export async function bootstrapApp() {
  await app.whenReady();

  // The app draws its own themed menu bar, so remove Electron's default menu.
  Menu.setApplicationMenu(null);

  registerIPCHandlers();
  createMainWindow();

  app.on("activate", () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createMainWindow();
    }
  });
}
```

### 1.4 `src/renderer/App.tsx`

Keep our layout (`<MenuBar />` + flex column) and use extensionless imports.

```tsx
import { Toaster } from "./components/ui/sonner";
import { routes } from "./routes/index";
import MenuBar from "./components/layout/MenuBar";
```

Body unchanged from the HEAD side:

```tsx
<div className="flex h-screen flex-col overflow-hidden bg-background">
  <MenuBar />
  <div className="relative min-h-0 flex-1 overflow-hidden">
    <AppRoutes />
  </div>
  <Toaster expand={false} richColors duration={4000} />
</div>
```

### 1.5 `src/renderer/components/ui/sonner.tsx`

Keep our app-theme version (drop `next-themes`), typed:

```tsx
import { useTheme } from "@/renderer/context/theme-context";
import { Toaster as Sonner, type ToasterProps } from "sonner";

const Toaster = ({ ...props }: ToasterProps) => {
  const { mode = "light" } = useTheme();

  return (
    <Sonner
      theme={mode as ToasterProps["theme"]}
      /* …existing className/icons/toastOptions unchanged… */
      {...props}
    />
  );
};
```

### 1.6 `src/renderer/context/theme-context.tsx`

Replace the whole file with the mode-only, typed version (matches Settings, ThemeToggle,
sonner, App):

```tsx
import { createContext, useContext, useEffect, useState, type ReactNode } from "react";

export type ThemeMode = "light" | "dark";

export const modes = [
  { id: "light", name: "Light" },
  { id: "dark", name: "Dark" },
] as const satisfies ReadonlyArray<{ id: ThemeMode; name: string }>;

interface ThemeContextValue {
  mode: ThemeMode;
  setMode: (mode: ThemeMode) => void;
}

const ThemeContext = createContext<ThemeContextValue | undefined>(undefined);

function readMode(storageKey: string, fallback: ThemeMode): ThemeMode {
  const stored = localStorage.getItem(`${storageKey}-mode`);
  return stored === "light" || stored === "dark" ? stored : fallback;
}

export function ThemeProvider({
  children,
  defaultMode = "light",
  storageKey = "vite-ui-theme",
  ...props
}: {
  children: ReactNode;
  defaultMode?: ThemeMode;
  storageKey?: string;
}) {
  const [mode, setMode] = useState<ThemeMode>(() => readMode(storageKey, defaultMode));

  useEffect(() => {
    const root = window.document.documentElement;
    root.classList.toggle("dark", mode === "dark");
    root.dataset.mode = mode;
    localStorage.setItem(`${storageKey}-mode`, mode);
    localStorage.removeItem(`${storageKey}-theme`);
  }, [storageKey, mode]);

  return (
    <ThemeContext.Provider {...props} value={{ mode, setMode }}>
      {children}
    </ThemeContext.Provider>
  );
}

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) throw new Error("useTheme must be used within a ThemeProvider");
  return context;
};
```

### 1.7 `CardView.tsx` (single hunk at ~line 395)

Combine our colour with their money typing:

```tsx
<span className="text-sm font-semibold text-foreground mt-0.5">
  {/* FLAG(money): float math; Number() mirrors the original implicit coercion. */}
  {formatCurrency(item.price * Number(item.quantity))}
</span>
```

---

## Phase 2 — Port and delete the `.js` leftovers

### 2.1 `src/main/window.ts`

Keep the laptop branch's `resolveDevServerUrl()` and `preload.cjs` path; add our window
chrome. Then delete `src/main/window.js`.

```ts
const win = new BrowserWindow({
  width: 1200,
  height: 800,
  minWidth: 960,
  minHeight: 640,
  titleBarStyle: "hidden",
  titleBarOverlay: { color: "#0B0B0C", symbolColor: "#FFFFFF", height: 36 },
  backgroundColor: "#0B0B0C",
  show: false,
  webPreferences: {
    preload: preloadPath,
    contextIsolation: true,
    nodeIntegration: false,
    backgroundThrottling: false,
  },
});
```

Keep the `before-input-event` dev shortcuts (`F12`, `Ctrl+Shift+I`, `Ctrl+R`), then:

```ts
win.once("ready-to-show", () => win.show());
await win.loadURL(resolveDevServerUrl());
if (process.env.NODE_ENV !== "production") {
  win.webContents.openDevTools({ mode: "detach" });
}
```

### 2.2 `src/main/modules/auth/auth.service.ts`

Enable the password check (decision 1). Keep the new `AuthUser` return shape — no envelope.

```ts
import bcrypt from "bcryptjs";
// …
const { username, password } = data;
// …
const isValidPassword = await bcrypt.compare(password, user.password);
if (!isValidPassword) {
  throw ApiError.unauthorized("Invalid credentials");
}
```

Remove the disabled-check TODO comment. Delete `src/main/services/auth.service.js`.
Update the comment in `auth.integration.test.ts` (lines 18–19) and add a wrong-password test:

```ts
it("returns UNAUTHORIZED for a wrong password and stays signed out", async () => {
  const user = await createUser();
  const reply = await invokeIpc("auth:login", { username: user.username, password: "wrong-password" });
  expect(reply).toEqual({
    success: false,
    message: "Invalid credentials",
    data: null,
    details: { code: "UNAUTHORIZED" },
  });
  expect(getSession()).toBeNull();
});
```

### 2.3 `src/preload/index.cjs`

Delete. The TS preload derives `window.electronAPI` from the route registry, so menu routes
appear automatically.

### 2.4 `src/main/ipc/index.js`

Delete; menu handlers are added to `index.ts` in Phase 3.

### 2.5 `jsconfig.json`

Delete (already covered in 1.2).

---

## Phase 3 — Route-based menu module

### 3.1 `src/shared/contracts/menu.contract.ts` (new)

```ts
import { z } from "zod";
import { defineRoute } from "../ipc/contract";
import { NoData } from "./common";

export const MenuCommand = z.enum([
  "quit",
  "reload",
  "toggleDevTools",
  "actualSize",
  "zoomIn",
  "zoomOut",
  "toggleFullScreen",
  "about",
]);
export type MenuCommand = z.infer<typeof MenuCommand>;

export const EditCommand = z.enum(["undo", "redo", "cut", "copy", "paste", "selectAll"]);
export type EditCommand = z.infer<typeof EditCommand>;

export const menuRoutes = {
  invoke: defineRoute({
    channel: "menu:invoke",
    input: MenuCommand,
    output: NoData,
    successMessage: "Menu command executed",
  }),
  edit: defineRoute({
    channel: "menu:edit",
    input: EditCommand,
    output: NoData,
    successMessage: "Edit command executed",
  }),
};
```

### 3.2 `src/main/modules/menu/menu.service.ts` (new)

Move the switch from the old `menu.ipc.js`; keep it typed.

```ts
import { app, dialog, type BrowserWindow, type WebContents } from "electron";
import type { EditCommand, MenuCommand } from "@/shared/contracts/menu.contract";

export function runEditCommand(command: EditCommand, contents: WebContents): void {
  switch (command) {
    case "undo": contents.undo(); break;
    case "redo": contents.redo(); break;
    case "cut": contents.cut(); break;
    case "copy": contents.copy(); break;
    case "paste": contents.paste(); break;
    case "selectAll": contents.selectAll(); break;
  }
}

export function runMenuCommand(command: MenuCommand, win: BrowserWindow): void {
  switch (command) {
    case "quit": app.quit(); break;
    case "reload": win.webContents.reload(); break;
    case "toggleDevTools": win.webContents.toggleDevTools(); break;
    case "actualSize": win.webContents.setZoomLevel(0); break;
    case "zoomIn": win.webContents.setZoomLevel(win.webContents.getZoomLevel() + 0.5); break;
    case "zoomOut": win.webContents.setZoomLevel(win.webContents.getZoomLevel() - 0.5); break;
    case "toggleFullScreen": win.setFullScreen(!win.isFullScreen()); break;
    case "about":
      dialog.showMessageBox(win, {
        type: "info",
        title: "NayaHisab",
        message: "NayaHisab POS",
        detail: `Version ${app.getVersion()}`,
        buttons: ["OK"],
      });
      break;
  }
}
```

### 3.3 `src/main/modules/menu/menu.routes.ts` (new)

```ts
import { BrowserWindow } from "electron";
import type { menuRoutes } from "@/shared/contracts/menu.contract";
import type { RouteHandlers } from "../../ipc/register";
import { runEditCommand, runMenuCommand } from "./menu.service";

export const menuHandlers: RouteHandlers<typeof menuRoutes> = {
  invoke: (command, event) => {
    const win = BrowserWindow.fromWebContents(event.sender);
    if (win) runMenuCommand(command, win);
    return null;
  },
  edit: (command, event) => {
    runEditCommand(command, event.sender);
    return null;
  },
};
```

### 3.4 Registry wiring

`src/shared/ipc/routes.ts`:

```ts
import { menuRoutes } from "../contracts/menu.contract";

export const ipcRoutes = {
  auth: authRoutes,
  user: userRoutes,
  menu: menuRoutes,
};
```

`src/main/ipc/index.ts`:

```ts
import { menuHandlers } from "../modules/menu/menu.routes";

registerRoutes(ipcRoutes, {
  auth: authHandlers,
  user: userHandlers,
  menu: menuHandlers,
});
```

### 3.5 `src/renderer/modules/menu/api.ts` (new)

```ts
import { unwrap } from "@/renderer/lib/ipc";
import type { EditCommand, MenuCommand } from "@/shared/contracts/menu.contract";

export async function invokeMenuCommand(command: MenuCommand): Promise<void> {
  await unwrap(window.electronAPI.menu.invoke(command));
}

export async function invokeEditCommand(command: EditCommand): Promise<void> {
  await unwrap(window.electronAPI.menu.edit(command));
}
```

### 3.6 `MenuBar.jsx` → `src/renderer/components/layout/MenuBar.tsx`

Rename; type the item union and call the api module, not `window.electronAPI`:

```tsx
import type { EditCommand, MenuCommand } from "@/shared/contracts/menu.contract";
import { invokeEditCommand, invokeMenuCommand } from "@/renderer/modules/menu/api";

type MenuItem =
  | { label: string; shortcut?: string; command: MenuCommand; edit?: false }
  | { label: string; shortcut?: string; command: EditCommand; edit: true };
type MenuEntry = MenuItem | { type: "separator" };
type Menu = { label: string; items: MenuEntry[] };

function runCommand(item: MenuItem) {
  // Best-effort: commands are OS glue and dev:web does not forward them.
  void (item.edit ? invokeEditCommand(item.command) : invokeMenuCommand(item.command)).catch(() => {});
}
```

Keep the centered layout (`justify-center`), the 36px `bg-sidebar` strip, the drag/no-drag
classes, and the dropdown styling unchanged. Delete `MenuBar.jsx`.

### 3.7 Delete `src/main/ipc/menu.ipc.js`

Its logic now lives in `modules/menu/`.

---

## Phase 4 — Cleanup

1. Delete the dead legacy directory `src/components/ui/`:
   `badge.jsx`, `select.jsx`, `separator.jsx`, `switch.jsx`, `textarea.jsx`.
   Verified: no `@/components` imports anywhere; everything uses `@/renderer/components/ui`.
2. Remove `next-themes` from `package.json` (done in 1.1) and let `npm install` update the lock.
3. Update the stale comment in `scripts/seed-user.js` (`src/main/services/user.service.js` →
   `src/main/modules/user/user.service.ts`).

---

## Phase 5 — Test infrastructure

`tests/setup/main-ipc.ts` — the fake Electron module must satisfy the new module graph:

```ts
export function fakeElectronModule() {
  return {
    ipcMain: { handle: vi.fn((channel: string, fn: IpcHandler) => handlers.set(channel, fn)) },
    app: { quit: vi.fn(), getVersion: () => "0.0.0" },
    BrowserWindow: { fromWebContents: vi.fn(() => null) },
    dialog: { showMessageBox: vi.fn() },
  };
}
```

`tests/setup/fake-electron-api.ts` needs no change; it iterates `ipcRoutes` and picks up
`menu` automatically. Renderer tests that never invoke menu routes stay green.

---

## Phase 6 — Verification

```bash
npm install            # syncs the lockfile, removes next-themes
npm run typecheck
npm run lint
npm test
npm run build
```

Optional but recommended: `npm run test:e2e` (Playwright).

Manual smoke test (`npm start`, which now rebuilds main/preload first):

- No stock Windows title bar and no stock File/Edit menu.
- One 36px strip: centered `File Edit View Help` + native `− □ ✕`, midnight in both modes.
- Menu items work; dropdowns use popover styling; About shows the version.
- Login with `adi71011` / `123456` succeeds; wrong password shows "Invalid credentials".
- Theme toggle switches dark/light; toasts and AVATAR follow the theme.
- Sale screen: Complete is the teal primary; money is foreground, not teal.
- `Ctrl+R` / `F12` still work in dev (main-process shortcuts).

---

## Phase 7 — Commit

```bash
git add -A
git commit            # merge commit, default message is fine
```

Optional safety net before starting: `git branch backup/pre-merge HEAD`.

Do not push until typecheck + tests + the manual smoke test pass.

---

## Acceptance checklist

- [ ] `package.json` has both UI `seed` and TS test scripts; no `next-themes`
- [ ] `jsconfig.json`, all conflicted `.js` files and `src/components/ui/*.jsx` are gone
- [ ] `window.ts` has native title-bar overlay + menu removal applies at boot
- [ ] Login verifies the password with bcrypt; wrong-password test added
- [ ] Menu is a route-based module (`menu.contract.ts` → `modules/menu` → registry → `modules/menu/api.ts`)
- [ ] `MenuBar.tsx` is centered and typed; no raw `window.electronAPI` in components
- [ ] `theme-context.tsx` is mode-only and typed; sonner uses it
- [ ] `npm run typecheck`, `npm run lint`, `npm test`, `npm run build` all pass
- [ ] Manual smoke test passes

## Risks / notes

- `titleBarOverlay` + renderer drag regions require a full Electron restart and a rebuilt
  main/preload; HMR alone will not show the chrome.
- `dev:web` does not forward menu routes; `MenuBar` swallows those rejections.
- `npm install` is required after the `package.json` resolution; do not hand-edit the lock.
- If anything goes wrong after commit: `git reset --hard HEAD~1` returns to `143692d` with the
  merge undone; before commit, `git merge --abort` does the same.
