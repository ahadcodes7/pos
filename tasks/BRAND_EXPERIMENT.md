# Brand Direction Experiment

Status: **midnight-dominant**, single brand theme with light + dark modes. Round 3 accent:
neon teal (replaces lime). Layout variants pending the three reference designs.

## 1. Decision

Drop multi-theme. One brand theme built on a 60/30/10 split:

- **60%** midnight `#0B0B0C` — chrome, type, structure.
- **30%** pure white `#FFFFFF` — canvas and cards (light) / type (dark).
- **10%** neon teal `#00D7CE` — every primary action, active navigation, selection.

Teal is the brand signal, not a rare accent: it is the fill for primary buttons, the active nav
marker and the selected-state tint. Status colors (emerald / amber / red) stay conventional.

Why:

- `src/renderer/index.css` had 6 themes × 2 modes = 12 hand-duplicated token blocks (~490 lines)
  where only the accent hue changed.
- `--sidebar` was aliased to `--card` in every theme, so there was no structural layer at all.
- The theme picker in `pages/dashboard/Settings.jsx` made the product read as six products.

## 2. Palette

Anchor hexes are for reference; the implementation is OKLCH in `src/renderer/index.css`.

| Role | Light | Dark | Notes |
| --- | --- | --- | --- |
| Chrome (sidebar) | `#0B0B0C` | `#000000` | the 60% layer |
| Canvas | `#FFFFFF` | `#0B0B0C` | light mode is the 30% white surface |
| Surface (cards/popovers) | `#FFFFFF` | `#151517` / `#1A1A1D` | border + shadow separate cards on white |
| Text | `#0B0B0C` | `#FFFFFF` | 19.7:1 both ways |
| Muted text | `#6B6B70` | `#A1A1A8` | 5.3 / 7.7 |
| Primary action | neon teal `#00D7CE` + midnight label | identical | white on teal is 3.8:1 |
| Selected / hover | teal wash `#DBFAF7` + midnight text | `#0B2F2E` + `#C8FCF5` | 17.8 / 12.0 |
| Destructive | `#C62828` + white label | `#DC2626` + white label | dialogs / icons |
| Warning | `#F59E0B` + midnight label | identical | filled badge |
| Success / paid | `#2E7D32` + white label | `#4ADE80` + midnight label | status only |
| Focus ring | midnight | white (teal on sidebar) | visible on the teal fill |

Hard rules:

1. **Never white text on teal** (3.8:1). Teal always carries midnight.
2. **Never teal as text on white** (1.8:1). Teal text only belongs on chrome.
3. In light mode a teal button on white has a 1.8:1 fill boundary; the midnight label plus
   `shadow` identifies it. If that ever tests badly, add a 1px midnight border to primary buttons.

## 3. Token architecture

Three layers, shadcn variable names preserved so components need no edits:

1. **Base** — canvas, ink, surfaces, lines, charts, sidebar.
2. **Brand** — `--primary`, `--primary-foreground`, `--accent`, `--ring`, `--sidebar-primary`;
   the only values that change when a new design direction is adopted.
3. **Semantics** — `--destructive`, `--success`, `--warning` and the Tailwind `@theme inline`
   mappings.

Mode contract: `<html class="dark">` + `data-mode="light|dark"`. One `:root` block and one
`.dark` block replace the 12 class blocks.

**Swap procedure:** when a new direction is chosen, edit only the commented brand block in
`index.css` (`--primary`, `--accent`, `--ring`, `--sidebar*`). No components change.

Density and radius are **not** in this pass (phase 2).

## 4. Known bugs this refactor fixes

