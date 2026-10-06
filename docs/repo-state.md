# Frontend repo state — per-module detail

**Status:** per-module state — the single home of module status (Ombor.Web/CLAUDE.md keeps only a short exceptions list and routes here). Read the module's entry before touching a module. Pairs with frontend-gaps.md (live F-item gap list).
**Last updated:** 2026-10-06 (UI refresh notes on the affected entries; earlier: 2026-07-14 doc-sync pass).
**Discipline:** entries record decisions-and-state, not narrative history — prune superseded detail when updating (git history keeps the record).

**Global facts (stated once, not repeated per entry):** since the 2026-07-05 contract alignment the app runs on the REAL backend (`VITE_ENABLE_MOCKS=false`); `src/mocks/` handlers are dead code pending deletion; the authoritative gap list is `frontend-gaps.md` (F1–F17 live FE↔DTO divergences, U1–U3 unbuilt v1 modules).

---

## Tooling & app shell
- **State:** Vite + TS 5.x (from CRA, June 2026), Husky/lint-staged removed; Sidebar/Topbar/AppLayout rebuilt to the redesign (locked pattern 10); all v1 routes in `routing/paths.ts`, unbuilt pages render `PlaceholderPage`; `NotFoundPage` catch-all.
- **Data:** n/a
- **Open:** —
- **Decisions:** rewrite-as-we-go — legacy modules keep the stores/api/models/schemas structure; components and layouts are replaced per module when rebuilt.
- **UI refresh 2026-10-06:** `layouts/Sidebar.tsx` split into the `layouts/Sidebar/` folder (`index`, `styles`, `navState`, `TopLevelItem`, `SubItem`, `RailButton`, `RailGroup`, `SidebarBrand`, `SidebarFooter`) — teal navigation panel, compact rows with guide lines and a scroll fade; it publishes its width as `layout.sidebarWidthVar` for the toasts. Topbar «Создать» and every menu on the shared `menuSlotProps` surface; content column capped at `layout.contentMax`. Toasts are the app's own `ToastProvider` / `ToastContent` (past the sidebar, at the screen edge while a dialog is open). Browser tab titles via `useDocumentTitle` («… · Ombor»). The route 404 (`NotFoundPage`) renders `LoadStateView`'s not-found state. Dead CRA stylesheets (`App.css`, `index.css`, `styles/global.scss`) deleted — `sx` only.

## Theme & design tokens
- **State:** `theme.ts` at full parity with `tokens.css` + the DSN-1 foundational-components reference; the single styling source — no inline hex anywhere. Exports: `designTokens`, `numericSx`, `radius`, `typeScale`, `chipTokens`.
- **Data:** n/a
- **Open:** —
- **Decisions:** `chipTokens` semantics locked — tx type Sale=teal / Supply=saffron / refunds outlined (brand hues; green/red reserved for money), status Open=info / PartiallyPaid=warning / Overdue=error (single red) / Closed=success, direction Income=success / Expense=error.
- gray-600 is the data-bearing secondary colour (SKU/dates/№); gray-400 is decoration-only.
- `OrderStatusChip` and the module-local `ProductTypeChip`/`MovementKindChip` stay on their own mappings (no clean chipTokens key — left for module passes).
- **UI refresh 2026-10-06:** the theme is the `src/theme/` folder (`palette`, `chipTokens`, `typography`, `tokens`, `identityPalette`, `components`); one cool ink-grey neutral ramp, `figuresSx` (identifiers / dates) beside `numericSx`, `iconSize` roles, theme-sized button icons, identity tints (`identityTone`) for avatars and image placeholders, the modal anatomy in `components.ts`. Lint warns on fractional font sizes, px-string radii and `!important` outside `src/theme`. Mirror: `docs/design-tokens.md`.

