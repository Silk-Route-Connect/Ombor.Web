# Design tokens — Ombor

**Status:** token sheet — a readable mirror of `src/theme/`, which is the **single source** (there is no `tokens.css`; the Design-project tokens were folded into the theme). When the two disagree, the theme wins and this sheet is corrected in the same change.
**Last updated:** 2026-10-03 (visual-design pass: contrast-checked text / chip / control tokens, one neutral ramp, type scale, focus ring, dialog sizes)

Contrast figures are WCAG ratios on white unless stated. Text needs 4.5:1 (all app text is below the 18px/24px "large" threshold except page titles); control edges and focus indicators need 3:1.

## Where things live

| File | Holds |
| --- | --- |
| `src/theme/palette.ts` | core hues, on-tint text shades, the neutral ramp, `designTokens` (tints, overlays, semantic aliases) |
| `src/theme/chipTokens.ts` | every chip colour (`chipTokens`), keyed by meaning |
| `src/theme/typography.ts` | the type scale (all MUI variants defined) |
| `src/theme/tokens.ts` | `radius`, `controlSize`, `dialogWidth` + `dialogPaperSx`, `typeScale` (numeric), `numericSx` |
| `src/theme/components.ts` | MUI overrides: focus ring, input borders, tooltip, dialog paper, button / table / input sizing |
| `src/theme/index.ts` | `createTheme` (palette slots, shadows) + re-exports — import everything `from "theme"` |

## Core colours

| Token | Value | Use |
| --- | --- | --- |
| primary (Bukhara teal) | `#12676B` | brand, links, primary buttons, selected states (6.6:1) |
| primary.dark | `#0D5256` | hover / pressed |
| primary.light (`primarySoft`) | `#E1EEEE` | selected row, active nav, Sale chip fill |
| `primaryLine` | `#C3DEDE` | hairline on teal tints |
| secondary (saffron) | `#D88A1E` | accent fills and icons only — never small text; text on it is ink (5.6:1) |
| secondary.dark (`saffron700`) | `#8F5A0C` | saffron text, filled warning/accent button with white text (5.8:1) |
| `saffron600` / `saffron100` / `accentSoft` | `#B5710F` / `#F6DEAE` / `#FBF0DC` | archive action icon / Supply chip border / Supply chip fill |
| success | `#17835A` (dark `#1C5C40`) | money in, positive figures (4.7:1) |
| warning | `#C57E14` (dark `#8A5A0E`) | icons and fills only (3.3:1); amber **text** uses warning.dark |
| error | `#C53D31` (dark `#8F2A1F`) | money out, overdue, destructive (5.1:1) |
| info | `#2A6F97` (dark `#245F82`) | informational (Open status, Deposit, Bank) |
| ink (`fg1`, text.primary) | `#1C2625` | primary text |
| `logoKeystone` | `#B8860B` | the monogram keystone only |

`palette.<family>.dark` is the on-tint text shade of each family: success `#1C5C40` (6.9:1 on its tint), error `#8F2A1F` (7.2:1), warning `#8A5A0E` (5.2:1), info `#245F82` (6.0:1). Also exposed as `designTokens.successFg / dangerFg / warningFg / infoFg`.

## Neutral ramp (one ramp)

`designTokens.grayN` and MUI `palette.grey[N]` resolve from the same `NEUTRAL` constant — a step name always means the same colour. Surfaces and borders are warm stone; text steps are the cool ink family.

| Step | Value | Alias | Use |
| --- | --- | --- | --- |
| 0 | `#FFFFFF` | — | surface (background.paper) |
| 25 | `#FAF8F4` | `bgSubtle` | zebra rows, table header/footer band, subtle fill (designTokens only — MUI grey has no 25) |
| 50 | `#F4F1EA` | `bgCanvas` | page canvas (background.default) |
| 100 | `#ECE8DF` | — | dividers inside panes, sunken fills, neutral chip fill, segmented-control track |
| 200 | `#E4DFD5` | `border` | card / table hairlines (palette.divider) — decorative only |
| 300 | `#D4CDBF` | `borderStrong` | ghost-button outline, dividers on tints — decorative only |
| 400 | `#B8AF9F` | `decoration` | icons, dots, chart reference lines. **Never text** (2.2:1) |
| 500 | `#6B7473` | `fg3` | tertiary / meta / placeholder text — `text.disabled` (4.8:1; 4.5:1 on bgSubtle; on the canvas use fg2) |
| 600 | `#565F5E` | `fg2` | secondary data text — `text.secondary` (6.4:1) |
| 700 | `#3E4A4A` | — | strong secondary text, neutral chip text |
| 800 | `#28302F` | — | — |
| 900 | `#1C2625` | `fg1` | ink |
| — | `#8C8576` | `borderControl` | input / select / control outline (3.7:1, WCAG 1.4.11) |

Buttons are never disabled in this app (hard rule 5), so `text.disabled` doubles as the AA-safe tertiary tone.

## Semantic tints

