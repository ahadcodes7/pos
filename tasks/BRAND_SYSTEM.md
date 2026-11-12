# NayaHisab Brand and Action System

Status: **production direction** (round 14: neutral base, violet primary, coral secondary).
Palette history lives in `tasks/BRAND_EXPERIMENT.md`. `tasks/brand/brand-board.html` still
shows the earlier Creator OS board.

## 1. Brand idea

**A calm black-and-white workspace with two loud brand colours.**

The base is neutral: white cards on a `#F6F6F7` canvas in light mode, near-black `#0F1013`
in dark mode, with ink and slate text. Two colours carry the brand:

- **Primary: electric violet `#7C3AED`.** Main actions, links, the active nav marker, focus
  rings, the logo tile. It's vivid, not blue, and can't be mistaken for a status colour.
- **Secondary: coral `#FF7A66`.** Badges and small "commit" actions (Complete Sale), plus the
  logo diagonal. Always a fill with an ink label; never used as text.

Violet (cool) and coral (warm) contrast without clashing. Keeping everything else neutral
lets them stand out.

**Type:** Plus Jakarta Sans (400–800, bundled via `@fontsource/plus-jakarta-sans`, so it
works offline). h1–h3 use -0.02em tracking. Money uses `tabular-nums`.

| Role | Light | Dark | Share |
| --- | --- | --- | --- |
| Canvas / surface | `#F6F6F7` / `#FFFFFF` | `#0F1013` / `#17181C` | ~70% |
| Sidebar / title strip | `#FFFFFF` | `#0B0C0E` | ~8% |
| Ink / slate | `#0F1013` / `#5E626B` | `#F4F4F5` / `#A1A1AA` | ~15% |
| Neutral selection | `#EDEEF0` | `#24262B` | ~4% |
| Violet (fill) | `#7C3AED` + white label | `#7C3AED` + white label | ~2% |
| Violet as text / marker / ring | deep `#6D28D9` | light `#A78BFA` | marker |
| Coral (fill) | `#FF7A66` + ink label | `#FF7A66` + ink label | ~1% |
| Fields | `#EEEEF0` fill, hover `#E6E6E9` | `#1F2025`, hover `#25272D` | — |

Status colours are green success (`#166534` / `#4ADE80`), yellow-amber warning and red
destructive, always shown as an icon or dot plus text. Coral is never a status colour: it
is a fill with an ink label, while errors are red text or white on red.

## 2. Logo: Ledger N

A geometric **N**: two white ledger strokes and a coral diagonal on an electric violet tile
(`#7C3AED`, `#FFFFFF`, `#FF7A66`). The tile is a fixed asset, identical in both themes and in
the favicon. A `white/10` hairline separates it from the dark sidebar. The wordmark is
**NayaHisab** with a decorative violet full stop.

Implemented in `src/renderer/components/brand/BrandMark.tsx`, `public/brand-icon.svg`,
the sidebar and the login screen. The login brand panel is ink `#0F1013` with a violet and
a coral glow.

## 3. Action hierarchy

| Role | Implementation | Appearance | Use |
| --- | --- | --- | --- |
| **Primary** | `Button` default | Violet `#7C3AED` + white, both modes | Save, Add, Login, Apply |
| **Commit** | `variant="commit"` | Coral `#FF7A66` + ink label, both modes | **One per screen**: Complete Sale, Create Invoice |
| **Brand badge** | `Badge variant="brand"` | Coral + ink label | Highlights, counts, "new" |
| **Secondary** | `variant="outline"` | Transparent with border | Cancel, alternatives |
| **Ghost** | `variant="ghost"` | No fill until hover | Toolbar, dismiss, icons |
| **Destructive** | `variant="destructive"` | Red `#B91C1C` + white | Void, refund, delete |
| **Selected** | `--accent` | Neutral grey wash + violet marker | Active nav, rows, filters |
| **Focus** | `--ring` | Deep violet `#6D28D9` light / `#A78BFA` dark | All controls |

Rules:

1. **Violet fills take white labels; coral fills take ink labels.** White on coral fails AA.
2. **For violet text, use `#6D28D9` on light surfaces and `#A78BFA` on dark ones.**
3. **Only one commit button per screen.**
4. **Coral never carries text,** so it is never confused with errors.

## 4. Tokens

All in `src/renderer/index.css` (`:root` and `.dark`).

- `--primary` and `--brand` are violet.
- `--brand-secondary`, `--brand-secondary-foreground` and `--brand-secondary-surface` are coral, new in round 14.
- `--commit` is coral.
- `--ring` and `--sidebar-primary` are deep violet (light) or light violet (dark).
- `--field` and `--field-hover` are the soft field fills used by `ui/field.ts`.
- Charts use violet, coral, slate, amber and ink.
- shadcn's `--secondary` stays a neutral surface.

Native window chrome follows `--sidebar` (`theme-context.tsx`). The defaults in
`src/main/window.ts` and `index.html` match the light canvas.

## 5. Contrast audit

| Pair | Ratio | Verdict |
| --- | --- | --- |
| White on violet `#7C3AED` (primary, both modes) | 5.7:1 | AA |
| Ink on coral `#FF7A66` (commit, badge) | 7.5:1 | AAA |
| Ink on coral hover `#FF8F7D` | 8.6:1 | AAA |
| Deep violet `#6D28D9` on selection / white / canvas | 6.1 / 7.1 / 6.6:1 | AA |
| Light violet `#A78BFA` on dark selection / sidebar accent / sidebar / card | 5.6 / 6.0 / 7.2 / 6.5:1 | AA |
| Violet button edge on light canvas / dark canvas | 5.3 / 3.3:1 | UI ≥3 |
| Slate on canvas / field / field hover | 5.7 / 5.3 / 4.9:1 | AA |
| Dark slate on field / field hover | 6.3 / 5.8:1 | AA |
| Input border on white | 3.3:1 | UI ≥3 |
| Login panel: white / `#A78BFA` / coral on ink | 19.0 / 7.0 / 7.5:1 | AA |
| White on red | 6.5:1 | AA |

## 6. References

- **Mercury** — cream/ink calm, financial trust.
- **Brex** — coral used with enterprise confidence, not consumer playfulness.
- **Linear** — precision, density, quiet chrome.
- **Attio** — sharp data surfaces and compact hierarchy.
- **Toast / Square** — POS clarity: the checkout action is unmistakable.
- **Stripe Press** — paper/ink editorial warmth.

The target is Mercury's calm plus Brex's coral confidence plus Linear's precision.

## 7. Open production items

- Elevation tokens for paper-on-cream (cards currently rely on hairlines).
- Control density pass: 36/40px POS controls, tabular numerals for money.
- App packaging icon (the favicon is in place; the Windows executable icon needs a
  packaging pass), receipt lockup, and empty/loading/error states.
- Decide whether to add a self-hosted display face for the wordmark.
