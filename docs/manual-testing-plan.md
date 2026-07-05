# Ombor — Manual Release-Testing Plan

## Context

The MVP is near release: all modules are rebuilt to the redesign, the backend-alignment work is merged into `redesign/bug-fixes`, and per the owner the previously-open backend deltas have been implemented. This is a full manual sweep of every module against the **real backend** to catch release-blocking bugs and inconveniences before shipping. Executed by Claude via browser MCP tools; results tracked in this document.

**Log-only session — no code changes**, findings are fixed in later sessions. Execute top-to-bottom, updating checkboxes + the findings log as we go.

---

## Session setup

- Backend on `http://localhost:5062`, frontend dev server on `http://localhost:3000` (CORS allowlist requires :3000). MSW **off** (`VITE_ENABLE_MOCKS=false`, the dev default) — every request hits the real backend.
- **Tenant A (fresh):** register a new organization during AUTH testing — used for onboarding/seed checks and the clean end-to-end data chains. OTP is always **`1234`** in dev.
- **Tenant B (existing):** the current dev account — used for data-rich checks (long lists, pagination, aged debts) and multi-tenant isolation.
- Execution order = document order: it doubles as the data build-up sequence for Tenant A (categories → products → warehouses/stock → partners → supplies → sales → refunds → orders → payments → …). Don't reorder without checking data dependencies.

### Severity scale (findings log)

- **S1** — crash / white screen / data corruption / money-math error / security (tenant leakage)
- **S2** — feature broken or wrong behavior, no workaround
- **S3** — wrong but has workaround; noticeable UX inconvenience
- **S4** — cosmetic / polish

### Known non-features — do NOT file as bugs

- Reports module absent (v2); `/payments/new` may be a placeholder (create is a modal on `/payments`)
- Topbar global search is visual-only (⌘K non-functional)
- uz/uz-Cyrl locales gated out of the language picker; ru only
- Mobile responsiveness deferred (desktop-first)
- Currency locked to UZS (rule 33); no roles (rule 35); no reverse-payment (v2)
- Period date-filters + static pagers omitted from ledgers by design (locked pattern 12)
- Dashboard «Просрочено» = 31+-day aging (differs from /debts due-date overdue by design)
- Payroll allows multiple payments per employee+month (canon)
- Immutable events (transactions, payments, payroll, adjustments, transfers) have **no** edit/delete — by design
- Dashboard time-series may still be illustrative if the real endpoint serves seeded series — verify what's served before judging

### Watch items (previously flagged, log if reproduced)

- Wallet transfer over-balance guard blocks ALL transfers from a negative-balance wallet (latent, flagged in WAL pass)
- `RegisterRequest` field naming: backend `tenantName` vs FE `organizationName` (flag only if register breaks)
- Rejected-order detail crash (B2 from bug-fixes plan) — retest explicitly in ORD

---

## Cross-cutting checks (apply on EVERY module; log per-module findings, don't tick per module)

| # | Check |
|---|-------|
| X1 | No console errors/warnings during normal use; no failed network calls (except intentional negative tests) |
| X2 | Dates `DD.MM.YYYY`; amounts space-grouped via formatCurrency («1 250 000»), no currency symbols; entity ids «№N»; tabular numerals in numeric columns |
| X3 | No +/− signs on balances/money-direction — color + label only (locked pattern 4) |
| X4 | Buttons never silently disabled (rule 5): submit always clickable, validation inline on submit; disabled only while saving/offline |
| X5 | Tables: sortable headers (both directions), correct default sort, 10/25/50 pager works, row heights per standard, warm header band |
| X6 | Search filters live and matches expected fields; filters combine (search + filter + sort + pager together) |
| X7 | Empty states render (icon + message + action) — visible on fresh Tenant A before data exists |
| X8 | CSV export downloads, reflects the CURRENT filtered/sorted view (spot-check contents in PRD, TXN, DBT; presence elsewhere) |
| X9 | Entity links navigate to the right detail (PartnerLink, ProductLink, WarehouseLink, PaymentLink, transaction links) |
| X10 | Modals: Esc closes, unsaved-changes guard where designed, no data submitted on cancel |
| X11 | Toasts on success/error; failures surface a message, never a silent no-op |
| X12 | All UI text Russian — no raw i18n keys, no hardcoded English leaking |
| X13 | Deep-link/refresh: open detail URLs directly (F5 on the page) — loads correctly, no crash |

---

## Phase 0 — Preflight

- [ ] P0-1 Start backend (:5062) + frontend (:3000); confirm `VITE_ENABLE_MOCKS=false`
- [ ] P0-2 Hit the previously-missing endpoints to confirm the deltas landed: `/api/auth/forgot-password`, `/api/stock-adjustments`, `/api/transfers`, `/api/wallets`, `/api/debts`, `/api/dashboard`, `/api/settings/organization` (expect non-404). Any still missing → mark its module's affected cases BLOCKED, continue
- [ ] P0-3 Log in on Tenant B — app shell loads, no console errors

---

## 1. AUTH (register / login / reset / guards)

