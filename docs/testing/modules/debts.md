# Debts — test cases (T-DBT)

Read-only aggregate over `GET /api/debts` — no writes on this page; precondition events are created via POS, payments, and refund flows.
Read with: [../README.md](../README.md) · [../shared-checklist.md](../shared-checklist.md) · [../fixtures.md](../fixtures.md) · [partners.md](partners.md) (POV trap) · [sales-supplies.md](sales-supplies.md) (POS) · [payments.md](payments.md) (payment modal) · [refunds.md](refunds.md) (refund modal).

## Surfaces

- `/debts` (sidebar «Долги»). Read-only: no create button, no `⋮` menus, no row actions — correct, not a gap.
- `DebtSummaryCards` — 4 cards: «Нам должны» (green), «Мы должны» (red), «Просрочено» (orange), «Чистая позиция» (color by sign). First three clickable (hover arrow), net card is not. Each carries a «N транзакций» pill and a small «UZS» suffix.
- `DebtTabs` — underline tabs «По партнёрам» / «По транзакциям» with count pills; right-aligned legend swatches «нам должны» (green) / «мы должны» (red).
- Toolbar — search «Поиск по партнёру или номеру…» (matches partner name, company, document-number substring); «Срок:» dropdown («Все сроки / 0–7 дней / 8–30 дней / 31–60 дней / 60+ дней»); direction segmented «Все | Нам должны | Мы должны» (**transactions tab only** — absent on partners tab by design); clearable «Только просроченные» chip (appears only via the «Просрочено» card); «Скачать CSV».
- Exits: partner-tab row → `/partners/:id?tab=transactions&status=open`; transaction-tab row → `/supplies/:id` for Supply/SupplyRefund, `/sales/:id` otherwise; partner name inside a row → partner detail (does not open the transaction).

## Traps

Module-specific designed-behavior-looks-like-bug items (shared-checklist §6 still applies):

