# Frontend repo state — per-module detail

**Status:** per-module state — the single home of module status (Ombor.Web/CLAUDE.md keeps only a short exceptions list and routes here). Read the module's entry before touching a module. Pairs with frontend-gaps.md (live F-item gap list).
**Last updated:** 2026-10-07 (low stock by warehouse-item threshold, DR-41 — Dashboard, Products, Warehouses, POS, Activity Log, Reports; earlier the same day the owner-decision notes — dates & times, stock signs, warehouse «Заканчивается», shell & lists, the header connection status, Debts filter cards; Акт сверки entry corrected to built). Earlier: 2026-10-06 UI refresh, 2026-07-14 doc-sync pass.
**Discipline:** entries record decisions-and-state, not narrative history — prune superseded detail when updating (git history keeps the record).

**Global facts (stated once, not repeated per entry):** since the 2026-07-05 contract alignment the app runs on the REAL backend (`VITE_ENABLE_MOCKS=false`); `src/mocks/` handlers are dead code pending deletion; the authoritative gap list is `frontend-gaps.md` (F1–F17 live FE↔DTO divergences, U1–U3 unbuilt v1 modules).

---

## Tooling & app shell
- **State:** Vite + TS 5.x (from CRA, June 2026), Husky/lint-staged removed; Sidebar/Topbar/AppLayout rebuilt to the redesign (locked pattern 10); all v1 routes in `routing/paths.ts`, unbuilt pages render `PlaceholderPage`; `NotFoundPage` catch-all.
- **Data:** n/a
- **Open:** —
- **Decisions:** rewrite-as-we-go — legacy modules keep the stores/api/models/schemas structure; components and layouts are replaced per module when rebuilt.
- **UI refresh 2026-10-06:** `layouts/Sidebar.tsx` split into the `layouts/Sidebar/` folder (`index`, `styles`, `navState`, `TopLevelItem`, `SubItem`, `RailButton`, `RailGroup`, `SidebarBrand`, `SidebarFooter`) — teal navigation panel, compact rows with guide lines and a scroll fade; it publishes its width as `layout.sidebarWidthVar` for the toasts. Topbar «Создать» and every menu on the shared `menuSlotProps` surface; content column capped at `layout.contentMax`. Toasts are the app's own `ToastProvider` / `ToastContent` (past the sidebar, at the screen edge while a dialog is open). Browser tab titles via `useDocumentTitle` («… · Ombor»). The route 404 (`NotFoundPage`) renders `LoadStateView`'s not-found state. Dead CRA stylesheets (`App.css`, `index.css`, `styles/global.scss`) deleted — `sx` only.
- **Owner decisions 2026-10-07:** the sidebar footer holds only «Настройки» — «Выход» lives in the topbar avatar menu alone (`SidebarFooter` reuses `TopLevelItem` / `RailButton`; `sidebar.logout` key removed); the sidebar opens on its 72px rail below a 1440px window (was 1280; `NARROW_VIEWPORT_QUERY` in `navState.ts`) and on the POS pages. Dependency `@mui/x-date-pickers` 8.29.4 added, its locale mounted once in `index.tsx` (`DatePickersProvider`).

## Theme & design tokens
- **State:** `theme.ts` at full parity with `tokens.css` + the DSN-1 foundational-components reference; the single styling source — no inline hex anywhere. Exports: `designTokens`, `numericSx`, `radius`, `typeScale`, `chipTokens`.
- **Data:** n/a
- **Open:** —
- **Decisions:** `chipTokens` semantics locked — tx type Sale=teal / Supply=saffron / refunds outlined (brand hues; green/red reserved for money), status Open=info / PartiallyPaid=warning / Overdue=error (single red) / Closed=success, direction Income=success / Expense=error.
- gray-600 is the data-bearing secondary colour (SKU/dates/№); gray-400 is decoration-only.
- `OrderStatusChip` and the module-local `ProductTypeChip`/`MovementKindChip` stay on their own mappings (no clean chipTokens key — left for module passes).
- **UI refresh 2026-10-06:** the theme is the `src/theme/` folder (`palette`, `chipTokens`, `typography`, `tokens`, `identityPalette`, `components`); one cool ink-grey neutral ramp, `figuresSx` (identifiers / dates) beside `numericSx`, `iconSize` roles, theme-sized button icons, identity tints (`identityTone`) for avatars and image placeholders, the modal anatomy in `components.ts`. Lint warns on fractional font sizes, px-string radii and `!important` outside `src/theme`. Mirror: `docs/design-tokens.md`.

