# Partners — test cases (T-PRT)

Partner master data: list + summary strip, detail (balance, dispute-grade ledger, tabs), create/edit, archive/restore, reference-gated delete. Read with [../README.md](../README.md) · [../shared-checklist.md](../shared-checklist.md) · [../fixtures.md](../fixtures.md) · [../../frontend-gaps.md](../../frontend-gaps.md).

## Surfaces

- `/partners` — list: `PageHeader` («Партнёры», «Новый партнёр», «Экспорт CSV»), `PartnerSummaryStrip` (3 cards), search + type segmented («Все | Клиенты | Поставщики») + archive segmented «Активные | Архив», `PartnersTable`.
- `/partners/:id` — detail: `DetailPageHeader` (name; type chip + company as titleExtra), sticky 372px right rail (balance hero + «Обороты» + «Контакты»), `DetailTabs` Журнал / Транзакции / Платежи with count pills. Deep-link params: `?tab=transactions|payments&status=open|paid|partial|unpaid`.
- `PartnerFormModal` (create/edit — shared by list and detail) · `PartnerDialogs` (archive / restore / delete / cannot-delete confirms).
- Entry points: sidebar «Партнёры»; `PartnerLink` from Debts, transaction/order rows and details.

## Traps

Module-specific designed-behavior; shared-checklist traps not repeated.

| Observation | Why it's correct (or how to report) |
| --- | --- |
| **Balances on ALL partner surfaces are SIGNED, partner-POV**: «−50 000» red = partner owes us, «+50 000» green = we owe partner (list column, detail hero, ledger Сумма/Баланс после, form previews). Contradicts locked #4 (unsigned natural-language) and the shared forbidden-affordance «+/− on balances». | Deliberate display-only flip (repo-state Partners decision; served value stays company-POV, R12). Do NOT report signs/colors here as defects. DO note in the report: **#4 canon amendment still pending — confirm with owner.** |
| Red/green look inverted vs /debts and Dashboard (there, receivable is a labeled owner-POV bucket). | Designed: Debts/Dashboard stay owner-POV; partner surfaces are partner-POV. Cross-screen color difference is not a bug. |
| Summary-strip figures carry no signs (receivable red / payable green / net neutral + direction word). | Aggregate buckets are unsigned by design; only single balances are signed. |
| Partner detail has a right rail — shared-checklist §3 says «missing rail on Partner is correct» (#20g/DR-01: stacked). | Working-tree decision (DEC-8) supersedes; don't report the rail as a layout defect, but note the #20g conflict for canon sync. |
| Header shows type chip + company after the name (titleExtra). | #20e open ruling on titleExtra — existing usage, not a defect. |
| «Обороты» rail card sums ledger deltas client-side. | Display subtotals of served deltas — not a recomputed balance; no R12 violation. The balance itself is served. |
| Opening ledger row: tinted, not clickable, date without time, «—» in «Номер». | Designed — opening is a synthetic event (id 0, no source record). |
| Zero balance renders «—» in the list column (detail shows «0» + «Баланс закрыт — обязательств нет»). | Designed muting of settled partners. |
| Form type control shows short «Оба»; chips elsewhere show «Клиент + Поставщик». | #15 governs chips; the compact form label is a localized short form, not a raw enum leak. |
| Archived partner selectable in the **Template** form partner picker. | Known F15 — belongs to `modules/templates.md` (Wave 2); do not test or report here. |

## Happy path

Run-scoped entities: «QA-<MMDD> Партнёр А» (T-PRT-01), «QA-<MMDD> Партнёр Б» (T-PRT-34), «QA-<MMDD> Партнёр В» (T-PRT-36). Deep passes run in doc order — later cases build on earlier data.

### T-PRT-01 · Create partner with opening balance [happy]
Pre: /partners, QA org.
Steps: 1) «Новый партнёр». 2) Name «QA-<MMDD> Партнёр А», type «Поставщик», phone national part `901234567`. 3) Opening: «Партнёр должен нам», amount 50 000 — note the red «−» sign preview and «Стартовая запись в книге: −50 000 UZS». 4) Submit «Создать партнёра».
Expect: toast «Партнёр «QA-<MMDD> Партнёр А» создан»; row appears with balance «−50 000» red (partner-POV — see Traps); phone renders with fixed «+998» prefix. Opening is a signed immutable event; `openingDate` is server-set to today — visible on the detail rail as «Начальный баланс: <today DD.MM.YYYY> — −50 000 UZS» (contract: create; R12).

