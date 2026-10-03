# Frontend conventions — Ombor

**Status:** frontend craft doc — the patterns new code must follow; read once per session. Pairs with ../Ombor.Docs/operating-code.md (cross-repo rules: file size, comments, quality bar, git, session discipline) and ../Ombor.Docs/ui-patterns.md (locked UI patterns).
**Last updated:** 2026-10-04

Read once per session before writing code. Codifies the patterns the codebase already follows; new code must follow them. Where existing legacy code and this doc disagree, follow this doc for new code and don't refactor legacy outside the task scope. When changing a pattern here seems justified, propose it — don't fork silently.

---

## Module anatomy

Every domain module (Products, Partners, Payments, …) has the same skeleton. When building a new module, create all of it; when extending one, put code where the skeleton says.

```
components/<module>/
  Table/        <Module>Table.tsx + <module>TableConfigs.tsx (+ ActionMenu/)
  Form/         <Module>FormModal.tsx + <Module>FormFields.tsx
  Header/       <Module>Header.tsx (page header: title, search, primary action)
  Autocomplete/ <Module>Autocomplete.tsx (entity picker for other forms)
  Links/        <Module>Link.tsx (navigates to the entity's detail page)
  Detail/       full-page detail layout + its sections/tabs   ← replaces SidePane/
pages/          <Module>Page.tsx (list) and <Module>DetailPage.tsx
stores/         <Module>Store.ts (list/CRUD) + Selected<Module>Store.ts (detail state)
services/api/   <Module>Api.ts
models/         <module>.ts — TS types mirroring the API contract
schemas/        <Module>Schema.ts — zod schema for forms
hooks/<module>/ use<Module>Form.ts and other module logic
i18n/ru/        <module>.json — the module's keys (flat, <module>.-prefixed)
```

`SidePane/` folders are legacy (CLAUDE.md hard rule 3): never extend, replace with `Detail/` + a routed detail page when the module is rewritten, then delete.

`Links/<Module>Link.tsx` is a thin typed wrapper over the shared `components/shared/Link/DetailLink.tsx` base (the single place link styling lives — theme-primary, underline-on-hover, SPA nav). A wrapper supplies only the entity's route (resolved from `routing/paths.ts`, never a string literal) and display text; never restyle a link or hand-write a path per-module.

## MobX

- Stores own state and async work; components stay thin. Wrap every component that reads observables in `observer()`.
- Stores are composed in `RootStore` and consumed via `StoreContext` hooks — never instantiate a store ad hoc, never import a store singleton directly into a component.
- Use the existing async helpers (`helpers/Loading.ts`, `TryRun.ts`, `WithSaving.ts`) for loading/saving/error state — follow their established usage; do not invent a parallel async-state pattern.
- `Selected<Module>Store` holds the currently open entity for the detail page: the entity, its child collections (transactions, payments, …), and their loading state.
- Errors surface to the user via `NotificationStore` (notistack) — no raw `alert`, no swallowed catches.
- **Pickers read `active*` getters, never `filtered*`.** A list store's `filtered*` getter follows that page's search and «Активные | Архив» toggle; forms and POS pickers use the store's `active*` getter (every non-archived item) so a filter left on a list page never hides or mis-defaults a picker (`WalletStore.activeWallets`, `WarehouseStore.activeWarehouses`).
- **Load state is tagged.** `Loadable<T>` is `"loading"` | `LoadError` | the data; a by-id load is `Loadable<T | null>`, where `null` is «not found» (404 or an invalid `:id` via `useRouteEntityId`). Stores assign `toLoadable(result)` / `toDetailLoadable(result)`; consumers narrow with `isReady` / `isPresent`, derive with `mapLoadable`, and use `readyOr(x, [])` only where an empty fallback is honest (picker options). **A failed load is never rendered as empty data or 0**: pages, tabs and dashboard sections render the not-ready state through the shared `LoadStateView` (spinner · error with «Повторить» · not-found with «К списку»), list tables pass `onRetry` + `errorTitle` to `DataTable`, and summary figures show «—» until the list is ready.
- **By-id and keyed loads are latest-only.** Each goes through a `LoadSequence`: `const isCurrent = this.loads.begin(); … if (!isCurrent()) return;`, and the store's `clear()` calls `this.loads.invalidate()` — a slow response for record A never lands on record B's page or after the page left.
- **Error text comes from the error code, never the server text.** A failed create / update / delete toasts `notificationStore.notifyApiError(result, "<module>.error.<action>")`: the action («Не удалось создать товар») plus the localized reason for the ProblemDetails `code` (`utils/apiError`; codes in `../Ombor.Docs/backend-contracts/conventions.md` → Error codes). A failed load uses `notifyLoadError` (silent for no connection / 5xx / 404 — the page shows the state and the connectivity toast already fired). `tryRun` keeps the thrown error in `result.cause` for this. Never show `detail` / `errors` text.