## Cross-cutting infra
- **State:** connectivity system (`ConnectivityStore` + `OfflineBanner`; `httpErrorInterceptor` reports handled 4xx/5xx to Sentry, 401s skipped); shared `MoneyField` / `UzsUnit`; phone helpers (`uzNationalPart`/`uzPhoneToStored`).
- **Data:** n/a
- **Open:** F14 lists fetch-all, client-side paging; F16 hardcoded «Нет записей», months, plurals
- **Decisions:** save buttons stay enabled and validate on submit (rule 5) — disabled only while saving or backend unreachable.
- Mobile responsiveness deferred — desktop-first (owner).
- Server search/filter params exist on most routes but are deliberately unwired in v1 (see F14).
- **UI refresh 2026-10-06:** one table chrome (`tableChrome` / `DataTableGrid`) for list, expandable and detail tables — no zebra, hover / focus only on clickable rows, page size remembered (`useRowsPerPage`); summary figures on `StatCard` / `StatCardGrid`; every modal on `FormDialog` (+ `FormField` labels above fields, `FormSection`, form `SegmentedControl`); `Callout` the only notice box; `QtyStepper` / `PercentField` / `MoneyField` (right-aligned, «UZS») the line inputs (`MoneyInputBase`, `PosField`, `LineField` deleted). Load errors shown inline raise no toast — list pages load shared lists with `{ quiet: true }` (conventions.md → MobX).

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
- **UI refresh 2026-10-06:** KPI cards on the shared `StatCard`; the aging panel leads with «Всего нам должны …» and the 31+ share («N% старше 30 дней», saffron) — no duplicate «Всего» footer; low-stock tiles 3 / 2 per row with the full name; Top debtors / Recent transactions titles on `h3` like the chart panels; the sales-vs-supplies chart draws sales as a gradient area, supplies a plain line; value axes size to their longest tick (`chartAxis`); the «Касса» filter on the shared menu surface; the recent-transactions column reads «Статус оплаты»; the getting-started card tightens once a step is done.

## Products
- **State:** list + routed full-page detail `/products/:id` (right rail; Обзор / Продажи и поставки / Движения / История tabs) — no side pane remains (this line read «legacy side-pane» until 2026-10-06).
- **Data:** real (`/api/products`, `/{id}/movements`, `/{Id}/transactions`, archive/restore)
- **Open:** F1 edit crashes/blanks list+detail (Blocker)
- **Decisions:** `retailPrice` dropped from create/edit (and now absent from the contract); measurement enum aligned to backend (no `Liter`).
- Product delete has no served `isDeletable` predicate to gate on (contract gap — frontend-gaps A11).
- **UI refresh 2026-10-06:** rail on `FactRow` (prices in ink, a 0 price «—», markup green / red by sign); «Минимальный остаток» / «Фасовка» read through `QuantityCell` («10 кг»); a product without a photo shows its name's letter on its identity tint (`ProductImage` `name`); the form on `FormDialog` (`lg`, fixed 850px body) with `FormSection`s «Фасовка» / «Дополнительно» and a form `SegmentedControl` for the type, submit «Создать товар»; the archived banner is a `Callout`; list filters on `EntityFilterSelect` («Категория: Все»); «Движения» column «Событие», «Продажи и поставки» «Цена за ед.» / «Итого».

## Categories
- **State:** legacy CRUD, not yet rebuilt; delete reference-gated via served `productCount` (backend 409 still protects data).
- **Data:** real (`/api/categories`)
- **Open:** F3 lean create/edit response stored
- **Decisions:** —

## Warehouses
- **State:** rebuilt — list + full-page detail with Остатки/Движения tabs, create/edit modal, «Начальный остаток» opening-stock modal, archive/restore, reference-gated delete.
- **Data:** real (`/api/warehouses`, `/{id}/stock`, `/{id}/movements`, `/{id}/opening-stock`, archive/restore)
- **Open:** F8 refund kind filter matches nothing
- **Decisions:** opening stock is an event entered per-warehouse via the «Начальный остаток» modal (`POST /{id}/opening-stock`, note + decimal qty) — not an editable stock field.
- **UI refresh 2026-10-06:** list strip and detail KPIs on `StatCard`; «Остатки» column «Остаток»; «Движения» shows an adjustment's reason as its label («Кража/утеря», not the raw enum) and the counterparty as a secondary link; form and «Начальный остаток» modal on `FormDialog` (line rows split out, unit-cost column 160px for the 600-weight figures), submit «Создать склад»; archived banner a `Callout`.

## Stock Adjustments
- **State:** rebuilt — immutable list with expand-row detail, warehouse/direction/search filters, create modal with direction toggle + reason-by-direction.
- **Data:** real (`/api/stock-adjustments`)
- **Open:** —
- **Decisions:** immutable — no edit/delete (rule 1); over-stock decrease hard-blocked (rule 20).
- **UI refresh 2026-10-06:** create and detail modals on `FormDialog`; the detail is titled «Корректировка №N» (`formatEntityId(id)`) with `FactRow` facts; product column on `EntityCell`, «Склад» a secondary link; «Склад: Все» filter.

