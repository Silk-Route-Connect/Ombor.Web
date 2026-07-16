# Wallets — test cases (T-WAL)

Deep pass over the Wallets module («Касса»): CRUD-minus-delete, opening-balance event, inter-wallet transfers, the Операции/Переводы ledgers, advances math, archive. See [README](../README.md) · [shared-checklist](../shared-checklist.md) · [fixtures](../fixtures.md) · canon: business-rules §C (R15–R16), R11–R12, R31 · contract `backend-contracts/wallets.md`.

## Surfaces

- `/wallets` — list: `WalletsTable` (name · type · Баланс · Авансы партнёров · Наши средства · ⋮), `WalletSummaryStrip` (Общий баланс / Наши средства / Авансы партнёров), search, segmented «Активные | Архив», «Экспорт», «Новая касса».
- `/wallets/:id` — detail (stacked, no rail): header (name + type badge, meta «Начальный остаток: … UZS · создана …»), primary «Новый перевод», ⋮ (edit/archive); three stat cards «Баланс» / «Наши средства» / «Авансы»; tabs Операции / Переводы with count pills.
- Modals: `WalletFormModal` (create/rename), `WalletTransferModal` (from → to, amount, note), `WalletTransferDetailModal` (read-only), archive/restore confirms.

## Traps

Module-specific designed behavior — never report these (shared-checklist §6 has the rest):

| Observation | Why it's correct |
| --- | --- |
| **No delete affordance anywhere on wallets** — list ⋮ and detail ⋮ offer edit + archive/restore only | Known divergence, not designed-correct: archive-only is the *shipped interim* behavior (repo-state Wallets; archive dialog copy) and diverges from DR-20/#19 — delete stays visible, reference-gated via served `isDeletable`; the FE affordance "follows" (not yet built). Observe per T-WAL-38; don't report as a NEW defect |
| A Депозит raises «Баланс» AND «Авансы» while «Наши средства» stays flat | R11 — an advance is a partner's claim on cash sitting in the wallet |
| After an overpayment-into-advance, «Наши средства» grows by less than the money that came in | R12 — only the settled part is ours (worked example 1) |
| Operation kind labels mirror payment-type vocabulary: kind `Expense` renders «Общий», `Payment` renders «Оплата» | deliberate i18n mapping (`wallet.operation.*`), #17 wallet clause |
| Clicking a transfer row opens a modal; clicking a payment row navigates to `/payments/:id` | designed split — transfers have no routed detail page |
| An archived wallet is absent from the transfer and payment-source pickers while its money stays in the strip | R30/R31, #13 — hidden from pickers, not from value |
| Transfer modal opened from a wallet detail pre-selects that wallet as source | designed default |

## Happy path

Run in order — later cases consume earlier data. All numeric oracles use the run-scoped wallets created here; stable fixture wallets are picker material only (fixtures.md).

### T-WAL-01 · Create Cash wallet — opening balance is an event [happy] ✍
Pre: none.
Steps: 1. `/wallets` → «Новая касса». 2. Name «QA-<MMDD> Касса А», type «Наличные», opening 500 000. 3. Save.
Expect: toast «Касса «QA-<MMDD> Касса А» создана»; row: Баланс 500 000 · Авансы 0 · Наши средства 500 000 (R15). Open detail: meta line «Начальный остаток: 500 000 UZS»; Операции has exactly one row — «Начальный остаток» · «Приход» · 500 000 · Баланс после 500 000 (R16 — an auditable event, not a raw number). No raw balance input exists anywhere on the page.

### T-WAL-02 · Create Bank wallet [happy] ✍
Pre: none.
Steps: create «QA-<MMDD> Касса Б», type «Банк», opening 200 000.
Expect: as T-WAL-01 with 200 000; type badge «Банк» on row and detail (no raw `Bank`).

