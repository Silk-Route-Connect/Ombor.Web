# Smoke suite (T1)

Read-mostly pass over the whole app: every route renders, navigation is complete, and each screen passes a [shared-checklist](shared-checklist.md) spot-check. No permanent events are created. Target: 30–45 min. Run [environment.md](environment.md) hygiene assertions throughout.

Result vocabulary and reporting: see [README.md](README.md).

## Shell & navigation

### T-SMK-01 · Sidebar structure [happy]

Expect exactly, top to bottom: Главное · Финансы (Платежи, Долги, Касса) · Транзакции (Партнёры, Заказы, Продажи, Поставки, Шаблоны) · Кадры (Сотрудники) · Каталог (Товары, Категории) · Склад (Склады, Корректировки, Перемещения); footer: Настройки only — no «Выход» (sign-out is in the avatar menu). No section-label headings, no «Отчёты» (#10). Collapse/expand toggle works.

### T-SMK-02 · Topbar [happy]

- «Создать» menu → Продажа `/sales/new` · Поставка `/supplies/new` · Заказ `/orders/new` · Оплата `/payments/new` (placeholder page — known stub).
- Global search field is a visual stub (known); notifications bell opens «Нет уведомлений» (known stub); language menu present; avatar menu shows full name + Выход — the only sign-out, it lands on `/login`.

### T-SMK-03 · Auth guards [happy]

Logged in, navigate to `/login` → redirected to `/`. Unknown URL (e.g. `/nope`) → NotFoundPage inside the app layout, the same not-found card as a missing record (`/sales/999999`): icon tile, «Страница не найдена», one line and the ghost button «На главную» (a record shows «К списку»); tab «Страница не найдена · Ombor».

### T-SMK-04 · Activity Log and stubs render, don't crash [happy]

`/activity-log` renders «Журнал действий» — filter row (Кто · Что · Действие · «Дата: Этот месяц») and the day-grouped timeline, or «Ничего не найдено» for an empty month ([modules/activity-log.md](modules/activity-log.md)); `/payments/new` renders with app chrome; console stays clean.

## Route render pass

For each route: page renders with correct h1/title, no console errors, no failed requests, and a §1 forbidden-affordance scan from the shared checklist. Additional per-route assertions:

### T-SMK-10 · `/` Dashboard [happy]

Period control (Сегодня/Неделя/Месяц, default Месяц); 4 KPI cards render numbers (not NaN/«не число»); charts, aging panel, top-debtors, recent-transactions table render. The «Заканчивается» panel lists warehouse rows: product · «Нет в наличии» / «Мало» · «Склад N · осталось Q · порог T», none left first, «N позиций на складах» beside the title; «Все» opens the stock report (T-SMK-37); with no threshold set anywhere it says where thresholds are set instead. Known crash-risk F5 — an unknown transaction status crashing the table is KNOWN.

### T-SMK-11 · `/products` and `/products/:id` [happy]

List renders with archive toggle; open one product detail (tabs Обзор / Продажи и поставки / Движения / История + right rail; no side pane remains). **Do not test edit** — F1 edit crash is a known Blocker. «Новый товар» (close without saving): «Единица измерения» spans the row under «Категория» — no «Минимальный остаток» (thresholds are set per warehouse, DR-41); «Дополнительно» holds only the description. No «Мало» / «Нет в наличии» pill on the list or the detail; the list's «Остаток» offers «Все» / «Нет в наличии» only.

### T-SMK-12 · `/categories` [happy]

List renders; legacy module — layout deviations from shared checklist §2 are known pending rebuild; note only crashes/errors.

### T-SMK-13 · `/warehouses` and `/warehouses/:id` [happy]

Summary strip «Товаров на складах» · «Заканчивается» (footnote «по порогам на всех складах») · «Стоимость остатка»; columns Название · Адрес · Товаров · Заканчивается · Стоимость остатка · ⋮ — no «Единиц» anywhere. Detail: KPIs «Товаров» · «Заканчивается» · «Стоимость остатка», Остатки/Движения tabs on the shared table chrome (same look as the list tables, #20d), stacked layout (no rail); «Остатки» columns Товар · Артикул · Категория · Остаток · Порог («—» when not tracked, a pencil on every row) · Сред. себест. · Стоимость, filters «Категория» and «Остаток: Все / Заканчивается / Нет в наличии»; «Итого по складу» totals the value only (no unit sum). «Остатки» may count more rows than «Товаров» — an emptied row stays listed («Нет в наличии») but is not on hand (F22). «Движения» names an adjustment by its reason («Кража/утеря»), never a raw enum. Click-throughs: T-SMK-37.

### T-SMK-14 · `/adjustments` [happy]

List with expand-row detail; no edit/delete anywhere (R1); direction chips «+ Приход товара» blue / «− Списание» amber — never arrows, never green / red. «Новая корректировка» (close without saving): the two direction cards carry the same «+» / «−» glyphs, and the preview's change figure is blue «+N» / amber «−N».

### T-SMK-15 · `/transfers` [happy]

List renders; row opens detail modal (no route — correct); no edit/delete (R1). No «Единиц» column; the detail's lines footer reads «Позиций N» only (no quantity sum).

### T-SMK-16 · `/partners` and `/partners/:id` [happy]

Summary strip; detail: balance card + Журнал/Транзакции/Платежи tabs with count pills, stacked layout. Deep link `/partners/:id?tab=transactions&status=open` lands on the filtered tab.

### T-SMK-17 · `/orders` and `/orders/:id` [happy]

Status tabs with live counts; source chips read «Ombor» / «Telegram» (never «OmborWeb»); detail: stepper, positions card (no totals footer), right rail whose total is the served order total. Order detail of a Delivered order links to its Sale.

### T-SMK-18 · `/sales`, `/sales/:id`, `/supplies`, `/supplies/:id` [happy]

Shared module — both directions render; refund rows show negative amounts and «Возврат к №N»; detail has right rail; no edit/delete (R1). Attachment display known-broken (F7).

### T-SMK-19 · `/sales/new` and `/supplies/new` [happy]

POS page renders: product search, empty cart, partner picker **empty by default** (R39), wallet/warehouse pickers, keyboard hints. Leave without submitting.

### T-SMK-20 · `/templates` [happy]

List with expand rows; «Использован» column shows «—» (known — `lastUsedAt` unserved).

### T-SMK-21 · `/payments` and `/payments/:id` [happy]

Direction cards «Все платежи · Приход · Расход» (counts, the pressed one with ✓) instead of a segmented control; type column «Тип операции» with real localized types (#17); detail shows Касса + Распределение blocks; no edit/delete (R1). Unknown allocation types crashing is KNOWN (F9).

### T-SMK-22 · `/debts` [happy]

4 summary cards — «Нам должны» / «Мы должны» / «Просрочено» are the filters (the pressed one with ✓; no segmented switch), «Итог расчётов» plain — «По партнёрам» / «Неоплаченные документы» tabs (shared detail tabs — Tab + Enter / Space switch them; the «нам должны / мы должны» legend sits right of the tabs), aging buckets; row drill-down navigates to partner detail debt view.

### T-SMK-23 · `/wallets` and `/wallets/:id` [happy]

Summary strip; detail: 3 stat cards («Баланс», «Авансы», «Наши средства»), Операции/Переводы tabs; «Наши средства» ≤ «Баланс» is correct (R12).

### T-SMK-24 · `/employees` and `/employees/:id` [happy]

List; detail with payroll history (empty state acceptable); terminate/restore affordances only via kebab.

### T-SMK-25 · `/settings` [happy]

Sections: Организация, Язык, Валюта (locked UZS, read-only — correct), Пользователи (invite/deactivate/reactivate; no delete — R41), Безопасность. Организация saves from its own card's footer band — «Есть несохранённые изменения» / «Все изменения сохранены», «Отмена», «Сохранить»; Безопасность has «Сменить пароль» in its band; clicking a section in the side menu lights that section. Cosmetic «Администратор» chips are known-correct (no roles, DR-07).

## Cross-screen spot checks

### T-SMK-30 · Format sampling [happy]

On any three money-bearing screens: amounts «1 250 000», dates `DD.MM.YYYY`, timestamps «07.07.2026 16:33», numbers «№N», no «Сумма, UZS» headers (shared checklist §5).

### T-SMK-32 · Browser tab titles [happy]

Steps: visit a list, a detail, a print view and an unknown record; go back each time.
Expect: «Продажи · Ombor», «Продажа №N · Ombor» (a legacy row «Продажа без номера · Ombor», never the id), «Документ не найден · Ombor» style for a missing record; a print view's tab is the document's PDF name («Накладная на продажу №N»); reports read «Продажи — отчёт · Ombor». Going back restores the previous page's title — no title sticks from an earlier page.

### T-SMK-33 · Page size is remembered per table [happy]

Steps: 1. `/sales` → pager 50. 2. Open a sale, go back; reload. 3. Open `/supplies`.
Expect: options 25 / 50 / 100. 1 → set 50 first; 2 → `/sales` still shows 50 rows per page. 3 → `/supplies` keeps its own size (25 by default, «1–25 из N»). A private window (no storage), or a stored 10 from before 2026-10-07, opens on 25. A list of 25 rows or fewer shows no pager.

### T-SMK-34 · Toast look and position [happy]

Steps: 1. `/sales`: search «zzz», click «Экспорт». 2. Collapse the sidebar to its rail; click «Экспорт» again. 3. Whenever a toast happens to appear over an open dialog during the run, note where it sits.
Expect: 1 → an info toast «Нечего экспортировать — в таблице нет строк»: a white card with a blue icon tile and ✕, bottom-left of the content, starting past the sidebar (never over «Настройки»); it fades in place, never slides across the sidebar. 2 → it starts past the 72px rail. 3 → while a dialog is open a toast sits at the screen's left edge, clear of the dialog's own buttons.

### T-SMK-35 · Register page fits a laptop screen (logged out) [happy]

Pre: logged out (end of the run, or a private window).
Steps: open `/register` and `/login` at 1366×650 and 1280×720; scroll to the bottom.
Expect: the card grows with its form and the page scrolls — the register submit button and the «Войти» link are fully reachable; nothing is clipped inside the card (no inner scrollbar).

### T-SMK-36 · Sidebar width by window [happy]

Steps: resize one window 1920 → 1440 → 1439 → 1366 → 1920; open `/sales/new` at 1920.
Expect: 1920 and 1440 → the expanded 248px panel; 1439 and 1366 → the 72px rail (the toggle still expands it; navigating returns to the rail); back at 1920 → expanded; `/sales/new` opens on the rail at any width. The rail's footer is «Настройки» with its tooltip; toasts start past whichever width shows.

### T-SMK-37 · Warehouse «Заканчивается» click-throughs [reconcile]

Steps: 1. `/warehouses`: read the strip's «Заканчивается» and click it. 2. Back; open a warehouse whose «Заканчивается» column is > 0; read its KPI and click it. 3. Open another warehouse.
Expect: 1 → the stock report «Остатки и стоимость склада» with «Склад: Все» and «Остаток: Заканчивается»; its «N позиций» = the card = the report's «Заканчивается» card = the dashboard panel's «N позиций на складах» = the bell's «Заканчиваются N товаров» = the sum of the column (each row is one product in one warehouse — the same product low in two warehouses counts twice). 2 → the KPI equals the list column for that warehouse; the click opens «Остатки» with search and category cleared and «Остаток: Заканчивается», row count = the KPI (a tracked row at zero included, an untracked one never). 3 → the tab's filters reset. An active warehouse with no stock shows 0, a «Заканчивается» KPI that opens nothing, and no tabs (the opening-stock prompt instead); an archived warehouse reads 0 until restored.

### T-SMK-38 · Date and time fields [happy]

Pre: an English (en-US) browser locale if available.
Steps: 1. `/orders/new`: read «Дата доставки» / «Время доставки»; type «07102026», then «1430»; open the calendar. 2. Leave without saving; open an order's edit modal, hover the time field. 3. Open `/employees` → «Новый сотрудник», clear the hire date, submit, then type «01102026».
Expect: 1 → empty fields read «ДД.ММ.ГГГГ» / «ЧЧ:ММ» (never «mm/dd/yyyy», never AM/PM); the digits fill 07.10.2026 and 14:30; the calendar is Russian, Monday first, the month capitalised; picking a day fills the field and the order summary. 2 → the optional time, when it holds a time, shows a «×» on hover; Escape closes the calendar, not the modal. 3 → «Дата найма обязательна» and the cursor in the day section, so the typed digits fill 01.10.2026. Labels above the fields name them (clicking a label focuses its field). No writes.

### T-SMK-39 · Set and clear a warehouse threshold [happy]

Steps: 1. A warehouse «Остатки»: find an untracked row (Порог «—») in «шт» with quantity Q > 0; click its pencil. 2. Type «2,5», «Сохранить». 3. Type Q, «Сохранить». 4. Pencil again → «Убрать порог». 5. Repeat 1–3 on a «кг» row with «2,5». 6. Tab to a row's pencil, Enter; Enter again without changing anything; reopen it and press Escape.
Expect: 1 → dialog «Порог «Заканчивается»» · «<товар> · <склад>», «Сейчас на складе: Q шт», field «Порог необязательно» with «шт» after it, no «Убрать порог» yet. 2 → «Порог — только целое число» under the field, nothing saved. 3 → toast «Порог сохранён: «<товар>» — Q шт»; the row shows amber «Мало» and «Q шт» in «Порог»; the KPI «Заканчивается» +1. 4 → toast «Порог убран…»; «—», no pill; the KPI back. 5 → «2,5 кг» saves («2,5» in «Порог»). 6 → the unchanged Enter closes the dialog with no request and no toast; after every close (save, Enter, Escape) the focus is back on that row's pencil. The Activity Log reads «Порог «Заканчивается» для «<товар> · <склад>» изменён: — → Q» (and «Q → —»).

### T-SMK-31 · Hygiene sweep [happy]

After the full pass: console has zero errors; network log has no unexpected 4xx/5xx and zero sentry/posthog requests ([environment.md](environment.md)).
