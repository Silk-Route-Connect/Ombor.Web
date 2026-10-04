# Partners — test cases (T-PRT)

Partner master data: list + summary strip, detail (balance, dispute-grade ledger, tabs), create/edit, archive/restore, reference-gated delete. Read with [../README.md](../README.md) · [../shared-checklist.md](../shared-checklist.md) · [../fixtures.md](../fixtures.md) · [../../frontend-gaps.md](../../frontend-gaps.md).

## Surfaces

- `/partners` — list: `PageHeader` («Партнёры», «Новый партнёр», «Экспорт»), `PartnerSummaryStrip` (3 cards «Нам должны» / «Мы должны» / «Итог расчётов» — the served `GET /api/debts/summary` totals, the same figures as /debts and the dashboard; «—» until they load), search + type segmented («Все | Клиенты | Поставщики») + archive segmented «Активные | Архив», `PartnersTable`.
- `/partners/:id` — detail: `DetailPageHeader` (name; type chip + company as titleExtra), sticky 372px right rail (balance hero + «Обороты» + «Контакты»), `DetailTabs` Журнал / Транзакции / Платежи with count pills. Deep-link params: `?tab=transactions|payments&status=open|paid|partial|unpaid`. ⋮ starts with «Напомнить о долге» (only while the partner owes us) and «Акт сверки», then edit / archive / delete.
- `/partners/:id/statement?from&to` — the printable «Акт сверки» (`PartnerStatementPage` on the shared print layout): toolbar «С» / «По» + «Печать»; default period 01.01 of this year → today.
- `DebtReminderDialog` — «Напомнить о долге»: ready editable text + «Копировать» / «SMS» / «Отправить в Telegram» (the owner's own apps; Ombor sends nothing).
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
| Form type control, chips, CSV all show «Клиент + Поставщик» — «Оба» is never shown. | #15 + plain-language glossary (ui-patterns Display conventions). |
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
Expect: header = name + type chip «Поставщик» + no meta beyond titleExtra (#20e, Traps); rail balance hero «−50 000» red + hint «Партнёр должен нам»; opening strip per T-PRT-01; «Обороты» rows Продажи/Поставки/Платежи all «—» (zero); «Контакты» lists the phone. Tabs «Журнал 1 · Транзакции 0 · Платежи 0» (#20b). Транзакции tab shows empty state «Партнёр только создан — пока есть только начальный баланс…».

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
Expect: new supply row on top (date-desc default): event «Поставка», «Номер» = «№…» (the supply's document number via `formatEntityId`, F20 resolved 2026-07-19 — a «—» here on a sale/supply/refund row is now a regression; only the opening event stays «—»), Сумма «+100 000» green (we owe more, partner-POV), «Баланс после» «+50 000» = −(50 000 − 100 000) green; balance card now «+50 000» green + hint «Кредиторская задолженность — мы должны партнёру»; «Обороты» Поставки = 100 000; pills «Журнал 2 · Транзакции 1 · Платежи 0» (R12).

### T-PRT-06 · Deep link lands on filtered «Продажи и поставки» tab [happy]
Pre: partner А with the open supply debt (T-PRT-05).
Steps: 1) Navigate directly to `/partners/<id А>?tab=transactions&status=open`. 2) Also: /debts → По партнёрам → click А and note whether the link carries the same params.
Expect: «Продажи и поставки» tab active, status filter preset «Открытые — долг», showing exactly the unpaid supply (status chip «Не оплачено», Сумма 100 000). `open` = unpaid ∪ partial. Refresh keeps the filtered landing.

### T-PRT-07 · Payment settles debt; ledger and balance reconcile [happy] ✍
Pre: partner А (open supply 100 000).
Steps: 1) Payments page → create payment: type «Оплата», partner А, wallet «QA Касса», amount 100 000, submit (exact amount — no settlement modal, #5). 2) А → Журнал.
Expect: payment row: event «Оплата», Сумма «−100 000» red (their claim shrank, partner-POV), «Баланс после» «−50 000» red; «Номер» = «№N» (the payment's document number via `formatEntityId`, DR-21/F19); wallet «QA Касса» resolvable on the row/payments tab. Balance card back to «−50 000» red. «Обороты» Платежи = 100 000. Pills «Журнал 3 · Транзакции 1 · Платежи 1». Транзакции tab: supply now «Оплачено» (R8, R12).

### T-PRT-08 · PartnerType Both chip [happy]
Pre: partner А.
Steps: 1) Edit А → type «Клиент + Поставщик» → save. 2) Check list row and detail header.
Expect: chip renders «Клиент + Поставщик» in both places — raw «Both» never shown (#15).

### T-PRT-09 · Archive never blocked; history resolves; picker excludes [happy]
Pre: partner А (referenced by a supply + payment).
Steps: 1) ⋮ → archive → confirm «Архивировать QA-<MMDD> Партнёр А?». 2) List: check «Активные» then «Архив». 3) /supplies list: find the T-PRT-05 row. 4) /supplies/new: search А in the partner picker. 5) Open А's detail. 6) Restore.
Expect: archive succeeds despite references (R30); toast «QA-<MMDD> Партнёр А — в архиве»; row gone from «Активные», present under «Архив» with badge «Архив» and the name in grey, no strike-through (#13); the historical supply row still shows А's name (R30); POS picker does NOT offer А; detail shows banner «Партнёр в архиве.» with balance intact (R31 context). Restore returns А to the active list with toast «…восстановлен из архива».

### T-PRT-10 · Акт сверки matches the ledger for the period [happy]
Pre: partner А with the T-PRT-05/07 history (opening −50 000, supply 100 000, payment 100 000).
Steps: 1) А detail ⋮ → «Акт сверки». 2) Read the sheet. 3) Set «По» to a day next week, then «С» to tomorrow. 4) «Печать» → in the browser dialog choose «Сохранить как PDF», check the preview; cancel.
Expect: 1→ `/partners/<id>/statement` (no query → period 01.01.<this year> – today); toolbar: back, title «Акт сверки — QA-<MMDD> Партнёр А», «С»/«По» fields, «Печать», hint «Чтобы получить PDF…». 2→ business header (name / address / phone / logo from Настройки → Организация), title «Акт сверки взаиморасчётов», «за период с … по …», «между <org> и <partner>»; table rows = the Журнал rows of the period oldest-first, columns Дата · Документ · Операция · Дебет · Кредит · Сальдо, first «Сальдо на начало периода, 01.01.…» = 0: then opening 50 000 in Дебет («Начальный баланс»), supply 100 000 in Кредит, payment 100 000 in Дебет; Сальдо after each row = the Журнал «Баланс после» with Д (partner owes us) / К (we owe them) instead of the on-screen sign; «Обороты за период» Дебет 150 000 / Кредит 100 000; «Сальдо на конец периода» 50 000 in Дебет; sentence «На <today> QA-<MMDD> Партнёр А должен <org> 50 000 UZS.»; two signature blocks «От организации» / «От партнёра» with «М.П.». 3→ URL gets `?from&to`, rows vanish («За период операций не было»), «Сальдо на начало периода» = 50 000 Д (the last balance before the period). 4→ the preview shows only the sheet on A4 — no sidebar, top bar or toolbar; a long statement continues on page 2 with the header row repeated (mvp-plan §16).

