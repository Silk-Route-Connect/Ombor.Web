# Employee & Payroll redesign — design spec

**Date:** 2026-06-01
**Initiative:** UI/UX redesign — "Bukhara Teal" (Phase 4, page-by-page)
**Screens:** Employee list, Employee detail (new), Payroll list
**Status:** Approved design → ready for implementation plan

## Context

There is **no dedicated Employee or Payroll prototype** in the Claude Design hand-off
bundle (`docs/design-handoff/`). The designed screens are Dashboard, Warehouses,
Warehouse Detail, Partners, Sales, Transaction Entry, Write-off, and Debts & Payments.
This redesign therefore **applies the established design system + the Partners reference
pattern** (the canonical "person/entity list") to Employee/Payroll, adapted to their data
model — rather than recreating a given mockup.

Source of truth for visuals: `src/theme.ts` (Bukhara Teal tokens) and the Partners
prototype `docs/design-handoff/project/partners.jsx`. Style via theme tokens only.

### Data realities (verified)

- **Employee** (`src/models/employee.ts`): `id, name, position, status, salary,
  dateOfEmployment, contactInfo{phoneNumbers[], email?, address?, telegramAccount?}`.
  - `status ∈ { Active, Terminated, OnVacation }` (employees use a **status**, not
    archive). Supports **hard delete**.
  - `salary` is a bare `number` with **no currency** in the model.
- **EmployeeStore** already exposes `getById(employeeId)` (sets `selectedEmployee`) — a
  routed detail page is feasible with no store changes.
- **Payment / Payroll** (`src/models/payment.ts`): `Payment{ id, employeeId?,
  employeeName?, notes?, amount, date, direction, type, components[], allocations[] }`.
  `components[]` each carry `currency ∈ {UZS,USD,RUB}` + `method`. **A payment can span
  multiple currency components**, so payroll money must be currency-aware.
- Sidebar nav already lists Сотрудники (`/employees`) + Зарплаты (`/payrolls`) under
  Команда → Персонал. The detail page is a child route → **no nav change**.

### Approved scope decisions

1. **Depth:** Full pattern adoption (rebuild both pages to the design system end-to-end,
   including form → side-sheet and a new detail page).
2. **Employee detail:** Full detail page at `/employees/:id` (replaces the 850px drawer),
   consistent with Warehouse Detail and Partners' full-page ledger.
3. **Employee summary cards:** count + status breakdown + salary fund.
4. **Payroll summary cards:** paid this month + count + employees paid.
5. **Table engine:** Reuse the shared `DataTable` (express the design via column
   renderers + a design-matching card/toolbar shell). No second table implementation.

## Shared primitives (new, in `src/components/shared/`)

- **`SummaryCards`** — responsive row of lightweight stat cards (label + tabular hero
  number + optional sub-line). Used by Employee list, Payroll list, and Employee detail
  header. Warehouse's existing `Summary` is left as-is (no unrelated refactor).
- **`InitialsAvatar`** — deterministic teal-toned initials avatar matching the Partners
  `Avatar`. Reuse an existing shared avatar if one is present; otherwise add a small one.
  Used in employee rows, the payroll employee cell, and detail headers.
- **`StatusChip`** — `EmployeeStatus` → theme tone: `Active`→success, `OnVacation`→warning,
  `Terminated`→neutral/grey. MUI `Chip`, soft variant.
- **`SegmentedControl`** — the design's `seg` pill toggle (styled MUI `ToggleButtonGroup`),
  used for the status filter.
- **`FormSheet`** — right-anchored MUI `Drawer` styled to the design `sheet`: sticky
  header (title + subtitle + close), scrollable body, sticky footer (Cancel + primary).
  Replaces the center `Dialog` container for forms. **It only swaps the container** — the
  existing `react-hook-form` + `zod` hooks (`useEmployeeForm`, `usePayrollForm`) and field
  components are preserved so form behavior is unchanged.

## Screen 1 — Employee list (`/employees`)

- **page-head:** `Сотрудники` title + subtitle (`Команда`) + primary `Новый сотрудник`.
- **Summary row (4 cards, all derived client-side):** `Всего сотрудников`, `Активные`,
  `В отпуске`, `Фонд оплаты труда` (sum of **active** salaries).
  - *Data note:* `salary` has no currency → the fund is labeled **UZS by assumption**,
    isolated in one place so it is easy to change when the backend clarifies currency.
- **list-toolbar:** existing `SearchInput` + **segmented status filter**
  (`Все / Активные / В отпуске / Уволенные`) replacing today's dropdown + result count.
- **Table** (shared `DataTable`, new renderers):
  - **Сотрудник** — `InitialsAvatar` + name, `position` as muted second line.
  - **Статус** — `StatusChip`.
  - **Оклад** — right-aligned tabular hero (UZS).
  - **Дата приёма** — formatted date.
  - **Телефон** — first phone or `—`.
  - **⋮** — `Выплата` / `Редактировать` / `Удалить` (same actions as today).
  - **Row click → navigate to `/employees/:id`** (no more drawer).
