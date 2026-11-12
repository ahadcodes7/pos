# Brand Direction Experiment

Status: **Round 19 action and palette history.** The production action and logo system is in
`tasks/BRAND_SYSTEM.md`. Violet primary with a Turbo commit/hero accent is current. Round 18's
Turbo-primary action mapping is historical. Round 6 below remains history.

Round 19 (current, see `BRAND_SYSTEM.md`): **Violet primary + Turbo commit**. The round 18
palette is unchanged; the action roles are inverted. Electric violet `#7C3AED` is now the
app-wide primary action (Create Product, Add Customer, Save Settings, Login) with white labels
and `#6D28D9` hover. Turbo `#FACC15` light / `#F0E100` dark is reserved for commit/hero actions
(Complete Sale, Create Invoice, Receive Payment, one dashboard commerce CTA) with deep indigo/
void labels and no border. Secondary buttons stay neutral outline/fill; micro actions use
violet or neutral. Round 18's soft violet hover/selection and neutral-black dark base remain.
There is no third action hue.

Round 18 (historical): **Violet grid + neutral black dark**. Light kept the round 17 grid:
`#F8FAFC` canvas, white cards, Turbo `#FACC15` primary, lavender `#EDE9FE` selection. The violet
returned to the original electric `#7C3AED` for brand, commit, badge and logo, with `#6D28D9`
focus rings and active markers. Dark returned to the earlier blackish base: `#0F1013` canvas,
`#17181C` cards, `#1E1F24` popovers, `#0B0C0E` sidebar, `#1F2025` fields, soft violet `#272334`
hover/selection and `#A1A1AA` muted text. Turbo in dark returned to the earlier `#F0E100` with a
`#0F1013` label. Violet stayed an accent in dark: `#A78BFA` text/markers/rings and `#7C3AED`
fills. No violet-tinted cards or fields; only the hover/selection surfaces got the low-chroma
tint.

Round 17 (historical): **Violet grid**. Cool canvas `#F8FAFC` / white cards and violet-black
`#0F0A1F` / `#1A1230` dark surfaces. Turbo `#FACC15` light / `#FDE047` dark, with indigo / void
labels and no ink border. Royal violet `#5B21B6` light / `#7C3AED` dark, light violet `#A78BFA`
markers; lavender `#EDE9FE` / deep violet `#2E1065` selection. The separate secondary brand
colour was removed; secondary buttons stayed outline/neutral.

Round 16 (historical): **Creator OS + Turbo + petrol teal**. The Creator OS cream/paper base
returned with bright Turbo `#F0E100` as the primary action (ink label and ink edge on light
surfaces). Deep petrol teal `#0F4C5C` replaced violet as brand, focus and active marker, and
replaced coral as the commit colour; teal fills took cream labels. Dark mode kept its
near-black base and used light teal `#5EEAD4` for markers and rings.

Round 14 (historical): **Neutral + violet/coral**. The tonal teal base was rejected in
favour of the earlier neutral white/black base (`#F6F6F7` / `#0F1013`). The dashboard had two
brand colours: electric violet `#7C3AED` as primary and coral `#FF7A66` as secondary for
badges and the commit action.

Round 13: **Tonal teal**. The canvas, sidebar, borders,
selection and ink are tinted toward the teal accent, and Inter is replaced by Plus Jakarta
Sans. Inspired by a reference UI that used one hue across every layer.

Round 12: **Teal**. This restores the original "Main" theme
colour, `oklch(0.55 0.22 200)` ≈ `#0091A3`, deepened to `#007F8F` in light mode for AA
with white labels; dark mode uses `#00A2AF`. The neutral base is unchanged. Mint,
tangerine and Volt accents were rejected.

Round 11: **Mint** `#3DDC97` on the same neutral base.
Tangerine did not land either.

Round 10: **Tangerine** `#FF5C1A` on the Volt neutral
base. The base was kept, but the lime accent did not click.

Round 9: **Volt**. Ultramarine (round 8) was rejected
as boring and not distinctive, and the cream base as too yellow next to accents. The base
is now neutral (`#F6F6F7` / `#0F1013`) with lime `#C6F432` as the one accent. The
sections below record round 6 (Creator OS) for history.

## 1. Decision

The lavender round was rejected: too much brand color across chrome, hovers and status
surfaces. Creator OS is a **neutral workspace with two small accents**:

- **Mostly neutral:** cream canvas, paper surfaces, charcoal ink, slate secondary text.
- **Monochrome actions:** charcoal primary in light, cream primary in dark.
- **Butter** `#FFE39A` is a tint source for selection only. It is never body text or a light
  chart fill.
- **Coral** `#FF7A66` is reserved for attention badges and chart series. It is not the
  destructive color (2.4:1 on paper fails as text and it reads like an error everywhere).

Roles:

