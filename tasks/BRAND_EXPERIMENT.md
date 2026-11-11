# Brand Direction Experiment

Status: **deep-teal dashboard palette**, light default with a dark companion. Round 4
replaces the midnight/neon-teal direction. Layout variants are still pending reference designs.

## 1. Decision

Retire the 60/30/10 split. It is a landing-page heuristic; a dashboard is a working surface
where four or five roles coexist:

1. **Canvas** — the large neutral field behind everything.
2. **Surface** — cards, tables, dialogs and popovers that sit above the canvas.
3. **Ink** — headings, body copy, money, table values.
4. **Brand** — primary actions, active navigation, focus, key figures.
5. **Muted** — labels, icons, helper text, secondary structure.
6. **Status** — success / warning / danger, always conventional and never brand-colored.

Palette source: `#295255` deep teal, `#F0F5F7` mist, `#162623` ink green, `#577877` slate teal.
Pure white is structural (cards), not a brand color. Tints for borders and hover states are
derived from the same teal family.

Why this direction:

- The old theme used midnight + neon teal at large scale. In a dashboard that reads as a
  marketing page and makes every surface compete with the data.
- Deep teal carries actions without glowing; the light canvas keeps tables and forms calm.
- A constant `#162623` chrome (sidebar + 36px title strip) frames both modes and matches the
  native Electron caption buttons.
- Status colors stay green / amber / red, so “primary” and “success” cannot be confused.

## 2. Palette

Implementation lives in `src/renderer/index.css`. Hex is the source of truth; the app uses the
same values through shadcn tokens.

| Role | Light | Dark | Notes |
| --- | --- | --- | --- |
| Canvas | `#F0F5F7` | `#162623` | mist in light, ink green in dark |
| Surface (cards) | `#FFFFFF` | `#1C2F2C` | popovers one step lighter: `#213633` |
| Ink | `#162623` | `#F0F5F7` | 14.3:1 both ways |
| Muted text | `#577877` | `#A3BAB8` | 4.4 light / 7.7 dark |
| Brand / primary | `#295255` | `#9AC2BF` | label `#F0F5F7` / `#162623` |
| Hover / selected | `#DCE9EB` | `#24403C` | menus, rows, secondary surfaces |
| Secondary surface | `#E4EDEF` | `#243A36` | secondary buttons, chips |
| Muted surface | `#E9F1F3` | `#1F332F` | table headers, skeletons |
| Border | `#D6E3E5` | `rgb(240 245 247 / 12%)` | hairlines |
| Input border | `#B7CBCE` | `rgb(240 245 247 / 20%)` | form fields |
| Focus ring | `#295255` | `#9AC2BF` | |
| Sidebar / title strip | `#162623` | `#162623` | constant chrome |
| Sidebar accent | `rgb(41 82 85 / 45%)` | `rgb(154 194 191 / 12%)` | nav hover + active |
| Sidebar primary | `#9AC2BF` | `#9AC2BF` | logo tile, active marker, submenu |
| Destructive | `#B42318` | `#F28B82` | white / ink label |
| Success | `#177A4C` | `#5CC08D` | white / ink label |
| Warning | `#B45309` | `#E0A83E` | white / ink label |
| Charts | `#295255`, `#577877`, `#162623`, `#C98A2E`, `#B42318` | `#9AC2BF`, `#577877`, `#F0F5F7`, `#E0A83E`, `#F28B82` | teal family + amber/red status |

Hard rules:

1. **Brand teal is for actions and active states only.** Never use it to mean success.
2. **Status colors are never brand colors.** Green = success, amber = warning, red = danger.
3. **`#577877` is for labels/icons.** For strict AA at small sizes use `#4E6D6C`.
4. **White cards are structural.** Do not promote white to a brand role.
5. **Chrome is constant `#162623` in both modes.** It matches the native caption overlay.

## 3. Token architecture

Three layers, shadcn variable names preserved so components need no edits:

1. **Base** — canvas, ink, surfaces, lines, charts, sidebar.
2. **Brand** — `--primary`, `--primary-foreground`, `--accent`, `--ring`, `--sidebar-primary`.
3. **Semantics** — `--destructive`, `--success`, `--warning` plus the Tailwind `@theme inline`
   mappings.

Mode contract: `<html class="dark">` + `data-mode="light|dark"`, storage key
`pos-ui-theme-v3`. Pre-paint in `index.html` defaults to light.

**Swap procedure:** edit only `:root` and `.dark` in `src/renderer/index.css`. If `--sidebar`
changes, also update the three chrome values (`titleBarOverlay.color`,
`BrowserWindow.backgroundColor`, `<meta name="theme-color">`). No components change.

