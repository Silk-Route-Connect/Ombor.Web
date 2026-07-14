# Frontend conventions — Ombor

**Status:** frontend craft doc — the patterns new code must follow; read once per session. Pairs with ../Ombor.Docs/operating-code.md (cross-repo rules: file size, comments, quality bar, git, session discipline) and ../Ombor.Docs/ui-patterns.md (locked UI patterns).
**Last updated:** 2026-07-14

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

## Forms

- react-hook-form + zod (`@hookform/resolvers`). Schema in `schemas/`, form logic in `hooks/<module>/use<Module>Form.ts`, fields in `<Module>FormFields.tsx`, shell in `<Module>FormModal.tsx` built on shared `FormDialog`.
- Forms open as **centered modals** — never drawers.
- Submit buttons are **never disabled**; validation runs on submit and reports inline per field (CLAUDE.md hard rule 5).
- Numeric/money inputs use `NumericField` (react-number-format); phones use `PhoneListField` + `phoneUtils`.
- Dirty-close protection via `useDirtyClose`.

## Tables

- All data tables go through shared `DataTable` (or `ExpandableDataTable`) with a per-module `*TableConfigs` file defining columns — no bespoke `<table>` markup, no raw MUI `Table` in module code. The canonical look (DSN-1: header/footer bands, zebra rows, 52px height, tabular numerics) lives in `components/shared/Table/DataTable/tableConfigs.ts` — never restyle a table per-module.
- **Labels resolve at render time, never at module import.** Config files (table columns, menus, label maps) store i18n keys or accept `t` as a parameter; they must not call `t()` in module scope, or a live language switch won't update them. The one deliberate exception is zod schemas, which resolve validation messages via module-scope `i18next.t()` — see i18n.
- **Every column is sortable by default.** Give a column a `field` (or a `sortValue` accessor for `renderCell`-only columns); set `sortable: false` to opt out. The `actions` column and long free-text/notes columns are never sortable. With no `onSort` the table sorts client-side; pass `onSort` to control ordering from the store. Set the initial order with `defaultSort` — **date-desc** on event/feed tables, **name-asc** on master-data tables.
- **Column order (left → right):** №/ID → date → primary entity → type/status chip → descriptive → money (right-aligned, tabular) → ⋮ actions. New and edited configs follow this; existing tables adopt it in their module passes.
- **Pagination** is 10 / 25 / 50 rows (the `DataTable` default); override per table only with a documented reason.
- Row actions live in a three-dot `ActionMenu` cell via the shared `components/shared/ActionMenuCell/MenuActionCell` — give each row a `tone` (`normal` / `warn` / `danger`) for the DSN-1 menu treatment rather than colouring icons by hand.
- Numeric columns use tabular figures (theme handles this — see ../Ombor.Docs/ui-patterns.md, Display conventions) and right alignment.

## Detail pages

- Detail pages are assembled from shared scaffold components — never a hand-rolled per-module header, tab bar, or card: `DetailPageHeader` (back + **name-only title** + `⋮` `ActionMenu` + optional `primaryAction` slot), `DetailTabs` (underline tabs + count pills), `DetailCard` (summary/rail card primitive), and `detailTableChrome` (warm chrome for detail-embedded tables).
- **Title is the entity name only.** Type chips, company, and all reference fields render in the summary region (a `DetailCard` or the hero card), never in the header title.
- **No breadcrumbs** — orientation is the H1 title, return is the back button, section-jump is the persistent sidebar.
- **Geometry:** stacked (full-width summary above full-width tabbed content) by default; right-rail (`1fr {rail}`) only for entities with a compact, pin-worthy summary worth keeping visible beside wide tab tables (currently Product / Order / Transaction / Payment). Decision + rationale in ../Ombor.Docs/ui-patterns.md #20g (DR-01).
- **Detail-embedded tables** use `detailTableChrome` (warm header band + a total band or a pager footer as config), not the list `DataTable`. Domain logic (e.g. the partner ledger's signed coloring + running balance) stays in the feature, wrapped by the chrome — the chrome styles, it doesn't compute.
- `Selected<Module>Store` holds the open entity + child collections for the detail page (as above).

## Styling

- `theme.ts` is the **only** styling source: colors, typography, spacing, radii. No hardcoded hex values, no magic pixel values — use `sx` with theme tokens.
- `sx` for component styling; the existing `global.scss` / module `.scss` are legacy — don't add new SCSS files.
- No new styling libraries.

## i18n

- **One merged `translation` namespace per language.** All module JSON files in `i18n/ru/` spread into a single per-locale map in `i18n/config.ts`; `keySeparator` and `nsSeparator` are disabled. Components call bare `useTranslation()` — never a namespace argument.
- **Keys are flat dotted strings prefixed with the module name:** `t("partner.table.name")`, `t("partner.detail.actions.archive")`. Cross-module strings go in `common.json` (`common.*` keys).
- **Validation messages are `<module>.validation.*` keys** resolved via module-scope `i18next.t()` in the zod schemas. `config.ts` initializes synchronously (`initAsync: false`) so those calls resolve at import. Known limitation: schema validation messages do not live-switch on language change.
- Adding a string = adding the key with its **ru** value in the same commit. Uzbek locales are a later backfill — never hardcode to avoid creating a key.
- As modules are rewritten, fold legacy namespaces (`supplier`, `supply`) into the canonical module keys and delete them.
- Per-module namespaces (`useTranslation('partner')`) remain a target — not how the code works today; migrate only as a deliberate pass, never piecemeal.

## API layer

- One `<Module>Api.ts` per module on top of `BaseApi`/`http.ts` (axios). Components never call axios directly; stores call Api classes.
- Query strings via `toQueryParameters`.
- `models/<module>.ts` mirrors the API DTOs exactly — request and response types both. Mock handlers import these same types (see mocking.md); never duplicate shape definitions.

## Formatting & display

Each formatter is a small shared unit — locate and reuse it; never re-implement or hand-assemble.

- Money: always `formatCurrency` (UZS, space-grouped «1 250 000»). No currency symbols or separators assembled by hand — no `toLocaleString`, no manual grouping.
- Entity ids: `formatEntityId` (numeric id → «№123»). The «№» prefix is never assembled inline and the raw id is never shown bare (display-only; persisted per-document numbering is a v2 concern).
- Dates: `formatDate` / `formatDateTime` (`dateUtils`, `date-fns`) — the DSN-1 canonical `DD.MM.YYYY` via the `DATE_FORMAT` constant; one display format per context, reuse the constant.
- Phones: `PhoneListField` + `phoneUtils` — `formatUzNational` groups the body live as «XX XXX XX XX» behind the fixed «+998»; `formatUzPhone` for read-only display.
- Dropdowns: order options with `byLabel` (`sortUtils`, alphabetical, ru-locale, numeric-aware) unless a picker is intentionally relevance/recency ranked.
- Balances: colored, natural-language labeled (ui-patterns #4) — never raw +/− signs.

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