### T-PRT-02 · Detail page structure, rail, count pills [happy]
Pre: partner А (T-PRT-01).
Steps: 1) Open А from the list. 2) Inspect header, rail, tabs.
Expect: header = name + type chip «Поставщик» + no meta beyond titleExtra (#20e, Traps); rail balance hero «−50 000» red + hint «Дебиторская задолженность — партнёр должен нам»; opening strip per T-PRT-01; «Обороты» rows Продажи/Поставки/Платежи all «—» (zero); «Контакты» lists the phone. Tabs «Журнал 1 · Транзакции 0 · Платежи 0» (#20b). Транзакции tab shows empty state «Партнёр только создан — пока есть только начальный баланс…».

### T-PRT-03 · Ledger opening row semantics [happy]
Pre: partner А.
Steps: 1) Журнал tab.
Expect: exactly one row — «Номер» = «—», date **without** time, event «Начальный баланс», Сумма «−50 000» red, «Баланс после» «−50 000»; row is tinted and clicking it does nothing (contract: ledger opening event, sourceId null).

### T-PRT-04 · Edit preserves served balance (F2 regression watch) [happy]
Pre: partner А.
Steps: 1) Detail ⋮ → edit. 2) Set company «QA Компания». 3) «Сохранить изменения».
Expect: toast «Изменения сохранены»; balance still «−50 000» immediately, **without reload** (update re-reads by id). F2 is FIXED — a «—»/«не число»/NaN/0 balance after edit is a **NEW regression**: report FAIL, not KNOWN.

### T-PRT-05 · Supply creates a signed ledger row with running balance [happy] ✍
Pre: partner А; fixtures «QA Склад А», «QA Товар Штучный» (supply 10 000).
Steps: 1) /supplies/new: partner А, warehouse «QA Склад А», «QA Товар Штучный» ×10 (total 100 000), no payment, submit. 2) Back to А → Журнал.
Expect: new supply row on top (date-desc default): event «Поставка», Сумма «+100 000» green (we owe more, partner-POV), «Баланс после» «+50 000» = −(50 000 − 100 000) green; balance card now «+50 000» green + hint «Кредиторская задолженность — мы должны партнёру»; «Обороты» Поставки = 100 000; pills «Журнал 2 · Транзакции 1 · Платежи 0» (R12).
Known: F20 — the supply row's «Номер» shows «—» (backend serves no `reference` on sale/supply rows); payment rows do show it. KNOWN, not new.

### T-PRT-06 · Deep link lands on filtered Транзакции tab [happy]
Pre: partner А with the open supply debt (T-PRT-05).
Steps: 1) Navigate directly to `/partners/<id А>?tab=transactions&status=open`. 2) Also: /debts → По партнёрам → click А and note whether the link carries the same params.
Expect: Транзакции tab active, status filter preset «Открытые — долг», showing exactly the unpaid supply (status chip «Не оплачено», Сумма 100 000). `open` = unpaid ∪ partial. Refresh keeps the filtered landing.

