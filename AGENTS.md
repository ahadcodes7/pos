# AGENTS.md

## Stack
Electron 39 · React 19 · TypeScript (strict) · Vite (renderer) · esbuild (main/preload) · Prisma 7 + SQLite (better-sqlite3) · Zod 4 · TanStack Query · Tailwind 4 + shadcn/ui.

## Layout
```
src/main/              Electron main process
  modules/<domain>/    <domain>.service.ts (business logic) + <domain>.routes.ts (IPC handlers)
  ipc/                 register.ts (registerRoutes, envelope, errors) · index.ts (wires modules)
  db.ts, generated/    Prisma client (generated/ is generated, do not edit)
src/preload/index.ts   Exposes window.electronAPI built from the route registry
src/shared/            Imported by main, preload and renderer
  contracts/           <domain>.contract.ts: Zod DTOs + route definitions; common.ts (Empty, Money)
  ipc/                 contract.ts (defineRoute, envelope types) · routes.ts (registry)
src/renderer/          React app: pages/, components/ (ui/ = shadcn), context/, routes/
  modules/<domain>/    api.ts: TanStack Query hooks for that domain's IPC
  lib/ipc.ts           unwrap(): returns route data or throws IpcError
```

## Commands
- `npm run dev`: Vite dev server on :5173 (required while running the app)
- `npm start`: build main/preload to `dist-electron/` and launch Electron
- `npm run typecheck` · `npm run lint`: there is no test suite; these two must pass
- `npm run build`: Vite renderer build + main/preload bundle

## Conventions (reference implementation: auth)
`src/shared/contracts/auth.contract.ts` → `src/main/modules/auth/` → `src/renderer/modules/auth/api.ts` → `src/renderer/context/auth-context.tsx`
- **DTOs:** every IPC input/output is a Zod schema in `src/shared/contracts`, and its type comes from `z.infer`. Use `Empty` for no input/output.
- **IPC routes:** declare routes with `defineRoute({ channel: "<domain>:<action>", input, output })` and add the module to `src/shared/ipc/routes.ts`. Main registers handlers through `registerRoutes` in `src/main/ipc/index.ts`, typed as `RouteHandlers<typeof xRoutes>`. Input and output are validated there. The preload picks new routes up automatically; never use raw `ipcRenderer` or channel strings anywhere else.
- **Services:** business logic lives in `<domain>.service.ts` and returns plain domain data (no envelope). Handlers only delegate. To fail, throw `ApiError(message, status)` from `src/main/utils/apiError.util.ts`.
- **Envelope:** replies are `{ success: true, data }` or `{ success: false, message, status, errors? }`, built only in `register.ts`.
- **Renderer state:** IPC/server data goes through TanStack Query hooks in `src/renderer/modules/<domain>/api.ts`, using `unwrap`. Components never call `window.electronAPI`. UI state uses `useState`/`useReducer` in the component or page. Form state stays local to the form; validate with the shared contract schema when submitting over IPC.
- **Money:** always integer minor units (`Money` in `contracts/common.ts`), never floats. Format only for display. Existing float math in the sale/product UI is marked `FLAG(money)`.
- **Strict TS:** no `any`; if one is unavoidable, add a comment saying why. Imports use the `@/` alias (`@/shared/...`, `@/renderer/...`).
