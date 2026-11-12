# NayaHisab Brand and Action System

Status: **production direction** (round 19: violet primary, Turbo commit/hero accent, violet
grid light, neutral-black dark). Palette history lives in `tasks/BRAND_EXPERIMENT.md`; the older
Creator OS board in `tasks/brand/brand-board.html` is historical.

## 1. Brand idea

**A cool ledger grid in light, a black worksurface in dark, with one violet primary and one
highlighter commit.**

Light mode keeps the grid surfaces: `#F8FAFC` canvas, white cards, deep indigo `#1E1B4B` ink
and slate secondary type. Dark mode keeps the earlier neutral black base: `#0F1013` canvas,
`#17181C` cards, `#1E1F24` popovers, `#0B0C0E` sidebar and `#F4F4F5` ink. Dark base surfaces and
fields stay neutral; only hover/selection surfaces get a low-chroma violet tint.

Two colours carry the action system:

- **Primary: original electric violet `#7C3AED`.** Default actions, brand badges and the logo
  tile. Violet fills take white labels. On light surfaces use `#7C3AED` for brand text and
  `#6D28D9` for focus rings and active nav markers. On dark surfaces use light violet `#A78BFA`
  for text, markers and rings; `#7C3AED` remains the fill colour.
- **Commit/hero accent: Turbo `#FACC15` (light) / `#F0E100` (dark).** Reserved for the action
  that closes a sale, invoice or payment, or the single commerce hero CTA on a dashboard. It
  takes deep indigo `#1E1B4B` in light and void `#0F1013` in dark. Turbo is a highlighter fill,
  not body text, not a background wash, and it has no ink border. It is not used for routine
  saves, micro actions or every CTA.

There is **no third action hue**. Secondary buttons stay neutral outline/filled surfaces.
Micro actions use violet or neutral. Lavender `#EDE9FE` is the light selection tint; dark
hover/selection uses a low-chroma violet `#272334`. The focus ring itself is violet, not the
selection fill.

**Type:** Plus Jakarta Sans (400–800, bundled via `@fontsource/plus-jakarta-sans`, so it works
offline). h1–h3 use -0.02em tracking. Money uses `tabular-nums`.

| Role | Light | Dark | Share |
| --- | --- | --- | --- |
| Canvas / surface | `#F8FAFC` / `#FFFFFF` | `#0F1013` / `#17181C` | ~70% |
| Sidebar / title strip | `#FFFFFF` | `#0B0C0E` | ~8% |
| Ink / slate | `#1E1B4B` / `#5B677A` | `#F4F4F5` / `#A1A1AA` | ~15% |
| Selection | lavender `#EDE9FE` | soft violet `#272334` | ~4% |
| Turbo (commit/hero fill) | `#FACC15` + indigo label | `#F0E100` + void label | ~1–2% |
| Violet (primary fill) | `#7C3AED` + white label | `#7C3AED` + white label | ~2–3% |
| Violet as text / marker | `#7C3AED`; focus `#6D28D9` | `#A78BFA` | marker |
| Fields | `#F1F5F9` fill, hover `#E2E8F0` | `#1F2025`, hover `#25272D` | — |
| Input edge | `#7C8BA1` | white 35% | 3:1 UI edge |
| Success / warning / danger | `#15803D` / `#B45309` / `#B91C1C` | `#4ADE80` / `#FDBA74` / `#F87171` | status only |

Status colours stay conventional: green success, amber warning, red destructive. Violet is a
brand/primary colour, never an error colour.

## 2. Logo: Ledger N

A geometric **N**: two white ledger strokes and a Turbo diagonal on an electric violet tile
(`#7C3AED`, `#FFFFFF`, `#F0E100`). The tile is a fixed asset, identical in both themes and in
the favicon. A `white/10` hairline separates it from dark chrome. The wordmark is **NayaHisab**
with a decorative violet full stop: `#7C3AED` in light mode and `#A78BFA` in dark.

Implemented in `src/renderer/components/brand/BrandMark.tsx`, `public/brand-icon.svg`, the
sidebar and the login screen. The login brand panel is blackish ink `#0F1013` with an
electric-violet `#7C3AED` glow, a Turbo `#F0E100` glow and a light-violet `#A78BFA` headline
accent.

## 3. Action hierarchy

| Role | Implementation | Appearance | Use |
| --- | --- | --- | --- |
| **Primary** | `Button` default | Electric violet `#7C3AED` + white label | Create Product, Add Customer, Login, Save Settings |
| **Commit/hero** | `variant="commit"` | Turbo + deep indigo/void label; no border | **One per screen**: Complete Sale, Create Invoice, Receive Payment; optional dashboard commerce hero |
| **Brand badge** | `Badge variant="brand"` | Electric violet + white label | Highlights, counts, "new" |
| **Secondary** | `variant="outline"` / `variant="secondary"` | Transparent border or neutral fill | Cancel, clear, add tag, row actions |
| **Ghost** | `variant="ghost"` | No fill until hover | Toolbar, dismiss, icons |
| **Destructive** | `variant="destructive"` | Red + white | Void, refund, delete |
| **Selected** | `--accent` | Lavender light / soft violet dark + violet marker | Active nav, rows, filters, view toggles |
| **Focus** | `--ring` | Deep violet `#6D28D9` light / light violet `#A78BFA` dark | All controls |

Rules:

1. **Violet is the primary; Turbo is the commit/hero accent.** Violet is the app-wide primary
   action colour. Turbo is a secondary brand accent reserved for transaction finalisation and
   the single commerce hero CTA.