### T-PRT-07 · Payment settles debt; ledger and balance reconcile [happy] ✍
Pre: partner А (open supply 100 000).
Steps: 1) Payments page → create payment: type «Оплата», partner А, wallet «QA Касса», amount 100 000, submit (exact amount — no settlement modal, #5). 2) А → Журнал.
Expect: payment row: event «Оплата», Сумма «−100 000» red (their claim shrank, partner-POV), «Баланс после» «−50 000» red; «Номер» carries the payment's document number (verify against canon DR-21 — bare `N` vs «№N»); wallet «QA Касса» resolvable on the row/payments tab. Balance card back to «−50 000» red. «Обороты» Платежи = 100 000. Pills «Журнал 3 · Транзакции 1 · Платежи 1». Транзакции tab: supply now «Оплачено» (R8, R12).

### T-PRT-08 · PartnerType Both chip [happy]
Pre: partner А.
Steps: 1) Edit А → type «Оба» → save. 2) Check list row and detail header.
Expect: chip renders «Клиент + Поставщик» in both places — raw «Both» never shown (#15).

### T-PRT-09 · Archive never blocked; history resolves; picker excludes [happy]
Pre: partner А (referenced by a supply + payment).
Steps: 1) ⋮ → archive → confirm «Архивировать QA-<MMDD> Партнёр А?». 2) List: check «Активные» then «Архив». 3) /supplies list: find the T-PRT-05 row. 4) /supplies/new: search А in the partner picker. 5) Open А's detail. 6) Restore.
Expect: archive succeeds despite references (R30); toast «QA-<MMDD> Партнёр А — в архиве»; row gone from «Активные», present under «Архив» with badge «в архиве» (#13); the historical supply row still shows А's name (R30); POS picker does NOT offer А; detail shows banner «Партнёр в архиве.» with balance intact (R31 context). Restore returns А to the active list with toast «…восстановлен из архива».

## Edge & negative

### T-PRT-30 · Empty submit reports inline, button stays enabled [negative]
Pre: create form open.
Steps: 1) Submit with all fields empty.
Expect: submit is clickable (hard rule 5); inline errors — name «Имя должно содержать минимум 2 символа», phones «Укажите хотя бы один номер телефона»; no top-of-form banner (DR-24, #18); modal stays open, no request fires.

### T-PRT-31 · Per-row phone validation [negative]
Pre: create form; name filled valid.
Steps: 1) Phone row 1: valid `901234567`. 2) «Добавить телефон», row 2: `12`. 3) Submit.
Expect: only row 2 errors — «Телефон должен содержать только цифры (опционально «+») и иметь 7-15 символов» under that row; row 1 unaffected; submit blocked until fixed.

### T-PRT-32 · Telegram round-trip — verify live [edge]
Pre: partner А.
Steps: 1) Edit А → Telegram «@qa_prt_check» → save. 2) Hard-reload the detail page. 3) Check «Контакты» in the rail.
Expect: **contested** — F12 says the contract has no telegram field, so the value is silently discarded (blank after reload = KNOWN F12); the tracker claims it is now served. Report which behavior is live; if it persists, report «F12 may be fixed — verify and update frontend-gaps.md».
Known: F12.

### T-PRT-33 · Opening balance immutable — edit form offers no input [edge]
Pre: partner А.
Steps: 1) Open edit for А. 2) Inspect the «Начальный баланс» section.
Expect: read-only locked card — «Начальный баланс», «Записан <date> — изменить нельзя», signed amount, helper explaining the current balance moves only via transactions/payments; **no** type/amount inputs anywhere (contract: `UpdatePartnerRequest` has no opening fields; R1-adjacent audit event).

### T-PRT-34 · Zero balance rendering [edge]
Pre: /partners.
Steps: 1) Create «QA-<MMDD> Партнёр Б», type «Поставщик», valid phone, opening «Партнёр должен нам» amount 0. 2) Check list row and detail.
Expect: list balance cell «—» (muted, not «0»); detail hero «0» neutral + «Баланс закрыт — обязательств нет»; ledger has the opening row with Сумма «0».

### T-PRT-35 · Delete gated by served isDeletable — referenced partner [negative]
Pre: partner А (referenced).
Steps: 1) List row ⋮ → «Удалить».
Expect: delete control is visible (never hidden, #19); dialog «Партнёра нельзя удалить» explaining references, offering «Архивировать» instead (DR-20, R32); no DELETE request fires on open. Cancel — do not archive.

### T-PRT-36 · Fresh unreferenced partner hard-deletes [edge]
Pre: /partners.
Steps: 1) Create «QA-<MMDD> Партнёр В» (type «Клиент», valid phone, opening 0). 2) Row ⋮ → «Удалить» → confirm dialog «Удалить QA-<MMDD> Партнёр В?» → «Удалить».
Expect: dialog warns irreversibility; DELETE returns 204; toast «Партнёр «QA-<MMDD> Партнёр В» удалён»; row gone from both «Активные» and «Архив» (R32, DR-20 — served `isDeletable=true` routes to the real delete dialog).