1. **Canvas** `#F7F3EA` warm cream.
2. **Surfaces** `#FFFDF8` paper cards, sidebar, title strip.
3. **Ink** `#181A1F` charcoal.
4. **Muted** `#59606B` slate.
5. **Brand action** `#181A1F` in light, `#F7F3EA` in dark.
6. **Status** conventional green / amber / red.

Why this direction:

- A POS/ERP should read as a tool, not a campaign. Neutral surfaces keep tables and money calm.
- Charcoal buttons look deliberate and avoid the “every button is the brand color” effect.
- Butter gives one warm, unmistakable selected state without turning navigation yellow everywhere.
- Coral is warm but cannot carry text, so it stays a chart/attention signal.
- The light sidebar is paper, not dark, so the chrome no longer dominates the content.

## 2. Palette

Implementation lives in `src/renderer/index.css`. Hex is the source of truth.

| Role                  | Light                                                 | Dark                                                  | Notes                                |
| --------------------- | ----------------------------------------------------- | ----------------------------------------------------- | ------------------------------------ |
| Canvas                | `#F7F3EA`                                             | `#1C1F25`                                             | warm cream / charcoal                |
| Surface (cards)       | `#FFFDF8`                                             | `#23262D`                                             | popovers one step lighter: `#282C34` |
| Ink                   | `#181A1F`                                             | `#F7F3EA`                                             | 15.7 / 14.9                          |
| Muted text            | `#59606B`                                             | `#A8AFBA`                                             | 5.8 / 7.5                            |
| Primary action        | `#181A1F`                                             | `#F7F3EA`                                             | label cream / charcoal, both 15.7    |
| Active / selected     | `#FFF3C9`                                             | `#3A3320`                                             | butter wash                          |
| Secondary surface     | `#EDE7DB`                                             | `#2A2E36`                                             | secondary buttons, chips             |
| Muted surface         | `#F1ECE2`                                             | `#242830`                                             | table headers, skeletons             |
| Border                | `#E2DCCF`                                             | `rgb(247 243 234 / 12%)`                              | decorative hairlines                 |
| Input border          | `#93897A`                                             | `rgb(247 243 234 / 24%)`                              | 3.3:1 on paper                       |
| Focus ring            | `#59606B`                                             | `#A8AFBA`                                             |                                      |
| Sidebar / title strip | `#FFFDF8`                                             | `#181A1F`                                             | changed per mode                     |
| Sidebar primary       | `#181A1F`                                             | `#FFE39A`                                             | logo tile, active submenu, marker    |
| Butter                | `#FFE39A`                                             | `#FFE39A`                                             | tint and dark chart only             |
| Coral                 | `#FF7A66`                                             | `#FF7A66`                                             | attention badges, charts             |
| Destructive           | `#B42318`                                             | `#FF8A80`                                             | white / charcoal label               |
| Success               | `#2F7D5A`                                             | `#74D3A6`                                             | white / charcoal label               |
| Warning               | `#8A5A00`                                             | `#F2C063`                                             | darkened for text contrast           |
| Charts                | `#181A1F`, `#59606B`, `#D9A72E`, `#FF7A66`, `#2F7D5A` | `#F7F3EA`, `#A8AFBA`, `#FFE39A`, `#FF7A66`, `#74D3A6` | neutral + warm signals               |

Hard rules:

1. **Primary is monochrome.** Do not make primary buttons yellow or coral.
2. **Butter is a surface tint.** Ink on butter only; never butter text on paper.
3. **Coral never carries text.** Use it as a fill with ink/charcoal labels or as a chart series.
4. **Status stays conventional.** Warning is a dark amber in light mode so it passes AA.
5. **Chrome follows the mode.** Paper strip in light, charcoal in dark.

## 3. Token architecture

Three layers, shadcn variable names preserved so components need no edits:

1. **Base** — canvas, ink, surfaces, lines, charts, sidebar.
2. **Brand** — `--primary`, `--primary-foreground`, `--accent`, `--ring`, `--sidebar-primary`.
3. **Semantics** — `--destructive`, `--success`, `--warning` plus the Tailwind `@theme inline`
   mappings.

Mode contract: `<html class="dark">` + `data-mode="light|dark"`, storage key
`pos-ui-theme-v5`. Pre-paint in `index.html` defaults to light.

**Chrome sync:** the 36px title strip and sidebar share `--sidebar`. `ThemeProvider` reads
`--sidebar` / `--sidebar-foreground` after each mode change and calls the `chrome:set` IPC
route, which runs `win.setTitleBarOverlay({ color, symbolColor, height: 36 })` on Windows.
The static `titleBarOverlay` in `src/main/window.ts` matches the light default.

**Swap procedure:** edit only `:root` and `.dark` in `src/renderer/index.css`. The overlay
follows automatically; only the initial `window.ts` and `<meta name="theme-color">` values
need a manual update if the light chrome changes. No components change.

Density and radius are **not** in this pass (phase 2).

## 4. Fixed by the earlier refactor