| Family | Fill | Border | Text |
| --- | --- | --- | --- |
| success | `successBg #E5F2EC` | `successBorder #C2E0D2` | `#1C5C40` |
| danger | `errorBg #FBEAE8` | `errorBorder #EFC9C4` | `#8F2A1F` |
| warning | `warningBg #FBF0DC` | `warningBorder #EDD3A4` | `#8A5A0E` |
| info | `infoBg #E7F0F6` | `infoBorder #C5DBEA` | `#245F82` |
| teal | `primarySoft #E1EEEE` | `primaryLine #C3DEDE` | `#12676B` |
| saffron | `accentSoft #FBF0DC` | `saffron100 #F6DEAE` | `#8F5A0C` |
| purple (payroll) | `purpleBg #ECE7F7` | `purpleBorder #D6CBEE` | `purpleText #6A4BB0` |
| neutral | gray100 `#ECE8DF` | gray300 `#D4CDBF` | gray700 `#3E4A4A` |

Overlays (`designTokens`): `onDarkMuted` rgba(255,255,255,.82) secondary text on teal/ink · `onDarkLine` .14 hairline · `onDarkFill` .13 chip fill on teal · `onDarkGrid` .10 brand-panel grid · `scrim` rgba(255,255,255,.72) frosted auth card · `primaryWash` rgba(18,103,107,.05) chart hover · `loadingVeil` rgba(244,241,234,.55) reload veil. `palette.action.hover` rgba(18,103,107,.04).

## Chip tokens (`chipTokens`)

Rendered only through the shared `StatusPill`. Keys by meaning: `sale` / `supply` (teal / saffron soft), `saleRefund` / `supplyRefund` (outlined), `open` (info), `partiallyPaid` (warning), `overdue` (danger), `closed` (success), `income` (success), `expense` (danger), `stockIn` (info), `stockOut` (warning), plus the families `neutral`, `teal`, `saffron`, `info`, `warning`, `success`, `danger`, `dangerOutline`, `purple`. Semantics: ../Ombor.Docs/ui-patterns.md → Chip colour semantics.

## Typography (Onest 400 / 500 / 600 / 700 — 800 is not loaded)

| Variant | Size / line | Weight | Use |
| --- | --- | --- | --- |
| h1 | 26 / 32, −0.02em | 700 | page and detail titles |
| h2 | 20 / 28, −0.02em | 600 | section headings |
| h3 (= h5) | 16 / 22 | 600 | card titles |
| h4 (= h6) | 18 / 24, −0.01em | 700 | dialog titles (MUI `DialogTitle` renders h6) |
| subtitle1 | 14 / 20 | 600 | emphasised body |
| subtitle2 | 13 / 18 | 600 | emphasised small |
| body1 | 14 / 20 | 400 | body, table cells |
| body2 (bodySm) | 13 / 18 | 400 | secondary lines, captions under titles |
| caption | 12 / 16 | 400 | meta, chips, table headers |
| overline | 11 / 16, +0.08em, uppercase | 700 | group labels |

Numeric steps (`typeScale`, tabular lining figures): `display` 34/40 700 · `numHero` 32 700 · `numStrong` 26 700 (KPI values) · `numTable` 15 600 (headline money cell). Apply `numericSx` (tabular-nums lining-nums) to every money / quantity / tabular value.

## Shape, spacing, sizing

- Radius (`radius`): xs 4 · sm 6 · md 8 (default — buttons, inputs, menus) · lg 12 (cards, dialogs) · xl 16 (data-table container) · pill 999 (chips).
- Spacing: MUI 8px unit (`theme.spacing`); prefer multiples of 4px.
- Control height (`controlSize`): md 38px (buttons, inputs, selects, search, segmented) · sm 31px (dense inline only).
- Dialog widths (`dialogWidth`): sm 480 · md 640 · lg 880; `dialogPaperSx(size)` adds `maxWidth: calc(100% − 32px)`.
- Table: 52px rows, 16px cell padding, body 14px, header 12px/600; detail-embedded tables 48px / 18px.
- Layout: sidebar 248px expanded / 72px rail (auto-collapsed below 1280px viewport and on POS pages) · topbar 60px · page padding 24px.

## Elevation

`shadows[1]` cards `0 1px 2px rgba(22,42,43,.05), 0 1px 3px rgba(22,42,43,.06)` · `shadows[8]` menus / popovers / flyouts `0 2px 6px rgba(22,42,43,.06), 0 6px 16px rgba(22,42,43,.06)` · `shadows[16]` / `[24]` modals and floating cards `0 10px 24px rgba(22,42,43,.10), 0 24px 60px rgba(22,42,43,.12)`.

## Focus and interaction

- One keyboard-focus indicator: 2px teal (`#12676B`) outline, 2px offset (6.6:1) on every `ButtonBase` (`.Mui-focusVisible`); inset (−2px) on menu items, list buttons and tabs; inputs show their 2px primary border. Non-ButtonBase elements with `role="button|tab|radio|link"` or `tabIndex=0` get the same ring through a global `:focus-visible` rule.
- Inputs: outline `borderControl` → ink on hover → 2px primary when focused → error.main on error. Placeholder `fg3`.
- Tooltip: ink background, 12px / 500, radius sm.