## Cross-cutting infra
- **State:** connectivity system (`ConnectivityStore` + the header `ConnectivityIndicator`; `httpErrorInterceptor` reports handled 4xx/5xx to Sentry, 401s skipped); shared `MoneyField` / `UzsUnit`; phone helpers (`uzNationalPart`/`uzPhoneToStored`).
- **Data:** n/a
- **Open:** F14 lists fetch-all, client-side paging; F16 hardcoded «Нет записей», months, plurals
- **Decisions:** save buttons stay enabled and validate on submit (rule 5) — disabled only while saving or backend unreachable.
- Mobile responsiveness deferred — desktop-first (owner).
- Server search/filter params exist on most routes but are deliberately unwired in v1 (see F14).
- **UI refresh 2026-10-06:** one table chrome (`tableChrome` / `DataTableGrid`) for list, expandable and detail tables — no zebra, hover / focus only on clickable rows, page size remembered (`useRowsPerPage`); summary figures on `StatCard` / `StatCardGrid`; every modal on `FormDialog` (+ `FormField` labels above fields, `FormSection`, form `SegmentedControl`); `Callout` the only notice box; `QtyStepper` / `PercentField` / `MoneyField` (right-aligned, «UZS») the line inputs (`MoneyInputBase`, `PosField`, `LineField` deleted). Load errors shown inline raise no toast — list pages load shared lists with `{ quiet: true }` (conventions.md → MobX).
- **Owner decisions 2026-10-07:** every date / time input is the shared `DateField` / `TimeField` (MUI X, «ДД.ММ.ГГГГ» / 24-hour «ЧЧ:ММ» whatever the browser locale; no native `type="date|time"` remains) — incl. the shared date filter's «Период…» (`DateRangePopover`, «С» / «По» labels above); payloads unchanged. Pager 25 / 50 / 100 opening on 25 (`ROWS_PER_PAGE_OPTIONS`; a remembered 10 opens on 25). The offline gate covers every form-modal submit (`FormDialogFooter`) but the debt reminder (`PartnerFormModal`, `TemplateFormModal`, `OrderFormModal`, `SaveTemplateModal`, `DeliveryConfirmModal` joined) and Enter / Ctrl+Enter too (`useFormKeyboardSubmit` `offlineGate`; `SaveTemplateModal` moved onto the hook); `ConfirmDialog` confirmations and the full-page POS / new-order screens are not gated. A pressed filter `StatCard` shows ✓, not ↗.
- **Owner decision 2026-10-07 — connection status in the header:** `layouts/ConnectivityIndicator` replaces the «Нет соединения» chip: a pill with a live dot — «Нет связи с сервером» (backend) / «Нет интернета» (device), the glyph alone below `md` with the words as its accessible name — opening a popover (what is wrong, «Пока связи нет, изменения не сохранятся, а цифры на экране могут быть устаревшими», last answer, next check, «Проверить сейчас» with a spinner); a green «Связь восстановлена» for 3 s on return; a polite live region announces each change outside a modal (a modal hides the app from assistive tech, so `FormDialogFooter` carries its own polite status, and the gated save stays focusable — `aria-disabled` — with the reason as its tooltip and description). The pill sits above the modal layer and `FormDialog` keeps its paper below the header meanwhile (`dialogBelowHeaderSx`), so an open form shows why its save is gated; the placement is latched while the modal is open, so a recovery never moves the form (it glides down once if the outage starts mid-form); the gate's tooltip points to the header. `ConnectivityStore` re-checks `GET /health` itself (`services/api/healthApi`, outside the interceptors) while the backend is down — 5 → 10 → 20 → 30 s, visible tab only, at once on return to the tab; offline it waits for the `online` event; a quiet visible tab gets a 60 s heartbeat (skipped while requests flow) so an outage shows before a save. Only a 2xx `/health` proves recovery, and a probe overtaken by a real request's answer or failure is ignored. The one-time «Сервер недоступен» toast is gone (the pill says it); a list or page whose load failed for lack of a connection re-runs its `onRetry` when the connection returns (`LoadStateView` via `useRetryOnReconnect`, «Загрузим снова, как только связь вернётся») — unless a request failed again within 10 s of the last recovery (a relapse: one route down while `/health` answers); then the backoff carries on, nothing re-runs and the list asks for «Повторить», so a failing route cannot loop. Known limit: a form's pickers that failed to load during an outage (e.g. the product form's categories) stay empty after the connection returns until the form is reopened — they render no `LoadStateView`.
- **Open (owner):** the gate reacts to an unreachable server only — a device that lost its own network keeps submit enabled (the pill shows «Нет интернета») and the save fails with the «нет связи» toast.

## i18n
- **State:** i18next, flat keys, single merged namespace, ru fallback, locale persisted in localStorage `ombor.locale`. ru is the working locale; uz-Latn ~14% translated, uz-Cyrl an empty stub — both gated out of the picker (`i18n/languages.ts` is ru-only) but stay registered so persisted prefs resolve.
- **Data:** n/a
- **Open:** F17 uz backfill — launch Blocker; F16 hardcoded-string sweep
- **Decisions:** Uzbek stays gated until uz-Latn is backfilled (owner); never hardcode to avoid Uzbek keys (hard rule 2).

## Auth
- **State:** rebuilt — two-panel auth surface, route-based under `GuestOnly`: `/login` (phone +998 + password), `/register` (form → 4-digit OTP → welcome; two-phase `verifyOtp`/`enterWithTokens` so the welcome shows before entering), `/reset-password` (phone → code → newpass → success).
- **Data:** real (`/api/auth/*` incl. `forgot-password` / `verify-reset-code` / `reset-password`)
- **Open:** —
- **Decisions:** email/Telegram dropped from the register form (owner; backend still accepts them).
- OTP is 4-digit — the design's 6 was overridden to match `/verification`.
- Manual inline-on-submit validation (`utils/authValidation.ts`); no zod/RHF for auth.
- **UI refresh 2026-10-06:** `AuthLayout` dropped its 94vh cap — the card grows with its form and the page scrolls, so the register submit is reachable at laptop heights (1280×720, 1366×650). Login / register / reset name the browser tab; the register section labels use the `overline` variant.

