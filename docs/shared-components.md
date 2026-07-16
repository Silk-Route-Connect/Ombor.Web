# Shared components — index

**Status:** repo index, backing CLAUDE.md hard rule 9. Verified against `src/components/shared/` on 2026-07-14 (seed caveat resolved).
**Last updated:** 2026-07-14

**The rule:** before creating **any** component, scan this index. If a listed component (or a config of one) fits, use it. If a genuinely new shared component is needed, add its row **in the same commit**. When work consolidates onto a shared component, the superseded implementations are **deleted in the same change** — dead variants left in `shared/` are traps. **Every file under `src/components/shared/` must have an index row** — an unindexed shared file is a defect found in review. Module-local components stay in `components/<module>/` and are not listed — except shared items carrying a "Lives in …" location note and the promotion candidates at the bottom. Styling questions → `theme.ts` / `chipTokens`, never per-component hex.

## Tables & data display

| Component                              | Use for                                                           | Notes                                                                                                                                        |
| -------------------------------------- | ----------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------- |
| `DataTable`                            | Every list-page table                                             | Canonical DSN-1 chrome via `tableConfigs.ts`; sortable columns by default; 10/25/50 pager; date-desc on event feeds, name-asc on master data |
| `ExpandableDataTable`                  | List tables with expand-row detail (Templates, Stock Adjustments) | Same chrome + expand panel                                                                                                                   |
| `TablePager`                           | Pager footer on bespoke tables that can't use `DataTable`         | Totals-row / expandable tables; same `FOOTER_SX` as `DataTable`; ru-localized, 10/25/50 default                                              |
| `TruncatedText`                        | List-table cells holding genuinely long free text                 | Single-line ellipsis at `maxWidth`; tooltip with the full text only when actually clipped                                                    |
| `CopyableNumberCell`                   | «№…» cells with copy                                              | Extracted from Orders during the TXN pass                                                                                                    |
| `tableStyles.ts`                       | Legacy shared styles for hand-rolled tables                       | Near-retired — the July passes migrated its consumers to `DataTable`; don't adopt for new work                                               |
| `TimeSeriesChart` (+ chart components) | Charts                                                            | recharts, themed to the palette                                                                                                              |
| `KpiCard`                              | Dashboard / stat cards                                            | Hero tabular value + delta + sparkline                                                                                                       |
| `MetaDot`                              | Separator dot in meta lines                                       | 4px gray-400; replaced the invisible 3px separators                                                                                          |
| `PageHeader`                           | Header on every routed list page                                  | DSN-1 `.page-head`: h1 title (+ optional subtitle) left, actions toolbar right                                                               |
| `PlaceholderPage`                      | Unbuilt routes                                                    | Lives in `pages/`                                                                                                                            |

## Detail-page scaffold (pattern 20)

| Component                       | Use for                                        | Notes                                                                                                                          |
| ------------------------------- | ---------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------ |
| `DetailPageHeader`              | Every detail page header                       | back → name-only title → kebab → optional `primaryAction` (one child-event creation per pattern 2) (pattern 20a)               |
| `DetailTabs`                    | Detail tab bars                                | Underline tabs + count pills                                                                                                   |
| `DetailCard`                    | Summary / rail cards                           | The card primitive for detail summaries                                                                                        |
| `detailTableChrome`             | Detail-embedded tables (ledgers, detail tabs)  | **Not** `DataTable`; warm header band + total band _or_ pager footer (pattern 20d)                                             |
| `DetailSortHeader`              | Sort headers in `detailTableChrome` tables     | For bespoke detail tables that can't use `DataTable`'s TableSortLabel; active column in primary + arrow; optional info tooltip |
| `ActionMenu` / `MenuActionCell` | Kebab menus; table row actions                 | Row `tone` (`normal` / `warn` / `danger`) — never hand-colored icons; localized aria-label via `common.actions`                |

## Forms & inputs

| Component                                                             | Use for                                         | Notes                                                                               |
| --------------------------------------------------------------------- | ----------------------------------------------- | ----------------------------------------------------------------------------------- |
| `FormDialog` (+ `FormDialogHeader` / `FormDialogFooter` / `SaveButton`) | All modal forms                                 | Centered modals only (pattern 3); submit never disabled (hard rule 5), outage-aware |
| `ConfirmDialog`                                                        | Confirmations                                   | —                                                                                   |
| `FormFieldLabel`                                                       | Field label above design-system inputs          | `.flabel`: 13px/600 gray-700, error-colored required asterisk                       |
| `NumericField`                                                         | Numeric inputs                                  | react-number-format                                                                 |
| `MoneyField`                                                           | Money inputs                                    | Live thousands grouping as you type (06-24 pass)                                    |
| `UzsUnit`                                                              | The «UZS» suffix wherever the unit is shown     | Unifies suffix spacing                                                              |
| `PhoneListField`                                                       | Phone inputs                                    | Fixed «+998», body grouped via `phoneUtils`                                         |
| `PasswordField`                                                        | Password inputs (auth, invites)                 | Show/hide toggle + caps-lock warning                                                |
| `Autocomplete` (`EntityAutocomplete`)                                  | Pickers over `{ id, name }` entity lists        | Trimmed case-insensitive filter + `additionalFilter` hook                           |
| `AttachmentPicker`                                                     | File-attachment input on forms                  | Upload button + removable chip list                                                 |
| `SearchInput`                                                          | Page / table search                             | —                                                                                   |
| `DateFilterPicker`                                                     | Date filtering                                  | —                                                                                   |
| `SegmentedControl`                                                     | Segmented toggles                               | Archive «Активные \| Архив» (pattern 13), status filters                            |
| `PartnerPicker`                                                        | Partner selection with balance as color + label | Lives in `components/transaction/Create/`; reused by New Order                     |
| `ProductSearchBar`                                                     | Product-search cart feeder (POS flows)          | Lives in `components/transaction/Create/`; reused by New Order                     |
| `useDirtyClose` (hook)                                                 | Unsaved-changes guard on modals                 | Lives in `hooks/shared/`                                                            |
| `useFormKeyboardSubmit` (hook)                                         | Enter / Ctrl+Enter submit on form modals (XC-11) | Lives in `hooks/shared/`; returns an `onKeyDown` for the modal `<Dialog>`           |