### T-WAL-03 · Stat cards are the served figures [happy]
Pre: T-WAL-01.
Steps: open Касса А detail; capture the network `GET /api/wallets/{id}` response.
Expect: cards «Баланс»/«Наши средства»/«Авансы» equal served `balance`/`ourMoney`/`advancesHeld` exactly — no client math (R12, hard rule 8); on the served values `ourMoney = balance − advancesHeld` (R12).

### T-WAL-04 · Edit is rename-only [happy]
Pre: T-WAL-01.
Steps: 1. Касса А → ⋮ → «Редактировать». 2. Inspect the form. 3. Rename to «QA-<MMDD> Касса А2», save. 4. Rename back.
Expect: title «Редактировать кассу», subtitle «Тип и начальный остаток изменить нельзя»; type and opening render as read-only locked fields tagged «нельзя изменить» / «записан при создании» — no editable input for either (R16); toast «Изменения сохранены»; all three money figures unchanged by the rename.

### T-WAL-05 · Inter-wallet transfer updates both wallets, immutable [happy] ✍
Pre: T-WAL-01, T-WAL-02. Record strip «Общий баланс» first.
Steps: 1. Касса А detail → «Новый перевод» (source pre-set = А). 2. To: Касса Б, amount 150 000, note «QA перевод». 3. «Перевести».
Expect: toast «Перевод проведён: QA-<MMDD> Касса А → QA-<MMDD> Касса Б». А: Баланс 350 000; Операции top row «Перевод» · «Расход» · 150 000 · Баланс после 350 000; Переводы tab shows the row (Из кассы А → В кассу Б). Б detail: Баланс 350 000; same transfer in its Переводы; Операции row «Приход» · 150 000 · Баланс после 350 000. Row click opens the read-only detail modal with «Перевод записан окончательно.» and zero edit/delete affordances (R1, R16). Strip «Общий баланс» unchanged (internal move).

### T-WAL-06 · Deposit raises balance AND advances; «Наши средства» flat [happy] ✍
Pre: T-WAL-05 (Б at 350 000). Create partner «QA-<MMDD> Партнёр Кас» (Клиент, opening 0) via `/partners`.
Steps: `/payments` → create payment → type «Депозит», partner «QA-<MMDD> Партнёр Кас», wallet Касса Б, amount 100 000 → submit.
Expect: Б cards: Баланс 450 000 · Авансы 100 000 · Наши средства 350 000 (R11, R12); Операции top row «Депозит» · «Приход» · 100 000 · Баланс после 450 000. Strip deltas vs T-WAL-05 end: Общий баланс +100 000, Авансы партнёров +100 000, Наши средства ±0.

