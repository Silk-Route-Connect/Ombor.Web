# Design tokens — Ombor

**Status:** token sheet — a readable mirror of `src/theme/`, which is the **single source** (there is no `tokens.css`; the Design-project tokens were folded into the theme). When the two disagree, the theme wins and this sheet is corrected in the same change.
**Last updated:** 2026-10-07 (the MUI X date / time picker overrides; sidebar rail below a 1440px window). Earlier 2026-10-06 (UI refresh: warm-stone surfaces → one cool ink-grey ramp, teal navigation panel, ink-tinted modal scrim, success / warning tints separated from the Sale / Supply chips, `figuresSx`, `layout.contentMax` / `sidebarWidthVar`, identity tints, `iconSize` roles, theme-sized button icons, the modal anatomy, overline labels, lint guards)

Contrast figures are WCAG ratios on white unless stated. Text needs 4.5:1 (all app text is below the 18px/24px "large" threshold except page titles); control edges and focus indicators need 3:1.

## Where things live

| File | Holds |
| --- | --- |
| `src/theme/palette.ts` | core hues, on-tint text shades, the neutral ramp, `designTokens` (tints, overlays, semantic aliases) |
| `src/theme/chipTokens.ts` | every chip colour (`chipTokens`), keyed by meaning |
| `src/theme/typography.ts` | the type scale (all MUI variants defined) |
| `src/theme/tokens.ts` | `radius`, `iconSize`, `controlSize`, `dialogWidth` + `dialogPaperSx`, `typeScale` (numeric), `numericSx`, `figuresSx`, `layout` (`contentMax`, `sidebarWidthVar`) |
| `src/theme/identityPalette.ts` | `identityTone(name)` — the 8 avatar / placeholder tints |
| `src/theme/components.ts` | MUI overrides: focus ring, the app font on every `ButtonBase`, input borders and adornments, helper text, tooltip, the modal anatomy (paper, body, footer band, backdrop), button heights and icon sizes, table / input sizing, the MUI X date / time pickers (`MuiPickers*`, typed through `@mui/x-date-pickers/themeAugmentation`) |
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
| `TEAL_700` (`navBg`) | `#0E4448` | the navigation panel — the one large brand surface (white text 10.8:1) |
| `saffron600` / `saffron100` / `accentSoft` | `#B5710F` / `#F6DEAE` / `#FBF0DC` | archive action icon / Supply chip border / Supply chip fill |
| success | `#157A54` (dark `#1C5C40`) | money in, positive figures (5.3:1; 4.8:1 on the canvas) |
| warning | `#C57E14` (dark `#6D5706`) | icons and fills only (3.3:1); amber **text** uses warning.dark |
| error | `#C53D31` (dark `#8F2A1F`) | money out, overdue, destructive (5.1:1) |
| info | `#2A6F97` (dark `#245F82`) | informational (Open status, Deposit, Bank) |
| ink (`fg1`, text.primary) | `#1C2625` | primary text |
| `logoKeystone` | `#B8860B` | the monogram keystone only |

`palette.<family>.dark` is the on-tint text shade of each family: success `#1C5C40` (6.9:1 on its tint), error `#8F2A1F` (7.2:1), warning `#6D5706` (6.2:1), info `#245F82` (6.0:1). Also exposed as `designTokens.successFg / dangerFg / warningFg / infoFg`.

## Neutral ramp (one ramp)

`designTokens.grayN` and MUI `palette.grey[N]` resolve from the same `NEUTRAL` constant — a step name always means the same colour. Surfaces, borders and text are **one cool ink-grey family** (hue ≈ 199°, the hue of the ink and the teal). The earlier warm-stone surfaces (`#F4F1EA` canvas, h≈42°) read as a yellowish, tiring field under cool text (owner feedback 2026-10-06); warmth now lives only in the saffron accent and the Supply chip.

| Step | Value | Alias | Use |
| --- | --- | --- | --- |
| 0 | `#FFFFFF` | — | surface (background.paper) |
| 25 | `#F7F9F9` | `bgSubtle` | table header / footer / total bands, quiet fills (designTokens only — MUI grey has no 25) |
| 50 | `#F1F4F4` | `bgCanvas` | page canvas (background.default) — the page only, never a hover or inset fill |
| 100 | `#E9EDED` | — | dividers inside panes, sunken fills, neutral chip fill, segmented-control track |
| 200 | `#DDE2E2` | `border` | card / table hairlines (palette.divider) — decorative only |
| 300 | `#C8CFCF` | `borderStrong` | ghost-button outline, dividers on tints — decorative only |
| 400 | `#A6B0B0` | `decoration` | icons, dots, chart reference lines. **Never text** (2.2:1) |
| 500 | `#646C6B` | `fg3` | tertiary / meta / placeholder text — `text.disabled` (5.4:1; 4.9:1 on the canvas) |
| 600 | `#565F5E` | `fg2` | secondary data text — `text.secondary` (6.4:1) |
| 700 | `#3E4A4A` | — | strong secondary text, neutral chip text |
| 800 | `#28302F` | — | — |
| 900 | `#1C2625` | `fg1` | ink |
| — | `#7D8787` | `borderControl` | input / select / control outline (3.7:1; 3.3:1 on the canvas — WCAG 1.4.11) |

