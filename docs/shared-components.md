# Shared components — index

**Status:** repo index, backing CLAUDE.md hard rule 9. Verified against `src/components/shared/` on 2026-07-14 (seed caveat resolved).
**Last updated:** 2026-10-04

**The rule:** before creating **any** component, scan this index. If a listed component (or a config of one) fits, use it. If a genuinely new shared component is needed, add its row **in the same commit**. When work consolidates onto a shared component, the superseded implementations are **deleted in the same change** — dead variants left in `shared/` are traps. **Every file under `src/components/shared/` must have an index row** — an unindexed shared file is a defect found in review. Module-local components stay in `components/<module>/` and are not listed — except shared items carrying a "Lives in …" location note and the promotion candidates at the bottom. Styling questions → `theme.ts` / `chipTokens`, never per-component hex.

## Tables & data display

| Component                              | Use for                                                           | Notes                                                                                                                                        |
| -------------------------------------- | ----------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------- |
| `DataTable`                            | Every list-page table                                             | Canonical DSN-1 chrome via `tableConfigs.ts`; sortable columns by default; 10/25/50 pager on by default; date-desc on event feeds, name-asc on master data. `empty` slot takes the table's `TableEmptyState`. Rows open on click / Enter / Space (a key on an inner link or button stays with it). The body scrolls inside the card so the header band stays sticky. `summary` (a `TableTotals`) sits in the footer band left of the pager; `fixedLayout` + `COLUMN_WIDTH` keeps event-list columns from re-flowing. Header band in `DataTableHead` |
| `ExpandableDataTable`                  | List tables whose rows expand into a detail panel (Templates)     | Same chrome and `Column<T>` API as `DataTable` + expand panel; a row (click, Enter, Space) or the chevron toggles it; `empty` slot          |
| `useTableSort` / `useTableOrder` (`Table/useTableSort.ts`, `Table/tableOrder.ts`) | The one client-side sort of `DataTable` / `ExpandableDataTable` / `DetailTable`; CSV in the table's order | A page's `useTableOrder()` goes to its table as `exportOrder`; the export writes `tableOrder.apply(rows)` |
| `TablePager`                           | The footer band of every table                                    | `DataTable`, `ExpandableDataTable`, `DetailTable`; `FOOTER_SX`; ru-localized, 10/25/50 default; optional `summary` on its left             |
| `TableTotals`                          | Totals of a list's filtered rows (count + money sums)             | Rendered through the table's `summary`; count in words, sums with `UzsUnit`, `tone` income / expense only for Приход / Расход; a negative sum reads «−…» (Sales «Возвраты», D12) (conventions.md → Tables) |
| `TableToolbar`                          | Search / filters / export band above a table                      | One flex row: search + filter controls + right-aligned actions (XC-15/DEC-D3). Wraps on narrow widths                                        |
| `TruncatedText`                        | List-table cells holding genuinely long free text                 | Single-line ellipsis at `maxWidth`; tooltip with the full text only when actually clipped                                                    |
| `CopyableCell`                         | Click-to-copy text (SKU, rail values)                             | Copies the raw value, swallows the row click, copy / copied tooltip; `SkuCell` builds on it                                                  |
| `TableEmptyState`                      | The one empty state of every table                                | Icon tile · title · hint · optional create CTA (first-run) — the `StateMessage` look. `archiveListEmptyKind` picks the copy on archivable lists |
| `clickableRowProps` (`Table/clickableRow.ts`) | Rows that open but are not table rows (rail lists)         | `tabIndex` + click + Enter / Space, inner controls keep their keys                                                                           |
| `MetaDot`                              | Separator dot in meta lines                                       | 4px gray-400; replaced the invisible 3px separators                                                                                          |
| `PageHeader`                           | Header on every routed list page                                  | DSN-1 `.page-head`: h1 title (+ optional subtitle) left, actions toolbar right; actions wrap below the title on narrow widths, the title ellipsizes |
| `PlaceholderPage`                      | Unbuilt routes                                                    | Lives in `pages/`                                                                                                                            |
| `InfoHint`                             | The «i» tooltip beside a label / column header with an unobvious term | One plain sentence, no formula (pattern 16 WAC, «Наценка»). Swallows the click so it can sit inside a sortable header                       |