Density and radius are **not** in this pass (phase 2).

## 4. Fixed by the earlier refactor

1. `@custom-variant dark` matches `.dark` (the provider writes it; `ThemeToggle` icons work).
2. `ui/sonner.tsx` uses the app theme context, not `next-themes`.
3. `text-success`, `text-warning` and `text-destructive-foreground` have `@theme` mappings.
4. `.active-item` uses sidebar tokens, not content tokens.
5. Sidebar collapsed state no longer paints white blocks on dark chrome.
6. Switch thumb uses the primary foreground.

## 5. Hypotheses

| # | Hypothesis | Measure |
| --- | --- | --- |
| H1 | Deep teal + mist reads as a calm, professional ERP | 5-second test, ≥4/5 |
| H2 | Light canvas improves table/form scanning vs dark | task time within 5% of baseline |
| H3 | All text pairs pass WCAG AA | 4.5:1 text, 3:1 boundaries/focus |
| H4 | Brand teal is not confused with success green | 0 first-click errors |
| H5 | Operators prefer it over midnight/neon teal | ≥3/5 preference |

If H4 fails, darken success toward `#146B45` and add a success icon to status cells.

## 6. Variants

| Slot | Canvas | Chrome | Primary action | Intent |
| --- | --- | --- | --- | --- |
| **A (shipped)** | mist `#F0F5F7` | `#162623` | `#295255` | role-based dashboard, teal actions |
| B | TBD from reference | TBD | TBD | |
| C | TBD from reference | TBD | TBD | |

Dark mode is derived from the same four colors: ink-green canvas, mist type, light-teal
actions. Light is the default for daylight counters.

## 7. Test protocol

Screens: Login, Dashboard, Sale invoice, Product list, Receipt.

Methods:

- 5-second recall: show screenshot, ask “what product is this?”.
- Desaturation test: grayscale screenshot, can you still identify it?
- First-click test: “start a new sale”, “complete this sale”, “delete this line”.
- Task timing: create a sale, add 3 items, apply discount, take payment.
- Subjective 5-point: calm / trustworthy / premium / energetic.
- Contrast audit in DevTools for every text and interactive boundary pair.

Participants: author + 2–4 operators if available. Screenshots under `tasks/brand/<variant>/`.

## 8. Success and kill criteria

Ship when: AA passes in light and dark, no task slowdown, ≥3/5 preference, zero
teal/success confusion.

Iterate when: any contrast failure, teal/success confusion, or the light canvas feels washed
out after 10 minutes of use.

## 9. Implementation checklist

- [x] `src/renderer/index.css`: replace midnight/neon teal with deep-teal light + dark companion.
- [x] `src/main/window.ts`: `titleBarOverlay` / `backgroundColor` → `#162623`.
- [x] `index.html`: `theme-color` → `#162623`; pre-paint key → `pos-ui-theme-v3`, default light.
- [x] `src/renderer/App.tsx`: `defaultMode="light"`, `storageKey="pos-ui-theme-v3"`.
- [x] Status colors re-anchored: `#177A4C` / `#B45309` / `#B42318` (light).
- [ ] Verify every screen in light + dark and screenshot both.
- [ ] Decide whether light stays the launch default.
- [ ] Add the pending reference designs as brand-block variants.

### Measured contrast

Computed with the WCAG relative-luminance formula.

| Pair | Light | Dark |
| --- | --- | --- |
| foreground / background | 14.3 | 14.3 |
| muted foreground / background | 4.4 | 7.7 |
| primary / background | 7.9 | 8.1 |
| primary foreground / primary | 7.9 | 8.1 |
| destructive / background | 6.6 | 6.6 |
| success / background | 5.4 | 7.0 |
| warning / background | 5.0 | 7.4 |
| sidebar foreground / sidebar | 14.3 | 14.3 |
| sidebar primary / sidebar | 8.1 | 8.1 |
| primary boundary vs canvas | 7.9 | 8.1 |

The old 1.82:1 primary-boundary trade-off is gone: deep teal has a strong edge on mist.

## 10. Out of scope (next phase)

Density (32/40px rows, compact mode), touch mode for the sale screen, tabular numerals on all
money cells, logo/mark, app icon, splash, receipt branding, empty-state illustrations,
command palette (`cmdk` is installed but unused).

## 11. Open questions

- Does teal read as “info” next to success green in dense tables? (H4)
- Keep light as the launch default, or restore dark for evening counters?
- Is the five-color chart ramp enough for category-heavy reports?
- Native caption buttons are a static `#162623`; per-mode chrome would need a
  `win.setTitleBarOverlay()` IPC call on theme change.