Buttons are never disabled in this app (hard rule 5), so `text.disabled` doubles as the AA-safe tertiary tone.

## Semantic tints

| Family | Fill | Border | Text |
| --- | --- | --- | --- |
| success | `successBg #E6F3E6` | `successBorder #C4DEC5` | `#1C5C40` — leans yellow-green so «Оплачено» separates from the teal «Продажа» |
| danger | `errorBg #FBEAE8` | `errorBorder #EFC9C4` | `#8F2A1F` |
| warning | `warningBg #FFF2C8` | `warningBorder #ECD388` | `#6D5706` — butter yellow, apart from the saffron «Поставка» |
| info | `infoBg #E7F0F6` | `infoBorder #C5DBEA` | `#245F82` |
| teal | `primarySoft #E1EEEE` | `primaryLine #C3DEDE` | `#12676B` |
| saffron | `accentSoft #FBF0DC` | `saffron100 #F6DEAE` | `#8F5A0C` |
| purple (payroll) | `purpleBg #ECE7F7` | `purpleBorder #D6CBEE` | `purpleText #6A4BB0` |
| neutral | gray100 `#E9EDED` | gray300 `#C8CFCF` | gray700 `#3E4A4A` |

Overlays (`designTokens`): `onDarkMuted` rgba(255,255,255,.82) secondary text on teal/ink · `onDarkLine` .14 hairline · `onDarkFill` .13 chip fill on teal · `onDarkGrid` .10 brand-panel grid · `onDarkHover` .08 hover wash on teal · `scrim` rgba(255,255,255,.72) frosted auth card · `scrimModal` rgba(28,38,37,.42) ink-tinted modal backdrop · `primaryWash` rgba(18,103,107,.05) chart hover · `loadingVeil` rgba(241,244,244,.6) reload veil. `palette.action.hover` rgba(18,103,107,.06) (the hover wash of clickable rows, nav and menus) · `palette.action.active` = fg2 (default icon buttons — pager, expanders).

Identity tints (`identityTone(name)`, `identityPalette.ts`): 8 bg / fg pairs — teal, saffron, blue, plum, rose, olive, slate, clay, every fg ≥5.2:1 on its bg — picked by a stable hash of the name, so the same partner, employee or product always gets the same avatar / placeholder colour. Archived / muted rows stay neutral gray100.

## Chip tokens (`chipTokens`)

Rendered only through the shared `StatusPill`. Keys by meaning: `sale` / `supply` (teal / saffron soft), `saleRefund` / `supplyRefund` (outlined), `open` (info), `partiallyPaid` (warning), `overdue` (danger), `closed` (success), `income` (success), `expense` (danger), `stockIn` (info), `stockOut` (warning), plus the families `neutral`, `teal`, `saffron`, `info`, `warning`, `success`, `danger`, `dangerOutline`, `purple`. Semantics: ../Ombor.Docs/ui-patterns.md → Chip colour semantics.

## Typography (Onest 400 / 500 / 600 / 700 — 800 is not loaded)

| Variant | Size / line | Weight | Use |
| --- | --- | --- | --- |
| h1 | 26 / 32, −0.02em | 700 | page and detail titles |
| h2 | 20 / 28, −0.02em | 600 | section headings |
| h3 (= h5) | 16 / 22, −0.01em | 600 | card and panel titles (`DetailCard`, `ChartPanel`, dashboard panels, Settings sections) |
| h4 (= h6) | 18 / 24, −0.01em | 700 | dialog titles (MUI `DialogTitle` renders h6) |
| subtitle1 | 14 / 20 | 600 | emphasised body |
| subtitle2 | 13 / 18 | 600 | emphasised small |
| body1 | 14 / 20 | 400 | body, table cells |
| body2 (bodySm) | 13 / 18 | 400 | secondary lines, captions under titles |
| caption | 12 / 16 | 400 | meta, chips, table headers |
| overline | 11 / 16, +0.08em, uppercase | 700 | every uppercase micro-label — section eyebrows (register form), print party / signature captions (`printCaptionSx`). Never a hand-set uppercase `sx`; form labels stay sentence case |

Numeric steps (`typeScale`, tabular lining figures): `display` 34/40 700 · `numHero` 32 700 · `numStrong` 26 700 (KPI values) · `numTable` 15 600 (headline money cell). Apply `numericSx` (tabular-nums lining-nums) to money / quantity values that line up in columns. Identifiers and dates (№, SKU, phone, date / time) use `figuresSx` (proportional lining figures): Onest's tabular «1» is ~85% wider than its proportional one, so a tabular date looks set in a different font from the text beside it.

A raw `fontSize` outside a variant is a step of this scale — 11 · 12 · 13 · 14 · 15 · 16 · 18 · 20 · 26 — never fractional (12.5, 13.5 …: a lint warning outside `src/theme`).

## Shape, spacing, sizing

