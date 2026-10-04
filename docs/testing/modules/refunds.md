# Refunds — test cases (T-RFD)

SaleRefund / SupplyRefund counter-events: creation from the original, caps, effects on stock/debt/balance. Pairs with [../README.md](../README.md) · [../shared-checklist.md](../shared-checklist.md) · [../fixtures.md](../fixtures.md) · gaps: F8, F20, F19 (resolved F6). Canon: business-rules §A (R1–R7), §D (R18–R20); ui-patterns behavior digest «Refunds (R2–R7)»; contract `transactions-payments.md` (POST /api/transactions refund validation).

## Surfaces

- **No standalone route.** Refund create = `RefundModal`, opened on the original's detail (`/sales/:id`, `/supplies/:id`) via the visible header button «Оформить возврат» (the `primaryAction`, ux-9), or from a `/sales` / `/supplies` row's ⋮ «Оформить возврат», which opens that detail with the modal already open. A fully refunded original shows a grey «Возвращено полностью» pill in place of the button, «Возвращено полностью» under its № in the list, and no row ⋮. The modal footer reads «Провести возврат» with the lock line «После проведения изменить нельзя — ошибку исправляют новой продажей или поставкой.»
- **Refund rows** live inside the `/sales` feed (SaleRefund) and `/supplies` feed (SupplyRefund).
- **Refund detail** = the same `TransactionDetailPage` route, rendering refund-specific parts: clickable «Возврат к продаже/поставке» banner, «Причина возврата» card, «Сумма возврата» financial card. No kebab at all on a refund detail.
- **Wire:** refunds POST through the shared multipart `POST /api/transactions` with `Type=SaleRefund|SupplyRefund` + `OriginalTransactionId` + `RefundReason` — no dedicated refund route.

## Traps

Module-specific designed behavior — never report these (shared-checklist §6 traps not repeated):