### T-PRT-37 · Ledger filters and search [edge]
Pre: partner А (3 ledger rows).
Steps: 1) Журнал: event filter «Оплаты». 2) Reset; filter «Поставки». 3) Reset; search `100`. 4) Filter «Начальный баланс». 5) Filter «Возвраты» — А has no refunds.
Expect: each filter narrows to only matching rows (pager count follows the filtered set); search matches event label/number/amount text — search `100` matches TWO rows, the supply AND the payment (both amounts are 100 000; digits match unformatted, so a spaced fragment like «100 000» matches nothing); «Начальный баланс» shows only the opening row; «Возвраты» yields the empty state «Нет записей» + «По выбранному фильтру событий не найдено» (#14 — filters live inside the table widget).

## Reconciliation

### T-PRT-60 · Headline: balance card ↔ ledger ↔ /debts ↔ open transactions [reconcile] ✍
Pre: partner Б (opening 0, from T-PRT-34); fixtures «QA Склад А», «QA Товар Штучный».
Steps: 1) /supplies/new: partner Б, «QA Товар Штучный» ×18 (total 180 000), no payment, submit. 2) Б's detail: read the balance card. 3) Журнал: read «Баланс после» of the newest row. 4) Транзакции tab, filter «Открытые — долг»: sum the amounts. 5) /debts → По партнёрам: find Б's row; По транзакциям: find the supply.
Expect: one number four ways — balance card «+180 000» green = ledger last running balance «+180 000» = /debts remaining for Б 180 000 (payable direction) = sum of open transactions 180 000 (single row, «Не оплачено»). Any divergence is a Blocker-grade defect in the dispute-grade ledger (R12; ledger contract: running balance reconciles exactly to the net balance).

### T-PRT-61 · Balance includes opening; /debts excludes settled [reconcile]
Pre: partner А settled (T-PRT-07: opening −50 000 display, supply paid).
Steps: 1) А detail: balance card. 2) /debts (both tabs): search А.
Expect: balance card «−50 000» red — the opening event alone (50 000 receivable + 0 open transactions); А appears **nowhere** on /debts (its only transaction is fully paid; /debts is a transactions-only read model, not the partner balance). This asymmetry is by design — an opening-balance debt is visible on the partner, not on /debts (contract: debts notes; R12).

### T-PRT-62 · Summary strip self-consistency [reconcile]
Pre: /partners, «Активные» view, partners А and Б present (post T-PRT-60).
Steps: 1) Set pager to 50; type filter «Все». 2) Sum the red («−») balance cells and the green («+») balance cells across all active rows. 3) Compare with the strip.
Expect: «Всего к получению» = sum of red balances (unsigned); «Всего к оплате» = sum of green; «Чистая позиция» = |receivable − payable| with the direction word («в нашу пользу» when receivable ≥ payable); the receivable/payable card subtitles count contributing partners («N партнёров должны нам» / «мы должны N партнёрам»); the net card subtitle counts ALL active partners («N активных»), zero-balance included; archived partners excluded from all three.
Known: REC-3 — the strip once rendered all-zero counts (unreconciled). If reproduced, report KNOWN with exact repro detail (filters, timing, data state), not a new defect.

### T-PRT-63 · Count-pill arithmetic [reconcile]
Pre: partner А (post T-PRT-07).
Steps: 1) А detail: read the three tab pills.
Expect: Журнал = Транзакции + Платежи + 1 (the opening row): «3 = 1 + 1 + 1». The tabs are pure partitions of one served ledger — a mismatch means rows are dropped or double-counted between tabs.