- Radius (`radius`): xs 4 (keycaps, legend swatches, checkboxes) · sm 6 (segmented-control items, stepper buttons, tooltips, menu rows) · md 8 (default — buttons, inputs, menus, icon tiles) · lg 12 (cards, dialogs, table cards) · xl 16 (the auth card) · pill 999 (chips, thin bars). Write `` `${radius.md}px` `` — a raw px string is a lint warning outside `src/theme`.
- Icon size (`iconSize`), by role: xs 14 (inline hint beside a label or figure — ⓘ, delta arrows) · sm 16 (table cell, chip, caption / meta row, card-footer link) · md 18 (button and input adornment, card-header icon) · lg 20 (back button, header icon buttons, menu item — MUI `fontSize="small"`) · xl 22 (dialog / confirmation tile). Button start / end icons come from the theme (`MuiButton` `iconSizeSmall` 16 · `iconSizeMedium` 18 · `iconSizeLarge` 20), so no call site forces an icon size (`!important` is a lint warning); `IconTile` picks the step nearest 57% of its side (28 → 16, 30 / 32 → 18, 40 / 44 → 22).
- Spacing: MUI 8px unit (`theme.spacing`); prefer multiples of 4px.
- Control height (`controlSize`): md 38px (buttons, inputs, selects, search, segmented) · sm 31px (dense inline only).
- Dialog widths (`dialogWidth`): sm 480 · md 640 · lg 880; `dialogPaperSx(size)` adds `maxWidth: calc(100% − 32px)`.
- Table (`Table/tableChrome.ts`): 42px header band on bgSubtle, 52px rows, 16px cell padding, body 14px, header 12px/600, gray100 row hairlines (no zebra striping), total band bgSubtle / 700 / 1.5px gray300 rule; hover wash and a 2px inset primary focus ring only on rows that open something — list `DataTable`, `ExpandableDataTable` and `DetailTable` alike. Table cards radius lg.
- Modals (`MuiDialogContent` / `MuiDialogActions`, used by `FormDialog`): body always divided, padding 16 24 20, an ink scroll shadow at whichever edge still hides content; footer band bgSubtle, padding 14 24, gap 10. Helper / error text flush with the field edge, 12 / 16, 6px above. An end unit inside a field («UZS», «%») 13 / 500 secondary; a start prefix («+998») keeps the field's size.
- Date / time fields (`DateField` / `TimeField`) render MUI X's own field, not a TextField, so the theme matches them to the inputs: `MuiPickersTextField` small · `MuiPickersOutlinedInput` 38px min height, `controlSize.md` padding, `borderControl` edge (ink hover, primary focus as on every input) · `MuiPickersInputBase` 14px, an empty unfocused «ДД.ММ.ГГГГ» / «ЧЧ:ММ» in `fg3` (it reads as a placeholder); the calendar / clock icon 18px (`iconSize.md`, set in `usePickerField`, not the theme). The popup is a menu surface — `MuiPickerPopper` paper radius md + 1px `border` hairline on MUI's elevation 8 (`shadows[8]`), 6px below the field (the popper offset in `usePickerField`); on desktop the view spans the popup (`MuiPickersLayout`, no blank toolbar column) and the hour / minute columns sit centred (`MuiMultiSectionDigitalClock`); the month heading is capitalised 14 / 600 («Октябрь 2026», `MuiPickersCalendarHeader`); the touch dialog's heading is sentence case 13 / 600, never an uppercase overline (`MuiPickersToolbar`).
- Layout: sidebar 248px expanded / 72px rail (auto-collapsed below a 1440px window — `NARROW_VIEWPORT_QUERY` `(max-width: 1439.95px)` — and on POS pages); it publishes its current width as the CSS variable named by `layout.sidebarWidthVar` (`--app-sidebar-width`) — the toasts sit past it · topbar 60px · page padding 24px · content max width `layout.contentMax` 1600px (wide monitors keep a readable measure).

## Elevation

`shadows[1]` cards `0 1px 2px rgba(22,42,43,.05), 0 1px 3px rgba(22,42,43,.06)` · `shadows[8]` menus / popovers / flyouts `0 2px 6px rgba(22,42,43,.06), 0 6px 16px rgba(22,42,43,.06)` · `shadows[16]` / `[24]` modals and floating cards `0 10px 24px rgba(22,42,43,.10), 0 24px 60px rgba(22,42,43,.12)`.

## Focus and interaction

- One keyboard-focus indicator: 2px teal (`#12676B`) outline, 2px offset (6.6:1) on every `ButtonBase` (`.Mui-focusVisible`); inset (−2px) on menu items, list buttons and tabs; inputs show their 2px primary border; a clickable table row draws its own 2px inset ring over the hover wash (MUI's `TableRow` resets `outline`). Non-ButtonBase elements with `role="button|tab|radio|link"` or `tabIndex=0` get the same ring through a global `:focus-visible` rule.
- Inputs: outline `borderControl` → ink on hover → 2px primary when focused → error.main on error. Placeholder `fg3`; the select arrow 20px in `fg3`.
- Tooltip: ink background, 12px / 500, radius sm.