## Buttons

| Component          | Use for                            | Notes                                                                        |
| ------------------ | ---------------------------------- | ----------------------------------------------------------------------------- |
| `PrimaryButton`    | Page-level primary actions         | MUI contained + icon slot; visuals come from the theme                        |
| `GhostButton`      | Secondary page actions             | DSN-1 `.btn-ghost`: surface bg, strong-border outline, no shadow              |
| `DownloadButton`   | Export menus                       | csv / pdf / png options, configurable per surface                             |
| `AddPaymentButton` | «Добавить оплату» affordance       | Outlined + payment icon                                                       |

## Links & navigation

| Component    | Use for          | Notes                                                                                                                  |
| ------------ | ---------------- | ----------------------------------------------------------------------------------------------------------------------- |
| `DetailLink` | Base entity link | The single home of link styling; per-module `<Module>Link` wrappers supply only route (from `routing/paths.ts`) + text |

## Chips & badges (colors from `chipTokens` only)

| Component                                      | Use for                                        | Notes                                                                                                                          |
| ---------------------------------------------- | ---------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------ |
| `TransactionTypeBadge` / `TransactionKindChip` | Sale / Supply / refunds                        | Teal / saffron, refunds outlined, with icons. Live in `components/transaction/TransactionBadges.tsx` / `components/product/Detail/` |
| `TransactionStatusChip`                        | Open / PartiallyPaid / Overdue / Closed        | Keys off the served `TransactionStatus` enum. Lives in `components/transaction/TransactionBadges.tsx`                          |
| `DirectionBadge`                               | Income / Expense pills                         | Payments + stock-adjustment direction; unsigned amounts per pattern 4                                                          |
| `ArchivedBadge`                                | Archived cue on list rows + detail headers     | DSN-1 `.arch-badge` uppercase pill; the single «Архив» definition; label overridable per module                                |
| `PartnerTypeChip`                              | Partner type incl. Both → «Клиент + Поставщик» | Pattern 15. Lives in `components/partner/`                                                                                     |
| `OrderStatusChip`                              | Order 7-state machine                          | Token-clean; own mapping (no clean `chipTokens` key). Lives in `components/order/`                                             |
| `EmployeeStatusBadge`                          | Active / OnVacation / Terminated               | Defensive fallback for nullable served status. Lives in `components/employee/`                                                 |

## App / system

| Component                             | Use for                          | Notes                                                                          |
| ------------------------------------- | -------------------------------- | ------------------------------------------------------------------------------ |
| `OfflineBanner` + `ConnectivityStore` | Backend-outage UX                | Fed by the http error interceptor; blocks submits until recovery. Banner lives in `layouts/` |
| `ErrorFallback`                       | Root render-crash fallback       | Rendered by the root Sentry.ErrorBoundary; reload is the only recovery         |
| `AppSplashScreen`                     | Full-viewport boot / auth loading | Spinner + optional message                                                     |
| `OmborMark`                           | The Ombor brand monogram         | Inline SVG, variants `tile` / `reversed` / `monoTeal` / `monoWhite`; geometry frozen |
| `NotFoundPage`                        | Catch-all 404 route              | Lives in `pages/`                                                              |

**Deprecated residue:** `SidePane/tabConfigs.ts` — legacy side-pane styling (hard rule 3), zero importers as of 2026-07-14; delete with the last legacy side-pane rewrite. Never adopt.

## Shared non-component units (rules live in `conventions.md`)

`formatCurrency` · `formatEntityId` · `formatDate` / `formatDateTime` + `DATE_FORMAT` · `phoneUtils` · `byLabel` (sortUtils) · `Loading` / `TryRun` / `WithSaving` async helpers · `i18n/languages.ts` (`UI_LANGUAGES`). Locate and reuse — never re-implement or hand-assemble.

## Promotion candidates (module-local today — promote on a second consumer)

`dropdownSx` (design-system popper styling, `transaction/Create/`) · `KeyboardHints` (POS keyboard legend, `transaction/Create/`).
