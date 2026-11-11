# AGENTS.md

## Stack

Electron 39 · React 19 · TypeScript (strict) · Vite (renderer) · esbuild (main/preload) · Prisma 7 + SQLite (better-sqlite3) · Zod 4 · TanStack Query · Tailwind 4 + shadcn/ui.

## Layout

```
src/main/              Electron main process
  modules/<domain>/    <domain>.service.ts (business logic) + <domain>.routes.ts (IPC handlers)
  ipc/                 register.ts (registerRoutes, builds replies) · index.ts (wires modules)
  errors/              api-error.ts · prisma-errors.ts · error-handler.ts (toFailure: the one error pipeline)
  db.ts, generated/    Prisma client (generated/ is generated, do not edit)
src/preload/index.ts   Exposes window.electronAPI built from the route registry
src/shared/            Imported by main, preload and renderer
  contracts/           <domain>.contract.ts: Zod DTOs + route definitions; common.ts (Empty, NoData, Money)
  ipc/                 contract.ts (defineRoute, envelope) · errors.ts (ErrorCode) · routes.ts (registry)
src/renderer/          React app: pages/, components/ (ui/ = shadcn), context/, routes/
  modules/<domain>/    api.ts: TanStack Query hooks for that domain's IPC
  lib/ipc.ts           unwrap(): returns route data or throws IpcError
```

## Commands

- `npm run dev`: Vite on the first free port from 5173 (127.0.0.1); writes `.dev-server-url` for Electron (`DEV_SERVER_URL` overrides)
- `npm start`: build main/preload to `dist-electron/` and launch Electron
- `npm run dev:web`: dev only, run the renderer in a browser; only auth routes work, through a loopback bridge (`src/main/web-bridge/`)
- `npm run typecheck` · `npm run lint` · `npm test` (main + renderer, in parallel): all must pass
- `npm run test:main` (runs under Electron's Node) · `npm run test:renderer` · `npm run test:e2e` (Playwright + Electron) · `npm run coverage`
- `npm run build`: Vite renderer build + main/preload bundle

## Conventions (reference implementation: auth)

`src/shared/contracts/auth.contract.ts` → `src/main/modules/auth/` → `src/renderer/modules/auth/api.ts` → `src/renderer/context/auth-context.tsx`

- **DTOs:** every IPC input/output is a Zod schema in `src/shared/contracts`, and its type comes from `z.infer`. Use `Empty` for no input and `NoData` for no output.
- **IPC routes:** declare routes with `defineRoute({ channel: "<domain>:<action>", input, output, successMessage })` and add the module to `src/shared/ipc/routes.ts`. Main registers handlers through `registerRoutes` in `src/main/ipc/index.ts`, typed as `RouteHandlers<typeof xRoutes>`. Input and output are validated there. The preload picks new routes up automatically; never use raw `ipcRenderer` or channel strings anywhere else.
- **Services:** business logic lives in `<domain>.service.ts` and returns plain domain data (no envelope). Handlers only delegate. Routes with no result return `null` (`NoData`).
- **Envelope:** every reply is `{ success, message, data }`. On failure `data` is `null` and `details` is `{ code, issues?, fields? }`. Built only by `register.ts` and `toFailure`.
- **Errors:** services throw only `ApiError.notFound/conflict/badRequest/unauthorized/forbidden(...)` from `src/main/errors/api-error.ts`. Never catch-and-wrap in services or handlers. `toFailure` maps ApiError, Zod (`VALIDATION_ERROR` + `issues`) and known Prisma errors (P2002/P2025/P2003/P2000, init); anything else is logged and returned as `INTERNAL_ERROR` "Something went wrong". In the renderer, `unwrap` throws `IpcError` (`code`, `details`).
- **Renderer state:** IPC/server data goes through TanStack Query hooks in `src/renderer/modules/<domain>/api.ts`, using `unwrap`. Components never call `window.electronAPI`. UI state uses `useState`/`useReducer` in the component or page. Form state stays local to the form; validate with the shared contract schema when submitting over IPC.
- **Money:** always integer minor units (`Money` in `contracts/common.ts`), never floats. Format only for display. Existing float math in the sale/product UI is marked `FLAG(money)`.
- **Strict TS:** no `any`; if one is unavoidable, add a comment saying why. Imports use the `@/` alias (`@/shared/...`, `@/renderer/...`).

## Testing (reference: the auth tests)

- **Scope:** test services and their routes, the IPC/error pipeline, contracts with real rules, and complex client state (providers, reducers, multi-step forms). Skip `components/ui`, static markup and pass-through code. No coverage target.
- **Levels:**
  - Unit/integration: `*.test.ts(x)` next to the source. Main tests in `src/main/**` run through `registerIPCHandlers()` with `@tests/setup/main-ipc` and real SQLite.
  - Renderer: `renderRoutes` with `installFakeElectronApi`, whose replies are parsed by the route output schemas.
  - E2E: `e2e/` with its fixtures.
- **Assert intended behavior only.** Never encode known-wrong behavior. Fix it test-first, or leave it untested (see the `FLAG` comments).
- **Isolation:** every main test file and E2E test gets its own copy of the migrated template DB. `useTestDatabase()` empties the tables before each test; seed with `@tests/setup/factories` (unique names). Never use `dev.db`, the real keytar (mocked in unit/integration tests; namespaced `nayahisab-e2e-*` in E2E), the network, or test order.
- **No sleeps.** Use `findBy*`/`waitFor`, Playwright auto-waiting, and `deferred()` for in-flight states. Fakes that stand in for main must keep state the way main does (e.g. status reflects login).
