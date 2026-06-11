# Frontend conventions — Ombor

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
i18n/ru/        <module>.json — the module's namespace
```

`SidePane/` folders are legacy (CLAUDE.md hard rule 3): never extend, replace with `Detail/` + a routed detail page when the module is rewritten, then delete.

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

- All data tables go through shared `DataTable` (or `ExpandableDataTable`) with a per-module `*TableConfigs` file defining columns — no bespoke `<table>` markup, no raw MUI `Table` in module code.
- **Labels resolve at render time, never at module import.** Config files (table columns, menus, label maps) store i18n keys or accept `t` as a parameter; they must not call `t()` in module scope, or a live language switch won't update them.
- Row actions live in an `ActionMenu` (three-dot) cell via the shared ActionMenuCell components.
- Numeric columns use tabular figures (theme handles this — see design-handoff) and right alignment.

## Styling

- `theme.ts` is the **only** styling source: colors, typography, spacing, radii. No hardcoded hex values, no magic pixel values — use `sx` with theme tokens.
- `sx` for component styling; the existing `global.scss` / module `.scss` are legacy — don't add new SCSS files.
- No new styling libraries.

## i18n

- Namespace = module: `useTranslation('partner')`. Cross-module strings go in `common`.
- Keys are camelCase, nested by screen area: `form.nameLabel`, `table.balanceColumn`, `detail.actions.archive`.
- Adding a string = adding the key with its **ru** value in the same commit. Uzbek locales are a later backfill — never hardcode to avoid creating a key.
- Validation messages come from `validation` namespace, wired through zod schemas.
- As modules are rewritten, fold legacy namespaces (`supplier`, `supply`) into the canonical module namespaces and delete them.

## API layer

- One `<Module>Api.ts` per module on top of `BaseApi`/`http.ts` (axios). Components never call axios directly; stores call Api classes.
- Query strings via `toQueryParameters`.
- `models/<module>.ts` mirrors the API DTOs exactly — request and response types both. Mock handlers import these same types (see mocking.md); never duplicate shape definitions.

## Formatting & display

- Money: always `formatCurrency` (UZS). No currency symbols or separators assembled by hand.
- Dates: `date-fns` via `dateUtils` — one display format per context, reuse existing format constants.
- Balances: colored, natural-language labeled (see design-handoff) — never raw +/− signs.

## Naming & TypeScript

- Components PascalCase, one exported component per file, named after the file. Utils/hooks camelCase. Config files `<module>TableConfigs.tsx`.
- No `any`. Explicit types on exported functions, store fields, and API boundaries; inference is fine inside function bodies.
- Import order is enforced by `simple-import-sort` — run `npm run lint:fix` rather than ordering by hand.

## Routing

- All paths declared in `routing/paths.ts`; no string literals in `navigate()` or `<Link>`.
- Authenticated pages under `RequireAuth`, auth pages under `GuestOnly`. Detail pages are routed (`/partners/:id`), not state-toggled.
