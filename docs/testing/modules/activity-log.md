# Activity Log — test cases (T-ACT)

The audit trail read back (mvp-plan §17, R26–R28): the «Журнал действий» page and the «История» of detail pages. Read with [../README.md](../README.md) · [../shared-checklist.md](../shared-checklist.md) · [../fixtures.md](../fixtures.md) · contract `backend-contracts/activity.md`.

## Surfaces

- `/activity-log` (sidebar «Журнал действий») — `PageHeader` «Журнал действий» + subtitle; filter row «Кто: Все» · «Что: Все» · «Действие: Все» · (right) «Дата: Этот месяц»; one card with the timeline: day bands («Сегодня, DD.MM.YYYY», «Вчера, …», then «DD.MM.YYYY»), one row per operation — time «HH:mm» · the record's tile (a document in its type hue — Продажа teal, Поставка saffron; a payment green / red by direction; anything else a neutral tile with its module icon) · the actor's initials avatar + name (or a gear and grey «Система») · one sentence with the record as a link · money figure «… UZS» · chevron; footer «Показано N из M» + «Показать ещё».
- An opened row — «Что изменилось · N записей», then one card per record the operation changed: kind («Продажа», «Позиция документа», «Остаток на складе», «Откуда деньги», «Куда пошли деньги», …) · the record · action pill («Создание» / «Изменение» / «В архив» / «Из архива» / «Удаление») · a table «Поле · Было · Стало» (a created record «Поле · Значение», a deleted one «Поле · Значение» with the old values). Ten records at first, «Показать ещё (N)» for more.
- «История» — a tab on Product, Partner, Wallet, Warehouse (not while an empty warehouse shows its «Начальный остаток» panel) and Employee («Выплаты» | «История»); a card «История изменений» at the bottom of the Order detail and of the Sale / Supply / refund detail. Same timeline, narrowed to the record and its lines, 20 per page.

## Traps

| Observation | Why it's correct |
| --- | --- |
| The page opens on «Дата: Этот месяц» with the filter tinted, not «Весь период» | Owner decision (activity lane): the log opens on the current month |
| Sentences are noun-first («Продажа №42 проведена — Азиз»), not «Алишер провёл …» | Decision: the server gives no gender, and «Система» is feminine — the record's noun carries the agreement |
| Operations before 2026-10-04 show no master-data edits, no document lines, and seed operations by «Система» with hundreds of records | Contract «History recorded before 2026-10-04»: only money and stock were logged then; legacy rows are grouped by user and second |
| A legacy «Расчёты по поставке №1 обновлены» opens to «Значения полей не записаны» | Older seed rows listed unchanged columns; the server drops equal before/after values |
| «Без номера» in a sentence (`Платёж без номера`) | A legacy payment with no served number — never the id (live-ui-17) |
| A deleted record's name is plain text (no link); a referenced record that no longer exists reads «удалённая запись» | Contract: a deleted record keeps its label; a reference to a gone record is served as a raw id |
| A category or template in a sentence is plain bold, not a link | They have no detail page (conventions → Tables, entity name) |
| A payment's amount is green / red, a sale's is ink; a new partner's opening balance is signed («+150 000» green = we owe them) | Direction amounts only (conventions → Money); partner balances partner-side (DR-27) |
| «Кто» lists deactivated users as «Имя (деактивирован)» | R41 — they stay attributed |
| «Действие: Изменение» does not list sales and payments that only settled a document | Contract: without «Что», a settlement update is not an edit |
| A product's card has no «Розничная цена», and «Минимальный остаток» / «Штук в упаковке» at 0 read «—» (a new product without them shows no such rows) | `retailPrice` is a legacy column no screen shows or edits; 0 means «not set» there, as on the product page |
| On a phone the row stacks: time, then actor and sentence, then the amount | The sentence keeps the card's width instead of wrapping word by word |
| «История» of a product, partner, wallet, warehouse or employee created before 2026-10-04 reads «Изменений пока нет» | Master data has been audited only since 2026-10-04; a record's history lists changes to the record itself, not the documents that use it |

## Happy path

### T-ACT-01 · Page renders this month's operations [happy]
Pre: the QA org has operations this month.
Steps: 1. Sidebar «Журнал действий». 2. Read the first rows. 3. Scroll to the footer.
Expect: 1→ `/activity-log`, no «Страница в разработке». 2→ day bands newest first; each row «HH:mm · <user> · <sentence>»; a sale reads «Продажа №N проведена — <партнёр>» with «№N» linking to `/sales/<id>` and «<сумма> UZS» in ink; a payment «Платёж №N проведён — <партнёр>» green (Приход) or red (Расход). 3→ «Показано 30 из M» (M = served total); «Показать ещё» only while more remain.