| Observation | Why it's correct |
| --- | --- |
| Refund rows show «—» in «Статус» and vanish entirely when any status filter is active | refunds carry no payment status (`TransactionStore.feedFor`, design parity) |
| Refund amount «−…» renders in ink, not red | green/red reserved for money-direction figures (#4); the minus is owner decision D12 |
| Success toast «Возврат к №N проведён» cites the ORIGINAL's number, not the new refund's | by design (`transaction.refund.success`) |
| Checking a line in the modal pre-fills the full available quantity | convenience default, editable |
| Refund detail has no payments card and no status chip | an unpaid refund's debt surfaces on /debts and the partner ledger, not on its own detail |
| A refund detail's only header button is «Печать накладной» (no ⋮, no refund action) | Designed — a refund is not refundable (R4); the button opens the printable «Накладная» |
| Warehouse «Движения» filter «Возврат» matches zero rows | Known F8 — verify refund movements in the unfiltered list |

## Happy path

### T-RFD-01 · Run-scoped books: partner, products, original sale [happy] ✍
Pre: QA org; fixtures «QA Склад А», «QA Касса». All later cases build on this data — run in doc order. Record document numbers as you go: №S (sale), №R1/№R2/№R3 (refunds).
Steps:
1. Create partner «QA-<MMDD> Возврат Партнёр» (type «Клиент + Поставщик», opening balance 0).
2. Create products «QA-<MMDD> Возврат А» and «QA-<MMDD> Возврат Б» (piece unit, no packaging, supply 10 000 / sale 15 000).
3. `/supplies/new`: partner above, «QA Склад А», line А×10 @ 10 000 = 100 000; pay 100 000 fully from «QA Касса».
4. `/sales/new`: same partner/warehouse, line А×5 @ 15 000 = 75 000, no discount, paid 0. Record №S.
5. Open `/partners/:id` of the run partner and capture `GET /api/partners/{id}` from the network.
Expect: sale №S detail — «Итого» 75 000, «Оплачено» 0, «Остаток» 75 000, status «Не оплачено»; «QA Склад А» → Остатки: product А qty 5 (10−5, R19); network `GET /api/partners/{id}` → `balance: 75000` (R12).

### T-RFD-02 · First SaleRefund: 3 of 5, mandatory reason [happy] ✍
Pre: T-RFD-01.
Steps:
1. On `/sales/:id` of №S (title «Продажа №S»): click «Оформить возврат».
2. Verify modal title «Возврат к продаже №S»; meta row shows partner, warehouse, date; line А: «Продано» 5, «Возвращено» «—», «Доступно» 5 (R5).
3. Check the line — qty pre-fills 5; change to 3. Footer reads «Позиций к возврату: 1» · «Сумма возврата: −45 000 UZS» (3 × 15 000).
4. Verify «Причина возврата» label carries a red asterisk (R7 — visibly marked) and the info banner «Возврат необратим…» is present (R1).
5. Reason: «QA возврат — брак»; click «Провести возврат».
Expect: toast «Возврат к №S проведён»; modal closes; detail refreshes; network POST carries `Type=SaleRefund`, `OriginalTransactionId` = №S's id, `RefundReason` (R2, R3 — type derived from the original, never asked).

### T-RFD-03 · Refund row rendering in /sales [happy]
Pre: T-RFD-02. Record the refund's number №R1.
Steps: open `/sales`, default sort; locate the refund row.
Expect: sits directly ABOVE sale №S (date-desc tie handling by design); outlined chip «Возврат» with undo icon; amount «−45 000» (ink, D12); «Статус» «—»; № cell shows №R1 with sublabel «Возврат к №S» (DR-21 — «№» prefix, no Latin prefixes).
Known: F19 resolved F6 — a blank «Возврат к №N» sublabel is a REGRESSION; report as a new defect, not F6.

### T-RFD-04 · Refund detail: content, links, no refund-of-refund [happy]
Pre: T-RFD-03.
Steps: click the refund row → its detail page.
Expect: title «№R1» only (#20e); banner «Возврат к продаже» + «№S», click navigates to №S's detail; «Причина возврата» card shows the entered text; financial card «Сумма возврата» = −45 000 UZS, «Исходная продажа» = «№S» (clickable), «Позиций возвращено» 1; header has NO kebab and no refund affordance anywhere on the page (R1, R4).

### T-RFD-05 · Original reflects refunded quantities [happy]
Pre: T-RFD-04.
Steps: on №S's detail scroll to «Возвраты по этой продаже»; then reopen «Оформить возврат» (don't submit — close it).
Expect: refund-history card count pill 1; row = date · «№R1» · positions 1 · reason · −45 000; row click opens №R1. Reopened modal line А: «Возвращено» 3, «Доступно» 2 (R5 — remaining = 5 − 3). Original's own figures unchanged: «Итого» still 75 000 (R1 — counter-event, not mutation).

### T-RFD-06 · SaleRefund returned stock to the warehouse [happy]
Pre: T-RFD-02.
Steps: open «QA Склад А» detail → Остатки; find product А.
Expect: qty = 8 (5 + 3 — SaleRefund is a stock-in, R18); unit cost/WAC for А still 10 000 (single-cost history). An unfiltered «Движения» list shows the refund movement.
Known: F8 — the «Возврат» kind filter matches nothing; do not use it.

### T-RFD-07 · Refund «Накладная» prints from the visible header button [happy]
Pre: T-RFD-04 (refund №R1 of sale №S).
Steps: on №R1's detail click the header button «Печать накладной».
Expect: `/sales/<R1 id>/print`: «Накладная на возврат продажи №R1», «Возврат по продаже №S», «Отправитель» = the client, «Получатель» = the business; lines = the refunded lines; «Итого» = the refund sum (unsigned); NO «Оплачено» / «Осталось оплатить» (a refund moves no money); «Причина возврата: QA возврат — брак».

## Edge & negative

### T-RFD-30 · Submit without reason / without lines → inline errors [negative]
Pre: T-RFD-02 (3 of 5 already refunded); modal open on №S (⋮ → «Создать возврат»).
Steps:
1. With no line checked and empty reason click «Провести возврат».
2. Check line А (qty pre-fills 2), leave reason empty, submit again.
Expect: step 1 — «Выберите хотя бы одну позицию и укажите количество к возврату.» AND reason error «Укажите причину возврата — поле обязательно» inline (R7, #18 — no banner-only, no disabled button); step 2 — only the reason error remains; NO `POST /api/transactions` fired either time. Close via Отмена (confirm discard).

### T-RFD-31 · Over-cap second refund blocked client-side [negative]
Pre: T-RFD-02 (3 of 5 already refunded).
Steps: modal on №S; check line А; type qty 3 (available is 2); enter any reason; submit.
Expect: row turns error-tinted with «Максимум к возврату: 2 … (уже возвращено 3 из 5)» and banner «Количество к возврату превышает доступное. Исправьте отмеченные позиции.»; «Сумма» column shows «—» for the over row; NO POST fired (R5 — cumulative cap across all refunds).

### T-RFD-32 · Second refund of the remaining 2 succeeds [edge] ✍
Pre: T-RFD-31 (modal still open).
Steps: correct qty to 2; reason «QA возврат — остаток»; submit. Record №R2.
Expect: footer showed «Сумма возврата: −30 000 UZS» (2 × 15 000); toast «Возврат к №S проведён» (R6 — multiple refunds allowed); «QA Склад А» Остатки: product А qty = 10 (8 + 2).

### T-RFD-33 · Fully-refunded line cannot be refunded again [edge]
Pre: T-RFD-32.
Steps: on №S reopen ⋮ → «Создать возврат»; inspect line А; check it; enter a reason; submit.
Expect: «Возвращено» 5, «Доступно» 0 (dimmed); checking pre-fills qty 0; submit → «Выберите хотя бы одну позицию и укажите количество к возврату.», no POST (R5). Close without saving.

### T-RFD-34 · SupplyRefund blocked when the stock was already sold [negative] ✍
Pre: T-RFD-01 (product Б exists, stock 0).
Steps:
1. `/supplies/new`: partner «QA-<MMDD> Возврат Партнёр», «QA Склад А», Б×5 @ 10 000 = 50 000, paid fully from «QA Касса». Record №P.
2. `/sales/new`: same partner, Б×4 @ 15 000 = 60 000, paid fully. (Stock Б: 5 − 4 = 1.)
3. On №P's detail: ⋮ → «Создать возврат» — modal titled «Возврат к поставке №P» (R3 — SupplyRefund from a Supply). «Доступно» shows 5 (cap tracks the original line, not stock).
4. Check line, qty 5, reason «QA возврат поставщику», submit.
Expect: refund NOT created — backend 400 (R20 — SupplyRefund is a stock-OUT; only 1 in stock). Current build surfaces only the generic toast «Не удалось провести возврат»; the R20 digest expects an inline error naming available-vs-requested — if only the numbers-free toast appears, log a defect candidate (no F-item exists yet). Verify via network: 400 on POST; `/supplies` gains no refund row.

### T-RFD-35 · SupplyRefund within stock succeeds [edge] ✍
Pre: T-RFD-34 (stock Б = 1).
Steps: on №P's modal set qty 1, same reason, submit. Record №R3.
Expect: toast «Возврат к №P проведён»; `/supplies` row: outlined chip «Возврат поставки», amount «−10 000», sublabel «Возврат к №P»; «QA Склад А» Остатки: product Б qty = 0 (stock-out at WAC, R19).

### T-RFD-36 · Status filter hides refunds; search finds them by original number [edge]
Pre: T-RFD-32.
Steps: on `/sales` — 1. set the status filter to «Не оплачено» (the Open option); 2. reset to all, then search the bare number of №S.
Expect: step 1 — №R1/№R2 disappear, sale №S stays (trap — designed, do not report); step 2 — results include №S AND both its refunds (search matches `originalTransactionNumber`).

### T-RFD-38 · Refund from the list row ⋮ [happy]
Pre: a sale with something left to refund (e.g. №S before T-RFD-32).
Steps: on `/sales` open the row's ⋮ → «Оформить возврат». Close the modal with «Отмена»; reload the page; then press Back.
Expect: the sale's detail opens with the refund modal already open, lines and «Возвращено» filled in. After closing, neither the reload nor Back reopens the modal. Refund rows have no ⋮.

### T-RFD-39 · Fully refunded document explains instead of offering a refund [edge]
Pre: T-RFD-32 for a one-line №S (or any sale whose every line was refunded in full).
Steps: 1. `/sales`: find №S. 2. Open №S.
Expect: 1 — «Возвращено полностью» under the number, no ⋮ on that row. 2 — the header shows a grey «Возвращено полностью» pill instead of «Оформить возврат»; «Возвраты по этой продаже» lists the refunds. A document arriving from a stale list ⋮ after it was fully refunded opens without the modal and toasts «Продажа №S уже возвращена полностью — возвращать нечего».

### T-RFD-37 · Refund lines are picked with the keyboard [edge]
Pre: a sale with something left to refund.
Steps: open «Оформить возврат»; press Tab until a line's checkbox shows the focus ring; press Space; Tab once; type «1»; Shift+Tab back to the checkbox; press Space.
Expect: the first Space checks the line and pre-fills its available quantity; the quantity field takes «1»; the second Space unchecks the line and clears it. A screen reader announces the checkbox as «Вернуть «<товар>»» with its checked state.

### T-RFD-40 · Refund prices come from the original, read-only [edge]
Pre: a sale with one line of 3 × 1 000 and a fixed line discount of 100 (net 2 900), nothing refunded yet.
Steps: open «Оформить возврат»; hover the «i» next to «Цена за ед.»; tick the line and set «К возврату» 1; then 3; click «Провести возврат» with a reason; open the created refund.
Expect: the «i» reads «Цена и скидка — из продажи: возврат проводится по ним, изменить их нельзя.»; no price is editable. «Цена за ед.» shows 966,67 (1 000 − 100 / 3) and the line «Сумма» 966,67 for 1, 2 900 for 3 — the fixed discount is shared out by quantity exactly as the server books it (2 decimals, never rounded to whole sums). The refund detail's total equals the modal's «Сумма возврата». The «Причина возврата» field is named by its label (a screen reader reads «Причина возврата»).

## Reconciliation

Run after all cases above. Event ledger for «QA-<MMDD> Возврат Партнёр»: sale +75 000 unpaid; sale-refunds −45 000, −30 000 unpaid; supply of А 100 000 fully paid (net 0); supply/sale of Б fully paid (net 0); supply-refund +10 000 unpaid.

### T-RFD-60 · Partner balance moves in the served direction [reconcile]
Steps: open `/partners/:id` of the run partner; capture `GET /api/partners/{id}` from the network.
Expect: served `balance` = 10000 exactly (75 000 − 45 000 − 30 000 + 10 000; unpaid SaleRefund = payable, unpaid SupplyRefund = receivable — BR Domain model debt definitions); the balance card renders that served value, never a client re-sum (R12). Display sign/color is partner-POV — judge per `modules/partners.md`, not owner-POV.

### T-RFD-61 · Partner ledger gains a row per refund [reconcile]
Steps: partner detail → «Журнал» tab.
Expect: one row per event incl. all three refunds with amounts 45 000 / 30 000 / 10 000 in the directions that produce a running balance ending exactly at the served 10 000 (R12 — running balance consistent with `balance` from T-RFD-60).
Known: F20 — «Номер» column shows «—» on transaction-sourced rows (incl. refunds); only payment rows carry a number.

### T-RFD-62 · Debts view carries refund debts, net matches [reconcile]
Steps: open `/debts`; search the run partner; check «По транзакциям» and «По партнёрам».
Expect: «По транзакциям» has 4 open rows — №S remaining 75 000 (receivable — refunds never auto-settle the original; settlement is a payment event), №R1 45 000 and №R2 30 000 (payable), №R3 10 000 (receivable); «По партнёрам» nets the partner to 10 000 owed to us, equal to T-RFD-60's served balance (R12; owner-POV labels here — shared §5 POV trap).

### T-RFD-63 · Original ↔ refund-history ↔ refund details agree [reconcile]
Steps: №S detail «Возвраты по этой продаже»; open each refund.
Expect: history count pill 2; rows −45 000 (№R1) and −30 000 (№R2) sum to 75 000 = the sale's full value; each refund detail's «Сумма возврата» matches its history row and its `/sales` list row; №S totals still 75 000 / paid 0 (R1).

### T-RFD-64 · Stock cross-screen agreement [reconcile]
Steps: compare «QA Склад А» Остатки rows against each product's detail per-warehouse stock.
Expect: product А = 10 on both (10 − 5 + 3 + 2), product Б = 0 on both (5 − 4 − 1); А's WAC 10 000 on both (all stock-ins at 10 000 — R18).