## Forms

- react-hook-form + zod (`@hookform/resolvers`). Schema in `schemas/`, form logic in `hooks/<module>/use<Module>Form.ts`, fields in `<Module>FormFields.tsx`, shell in `<Module>FormModal.tsx`: an MUI `Dialog` with `slotProps={{ paper: { sx: dialogPaperSx(size) } }}` + `FormDialogHeader` / `FormDialogFooter`.
- **Three modal sizes only** — `sm` 480 (confirmations, short forms), `md` 640 (standard forms), `lg` 880 (line-item editors). Never a pixel width, `maxWidth="xs|sm|md"` or a per-modal radius; the theme sets the paper radius (`radius.lg`) and the 16px viewport gutter.
- Forms open as **centered modals** — never drawers.
- Submit buttons are **never disabled**; validation runs on submit and reports inline per field (CLAUDE.md hard rule 5). Secondary controls follow the same rule: a click that cannot act (e.g. «Добавить номер» at the limit) explains why inline instead of greying out.
- **Server field errors land on the field.** A rule only the server can check (a duplicate SKU) comes back as a ValidationProblemDetails field error; the form hook builds `applyServerErrors = (cause) => applyServerFieldErrors(cause, setError, SERVER_FIELDS)` (`utils/formServerErrors`, a map from the server's PascalCase property to the form field + a localized message) and passes it through `onSave` into the store's create / update, which skips its toast when every field error found its field.
- Numeric/money inputs use `NumericField` (react-number-format); phones use `PhoneListField` + `phoneUtils`.
- Dirty-close protection via `useDirtyClose`.
- **Commit convention for immutable events** (sale, supply, refund, payment, payroll, stock adjustment, transfer, opening stock): the submit button says what happens («Провести продажу», «Выплатить зарплату», «Провести корректировку»), and one `CommitNote` line under it states the consequence and the correction path («После проведения изменить нельзя — ошибку исправляют возвратом»). Use `FormDialogFooter` with `submitLabel` + `commitNote`. A bare Enter never commits such an event — wire `useFormKeyboardSubmit(submit, isSaving, { requireModifier: true })` so only a click or Ctrl/⌘+Enter does. The success toast names what was created («Продажа №12 проведена», «Списание проведено: Шоколад — 5 шт»).

## Tables

**One look per column type in every table** — list pages, detail tabs, line tables and dashboard widgets (owner decision 2026-10-03). Columns are built from the shared cells in `components/shared/Table/cells/`; a cell is never styled by hand.

- **Chrome.** List pages: `DataTable` (or `ExpandableDataTable`) with columns from `<module>TableConfigs.tsx` exporting `build<Module>Columns(t, handlers)`. Detail tabs, line tables and the dashboard: `DetailTable` — the same `Column<T>` API on the `detailTableChrome` look, with an optional total band (`footer`) or pager (`pagination`); a detail tab wraps it in `DetailTableCard`, the one in-card band of search · filters · export. No bespoke `<table>` markup, no raw MUI `Table` in module code; never restyle a table per module.
- **Labels resolve at render time, never at module import.** Config files (table columns, menus, label maps) store i18n keys or accept `t` as a parameter; they must not call `t()` in module scope, or a live language switch won't update them. The one deliberate exception is zod schemas, which resolve validation messages via module-scope `i18next.t()` — see i18n.
- **Column order (left → right):** № → date → primary entity → type chip → status chip → descriptive (author, notes, counts) → quantities and money (the main amount last) → ⋮ actions.
- **Sorting.** Every column sorts (a `field` or a `sortValue`); only ⋮ and notes columns opt out (`sortable: false`). Chip and enum columns sort by their localized label, № numerically (`entityNumberSortValue`). `defaultSort`: **date-desc** on event tables, **name-asc** on master data. The table sorts — no parallel sort in a store.
- **Pagination** 10 / 25 / 50: on by default in `DataTable`; `DetailTable` takes `pagination` for long tabs and leaves it off for short line tables with a total band.
- **Rows** open on click, Enter or Space; a key pressed on a link or button inside the row stays with that control. A rail list that is not a table uses `clickableRowProps`.
- **Empty.** Pass `empty={<TableEmptyState icon title hint action? />}` — first-run copy with the create CTA, filtered copy («Ничего не найдено…») without it. Never a hand-made empty card.
- **Toolbar.** Search, one `EntityFilterSelect` per filter (38px, teal tint while a filter is on, optional `label` prefix), and `ExportButton` — «Экспорт», never disabled, a short info toast when there is nothing to export. List pages put export on the `PageHeader` title row (pattern 11); detail tabs in the card band. The CSV has the table's columns in the table's order.
- **Row actions** live in the shared `ActionMenu` (`MenuActionCell`) with a row `tone` — `normal`, `warn`, `archive`, `restore`, `danger`; icons are passed uncoloured. Archivable entities (Product, Partner, Wallet, Warehouse) always offer Delete: `isDeletable` → confirm, otherwise «cannot delete — archive instead» (pattern 19).

| Column | Cell | Rule |
| --- | --- | --- |
| № | `DocNumberCell` | First column of every event table. «№N» via `formatEntityId`; the number is the link that opens the document (`to`, or `onOpen` for modal details), with a copy button that appears on row hover / focus. Missing number → muted «Без номера» — never the id as a stand-in for a served number, never «#» or a bare number (CSV included). |
| Date | `DateCell` | Events `formatDateTime`, calendar fields `kind="date"` (`formatDate`); `text.secondary`, tabular, one line; second column. |
| Entity name | the module `<XLink>` (`PartnerLink`, `ProductLink`, `WarehouseLink`, `WalletLink`, `EmployeeLink`) | `DetailLink` owns colour (primary), weight 600, inherits the size and stops the row click. The row's own name is a link too, inside `EntityCell` (avatar · link · «Архив» · optional second line). Archived / terminated → `archived` (`text.secondary`) + `ArchivedBadge`; no strike-through, no dimming. An entity with no detail page (category, template) is plain 600 text. |
| Avatar | `EntityAvatar` | Initials; `muted` (stone) when archived / terminated / deactivated. |
| Type / status | `StatusPill` wrappers | Chip colour semantics (ui-patterns); sort by label. |
| Money | `MoneyCell` | Right, tabular. `main` marks the table's headline amount (`typeScale.numTable`, 600); other money 400. Ink by default; `tone` income / expense only for direction amounts (payments, wallet operations, debts by direction). Unsigned; 0 → «0», not applicable (`null`) → «—». No «UZS» in cells — `UzsUnit` only on totals and hero figures. |
| Partner balance | `BalanceCell` | The only signed money: the partner's side (DR-27) via `formatPartnerBalance` + `partnerBalanceColor`; a ledger movement 400, the balance 600. |
| Quantity / count | `QuantityCell` | Right, tabular, 400, ink — never green / red, stock levels never coloured. The short unit as a muted suffix (`measurement` or a served `unit`). Movement ledgers: one signed column (`direction` in / out → «+» / «−»). |
| SKU | `SkuCell` | Click-to-copy, 13 / 500, `text.secondary`, one line. |
| Author, short secondary text | `MutedTextCell` | `text.secondary`, one line, sortable. |
| Notes, description | `NotesCell` | One line with ellipsis and a tooltip when clipped (`TruncatedText`), `text.secondary`, `sortable: false`. |
| Phone | `PhoneCell` | `formatUzPhone` «+998 90 123 45 67», tabular; the CSV writes the same text. |
| No value | `NoValue` | «—». |

## Detail pages

- Detail pages are assembled from shared scaffold components — never a hand-rolled per-module header, tab bar, or card: `DetailPageHeader` (back + **name-only title** + `⋮` `ActionMenu` + optional `primaryAction` slot), `DetailTabs` (underline tabs + count pills), `DetailCard` (summary/rail card primitive), and `detailTableChrome` (warm chrome for detail-embedded tables).
- **Title is the entity name only.** Type chips, company, and all reference fields render in the summary region (a `DetailCard` or the hero card), never in the header title.
- **No breadcrumbs** — orientation is the H1 title, return is the back button, section-jump is the persistent sidebar.
- **Geometry:** stacked (full-width summary above full-width tabbed content) by default; right-rail (`1fr {rail}`) only for entities with a compact, pin-worthy summary worth keeping visible beside wide tab tables (currently Product / Order / Transaction / Payment). Decision + rationale in ../Ombor.Docs/ui-patterns.md #20g (DR-01).
- **Detail-embedded tables** use `DetailTable` (the `detailTableChrome` look: warm header band + a total band or a pager), not the list `DataTable`, with the same shared cells as lists (Tables above). Domain logic (e.g. the partner ledger's running balance) stays in the feature — the chrome styles, it doesn't compute.
- `Selected<Module>Store` holds the open entity + child collections for the detail page (as above).

## Styling

- `src/theme/` is the **only** styling source: colours, typography, spacing, radii, chip colours (values mirrored in `docs/design-tokens.md`). Import tokens `from "theme"`. No colour literals outside it — no hex, `rgb()/rgba()`, or `"#fff"` (use `"common.white"`, palette paths like `"success.main"`, or `designTokens.*`); lint flags them. No magic pixel values where a token exists (`radius.*`, `controlSize`, `dialogPaperSx`).
- `sx` for component styling; the existing `global.scss` / module `.scss` are legacy — don't add new SCSS files.
- No new styling libraries.
- **Text tiers (contrast-checked):** `text.primary` (ink) for content; `text.secondary` (fg2, 6.4:1) for any readable secondary data — SKU, dates, №, company, units; `text.disabled` = fg3 (4.8:1) for tertiary meta and placeholders only. `designTokens.decoration` / `gray400` is for icons, dots and hairlines — **never text**. Text on a tint uses the family's dark shade (`success.dark`, `warning.dark`, … / `chipTokens`), never `warning.main` (3.3:1).
- **Borders:** input / select / control outlines come from the theme (`borderControl`, 3.7:1) — never override `.MuiOutlinedInput-notchedOutline` per component. `divider` / `gray200` / `gray300` are decorative hairlines for cards and tables.
- **Chips:** every status / type / direction pill renders through `StatusPill` (or a semantic wrapper over it: `PaymentStatusChip`, `MovementKindChip`, `TransactionTypeBadge`, `DirectionBadge`, …) keyed by a `chipTokens` name. Never hand-roll a `Box` with `borderRadius: 999`, never dim a chip with `opacity` (use the `neutral` token). Colour meaning per ../Ombor.Docs/ui-patterns.md → Chip colour semantics.
- **Keyboard:** anything clickable is reachable and operable by keyboard. Use `ButtonBase` (or `Button`, `ListItemButton`, `Paper component={ButtonBase}`) for clickable cards, rows, options and tiles so they inherit the theme's focus ring; only where that is impossible add `role="button"` + `tabIndex={0}` + an Enter/Space handler (the global `:focus-visible` rule styles it). Toggle groups expose state: `aria-pressed` on segmented items, `role="tab"` + `aria-selected` on tabs, `role="radio"` + `aria-checked` on option cards, `aria-current` on in-page nav. Never remove the focus outline.
- **Layout:** detail rails use `DETAIL_RAIL_COLUMNS` (rail from `lg`, `minmax(0, 1fr)` main column). The sidebar auto-collapses below 1280px, so page breakpoints may assume the 72px rail there.

## Typography

- Use Typography **variants** for headings and running text: `h1` page / detail titles (26/700), `h2` sections (20/600), `h3` card titles (16/600), `h6` dialog titles (18/700, what `DialogTitle` renders), `body1` 14, `body2` 13, `caption` 12, `overline` 11. Numeric hero values use `typeScale.numStrong` / `numHero`, table money `typeScale.numTable`, always with `numericSx`.
- When a raw `fontSize` is unavoidable in `sx`, it must be a step of that scale — **11, 12, 13, 14, 15, 16, 18, 20, 26** — never a fractional size (12.5, 13.5 …) and never a new step. Weights 400–700 only (Onest 800 is not loaded; lint flags 800).
- Existing literals are legacy: snap them to the scale when you touch the line, don't sweep unrelated files.

## i18n

- **One merged `translation` namespace per language.** All module JSON files in `i18n/ru/` spread into a single per-locale map in `i18n/config.ts`; `keySeparator` and `nsSeparator` are disabled. Components call bare `useTranslation()` — never a namespace argument.
- **Keys are flat dotted strings prefixed with the module name:** `t("partner.table.name")`, `t("partner.detail.actions.archive")`. Cross-module strings go in `common.json` (`common.*` keys).
- **Validation messages are `<module>.validation.*` keys** resolved via module-scope `i18next.t()` in the zod schemas. `config.ts` initializes synchronously (`initAsync: false`) so those calls resolve at import. Known limitation: schema validation messages do not live-switch on language change.
- **Copy is plain language for shopkeepers.** Use the words in the plain-language glossary (`../Ombor.Docs/ui-patterns.md` → Display conventions): «Нам должны», «Партнёр», «Приход товара», «Наценка», «Аванс», «Платёж»… — one term per concept everywhere. Plurals use i18next `_one` / `_few` / `_many` (+ `_other`) keys, never «{{count}} партнёров» for every count.
- Adding a string = adding the key with its **ru** value in the same commit. Uzbek locales are a later backfill — never hardcode to avoid creating a key.
- As modules are rewritten, fold legacy namespaces (`supplier`, `supply`) into the canonical module keys and delete them.
- Per-module namespaces (`useTranslation('partner')`) remain a target — not how the code works today; migrate only as a deliberate pass, never piecemeal.

## API layer

- One `<Module>Api.ts` per module on top of `BaseApi`/`http.ts` (axios). Components never call axios directly; stores call Api classes.
- Query strings via `toQueryParameters`.
- `models/<module>.ts` mirrors the API DTOs exactly — request and response types both. Mock handlers import these same types (see mocking.md); never duplicate shape definitions.

## Formatting & display

Each formatter is a small shared unit — locate and reuse it; never re-implement or hand-assemble.

- Money: always `formatCurrency` (UZS, space-grouped): whole sums without decimals «1 250 000», fractional sums with exactly two «702,01» — never one decimal place, never `Math.round` before formatting (KPIs included). No currency symbols or separators assembled by hand — no `toLocaleString`, no manual grouping. Percentages: `formatPercent` (ru decimal comma).
- Entity ids: `formatEntityId` (numeric id → «№123»). The «№» prefix is never assembled inline and the raw id is never shown bare (display-only; persisted per-document numbering is a v2 concern). A served number that may be missing (legacy payments) goes through `formatOptionalNumber` / `DocNumberCell` (→ «Без номера») and sorts via `entityNumberSortValue` — never fall back to the database id.
- Dates: `formatDate` / `formatDateTime` (`dateUtils`, `date-fns`) — the DSN-1 canonical `DD.MM.YYYY` via the `DATE_FORMAT` constant; one display format per context, reuse the constant.
- Phones: `PhoneListField` + `phoneUtils` — `formatUzNational` groups the body live as «XX XXX XX XX» behind the fixed «+998»; `formatUzPhone` for read-only display.
- Dropdowns: order options with `byLabel` (`sortUtils`, alphabetical, ru-locale, numeric-aware) unless a picker is intentionally relevance/recency ranked.
- Balances: a partner's own balance is signed from the partner's side (DR-27, `BalanceCell`); every other balance and aggregate is colored and natural-language labeled, never signed (ui-patterns #4).
- CSV export (`exportToCsv`): pass amounts/counts as numbers (written plain, decimal comma for ru Excel), phones through `formatUzPhone`, statuses as localized labels, and balances with the same sign the table shows (partner balances partner-side). The formula-injection guard touches only text, never numbers, numeric strings or formatted phones.
- Typed quantities go through `parseWholeQuantity` (`utils/quantityInput.ts`): a «,» / «.» stays visible in the field, flags it with «Количество — только целое число» and is never committed — never stripped or refused keystroke by keystroke, which merges «1,5» into 15 (R21). Gate keystrokes with `isQuantityDraft` (digits, spaces, separators).

## Naming & TypeScript

- Components PascalCase, one exported component per file, named after the file. Utils/hooks camelCase. Config files `<module>TableConfigs.tsx`.
- No `any`. Explicit types on exported functions, store fields, and API boundaries; inference is fine inside function bodies.
- Import order is enforced by `simple-import-sort` — run `npm run lint:fix` rather than ordering by hand.

## File structure & code quality

- **The file-size tripwire (~300 lines → split in the same change), comment discipline, and the quality bar live in `../Ombor.Docs/operating-code.md`** — read it once per session; not restated here.
- **Inline sub-component over ~40 lines, or with its own props interface → its own file.** More than 2–3 inline sub-components → a component folder (`Sidebar/` with `Brand.tsx`, …).
- **Shared types / constants / `sx` builders → sibling `types.ts` / `constants.ts` / `styles.ts`** next to the components that use them.
- **Logic lives in stores/hooks, not JSX** — a component should be testable in isolation.

## Routing

- All paths declared in `routing/paths.ts`; no string literals in `navigate()` or `<Link>`.
- Authenticated pages under `RequireAuth`, auth pages under `GuestOnly`. Detail pages are routed (`/partners/:id`), not state-toggled.