2. **Turbo is not a general CTA colour.** Do not use it on routine saves, micro actions, or a
   button just because it is large or on a dashboard. If Turbo marks every CTA, it becomes the
   primary again.
3. **One solid action per screen.** If the action commits a transaction, it is Turbo; otherwise
   it is violet. If Save Draft and Complete Sale coexist, Save Draft is outline and Complete
   Sale is the only solid fill.
4. **Turbo fills take indigo/void labels; violet fills take white labels.** White on Turbo and
   indigo on violet both fail.
5. **Do not put an ink border on Turbo.** The dark label and existing shadow carry the button.
   If it looks too soft, deepen the fill or soften the shadow; do not add an outline.
6. **Violet text is `#7C3AED` on light and `#A78BFA` on dark.** Use `#6D28D9` for focus rings
   and active markers on light. `#7C3AED` is a fill on dark, not small text.
7. **Secondary is neutral, not a third hue.** Micro actions use violet or neutral; Turbo is
   reserved for commits and the one commerce hero.
8. **Keep the dark base blackish.** Cards, fields and sidebar backgrounds stay neutral; only
   hover/selection surfaces use the low-chroma violet tint.

## 4. Tokens

All in `src/renderer/index.css` (`:root` and `.dark`).

- `--primary` is electric violet `#7C3AED` in both modes; `--primary-foreground` is white;
  `--primary-hover` is `#6D28D9`. There is no `--primary-border`.
- `--commit` is Turbo: `#FACC15` light / `#F0E100` dark; `--commit-foreground` is deep
  indigo/void; `--commit-hover` is explicit. The commit button is borderless.
- `--brand` is the electric violet identity colour; `--brand-secondary` is the badge fill. Both
  violet fills use white labels.
- `--ring` and `--sidebar-primary` are `#6D28D9` light / `#A78BFA` dark.
- `--accent` is lavender light / soft violet `#272334` dark; `--sidebar-accent` is lavender
  light / soft violet `#211E2C` dark.
- `--field` and `--field-hover` are the soft cool field fills in light and neutral black fills
  in dark (`#1F2025` / `#25272D`).
- `--input` is `#7C8BA1` in light (3.5:1 on white) and white 35% in dark (3.2:1 on the card).
- Charts use violet, Turbo, slate/neutral, amber and indigo/off-white.
- shadcn's `--secondary` is a cool neutral surface in light and `#1F2025` in dark.
- `--primary-hover`, `--commit-hover` and the semantic surfaces are mapped in `@theme inline`.

Native window chrome follows `--sidebar` (`theme-context.tsx`): white light / `#0B0C0E` dark.
The defaults in `src/main/window.ts` and `index.html` match the light canvas/card.

## 5. Contrast audit

| Pair | Ratio | Verdict |
| --- | --- | --- |
| White on electric violet `#7C3AED` (primary/badge) | 5.7:1 | AA |
| Indigo `#1E1B4B` on Turbo `#FACC15` (light commit label) | 10.4:1 | AAA |
| Void `#0F1013` on Turbo `#F0E100` (dark commit label) | 14.0:1 | AAA |
| Violet `#7C3AED` on light canvas / white | 5.5 / 5.7:1 | AA |
| Violet `#7C3AED` on lavender `#EDE9FE` | 4.8:1 | AA |
| Deep violet `#6D28D9` on light canvas / white / lavender | 6.8 / 7.1 / 6.0:1 | AA |
| Light violet `#A78BFA` on dark canvas / card / field | 7.0 / 6.5 / 6.0:1 | AA |
| Ink `#1E1B4B` on light canvas / card | 15.3 / 16.0:1 | AAA |
| Off-white `#F4F4F5` on dark canvas / card | 17.3 / 16.1:1 | AAA |
| Slate `#5B677A` on canvas / field / field hover | 5.5 / 5.2 / 4.7:1 | AA |
| Muted `#A1A1AA` on dark canvas / card / field | 7.4 / 6.9 / 6.3:1 | AA |
| Off-white on dark hover/selection `#272334` | 13.9:1 | AAA |
| Input edge `#7C8BA1` on white / canvas | 3.5 / 3.3:1 | UI ≥3 |
| Dark input edge (white 35%) on card / canvas | 3.2 / 3.2:1 | UI ≥3 |
| Turbo against white / canvas | 1.5 / 1.5:1 | Fill only; label carries it |
| Login panel: white / `#A78BFA` on `#0F1013` | 19.0 / 7.0:1 | AAA |
| Turbo diagonal on the violet logo tile | 4.2:1 | Graphic |
| Success / warning / danger on their light surfaces | 4.6 / 4.5 / 5.3:1 | AA |
| Success / warning / danger on their dark surfaces | 7.7 / 8.2 / 5.8:1 | AA |
| White on destructive `#B91C1C` | 6.5:1 | AA |

Turbo is deliberately a highlighter fill: its 1.5:1 edge against white is not used as text or
as a standalone boundary. The dark label, button shadow and surrounding layout carry it.

## 6. References

- **Linear** — precision, density, quiet chrome.
- **Attio** — sharp data surfaces and compact hierarchy.
- **Toast / Square** — POS clarity: the checkout action is unmistakable.
- **Stripe** — cool neutral grids and confident violet accents.
- **Grid systems / ledger paper** — modular alignment, hairline structure, calm density.

The target is grid precision plus violet primary plus one highlighter commit.

## 7. Open production items

- Elevation tokens for cards and sticky checkout bars.
- Control density pass: 36/40px POS controls, tabular numerals for money.
- App packaging icon (the favicon is in place; the Windows executable icon needs a packaging
  pass), receipt lockup, and empty/loading/error states.
- Decide whether to add a self-hosted display face for the wordmark.