## Dashboard
- **State:** rebuilt — read-only morning briefing at `/`: period selector (Сегодня/Неделя/Месяц, default Месяц), four clickable KPI cards (→ /sales and /debts presets), two recharts charts (sales-vs-supplies; diverging payments with per-wallet filter), aging panel, top-5 debtors, 8-row recent-transactions preview, data-driven empty/welcome state.
- **Data:** real (`GET /api/dashboard?period=`)
- **Open:** F5 recent-tx status unguarded crash-risk
- **Decisions:** preview-only by design — no pagination; the full lists are the dedicated pages.
- Custom date-range and PNG/PDF export omitted (locked pattern 12; export deferred to Reports v2).
- «Просрочено» KPI = 31+-day aging — deliberately distinct from /debts' due-date overdue (faithful prototype divergence).
- Receivable/payable KPIs stay owner-POV (Нам должны green = asset / Мы должны red; aging total green); Top-debtors rows are partner-POV red (they are debtors) — the DR-27 subject rule. «Просрочено» amber and the cash-flow chart are a separate axis.
- **DR-41 (owner decision 2026-10-07):** the «Заканчивается» panel reads today's stock report over every warehouse (`WarehouseStore.stockReport`, `GET /api/reports/stock` — the page no longer loads the product list): the rows the server flags `isLowStock` (`lowStockRows`, none left first, then the smallest share of the threshold), each tile product · `StockLevelPill` · warehouse (secondary link) · «осталось Q · порог T»; «N позиций на складах» = served `totals.lowStockCount`; «Все» → the stock report filtered «Остаток: Заканчивается» over all warehouses (`useOpenLowStock` → `reportStore.presetStock`). With no threshold set anywhere it says where thresholds are set («Пороги пока не заданы…»); with thresholds but nothing low, «Всё в наличии».
- **UI refresh 2026-10-06:** KPI cards on the shared `StatCard`; the aging panel leads with «Всего нам должны …» and the 31+ share («N% старше 30 дней», saffron) — no duplicate «Всего» footer; low-stock tiles 3 / 2 per row with the full name; Top debtors / Recent transactions titles on `h3` like the chart panels; the sales-vs-supplies chart draws sales as a gradient area, supplies a plain line; value axes size to their longest tick (`chartAxis`); the «Касса» filter on the shared menu surface; the recent-transactions column reads «Статус оплаты»; the getting-started card tightens once a step is done.

## Products
- **State:** list + routed full-page detail `/products/:id` (right rail; Обзор / Продажи и поставки / Движения / История tabs) — no side pane remains (this line read «legacy side-pane» until 2026-10-06).
- **Data:** real (`/api/products`, `/{id}/movements`, `/{Id}/transactions`, archive/restore)
- **Open:** F1 edit crashes/blanks list+detail (Blocker)
- **Decisions:** `retailPrice` dropped from create/edit (and now absent from the contract); measurement enum aligned to backend (no `Liter`).
- Product delete has no served `isDeletable` predicate to gate on (contract gap — frontend-gaps A11).
- **UI refresh 2026-10-06:** rail on `FactRow` (prices in ink, a 0 price «—», markup green / red by sign); «Фасовка» reads through `QuantityCell` («10 кг»); a product without a photo shows its name's letter on its identity tint (`ProductImage` `name`); the form on `FormDialog` (`lg`, fixed 850px body) with `FormSection`s «Фасовка» / «Дополнительно» and a form `SegmentedControl` for the type, submit «Создать товар»; the archived banner is a `Callout`; list filters on `EntityFilterSelect` («Категория: Все»); «Движения» column «Событие», «Продажи и поставки» «Цена за ед.» / «Итого».
- **DR-41 (owner decision 2026-10-07) — no low stock on Products:** the threshold lives on the warehouse row, so the product form has no «Минимальный остаток» (`ProductStockAlertField` deleted; «Единица измерения» spans the row), the model and the multipart payload carry no `lowStockThreshold` / `isLowStock`, the rail lost that row and «Наличие на складах» its pill, the list shows the plain «Остаток» (no pill) and its CSV lost «Запас»; the «Остаток» filter keeps only the fact «Все / Нет в наличии» (served `totalStock` ≤ 0, archived products never — `ProductStockFilter`, `isOutOfStock`). «Дополнительно» holds only the description.

## Categories
- **State:** legacy CRUD, not yet rebuilt; delete reference-gated via served `productCount` (backend 409 still protects data).
- **Data:** real (`/api/categories`)
- **Open:** F3 lean create/edit response stored
- **Decisions:** —

