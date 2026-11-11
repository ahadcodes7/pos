# NayaHisab Brand and Action System

Status: **production direction** (Creator OS, round 7). The palette history lives in
`tasks/BRAND_EXPERIMENT.md`; the visual board lives in `tasks/brand/brand-board.html`.

## 1. Brand idea

**A calm ledger with one warm signal.**

NayaHisab should feel like a tool a shopkeeper trusts: warm paper, sharp ink, quiet
structure. The brand is not a color wash. Coral appears at the value moment and almost
nowhere else.

| Role | Light | Dark | Share |
| --- | --- | --- | --- |
| Canvas / paper | `#F7F3EA` / `#FFFDF8` | `#1C1F25` / `#23262D` | ~70% |
| Ink / slate | `#181A1F` / `#59606B` | `#F7F3EA` / `#A8AFBA` | ~20% |
| Butter selection | `#FFF3C9` | `#3A3320` | ~7% |
| Coral signal | `#FF7A66` | `#FF7A66` | ~3% |

Status stays conventional: green success, amber warning, deep red destructive. Status
should be shown as an icon plus text badge, not colored text alone.

## 2. Logo: Ledger N

The chosen mark is a geometric **N** built from two ledger strokes and a coral diagonal:

- Charcoal tile `#181A1F`, cream strokes `#F7F3EA`, coral diagonal `#FF7A66`.
- The tile is a fixed brand asset in both themes, so it matches the app icon. A
  `white/10` hairline keeps the tile visible on the charcoal sidebar.
- Wordmark: **NayaHisab** with a coral full stop. The dot is decorative (`aria-hidden`),
  so the accessible name stays "NayaHisab".
- UI type is Inter 600 with tight tracking. A display face (Instrument Sans or General
  Sans) is an optional later upgrade, not a dependency of this pass.

Implemented in:

- `src/renderer/components/brand/BrandMark.tsx` — `BrandMark`, `BrandWordmark`,
  `BrandLockup`
- `src/renderer/components/dashboard/Sidebar.tsx` — sidebar lockup
- `src/renderer/components/Login.tsx` — login lockup
- `public/brand-icon.svg` + `index.html` — favicon/app-icon source

The board also records two rejected routes for reference: **Receipt Check** (too close to
a generic receipt icon) and **Highlighter wordmark** (strong editorial voice, but it does
not survive a 16px icon). Both are in `tasks/brand/brand-board.html`.

## 3. Action hierarchy

One primary action, one commit action, everything else quiet.

| Role | Implementation | Appearance | Use |
| --- | --- | --- | --- |
| **Primary** | `Button` default | Charcoal/cream light; cream/charcoal dark | Save, Add, Apply — frequent, expected |
| **Commit** | `variant="commit"` | Coral fill, **ink** label, deeper coral inset border | **One per screen**: Complete Sale, Take Payment, Create Invoice |
| **Secondary** | `variant="outline"` | Paper/transparent with sand border | Cancel, alternative next to primary |
| **Ghost** | `variant="ghost"` | No fill until hover | Dismiss, toolbar, icon actions |
| **Destructive** | `variant="destructive"` | Deep red `#B42318` + white (light), `#C0392B` + cream (dark) | Void, refund, delete — **never coral** |
| **Selected** | `--accent` wash | Butter `#FFF3C9` light / `#3A3320` dark | Active navigation, selected rows, filters |
| **Focus** | `--ring` | Slate `#59606B` light / `#A8AFBA` dark | Commit uses a 2px ring + 2px offset |

Destructive has two tokens: `--destructive-solid` is the filled action (deep red in
both modes), while `--destructive` is the readable error text, border and ring color
(`#FF8A80` in dark, 7.2:1 on the dark canvas). This keeps the filled destructive button
away from coral without making dark-mode error text fail.

Rules:

1. **Only one commit button per screen.** If there are two “finish” actions, one is
   primary and the other is secondary.
2. **Coral always takes an ink label.** Ink on coral is 6.8:1. Cream and white on coral
   are 2.5:1 and 2.3:1 and fail. Do not use `text-white` on `bg-commit`.
3. **Light-mode coral needs its inset border.** Coral against paper is only ~2.5:1, so
   `--commit-border: #E85D4A` gives the button a ~3.4:1 edge. Dark mode uses a lighter
   coral edge.
4. **Destructive is red, not coral.** Coral reads as brand excitement; a failed payment or
   void must not.
5. **Butter is a state, not an action.** Never make a butter button; use it for selection.

## 4. Tokens added in this pass

In `src/renderer/index.css` (light and dark):

```css
--brand: #ff7a66;
--brand-foreground: #181a1f;
--commit: #ff7a66;
--commit-foreground: #181a1f;
--commit-border: #e85d4a;  /* dark: #ff9a8c */
--commit-hover: #f26a56;   /* dark: #ff8f7d */
--destructive: #b42318;    /* text/border/ring; dark: #ff8a80 */
--destructive-solid: #b42318; /* filled action; dark: #c0392b */
--destructive-foreground: #ffffff; /* dark: #f7f3ea */
```

Mapped through `@theme inline` as `brand`, `brand-foreground`, `commit`,
`commit-foreground`, `commit-border`, `commit-hover`, `destructive-solid`, and
`destructive-foreground`. The existing `--primary`, `--accent`, `--destructive`, and
`--ring` roles remain the semantic layer; no duplicate `--action-*` aliases are needed.

Commit is applied to the sale flow:

- `src/renderer/pages/dashboard/invoice/sale/CardView.tsx` — Complete
- `src/renderer/pages/dashboard/invoice/sale/TableView.tsx` — Create Invoice

Status badges use the `success`, `warning`, and `danger` variants of `Badge`. Each is a
dot plus a label, never colored text alone, on a tinted surface:

```css
--success-surface: #ecf7f1;   /* dark: #17352a */
--warning-surface: #fff4d6;   /* dark: #3a2e18 */
--destructive-surface: #fdecea; /* dark: #3a1e1b */
```

`getStockStatus` in `sale-data.ts` returns a variant, and the sale product grid renders
the badge. The dot inherits `currentColor`, so the status color is carried by the label,
border and dot together.

## 5. Contrast audit

| Pair | Ratio | Verdict |
| --- | --- | --- |
| Ink `#181A1F` on coral `#FF7A66` | 6.8:1 | AA for all text — use for commit labels |
| Cream `#F7F3EA` on coral | 2.5:1 | Fail — never |
| White on coral | 2.3:1 | Fail — never |
| Coral on dark canvas `#1C1F25` | 6.5:1 | AA — coral edge is visible |
| Coral on paper `#FFFDF8` | 2.5:1 | Decorative only; add inset border |
| Charcoal on cream | 15.7:1 | AAA |
| Cream on charcoal | 14.9:1 | AAA |
| Slate `#59606B` on paper | 5.8:1 | AA |
| Dark muted `#A8AFBA` on dark card | 7.5:1 | AAA |
| Dark error text `#FF8A80` on canvas | 7.2:1 | AAA |
| Deep destructive `#C0392B` + cream | 4.9:1 | AA |
| Status badge labels (light, 3 pairs) | 4.6–5.8:1 | AA |
| Status badge labels (dark, 3 pairs) | 6.7–7.9:1 | AA |

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