- [ ] AUTH-1 Register (Tenant A): company + first/last name + phone + password×2 + terms; inline validation on submit for each missing/invalid field (bad phone, short password, mismatch, unchecked terms)
- [ ] AUTH-2 OTP step: code `1234` accepted; wrong code rejected with inline error; resend countdown (60s) works; «change phone» returns to form with values kept
- [ ] AUTH-3 Welcome screen shows company name + 3 onboarding steps; «Начать работу» enters the app (no GuestOnly bounce)
- [ ] AUTH-4 **Seed records (rule 42):** fresh org has exactly 1 wallet, 1 warehouse, 1 category, 1 partner — all ordinary (editable/archivable/deletable), no special flags. Note what the seeded partner looks like (delta 9: should be Both or absent, not Customer-only «Розничный покупатель»)
- [ ] AUTH-5 Logout → lands on /login; back-button doesn't re-enter app; protected URL (e.g. /products) while logged out → redirected to /login
- [ ] AUTH-6 Login: valid creds enter; wrong password → error banner, values kept; malformed phone → inline error
- [ ] AUTH-7 Session persistence: F5 anywhere stays logged in (refresh token); GuestOnly — /login while authed redirects to dashboard
- [ ] AUTH-8 Reset password (real backend now): phone → code `1234` → new password×2 → success → login with NEW password works, old fails
- [ ] AUTH-9 Register duplicate phone → clean error (no crash)

## 2. APP SHELL (sidebar / topbar / navigation)

- [ ] SHL-1 Sidebar: expand/collapse toggle; state persists across reload (`ombor.sidebar.expanded`); collapsed rail shows tooltips + hover flyouts for groups; parent-icon click expands into group
- [ ] SHL-2 Auto-collapse on POS pages (/sales/new, /supplies/new, /orders/new); preference restored on leave; manual toggle wins
- [ ] SHL-3 All nav items route correctly; active item highlighted; group auto-expands when a child route is active
- [ ] SHL-4 Topbar: + Create menu (New Sale/Supply/Order/Payment) — each target opens correctly; notifications bell opens empty state; language globe (ru only); avatar menu shows name + logout
- [ ] SHL-5 Unknown URL → NotFoundPage with working back-to-dashboard
- [ ] SHL-6 Offline resilience: stop backend mid-session → toast + OfflineBanner, submits blocked (not silently swallowed); restart backend → recovery, banner clears

## 3. CATEGORIES

- [ ] CAT-1 List: search by name; product-count column; sort; pager; CSV
- [ ] CAT-2 Create: name required (inline error on empty submit); appears in list + in product-form category dropdown
- [ ] CAT-3 Edit: rename persists everywhere (product rows referencing it)
- [ ] CAT-4 Delete unreferenced category → confirm dialog → gone
- [ ] CAT-5 Delete category WITH products → blocked with clear «cannot delete» message (rule 32)

## 4. PRODUCTS

*Data: create ≥6 products across 2 categories, mixed measurements, one packaged type if supported; sale/supply prices set.*

- [ ] PRD-1 List: canonical columns incl. type chip, measurement, prices, «Средняя себестоимость» (WAC); name-asc default; search by name/SKU; category filter; archive segmented «Активные | Архив (N)» shows-only; CSV contents match view
- [ ] PRD-2 **Create works** (was blocked by RetailPrice rule — delta 8 now fixed): no retailPrice field; measurement enum matches backend (Gram/Kilogram/Ton/Piece/Box/Unit/None — no Liter); created product appears with stock 0 (rule 22 — creation never moves stock)
- [ ] PRD-3 Create validation: required fields inline on submit; duplicate SKU → clean backend error surfaced
- [ ] PRD-4 Edit: change prices/category/measurement → persists; stock NOT editable via product form
- [ ] PRD-5 Detail: header name-only; tabs (overview / transactions / movements); attachments if any; F5 direct URL
- [ ] PRD-6 Detail transactions tab: shows sales/supplies containing the product, rows link to transaction detail (populate later, re-verify after TXN)
- [ ] PRD-7 Detail movements tab: opening/supply/sale/adjustment/transfer entries with warehouse + qty + balance (re-verify after WH/ADJ/TRF/TXN)
- [ ] PRD-8 Archive: succeeds even when referenced (rule 30); archived product hidden from active list + POS product search, still renders on historical transactions; restore works
- [ ] PRD-9 Delete unreferenced product → succeeds; delete referenced product → blocked with message + archive suggested (rule 32)

## 5. WAREHOUSES

*Data: create a 2nd warehouse; opening stock into warehouse 1 for ≥4 products at differing unit costs.*

- [ ] WH-1 List: summary strip (products/units/value); search; archive segmented; sort/pager; CSV
- [ ] WH-2 Create/edit modal: name required; address optional
- [ ] WH-3 **Opening stock:** multi-row modal (product + qty + unit cost + note); note persists (delta 5); products excluded once added; after submit — stock appears in Остатки, WAC set per line, movements show opening entries
- [ ] WH-4 Opening stock validation: qty must be positive integer (rule 21); duplicate product handling
- [ ] WH-5 Detail: KPI cards (products/units/value) reconcile with Остатки tab sum; Остатки rows link to product detail; Движения ledger entries link to their source documents
- [ ] WH-6 Archive warehouse with stock → succeeds (rule 30); **still counted in list summary totals (rule 31)**; hidden from POS warehouse picker; restore works
- [ ] WH-7 Delete: unreferenced (fresh empty) warehouse → deletable; warehouse with any history (stock/opening/adjustment/transfer/order) → blocked with warning (rule 32, served isDeletable)

## 6. STOCK ADJUSTMENTS

- [ ] ADJ-1 List: immutable (no row actions/edit/delete anywhere); expand-row or detail shows lines; warehouse + direction filters; search; CSV
- [ ] ADJ-2 Create Decrease: warehouse + product + qty + reason (mandatory, reasons vary by direction) + note; **stock actually decrements** on product/warehouse (real backend now — verify in Остатки + movements)
- [ ] ADJ-3 Create Increase: stock increments; no linkage to prior decrease required
- [ ] ADJ-4 **Rule 20:** Decrease qty > available → hard-blocked on submit with inline error; exactly-available qty → allowed (stock hits 0)
- [ ] ADJ-5 Direction rendered as income/expense colors, no +/− signs; adjustment appears in warehouse + product movement ledgers