## Transfers
- **State:** rebuilt — immutable list with warehouse filter, read-only detail modal, multi-line create with route picker + per-line availability.
- **Data:** real (`/api/transfers`; served `GET /{id}` unused — the detail modal is fed from the list row)
- **Open:** —
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
- **UI refresh 2026-10-06:** the rail reads the served `order.total` (discount = subtotal − total) and the lines' served `line.total`; the positions card dropped its client-side total footer; delivery is a fact grid (empty «—»); the source chip reads «Ombor» for `OmborWeb` (enum unchanged); the order-edit modal on `FormDialog` (`lg`) with `QtyStepper` and the POS `LineDiscountField` (fixes the raw `order.new.line.fixedHint` key in its tooltip); the delivery-confirm modal on `FormDialog` (still an MUI `Alert` inside — move to `Callout` when touched).

## New Order
- **State:** rebuilt — full-page order-create POS at `/orders/new` mirroring New Sale for a *pending intent*: no payment, no wallet, no immutability warning; required client + warehouse + delivery date, source picker, product cart with % / fixed line discounts, unsaved-changes guard.
- **Data:** real (`POST /api/orders`)
- **Open:** —
- **Decisions:** over-stock is flagged per line but never blocks creation — the real check is at delivery (rule 20; contrast the Sale cart).
- Source enum is Telegram/OmborWeb (no `None`); New Order defaults to OmborWeb.
- Deliberately simpler than New Sale — no templates, bulk discount, or keyboard loop.
- **UI refresh 2026-10-06:** `NewOrder` (770 lines) split into `order/Create/` (`NewOrder`, `OrderHeaderCard`, `OrderLineRow`, `OrderSourcePicker`, `OrderSummaryCard`) over the POS line pieces and partner card; «1,5» in a quantity no longer saves 15 (`QtyStepper`); discounts on `PercentField`; the summary «Доставка» reads DD.MM.YYYY; the summary's «editable until delivery» note is a `Callout`.

## Wallets
- **State:** rebuilt — list on shared DataTable (summary strip spanning archived wallets per rule 31, search, archive segmented, CSV); routed detail `/wallets/:id` (three stat cards, Операции ledger + Переводы tabs on DataTable); create/edit modal, inter-wallet transfer modal, archive/restore — never delete.
- **Data:** real (`/api/wallets`, `/{id}/operations`, `/{id}/transfers`, `POST /api/wallets/transfers`, archive/restore)
- **Open:** F10 direction narrowed In/Out, op `partnerId` unmodeled (WAL-7); F13 guard blocks overdrawn source
- **Decisions:** type + opening balance locked on edit (rule 16).
- Balance / advances / our-money are server-computed and never recomputed client-side (rule 12).
- Direction pills are colour-only, no +/− signs (locked pattern 4).
- **UI refresh 2026-10-06:** list strip and detail stat cards on `StatCard`; the form on `FormDialog` with the type as a form `SegmentedControl` with icons, submit «Создать кассу»; the transfer modal on `FormDialog`; the transfer detail is titled «Перевод №N» with `FactRow` facts and a close-only footer; «Операции» column «Партнёр / сотрудник»; «Переводы» «Откуда / Куда» secondary links; archived banner a `Callout`.

