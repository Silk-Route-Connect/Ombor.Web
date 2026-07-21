# Shared checklist — cross-cutting assertions

Applied to **every screen** the run visits, in every tier. Module docs never repeat these — they only add module-specific cases. Citations: `R n` = `../../../Ombor.Docs/business-rules.md` rule n · `#n` = `../../../Ombor.Docs/ui-patterns.md` pattern n · `DR-n` = `../../../Ombor.Docs/decision-log.md` · `F n` = [../frontend-gaps.md](../frontend-gaps.md).

## 1. Forbidden-affordance scan (any hit = defect)

| Violation                                                                                                     | Rule            |
| ------------------------------------------------------------------------------------------------------------- | --------------- |
| Edit or delete affordance on a transaction, payment, payroll, stock adjustment, or transfer — rows, detail pages, kebab menus | R1, #8          |
| Disabled/greyed submit or action button (validation must run on submit and report inline)                      | hard rule 5, #7 |
| Breadcrumbs anywhere                                                                                            | #20f, DR-04     |
| Side pane / drawer form — exception: legacy Products & Categories, pending rebuild                              | #1, #3          |
| Currency selector, exchange rate, any non-UZS currency artifact                                                 | R33             |
| «Сумма, UZS»-style column headers (currency unit only via the shared `UzsUnit` component, never in headers)     | conventions     |
| `+`/`−` signs on balance figures where direction is conveyed by color/label/chip (see POV trap in §5)           | #4              |
| Raw enum value leaking to UI: `Both`, `Sale`, `Open`, `Cash`…                                                   | #15, i18n       |
| Raw i18n key visible (literal `partner.table.name` on screen)                                                   | conventions     |
| Latin document prefixes (`ORD-42`, `PAY-7`) — document numbers render only as «№42»                             | DR-21           |
| Hardcoded/English UI strings — known exceptions listed under F16                                                | hard rule 2     |

## 2. Every list page

- `PageHeader`: h1 title; dataset actions on the title row (primary create, «Экспорт»); view-shaping controls (search, filters, tabs, archive toggle) on the row below (#11).
- `DataTable` chrome: header/footer bands, zebra rows, 52px height, tabular numerals; column order № → date → primary entity → type/status chip → descriptive → money (right-aligned) → `⋮` (#21).
- Sorting: columns sortable by default (not actions/long-text); default sort date-desc on event feeds, name-asc on master data (#21).
- Pager 10/25/50, ru-localized (#21). All lists fetch-all and page client-side — sluggishness on large data is **F14 (known)**.
- Row actions only inside the `⋮` `ActionMenu` — inline icon buttons are a defect (#21). Archived rows carry the «Архив» badge.
- Archive control (Products, Partners, Wallets, Warehouses only): segmented «Активные | Архив» that **swaps** the dataset — archived rows never mixed into the active list (#13).
- «Экспорт» downloads a client-side CSV of the **current filtered view**.
- Empty table shows hardcoded «Нет записей» — **F16 (known)**, not a new find.

## 3. Every detail page

- Routed URL; deep-link and browser refresh both work (#1). Back button returns to the list (history-back with list fallback); no breadcrumb (#20a/20f).
- Title = entity name only, or «№N» for numbered events — no chips, no meta line in the title (#20e). Edit/archive/restore only in the `⋮` kebab (#2); at most one `primaryAction` header button (child-event creation).
- Tabs are underline-style with count pills (#20b).
- Layout: right-rail **only** on Product, Order, Transaction, Payment; stacked everywhere else (#20g, DR-01) — a missing rail on Partner/Wallet/Warehouse/Employee is correct.
- Detail-embedded tables use the warm `detailTableChrome` (header band + total band or pager), not the list `DataTable` (#20d); sortable via `DetailSortHeader`; tab-level filters live **inside** the table widget (#14).

## 4. Every form (modal)

- Centered modal, never a drawer (#3).
- Submit always enabled; invalid submit → inline per-field errors with autofocus to the first error; **no top-of-form error banner** (DR-24, #18). Server/submit failure → notistack toast; a silent failure is a defect.
- Closing a dirty form asks to confirm discarding (useDirtyClose). Enter / Ctrl+Enter submits (XC-11).
- Money inputs group thousands live while typing (`MoneyField`); phone inputs render «+998 XX XXX XX XX» with a fixed prefix.
- Required-field labels carry an error-colored asterisk.

## 5. Formats & display (any screen)

- Money: «1 250 000» — space-grouped, no symbol, tabular figures (`formatCurrency`).
- Dates: `DD.MM.YYYY`; event timestamps «07.07.2026 16:33» (space separator).
- Document/entity numbers: «№N» via `formatEntityId`. Transactions share **one** number series across Sale/Supply/refunds (DR-21) — a Sale «№5» followed by a Supply «№6» is correct.
- Balances: color + a direction **word**, never a bare signed number (#4). Implemented vocabulary: owner-POV buckets «Нам должны» / «Мы должны» on Debts, Dashboard, and the POS balance card («Без долга» at zero); partner surfaces render partner-POV **signed** figures — a documented divergence from #4, see `modules/partners.md` Traps before judging signs/colors there. The literal canon strings «Вам должны…»/«Нет долга» exist nowhere in the app — do not assert them.
- PaymentType labels: Оплата · Депозит · Вывод · Зарплата · Общий (#17). PartnerType `Both` → «Клиент + Поставщик» (#15).
- Chips: Sale=teal, Supply=saffron, refunds outlined; status Open=info, PartiallyPaid=warning, Overdue=error, Closed=success; Приход=green / Расход=red pills with unsigned amounts. Green/red on a *number* is reserved for money figures (#4); chips may use the full semantic palette.

## 6. Traps — designed behavior that looks like a bug (never report these)

| Observation                                                                                   | Why it's correct                                  |
| ---------------------------------------------------------------------------------------------- | ------------------------------------------------- |
| No edit/delete on transactions, payments, payroll, adjustments, transfers                       | R1 — corrections are counter-events               |
| Delete visible on a referenced Product/Partner/Wallet/Warehouse; clicking explains and offers archive | DR-20, #19 — served `isDeletable` gates the outcome, not the button |
| POS partner picker starts empty; sale refuses to submit without a partner                       | R39, #9 — no walk-in partner by design            |
| No «оплатить долги» button on partner page; standalone-payment allocation ordering imperfect    | DR-05 — deferred to v2                            |
| One number series shared by Sales and Supplies                                                  | DR-21                                             |
| Archived wallet with balance / warehouse with stock still counted in totals                     | R31 — hidden from pickers, not from value         |
| No quantity/cost inputs on the product form                                                     | R22 — stock enters only via opening stock / supply |
| Integer-only quantity inputs                                                                    | DR-12/DR-22 — fractional slice pending            |
| No receipt printing, no Reports module, no roles/permissions UI                                 | DR-09 · v2 · R35/DR-07                            |
| «Отчёты» absent from sidebar; no section-label headings in nav                                  | #10                                               |
| Global search field and notifications bell do nothing                                           | known stubs (see smoke.md)                        |
| Zod validation messages don't re-translate on live language switch                              | documented limitation (conventions §i18n)         |
| Starter partner/wallet/warehouse/category fully editable and deletable                          | R42 — ordinary entities, no system flag           |
| Wallet «Наши средства» smaller than its balance                                                 | R12 — advances held are someone else's claim      |
| «Все даты» filters / static pager rows absent compared to prototypes                            | #12 — inert prototype affordances omitted         |