### T-ACT-02 · Show more appends the next page [happy]
Pre: «Дата: Весь период» with more than 30 operations.
Steps: 1. «Показать ещё». 2. Repeat until it disappears.
Expect: 1→ the next 30 rows append under the same day bands (a day split across pages continues, no duplicate rows); «Показано 60 из M». 2→ the button disappears when N = M.

### T-ACT-03 · Open an operation — before and after [happy] ✍
Pre: a run-scoped product «QA-<MMDD> Товар».
Steps: 1. Product ⋮ → edit → change «Цена продажи» 12 000 → 13 000, save. 2. `/activity-log`, find the row. 3. Open it (chevron, or a click on the row outside the link).
Expect: 2→ «Товар «QA-<MMDD> Товар» изменён: цена продажи 12 000 → 13 000», the name links to the product. 3→ «Что изменилось · 1 запись»; card «Товар · «QA-<MMDD> Товар» · Изменение»; table «Поле · Было · Стало» with «Цена продажи · 12 000 · 13 000». Clicking the link opens the product, not the row (R26, mvp-plan §17 done criterion).

### T-ACT-04 · A money event with its parts [happy] ✍
Pre: a run-scoped sale paid in full (sales-supplies T-POS-02 or new).
Steps: open its row.
Expect: cards in order — «Продажа · №N · Создание» (Номер «№N», Партнёр, Статус оплаты «Оплачено», Сумма, Оплачено, Тип документа «Продажа», Склад, Дата «DD.MM.YYYY HH:mm»), then «Позиция документа» per line (Товар, Количество, Цена), «Платёж», «Откуда деньги» (Источник «Касса»), «Куда пошли деньги» (Назначение «Оплата документа», Документ «№N»), «Остаток на складе» «Остаток · 40 · 28». No raw enum names («Closed», «Wallet») and no ids anywhere.

### T-ACT-05 · Filters narrow on the server [happy]
Steps: 1. «Что: Товар». 2. «Действие: В архив». 3. «Кто: <second user>». 4. «Дата: Период…» a range with no activity.
Expect: each change reloads (spinner, then rows); every row matches all filters; 4→ «Ничего не найдено» · «За выбранный период с этими фильтрами действий нет — измените период или фильтры.», no button.

### T-ACT-06 · «История» on a detail page [happy] ✍
Pre: T-ACT-03 product.
Steps: 1. Product detail → tab «История». 2. With the tab open, ⋮ → edit → change «Минимальный остаток», save.
Expect: 1→ only operations that changed this product record (its creation, the T-ACT-03 price edit) — sales and stock movements of the product stay on its other tabs; 20 per page. 2→ the new edit appears at the top without leaving the tab. Partner / Wallet / Warehouse / Employee tabs behave the same; the Order card also lists its line and status changes, the Sale / Supply card the document's creation and every payment that settled it.

## Edge & negative

### T-ACT-20 · System and deactivated actors [edge]
Expect: an operation with no user reads «Система» (grey); a deactivated user's operations still show their name, and «Кто» offers «<имя> (деактивирован)» (R41).

### T-ACT-21 · A huge legacy operation opens in steps [edge]
Pre: «Весь период»; a «Система» payment row from the seed (hundreds of records).
Steps: open it; «Показать ещё (N)» several times past 50 records.
Expect: 10 cards at first, +10 per click; past the 50 the list item carries, a spinner while the whole operation loads, then more cards; the page stays responsive.

### T-ACT-22 · Failed loads are never an empty log [negative]
Steps: stop the API (or go offline) and change a filter; then «Показать ещё» with the API down.
Expect: the card shows «Не удалось загрузить журнал действий» with the reason and «Повторить» — never «Действий пока нет»; a failed «Показать ещё» keeps the rows already shown.

### T-ACT-23 · Record links [edge]
Expect: a sale / supply / refund № opens its document, a payment or payroll № `/payments/:id`, an order `/orders/:id`, a correction / transfer № opens its modal URL (`/adjustments/:id`, `/transfers/:id`), a user or the organization opens «Настройки»; a deleted record and a category / template / opening stock / wallet transfer are plain text.

## Reconciliation

### T-ACT-60 · Log ↔ documents [reconcile]
Pre: a run-scoped sale and payment from today.
Expect: the sale row's amount = the sale's «Сумма», its «Партнёр» = the detail's client, «Номер» = its №; the payment row's amount and colour match its direction on `/payments` (R26).
