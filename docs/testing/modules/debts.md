# Debts — test cases (T-DBT)

Read-only view over `GET /api/debts/summary` (debt totals and net partner positions — business-rules «Debt totals») and `GET /api/debts` (the unpaid documents) — no writes on this page; precondition events are created via POS, payments, and refund flows.
Read with: [../README.md](../README.md) · [../shared-checklist.md](../shared-checklist.md) · [../fixtures.md](../fixtures.md) · [partners.md](partners.md) (POV trap) · [sales-supplies.md](sales-supplies.md) (POS) · [payments.md](payments.md) (payment modal) · [refunds.md](refunds.md) (refund modal).

## Surfaces

- `/debts` (sidebar «Долги»). Read-only: no create button. The only row actions are the «По партнёрам» ⋮ — «Напомнить о долге» (rows where they owe us) and «Акт сверки»; «Неоплаченные документы» rows have none.
- `DebtSummaryCards` — 4 served cards: «Нам должны» (green) and «Мы должны» (red) are **net partner positions** (opening + unpaid documents ± advances, archived partners included) with pills «N партнёров должны нам» / «мы должны N партнёрам»; «Просрочено» (red when > 0) = unpaid documents past their due date, both directions, pill «N документов»; «Итог расчётов» (color by sign) = the difference, pill «N партнёров». First three clickable (hover arrow), net card is not. Small «UZS» suffix on each.
- `DebtTabs` — underline tabs «По партнёрам» / «Неоплаченные документы» with count pills; right-aligned legend swatches «нам должны» (green) / «мы должны» (red).
- Toolbar — search «Поиск по партнёру или номеру…» (partner name and company on both tabs; document-number substring on the documents tab); direction segmented «Все | Нам должны | Мы должны» (both tabs); «Срок:» dropdown («Все сроки / 0–7 дней / 8–30 дней / Старше 30 дней / 31–60 дней / 60+ дней» — on «По партнёрам» it reads the age of what the partner owes us); clearable «Только просроченные» chip (appears only via the «Просрочено» card, or the topbar bell's «Просрочено N долгов клиентов» alert — which also sets «Нам должны» on «Неоплаченные документы»). «Экспорт» sits on the title row (pattern 11).
- Exits: partner-tab row → `/partners/:id?tab=transactions&status=open`; transaction-tab row → `/supplies/:id` for Supply/SupplyRefund, `/sales/:id` otherwise; partner name inside a row → partner detail (does not open the transaction).

## Traps

Module-specific designed-behavior-looks-like-bug items (shared-checklist §6 still applies):

| Observation | Why it's correct |
| --- | --- |
| A debt green «Нам должны» here renders red/negative on that partner's detail page | /debts and Dashboard are owner-POV; partner detail is partner-POV signed — see partners.md before judging |
| A row with «Возраст» 200 дн and no «просрочка» chip; «Просрочено» card stays 0 | blank `dueDate` = due on receipt, never overdue (contract `overdueDays` = 0 without due date). No UI collects a due date today — a QA run can never create an overdue debt |
| Dashboard «Долги старше 30 дней» ≠ /debts «Просрочено» card | deliberate: dashboard = receivables aged 31+ days; /debts = due-date overdue, both directions. Only the due-date measure is called «Просрочено» (ui-patterns Display conventions) |
| Cards don't move when searching/filtering/switching tabs | the cards are the served totals, never the filtered view |
| «Нам должны» ≠ Σ «Остаток» of the green unpaid documents | the cards are net partner positions: an advance the partner holds, an opening balance, or documents in both directions are netted per partner. The document list's sums are document totals, never called debt (business-rules «Debt totals») |
| A partner row's «Сумма долга» ≠ the sum of its documents; a row with 0 «закрыто авансом» | the row is the served position (= the partner page balance); the notes under the amount name every netted advance («с учётом аванса партнёра …», «с учётом нашего аванса …» — both lines when the partner holds both). A partner whose advance covers its unpaid documents owes nothing |
| A partner with 0 documents on «По партнёрам» | its opening balance alone makes it owe / be owed |
| Red 70 000 sorts above green 60 000 in «Сумма долга» | column sorts by absolute exposure regardless of direction; direction is color-only, no ± signs (#4) |
| Refund rows inside a "debts" list | unpaid SupplyRefund = receivable, unpaid SaleRefund = payable (business-rules Domain model) |
| «Срок» on «По партнёрам» hides every partner we owe | the age is of what the partner owes us (served `oldestAgeDays`); a payable position has none («—») |

## Happy path

Run in doc order — later cases consume earlier cases' data. `<MMDD>` = run date.

### T-DBT-01 · Seed run debt set — cards move by exact gross deltas [happy] ✍
Pre: QA org; stable fixtures «QA Склад А», «QA Касса», «QA Товар Штучный» (supply 10 000 / sale 15 000) per fixtures.md.
Steps: 1. Open /debts; record all four card values + pill counts (baseline — never assert absolutes, fixtures.md). 2. Create partners «QA-<MMDD> Дебитор» (Клиент, opening 0) and «QA-<MMDD> Универсал» (Клиент + Поставщик, opening 0). 3. New Supply (sales-supplies.md): Универсал, QA Склад А, QA Товар Штучный ×10 @ 10 000 = 100 000, no payment; note its «№» (call it D1). 4. New Sale: Дебитор, QA Склад А, ×4 @ 15 000 = 60 000, no payment (D2). 5. New Sale: Универсал, QA Склад А, ×2 @ 15 000 = 30 000, no payment (D3). 6. Reload /debts.
Expect: «Нам должны» +60 000, pill +1 partner (Дебитор); «Мы должны» +70 000, pill +1 partner (Универсал nets 30 000 owed to us against 100 000 we owe → we owe 70 000); «Просрочено» ±0 (no due dates — Traps); «Итог расчётов» delta −10 000, value unsigned, color by net sign (#4); every figure served (R12). Pill plurals correct: «1 партнёр должен нам» / «мы должны 1 партнёру».

### T-DBT-02 · Transaction row anatomy — fresh debt, age 0, direction colors [happy]
Pre: T-DBT-01.
Steps: 1. Tab «Неоплаченные документы»; search «QA-<MMDD>».
Expect: three rows. Each: «№N» via formatEntityId (DR-21) + copyable, timestamp «DD.MM.YYYY HH:MM»; «Возраст» = «0 дн», no «просрочка» chip; badges «Поставка» (D1) / «Продажа» (D2, D3); Сумма/Оплачено/Остаток = 100 000/0/100 000, 60 000/0/60 000, 30 000/0/30 000 — remaining = total − paid (contract DebtDto, R12); «Остаток» green on receivable rows, red on the payable row, no ± signs (#4); leading icon box differs by direction (green ↗ receivable vs orange truck payable).

### T-DBT-03 · Partial payment updates paid/remaining and the receivable card [happy] ✍
Pre: T-DBT-01; record «Нам должны» and «Чистая позиция».
Steps: 1. Payments → «Оплата» from Дебитор, wallet «QA Касса», 25 000, allocated to D2 (payments.md owns the modal; single open item — auto-allocation hits D2). 2. Reload /debts; search «Дебитор».
Expect: D2 row now 60 000 / 25 000 / 35 000 (remaining = total − paid); the row stays listed — partially-paid is still unpaid (contract: unpaid/partially-paid set); «Нам должны» −25 000 with the partner count unchanged; «Итог расчётов» delta −25 000.

### T-DBT-04 · По партнёрам rows are the served positions the cards add up [happy]
Pre: T-DBT-01..03 (Универсал holds BOTH directions: receivable 30 000 + payable 100 000).
Steps: 1. Tab «По партнёрам»; search «QA-<MMDD>». 2. Record the row amounts and the card values.
Expect: «QA-<MMDD> Дебитор»: «Документов» 1, «Сумма долга» 35 000 green, «Старейший долг» «0 дн», «Тип» «Клиент». «QA-<MMDD> Универсал»: «Документов» 2, amount 70 000 red (net position, unsigned, color = direction, #4), «Старейший долг» «—» (it owes us nothing net), «Тип» «Клиент + Поставщик» (the partner's real type). The cards count Универсал net too (its 70 000 inside «Мы должны») — rows and cards agree. Each row equals that partner's page balance in magnitude.

### T-DBT-05 · Clickable summary cards preset the tabs [happy]
Pre: T-DBT-01+.
Steps: 1. From the documents tab click «Нам должны». 2. Click «Мы должны». 3. Click «Просрочено». 4. Sort the documents by any header manually, then click «Просрочено» again. 5. Clear the «Только просроченные» chip via its ×.
Expect: 1→ «По партнёрам», segmented «Нам должны» active, only partners who owe us, largest «Сумма долга» first; 2→ segmented «Мы должны», only partners we owe; 3→ «Неоплаченные документы», segmented «Все», chip «Только просроченные», only rows with an overdue chip (with run data only: filtered empty state «Ничего не найдено»), initial sort «Возраст» desc; 4→ re-click re-seeds the sort even after a manual re-sort (preset seeds via nonce); 5→ chip gone, rows return. «Итог расчётов» is not clickable — no hover arrow, no action.

### T-DBT-06 · Search and tab count pills track the filtered view [happy]
Pre: T-DBT-01+.
Steps: 1. Clear filters; note both tab pills. 2. Search «QA-<MMDD> Универсал». 3. Search D2's bare number (digits only). 4. Search «zzzнет».
Expect: 2→ transactions pill = the run Универсал's open rows, partners pill = 1; 3→ the D2 row is present; any other rows shown must contain the searched digits as a substring of their «№» or partner name/company (search is substring over name, company, and number) — only a row matching neither is a FAIL; 4→ pills 0 and the module empty state «Ничего не найдено» + «Под выбранные фильтры не попал ни один долг…» (module-specific card, not the shared «Нет записей»); cards unchanged throughout (Traps).

### T-DBT-07 · Drill-downs: partner row, transaction row, partner cell [happy]
Pre: T-DBT-01+.
Steps: 1. Partners tab → click the Универсал row. 2. Back. 3. Transactions tab → click the D1 (supply) row. 4. Back. 5. Click the partner name inside D2's row.
Expect: 1→ URL `/partners/<id>?tab=transactions&status=open`; partner detail opens on «Транзакции» with the status filter preset to open/outstanding items inside the table widget (#14; PartnerDetailPage deep-link); 2/4→ back returns to /debts (#20a); 3→ `/supplies/<D1 id>` detail (Supply and SupplyRefund route to /supplies, Sale/SaleRefund to /sales); 5→ navigates to the partner detail, not the transaction — the inner link suppresses the row click.

### T-DBT-08 · CSV exports the current filtered transactions view [happy]
Pre: T-DBT-01+.
Steps: 1. Transactions tab; direction «Нам должны»; search «QA-<MMDD>». 2. «Экспорт» (title row). 3. Switch to «По партнёрам», export again.
Expect: file `debts_<datestamp>.csv`; headers №/Дата/Партнёр/Тип/Возраст (дней)/Сумма/Оплачено/Остаток — the table's column order; rows = exactly the visible filtered receivable run rows (#11 — filtered view); 3→ export still emits transaction-level rows (never partner groups) — current implementation; record as observation only if the owner flags it.

### T-DBT-09 · By-partner row ⋮: reminder and Акт сверки [happy]
Pre: T-DBT-01+ («QA-<MMDD> Дебитор» owes us; a partner we owe exists).
Steps: 1. Tab «По партнёрам» → ⋮ on the Дебитор row. 2. «Напомнить о долге». 3. Close; ⋮ on a red (we-owe) row. 4. «Акт сверки».
Expect: 1→ the menu opens without opening the partner (row click suppressed); rows «Напомнить о долге» and «Акт сверки». 2→ the reminder modal of partners.md T-PRT-11 with the partner's served balance and its oldest unpaid date. 3→ only «Акт сверки» (no debt to remind about). 4→ `/partners/<id>/statement` for that partner; back returns to /debts.

## Edge & negative

### T-DBT-30 · Age-bucket boundaries; a fresh debt lands in «0–7 дней» [edge]
Pre: T-DBT-01+ (all run debts ageDays 0).
Steps: 1. Transactions tab; search «QA-<MMDD>». 2. «Срок: 0–7 дней». 3. «Срок: 8–30 дней». 4. «Срок: Все сроки». 5. Partners tab with «0–7 дней» still set.
Expect: 2→ every run row present (buckets partition on served ageDays: ≤7 / 8–30 / 31–60 / >60; contract: ageDays = days since transaction date); 3→ zero run rows, «Ничего не найдено»; 5→ partners who owe us something 0–7 days old stay (Дебитор), partners we owe drop out (Универсал — no owed age); dropdown shows active styling when non-default.

### T-DBT-31 · Blank due date is never overdue, at any age [edge]
Pre: any org data; run rows from T-DBT-01.
Steps: 1. Transactions tab, «Все сроки», empty search. 2. Scan for rows with large «Возраст» and no chip. 3. Compare the «Просрочено» card against the set of rows carrying a red «просрочка N дн» chip.
Expect: rows without a due date show only «N дн» — no chip regardless of age (contract: overdueDays = 0 when no due date; Traps); «Просрочено» card value = Σ «Остаток» over chip-carrying rows only, both directions counted; since no UI collects a due date, if zero chips exist anywhere the card must read 0 with «0 документов».

### T-DBT-32 · Unpaid SupplyRefund appears as a receivable [edge] ✍
Pre: T-DBT-01 (D1 open, 100 000); record cards.
Steps: 1. Pay D1 in full: «Оплата» from Универсал, direction «Расход» (Both partner ⇒ direction user-set, R14), 100 000 allocated manually to D1 (payments.md). 2. Reload /debts — confirm the D1 row is gone. 3. On `/supplies/<D1>` create a refund: 3 × QA Товар Штучный @ 10 000, reason «QA возврат» (refunds.md; R7). 4. Reload /debts; search «Универсал».
Expect: after 2: «Мы должны» −100 000, count −1 (fully paid transactions leave the read model — contract); after 4: new row, badge «Возврат поставки», remaining 30 000 **green receivable** — an unpaid SupplyRefund is money the supplier owes us (business-rules Domain model); «Нам должны» +30 000, +1; Универсал partner row: 2 транзакции, net 30 000 + 30 000 = 60 000 green; row click → `/supplies/<refund id>`.
Known: the CSV «Тип» column renders this row as «Продажа» (direction-derived label, `DebtPage.tsx` export) while the table badge says «Возврат поставки» — pre-existing Cosmetic inconsistency, report as observation, not new.

### T-DBT-33 · Unpaid SaleRefund appears as a payable; role chip flips [edge] ✍
Pre: T-DBT-03 (D2 remaining 35 000); record cards.
Steps: 1. Pay D2's remaining 35 000 in full («Оплата» from Дебитор, auto-allocates). 2. On `/sales/<D2>` refund 1 unit @ 15 000, reason «QA возврат». 3. Reload /debts; search «Дебитор».
Expect: «Нам должны» −35 000 after step 1; after 2: one row, badge «Возврат», remaining 15 000 **red payable** — an unpaid SaleRefund is money we owe the customer (business-rules Domain model); «Мы должны» +15 000; partners tab: Дебитор row 15 000 red (we owe it), «Тип» «Клиент» (its real type).

### T-DBT-34 · Filters and tab switches never move the cards [edge]
Pre: T-DBT-01+.
Steps: 1. Record all four cards. 2. Apply search «Универсал» + «Срок: 60+» + direction «Мы должны»; toggle both tabs; clear everything.
Expect: cards identical throughout — they are the served totals, never the filtered view; pills and table contents do change with filters (contrast T-DBT-06).

## Reconciliation

Run after the edge cases (their writes are in the books). Perform paired reads back-to-back with no writes in between.

### T-DBT-60 · /debts cards ↔ dashboard receivable/payable KPIs [reconcile]
Steps: 1. /debts: record «Нам должны» / «Мы должны» values + pill counts. 2. Open `/` (dashboard), any period.
Expect: dashboard «Нам должны» / «Мы должны» = the /debts cards = the /partners strip, exactly (one served definition, `GET /api/debts/summary`; `period` moves only the trend and the change badge). The KPI footnotes («N партнёров должны нам» / «мы должны N партнёрам») equal the card pills.

### T-DBT-61 · Dashboard «Долги старше 30 дней» = 31+-day receivable aging, NOT /debts overdue [reconcile]
Steps: 1. /debts transactions tab: direction «Нам должны», «Срок: Старше 30 дней» → sum «Остаток» = S. 2. Record the /debts «Просрочено» card C. 3. Dashboard: record the «Долги старше 30 дней» KPI V; click it.
Expect: V = the dashboard aging panel's 31–60 + 60+ buckets; V = S only for partners with no advance, opening balance or payable documents (the served figure nets those per partner, oldest first). The click lands on /debts «По партнёрам» with «Нам должны» + «Срок: Старше 30 дней» preset — never the «Только просроченные» chip. Do **not** assert V = C — C is due-date overdue across both directions; V ≠ C is designed (Traps). With a young QA org S, C, V may all be 0 — note it.

### T-DBT-62 · Dashboard aging panel ↔ /debts bucket sums [reconcile]
Steps: for each bucket 0-7 / 8-30 / 31-60 / 60+: /debts direction «Нам должны» + matching «Срок» filter → sum «Остаток»; compare with the dashboard aging panel amount for that bucket.
Expect: the panel buckets add up to «Нам должны»; each bucket equals the /debts sum only where no partner nets an advance, opening balance or payable document (the served aging attributes each partner's net receivable to its newest unpaid documents). Payable rows never enter the panel.

### T-DBT-63 · Partner row ↔ partner detail balance card (POV flip) [reconcile]
Pre: T-DBT-32/33 done. The row is the served net position, so it equals the partner balance for every partner (openings and advances included).
Steps: 1. /debts partners tab: record Универсал (expect 60 000 green) and Дебитор (expect 15 000 red). 2. Open each partner's detail page.
Expect: Универсал balance card magnitude 60 000, Дебитор 15 000 (R12 — both served from the same books); the partner page renders **partner-POV** signed/colored — Универсал (owes us) shows red/negative there vs green on /debts; Дебитор (we owe) shows green there vs red on /debts. Opposite colors for the same fact are both correct (partners.md POV trap; repo-state Partners decision amending #4).

### T-DBT-64 · Partner rows add up to the cards [reconcile]
Steps: 1. Clear all filters. 2. Partners tab: R = Σ green «Сумма долга», P = Σ red. 3. Cards.
Expect: R = «Нам должны», P = «Мы должны», R − P = «Итог расчётов» (magnitude + color by sign); the «Нам должны» pill = the number of green rows, «Мы должны» = red rows. The documents tab sums (Σ «Остаток») equal R / P only when no partner holds an advance, has an opening balance or documents in both directions — a difference there is the designed netting, not drift.