| Observation | Why it's correct |
| --- | --- |
| A debt green «Нам должны» here renders red/negative on that partner's detail page | /debts and Dashboard are owner-POV; partner detail is partner-POV signed — see partners.md before judging |
| A row with «Возраст» 200 дн and no «просрочка» chip; «Просрочено» card stays 0 | blank `dueDate` = due on receipt, never overdue (contract `overdueDays` = 0 without due date). No UI collects a due date today — a QA run can never create an overdue debt |
| Dashboard «Просрочено» ≠ /debts «Просрочено» card | deliberate: dashboard = receivables aged 31+ days; /debts = due-date overdue, both directions (contract; repo-state Dashboard) |
| Cards don't move when searching/filtering/switching tabs | summary is a global snapshot over ALL open debts, never the filtered view |
| Partner-tab «Тип» chip contradicts the partner's real type (a Customer shown as «Поставщик») | chip encodes the debt role: «Клиент» = they owe us, «Поставщик» = we owe them |
| Red 70 000 sorts above green 60 000 in «Сумма долга» | column sorts by absolute exposure regardless of direction; direction is color-only, no ± signs (#4) |
| Refund rows inside a "debts" list | unpaid SupplyRefund = receivable, unpaid SaleRefund = payable (business-rules Domain model) |
| Direction segmented missing on «По партнёрам» | tab-scoped by design — partner rows are already direction-netted (repo-state Debts) |

## Happy path

Run in doc order — later cases consume earlier cases' data. `<MMDD>` = run date.

### T-DBT-01 · Seed run debt set — cards move by exact gross deltas [happy] ✍
Pre: QA org; stable fixtures «QA Склад А», «QA Касса», «QA Товар Штучный» (supply 10 000 / sale 15 000) per fixtures.md.
Steps: 1. Open /debts; record all four card values + pill counts (baseline — never assert absolutes, fixtures.md). 2. Create partners «QA-<MMDD> Дебитор» (Клиент, opening 0) and «QA-<MMDD> Универсал» (Клиент + Поставщик, opening 0). 3. New Supply (sales-supplies.md): Универсал, QA Склад А, QA Товар Штучный ×10 @ 10 000 = 100 000, no payment; note its «№» (call it D1). 4. New Sale: Дебитор, QA Склад А, ×4 @ 15 000 = 60 000, no payment (D2). 5. New Sale: Универсал, QA Склад А, ×2 @ 15 000 = 30 000, no payment (D3). 6. Reload /debts.
Expect: «Нам должны» +90 000, pill +2; «Мы должны» +100 000, pill +1; «Просрочено» ±0 (no due dates — Traps); «Чистая позиция» delta −10 000, value unsigned, color by net sign (#4); figures served, page only sums them (R12). Pill plurals correct: 1 «транзакция» / 2–4 «транзакции» / 5+ «транзакций».
Known: F16 — plural words and the card «UZS» unit are hardcoded strings.

### T-DBT-02 · Transaction row anatomy — fresh debt, age 0, direction colors [happy]
Pre: T-DBT-01.
Steps: 1. Tab «По транзакциям»; search «QA-<MMDD>».
Expect: three rows. Each: «№N» via formatEntityId (DR-21) + copyable, timestamp «DD.MM.YYYY HH:MM»; «Возраст» = «0 дн», no «просрочка» chip; badges «Поставка» (D1) / «Продажа» (D2, D3); Сумма/Оплачено/Остаток = 100 000/0/100 000, 60 000/0/60 000, 30 000/0/30 000 — remaining = total − paid (contract DebtDto, R12); «Остаток» green on receivable rows, red on the payable row, no ± signs (#4); leading icon box differs by direction (green ↗ receivable vs orange truck payable).

### T-DBT-03 · Partial payment updates paid/remaining and the receivable card [happy] ✍
Pre: T-DBT-01; record «Нам должны» and «Чистая позиция».
Steps: 1. Payments → «Оплата» from Дебитор, wallet «QA Касса», 25 000, allocated to D2 (payments.md owns the modal; single open item — auto-allocation hits D2). 2. Reload /debts; search «Дебитор».
Expect: D2 row now 60 000 / 25 000 / 35 000 (remaining = total − paid); the row stays listed — partially-paid is still a debt (contract: unpaid/partially-paid set); «Нам должны» −25 000 with count unchanged; «Чистая позиция» delta −25 000.

### T-DBT-04 · По партнёрам groups net per partner while cards stay gross [happy]
Pre: T-DBT-01..03 (Универсал holds BOTH directions: receivable 30 000 + payable 100 000).
Steps: 1. Tab «По партнёрам»; search «QA-<MMDD>». 2. Record the Универсал row amount AND the gross card values.
Expect: «QA-<MMDD> Дебитор»: 1 транзакция, «Сумма долга» 35 000 green, «в сроке» under «Старейший долг». «QA-<MMDD> Универсал»: count 2, oldest = today, amount = |30 000 − 100 000| = 70 000 red (per-partner signed net; unsigned display, color = direction, #4); «Тип» chip renders the newest row's debt role — expected «Клиент» (D3 is newest). **Explicit compare:** the cards count this partner gross (its 30 000 inside «Нам должны», its 100 000 inside «Мы должны») while its row shows net 70 000 — internally consistent arithmetic, but record the observed pair in the report: the gross-cards-vs-net-rows presentation is a standing product-audit concern (not an F-item; report as observation with numbers, not a new defect).

### T-DBT-05 · Clickable summary cards preset the transactions tab [happy]
Pre: T-DBT-01+.
Steps: 1. From the partners tab click «Нам должны». 2. Click «Мы должны». 3. Sort by any header manually, then click «Мы должны» again. 4. Click «Просрочено». 5. Clear the «Только просроченные» chip via its ×.
Expect: 1→ jumps to «По транзакциям», segmented «Нам должны» active, receivable rows only, initial sort «Остаток» desc; 2→ segmented «Мы должны», payable rows only; 3→ re-click re-seeds the sort even after a manual re-sort (repo-state Debts decision — preset seeds via nonce); 4→ segmented resets to «Все», chip «Только просроченные» appears, only rows with an overdue chip remain (with run data only: filtered empty state «Ничего не найдено»), initial sort «Возраст» desc; 5→ chip gone, rows return. «Чистая позиция» is not clickable — no hover arrow, no action.

### T-DBT-06 · Search and tab count pills track the filtered view [happy]
Pre: T-DBT-01+.
Steps: 1. Clear filters; note both tab pills. 2. Search «QA-<MMDD> Универсал». 3. Search D2's bare number (digits only). 4. Search «zzzнет».
Expect: 2→ transactions pill = the run Универсал's open rows, partners pill = 1; 3→ the D2 row is present; any other rows shown must contain the searched digits as a substring of their «№» or partner name/company (search is substring over name, company, and number) — only a row matching neither is a FAIL; 4→ pills 0 and the module empty state «Ничего не найдено» + «Под выбранные фильтры не попала ни одна транзакция…» (module-specific card, not the shared «Нет записей»); cards unchanged throughout (Traps).

### T-DBT-07 · Drill-downs: partner row, transaction row, partner cell [happy]
Pre: T-DBT-01+.
Steps: 1. Partners tab → click the Универсал row. 2. Back. 3. Transactions tab → click the D1 (supply) row. 4. Back. 5. Click the partner name inside D2's row.
Expect: 1→ URL `/partners/<id>?tab=transactions&status=open`; partner detail opens on «Транзакции» with the status filter preset to open/outstanding items inside the table widget (#14; PartnerDetailPage deep-link); 2/4→ back returns to /debts (#20a); 3→ `/supplies/<D1 id>` detail (Supply and SupplyRefund route to /supplies, Sale/SaleRefund to /sales); 5→ navigates to the partner detail, not the transaction — the inner link suppresses the row click.

### T-DBT-08 · CSV exports the current filtered transactions view [happy]
Pre: T-DBT-01+.
Steps: 1. Transactions tab; direction «Нам должны»; search «QA-<MMDD>». 2. «Скачать CSV». 3. Switch to «По партнёрам», export again.
Expect: file `debts_<datestamp>.csv`; headers Документ/Дата/Тип/Партнёр/Сумма/Оплачено/Остаток/Возраст (дней); rows = exactly the visible filtered receivable run rows (#11 — filtered view); 3→ export still emits transaction-level rows (never partner groups) — current implementation; record as observation only if the owner flags it.

## Edge & negative

### T-DBT-30 · Age-bucket boundaries; a fresh debt lands in «0–7 дней» [edge]
Pre: T-DBT-01+ (all run debts ageDays 0).
Steps: 1. Transactions tab; search «QA-<MMDD>». 2. «Срок: 0–7 дней». 3. «Срок: 8–30 дней». 4. «Срок: Все сроки». 5. Partners tab with «0–7 дней» still set.
Expect: 2→ every run row present (buckets partition on served ageDays: ≤7 / 8–30 / 31–60 / >60; contract: ageDays = days since transaction date); 3→ zero run rows, «Ничего не найдено»; 5→ the age filter also constrains partner groups (shared filter across tabs); dropdown shows active styling when non-default.

### T-DBT-31 · Blank due date is never overdue, at any age [edge]
Pre: any org data; run rows from T-DBT-01.
Steps: 1. Transactions tab, «Все сроки», empty search. 2. Scan for rows with large «Возраст» and no chip. 3. Compare the «Просрочено» card against the set of rows carrying a red «просрочка N дн» chip.
Expect: rows without a due date show only «N дн» — no chip regardless of age (contract: overdueDays = 0 when no due date; Traps); «Просрочено» card value = Σ «Остаток» over chip-carrying rows only, both directions counted; since no UI collects a due date, if zero chips exist anywhere the card must read 0 with «0 транзакций».

### T-DBT-32 · Unpaid SupplyRefund appears as a receivable [edge] ✍
Pre: T-DBT-01 (D1 open, 100 000); record cards.
Steps: 1. Pay D1 in full: «Оплата» from Универсал, direction «Расход» (Both partner ⇒ direction user-set, R14), 100 000 allocated manually to D1 (payments.md). 2. Reload /debts — confirm the D1 row is gone. 3. On `/supplies/<D1>` create a refund: 3 × QA Товар Штучный @ 10 000, reason «QA возврат» (refunds.md; R7). 4. Reload /debts; search «Универсал».
Expect: after 2: «Мы должны» −100 000, count −1 (fully paid transactions leave the read model — contract); after 4: new row, badge «Возврат поставки», remaining 30 000 **green receivable** — an unpaid SupplyRefund is money the supplier owes us (business-rules Domain model); «Нам должны» +30 000, +1; Универсал partner row: 2 транзакции, net 30 000 + 30 000 = 60 000 green; row click → `/supplies/<refund id>`.
Known: the CSV «Тип» column renders this row as «Продажа» (direction-derived label, `DebtPage.tsx` export) while the table badge says «Возврат поставки» — pre-existing Cosmetic inconsistency, report as observation, not new.

### T-DBT-33 · Unpaid SaleRefund appears as a payable; role chip flips [edge] ✍
Pre: T-DBT-03 (D2 remaining 35 000); record cards.
Steps: 1. Pay D2's remaining 35 000 in full («Оплата» from Дебитор, auto-allocates). 2. On `/sales/<D2>` refund 1 unit @ 15 000, reason «QA возврат». 3. Reload /debts; search «Дебитор».
Expect: «Нам должны» −35 000 after step 1; after 2: one row, badge «Возврат», remaining 15 000 **red payable** — an unpaid SaleRefund is money we owe the customer (business-rules Domain model); «Мы должны» +15 000; partners tab: Дебитор row 15 000 red with «Тип» chip «Поставщик» although the partner's real type is Клиент — the debt-role chip (Traps), not a defect.

### T-DBT-34 · Filters and tab switches never move the cards [edge]
Pre: T-DBT-01+.
Steps: 1. Record all four cards. 2. Apply search «Универсал» + «Срок: 60+» + direction «Мы должны»; toggle both tabs; clear everything.
Expect: cards identical throughout — the summary is computed over the full served list, never the filtered view; the direction segmented exists only on «По транзакциям» and never affects partner groups (Traps); pills and table contents do change with filters (contrast T-DBT-06).

## Reconciliation

Run after the edge cases (their writes are in the books). Perform paired reads back-to-back with no writes in between.

### T-DBT-60 · /debts cards ↔ dashboard receivable/payable KPIs [reconcile]
Steps: 1. /debts: record «Нам должны» / «Мы должны» values + pill counts. 2. Open `/` (dashboard), any period.
Expect: dashboard receivable KPI value = «Нам должны» card and payable KPI value = «Мы должны» card, exactly (contract: dashboard debt figures are a snapshot that reconciles with `GET /api/debts`; `period` drives only revenue/series). KPI counts expected to equal the pill counts (verify against contract partners-debts-dashboard.md if they diverge).

### T-DBT-61 · Dashboard «Просрочено» = 31+-day receivable aging, NOT /debts overdue [reconcile]
Steps: 1. /debts transactions tab: direction «Нам должны», «Срок: 31–60» → sum «Остаток»; repeat with «60+»; S = both sums. 2. Record the /debts «Просрочено» card C. 3. Dashboard: record the overdue KPI V.
Expect: V = S (contract: dashboard Overdue = receivables aged 31+ days). Do **not** assert V = C — C is due-date overdue across both directions; V ≠ C is designed (Traps; repo-state Dashboard). V ≠ S is a real FAIL. With a young QA org S, C, V may all be 0 — equality then proves nothing; note it and pass on V = S.

### T-DBT-62 · Dashboard aging panel ↔ /debts bucket sums [reconcile]
Steps: for each bucket 0-7 / 8-30 / 31-60 / 60+: /debts direction «Нам должны» + matching «Срок» filter → sum «Остаток»; compare with the dashboard aging panel amount for that bucket.
Expect: equal per bucket — panel buckets are receivable remaining and the /debts age predicates partition identically (contract DashboardAgingBucketDto + DebtDto.ageDays). Payable rows never enter the panel.

### T-DBT-63 · Partner row ↔ partner detail balance card (POV flip) [reconcile]
Pre: T-DBT-32/33 done. Equality below holds only because both run partners have opening 0 and no advances — in general partner balance ≠ open-debt sum (openings and advances enter the ledger, not /debts); never report that inequality on other partners.
Steps: 1. /debts partners tab: record Универсал (expect 60 000 green) and Дебитор (expect 15 000 red). 2. Open each partner's detail page.
Expect: Универсал balance card magnitude 60 000, Дебитор 15 000 (R12 — both served from the same books); the partner page renders **partner-POV** signed/colored — Универсал (owes us) shows red/negative there vs green on /debts; Дебитор (we owe) shows green there vs red on /debts. Opposite colors for the same fact are both correct (partners.md POV trap; repo-state Partners decision amending #4).

### T-DBT-64 · Cross-tab identity: rows = groups = net card [reconcile]
Steps: 1. Clear all filters. 2. Transactions tab: R = Σ «Остаток» over green rows, P = Σ over red rows (use the CSV from T-DBT-08 mechanics for large sets). 3. Partners tab: N = Σ signed row sums (green +, red −). 4. Cards.
Expect: R = «Нам должны», P = «Мы должны», N = R − P = «Чистая позиция» (magnitude + color by sign); partners pill = distinct partners among the rows; transactions pill = row count. All three views aggregate one served list — any drift is a real defect (R12).
Known: Σ of partner-row **magnitudes** ≠ R + P whenever a mixed-direction partner exists (rows net, cards gross — see T-DBT-04); that alone is the documented observation, not drift.