## Payments
- **State:** rebuilt — five immutable payment types (Оплата / Депозит / Вывод / Зарплата / Общий): list (stat cards, search, type + wallet filters, CSV); routed detail `/payments/:id` (Касса source line + Распределение allocation table + attachments card + info card); create modal with per-type fields, an attachment picker (F18), and the standalone settlement modal (FIFO auto-allocate, manual per-row, excess → advance; Вывод hard-blocks over-advance).
- **Data:** real (`/api/payments`, `/form-data`, `/outstanding`; **POST is multipart/form-data — carries `Attachments` file parts, F18**; the source/allocation read model is served, incl. `attachments[]` + echoed `transactionNotes`/`transactionAttachments`)
- **Open:** — (F9 guard fixed wave-4). F18 attachments landed + live-verified 2026-07-19 (create + display via the shared `AttachmentChip`); the **note-on-any-payment** input stays a deferred feature (only `General` carries a note today).
- **Decisions:** payments are immutable (rule 1); reverse-payment is out of MVP.
- Payroll allows any number of payments per employee+month (canon — the prototype's one-per-month block dropped).
- The standalone create's simplified settlement (no advance source / overpayment disposition) is the accepted DR-05 deferral.
- **UI refresh 2026-10-06:** the create modal (was 640 lines) is on `FormDialog` (record tile, «Провести платёж» + commit note, Ctrl+Enter only, discard confirm) — logic in `hooks/payment/usePaymentCreate.ts`, sections in `components/payment/Form/Create/` (`PaymentTypeField`, `PaymentPartnerField` + `PaymentPartnerSummary`, `PaymentPayrollFields`, `PaymentGeneralFields`, `PaymentDirectionField`, `PaymentWalletAmountFields`, one `PaymentRefSelect` for the partner / employee / wallet pickers); the type control scrolls sideways instead of wrapping on a narrow screen; the partner balance line reads partner-side like every partner balance (DR-27: «−…» red when they owe us); the salary prefill clears its stale amount error. Detail: «Сумма платежа» hero coloured by direction with the Приход / Расход chip, «Информация» on `FactRow` (type as `PaymentTypeBadge`, entity links), the memo tag a `StatusPill`. List: summary strip on `StatCard` under the title, filters «Тип: Все» / «Касса: Все», column «Партнёр / сотрудник».

## Debts
- **State:** rebuilt — read-only aggregated view over unpaid/partially-paid transactions (no create): four summary cards (three clickable, presetting the transactions tab), По партнёрам / По транзакциям tabs on shared DataTable, search + age buckets + direction filters, CSV, partner/transaction deep-links.
- **Data:** real (`GET /api/debts`; remaining/age/overdue server-computed)
- **Open:** —
- **Decisions:** debts are not an entity — they are produced by transactions; served figures are never recomputed (rule 12), summary/groups aggregated client-side from the served list.
- Column headers own ad-hoc sorting — card presets seed the table via `DebtStore.txPresetSort` (owner).
- **UI refresh 2026-10-06:** tabs on the shared `DetailTabs` (tab roles, shared count pill) with the sign legend in its `trailing` slot (`debt/DebtSignLegend` over `LegendKey`); `DebtTabs` deleted. Summary cards on `StatCard`; documents column «Осталось оплатить» (table and CSV); «Срок: Все»; each table remembers its page size (`storageKey`); the company line clamps to one line so the documents table fits 1366.

## Employees
- **State:** rebuilt from the legacy side-pane — list (search, status segmented, CSV) and routed detail `/employees/:id` (identity card, three stat cards, Выплаты payroll history) on shared DataTable; `DetailPageHeader` name-only; create/edit + payroll modals. Payroll period column is derived from the payment date (no period field served).
- **Data:** real (`/api/employees`, `/{employeeId}/payrolls`)
- **Open:** F11 null status treated as active
- **Decisions:** terminate/restore is a status change — never a hard delete (legacy hard-delete plumbing is unreachable in the UI).
- Payroll allows any number of payments per employee+month (canon, matching Payments).
- Status badge Active=green / OnVacation=orange / Terminated=stone-gray (owner), with a defensive fallback for the nullable served status.
- **UI refresh 2026-10-06:** detail KPIs on `StatCardGrid` / `StatCard`; the form on `FormDialog` (now `md` 640, was 880) with `FormSection` «Контактная информация» and the status as a form `SegmentedControl`, submit «Создать сотрудника»; the payroll modal on `FormDialog`; the employee picker has no floating label.

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

## Акт сверки — not built
- **State:** not built (mvp-plan §16) — the per-partner, date-range, print-friendly reconciliation statement screen is missing.
- **Data:** real — the ledger it renders from is already served (`GET /api/partners/{id}/ledger`)
- **Open:** U2 screen missing, data served
- **Decisions:** —

## Reports — not built
- **State:** not built — deferred to v2 (mvp-plan Deferred); out of navigation (pattern 10). Not a gap (U3).
- **Data:** n/a
- **Open:** —
- **Decisions:** —

---

**Gap routing:** anything that looks like a frontend↔backend divergence or a missing capability → `frontend-gaps.md` (F1–F17 live divergences, U1–U3 unbuilt v1 modules; also the recording home for new gaps, with contract evidence).