## Table cells (`components/shared/Table/cells/` — one per column type; rules in conventions.md → Tables)

| Component        | Use for                          | Notes |
| ---------------- | -------------------------------- | ----- |
| `DocNumberCell`  | Document number «№N»             | The number is the link that opens the document (`to`, `onOpen`, or both — a plain click opens in place, the URL opens in a new tab); `CopyIconButton` appears on row hover / focus over the cell padding (never widens the column); missing → «Без номера» |
| `MovementSourceCell` (+ `MovementSourceDialogs`) | № of a stock-movement row (Product / Warehouse «Движения») | Lives in `components/stockMovement/`. The served source document: a sale / supply / refund number links to its page, a transfer / adjustment number (its id, as its own list shows it) links to `/transfers/:id` / `/adjustments/:id` and a plain click opens its detail modal over the page (`MovementSourceStore`), opening stock «—». Rows open the same target via `useMovementSourceOpener` (`hooks/stockMovement/`) + `isMovementSourceOpenable` (`utils/movementSource`) |
| `CopyIconButton` | Small copy button in a cell / row | Hidden until the owner reveals `COPY_BUTTON_CLASS` on hover / focus; always shown on touch screens; never lets the click reach the row |
| `DateCell`       | Dates                            | `dateTime` (events) or `kind="date"`; secondary, tabular, one line |
| `EntityCell`     | The row's primary entity         | Avatar · `<XLink>` · «Архив» badge · optional second line |
| `MoneyCell`      | Money                            | `main` = headline amount (600), others 400; `tone` income / expense for direction amounts only; `negative` for a Sales / Supplies refund row «−18 000» (D12); null → «—»; no «UZS» |
| `BalanceCell`    | A partner's balance / ledger movement | Signed from the partner's side (DR-27) with `partnerBalanceColor` |
| `QuantityCell`   | Quantities and counts            | Ink, tabular; unit suffix (`measurement` or `unit`); `direction` signs movement ledgers |
| `SkuCell`        | SKU                              | Click-to-copy, 13 / 500, secondary |
| `MutedTextCell`  | Author, short secondary text     | `text.secondary`, one line |
| `NotesCell`      | Notes, descriptions              | `TruncatedText`, secondary; columns not sortable |
| `PhoneCell`      | Phones                           | `formatUzPhone` «+998 90 123 45 67» |
| `NoValue`        | Empty value                      | «—» |

## Detail-page scaffold (pattern 20)

| Component                       | Use for                                        | Notes                                                                                                                          |
| ------------------------------- | ---------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------ |
| `DetailPageHeader`              | Every detail page header                       | back → name-only title → kebab → optional `primaryAction` (one child-event creation per pattern 2) (pattern 20a)               |
| `DetailTabs`                    | Detail tab bars                                | Underline tabs + count pills                                                                                                   |
| `DetailCard`                    | Summary / rail cards                           | The card primitive for detail summaries; `detailCardIconSx` styles its title icon                                              |
| `DetailTable`                   | Every detail tab, line table and dashboard table | Same `Column<T>` API and cells as `DataTable` on the `detailTableChrome` look; `footer` total band, `pagination`, `summary` (`TableTotals` in the pager band), `onRowClick` (+ `isRowClickable`, `rowSx`), `empty`; keyboard rows and sort headers (pattern 20d) |
| `DetailTableCard`               | The bordered unit of a detail tab              | One in-card band (search · filters · `ExportButton`) above the tab's `DetailTable` (pattern 14) |
| `detailTableChrome`             | The detail-table look                          | Header / body / total cell styles behind `DetailTable`; **not** `DataTable`                                                    |
| `DETAIL_RAIL_COLUMNS` (`detailLayout.ts`) | Right-rail detail grids (Product / Order / Transaction / Payment / Partner) | One rule: rail from `lg`, `minmax(0, 1fr) 360px` so wide tab tables never push the grid (pattern 20g) |
| `DetailSortHeader`              | Sort headers of `DetailTable`                  | A keyboard button inside the `th` (which carries `aria-sort`); active column in primary + arrow; optional info tooltip (`InfoHint`) |
| `ActionMenu` / `MenuActionCell` | Kebab menus; table row actions                 | Row `tone` (`normal` / `warn` / `archive` / `restore` / `danger`) is the only colour — icons are passed uncoloured; localized aria-label via `common.actions` |