## 7. TRANSFERS

- [ ] TRF-1 List: immutable; warehouse filter; read-only detail modal (route from→to + lines); CSV
- [ ] TRF-2 Create: from ≠ to enforced; multi-line; per-line availability shown; **rule 20** over-stock hard-blocked
- [ ] TRF-3 After create: **both warehouses' stock updated atomically** — source decremented, destination incremented (check both Остатки tabs + both movement ledgers); WAC carried, not recomputed at destination
- [ ] TRF-4 Movement ledger counterparty links to the other warehouse (delta 4: id now served)

## 8. PARTNERS

*Data: create ≥3 partners — one Customer, one Supplier, one Both; one with opening balance ≠ 0.*

- [ ] PTR-1 List: summary strip; search (name/phone/company); type filter; archive segmented shows-only; type chips (Customer=teal / Supplier=saffron / Both=«Клиент + Поставщик»); balance colored, no signs; sort/pager; CSV
- [ ] PTR-2 Create: type required; phone +998 normalization; **opening balance editable at create only**; created partner's served balance = opening balance
- [ ] PTR-3 Edit: opening balance LOCKED (rule 16); other fields persist
- [ ] PTR-4 Detail: balance card (served figure, color + natural-language label); identity info; header name-only
- [ ] PTR-5 Ledger tab: opening-balance event first; running balance column; entries link to source docs (re-verify after TXN/PAY — every sale/payment/refund must appear and balance must reconcile)
- [ ] PTR-6 Транзакции tab: only sales/supplies, status filter; Платежи tab: only payments; rows link out
- [ ] PTR-7 Deep-link `?tab=transactions&status=open` (from Debts) opens pre-filtered
- [ ] PTR-8 Archive with debt → succeeds; hidden from active list + POS pickers; restore works
- [ ] PTR-9 Delete unreferenced → succeeds; delete referenced → «cannot delete» warning (rule 32)
- [ ] PTR-10 Balance never recomputed client-side: after any payment/sale elsewhere, partner card/list figures match served API values (rule 12)

## 9. NEW SALE POS (/sales/new)

*Prereq: products with stock (WH-3), partners, ≥1 wallet.*

- [ ] SAL-1 Layout: partner picker (REQUIRED — no default, submit without → inline error; owner override of canon 39–40); warehouse picker defaults to first; balance shown as color + label
- [ ] SAL-2 Product search: autofocus; add → removed from dropdown + qty focused/selected; per-line stock shown; sale price prefilled
- [ ] SAL-3 Line math: qty stepper (min 1); editable price; discount % ↔ fixed toggle (fixed = per-LINE currency, clamped to line gross); live line total + discount amount; bulk «применить ко всем» OVERWRITES line discounts (rule 38)
- [ ] SAL-4 **Rule 20:** line qty > warehouse stock → hard-blocked on submit
- [ ] SAL-5 Summary card: Подытог→Скидка→Итого correct; partner balance + projected «баланс после» (Sale ↑ receivable); «Вся сумма» fills tender
- [ ] SAL-6 Payment: partial tender → transaction created with remaining debt; zero tender → no-payment confirm dialog; full tender → status Оплачено
- [ ] SAL-7 **Overpay:** settlement modal (outstanding via /outstanding); Сдача vs Аванс toggle; **Аванс only offered at zero remaining debt (rule 40)**; worked examples in §INT
- [ ] SAL-8 Templates: save current cart as template; load template of the Sale direction re-prices correctly
- [ ] SAL-9 Keyboard: Enter qty/price/discount → search; ↑/↓ qty; Ctrl+Enter submit; Esc leave (guarded); Alt+P/Alt+W focus pickers; KeyboardHints legend visible
- [ ] SAL-10 Unsaved-changes guard on back/Esc with dirty cart; attachments upload accepted (multipart)
- [ ] SAL-11 **After submit (real backend):** stock decremented at the warehouse; partner balance increased (receivable); payment (if tendered) exists with wallet credited; transaction in /sales list + detail reconciles line-by-line

## 10. NEW SUPPLY POS (/supplies/new)

- [ ] SUP-1 Direction deltas: supply prices prefilled («Цена поставки»); **no stock validation** (supply adds stock); balance projection flips (↑ payable / «Мы должны»); copy keyed to supplier
- [ ] SUP-2 After submit: **stock incremented; WAC recalculated** = (old_qty×old_cost + new_qty×new_cost)/(total) — verify on product/warehouse WAC after supplying an existing product at a different cost (rule 18)
- [ ] SUP-3 Partner balance moves payable-ward; supply appears in /supplies + partner ledger

## 11. SALES / SUPPLIES LISTS + TRANSACTION DETAIL + REFUNDS