1. `@custom-variant dark` matches `.dark` (the provider writes it; `ThemeToggle` icons work).
2. `ui/sonner.tsx` uses the app theme context, not `next-themes`.
3. `text-success`, `text-warning` and `text-destructive-foreground` have `@theme` mappings.
4. `.active-item` uses sidebar tokens, not content tokens.
5. Sidebar collapsed state no longer paints white blocks on dark chrome.
6. Switch thumb uses the primary foreground.
7. MenuBar hover/border use sidebar tokens, so they work on the paper strip.

## 5. Hypotheses

| #   | Hypothesis                                                   | Measure                           |
| --- | ------------------------------------------------------------ | --------------------------------- |
| H1  | Neutral cream/charcoal reads as a professional ERP           | 5-second test, ≥4/5               |
| H2  | Monochrome actions reduce visual noise vs the lavender round | preference ≥4/5                   |
| H3  | All text pairs pass WCAG AA                                  | 4.5:1 text, 3:1 fields/focus      |
| H4  | Butter selection is noticeable without being loud            | users find the active page in <2s |
| H5  | Coral is read as attention, not as an error                  | 0 destructive/coral mix-ups       |

If H4 fails, shift `--accent` and `--sidebar-accent` to the neutral sand `#EDE7DB` and keep
butter only in charts/highlights. If H5 fails, remove coral from charts and keep it only in
notification dots.

## 6. Variants

| Slot            | Canvas             | Chrome                           | Primary action   | Intent                  |
| --------------- | ------------------ | -------------------------------- | ---------------- | ----------------------- |
| **A (shipped)** | cream `#F7F3EA`    | paper (light) / `#181A1F` (dark) | charcoal / cream | neutral Creator OS tool |
| B               | TBD from reference | TBD                              | TBD              |                         |
| C               | TBD from reference | TBD                              | TBD              |                         |

Dark mode is the same palette inverted: charcoal canvas, cream type, cream actions, butter
chrome accents. Light remains the default for daylight counters.

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

Ship when: AA passes in light and dark, no task slowdown, ≥3/5 preference, no butter/coral
noise complaint.

Iterate when: any contrast failure, the active state is missed, or coral reads as an error.
The first fallback is the neutral sand accent (`#EDE7DB`); the second is butter-only charts.

## 9. Implementation checklist

- [x] `src/renderer/index.css`: Creator OS light + charcoal dark companion.
- [x] `src/main/window.ts`: initial overlay paper/ink, background `#F7F3EA`.
- [x] `index.html`: `theme-color` → `#F7F3EA`; pre-paint key → `pos-ui-theme-v5`, default light.
- [x] `src/renderer/App.tsx`: `defaultMode="light"`, `storageKey="pos-ui-theme-v5"`.
- [x] `chrome:set` route + `ThemeProvider` sync for per-mode caption buttons.
- [x] `MenuBar` hover/border use sidebar tokens (works on a paper strip).
- [x] Status colors re-anchored: `#2F7D5A` / `#8A5A00` / `#B42318` (light).
- [ ] Verify every screen in light + dark and screenshot both.
- [ ] Decide whether light stays the launch default.
- [ ] Add the pending reference designs as brand-block variants.

### Measured contrast

Computed with the WCAG relative-luminance formula.

| Pair                          | Light | Dark |
| ----------------------------- | ----- | ---- |
| foreground / background       | 15.7  | 14.9 |
| muted foreground / background | 5.8   | 7.5  |
| primary / background          | 15.7  | 14.9 |
| primary foreground / primary  | 15.7  | 15.7 |
| destructive / background      | 6.6   | 7.2  |
| success / background          | 4.9   | 9.1  |
| warning / background          | 5.8   | 9.5  |
| sidebar foreground / sidebar  | 16.2  | 15.7 |
| sidebar primary / sidebar     | 16.2  | 13.8 |
| ink on butter                 | 13.8  | 13.8 |
| input border / paper          | 3.3   | —    |

Coral on paper is 2.4:1 and butter on paper is 1.1:1, which is why neither is used for text
or light chart fills.

## 10. Out of scope (next phase)

Density (32/40px rows, compact mode), touch mode for the sale screen, tabular numerals on all
money cells, logo/mark, app icon, splash, receipt branding, empty-state illustrations,
command palette (`cmdk` is installed but unused).

## 11. Open questions

- Does the paper sidebar separate enough from white cards, or should it be cream `#F7F3EA`?
- Is the butter selection strong enough in daylight, or should it be `#FFE9B0`?
- Keep light as the launch default, or restore dark for evening counters?
- Is coral needed outside charts, or does the monochrome palette already have enough signal?

## Font Selection (later)

- Product Font (95% of the UI) - Inter for now (If found a better one we will replace)
- Money/Receipts/Codes - Jetbrains Mono
- Brand font (very less usage on login or static brand pages like home dashboard etc.) - Bricolage Grotesque