## Forms & inputs

| Component                                                             | Use for                                         | Notes                                                                               |
| --------------------------------------------------------------------- | ----------------------------------------------- | ----------------------------------------------------------------------------------- |
| `FormDialogHeader` / `FormDialogFooter` / `SaveButton` + `dialogPaperSx(size)` | All modal forms                                 | Centered MUI `Dialog` (pattern 3) sized by `dialogPaperSx("sm" \| "md" \| "lg")` from the theme (480 / 640 / 880; radius from the theme); title = theme `h6` 18/700. Submit never disabled (hard rule 5), outage-aware. `FormDialogFooter` takes `submitLabel`/`submitIcon`/`cancelLabel`, a left `summary` slot and a `commitNote` — every immutable-event modal uses it (commit convention, conventions.md → Forms) |
| `CommitNote`                                                           | The consequence line under an immutable-event commit button | `Dialog/Form/`. Lock icon + one line («После проведения изменить нельзя — …»). Rendered by `FormDialogFooter.commitNote`; used directly only where the commit button isn't a dialog footer (POS summary card) |
| `ConfirmDialog`                                                        | Confirmations                                   | —                                                                                   |
| `FormFieldLabel`                                                       | Field label above design-system inputs          | `.flabel`: 13px/600 gray-700, error-colored required asterisk, optional muted `hint` («необязательно»). Names its field (frontend-16): without `htmlFor` it links to the first control after it in its container — `for` on a TextField / Autocomplete input, `aria-labelledby` on a Select or radio group — and re-links when that container changes (`Forms/labelLink.ts`); a label with no control of its own (a group heading, a column header) links nothing. Pass `htmlFor` only when the field is not the next control |
| `NumericField`                                                         | Whole quantities in forms (packaging size, adjustment, transfer and opening-stock lines) | Text input over `parseWholeQuantity`: `onChange(number)` gets the whole value, 0 when cleared, NaN while a «1,5» is typed (it stays visible, the field shows «Количество — только целое число», the schema refuses NaN with `common.quantity.wholeOnly`); `inlineHint={false}` where a line editor shows the error at row level. Caller `slotProps.input` (end adornment) merges with the field's own. **No** thousands grouping — for money use `MoneyField`/`MoneyInputBase` |
| `MoneyField`                                                           | Money inputs (TextField-based forms)            | Live space-grouped thousands as you type; stores raw integer (UZS, whole-number). Format/parse in `Inputs/moneyInput.ts` |
| `MoneyInputBase`                                                       | Money inputs in bespoke bordered boxes (POS cart lines, tender) | Bare-`InputBase` twin of `MoneyField`; same grouping/parse via `Inputs/moneyInput.ts`. Use when TextField chrome doesn't fit |
| `UzsUnit`                                                              | The «UZS» suffix on totals and hero figures (never in table cells) | One size / gap / colour; label from `common.unit.uzs`, `label` for a qualified unit («UZS / мес») |
| `UzsAdornment`                                                         | The «UZS» end adornment of a money input                        | `slotProps={{ input: { endAdornment: <UzsAdornment /> } }}`; label from `common.unit.uzs` — never a literal «UZS» |
| `PhoneListField`                                                       | Phone inputs (partner and employee forms)       | Fixed «+998», body grouped via `phoneUtils`; «Добавить номер» never disabled (explains at the limit / with an empty row); `listError` for a whole-list error |
| `PeriodSelect`                                                         | A «YYYY-MM» period (payroll)                    | Month select (`common.month.*`) + year select (`periodYearOptions`); never a native `type="month"`, which renders in the browser's locale. `label` for TextField forms, omit it under a `FormFieldLabel` |
| `PasswordField`                                                        | Password inputs in app forms (Settings → «Безопасность») | Show/hide toggle + caps-lock warning; `size="small"` for 40px settings fields, `inputRef` / `onBlur` for react-hook-form `Controller`. The auth pages use their own `components/auth/AuthFields/AuthPasswordField` shell |
| `Autocomplete` (`EntityAutocomplete`)                                  | Pickers over `{ id, name }` entity lists        | Trimmed case-insensitive filter + `additionalFilter` hook                           |
| `AttachmentPicker`                                                     | File-attachment input on forms                  | `GhostButton` upload (a native button opening a hidden file input — keyboard-operable) + removable chip list |
| `AttachmentChip`                                                       | Downloadable file chip on detail pages          | MIME-typed icon (image/doc) + name + size; used by transaction & payment detail     |
| `SearchInput`                                                          | Page / table search                             | —                                                                                   |
| `DateRangeFilter`                                                      | The date filter of every event list and the wallet «Операции» tab | `components/shared/Date/`. `EntityFilterSelect` look («Дата: …»): Весь период · Сегодня · Вчера · Эта неделя · Этот месяц · Прошлый месяц · Период… (`DateRangePopover`: two calendar fields + «Применить»). Value is a `DateRangeValue`; filter rows with `filterByDateRange` (`utils/dateRange`) |
| `SegmentedControl`                                                     | Segmented toggles                               | Archive «Активные \| Архив» (pattern 13), status filters                            |
| `EntityFilterSelect`                                                   | Every table filter dropdown (list filter rows, detail-tab bands) | Icon-led `Select` at the 38px control height; «Все …» via `allValue` or the first option; optional `label` prefix («Тип: …»); teal tint while a filter is on (XC-1, tables-19); `valueLabel` overrides the closed text, `onReselect` hears a click on the already-picked option |
| `PartnerPicker`                                                        | Partner selection with balance as color + label | Lives in `components/transaction/Create/`; reused by New Order. Last row «+ Новый клиент / поставщик» opens `PartnerFormModal` (via `PosPartnerCreate`, `defaults` = type + typed name) over the page and picks the result |
| `ProductSearchBar`                                                     | Product-search cart feeder (POS flows)          | Lives in `components/transaction/Create/`; reused by New Order                     |
| `useDirtyClose` (hook)                                                 | Unsaved-changes guard on modals                 | Lives in `hooks/shared/`                                                            |
| `useFormKeyboardSubmit` (hook)                                         | Enter / Ctrl+Enter submit on form modals (XC-11) | Lives in `hooks/shared/`; returns an `onKeyDown` for the modal `<Dialog>`. Pass `{ requireModifier: true }` on immutable money/stock events — only Ctrl+Enter or a click commits, never a bare Enter |
| `useSidewaysScroll` (hook) + `sidewaysFadeMask` | A control strip too wide for its toolbar (Orders status tabs) | Lives in `hooks/shared/`; scrolls sideways with no scrollbar (wheel, swipe, Tab), reports which edge hides items for an edge fade and arrow (`step`) |

