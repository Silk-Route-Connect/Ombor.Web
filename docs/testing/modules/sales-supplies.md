# Sales & Supplies — test cases (T-POS)

One direction-parameterized module: the `/sales` · `/supplies` feeds, transaction detail, and the full-page POS create flows. Refund creation and refund-row semantics belong to [refunds.md](refunds.md). Read with [../README.md](../README.md) · [../shared-checklist.md](../shared-checklist.md) · [../fixtures.md](../fixtures.md) · [../../frontend-gaps.md](../../frontend-gaps.md). Canon: business-rules §B (R8, R12–R14), §D (R17–R22), §K (R37–R38), R39–R40; contract `transactions-payments.md`.

## Surfaces

- `/sales`, `/supplies` — one `TransactionPage` (mode-parameterized): title «Продажи»/«Поставки», «Новая продажа»/«Новая поставка», «Экспорт CSV»; search «Поиск по номеру или партнёру…»/«…или поставщику…», payment-status filter, period filter («Весь период / Последние 7 / 30 / 90 дней»); columns Дата · Номер · Тип · Партнёр · Позиций · Сумма · Статус оплаты; badges «Продажа»/«Поставка» (refund badges per refunds.md); status chips «Не оплачено» (Open) / «Частично» (PartiallyPaid) / «Оплачено» (Closed) / «Просрочено» (Overdue).
- `/sales/:id`, `/supplies/:id` — one `TransactionDetailPage` (right rail, #20g): «Позиции» table + «Подытог / Скидка по позициям / Итого» footer; rail: financial card («Сумма продажи»/«Сумма поставки», «Оплачено», «Остаток», «Статус оплаты»), «Информация» (Создано, «Склад отгрузки»/«Склад приёмки», partner), «Платежи», «Примечание и вложения».
- `/sales/new`, `/supplies/new` — one `NewTransactionEntry` POS page: product search («Найдите товар по названию или артикулу…»), cart «Позиции», partner picker + projected «Баланс после продажи/поставки» card, warehouse «Склад»/«Склад приёмки», bulk-discount row, notes/attachments toggle, `TransactionSummaryCard` (totals → payment «Оплата» with wallet + amount + «Вся сумма» → overpayment disposition → immutability note → «Провести продажу»/«Провести поставку»), «Сохранить как шаблон», «Загрузить шаблон», keyboard hints.

## Traps

Module-specific; shared-checklist §6 still applies.

| Observation | Why it's correct |
| --- | --- |
| Supply lines never warn or block on stock («Превышает остаток…» appears on Sale lines only) | supplies are stock-IN (R20 blocks stock-outs only) |
| No payment-type or direction control in the POS payment section | guided flow — type fixed by context, direction derived (R13–R14) |
| «Погасить долги» button inside POS totals on overpayment | R40 settle-other-debts opt-in; the standalone-payments DR-05 deferral does not apply to this guided flow |
| Sale submit with zero payment interrupts with a dialog «Провести без оплаты?» → «Провести в долг» | deliberate friction before creating debt, not a validation failure |
| Wallet options render «{тип} · баланс N UZS» exposing balances in the picker | designed tender affordance |
| Cart-line «Цена за ед», «Скидка» and «Оплата» amount fields space-group digits as you type («1 500 000») and show blank + placeholder «0» at zero | `MoneyInputBase` live thousands grouping; the raw whole-number UZS is stored, not the formatted string |
| «Скачать» on detail → toast «… — раздел в разработке» | dev stub |
| Sale and Supply numbers interleave in one sequence | DR-21 single series |
| Product search shows «Нет в наличии» but still allows adding the product on Supply | stock-in needs no stock |
| Line totals, stock hints and the detail stay in «шт» while the qty field counts «упак» | quantity is base-unit source of truth (R21); the entered pack count is entry-only, not persisted — F21 |

## Happy path

Run in doc order; later cases consume earlier data. Run-scoped set: products «QA-<MMDD> Товар П1» and «QA-<MMDD> Товар П2» (both sale 1 000 / supply 100), partner-supplier «QA-<MMDD> Поставщик П», partner-customers «QA-<MMDD> Покупатель» and «QA-<MMDD> Покупатель Б» (created in T-POS-35). Fixtures used: «QA Склад А», «QA Касса», «QA Категория», «QA Товар Упаковка».

### T-POS-01 · Run-scoped setup [happy] ✍

Pre: fixtures seeded.
Steps: 1. Create product «QA-<MMDD> Товар П1»: category «QA Категория», SKU «QA-<MMDD>-P1», unit шт, supply price 100, sale price 1 000. 2. Create product «QA-<MMDD> Товар П2»: same category, SKU «QA-<MMDD>-P2», unit шт, supply price 100, sale price 1 000. 3. Create partners «QA-<MMDD> Поставщик П» (Поставщик, opening 0) and «QA-<MMDD> Покупатель» (Клиент, opening 0).
Expect: products created with **no quantity/cost inputs** on the form (R22); product list stock 0 for both.

### T-POS-02 · First supply seeds stock and WAC [happy] ✍

Pre: T-POS-01.
Steps: 1. `/supplies/new`: partner «QA-<MMDD> Поставщик П», «Склад приёмки» = «QA Склад А». 2. Add П1, qty 10, «Цена поставки за шт» 100. 3. Add П2, qty 10, «Цена поставки за шт» 100. 4. «Оплата»: wallet «QA Касса», «Вся сумма» (2 000). 5. «Провести поставку».
Expect: success toast cites the document number — per DR-21/F19 it must render «№N»; the current string is «Поставка #{{number}} проведена» — if «#N» renders, report a Cosmetic defect (convention violation), the supply itself is fine. «QA Склад А» → Остатки: П1 qty 10, «Сред. себест.» 100; П2 qty 10, «Сред. себест.» 100 (#16); П1 product detail totalStock 10.

### T-POS-03 · Second supply at a new price — WAC oracle [happy] ✍

Pre: T-POS-02.
Steps: 1. `/supplies/new`: same partner/warehouse, П1 × 10 @ 200 (2 000). 2. No payment → «Провести поставку» → dialog «Провести без оплаты?» (body names the amount and «нашим долгом перед поставщиком») → «Провести в долг».
Expect: supply created, status «Не оплачено», payable 2 000 on the supplier (partner-POV display per [partners.md](partners.md)). Stock 20; **WAC = 150** on the warehouse row and product detail — (10×100 + 10×200)/20 (R18). No formula shown in the UI, tooltip only (#16).

### T-POS-04 · Discount math on a credit sale [happy] ✍

Pre: T-POS-03 (П1 stock 20, П2 stock 10).
Steps: 1. `/sales/new`: partner «QA-<MMDD> Покупатель», «Склад» = «QA Склад А». 2. Line 1: П1 qty 5, price 1 000, discount **fixed** 800. 3. Line 2: П2 qty 5, price 1 000, discount **10%**. 4. Read the line totals and the summary. 5. Zero payment → «Провести продажу» → «Провести в долг».
Expect: line 1 «Итоговая цена» **4 200** — fixed is off the whole line, not per-unit (R37; math: 5 000 − 800). Line 2 → **4 500** (R37). Summary: «Подытог» 10 000 · «Скидка» 1 300 · «Итого» 8 700 — computed sum of line discounts, no transaction-level discount input anywhere (R38). Partner picker was empty until chosen (R39, #9). Sale lands «Не оплачено», stock П1 15 · П2 5.
Known: the fixed-discount helper text reads «Фиксированная сумма за единицу» — it contradicts the actual whole-line math (verified in `transactionUtils.lineNet`); if the hint still says «за единицу», report a copy defect (clarity guideline; R37).

### T-POS-05 · Fully-paid sale — no dialog, Closed [happy] ✍

Pre: T-POS-04 (П1 stock 15).
Steps: 1. `/sales/new`: «QA-<MMDD> Покупатель», П1 × 2 @ 1 000, no discount. 2. «Оплата»: «QA Касса», «Вся сумма» (2 000). 3. «Провести продажу».
Expect: no «Провести без оплаты?» dialog (payment covers total); toast; list row «Оплачено»; detail financial card «Оплачено полностью», «Остаток» 0; «Платежи» section shows one generated payment. П1 stock 13.

### T-POS-06 · Partial payment → «Частично» [happy] ✍

Pre: T-POS-05 (П1 stock 13).
Steps: 1. `/sales/new`: same partner, П1 × 3 @ 1 000 (3 000). 2. Pay 1 000 from «QA Касса». 3. Submit (dialog appears for the unpaid remainder only if implemented for partial — record which) → confirm.
Expect: sale created; status «Частично» (PartiallyPaid); detail «Оплачено» 1 000, «Остаток» 2 000 — served figures (R12). П1 stock 10.

### T-POS-07 · Overpayment: change default; settle-debts opt-in; advance gated [happy] ✍

Pre: T-POS-06 — partner has open debt (8 700 + 2 000). П1 stock 10.
Steps: 1. `/sales/new`: same partner, П1 × 2 @ 1 000 (2 000). 2. Pay 3 000 from «QA Касса» — leftover 1 000 appears. 3. Inspect the disposition controls. 4. Open «Погасить долги» → modal «Распределение платежа»: verify the partner's open transactions are listed with «Остаток» and an «Авто (по порядку)» auto-allocation button; allocate the 1 000 to the oldest (T-POS-04 sale). 5. «Провести платёж» → toast «Распределено по долгам · 1 000 UZS»; summary now shows a «Погашение долгов» row of −1 000 with a «№N» sub-row. 6. Submit.
Expect: default disposition is «Сдача» (#5, R40); an «Аванс» toggle is **not** offered while other debt remains (R40, #6); settling is opt-in via the modal. After submit: the T-POS-04 sale's «Остаток» drops by 1 000 (8 700 → 7 700), its chip «Частично»; the new sale «Оплачено». П1 stock 8.

### T-POS-08 · Package-unit entry [happy] ✍

Pre: fixture «QA Товар Упаковка» (packaging size 12) with stock ≥ 24 in «QA Склад А» — if absent, first supply 3 packages/36 units via `/supplies/new` from partner «QA-<MMDD> Поставщик П» (switch the line to «упак», qty 3 — hint «= 36 шт»), paid in full from «QA Касса».
Steps: 1. Read and note the current «QA Товар Упаковка» stock on «QA Склад А»; then `/sales/new`: partner «QA-<MMDD> Покупатель», add «QA Товар Упаковка». 2. The line's qty column shows a «шт | упак» toggle (packaged products only), default «шт». 3. Click «упак»: label flips to «Кол-во · упак», the qty converts up to whole packages, hint «= N шт» appears; the «упак» segment's tooltip shows the packaging label (or «Упаковка · 12 шт»). 4. Enter 2 — hint «= 24 шт»; line total = 24 × unit price («Цена за шт» stays per base unit). 5. Stepper +/− and ↑/↓ step whole packages; «−» disabled at 1 упак. 6. Submit paid in full from «QA Касса».
Expect: stock decremented by exactly 24 base units (R21: package count × size); line total and summary math in base units × unit price. The entered package count is **not** retained after submit — the detail line shows 24 шт (F21: the line contract has no pack field; R21's audit clause is a recorded gap, not a defect here).

### T-POS-09 · Save as template; load fills current prices [happy] ✍

Pre: T-POS-04 partner exists.
Steps: 1. `/sales/new`: partner «QA-<MMDD> Покупатель», П1 × 2. 2. «Сохранить как шаблон» → name «QA-<MMDD> Шаблон» → «Сохранить шаблон». 3. Leave the page (dialog «Несохранённые изменения» → «Уйти со страницы»). 4. Fresh `/sales/new`: same partner → «Загрузить шаблон» → pick it.
Expect: template save requires partner + lines («Сначала выберите партнёра», «Добавьте хотя бы одну позицию» when missing); load toast «Шаблон «QA-<MMDD> Шаблон» загружён»; lines fill with the product's **current** sale price (templates store products, never prices — Domain model); the menu is partner-scoped («У этого партнёра нет шаблонов» for others). Leave without submitting.
Known: price-change proof is blocked by F1 (product edit crash) — assert current-price fill only.

### T-POS-10 · List filters, search, export [happy]

Pre: T-POS-02…07 data.
Steps: 1. `/sales`: status filter «Частично». 2. Reset; search the T-POS-04 document number (bare digits). 3. Search «Покупатель». 4. Period «Последние 7 дней». 5. «Экспорт CSV» with search active.
Expect: each filter narrows correctly; number search finds the sale; CSV contains exactly the filtered rows (#11); empty combination → «Ничего не найдено» + mode-specific hint text.

## Edge & negative

### T-POS-30 · Submit without partner / without lines [negative]

Steps: 1. `/sales/new`: add a line, no partner → «Провести продажу». 2. Clear cart via «Очистить»; pick a partner, no lines → submit.
Expect: 1 → inline «Выберите партнёра» on the picker (R39, #9; DR-24 — no banner); 2 → cart error state «Добавьте хотя бы одну позицию». Button enabled throughout (#7). No POST fires either time.

### T-POS-31 · Over-stock sale blocked with numbers [negative]

Pre: П1 stock as left by happy path (finite, known — read it first on «QA Склад А»).
Steps: 1. `/sales/new`: partner «QA-<MMDD> Покупатель», П1 qty = stock + 50. 2. Observe the line. 3. Submit.
Expect: live line hint «Превышает остаток · доступно N шт»; on submit the line errors «Недостаточно товара: доступно N шт» + summary error «Исправьте количество в выделенных позициях»; **no POST** (client hard-block, R20/DR-10). Input itself accepts any number (#7 — block reports, never disables). Fix the qty to 1 and abandon the page (unsaved dialog).

### T-POS-32 · Fixed discount above line gross clamps to zero [edge]

Steps: 1. `/sales/new`: any partner, П1 qty 5 @ 1 000, fixed discount 6 000. 2. Read the line total. 3. Leave without submitting (discard dialog).
Expect: «Итоговая цена» 0 — clamped to line gross, never negative (R37). No submit — display-only check.

### T-POS-33 · Bulk percent overwrites per-line discounts [edge]

Steps: 1. `/sales/new`: a П1 line with fixed 800 and a П2 line with 10%. 2. «Применить скидку ко всем»: 5% → «Применить». 3. Inspect both lines. 4. Leave (discard).
Expect: both lines now carry exactly 5% («−5% на все позиции» chip) — the fixed 800 is gone, nothing stacked (R38). Bulk input is percent-only by design.

### T-POS-34 · Supply tender exceeding wallet balance blocked [negative]

Pre: read «QA Касса» balance from the wallet option label («Наличные · баланс N UZS»).
Steps: 1. `/supplies/new`: supplier partner, П1 × 1 @ 100. 2. «Оплата» from «QA Касса», amount = max(balance, 0) + 1 000. 3. Submit. 4. Set the amount to 0 and submit again (back out of the dialog without confirming).
Expect: 3 → inline «Доступно только N UZS — нельзя списать больше остатка кассы.» (DR-25) with N = max(balance, 0) — **never a negative amount** (an overdrawn wallet shows «0 UZS»); no POST. 4 → a zero tender is not an outflow: the guard passes and the «Провести без оплаты?» dialog opens even from an overdrawn wallet. Both clamp behaviors live-verified 2026-07-17 (guard itself first live-verified same day; shipped code-only in PR #72). Sales (income direction) never show this guard.

### T-POS-35 · Credit sale to a partner holding an advance [edge] ✍

Pre: create partner «QA-<MMDD> Покупатель Б» (Клиент, opening 0) — zero debt, so the deposit can become an advance (R40; against a partner with open debt it would settle the oldest sale instead, corrupting T-POS-60's oracle). Give «Покупатель Б» an advance: payments modal → «Депозит», 500 from «QA Касса» ([payments.md](payments.md) mechanics).
Steps: 1. `/sales/new`: partner «QA-<MMDD> Покупатель Б», П1 × 1 @ 1 000, zero payment. 2. Observe the summary/payment area before submitting. 3. Abandon (do not submit).
Expect: i18n carries an unused `payment.mustUseBalanceWarning` string («У партнёра есть доступный баланс…») that no component renders — do not assert it; no advance-balance warning currently surfaces in the POS. Record exactly what (if anything) surfaces the partner's advance and whether submit is possible; canon does not specify the enforcement — report behavior as an observation, not a new defect.

### T-POS-36 · Package toggle: ceil conversion up, lossless return [edge]

Pre: «QA Товар Упаковка» (size 12) exists; no submit — display-only.
Steps: 1. `/sales/new`: partner «QA-<MMDD> Покупатель», add «QA Товар Упаковка»; qty 13 in «шт». 2. Toggle «упак» — read field + hint. 3. Toggle «шт». 4. Leave (discard dialog).
Expect: 2 → field 2 упак, hint «= 24 шт» — switching converts UP to whole packages (never below the entered amount), and the line total jumps accordingly (visible, not silent); 3 → field 24 шт, totals identical to the pack-mode state (quantity in base units is the source of truth across toggles).

### T-POS-37 · Over-stock sale in package mode [negative]

Pre: read «QA Товар Упаковка» stock N on «QA Склад А» (finite).
Steps: 1. `/sales/new`: partner «QA-<MMDD> Покупатель», add «QA Товар Упаковка», «упак», packs such that packs × 12 > N. 2. Observe the line. 3. Submit. 4. Fix to a valid count; abandon (discard dialog).
Expect: live hint «Превышает остаток · доступно N шт» and submit error «Недостаточно товара: доступно N шт» — both in **base units** while the field counts packages; no POST (R20/DR-10); stepper and typing never disabled (#7).

### T-POS-38 · Toggle scope + template round-trip drops pack mode [edge]

Steps: 1. `/sales/new`: partner «QA-<MMDD> Покупатель», add П1 — inspect its qty column. 2. Add «QA Товар Упаковка», «упак», qty 2; «Сохранить как шаблон» → «QA-<MMDD> Шаблон У». 3. Leave (discard); fresh `/sales/new`, same partner → load «QA-<MMDD> Шаблон У». 4. Leave (discard).
Expect: 1 → no unit toggle on a product without packaging (base behavior unchanged); 3 → the packaged line loads as 24 «шт» with the toggle off — the pack count is entry-only, not persisted in templates (F21 observation, not a defect); П1 line loads as before.

### T-POS-39 · Supply entered in packages [edge]

Steps: 1. `/supplies/new`: partner «QA-<MMDD> Поставщик П», «Склад приёмки» = «QA Склад А», add «QA Товар Упаковка» → «упак», qty 3. 2. Read the line. 3. Leave without submitting (discard dialog).
Expect: same toggle/hint mechanics as Sale (hint «= 36 шт»; price label «Цена поставки за шт» stays per base unit); no stock hints or warnings in either unit mode (stock-in, R20). Display-only — T-POS-08's fallback supply already proves pack-mode stock-in math end-to-end.

## Reconciliation

### T-POS-60 · Detail arithmetic ↔ list ↔ served totals [reconcile]

Pre: T-POS-04 sale.
Steps: open its detail; compare with its `/sales` row and `GET /api/transactions/{id}`.
Expect: «Подытог» 10 000 − «Скидка по позициям» 1 300 = «Итого» 8 700; list «Сумма» = 8 700; served `totalDue`/`totalPaid`/`remaining` match the financial card digit-for-digit (server-computed, R12); «Остаток» = Итого − Оплачено after T-POS-07's settlement (7 700).

### T-POS-61 · Stock chain ↔ product movements [reconcile]

Steps: 1. «QA Склад А» → Остатки: П1 and П2 rows. 2. Product П1 detail → Движения; repeat for П2. 3. Compare quantities and «Сред. себест.».
Expect: warehouse qty = product totalStock (single-warehouse products); П1 movements list the full run chain +10 +10 −5 −2 −3 −2 with signed quantities and running balanceAfter ending at 8; П2 movements +10 −5 ending at 5; WAC 150 (П1) and 100 (П2) everywhere until any later stock-in (R17–R18; the run created no other stock-in events — see business-rules Domain model → Stock-in events).

### T-POS-62 · POS-generated payments ↔ payments list ↔ wallet [reconcile]

Steps: 1. `/payments`: search «Покупатель» and «Поставщик П». 2. Open «QA Касса» detail → Операции.
Expect: every paid POS case above produced exactly one «Оплата» payment (T-POS-02: 2 000 expense; T-POS-05: 2 000 income; T-POS-06: 1 000; T-POS-07: 3 000; T-POS-08: package sale — plus, additionally, the conditional top-up supply payment when T-POS-08's fallback supply ran) — amounts, dates and directions match; wallet operations contain the same amounts with consistent running «Баланс после» (R8, R15).

### T-POS-63 · One number series across directions [reconcile]

Steps: list the run's document numbers (sales + supplies) in creation order.
Expect: strictly increasing single sequence — supplies do not reset or fork the series (DR-21); every rendering is «№N» with no Latin prefix.