### T-PRT-11 · Напомнить о долге: ready text, copy, Telegram, SMS [happy]
Pre: a partner who owes us (balance shown red «−…»), with a phone and a Telegram username; a second one without contacts.
Steps: 1) Detail ⋮ → «Напомнить о долге». 2) Read the dialog. 3) «Копировать». 4) «Отправить в Telegram». 5) «SMS». 6) Clear the text, click «Копировать». 7) Open a partner whose balance is 0 or «+…» — check ⋮.
Expect: 1→ modal «Напомнить о долге» + the partner name. 2→ «Долг: <balance> UZS · с <oldest unpaid date>», «Кому: +998 … · @username», an editable text: greeting with the partner name, «Напоминаем: ваш долг перед <org> — <amount> UZS.», «Долг числится с <date>.», the polite request, «Вопросы — по телефону <org phone>.» (only when Настройки has a phone), «С уважением, <org>»; hint «Ombor ничего не отправляет сам…». 3→ toast «Текст скопирован», the clipboard holds the (edited) text. 4→ a new tab opens `https://t.me/<username>?text=…` (no username → `https://t.me/share/url?url=…`) and the toast says the text is also copied. 5→ the browser hands `sms:+998…?body=…` to the phone/SMS app (desktop may show nothing — that is the OS). 6→ the field turns red «Текст сообщения пустой», nothing is copied. 7→ no «Напомнить о долге» row; «Акт сверки» is there. Network: no POST — Ombor sends nothing itself.

## Edge & negative

### T-PRT-30 · Empty submit reports inline, button stays enabled [negative]
Pre: create form open.
Steps: 1) Submit with all fields empty.
Expect: submit is clickable (hard rule 5); inline errors — name «Имя должно содержать минимум 2 символа», phones «Укажите хотя бы один номер телефона»; no top-of-form banner (DR-24, #18); modal stays open, no request fires.

### T-PRT-31 · Per-row phone validation [negative]
Pre: create form; name filled valid.
Steps: 1) Phone row 1: valid `901234567`. 2) «Добавить номер», row 2: `12`. 3) Submit.
Expect: only row 2 errors — «Телефон должен содержать только цифры (опционально «+») и иметь 7-15 символов» under that row; row 1 unaffected; submit blocked until fixed.