## Buttons

| Component          | Use for                            | Notes                                                                        |
| ------------------ | ---------------------------------- | ----------------------------------------------------------------------------- |
| `PrimaryButton`    | Page-level primary actions         | MUI contained + icon slot; visuals come from the theme                        |
| `GhostButton`      | Secondary page actions             | DSN-1 `.btn-ghost`: surface bg, strong-border outline, no shadow; sizes its own icon (no `!important`)             |
| `BackButton`       | The ‹ back control left of a page title | 38px bordered square, localized aria-label («Назад»); used by `DetailPageHeader` and the POS create pages |
| `ExportButton`     | Every CSV export                   | «Экспорт» with the download icon; never disabled — with no rows it explains in an info toast. List pages: title row; detail tabs: card band |

## Links & navigation

| Component    | Use for          | Notes                                                                                                                  |
| ------------ | ---------------- | ----------------------------------------------------------------------------------------------------------------------- |
| `DetailLink` | Base entity link | The single home of link styling: primary, weight 600, inherits the size, `archived` → secondary; stops the click so a link inside a clickable row opens its own target; optional `onOpen` takes a plain click (a modal over the page) while Ctrl / ⌘ / middle click still open the URL in a new tab. `<Module>Link` wrappers (Partner, Product, Warehouse, Wallet, Employee) supply only the route (from `routing/paths.ts`) + text |

## Chips & badges (colors from `chipTokens` only)

Every pill renders through **`StatusPill`** — never a hand-rolled `Box` with `borderRadius: 999`. Colour semantics per `chipTokens` (`src/theme/chipTokens.ts`) and ui-patterns «Chip colour semantics».