## Warehouses
- **State:** rebuilt — list + full-page detail with Остатки/Движения tabs, create/edit modal, «Начальный остаток» opening-stock modal, archive/restore, reference-gated delete.
- **Data:** real (`/api/warehouses`, `/{id}/stock`, `/{id}/movements`, `/{id}/opening-stock`, archive/restore)
- **Open:** — (F8 resolved 2026-07-16; F22 resolved by the backend 2026-10-07 — `productCount` counts rows on hand, while «Остатки» still lists emptied rows, so the tab count can exceed «Товаров»). The earlier owner questions on «Заканчивается» are answered by DR-41 (per-row thresholds; untracked rows never count; every count is rows, so the strip equals the column's sum). `WarehouseStore.ts` is at ~290 lines — split dialog state from data when next touched.
- **Decisions:** opening stock is an event entered per-warehouse via the «Начальный остаток» modal (`POST /{id}/opening-stock`, note + decimal qty) — not an editable stock field.
- **UI refresh 2026-10-06:** list strip and detail KPIs on `StatCard`; «Остатки» column «Остаток»; «Движения» shows an adjustment's reason as its label («Кража/утеря», not the raw enum) and the counterparty as a secondary link; form and «Начальный остаток» modal on `FormDialog` (line rows split out, unit-cost column 160px for the 600-weight figures), submit «Создать склад»; archived banner a `Callout`.
- **Owner decisions 2026-10-07 — every figure served, no mixed units:** the list loads the stock report (`GET /api/reports/stock`, `WarehouseStore.stockReport` — a `ReportResource`); the strip reads «Товаров на складах» = `totals.productCount` (distinct — replaced a client sum that counted a product once per warehouse) and «Стоимость остатка» = `totals.value`. The «Единиц» column is replaced by «Заканчивается». «Итого по складу» totals the value only and the opening-stock summary reads «Позиций» · «Стоимость партии» (no mixed-unit sums; `totalUnits` is gone from the contract and the model). The tab's filters live on the page (`hooks/warehouse/useWarehouseStockFilters`), reset on another warehouse and survive «Движения».
- **DR-41 (owner decision 2026-10-07) — «Заканчивается» by the warehouse row's threshold:** every figure is served. List: the strip card = `totals.lowStockCount` (footnote «по порогам на всех складах»; click → the stock report filtered «Остаток: Заканчивается» over all warehouses, `useOpenLowStock`), the column = `WarehouseDto.lowStockCount` (sortable, «i» hint, amber pill when > 0, «0» at zero; the CSV too). Detail: the page loads only the warehouse, its stock rows and movements (no stock report); KPI = `warehouse.lowStockCount`, click → «Остатки» with search / category cleared and «Остаток: Заканчивается» (= rows with served `isLowStock`); «Нет в наличии» = rows at 0, tracked or not; the pill per `stockRowLevel` (`components/warehouse/Stock/`). «Остатки» gains «Порог» after «Остаток» — the row's threshold with the short unit, «—» untracked, a pencil on every row (also on an archived warehouse — the backend allows it; the row counts after restore) opening `StockThresholdDialog` (`FormDialog sm`: «Сейчас на складе: Q», the optional `ThresholdField` — decimals up to 3 for г / кг / т, whole for counted units with «Порог — только целое число» — «Сохранить», «Убрать порог» while one is set, both offline-gated); `SelectedWarehouseStore.saveThreshold` → `PUT …/stock/{productId}/threshold`, then the row is replaced from the answer and the warehouse re-read for its count (toasts «Порог сохранён…» / «Порог убран…»). The CSV adds «Порог». «Начальный остаток» lines gain an optional «Порог» (96px, «i» hint; empty = not tracked) sent as `lowStockThreshold`. `empty` (the opening-stock prompt instead of tabs) now follows the stock rows, not `productCount`.

## Stock Adjustments
- **State:** rebuilt — immutable list with expand-row detail, warehouse/direction/search filters, create modal with direction toggle + reason-by-direction.
- **Data:** real (`/api/stock-adjustments`)
- **Open:** —
- **Decisions:** immutable — no edit/delete (rule 1); over-stock decrease hard-blocked (rule 20).
- **UI refresh 2026-10-06:** create and detail modals on `FormDialog`; the detail is titled «Корректировка №N» (`formatEntityId(id)`) with `FactRow` facts; product column on `EntityCell`, «Склад» a secondary link; «Склад: Все» filter.
- **Owner decisions 2026-10-07:** a direction reads as its quantity's sign — «+ Приход товара» blue / «− Списание» amber — on the list chip (`DirectionChip`), the form's option cards (`DirectionCard`) and the form preview's change figure, all from `directionPresentation`; no arrows (money-only) and no green / red.

## Transfers
- **State:** rebuilt — immutable list with warehouse filter, read-only detail modal, multi-line create with route picker + per-line availability.
- **Data:** real (`/api/transfers`; served `GET /{id}` unused — the detail modal is fed from the list row)
- **Owner decisions 2026-10-07 — no mixed-unit totals:** the list «Единиц» column and its CSV column are gone, and the detail lines footer reads «Позиций N» only (`transferUnits` deleted) — line quantities of different products mix kg, pieces and tonnes, like the warehouse «Единиц» that was replaced.
- **Decisions:** immutable; from ≠ to enforced at the picker; over-stock hard-blocked (rule 20).
- **UI refresh 2026-10-06:** create and detail modals on `FormDialog` (line rows split out); the detail is titled «Перемещение №N»; «Откуда / Куда» are secondary links.

## Partners
- **State:** rebuilt — list (summary strip, search/type/archive filters, CSV); routed detail `/partners/:id` (balance card, running-balance ledger, Журнал/Транзакции/Платежи tabs); create/edit modal; archive/restore; delete gated by served `isDeletable`.
- **Data:** real (`/api/partners`, `/{id}/ledger`, archive/restore; balance + opening balance server-computed)
- **Open:** — (F2 fixed via E1 re-read; F12 Telegram now persisted+served by BE wave-5, FE renders it in «Контакты» — live-verified 2026-07-19; F15 autocomplete leak fixed wave-4). F20 ledger «Номер» now shows «№…» on sale/supply/refund rows via `formatEntityId`. XC-8: the «Платежи» tab «Касса» column links via `WalletLink` when the served `walletId` is present (BE PR #104), plain text otherwise.
- **Decisions:** no system «Розничный покупатель» — partners are uniform (owner, rule 39).
- Opening balance editable at create, locked on edit.
- Balance colour follows the **subject** (DR-27). **A single partner's balance** is partner-POV + **signed**: they owe us → `−…` red (a debtor), we owe them → `+…` green (`partnerBalanceColor`/`formatPartnerBalance`); served value stays company-POV (`+ = partner owes us`, hard rule 8) — display-only. Applies to partner list rows/detail/ledger/payments, the create/edit form read-only previews (form **input** stays company-POV), the Top-debtors list, and the POS/New-Order partner card + picker (POS `balancePresentation` delegates to `partnerBalanceColor`). **The company's own aggregate money stays owner-POV** (receivable green = asset, payable red, no signs): the partners-list summary strip, the Dashboard KPIs + aging, and the Debts page. The order-detail partner balance was **removed** (showed current, not order-time, position). Cash-flow charts, aging heatmap, overdue amber, wallet «our money» unchanged. Canon: UI Pattern 4 amended + DR-27.
- **UI refresh 2026-10-06:** detail rail = balance `HeroAmountCard` (partner-side sign, DR-27) with the opening balance as a fact row under it, then «Обороты» (icons in the document-type hues) and «Контакты» on `FactRow`; list column «Партнёр»; the summary strip on `StatCard` under the title row; the form on `FormDialog` — `FormSection` «Начальный баланс», side as a form `SegmentedControl`, the amount a `MoneyField` with the sign written in the figure («−50 000»), submit «Создать партнёра» / «Сохранить»; the debt reminder's «Копировать» / «SMS» are `FormDialogFooter` `secondaryActions`; archived banner a `Callout`.

## Sales / Supplies (Transactions)
- **State:** rebuilt as one `direction`-parameterized module — unified immutable feed (search, served-`TransactionStatus` filter incl. Overdue, date range, CSV; refund rows negative + «Возврат к №N»); routed full-page detail (`/sales/:id`, `/supplies/:id`) with positions, payments, refund history, audit card; refund-create modal (per-line cumulative cap, mandatory reason).
- **Data:** real (`GET /api/transactions`, `GET /{id}`; multipart `POST /api/transactions` creates sale/supply/refund by `Type` — no separate refund route)
- **Open:** — (F6 refund number fixed via F19; F7 attachment model fixed wave-4, now renders via the shared `AttachmentChip` with API-base URL resolution; F21 pack count now shows "N упак" on detail lines — live-verified 2026-07-19).
- **Decisions:** name-only detail header — «№N» only, all meta lives in body cards (owner).
- No partner balance anywhere on the detail (owner — a current balance on a historical transaction misleads).
- Refund amounts stay negative in the list (D12).
- **UI refresh 2026-10-06:** detail rail order — money hero first (`SaleFinancialCard` on `HeroAmountCard`: served total + payment-status chip, then Подытог · Скидка по позициям · Оплачено · Остаток), then «Информация» on `FactRow` (with «Создал»), then «Платежи»; the positions card has no totals footer; a refund shows `RefundFinancialCard` + `DetailNote` (`PositionsFooter` deleted). Document totals are ink, not teal. The list № never falls back to the id (`transactionDisplayNumber`; «Без номера»); tab titles «Продажа №N · Ombor». Refund modal on `FormDialog` (`lg`). A booked fractional percent discount reads «−1,25%» (`formatExactPercent`).

## New Sale / New Supply (POS)
- **State:** rebuilt at `/sales/new` + `/supplies/new` as one `direction`-parameterized `NewTransactionEntry` — full-page POS: required partner picker (balance as colour + label), warehouse picker, product-search cart with per-line % / fixed discounts + bulk apply-to-all, per-line unit toggle «шт | упак» on packaged products (`CartLineQty` — entry in packages, quantity stored in whole base units, R21), payment breakdown with debt settlement (`PaymentSettlementModal`) and Сдача/Аванс toggle, templates load/save, keyboard loop (`KeyboardHints`).
- **Data:** real (multipart `POST /api/transactions`; `GET /api/payments/outstanding` for settlement)
- **Open:** — (F21 resolved 2026-07-19: BE wave-5 is server-authoritative; the FE sends `packageQuantity` (pack count) on lines + template items and reads back `packageSize`; base `quantity` stays the source of truth. Live-verified: pack supply persisted count, detail shows "N упак".)
- **Decisions:** partner required — no system walk-in partner (owner; canon rules 39–40 superseded, see design-handoff pattern 9).
- Product search shows availability only for the picked warehouse — «На складе: N» green or «Нет в наличии» red at ≤ 0; no amber «мало» (low stock is a warehouse row's threshold, DR-41).
- Fixed line discount is a per-line currency amount, not the prototype's per-unit (flagged deviation); qty clamped ≥1.
- Sale hard-blocks over-stock (rule 20), Supply doesn't (a supply adds stock); advance only at zero remaining debt (rule 40).
- Package toggle converts UP (ceil) to whole packages on switch and back losslessly; all money/stock/payload math stays base-unit; unit price stays per base unit.
- Supply tender guard (DR-25) clamps available at ≥0: zero-pay (credit) supplies always pass, even from an overdrawn wallet, and the «Доступно только…» copy never renders a negative amount.
- **UI refresh 2026-10-06:** `NewTransactionEntry` (784 lines) split into small files (`LineEditorCard`, `CartLineRow`, `CartLineQty`, `LineRowHead`, `LineDiscountField`, `LineMoneyInput`, `LineRemoveButton`, `PosPageHeader`, `posStyles`, `Summary/` …, hooks `usePosShortcuts` / `usePosTemplates`); every control the themed 38px field (50px search and submit kept), labels via `FormField` (12/600 captions in lines); quantities on the shared `QtyStepper` («1,5» stays visible with «только целое число», «−» at 1 explains instead of greying out); discounts on `PercentField` — «1,5» = 1,5 % (was 15 %); %/fixed, шт/упак and Сдача/Аванс on `SegmentedControl`; the fixed-discount tooltip reads «…на всю позицию»; notices are `Callout`s; the summary's result row reads «Оплачено» (the tender block keeps «Оплата»).

## Templates
- **State:** rebuilt — shared `ExpandableDataTable` list (search + type filter, expand-row line items with totals), create/edit modal (type toggle re-prices lines, partner autocomplete, product cart), delete confirm.
- **Data:** real (`/api/templates`; `lastUsedAt` still unserved → «Использован» renders «—»)
- **Open:** — (F4 fixed wave-4; F15 partner picker fixed wave-4). F21: template items now round-trip `packageQuantity`/`packageSize` silently (no modal UI) and show "N упак" in the expand-row; POS save/load restore pack mode.
- **Decisions:** a template is an editable basket, not an immutable event — edit/delete allowed (mvp-plan §12).
- **UI refresh 2026-10-06:** list on the shared table chrome (`ExpandableDataTable` with `DataTableHead` / `DataTableRow`; the panel row renders only while open, closing is instant); the modal on `FormDialog` (`lg`) with the shared `QtyStepper` and `LineRemoveButton`, the type as a form `SegmentedControl` with icons (keyboard-reachable; the old teal / saffron selected fills are gone), submit «Создать шаблон».

## Orders
- **State:** rebuilt — the one mutable transaction. List with status tabs + live counts, search, date range, CSV; routed detail `/orders/:id` (status stepper, history timeline, delivery card with overdue states, positions, financial card, status-dependent ⋮); full state machine (`process/ship/deliver/cancel/reject/return`); pre-delivery edit modal. Delivery date required + optional time, with overdue/upcoming/done states.
- **Data:** real (`/api/orders` + the six transition endpoints)
- **Open:** —
- **Decisions:** warehouse IS collected at creation as the order's *intended* warehouse (product-owner decision) — it pre-fills the delivery dialog but reserves no stock; the real per-line stock check runs at delivery confirmation and hard-blocks (rule 20).
- «Склад списания» detail row is gated to Delivered/Returned so a pending order's intended warehouse doesn't mislabel as written-off.
- Order edit distinguishes omitted / null / value for `warehouseId` (keep / clear / set).
- **UI refresh 2026-10-06:** the rail reads the served `order.total` (discount = subtotal − total) and the lines' served `line.total`; the positions card dropped its client-side total footer; delivery is a fact grid (empty «—»); the source chip reads «Ombor» for `OmborWeb` (enum unchanged); the order-edit modal on `FormDialog` (`lg`) with `QtyStepper` and the POS `LineDiscountField` (fixes the raw `order.new.line.fixedHint` key in its tooltip); the delivery-confirm modal on `FormDialog`.
- **Owner decisions 2026-10-07:** delivery date / time in the order-edit modal on `DateField` / `TimeField` («ДД.ММ.ГГГГ», 24-hour «ЧЧ:ММ»; the optional time clears with «×»); payload unchanged (`deliveryDate` «yyyy-MM-dd», `deliveryTime` «HH:mm:ss» or null). `OrderFormModal` and `DeliveryConfirmModal` are offline-gated now (button only — neither has a keyboard submit).

## New Order
- **State:** rebuilt — full-page order-create POS at `/orders/new` mirroring New Sale for a *pending intent*: no payment, no wallet, no immutability warning; required client + warehouse + delivery date, source picker, product cart with % / fixed line discounts, unsaved-changes guard.
- **Data:** real (`POST /api/orders`)
- **Open:** —
- **Decisions:** over-stock is flagged per line but never blocks creation — the real check is at delivery (rule 20; contrast the Sale cart).
- Source enum is Telegram/OmborWeb (no `None`); New Order defaults to OmborWeb.
- Deliberately simpler than New Sale — no templates, bulk discount, or keyboard loop.
- **UI refresh 2026-10-06:** `NewOrder` (770 lines) split into `order/Create/` (`NewOrder`, `OrderHeaderCard`, `OrderLineRow`, `OrderSourcePicker`, `OrderSummaryCard`) over the POS line pieces and partner card; «1,5» in a quantity no longer saves 15 (`QtyStepper`); discounts on `PercentField`; the summary «Доставка» reads DD.MM.YYYY; the summary's «editable until delivery» note is a `Callout`.
- **Owner decisions 2026-10-07:** delivery date / time on `DateField` / `TimeField` in `OrderHeaderCard` (time clearable); payload unchanged.

## Wallets
- **State:** rebuilt — list on shared DataTable (summary strip spanning archived wallets per rule 31, search, archive segmented, CSV); routed detail `/wallets/:id` (three stat cards, Операции ledger + Переводы tabs on DataTable); create/edit modal, inter-wallet transfer modal, archive/restore — never delete.
- **Data:** real (`/api/wallets`, `/{id}/operations`, `/{id}/transfers`, `POST /api/wallets/transfers`, archive/restore)
- **Open:** F10 direction narrowed In/Out, op `partnerId` unmodeled (WAL-7); F13 guard blocks overdrawn source
- **Decisions:** type + opening balance locked on edit (rule 16).
- Balance / advances / our-money are server-computed and never recomputed client-side (rule 12).
- Direction pills are colour-only, no +/− signs (locked pattern 4).
- **UI refresh 2026-10-06:** list strip and detail stat cards on `StatCard`; the form on `FormDialog` with the type as a form `SegmentedControl` with icons, submit «Создать кассу»; the transfer modal on `FormDialog`; the transfer detail is titled «Перевод №N» with `FactRow` facts and a close-only footer; «Операции» column «Партнёр / сотрудник»; «Переводы» «Откуда / Куда» secondary links; archived banner a `Callout`.

## Payments
- **State:** rebuilt — five immutable payment types (Оплата / Депозит / Вывод / Зарплата / Общий): list (direction filter cards, search, type + wallet + date filters, CSV); routed detail `/payments/:id` (Касса source line + Распределение allocation table + attachments card + info card); create modal with per-type fields, an attachment picker (F18), and the standalone settlement modal (FIFO auto-allocate, manual per-row, excess → advance; Вывод hard-blocks over-advance).
- **Data:** real (`/api/payments`, `/form-data`, `/outstanding`; **POST is multipart/form-data — carries `Attachments` file parts, F18**; the source/allocation read model is served, incl. `attachments[]` + echoed `transactionNotes`/`transactionAttachments`)
- **Open:** — (F9 guard fixed wave-4). F18 attachments landed + live-verified 2026-07-19 (create + display via the shared `AttachmentChip`); the **note-on-any-payment** input stays a deferred feature (only `General` carries a note today).
- **Decisions:** payments are immutable (rule 1); reverse-payment is out of MVP.
- Payroll allows any number of payments per employee+month (canon — the prototype's one-per-month block dropped).
- The standalone create's simplified settlement (no advance source / overpayment disposition) is the accepted DR-05 deferral.
- **UI refresh 2026-10-06:** the create modal (was 640 lines) is on `FormDialog` (record tile, «Провести платёж» + commit note, Ctrl+Enter only, discard confirm) — logic in `hooks/payment/usePaymentCreate.ts`, sections in `components/payment/Form/Create/` (`PaymentTypeField`, `PaymentPartnerField` + `PaymentPartnerSummary`, `PaymentPayrollFields`, `PaymentGeneralFields`, `PaymentDirectionField`, `PaymentWalletAmountFields`, one `PaymentRefSelect` for the partner / employee / wallet pickers); the type control scrolls sideways instead of wrapping on a narrow screen; the partner balance line reads partner-side like every partner balance (DR-27: «−…» red when they owe us); the salary prefill clears its stale amount error. Detail: «Сумма платежа» hero coloured by direction with the Приход / Расход chip, «Информация» on `FactRow` (type as `PaymentTypeBadge`, entity links), the memo tag a `StatusPill`. List: filters «Тип: Все» / «Касса: Все», column «Партнёр / сотрудник».
- **Owner decisions 2026-10-07:** the direction filter is three toggle cards under the title — «Все платежи · Приход · Расход» (`PaymentDirectionCards`; replaced `PaymentSummaryStrip` and the header's «Все | Приход | Расход» segmented control). Each card counts the payments it would show under the other filters (`PaymentStore.directionCounts`, client-side — the list serves no counts), the pressed card shows ✓, a second click on Приход / Расход returns to «Все» (`setDirectionFilter` takes `"all"`); money appears only in the totals band. Open (owner): the band still shows «Расход 0 UZS» while «Приход» is pressed. Wallet «Операции» keeps its segmented direction switch — that page's cards are balances, not counts of its rows.

## Debts
- **State:** rebuilt — read-only aggregated view over unpaid/partially-paid transactions (no create): four summary cards (three of them the direction and «просрочено» filters), По партнёрам / Неоплаченные документы tabs on shared DataTable, search + age buckets, CSV, partner/transaction deep-links.
- **Data:** real (`GET /api/debts`; remaining/age/overdue server-computed)
- **Open:** —
- **Decisions:** debts are not an entity — they are produced by transactions; served figures are never recomputed (rule 12), summary/groups aggregated client-side from the served list.
- Column headers own ad-hoc sorting — the dashboard / bell presets (`applyCard`) seed the table via `DebtStore.txPresetSort` (owner).
- **UI refresh 2026-10-06:** tabs on the shared `DetailTabs` (tab roles, shared count pill) with the sign legend in its `trailing` slot (`debt/DebtSignLegend` over `LegendKey`); `DebtTabs` deleted. Summary cards on `StatCard`; documents column «Осталось оплатить» (table and CSV); «Срок: Все»; each table remembers its page size (`storageKey`); the company line clamps to one line so the documents table fits 1366.
- **Owner decision 2026-10-07 — the cards are the filter:** «Нам должны» / «Мы должны» toggle the direction filter (one at a time; pressing the pressed one shows both), «Просрочено» toggles «только просроченные» and combines with either; a pressed card shows ✓ and its accent border (`StatCard` `active`), and the pressed state is read from `DebtStore` (`toggleDirection`, `toggleOverdue`), so a dashboard / bell preset shows on the cards too. The cards keep their money figures — the served totals, which never follow the filters — and keep the open tab; «Итог расчётов» filters nothing. The toolbar's «Все | Нам должны | Мы должны» segmented control and the removable «Только просроченные» chip are gone (one control per filter); the table, the tab counts and the CSV follow the cards.

## Employees
- **State:** rebuilt from the legacy side-pane — list (search, status segmented, CSV) and routed detail `/employees/:id` (identity card, three stat cards, Выплаты payroll history) on shared DataTable; `DetailPageHeader` name-only; create/edit + payroll modals. Payroll period column is derived from the payment date (no period field served).
- **Data:** real (`/api/employees`, `/{employeeId}/payrolls`)
- **Open:** F11 null status treated as active
- **Decisions:** terminate/restore is a status change — never a hard delete (legacy hard-delete plumbing is unreachable in the UI).
- Payroll allows any number of payments per employee+month (canon, matching Payments).
- Status badge Active=green / OnVacation=orange / Terminated=stone-gray (owner), with a defensive fallback for the nullable served status.
- **UI refresh 2026-10-06:** detail KPIs on `StatCardGrid` / `StatCard`; the form on `FormDialog` (now `md` 640, was 880) with `FormSection` «Контактная информация» and the status as a form `SegmentedControl`, submit «Создать сотрудника»; the payroll modal on `FormDialog`; the employee picker has no floating label.
- **Owner decisions 2026-10-07:** hire date on `DateField` («ДД.ММ.ГГГГ»; no future-day greying — «not in the future» still reports on submit); Enter in it saves the form, and a submit error focuses its first section so typing goes in. Payload unchanged (`dateOfEmployment` «yyyy-MM-dd»).

## Settings
- **State:** rebuilt — single page `/settings` with scroll-spy section nav and four cards: Организация (editable profile + logo, 2 MB limit), Язык (immediate-apply per-user radio), Валюта (locked UZS), Пользователи (invite / deactivate / reactivate — never delete, self-account guarded); save bar governs the org form only, buttons stay enabled.
- **Data:** real (`/api/settings/organization` GET/PUT, `/users` + `/invite` + `/{id}/deactivate|reactivate`, `PUT /language` — write-only: the saved language is not returned at login, frontend-gaps A18)
- **Open:** —
- **Decisions:** currency locked to UZS (rule 33); users are deactivated, never deleted (rule 41).
- The prototype's «Данные»/CSV-export section is cut from MVP (mvp-plan Deferred).
- **UI refresh 2026-10-06:** every section on one `SettingsSectionCard` (h3 title, padding); each section saves from its own card's footer band — Организация «Отмена · Сохранить» with the unsaved / saved status (`SettingsSaveBar`), Безопасность «Сменить пароль»; fields capped at 480px; «Фамилия» with the optional marker; currency / language notes are `Callout`s; the invite modal on `FormDialog` (shared «+998» prefix, close-only success step); the section menu highlights the item clicked («Пользователи» no longer lights «Безопасность»).

## Activity Log
- **State:** built (2026-10-04) — `/activity-log` «Журнал действий» (server-filtered, server-paged `ActivityTimeline`) and the per-record «История» (`EntityHistory`); rules in conventions.md → Activity Log, cases in `docs/testing/modules/activity-log.md`. (This entry read «not built» until 2026-10-06.)
- **Data:** real (`/api/activity`)
- **Open:** —
- **Decisions:** see conventions.md → Activity Log.
- **UI refresh 2026-10-06:** each row leads with its record's tile (`activityTile` over the shared `recordTile`, moved to `shared/IconTile/recordTile.ts` so modal headers reuse it) and the actor's `EntityAvatar`; the «Что» filter reads «Что: Все».
- **DR-41 (2026-10-07):** a `StockChanged` whose only field is `lowStockThreshold` reads «Порог «Заканчивается» для «товар · склад» изменён: — → 10» (`activity.sentence.StockChanged.threshold`); other `StockChanged` rows now carry their change summary; the field label `activity.field.Stock.lowStockThreshold` «Порог «Заканчивается»» (0 stays «0»); the product's «Минимальный остаток» label stays for older entries.

## Акт сверки
- **State:** built — the printable statement `/partners/:id/statement?from&to` (`PartnerStatementPage` + `components/partner/Statement/`, on the shared print kit; conventions.md → Printable documents), opened from the partner ⋮ and the Debts row ⋮ «Акт сверки»; cases in `docs/testing/modules/partners.md`. (This entry read «not built» until 2026-10-07; frontend-gaps U2 still does.)
- **Data:** real (`GET /api/partners/{id}/ledger`)
- **Open:** changing both period fields within ~100 ms can drop one edit (each change sends `{ ...period, [side]: day }` from the rendered period) — human typing is unaffected.
- **Decisions:** default period 01.01 of this year → today; the period ends no later than today.
- **Owner decisions 2026-10-07:** the toolbar «С» / «По» are `DateField`s («ДД.ММ.ГГГГ») with the labels on their left, so the toolbar keeps one row; the calendars grey out days after today (`maxDate`); a cleared or half-typed entry keeps the previous day and a future day is capped at today — on leaving the field it shows the day the statement uses again.

## Reports
- **State:** built (DR-34, 2026-10-04; this entry read «not built» until 2026-10-07) — «Отчёты» in navigation: the hub `/reports`, one report per `/reports/:kind` (sales, profit, purchases, stock, cash-flow, expenses, losses) and its print view `/reports/:kind/print`; rules in conventions.md → Reports.
- **Data:** real (`/api/reports/*`)
- **Open:** frontend-gaps U3 still describes Reports as v2.
- **Decisions:** see conventions.md → Reports.
- **DR-41 (2026-10-07):** the stock report's «Остаток» filter reads the served flags — «Заканчивается» = rows with `isLowStock` (exactly `totals.lowStockCount`), «Нет в наличии» = rows at 0 (tracked or not); the pill per row on the same rule; `rows[].lowStockThreshold` is optional (absent = not tracked). Other pages open it pre-filtered through `reportStore.presetStock(warehouseId, level)` (the Warehouses «Заканчивается» card, the dashboard panel's «Все», the bell's low-stock alert — all over every warehouse).

---

**Gap routing:** anything that looks like a frontend↔backend divergence or a missing capability → `frontend-gaps.md` (F1–F17 live divergences, U1–U3 unbuilt v1 modules; also the recording home for new gaps, with contract evidence).