### T-WAL-07 · Overpay-into-advance: balance +full tender, our money +settled part only [happy] ✍
Pre: T-WAL-05 (А at 350 000). Create partner «QA-<MMDD> Партнёр Кас2» (Клиент, opening 0). Needs ≥1 unit «QA Товар Штучный» in stock — if the sale hard-blocks (R20), add stock via «Начальный остаток» on QA Склад А, else SKIP.
Steps: 1. `/sales/new`: partner «QA-<MMDD> Партнёр Кас2», 1 × «QA Товар Штучный» (15 000), warehouse QA Склад А, payment 25 000 into Касса А, excess disposition → «Аванс» (opt-in, #5, R40). 2. Submit. 3. Open Касса А detail.
Expect: one Wallet source 25 000 balancing settlement 15 000 + advance 10 000 (R8–R10, worked example 1). А cards: Баланс 375 000 (+25 000 — full tender, R15) · Авансы 10 000 · Наши средства 365 000 (+15 000 — only the settled part, R11–R12). Операции top row «Оплата» · «Приход» · 25 000 · Баланс после 375 000.

### T-WAL-08 · Операции ledger: localization, order, running balance, links [happy]
Pre: T-WAL-07 (А has 3 operations).
Steps: on А's Операции tab: read rows; apply direction filter «Расход»; search the partner name from T-WAL-07; click the «Платёж» cell link.
Expect: newest-first default (#21): «Оплата» 375 000 → «Перевод» 350 000 → «Начальный остаток» 500 000 in «Баланс после» — each row's balanceAfter = previous (older) balanceAfter ± amount; kinds localized, no raw `Opening`/`Payment` (#17); direction pills «Приход»/«Расход», amounts unsigned (#4); filter «Расход» leaves only the transfer row; search leaves only the payment row; payment reference renders «№N» (DR-21) and routes to `/payments/:id`. Party cell is plain text — not clickable (Known below).
Known: F10 — direction narrowed to In/Out (if the backend serves Income/Expense every row shows red «Расход» — report KNOWN); op `partnerId` unmodeled, party not clickable (WAL-7). If the «Платёж» cell shows bare digits without «№», report a DR-21 defect — `WalletOperationsTab.tsx:121` renders the raw served number and was not in the F19 sweep.

## Edge & negative

### T-WAL-30 · Duplicate name rejected [negative]
Pre: T-WAL-01.
Steps: «Новая касса» → name exactly «QA-<MMDD> Касса А», any type, opening 0 → save.
Expect: server 400 (contract: name unique in org) → toast «Не удалось создать кассу»; modal stays open; no row added. No inline duplicate message exists — toast only.

### T-WAL-31 · Name length bounds inline [negative]
Steps: in the create modal try name of 1 char → save; then a 251-char name → save.
Expect: inline «Введите название кассы (минимум 2 символа).» / «Название не должно превышать 250 символов.»; save button stays enabled throughout (hard rule 5, #7); no top-of-form banner (DR-24, #18). Close via discard confirm.

### T-WAL-32 · Opening balance cannot go negative [negative]
Steps: in the create modal type `-1000` into «Начальный баланс».
Expect: the minus never appears — `MoneyField` is digits-only, value reads 1 000; opening 0 (empty till) is accepted (contract: `openingBalance` ≥ 0).

### T-WAL-33 · Transfer from ≠ to enforced [negative]
Steps: open the transfer modal; open the «В кассу» dropdown while «Из кассы» = Касса А; then the reverse.
Expect: each picker shows the counterpart's selection greyed/disabled — the same wallet cannot occupy both sides (contract: `toWalletId` ≠ `fromWalletId`); fallback inline message «Касса-получатель должна отличаться от источника».

### T-WAL-34 · Over-balance transfer blocked with available-vs-requested detail [negative]
Pre: T-WAL-07 (А at 375 000).
Steps: transfer modal from А: 1. enter amount 375 001 → «Перевести». 2. Click «Перевести всё». 3. Cancel via discard confirm (do not submit).
Expect: «Доступно:» hint shows 375 000; at 375 001 inline «Доступно только 375 000 UZS — нельзя перевести больше остатка.» and the click issues **no** POST (check network) — hard-block per contract/DR-25; «Перевести всё» sets exactly 375 000 and the error clears.
Known: F13 — the guard uses the raw balance, so a **negatively**-balanced wallet blocks ALL its transfers (latent; only reproducible with an overdrawn wallet — report KNOWN, not new).

### T-WAL-35 · Transfer amount required [negative]
Steps: transfer modal, leave amount 0 (destination valid) → «Перевести».
Expect: inline «Введите сумму перевода»; no request sent; button never disabled (#7).

### T-WAL-36 · Archive with balance — strip totals unchanged [edge]
Pre: T-WAL-06 (Б at 450 000 with 100 000 advances). Record all three strip values.
Steps: 1. `/wallets` → Касса Б ⋮ → «Архивировать». 2. Confirm dialog. 3. Re-read the strip; switch segments.
Expect: dialog title «Архивировать кассу «QA-<MMDD> Касса Б»?», body states archive-not-delete and that the balance keeps counting; row leaves «Активные», appears under «Архив» with the «Архив» badge (#13); **all three strip totals are identical before/after** (R31 — archived money still counts).

### T-WAL-37 · Archived wallet: affordances + picker exclusion, then restore [edge]
Pre: T-WAL-36 (Б archived).
Steps: 1. Open Б's detail. 2. From А open the transfer modal and both pickers. 3. Open the payment-create wallet picker. 4. Back on Б detail: «Восстановить».
Expect: Б detail shows banner «Касса в архиве.», a single primary «Восстановить», no ⋮/edit/«Новый перевод» (#2); Б absent from both transfer pickers and from the payment wallet picker (R30, #13); its historical rows (T-WAL-05 transfer in А's Переводы) still resolve by name (R30). Restore → toast «Касса «QA-<MMDD> Касса Б» восстановлена», row back in «Активные», figures intact (450 000 / 100 000 / 350 000).

### T-WAL-38 · No delete affordance anywhere [negative]
Pre: T-WAL-36.
Steps: inspect the list ⋮ of an active and an archived wallet, and the detail ⋮. Perform the archived-wallet ⋮ inspection on Касса Б while it is archived — i.e. run this check between T-WAL-36 and T-WAL-37 — or re-archive Касса Б, inspect its list ⋮, and restore it afterwards.
Expect: only edit + archive (or restore) — no delete item anywhere; the archive dialog body states «Кассы нельзя удалить — только архивировать.» (repo-state Wallets — shipped behavior). Known: diverges from DR-20/#19 (delete stays visible, reference-gated; FE affordance pending) — report as KNOWN, and flag that the divergence needs an F-item in frontend-gaps.md or a decision-log ruling. If a delete item appears, DR-20 FE work has landed — re-check this case and the archive-dialog copy «Кассы нельзя удалить — только архивировать.», which also contradicts DR-20/R32.

### T-WAL-39 · Bad deep-link [negative]
Steps: navigate to `/wallets/9999999`.
Expect: «Касса не найдена.» rendered, no crash/blank; network shows the 404.

## Reconciliation

### T-WAL-60 · Balance card ↔ newest operation's running balance [reconcile]
Pre: T-WAL-07, T-WAL-37 done.
Steps: for both run-scoped wallets compare the «Баланс» stat card to the top (newest) Операции row's «Баланс после».
Expect: equal on both — А 375 000, Б 450 000 (R15; the served running ledger ends at the served balance).

### T-WAL-61 · List row ↔ detail cards ↔ API [reconcile]
Steps: for Касса А read the list row (Баланс/Авансы/Наши средства), the three detail cards, and the `GET /api/wallets/{id}` body.
Expect: all three surfaces show 375 000 / 10 000 / 365 000, matching the served fields digit-for-digit; `ourMoney = balance − advancesHeld` holds on the served values (R12).

### T-WAL-62 · Summary strip ↔ sum of all rows, both segments [reconcile]
Steps: set the pager to 50; sum Баланс, Наши средства, Авансы партнёров across ALL rows of «Активные» plus «Архив».
Expect: the three sums equal the strip's «Общий баланс» / «Наши средства» / «Авансы партнёров» exactly (R31 — archived rows included in the totals).

### T-WAL-63 · Transfer double-entry across both wallets [reconcile]
Pre: T-WAL-05.
Steps: open the Переводы tab of А and of Б; open the transfer's detail modal from each side.
Expect: the same transfer row on both sides — identical date, amount 150 000, note, Из кассы/В кассу names; in the Операции ledgers it appears once per wallet with opposite directions («Расход» on А, «Приход» on Б) and equal amounts (atomic double move per contract; R1 immutable).

### T-WAL-64 · Wallet operation ↔ payment detail [reconcile]
Pre: T-WAL-07.
Steps: from А's «Оплата» operation row follow the «Платёж» link to `/payments/:id`.
Expect: payment detail's Касса source line = Касса А, 25 000 — same wallet and amount as the operation row; Распределение shows settlement 15 000 + advance 10 000, and the advance line equals А's «Авансы» card (R8, R11).