| Component                                      | Use for                                        | Notes                                                                                                                          |
| ---------------------------------------------- | ---------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------ |
| `StatusPill`                                   | The one pill primitive                         | `components/shared/Chip/`. `token` (a `chipTokens` key) + label + optional icon, `size` sm 22px/12px (tables) · md 26px/13px (headers), `strike`, `uppercase` |
| `PaymentStatusChip`                            | Transaction payment status, every surface      | Accepts the `TransactionStatus` enum **and** the ledger/dashboard `paid`/`partial`/`unpaid` vocabulary. Open blue · Partial amber · Overdue red · Closed green |
| `MovementKindChip` (+ `movementKind.ts`)       | Stock-movement kind (Product + Warehouse «Движения») | One map: Sale teal · Supply saffron · refunds outlined · Opening/Transfer/Adjustment neutral with icons; labels `common.movementKind.*` |
| `TransactionTypeBadge`                         | Sale / Supply / refunds                        | Delegates to the movement-kind presentation with the transaction's short labels. Lives in `components/transaction/TransactionBadges.tsx` |
| `DirectionBadge`                               | Income / Expense pills                         | Green ↓ in / red ↑ out (app-wide arrow convention); unsigned amounts per pattern 4                                             |
| `ArchivedBadge`                                | Archived cue on list rows + detail headers     | Neutral uppercase pill; the single «Архив» definition                                                                          |
| `EntityAvatar`                                 | Initials avatar for partners and people        | `components/shared/EntityAvatar/`; `muted` (stone) when archived / terminated / deactivated — one avatar for one partner on every surface |
| `PartnerTypeChip`                              | Partner type incl. Both → «Клиент + Поставщик» | Pattern 15; archived rows pass `dimmed` → neutral (no opacity). Lives in `components/partner/`                                 |
| `OrderStatusChip`                              | Order 7-state machine                          | Own lifecycle tokens via `ORDER_STATUS_META` (never the type hues). Lives in `components/order/`                               |
| `EmployeeStatusBadge`                          | Active / OnVacation / Terminated               | Defensive fallback for nullable served status. Lives in `components/employee/`                                                 |
| `DirectionChip`                                | Stock-adjustment Increase / Decrease           | Blue ↓ stock in / amber ↑ stock out (stock is not money — no green/red). Lives in `components/stockAdjustment/`                |
| `StockLevelPill` (+ `StockQuantityCell`)       | Low-stock alert on Products, product detail, warehouse «Остатки» | «Мало» amber at or below the product's «Минимальный остаток», «Нет в наличии» red at zero, nothing otherwise; level from `utils/productFilters`. Lives in `components/product/` |

## App / system

| Component                             | Use for                          | Notes                                                                          |
| ------------------------------------- | -------------------------------- | ------------------------------------------------------------------------------ |
| `OfflineIndicator` + `ConnectivityStore` | Backend / device-outage UX       | Topbar chip fed by the http error interceptor and the browser online state; blocks submits until recovery. Lives in `layouts/` |
| `ErrorFallback`                       | Root render-crash fallback       | Rendered by the root Sentry.ErrorBoundary; reload is the only recovery         |
| `AppSplashScreen`                     | Full-viewport boot / auth loading | Spinner + optional message                                                     |
| `OmborMark`                           | The Ombor brand monogram         | Inline SVG, variants `tile` / `reversed` / `monoTeal` / `monoWhite`; geometry frozen |
| `NotFoundPage`                        | Catch-all 404 route              | Lives in `pages/`                                                              |
| `LoadStateView`                       | Everything that is not data: loading, failed load, not found | `components/shared/LoadState/`. Takes the not-ready `Loadable` state: spinner · error (reason from the `LoadError` kind) with «Повторить» · not-found with «К списку». `size` `page` (own card) or `section` (table body / tab / modal). `DataTable` / `ExpandableDataTable` render it for non-ready `rows` (`onRetry`, `errorTitle`) |
| `StateMessage`                        | Icon tile + title + line + action body of `LoadStateView` | Same folder; use through `LoadStateView` or `TableEmptyState`, not directly    |
| `NotFoundDialog`                      | A routed modal detail whose URL names no record (`/adjustments/999`) | Same folder. The detail's own title over `LoadStateView`'s not-found («… не найдена» · «К списку»); closes like the detail (`useListDetailRoute`) |