- Empty state via `DataTable`'s i18n empty state.

## Screen 2 — Employee detail (`/employees/:id`) — NEW

Mirrors `WarehouseDetailPage`.

- New route in `App.tsx` under `AppLayout`. Page reads the `:id` param and calls
  `employeeStore.getById(id)`; renders from `selectedEmployee`.
- **Header:** back arrow → `/employees`, `InitialsAvatar` + name + position + `StatusChip`;
  actions: `Выплата` + **⋮** (`Редактировать` / `Удалить`).
- **Summary cards:** `Оклад`, `Дата приёма`, `Всего выплачено` (sum of this employee's
  payroll, **currency-aware**).
- **Tabs:**
  - `Детали` — contact info (phones / email / address / telegram) + employment info.
    Reuses the existing `DetailsTab` content.
  - `Зарплаты` — this employee's payroll history via the shared `PayrollTable` (compact
    mode) filtered by `employeeId`. Reuses the existing `PayrollTab` data source.
- **Dialogs** (form / payment / delete) extracted into a shared **`EmployeeDialogs`**
  component (mirroring `WarehouseDialogs`) so list + detail share one set, driven by the
  store's `dialogMode`. The old `EmployeeSidePane` is removed from the list.

## Screen 3 — Employee create/edit (side-sheet)

- `EmployeeFormModal` content moved into `FormSheet`. Fields preserved, restyled:
  name, position, **status (segmented)**, salary (amount input, UZS), date of employment,
  and a contact block — phone-list (add/remove) + email + telegram + address — matching
  the Partners sheet. Titles: `Новый сотрудник` / `Редактировать сотрудника`.
- `useEmployeeForm` + validation unchanged.

## Screen 4 — Payroll list (`/payrolls`)

- **page-head:** `Зарплаты` + subtitle + primary `Новая выплата`.
- **Summary row (3 cards):** `Выплачено за месяц` (current-month sum), `Количество выплат`,
  `Сотрудников оплачено`. **Currency-aware** — periods that mix currencies are grouped
  per-currency, never summed across currencies.
- **list-toolbar:** search + the existing **employee filter** (kept as Select/Autocomplete,
  not segmented — long list) + count.
- **Table** (shared `DataTable`, full mode): payment id · **employee**
  (`InitialsAvatar` + name) · date · **amount** (tabular hero) + currency · **method**
  (chip) · notes · **⋮** (`Редактировать` / `Удалить`). Restyled renderers over the
  existing columns.
- **Form:** `PayrollFormModal` content moved into `FormSheet`; `usePayrollForm` unchanged.

## i18n

- Every new key added to **both** `ru` and `uz` (`src/i18n/{ru,uz}/employee.json` and
  `payroll.json`); reuse existing keys (`employeesTitle`, `add`,
  `searchEmployeesPlaceholder`, etc.) where present.
- Inline RU strings are not allowed; route all visible text through `translate()`.

## Data honesty (do not fabricate)

- Salary-fund currency is an explicit **assumption (UZS)**, flagged and isolated.
- Payroll sums are **currency-aware** and never cross currencies.
- Any missing value renders `—`. Money formatted via existing `formatMoney`.

## Out of scope

- Export buttons (no backend export endpoint).
- UZ-Cyrillic locale / live language switch.
- Any backend or API changes.

## Verification (per the project's broken `type-check`)

For each touched file:
1. `node_modules/.bin/prettier --write <files>`
2. `node_modules/.bin/eslint --max-warnings 0 <files>`
3. Isolated single-file `tsc` (the documented `--moduleResolution node …` invocation).
4. Live preview via Claude Preview MCP (`ombor-web`, port 3000; login
   `+998900000001` / `Password123!`); inspect computed styles for color/font claims
   rather than trusting screenshots.

## Affected / new files (indicative)

**New**
- `src/components/shared/SummaryCards/*`
- `src/components/shared/StatusChip/*`, `SegmentedControl/*`, `FormSheet/*`,
  `InitialsAvatar/*` (avatar only if none exists)
- `src/pages/EmployeeDetailPage.tsx`
- `src/components/employee/EmployeeDialogs.tsx`
- `src/components/employee/Detail/*`
- `src/utils/employeeStats.ts`, `src/utils/payrollStats.ts` (summary derivations)

**Modified**
- `src/App.tsx` (add `/employees/:id` route)
- `src/pages/EmployeePage.tsx`, `src/pages/PayrollPage.tsx`
- `src/components/employee/Header/*`, `Table/*`, `Form/*`; remove `SidePane` from the list
- `src/components/payroll/Header/*`, `Table/*`, `Form/*`
- `src/i18n/{ru,uz}/employee.json`, `payroll.json`