### T-PRT-33 · Phone list is the shared phone field [edge]
Pre: create form; name filled valid.
Steps: 1) Click «Добавить номер» while the first row is empty. 2) Fill it, add rows up to 5, click «Добавить номер» again. 3) Delete a row with the bin icon inside the field.
Expect: the same phone field as the employee form — fixed «+998», body grouped «90 123 45 67». 1→ no row added, hint «Сначала заполните пустой номер». 2→ at 5 rows the button stays enabled and says «Можно указать не больше 5 номеров». 3→ the row goes; the last remaining row has no bin.

### T-PRT-32 · Telegram round-trip — persists and renders (F12) [edge]
Pre: partner А.
Steps: 1) Edit А → Telegram «@qa_prt_check» → save. 2) Hard-reload the detail page. 3) Check «Контакты» in the rail.
Expect: the handle persists — after reload «Контакты» shows «@qa_prt_check» with the Telegram icon (F12 resolved 2026-07-19: the backend now persists+serves partner `telegram`; the FE was already sending it). A blank value after reload would be a regression. The handle-format validation still runs client-side on invalid input (`@x` → «Введите корректный логин…»).

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

### T-PRT-38 · Акт сверки period from the URL: reversed, malformed, unknown partner [edge]
Pre: partner А.
Steps: 1) Open `/partners/<id А>/statement?from=2026-12-31&to=2026-01-01`. 2) Open `…/statement?from=abc`. 3) Open `/partners/999999/statement`.
Expect: 1→ the period reads «с 01.01.2026 по 31.12.2026» (ends swapped, never an empty act). 2→ the default period (01.01.<this year> – today). 3→ «Партнёр не найден» with «К списку», no toast.

## Reconciliation

### T-PRT-60 · Headline: balance card ↔ ledger ↔ /debts ↔ open transactions [reconcile] ✍
Pre: partner Б (opening 0, from T-PRT-34); fixtures «QA Склад А», «QA Товар Штучный».
Steps: 1) /supplies/new: partner Б, «QA Товар Штучный» ×18 (total 180 000), no payment, submit. 2) Б's detail: read the balance card. 3) Журнал: read «Баланс после» of the newest row. 4) Транзакции tab, filter «Открытые — долг»: sum the amounts. 5) /debts → По партнёрам: find Б's row; Неоплаченные документы: find the supply.
Expect: one number four ways — balance card «+180 000» green = ledger last running balance «+180 000» = /debts remaining for Б 180 000 (payable direction) = sum of open transactions 180 000 (single row, «Не оплачено»). Any divergence is a Blocker-grade defect in the dispute-grade ledger (R12; ledger contract: running balance reconciles exactly to the net balance).

### T-PRT-61 · Balance includes opening; /debts lists it by partner, not as a document [reconcile]
Pre: partner А settled (T-PRT-07: opening −50 000 display, supply paid).
Steps: 1) А detail: balance card. 2) /debts (both tabs): search А.
Expect: balance card «−50 000» red — the opening event alone (50 000 receivable + 0 open transactions); /debts «По партнёрам» lists А with «Сумма долга» 50 000 green and «Документов» 0 (debt totals are net partner positions, opening included — business-rules «Debt totals»); А is absent from «Неоплаченные документы» (its only transaction is fully paid).

### T-PRT-62 · Summary strip self-consistency [reconcile]
Pre: /partners, «Активные» view, partners А and Б present (post T-PRT-60).
Steps: 1) Set pager to 50; type filter «Все». 2) Sum the red («−») balance cells and the green («+») balance cells across all active rows. 3) Compare with the strip.
Expect: «Нам должны» = sum of red balances (unsigned) **plus archived partners' red balances** (check «Архив»); «Мы должны» = sum of green, archived included; «Итог расчётов» = |receivable − payable| with the direction word («в нашу пользу» when receivable ≥ payable); the receivable/payable card subtitles count contributing partners in correct Russian forms («1 партнёр должен нам», «3 партнёра должны нам», «5 партнёров должны нам» / «мы должны 1 партнёру», «мы должны 5 партнёрам»); the net card subtitle counts ALL active partners («51 активный», «52 активных»), zero-balance included. The three figures equal /debts «Нам должны» / «Мы должны» / «Итог расчётов» and the dashboard KPIs exactly (one served source, `GET /api/debts/summary`). Create a partner with an opening balance → the strip moves by that amount without a reload.
Known: REC-3 — the strip once rendered all-zero counts (unreconciled). If reproduced, report KNOWN with exact repro detail (filters, timing, data state), not a new defect.

### T-PRT-63 · Count-pill arithmetic [reconcile]
Pre: partner А (post T-PRT-07).
Steps: 1) А detail: read the three tab pills.
Expect: Журнал = «Продажи и поставки» + Платежи + 1 (the opening row): «3 = 1 + 1 + 1». The tabs are pure partitions of one served ledger — a mismatch means rows are dropped or double-counted between tabs.