- [ ] TXN-1 Lists: columns №/Дата/Тип/Партнёр/Позиций/Сумма/Статус; date-desc default; refund rows negative + «Возврат к №N» directly under original on date ties; all columns sortable; № copyable; search by number (delta 2: list DTO now carries number) and partner
- [ ] TXN-2 Status filter uses served enum (Все/Не оплачено/Частично/Просрочено/Оплачено); **Overdue actually served** (delta 1) — create a sale with past due date if possible, or verify on Tenant B aged data; date-range dropdown functions; CSV
- [ ] TXN-3 Detail: header «№N» only (no chips/meta); positions + totals reconcile with list; Информация card (partner link, created, warehouse); financial card (total/paid/remaining/status); payments list links to payment details
- [ ] TXN-4 Immutability: NO edit/delete anywhere on transaction detail (rule 1); Скачать = primary action (may toast not-implemented)
- [ ] TXN-5 **Refund create** (kebab on sale detail): per-line cap = original − already refunded; over-cap inline-blocked; reason MANDATORY; at least one line > 0
- [ ] TXN-6 Refund cumulative: refund 60% then attempt remaining+1 → blocked; remaining exactly → allowed; fully-refunded transaction offers no further refund
- [ ] TXN-7 Refund detail: reference banner links to original (number shown — delta 3); reason displayed; NO refund action on a refund (rule: refunds can't be refunded); refund history card on the original links back
- [ ] TXN-8 **Refund side effects (real backend):** SaleRefund restores stock; partner balance reduced; negative amount in lists; original's refund history updated
- [ ] TXN-9 Supply-refund flow mirrors sale-refund (type matches original)

## 12. ORDERS

- [ ] ORD-1 List: status tabs with live counts; search; date-range; delivery column with overdue(red)/upcoming/done states; CSV; row → detail
- [ ] ORD-2 New Order (/orders/new): client REQUIRED; warehouse REQUIRED (intended, not reserved); source Telegram/OmborWeb (no «Нет»; default OmborWeb); delivery date REQUIRED + time optional; **over-stock flagged «не блокирует» but NEVER blocks** (guidance only); no payment/wallet UI; info note instead of immutability warning; unsaved guard
- [ ] ORD-3 Detail: status stepper; positions; delivery card (+«Просрочена» badge when past); status-history timeline; partner card; financial card; «Склад списания» row hidden until Delivered/Returned
- [ ] ORD-4 State machine via ⋮ (status-dependent actions): Pending→process→ship→deliver; cancel/reject from allowed states only; confirm dialogs on each
- [ ] ORD-5 **Delivery confirm:** warehouse picker (prefilled with intended); per-line stock check **hard-blocks shortfall (rule 20)** — test both shortfall (blocked) and sufficient (proceeds)
- [ ] ORD-6 **Promotion:** delivered order produces a real Sale — «Продажа №N» link opens the real transaction; stock decremented; partner balance updated; sale visible in /sales
- [ ] ORD-7 Edit modal: editable pre-delivery only; intended-warehouse optional with «Не выбран»; edits persist; post-delivery → no edit
- [ ] ORD-8 Terminal states: cancelled/rejected/returned banner; **rejected-order detail does not crash (watch item B2)**; return flow from delivered
- [ ] ORD-9 Overdue delivery: order with past delivery date + pre-delivery status shows red in list + badge in detail

## 13. TEMPLATES

- [ ] TPL-1 List (ExpandableDataTable): name-asc default; search name/partner; type segmented; expand shows line items with product links + footer total; «Использован» populated (delta 6: lastUsedAt now served — verify after using a template in POS); sort/pager
- [ ] TPL-2 Create/edit: name + type toggle (re-prices lines on switch) + partner + product cart (qty/price); discard-changes confirm
- [ ] TPL-3 **Line totals with fixed discounts are correct** (delta 6: discountType now served — the old percent-math × fixed-data negative-totals bug must be gone; check on Tenant B real data + SKU/unit populated in expand rows)
- [ ] TPL-4 Edit/delete allowed (editable basket, not immutable); delete confirm works
- [ ] TPL-5 Template ↔ POS round-trip: save from New Sale, see it here; load in New Supply only if Supply-type (direction filtering)

## 14. PAYMENTS

*Prereq: partner with open debt (from SAL-6 partial), partner with advance (from INT-A), employee (create in EMP first if needed — or defer payroll-type case until after EMP).*

- [ ] PAY-1 List: summary cards (Приход/Расход/count) reflect filtered view; search; type + wallet dropdowns; direction badges ↓/↑ colored no signs; №served (legacy blank-№ gap must be gone); sort/pager; CSV
- [ ] PAY-2 Immutability: no row actions, no edit/delete on detail (rule 1)
- [ ] PAY-3 Create **Оплата**: partner with open transactions → debts banner → settlement modal: outstanding listed, FIFO auto-allocate, manual per-row override, excess → advance; sources = settling allocations (rule 8)
- [ ] PAY-4 Create **Депозит** (advance in): partner advance increases; wallet credited
- [ ] PAY-5 Create **Вывод**: hard-blocked above available advance; at/below → succeeds, advance decreases
- [ ] PAY-6 Create **Зарплата**: employee + wallet + amount; second payment same employee+month ALLOWED (canon)
- [ ] PAY-7 Create **Общий**: direction user-set (Income/Expense); wallet moves accordingly
- [ ] PAY-8 Direction auto-derivation (rule 14): Customer→Income, Supplier→Expense auto; Both-partner → user chooses
- [ ] PAY-9 Detail: header «P-N/№N»; immutability strip; Касса source line; Распределение table (TransactionSettlement / AdvanceCredit / ChangeReturn memo) — allocations sum per rule 8; payroll + general variants render their own layouts; partner row links out
- [ ] PAY-10 After each create: wallet balance, partner balance/advance, transaction paid/remaining all update (served, rule 12) — cross-check on wallet detail + partner ledger + transaction financial card

## 15. DEBTS

- [ ] DBT-1 Summary cards (Нам должны/Мы должны/Просрочено/Чистая позиция) reconcile with the sum of open transactions created so far; first three clickable → transactions tab pre-filtered/sorted (re-click same card re-seeds)
- [ ] DBT-2 По партнёрам tab: grouped rows (partner, chip, txn count, oldest debt + overdue chip, signed-by-color total, |debt| desc); partner link deep-links to partner detail pre-filtered
- [ ] DBT-3 По транзакциям tab: doc № + date, type badge, partner link, total/paid+progress/remaining, age + «просрочка N дн»; row click → transaction detail; direction segmented; age buckets filter (0–7/8–30/31–60/60+ — Tenant B for aged data)
- [ ] DBT-4 Figures are served (remaining/age/overdue) and consistent with transaction detail financial cards + partner balances; CSV
- [ ] DBT-5 Fully-paid transaction disappears from debts; partially-paid shows correct remaining after PAY-3

## 16. WALLETS

*Data: create a 2nd wallet for transfers.*

- [ ] WLT-1 List: summary strip (Общий баланс/Наши средства/Авансы) **includes archived wallets (rule 31)**; search; archive segmented shows-only; type badges; sort name-asc; pager; ⋮ edit/archive only — never delete
- [ ] WLT-2 Create: name + type + opening balance; **edit: type + opening LOCKED (rule 16)**
- [ ] WLT-3 Detail: 3 stat cards served; Операции tab — payment rows link to /payments/:id, «—» for non-payment; direction badges; «Баланс после» running column plausible vs card balance; party links to partner (delta 7: partnerId now served)
- [ ] WLT-4 Операции reflect real events: payments from PAY + POS tenders appear here with correct amounts/directions
- [ ] WLT-5 Transfer create: from→to same-row pickers, from ≠ to; «Доступно» hint + «Перевести всё»; over-balance hard-blocked; after submit BOTH wallets' balances + operation ledgers update
- [ ] WLT-6 Переводы tab lists transfers; read-only detail modal; «Новый перевод» in header, hidden when archived
- [ ] WLT-7 Archive wallet with balance → succeeds, still in totals (rule 31); hidden from payment/POS wallet pickers; restore works
- [ ] WLT-8 Watch item: wallet at negative/zero balance as transfer source — log guard behavior

## 17. EMPLOYEES

- [ ] EMP-1 List: search name/position; status segmented (Все/Активный/В отпуске/Уволен); status badges (green/orange/gray); sort/pager; CSV; ⋮ Выплатить (active only)/Редактировать/Уволить·Восстановить
- [ ] EMP-2 Create/edit: required fields inline; salary via MoneyField; hire date
- [ ] EMP-3 Detail: identity card (avatar/status/position/phone/since); 3 stat cards (salary / paid this month / total payments); header primary Выплатить (or Восстановить when terminated)
- [ ] EMP-4 **Payroll:** Выплатить modal (amount defaults to salary, wallet, month) → payment created (type Зарплата), appears in payroll history table (was only ever tested empty!), in /payments, and wallet debited; period preset filter (Неделя/Месяц/Весь период)
- [ ] EMP-5 Terminate: status change (never delete), confirm dialog; terminated employee keeps history, no Выплатить; restore re-enables
- [ ] EMP-6 Payroll rows link to payment detail; payroll immutable (no edit/delete)

## 18. DASHBOARD

- [ ] DSH-1 Period selector (Сегодня/Неделя/Месяц) re-fetches; header stays mounted during refetch
- [ ] DSH-2 KPI cards navigate: Выручка→/sales; Нам должны/Мы должны/Просрочено→/debts with the right preset applied
- [ ] DSH-3 **Reconciliation:** receivable/payable/overdue figures + top debtors match /debts and partner details (same backend read model); revenue plausible vs created sales
- [ ] DSH-4 Charts render + toggle (lines↔bars; payments diverging bars + wallet filter); aging panel buckets + 31+ banner; recent transactions preview (~8 rows)
- [ ] DSH-5 Fresh Tenant A pre-data: welcome/empty state with 3 first-step cards (test EARLY, right after AUTH, before creating data)
- [ ] DSH-6 Colour-only KPIs — no +/− signs (locked pattern 4)

## 19. SETTINGS

- [ ] SET-1 Section nav scroll-spy; smooth scroll on click
- [ ] SET-2 Организация: edit name/address/phone/email → save bar appears on dirty, persists on save, survives reload; logo upload (>2 MB rejected with message; valid image persists)
- [ ] SET-3 Язык: ru only listed; selection applies immediately (not staged in save bar)
- [ ] SET-4 Валюта: read-only locked UZS + note (rule 33)
- [ ] SET-5 Пользователи: list with «Администратор» chips; invite modal (email/phone validation inline, send never disabled); invited user appears
- [ ] SET-6 Deactivate other user (confirm dialog) → greyed + «Деактивирован» chip; **deactivated user cannot log in**; reactivate restores access; **self-deactivate guarded with toast**; NO delete anywhere (rule 41)

## 20. INT — Cross-module integrity chains (Tenant A, exact amounts)

- [ ] INT-A **Overpay → advance (worked ex. A):** sale 600 000 to partner P; pay 1 000 000, choose Аванс → transaction Оплачено; partner balance 0 + advance 400 000; wallet +1 000 000; payment detail: settlement 600 000 + AdvanceCredit 400 000
- [ ] INT-B **Pay from advance (worked ex. B):** partner P (advance 400 000) gets sale 1 000 000; settle using advance + 600 000 cash → advance 0, balance 0, wallet +600 000, allocations sum 1 000 000. If the UI offers no advance-as-source path, log as finding
- [ ] INT-C **Change return (worked ex. C):** sale 600 000; tender 1 000 000, choose Сдача → wallet +600 000 (NOT 1M); ChangeReturn 400 000 as memo only (excluded from balances); partner balance 0
- [ ] INT-D **Full stock chain:** opening 10 @ 1 000 → supply 10 @ 2 000 (WAC → 1 500) → sale 5 (stock 15, COGS at WAC if visible) → adjustment −2 → transfer 3 to WH2 (WH1=10, WH2=3) → product movements ledger shows all 5 events and end balances reconcile everywhere (product detail, both warehouses, adjustment/transfer lists)
- [ ] INT-E **Order chain:** order → process → ship → deliver (warehouse confirm) → sale created, stock down, debt in /debts, pay it in /payments → debt cleared, dashboard updated
- [ ] INT-F **Refund chain:** sale with payment → partial refund → partner balance + stock adjusted; /debts and dashboard consistent
- [ ] INT-G **Multi-tenant isolation (delta 12):** every list on Tenant A shows ONLY Tenant A data (and vice versa on B); direct URL to a Tenant B entity id while logged into A (partner/transaction/payment/wallet) → 404/error, never data
- [ ] INT-H Two-session consistency: change data as Tenant A in one tab, reload another tab — served figures fresh (no stale client caches)

## 21. DLT — Backend-delta verification (were open, owner says implemented)

- [ ] DLT-1 TransactionStatus serves Overdue (covered in TXN-2)
- [ ] DLT-2 Transaction list DTO carries number → list № + search work (TXN-1)
- [ ] DLT-3 Refunds serve originalTransactionNumber (TXN-7)
- [ ] DLT-4 Movement counterparty ids → links (TRF-4)
- [ ] DLT-5 Opening stock accepts note (WH-3)
- [ ] DLT-6 TemplateDto lastUsedAt + item sku/measurement/discountType (TPL-1/3)
- [ ] DLT-7 WalletOperationDto partnerId → party links (WLT-3)
- [ ] DLT-8 Product create unblocked, no RetailPrice constraint (PRD-2)
- [ ] DLT-9 Seed partner shape (AUTH-4)
- [ ] DLT-10 Invalid OrderSource → 400 not 500 (only if triggerable via devtools; else skip)
- [ ] DLT-11 Password-reset endpoints live (AUTH-8)
- [ ] DLT-12 Payments scoped by OrganizationId (INT-G)

---

## Findings log

> Append during execution. No fixes this session.

| ID | Sev | Module | Case | Summary | Repro / expected vs actual |
|----|-----|--------|------|---------|----------------------------|
| F-01 | S4 | AUTH | AUTH-1 | Terms-checkbox required-error is color-only (red border), no text message like other fields | Register, fill all valid, leave terms unchecked, submit → blocked with generic banner but the checkbox shows only a red border, no «Обязательное поле». Minor WCAG color-only concern; other fields get a text error. |
| F-02 | S3 | AUTH | AUTH-6 | Login with invalid credentials returns HTTP **500** (not 401/400) | `POST /api/auth/login` wrong creds → `{"status":500,"detail":"Invalid phone number or password."}`. **UI impact verified benign** — login form shows a clean «Неверный номер или пароль…» banner, no offline banner. Remaining issue: backend should return **401**; as a 500 every failed login logs a false Sentry "server error". Backend-side delta. |
| F-06 | S4 | Partners | AUTH-4/PTR-1 | Partners summary cards show explicit «+0UZS» / «−0UZS» signs (incl. negative-zero) | Possible tension with locked pattern 4 (no +/− on money — colour only). These are labeled directional totals (Всего к получению / к оплате), so may be intentional. Verify against design; if a violation, drop the signs. |
| F-07 | S3? | Supply/Sale POS | SUP-2/SAL-3 | Line fixed-discount toggle labeled «Фиксированная сумма **за единицу**» (per-unit) | CLAUDE.md documents line fixed-discount as **per-line currency** (canon rule 37, flagged deviation from the prototype's per-unit). The tooltip says «за единицу» = per unit. Verify whether the label is stale or the math actually applies per-unit (test: fixed discount on qty>1). |
| F-08 | S2 | Wallets | INT-A | **Wallet «Авансы партнёров» / «Наши средства» don't reflect an overpayment-created advance** | Overpay a sale (tender 1M on a 600k sale → 400k advance). Partner ledger + payment allocation both correctly show the 400 000 advance (AdvanceCredit), but the holding wallet «Касса» shows **Авансы 0** and **Наши средства 1 000 000** (should be 400 000 / 600 000). Server-computed figures disagree across views (rule 8/11/12) — «Наши средства» overstates unencumbered cash by the advance. Backend wallet-aggregation gap. |
| F-09 | S4 | Payments | PAY-9 | Payment detail «Создал» (created-by) is empty | `/payments/5623` Информация shows a «Создал» row with no name (transaction detail shows «Алишер Тестов» fine). Payment createdBy not populated/rendered. |
| F-10 | **S1 → FIXED** | Refunds | TXN-5 | **Refund create omitted required `WarehouseId` → every refund failed with 400** | `POST /api/transactions` (SaleRefund) sent Type/PartnerId/OriginalTransactionId/RefundReason/Lines but **no WarehouseId**; backend → 400 «A warehouse (WarehouseId) is required». Refunds (business-rules §A correction flow) were completely broken. Root cause: `TransactionRecord` dropped the served `warehouseId` (only kept `warehouseName`), so `TransactionStore.createRefund` couldn't send it. **Fixed this session:** carry `warehouseId` through the record (`models/transaction.ts`, `TransactionApi` raw type + `toRecord`), add it to `CreateTransactionRefundRequest`, append `WarehouseId` in the refund branch of `TransactionApi.create`, and pass `transaction.warehouseId` (guarded) in `createRefund`. `tsc` clean. Verified live: refund 201, SR-1930 created, −240 000, reason shown, **stock restored 150→170**. |
| F-11 | S3 | Debts/Dashboard | DBT-4 | **Opening-balance debts excluded from /debts** (and dashboard) → understates vs partner balances | Магазин Дилноза owes 500 000 via opening balance — Partners shows «Всего к получению +500 000», but /debts «Нам должны» = **0** (only unpaid *transactions* are aggregated). Two views of "who owes us" disagree; the debt-derived dashboard «Нам должны» would also understate. Verify against canon whether opening-balance receivables/payables should count as debts. Not fixed (identify-only). |
| F-12 | S3 | Orders | ORD-1/3 | Order «number» is an unfriendly GUID fragment «№11D9CD2E59» | Orders show a 10-char hex id as the number (vs friendly «№S-1929» for sales). Orders use GUID PKs and the backend serves no sequential order number. Confusing to reference verbally; verify whether backend should serve a human order number. Identify-only. |
| F-13 | S4 | Orders | ORD-5 | Delivery-confirm dialog emits ~5 console warnings on open | Opening «Подтвердить доставку» logged 5 warnings (likely React key/controlled-input). No functional impact seen; worth a look. |
| F-14 | S3 | Employees | EMP-2 | **Hire date = today is rejected as «Дата найма не может быть в будущем»** | New-employee modal defaults «Дата найма» to today (2026-07-05) but validation flags it as future → the default create is blocked; user must pick an earlier date. Date-boundary/timezone off-by-one (input date at local/UTC midnight vs now). Workaround exists (earlier date) so not fixed. |
| F-15 | S4 | Employees | EMP-4 | Payroll modal «Сумма» doesn't pre-fill with the employee's salary | «Создать выплату» leaves amount empty though the plan/design expects it defaulted to the monthly salary. Minor convenience gap. |
| F-16 | S2 | Employees | EMP-4 | **Employee detail hangs on a loading spinner after creating a payroll** | After «Выплатить»→Сохранить (POST 201), the detail replaces content with a spinner and never re-renders (no re-fetch fired; `isLoading` not reset). Data is saved — a manual reload shows it correctly. User sees an apparent hang and may retry → duplicate payroll risk. |
| F-17 | S3 | Payments/Wallets | PAY-6 | Payroll (and likely other payments) can overdraw a wallet to negative with no check | 3 000 000 payroll paid from Касса (balance 1 000 000) drove it to **−2 000 000**; no over-balance validation. A cash wallet going negative is questionable (contrast the transfer modal's over-balance guard). Verify intended. Relates to the WAL negative-balance watch item. |
| F-18 | S3 | AUTH (backend) | AUTH-9 | Register/login **business errors return HTTP 500** instead of 4xx | Duplicate-phone register → 500 «User with this phone number already exists.» (should be 409/400); bad-creds login → 500 (F-02). Backend maps domain failures to 500 → Sentry noise + (for register) the FE silently swallows it (F-03), so the user sees nothing. Backend contract fix + FE surface the message. |
| F-19 | S3 | Shell/Auth | SHL-6 | **Reload while the backend is unreachable logs the user out** (→ /login) | With the backend down, a full page reload/navigation runs the boot refresh-token, which fails with a network error and the guard redirects to `/login` — the session is dropped and no offline indication is shown. A transient outage on refresh shouldn't discard the session (network error ≠ invalid token). Consider keeping the session + showing the offline banner instead of bouncing to login. |
| F-20 | S2 | Auth | SHL-6 | **Login during a backend outage shows «Неверный номер или пароль»** (misleading) | Backend down → login POST fails `ERR_CONNECTION_REFUSED`, but the form shows the wrong-credentials banner (it maps ALL errors to invalid-creds) — no «Сервер недоступен». During an outage users are told their password is wrong → needless retries/password resets. The login form should distinguish a network/5xx failure from a 401 and show a connection error. |
| F-21 | S2 | Products | PRD-3 | **Product-create validation errors (duplicate SKU) are silently swallowed** | Create with an existing SKU (CHOC-100) → backend 400 «A product with the same SKU already exists», but the modal stays open with **no inline SKU error and no toast** — user gets zero feedback and can't tell why it won't save. Same class as F-03 (register). Surface the backend field error. |
| F-22 | S4 | Products | PRD-4 | Margin badge basis looks inconsistent (WAC vs supply price) | Before edit: Маржа 3 000/33.3% = (sale 12 000 − WAC 9 000)/9 000. After editing sale→13 000: Маржа 5 000/62.5% = (13 000 − supply 8 000)/8 000 — i.e. it recomputed off the supply price, not WAC. Verify the intended margin formula (one basis). Cosmetic. |
| F-23 | S3 | Wallets | WLT-8 | **Overdrawn wallet can't transfer out** (guard blocks all transfers from a negative balance) | Transfer modal from Касса (balance −2 000 000): «Доступно: −2 000 000», amount field invalid even at 0, «нельзя перевести больше остатка». So a wallet that has gone negative (possible via **F-17**) is stuck — you can't move money out to fix it. The available-balance guard should clamp to `max(0, balance)` (or allow transfers when negative). Confirms the pre-flagged latent bug. |
| F-24 | S2 | Templates | TPL-3 | **Template line totals treat a FIXED discount as a percent → absurd negative totals** (delta-6 confirmed, now unblocked) | Seeded (via API) a template item `discount:5000` which the backend stores as `discountType:"Fixed"`; the list renders **Сумма −637 000** = 13 000×(1 − 5000/100) instead of the correct 13 000 − 5 000 = **8 000**. Root: the FE `TemplateItem` model (`models/template.ts`) **omits the served `discountType`**, so the line-total math always assumes percent. **The backend NOW serves `discountType:"Fixed"`** (verified in the POST response), so the CLAUDE.md "deferred until the contract defines semantics" reason is gone — fix = add `discountType` to the model + honour it in the total computation. (Not UI-creatable — the template modal has no discount field; affects API/legacy/imported templates, e.g. the deployed data where this was first seen.) |
| F-03 | S2 | AUTH | AUTH-1 | Register **server-error (500) is silently swallowed** — no user-facing feedback | Submit a valid register form when the backend returns 500 → button re-enables, form sits unchanged, **no toast / banner / inline error**. User gets zero indication the registration failed. Violates "failures must surface a message". (Seen when register 500s.) FE error-handling gap on the register step. |
| F-04 | S2 | AUTH/shell | AUTH-3, all pages | **Non-Latin user names render as mojibake** (avatar «Ð», user menu «ÐÐ»Ð¸ÑÐµÑ» for "Алишер") | Root cause `src/stores/AuthStore.ts:39` — `JSON.parse(atob(token.split(".")[1]…))` decodes the JWT payload as Latin-1, mangling UTF-8 Cyrillic name claims. Org name (REST JSON) is fine; only JWT-sourced user name is broken. Affects avatar initial (every page) + user menu for every Cyrillic/Russian name. Fix: UTF-8-aware base64 decode (`TextDecoder` over `Uint8Array.from(atob(b64), c=>c.charCodeAt(0))`). Not fixed this session (out of the granted scope). |
| F-05 | **S1 → FIXED** | AUTH | AUTH-2 | **OTP verification omitted required `X-Ombor-Language` header → registration impossible** | `POST /api/auth/verification` requires `X-Ombor-Language ∈ {ru,uz-Latn,uz-Cyrl}` but `AuthApi.verifyPhone` didn't send it → always 400 regardless of code, and the FE masked it as «Введите 4-значный код». **Fixed this session:** extracted `withLanguage()` helper in `AuthApi.ts`, applied to `verifyPhone` + register + the reset trio. Verified live: verification → 200, welcome screen reached. (User authorized this fix.) |
| ~~BLOCKER-1~~ | RESOLVED | AUTH (env) | — | Backend SMS-provider token was expired → register 500 | User renewed the token; register now 200. (Was: `"SMS provider request failed … {"message":"Expired"}"`. Both `organizationName`/`tenantName` shapes hit the same SMS step, so the field-name mismatch is NOT a blocker.) |

## Progress tracker

| Phase | Status | Notes |
|-------|--------|-------|
| P0 Preflight | ✅ | all delta endpoints exist; SMS token expired at start (user renewed; expired AGAIN mid-session) |
| 1 AUTH | ✅ (8/9) | **fixed F-05** verification header; register/OTP/login/logout/guards/persistence/seeds/duplicate ✅; **AUTH-8 reset BLOCKED** (SMS token expired) |
| 2 SHELL | ✅ | collapse/auto-collapse/create-menu/nav/topbar ✅; SHL-1 persistence + SHL-5 404 light; **SHL-6 offline = deferred (needs backend stop)** |
| 3 CAT | ✅ | list + **delete-gating (rule 32)** ✅; create/edit not re-run (seed used) |
| 4 PRD | ✅ | list/create/**delta-8**/measurement-enum/detail/**archive** ✅; F-06 |
| 5 WH | ✅ | **opening stock + WAC** ✅; edit/delete-gate/archive not re-run |
| 6 ADJ | ✅ | **rule-20 block + real stock decrement + immutability** ✅ |
| 7 TRF | ✅ | 2nd warehouse created; **rule-20 block + atomic move (both warehouses) + WAC carried** ✅ |
| 8 PTR | ✅ | create (both types + opening balance)/detail/**ledger**/balance ✅ |
| 9 SAL | ✅ | POS/**rule-20**/**settlement INT-A**/stock ✅ |
| 10 SUP | ✅ | POS/**WAC recalc**/payable ✅ |
| 11 TXN | ✅ | detail immutability + **refunds (fixed F-10)** ✅ |
| 12 ORD | ✅ | **full chain + promotion→sale INT-E** ✅; F-12/13 |
| 13 TPL | ✅ | list + create ✅ (ExpandableDataTable/badge/link); edit/delete/load light |
| 14 PAY | ✅ (mostly) | list/detail/**allocation**/payroll/**debts-banner** ✅; Депозит/Вывод/Общий create not completed |
| 15 DBT | ✅ | reconciliation ✅; F-11 |
| 16 WLT | ✅ (mostly) | list/detail/operations ✅ (**F-08**); transfer create NOT reached (1 wallet) |
| 17 EMP | ✅ | create/detail/**payroll** ✅; **F-14/15/16/17** |
| 18 DSH | ✅ | empty state + **with-data reconciliation** ✅ |
| 19 SET | ✅ | org-edit-save/currency/users/self-guard ✅; language-propagation skipped (owner) |
| 20 INT | ✅ | INT-A/D(partial)/E ✅; **INT-G isolation SECURE** ✅ |
| 21 DLT | ✅ | DLT-1..9,11,12 confirmed via the above (11 = still blocked by SMS) |
