# Payments — test cases (T-PAY)

Standalone payments: the five immutable payment types, the source/allocation model (business-rules §B), settlement, advance gating, and cross-screen money consistency. Read with [../README.md](../README.md) · [../shared-checklist.md](../shared-checklist.md) · [../fixtures.md](../fixtures.md) · [../../frontend-gaps.md](../../frontend-gaps.md).

Run-scoped entities are named «QA-<MMDD> …» — substitute the run date. Cases build on earlier cases' data; run in doc order. Amount arithmetic below assumes the doc's own flow only — a re-run needs fresh run-scoped entities.

## Surfaces

- `/payments` — list: `PaymentHeader` («Новый платёж», «Экспорт»; under the title row `PaymentDirectionCards` — the direction filter as three toggle cards «Все платежи» · «Приход» · «Расход», each a payment **count** (space-grouped, «1 181») under the other filters, the pressed one with a ✓ and its accent border, no ↗; no direction segmented control; then search «Поиск по номеру, партнёру или сотруднику…», «Тип: Все», «Касса: Все», the shared date filter «Дата: Весь период …»), `PaymentsTable` (row click → detail; no actions column; totals band «N платежей · Приход · Расход» left of the pager).
- `/payments/:id` — detail: right-rail layout (#20g). Main column: per-type card (payroll/general/withdrawal) + «Касса» source card + «Куда пошли деньги» allocation table; rail: the «Сумма платежа» hero (green / red by direction, the «Приход»/«Расход» chip under it), then «Информация» (Партнёр or Сотрудник as a link, «Тип» as the payment-type chip, «Касса», «Создал», «Дата»). The tab reads «Платёж №N · Ombor».
- `PaymentCreateModal` (the shared modal shell: record tile + «Новый платёж», «Тип платежа» segmented control + per-type fields, a partner line «<тип> · Баланс: … · Аванс: …» under the partner picker, footer «Провести платёж» / «Далее: какие долги закрыть» with the lock line) and `PaymentSettlementModal` («Какие долги закрыть») — both launched from the list page.
- `/payments/new` — the topbar «Создать → Оплата» target: redirects to `/payments` and opens `PaymentCreateModal` (never a placeholder page). The modal preselects the first active wallet.
- Payroll payments created on employee detail also land in this list (type «Зарплата») — the list rendering is in scope here; the employee-side flow is T-EMP.

## Traps

- **Settlement modal opens on every standalone «Оплата» submit** (button reads «Далее: какие долги закрыть»), including at zero debt. Pattern #5 («only on overpayment») governs the guided POS flow; the standalone modal stays functionally as-is per DR-05. Not a bug.
- **DR-05 — allocation-ordering semantics are deferred.** Assert only what's served: `/api/payments/outstanding` is oldest-first and «Авто (сначала старые)» fills that order top-down. Do NOT write up mixed sale/refund ordering, direction-vs-debt-position outcomes, or expect a partner-page «оплатить долги» button.
- **«В аванс» shows for any unallocated remainder** even while debt rows sit unchecked — the R40 gate is server-side (see T-PAY-36); the visible figure is not a #6 violation.
- **Transaction references show the document's own number.** The settlement modal («Какие долги закрыть»), the POS «Закрыто долгов» lines and the detail's «Куда пошли деньги» label rows with the served `number` / `transactionNumber` — «Продажа №802», «Возврат продажи №606» — the same «№N» as the document's own title; a legacy document without a number reads «Без номера». A label that shows the internal id instead (e.g. «№1937» for supply №802) is a FAIL. Click-through must land on the right transaction.
- **No `⋮` actions column on the payments list at all** — payments are immutable (R1); row click opens the detail. Not a #21 violation.
- **Type picker exists only in this standalone modal** (R13). Guided flows (POS payment, transaction «Оплатить», employee payroll) fix the type by context — no type control there is correct.
- **Direction control is usually absent** — derived per R14. It appears only for a «Both» partner (label «Направление (партнёр «Клиент + Поставщик»)») and always for «Прочее». Every type shows a one-line hint under the type selector (`payment.typeHint.*`).
- **Withdrawal detail renders a «Возврат аванса» card**, not a «Куда пошли деньги» table — designed rendering.
- **Income payments have no wallet-balance guard** — only Expense-direction draws are blocked (DR-25).
- **Dual payroll paths** (standalone modal + employee detail) are both valid; any number of payroll payments per employee+month (R1).
- **Payment detail has no notes/attachments sections** — Known F18 (backend gap), don't report as missing UI.

## Happy path

### T-PAY-01 · Run-scoped setup [happy] ✍
Pre: QA org, fixtures seeded ([../fixtures.md](../fixtures.md)).
Steps: 1. Create wallet «QA-<MMDD> Касса-П» (Cash, opening 1 000 000). 2. Create partner «QA-<MMDD> Плательщик» (Клиент, opening balance 0). 3. Create product «QA-<MMDD> Товар-П» (category «QA Категория», шт, supply 60 000 / sale 100 000). 4. On «QA Склад А» → «Начальный остаток»: 20 × «QA-<MMDD> Товар-П» @ 60 000.
Expect: all four created; wallet detail shows balance 1 000 000; partner detail balance hero «0» (neutral) + hint «Баланс закрыт — обязательств нет» (partner-POV signed display — see modules/partners.md Traps; #4 amendment pending).

### T-PAY-02 · Seed an open debt via POS sale [happy] ✍
Pre: T-PAY-01.
Steps: 1. `/sales/new`: partner «QA-<MMDD> Плательщик», warehouse «QA Склад А», 6 × «QA-<MMDD> Товар-П» @ 100 000 (total 600 000). 2. Leave payment 0 → «Провести продажу» → confirm «Провести в долг» in the «Провести без оплаты?» dialog.
Expect: sale created; status chip «Не оплачено» in `/sales`; partner balance shows they owe 600 000 (partner-POV signed display on partner detail — see modules/partners.md POV trap).

### T-PAY-03 · Worked example (a): overpayment → settlement + advance [happy] ✍
Pre: T-PAY-02 (open 600 000 debt).
Steps: 1. `/payments` → «Новый платёж»: type «Оплата», partner «QA-<MMDD> Плательщик», wallet «QA-<MMDD> Касса-П», amount 1 000 000. 2. Submit «Далее: какие долги закрыть». 3. In «Какие долги закрыть»: verify auto-FIFO preallocated 600 000 to the sale; «Сумма платежа» 1 000 000, «Закрыто долгов» 600 000, «В аванс» 400 000 + note «Зачислится как аванс партнёра». 4. «Провести платёж».
Expect: the footer carries the lock line «После проведения изменить нельзя — ошибку исправляют платежом в обратную сторону.»; success toast «Платёж №N проведён — 1 000 000 UZS»; new row in the list. Detail: «Касса» card = «QA-<MMDD> Касса-П» 1 000 000 (single source, R9); «Куда пошли деньги» rows: «Продажа №…» / «Погашение долга» 600 000 and «Аванс партнёра» / «Зачисление аванса» 400 000 — settling allocations sum = source sum (R8); rail: «Сумма платежа» 1 000 000 green with the «Приход» chip (direction derived, R14), «Информация» «Тип» = the «Оплата» chip.
Known: F9 — if the «Куда пошли деньги» block crashes on an unexpected allocationType, report KNOWN. F18 — no notes/attachments sections.

### T-PAY-04 · Worked example (c): change return — memo only [happy] ✍
Pre: T-PAY-03 (partner debt 0). Wallet «QA-<MMDD> Касса-П» = 2 000 000.
Steps: 1. `/sales/new`: same partner/warehouse, 4 × «QA-<MMDD> Товар-П» (total 400 000). 2. Payment section: 500 000 from «QA-<MMDD> Касса-П»; leave the overpayment toggle on «Сдача» (the default, #5, R40). 3. Submit.
Expect: sale Closed («Оплачено»). In `/payments` the generated «Оплата» payment's detail: «Касса» source = **400 000** — net of change (R15); «Куда пошли деньги»: «Погашение долга» 400 000 + «Сдача» 100 000 on a muted row with the «справочно» tag (R10 — memo, outside the R8 identity). Wallet balance = 2 400 000 (+400 000, not +500 000); the 100 000 appears in neither wallet operations nor partner balance (R10, R15). Partner detail still shows the zero-balance state — hero «0» + «Баланс закрыт — обязательств нет» (see [partners.md](partners.md) POV trap).

### T-PAY-05 · «Возврат аванса» — return the advance [happy] ✍
Pre: T-PAY-03 gave the partner a 400 000 advance. Wallet = 2 400 000.
Steps: 1. «Новый платёж»: type «Возврат аванса», partner «QA-<MMDD> Плательщик» — the hint row shows «Аванс: 400 000 UZS». 2. Wallet «QA-<MMDD> Касса-П», amount 400 000. 3. «Провести платёж» (no settlement step).
Expect: no direction control (Customer → derived Expense, R14). Detail: «Возврат аванса» card with «Возврат аванса партнёру» 400 000; rail hero «Сумма платежа» 400 000 red with the «Расход» chip. Wallet = 2 000 000; reopening the create modal, selecting type «Возврат аванса» and picking the partner shows «Аванс: 0 UZS» (the advance segment of the hint renders only for type «Возврат аванса» once the advance is 0).

### T-PAY-06 · «Аванс» — create an advance [happy] ✍
Pre: T-PAY-05. Wallet = 2 000 000, partner advance 0.
Steps: 1. «Новый платёж»: type «Аванс», partner «QA-<MMDD> Плательщик», wallet «QA-<MMDD> Касса-П», amount 150 000. 2. Submit.
Expect: no direction control (single-type partner → derived, R14). Wallet = 2 150 000. Create-modal partner line now «Клиент · Баланс: 0 UZS · Аванс: 150 000 UZS» (advance is a claim on cash in the wallet, R11). Detail «Куда пошли деньги» shows «Аванс партнёра» / «Зачисление аванса» 150 000 (verify against canon R10/R11 — served allocation shape for deposits).

### T-PAY-07 · «Прочее» — direction user-set, description required [happy] ✍
Pre: T-PAY-06. Wallet = 2 150 000.
Steps: 1. «Новый платёж»: type «Прочее» — a «Приход | Расход» segmented control appears (always user-set, R14) and «Описание» is required (contract validation). 2. «Расход», description «QA-<MMDD> аренда», wallet «QA-<MMDD> Касса-П», amount 50 000. 3. Submit.
Expect: created; list row party column shows «—» (no partner/employee); detail has an «Описание» card with the entered text; wallet = 2 100 000.

### T-PAY-08 · Зарплата via the standalone modal [happy] ✍
Pre: T-PAY-07. Fixture «QA Сотрудник» (salary 3 000 000). Wallet = 2 100 000.
Steps: 1. «Новый платёж»: type «Зарплата» → employee select + «Период» (month/year) replace the partner field. 2. Pick «QA Сотрудник» — amount autofills 3 000 000; replace with 200 000. 3. Wallet «QA-<MMDD> Касса-П», submit.
Expect: no direction control (Payroll → always Expense, R14). «Период» defaults to the current month and year; the year list is the current year ±2. Network POST carries `Period=YYYY-MM` (e.g. `2026-10`) — never a month name. List row: chip «Зарплата», party «QA Сотрудник». Detail payroll card: Сотрудник / Должность / Период «<месяц> <год>» (localized from `YYYY-MM`) / Оклад 3 000 000 / Выплачено 200 000. Wallet = 1 900 000.

### T-PAY-09 · List anatomy and the five type labels [happy]
Pre: T-PAY-03…08 created one payment of each type.
Steps: 1. Open `/payments`; sort default date-desc. 2. Scan the run's rows.
Expect: columns «№» (the number opens the payment; copy button on row hover; «Без номера» for legacy rows) · «Дата» (date+time) · «Партнёр / сотрудник» (partner rows link to the partner, payroll rows to the employee) · «Тип операции» with the real localized type — «Оплата», «Аванс», «Возврат аванса», «Зарплата», «Прочее» all present (#17) · «Направление» («Приход» green / «Расход» red pills) · «Касса» (wallet link) · «Сумма» right-aligned, unsigned, green/red by direction (#4). No `⋮` column (R1 — see Traps).

### T-PAY-10 · Filters and the direction cards [happy]
Pre: T-PAY-09.
Steps: 1. Search «QA-<MMDD> Плательщик». 2. Clear; type filter «Аванс». 3. Clear; wallet filter «QA-<MMDD> Касса-П». 4. Click the «Расход» card; click it again; then Tab to «Приход» and press Space. 5. Combine search with a non-matching type.
Expect: 1 → only this run's partner's payments; the three cards count them. 2 → all visible rows are type «Аванс» and the run's 150 000 deposit is among them (the filter is org-wide and may include deposits from earlier runs). 3 → only the run wallet's payments. 4 → first click filters to Expense rows: «Расход» shows a ✓ and its red border (`aria-pressed=true`), the band's «N платежей» (and the pager's «из N» when there is one) = the «Расход» count; second click returns to «Все платежи» (pressed); Space selects «Приход» the same way. The card counts do NOT change when the direction flips — each counts what it would show under the other filters; «Все платежи» = «Приход» + «Расход». No money on the cards — sums live only in the totals band. 5 → empty state «Платежи не найдены» / «Измените поиск, тип, кассу или период.»

### T-PAY-11 · Attachments upload + display (F18) [happy] ✍
Pre: wallet «QA-<MMDD> Касса-П» (from T-PAY-01).
Steps: 1. «Новый платёж»: type «Прочее», «Приход», description «QA-<MMDD> вложения», wallet «QA-<MMDD> Касса-П», amount 10 000. 2. «Вложения» → attach two files (one image, one PDF) — a removable chip appears per file. 3. Submit. 4. Open the created payment's detail.
Expect: the create request is **multipart/form-data** returning 201 (F18 — payment-create is no longer JSON) with `attachments[]` in the response; the detail shows a «Вложения · 2» card with one chip per file (image vs document icon by MIME, name, size via `formatBytes`); each chip is an `<a target="_blank">` whose href resolves to the API base (`VITE_OMBOR_API_BASE_URL`), not the app origin. When the payment settles a transaction that carried a note/attachments, a muted «Из операции» sub-section echoes them read-only.
Known: the local backend may 404 on the file URL itself (static-serving config — product images 404 too); verify the href resolves to the backend origin, not that the file downloads.

## Edge & negative

### T-PAY-30 · Worked example (b): pay from advance + cash — expressibility probe [edge]
Pre: partner advance 150 000 (T-PAY-06).
Steps: 1. `/sales/new`: pick «QA-<MMDD> Плательщик»; inspect the payment section for any control that draws from the partner's advance. 2. Open the standalone «Новый платёж» modal, type «Оплата», same partner — the hint shows «Аванс: 150 000 UZS»; inspect for an advance-source control.
Expect: canon target (R9/R11): a 1 000 000 sale paid 500 000 advance + 500 000 cash → two sources (Advance + Wallet), wallet moves +500 000 only, advance claim consumed. Current contract cannot express an Advance source in either write path (frontend-gaps A2) — if no affordance exists (expected), record **BLOCKED (A2)**, create nothing. If an affordance exists, execute with 150 000 advance + cash and verify the wallet moves only by the cash half (R11).

### T-PAY-31 · «Возврат аванса» exceeding the advance is blocked [negative]
Pre: partner advance 150 000.
Steps: 1. «Новый платёж»: «Возврат аванса», partner «QA-<MMDD> Плательщик», wallet «QA-<MMDD> Касса-П», amount 200 000. 2. «Провести платёж».
Expect: inline error under amount «Аванс партнёра: 150 000 UZS. Нельзя вывести больше.»; button stays enabled (#7) but nothing is created — no new list row, no POST 201.

### T-PAY-32 · Expense exceeding wallet balance is blocked [negative]
Pre: «QA-<MMDD> Касса-П» = 1 900 000 (after T-PAY-08).
Steps: 1. «Новый платёж»: «Прочее», «Расход», any description, wallet «QA-<MMDD> Касса-П», amount 5 000 000. 2. Submit.
Expect: inline error «Доступно только 1 900 000 UZS — нельзя списать больше остатка кассы.» (DR-25); nothing created. Switching direction to «Приход» clears the block (no guard on inflows — Traps). Available clamps at max(balance, 0): against an overdrawn wallet the error reads «Доступно только 0 UZS…» — never a negative amount — and an income payment to that overdrawn wallet still submits normally (clamp live-verified 2026-07-17).

### T-PAY-33 · Direction control appears only for «Both» [edge]
Pre: fixtures «QA Универсал» (Both), «QA Клиент», «QA Поставщик».
Steps: 1. «Новый платёж» → «Аванс», partner «QA Универсал». 2. Switch partner to «QA Клиент», then «QA Поставщик». 3. Type «Возврат аванса», partner «QA Универсал». 4. Close without saving.
Expect: 1 and 3 → segmented «Приход | Расход» labeled «Направление (партнёр «Клиент + Поставщик»)» (R14 — user-set for Both; «Оба» is never shown). 2 → control absent for both single types (derived). No writes.

### T-PAY-34 · Per-type required-field messages [negative]
Pre: create modal open.
Steps: 1. Type «Оплата», submit empty. 2. Type «Прочее», fill wallet+amount, leave description empty, submit. 3. Close (confirm discard).
Expect: 1 → inline «Выберите партнёра», «Выберите кассу», «Введите сумму платежа» (contract validation; DR-24 — no top banner). 2 → «Укажите описание платежа». Nothing created.

### T-PAY-35 · Manual distribution: cap and re-auto [edge] ✍
Pre: T-PAY-08 done. Wallet = 1 900 000.
Steps: 1. `/sales/new`: 3 × «QA-<MMDD> Товар-П» (300 000) to «QA-<MMDD> Плательщик», unpaid → new open sale. 2. «Новый платёж»: «Оплата», same partner/wallet, amount 200 000 → settlement modal. 3. In the sale's row type 999 999 999. 4. Set the row to 150 000; observe totals. 5. Click «Авто (сначала старые)». 6. «Провести платёж».
Expect: 3 → input clamps to 200 000 (≤ min(row remaining, payment amount) — contract: settlement amount must not exceed remaining). 4 → «Закрыто долгов» 150 000, «В аванс» 50 000. 5 → FIFO restored: 200 000 allocated, «В аванс» 0. 6 → payment created with one settlement 200 000; the sale flips to «Частично» (PartiallyPaid), remaining 100 000; wallet = 2 100 000.

### T-PAY-36 · Unallocated remainder with open debt — advance must not be created [edge] ✍
Pre: T-PAY-35 (sale remaining 100 000). Wallet = 2 100 000.
Steps: 1. «Новый платёж»: «Оплата», same partner/wallet, amount 50 000 → settlement modal. 2. Uncheck the sale's row — «Закрыто долгов» 0, «В аванс» 50 000. 3. «Провести платёж». 4. Open the created payment's detail; check `POST /api/payments` in the network log.
Expect: (verify against canon R40 / contract `POST /api/payments` notes) the request carries empty `settlements`; the backend then settles oldest-first — detail «Куда пошли деньги» must show «Погашение долга» 50 000 against the open sale and **no «Зачисление аванса»** row, sale remaining 50 000. An AdvanceCredit created while debt remains is a FAIL (R40). Wallet = 2 150 000 either way.

### T-PAY-37 · Zero-debt settlement empty state; close the sale [edge] ✍
Pre: T-PAY-36 (sale remaining 50 000).
Steps: 1. «Новый платёж»: «Оплата», same partner/wallet, amount 50 000 → settlement modal auto-allocates 50 000 → «Провести платёж». 2. Reopen «Новый платёж», «Оплата», same partner, wallet, amount 10 000 → submit to the settlement modal. 3. «Назад», close without saving.
Expect: 1 → sale flips to «Оплачено» (Closed); wallet = 2 200 000. 2 → empty state «Открытых долгов нет» / «Вся сумма будет записана как аванс партнёра» — the advance path offered only now, at zero outstanding debt (R40, #6). 3 → no payment created.

### T-PAY-38 · Open debts fail to load — nothing is booked [negative]
Steps: 1. Block `GET /api/payments/outstanding` (DevTools → Network request blocking). 2. «Новый платёж»: «Оплата», a partner with open debt, amount 100 → «Далее: какие долги закрыть». 3. «Провести платёж». 4. Unblock, «Повторить».
Expect: 2 → «Не удалось загрузить открытые долги» + reason + «Повторить» where the debt table goes; «Закрыто долгов» and «В аванс» read «—», never 0 / the whole amount. 3 → no `POST /api/payments` (confirming blind would book the whole amount as an advance). 4 → the debt rows load and the FIFO split fills the figures.

### T-PAY-39 · Date filter drives the direction cards and the totals band [edge]

Steps: 1. `/payments`: note the three cards. 2. «Дата» → «Сегодня». 3. Click the «Приход» card. 4. «Дата» → «Прошлый месяц», then «Весь период».
Expect: 2 → only today's payments; the cards count today only; the band reads «N платежей · Приход … UZS (green) · Расход … UZS (red)» and N equals «Все платежи». 3 → the table and the band show income only (the band's N = the «Приход» count; it still reads «Расход 0 UZS» — open owner question, not a FAIL); the counts on the cards stay. 4 → last calendar month, then everything again — the cards return to the step-1 values.

### T-PAY-40 · Create modal: shell, keyboard, partner balance sign [edge]
Pre: T-PAY-02 state or any partner who owes us, and one we owe (e.g. fixture «QA Поставщик» after an unpaid supply).
Steps: 1. «Новый платёж»: read the header and footer. 2. Type «Оплата», pick the partner who owes us; read the line under the picker. 3. Pick the partner we owe. 4. Type an amount, press Enter in the field; then Ctrl+Enter. 5. Back out of the settlement step, close with ✕. 6. Type «Зарплата», submit empty, then pick «QA Сотрудник». 7. Narrow the window to ~560px; read the type control.
Expect: 1 → the shared modal: record tile before «Новый платёж», labels above every field, a grey footer band with «Далее: какие долги закрыть» (other types: «Провести платёж» with ✓) and the lock line «После проведения изменить нельзя — …». 2 → e.g. «Клиент · Баланс: −600 000 UZS» (T-PAY-02 state) in red — the partner's side, the same sign and colour as the partner page (DR-27); never a red figure where the partner list shows green. 3 → «+…» in green. 4 → a bare Enter does nothing; Ctrl+Enter submits (to the settlement step for «Оплата»). 5 → «Закрыть форму?» — «Несохранённые изменения будут потеряны.» with «Продолжить» / «Закрыть»; nothing is created. 6 → «Введите сумму платежа» appears, then picking the employee fills the salary and the error clears. 7 → the type options stay on one line and scroll sideways; no label wraps. No writes.

## Reconciliation

### T-PAY-60 · Transaction status flips propagate across screens [reconcile]
Pre: full happy+edge flow done (T-PAY-35→37 walked one sale Open → PartiallyPaid → Closed).
Steps: 1. `/sales`: locate the three run sales. 2. Open each sale's detail. 3. Partner detail → «Транзакции» tab. 4. `/debts`, search «Плательщик».
Expect: all three sales show «Оплачено» (Closed) consistently in list chips, detail status, and the partner's Транзакции tab; `/debts` has no rows for «QA-<MMDD> Плательщик». The T-PAY-35 intermediate state («Частично», remaining 100 000) must have been visible at that step — if it was skipped, re-check before closing.

### T-PAY-61 · Wallet operations ledger matches the payment chain [reconcile]
Pre: all prior cases. Expected deltas on «QA-<MMDD> Касса-П»: opening 1 000 000; +1 000 000 (T-PAY-03); +400 000 (04); −400 000 (05); +150 000 (06); −50 000 (07); −200 000 (08); +200 000 (35); +50 000 (36); +50 000 (37).
Steps: 1. Open the wallet's detail → «Операции» tab. 2. Compare each row's amount and «Баланс после» against the chain. 3. Read the header stat cards.
Expect: one operation per event above, running «Баланс после» consistent, final = **2 200 000** = header balance; «Авансы» = 150 000; «Наши средства» = 2 050 000 (R12 — served, not recomputed). No operation for the 100 000 change from T-PAY-04 (R10/R15).
Known: F10 — if direction pills render all-red or a row misses a party link, report KNOWN.

### T-PAY-62 · Partner balance agrees everywhere [reconcile]
Pre: all prior cases. Expected end state: debt 0, advance 150 000.
Steps: 1. Partner detail: balance card + «Платежи» tab. 2. «Новый платёж» modal → pick the partner, read the hint row. 3. `/payments` filtered to the partner (search).
Expect: balance card «0» neutral + «Баланс закрыт — обязательств нет» (partner-POV signed display, modules/partners.md Traps; #4 amendment pending); modal partner line «Клиент · Баланс: 0 UZS · Аванс: 150 000 UZS»; the partner's «Платежи» tab lists the same payments («№N», amounts, dates) as the filtered `/payments` list — no row present in one and missing in the other; amounts identical to each payment detail's «Касса» sum.
Note: F20 resolved (2026-07-19) — sale/supply/refund rows in the partner ledger now show «№…» in the number column (was «—»); if any such row still shows «—», that is a regression.

### T-PAY-63 · Payment ↔ transaction cross-links and numbers [reconcile]
Pre: T-PAY-03 payment and T-PAY-02 sale.
Steps: 1. Open the T-PAY-03 payment detail; click the «Продажа №…» allocation row. 2. On the sale detail, find the «Платежи» section; note the payment's number and amount. 3. Navigate back to the payment via that reference.
Expect: allocation click lands on the correct sale (600 000 settled); the sale's payments section shows the same payment with amount 600 000 (the settled slice, not the 1 000 000 total) and a «№N» that matches the payment detail's title; round-trip returns to the same payment.
Expect also: the allocation label «Продажа №N» equals the sale's own title number.