## Printable documents (`components/shared/Print/` — rules in conventions.md → Printable documents)

| Component | Use for | Notes |
| --- | --- | --- |
| `PrintLayout` | The page of every printable document | Screen toolbar (back · title · optional `toolbar` controls · «Печать» · «Сохранить как PDF» hint) above an A4 sheet preview; sets `@page` A4 + margins and the browser tab title (`documentTitle`, default `title` — the PDF file name). On paper only the sheet prints (AppLayout hides its chrome under `@media print`) |
| `PrintOrganizationGate` | Waiting for the business profile | Render-prop: `ensureOrganization()` on mount, `LoadStateView` until the profile is loaded, then `children(organization)` — no document prints without its issuer |
| `PrintDocHeader` | Top of a document | Business block (logo · name · address · phone · email) over a rule, centered title + subtitle lines (date, period, references) |
| `PrintParties` | Parties of a document | Side-by-side caption · name · contact lines (empty lines skipped) — «Отправитель / Получатель», «Организация / Партнёр» |
| `PrintTable` | Every table on paper | A bordered real `<table>`: header row repeats on each page, rows never split; `leadRows` / `summaryRows` (opening balance, turnover, totals) with the label spanning the leading columns. Never on screens — screens use `DataTable` / `DetailTable` |
| `PrintTotals` | Totals under a document's table | Right-hand label · amount rows (`strong` = the headline total, ruled above) + an optional left note |
| `PrintSignatures` | Signature area | One block per side: caption («Отпустил», «От организации»), name, signature + name lines, «М.П.» |
| `InvoiceSheet` (+ `InvoiceLinesTable`) | The «Накладная» of a sale, supply, refund or order | Renders an `InvoiceDocument` (`utils/invoiceDocument` — `invoiceFromTransaction` / `invoiceFromOrder` / `invoiceTitle`): sender / receiver by goods direction, lines, discount and payment totals (no payment block on refunds and orders), «Отпустил / Получил» |
| `printStyles` | Shared paper styling | `PRINT_PAGE_MARGIN`, `PRINT_RULE_COLOR`, `printSheetSx`, `printCaptionSx`, `printNumberSx` |


## Shared non-component units (rules live in `conventions.md`)

`formatCurrency` (whole sums without decimals, fractional with two) · `formatPercent` · `paymentMoneyTone` (paymentUtils) · `formatEntityId` (+ `formatOptionalNumber` / `entityNumberSortValue` for numbers legacy rows may lack) · `formatPeriod` / `toPeriod` / `parsePeriod` / `periodYearOptions` (payrollUtils — «YYYY-MM» periods) · `parseWholeQuantity` (quantityInput) · `formatDate` / `formatDateTime` + `DATE_FORMAT` · `phoneUtils` · `byLabel` (sortUtils) · `Loading` (`Loadable`, `LoadError`, `isReady` / `isPresent` / `isLoading` / `readyOr` / `mapLoadable` / `toLoadable` / `toDetailLoadable`) / `LoadSequence` (latest-only loads) / `TryRun` / `WithSaving` async helpers · `apiError` (`parseApiError` / `describeApiError` / `describeApiReason` — server error codes → localized text; `formatWait` — «42 сек.» / «15 мин.» / «3 ч.» for a 429's wait; `isConnectivityFailure` — the only failures that mean «Нет соединения») + `NotificationStore.notifyApiError` / `notifyLoadError` · `formServerErrors` (`applyServerFieldErrors` — server field errors → react-hook-form fields) · `authErrors` (login / code texts, `retryAfterSeconds`, register field errors) · `useRouteEntityId` (`hooks/shared/` — `:id` or null → not-found) · `useListDetailRoute` (`hooks/shared/` — a list page's modal detail URL `/adjustments/:id`: open, id, close back / to the list) · `i18n/languages.ts` (`UI_LANGUAGES`). Locate and reuse — never re-implement or hand-assemble.

## Promotion candidates (module-local today — promote on a second consumer)

`dropdownSx` (design-system popper styling, `transaction/Create/`) · `KeyboardHints` (POS keyboard legend, `transaction/Create/`).