1. `@custom-variant dark (&:is(.dark *))` never matched, because the provider added classes like
   `main-dark`, never `.dark`. All `dark:` utilities (including `ThemeToggle`'s icon animation)
   were dead.
2. `ui/sonner.jsx` used `useTheme` from `next-themes` while the app uses its own provider, so
   toasts never followed the app theme.
3. `text-success`, `text-warning` and `text-destructive-foreground` had no `@theme` mapping, so
   those utilities did not generate CSS at all.
4. `.active-item` in the base layer used `--secondary`/`--muted` (light colors) inside the sidebar.
5. Sidebar collapsed state painted white blocks on dark chrome.
6. Switch thumb was white on the accent track (1.28:1); it now uses the primary foreground.

## 5. Hypotheses

| # | Hypothesis | Measure |
| --- | --- | --- |
| H1 | Midnight chrome + neon teal actions is recognizable as NayaHisab | 5-second test, ≥4/5 |
| H2 | High-contrast dark UI does not slow the sale flow | task time within 5% of baseline |
| H3 | All pairs pass WCAG AA | 4.5:1 text, 3:1 boundaries/focus |
| H4 | Teal primary is not confused with success/paid green | 0 first-click errors |
| H5 | Operators prefer it over the previous theme | ≥3/5 preference |

If H4 fails, move success to teal and keep the green family out of status colors.

## 6. Variants

Three reference designs are pending. Each will be expressed as a replacement of the brand block
(values only) if the differences are chromatic, or as an extra style layer (`--radius`, spacing,
type scale) if they change shape and density.

| Slot | Canvas | Chrome | Primary action | Intent |
| --- | --- | --- | --- | --- |
| **A (shipped)** | white / midnight | midnight | neon teal | 60/30/10, teal promoted to actions |
| B | TBD from reference | TBD | TBD | |
| C | TBD from reference | TBD | TBD | |

Dark mode is the literal 60% midnight version and is the default; light mode keeps the white
canvas with the same midnight chrome and teal actions.

## 7. Test protocol

Screens: Login, Dashboard, Sale invoice, Product list, Receipt.

Methods:

- 5-second recall: show screenshot, ask "what product is this?".
- Desaturation test: grayscale screenshot, can you still identify it?
- First-click test: "start a new sale", "complete this sale", "delete this line".
- Task timing: create a sale, add 3 items, apply discount, take payment.
- Subjective 5-point: calm / trustworthy / premium / energetic.
- Contrast audit in DevTools for every text and interactive boundary pair.

Participants: author + 2–4 operators if available. Screenshots stored under `tasks/brand/<variant>/`.

## 8. Success and kill criteria

Ship when: AA passes in light and dark, no task slowdown, ≥3/5 preference, zero teal/red
confusion.

Iterate when: any contrast failure, teal/success confusion, or the dark canvas becomes tiring
after 10 minutes of use.

## 9. Implementation checklist

- [x] `src/renderer/index.css`: replace 12 theme blocks with `:root` + `.dark`; add missing
      `@theme inline` color mappings; retarget `.active-item` at sidebar tokens.
- [x] `src/renderer/context/theme-context.jsx`: drop `themes`, keep `modes`, write `dark` class.
- [x] `src/renderer/App.jsx`: remove `defaultTheme` prop; default to dark.
- [x] `src/renderer/pages/dashboard/Settings.jsx`: remove the color theme card.
- [x] `src/renderer/components/ui/sonner.jsx`: use the app theme context.
- [x] Midnight/white/teal palette applied; teal promoted to `--primary`.
- [x] Accent text removed from light surfaces (Navbar avatar, links, money, selection).
- [ ] Add the three reference designs as brand-block variants.
- [ ] Verify build and screenshot every screen in light + dark.

### Measured contrast

Computed from the shipped OKLCH tokens with the WCAG relative-luminance formula:

| Pair | Light | Dark |
| --- | --- | --- |
| foreground / background | 19.7 | 19.7 |
| muted foreground / background | 5.3 | 7.7 |
| primary foreground / primary | 10.8 | 10.8 |
| destructive foreground / destructive | 5.6 | 4.8 |
| success / background | 5.1 | 11.3 |
| sidebar foreground / sidebar | 19.7 | 21.0 |
| sidebar primary / sidebar | 10.8 | 10.8 |
| input border / card | 3.4 | 3.8 |
| primary boundary vs canvas | 1.82 | 10.8 |

The last row is the known trade-off in light mode: teal is a fill color, so the button is
identified by its midnight label and shadow.

## 10. Out of scope (next phase)

Density (32/40px rows, compact mode), touch mode for the sale screen, tabular numerals on all
money cells, logo/mark, app icon, splash, receipt branding, empty-state illustrations,
command palette (`cmdk` is installed but unused).

## 11. Open questions

- Neon teal vs the exact original main-theme teal `oklch(0.55 0.22 200)` (deeper, #0091A3) vs
  a true neon green (`#8EFF2D`)? One-line swap in the brand block.
- Keep dark as the default, or switch to light for daylight counters?
- Is the printed receipt part of the brand experiment or a separate ticket?
- Do the three reference designs change layout/typography, or only color?
