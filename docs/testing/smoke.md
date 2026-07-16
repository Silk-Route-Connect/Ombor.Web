# Smoke suite (T1)

Read-mostly pass over the whole app: every route renders, navigation is complete, and each screen passes a [shared-checklist](shared-checklist.md) spot-check. No permanent events are created. Target: 30–45 min. Run [environment.md](environment.md) hygiene assertions throughout.

Result vocabulary and reporting: see [README.md](README.md).

## Shell & navigation

### T-SMK-01 · Sidebar structure [happy]

Expect exactly, top to bottom: Главное · Финансы (Платежи, Долги, Касса) · Транзакции (Партнёры, Заказы, Продажи, Поставки, Шаблоны) · Кадры (Сотрудники) · Каталог (Товары, Категории) · Склад (Склады, Корректировки, Перемещения); footer: Настройки, Выход. No section-label headings, no «Отчёты» (#10). Collapse/expand toggle works.

### T-SMK-02 · Topbar [happy]

- «Создать» menu → Продажа `/sales/new` · Поставка `/supplies/new` · Заказ `/orders/new` · Оплата `/payments/new` (placeholder page — known stub).
- Global search field is a visual stub (known); notifications bell opens «Нет уведомлений» (known stub); language menu present; avatar menu shows full name + Выход.

### T-SMK-03 · Auth guards [happy]

Logged in, navigate to `/login` → redirected to `/`. Unknown URL (e.g. `/nope`) → NotFoundPage inside the app layout.

### T-SMK-04 · Placeholders render, don't crash [happy]

`/activity-log` (known U1) and `/payments/new` render PlaceholderPage with app chrome; console stays clean.

## Route render pass

For each route: page renders with correct h1/title, no console errors, no failed requests, and a §1 forbidden-affordance scan from the shared checklist. Additional per-route assertions:

### T-SMK-10 · `/` Dashboard [happy]

Period control (Сегодня/Неделя/Месяц, default Месяц); 4 KPI cards render numbers (not NaN/«не число»); charts, aging panel, top-debtors, recent-transactions table render. Known crash-risk F5 — an unknown transaction status crashing the table is KNOWN.

### T-SMK-11 · `/products` and `/products/:id` [happy]

List renders with archive toggle; open one product detail (tabs Overview/Транзакции/Движения + right rail). **Do not test edit** — F1 edit crash is a known Blocker. Legacy side-pane layout is known pending rebuild.

### T-SMK-12 · `/categories` [happy]

List renders; legacy module — layout deviations from shared checklist §2 are known pending rebuild; note only crashes/errors.

### T-SMK-13 · `/warehouses` and `/warehouses/:id` [happy]

Summary strip; detail with Остатки/Движения tabs, warm table chrome (#20d), stacked layout (no rail).

### T-SMK-14 · `/adjustments` [happy]

List with expand-row detail; no edit/delete anywhere (R1); direction chips.

### T-SMK-15 · `/transfers` [happy]

List renders; row opens detail modal (no route — correct); no edit/delete (R1).

### T-SMK-16 · `/partners` and `/partners/:id` [happy]

Summary strip; detail: balance card + Журнал/Транзакции/Платежи tabs with count pills, stacked layout. Deep link `/partners/:id?tab=transactions&status=open` lands on the filtered tab.

### T-SMK-17 · `/orders` and `/orders/:id` [happy]

Status tabs with live counts; detail: stepper, positions card, right rail. Order detail of a Delivered order links to its Sale.

### T-SMK-18 · `/sales`, `/sales/:id`, `/supplies`, `/supplies/:id` [happy]

Shared module — both directions render; refund rows show negative amounts and «Возврат к №N»; detail has right rail; no edit/delete (R1). Attachment display known-broken (F7).

### T-SMK-19 · `/sales/new` and `/supplies/new` [happy]

POS page renders: product search, empty cart, partner picker **empty by default** (R39), wallet/warehouse pickers, keyboard hints. Leave without submitting.

### T-SMK-20 · `/templates` [happy]

List with expand rows; «Использован» column shows «—» (known — `lastUsedAt` unserved).

### T-SMK-21 · `/payments` and `/payments/:id` [happy]

Summary strip; type column «Тип операции» with real localized types (#17); detail shows Касса + Распределение blocks; no edit/delete (R1). Unknown allocation types crashing is KNOWN (F9).

### T-SMK-22 · `/debts` [happy]

4 summary cards (3 clickable), По партнёрам/По транзакциям tabs, aging buckets; row drill-down navigates to partner detail debt view.

### T-SMK-23 · `/wallets` and `/wallets/:id` [happy]

Summary strip; detail: 3 stat cards («Баланс», «Авансы», «Наши средства»), Операции/Переводы tabs; «Наши средства» ≤ «Баланс» is correct (R12).

### T-SMK-24 · `/employees` and `/employees/:id` [happy]

List; detail with payroll history (empty state acceptable); terminate/restore affordances only via kebab.

### T-SMK-25 · `/settings` [happy]

Sections: Организация, Язык, Валюта (locked UZS, read-only — correct), Пользователи (invite/deactivate/reactivate; no delete — R41). Cosmetic «Администратор» chips are known-correct (no roles, DR-07).

## Cross-screen spot checks

### T-SMK-30 · Format sampling [happy]

On any three money-bearing screens: amounts «1 250 000», dates `DD.MM.YYYY`, timestamps «07.07.2026 16:33», numbers «№N», no «Сумма, UZS» headers (shared checklist §5).

### T-SMK-31 · Hygiene sweep [happy]

After the full pass: console has zero errors; network log has no unexpected 4xx/5xx and zero sentry/posthog requests ([environment.md](environment.md)).
