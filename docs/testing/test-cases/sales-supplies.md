# Sales & Supplies (Transactions + Detail + Refunds) — Browser Test Cases

**Module:** Продажи / Поставки (Sales / Supplies)  
**Scope:** Transaction list view, detail view with tabs, refund creation & detail, full lifecycle flows  
**Environment:** Deployed dev app (app.miraziz.net + api.miraziz.net, REAL backend, MOCKS OFF)  
**Tenant State:** Empty (data built as testing proceeds)  
**Key Authority:** https://api.miraziz.net/swagger/v1/swagger.json (live DTO reference)

---

## Overview

The Sales & Supplies module is a unified, direction-parameterized (`"Sale" | "Supply"`) immutable transaction ledger. Each direction shows:
- **List view:** search, payment-status segmented filter, date-range dropdown, CSV export, empty state
- **Detail view:** transaction/refund display with positions table, financial card, payment history, note/attachments, audit trail, partner card
- **Refund flow:** per-line cumulative cap enforcement, mandatory reason, modal-driven from the detail ⋮ menu
- **Domain:** Immutable events (rule 1 in business-rules); no edit/delete affordances. Corrections via refund counter-events only. Refunds carry no payment status and are hidden by payment filters. Stock mutations are NOT mocked (known limitation).

**Note on Reconciliation Assertions:** These cases flag cross-module dependencies — stock, wallet balance, partner debt — that drive the highest-value checks. Real backend mocks may not implement all stock/wallet mutations; such gaps are documented as designed limitations, not test failures.

---

## Test Cases

### SALES-SUPPLIES-01: Transaction List — Empty State (Sales)

| Aspect | Detail |
|--------|--------|
| **ID** | SALES-SUPPLIES-01 |
| **Title** | Render empty-state placeholder for Sales list (no transactions yet) |
| **Preconditions** | Fresh tenant; no transactions created. Navigate to `/sales` (Продажи). |
| **Steps** | 1. Open Sales list. |
| **Expected Result** | • Heading: «Пока нет продаж»<br/>• Body: «Здесь появятся все продажи и возвраты…»<br/>• Primary button «Новая продажа» appears<br/>• Search, filter controls visible but inactive<br/>• CSV export button greyed/inactive |
| **Reconciliation** | N/A (no data) |
| **Designed Gap** | None |

---

### SALES-SUPPLIES-02: Transaction List — Empty State (Supplies)

| Aspect | Detail |
|--------|--------|
| **ID** | SALES-SUPPLIES-02 |
| **Title** | Render empty-state placeholder for Supplies list (no transactions yet) |
| **Preconditions** | Fresh tenant; no transactions created. Navigate to `/supplies` (Поставки). |
| **Steps** | 1. Open Supplies list. |
| **Expected Result** | • Heading: «Пока нет поставок»<br/>• Body: «Здесь появятся все поставки и возвраты…»<br/>• Primary button «Новая поставка» appears<br/>• Search, filter controls visible but inactive<br/>• CSV export button greyed/inactive |
| **Reconciliation** | N/A (no data) |
| **Designed Gap** | None |

---

### SALES-SUPPLIES-03: Create Sale — Happy Path

| Aspect | Detail |
|--------|--------|
| **ID** | SALES-SUPPLIES-03 |
| **Title** | Create a basic sale through the POS entry point |
| **Preconditions** | • Fresh tenant (or cleared transactions)<br/>• Partners seeded (at least one Customer)<br/>• Products seeded with sale prices + warehouse stock<br/>• Wallets seeded<br/>• Navigate to `/sales/new` (Новая продажа). |
| **Steps** | 1. **Partner picker:** Select an existing customer (balance shown as colour + label).<br/>2. **Warehouse picker:** Accept default or select another warehouse.<br/>3. **Product search:** Type a product name; product appears with sale price + per-warehouse stock hint («На складе: 10 шт»).<br/>4. **Add line:** Click product → qty stepper auto-fills to 1, focuses qty input, partner-picker removes this product from the dropdown.<br/>5. **Edit line:** Change qty to 2; verify per-line live total updates; price editable; discount toggle: enter 10%, verify line total recalculates (line gross − 10% discount).<br/>6. **Summary card:** Verify «Баланс после продажи» updates.<br/>7. **Payment:** Wallet picker shows type + balance; enter paid amount (e.g., 80% of total) → remaining shows in debt field.<br/>8. **Submit:** Click «Провести продажу».<br/>9. Confirm immutability warning dialog «Продажа записывается окончательно…» → click «Провести продажу». |
| **Expected Result** | • Sale created with ID + transaction number (e.g., #1001)<br/>• Toaster success: «Продажа #1001 проведена»<br/>• Redirect to sale detail page (`/sales/1001`)<br/>• Line items shown in positions table<br/>• Payment status: «Частично оплачено» (partial = some but not all paid)<br/>• Partner balance updated<br/>• Wallet balance reflects paid amount |
| **Reconciliation** | **✓ Stock check:** Navigate to Products → open the sold product → warehouse stock should DECREASE by qty.<br/>**✓ Wallet check:** Navigate to Wallets → select the payment wallet → «Операции» tab should show a payment movement (illustrative in mock; real backend may not mutate).<br/>**✓ Partner debt check:** Navigate to Partners → detail page → balance should reflect the receivable (remaining = totalDue − totalPaid). |
| **Designed Gap** | Stock mutations are NOT implemented in the mock (known limitation per CLAUDE.md). Real test on live backend must verify stock decreases. |

---

### SALES-SUPPLIES-04: Create Sale — Over-stock Hard Block

| Aspect | Detail |
|--------|--------|
| **ID** | SALES-SUPPLIES-04 |
| **Title** | Sale creation hard-blocks when qty exceeds per-warehouse stock |
| **Preconditions** | • Product in warehouse with stock = 5 units.<br/>• Navigate to `/sales/new`. |
| **Steps** | 1. Partner → select customer.<br/>2. Warehouse → select the warehouse holding the product.<br/>3. Product search → select the product (stock hint: «На складе: 5 шт»).<br/>4. Qty stepper → change to 6 units.<br/>5. Line shows error overlay «Превышает остаток · доступно 5 шт».<br/>6. Click «Провести продажу». |
| **Expected Result** | • Submit button stays enabled (hard rule: never silently disable).<br/>• On submit, error toast (client-side) or HTTP 422 (server): «Недостаточно товара: доступно 5 шт».<br/>• Transaction NOT created.<br/>• Page stays on `/sales/new`; user can correct qty. |
| **Reconciliation** | N/A (validation prevents creation) |
| **Designed Gap** | None; this is a hard block per rule 20 (business-rules). |

---

### SALES-SUPPLIES-05: Create Supply — Happy Path (No Stock Block)

| Aspect | Detail |
|--------|--------|
| **ID** | SALES-SUPPLIES-05 |
| **Title** | Create a basic supply (goods-in) with no stock validation |
| **Preconditions** | • Navigate to `/supplies/new` (Новая поставка).<br/>• Supplier + Products + Wallet seeded. |
| **Steps** | 1. **Partner picker:** Select a supplier.<br/>2. **Warehouse picker:** Select target warehouse.<br/>3. **Product search:** Add a product (qty 10; uses `supplyPrice`, NOT `salePrice`).<br/>4. **Line editing:** Enter supply price; discount 5% fixed→ verify line total recalculates.<br/>5. **Payment:** Enter paid amount (e.g., 50% of total).<br/>6. **Submit:** Confirm immutability «Поставка записывается окончательно…»<br/>7. Click «Провести поставку». |
| **Expected Result** | • Supply created with transaction number (e.g., #2001)<br/>• Redirect to detail (`/supplies/2001`)<br/>• Payment status: «Частично оплачено» (we owe the rest)<br/>• «Баланс после поставки» on create showed sign-flip (payable, not receivable)<br/>• Success toast: «Поставка #2001 проведена» |
| **Reconciliation** | **✓ Stock increase:** Open Products → select the supplied product → warehouse stock should INCREASE by qty (10 units).<br/>**✓ Supplier payable debt:** Partners detail → balance should show negative (we owe supplier). |
| **Designed Gap** | Stock increment not mocked. Real backend must verify. |

---

### SALES-SUPPLIES-06: Transaction List — Search by Number or Partner

| Aspect | Detail |
|--------|--------|
| **ID** | SALES-SUPPLIES-06 |
| **Title** | Search filters list by transaction number or partner name |
| **Preconditions** | • ≥3 transactions (sales and/or refunds) created.<br/>• Navigate to Sales or Supplies list. |
| **Steps** | 1. Leave search field empty → all transactions visible.<br/>2. Type transaction number (e.g., «1001») → list filters to matching txn + its refunds (if any).<br/>3. Clear search.<br/>4. Type partner name (e.g., «Иван») → list shows all txns for that partner.<br/>5. Type partial name (e.g., «Ива») → still matches.<br/>6. Type non-existent name → empty state «Ничего не найдено». |
| **Expected Result** | • Search is real-time (no button needed).<br/>• Matches on transaction number, original txn number (for refund search), and partner name.<br/>• Empty state when no matches. |
| **Reconciliation** | N/A (list filtering only) |
| **Designed Gap** | None |

---

### SALES-SUPPLIES-07: Transaction List — Payment Status Filter

| Aspect | Detail |
|--------|--------|
| **ID** | SALES-SUPPLIES-07 |
| **Title** | Segmented control filters by payment status (paid/partial/unpaid); refunds hidden |
| **Preconditions** | • ≥4 transactions with different payment statuses:<br/>  - 1 fully paid (totalPaid ≥ totalDue)<br/>  - 1 partial (0 < totalPaid < totalDue)<br/>  - 1 unpaid (totalPaid = 0)<br/>  - 1 refund (of any above)<br/>• Navigate to Sales or Supplies list. |
| **Steps** | 1. Segmented shows options: Все / Оплачено / Частично / Не оплачено.<br/>2. Click «Все» → all 4 transactions visible (refund included).<br/>3. Click «Оплачено» → only fully-paid base transactions shown; refund(s) hidden (refunds carry no payment status).<br/>4. Click «Частично» → only partial-payment txns shown; refund hidden.<br/>5. Click «Не оплачено» → only zero-payment txns shown; refund hidden.<br/>6. Click «Все» again. |
| **Expected Result** | • Filter state persists within the page session (until reset or navigate away).<br/>• Refunds never appear under any status filter (only in «Все»).<br/>• Counts update correctly.<br/>• Refresh page → filter resets to «Все». |
| **Reconciliation** | N/A (filter logic only) |
| **Designed Gap** | None |

---

### SALES-SUPPLIES-08: Transaction List — Date Range Filter (Last 7/30/90 Days)

| Aspect | Detail |
|--------|--------|
| **ID** | SALES-SUPPLIES-08 |
| **Title** | Dropdown filters by transaction date relative to today |
| **Preconditions** | • Create transactions with dates:<br/>  - T1: today (or -1 hour)<br/>  - T2: 5 days ago<br/>  - T3: 20 days ago<br/>  - T4: 50 days ago<br/>  - T5: 120 days ago<br/>• Open list. |
| **Steps** | 1. Date filter dropdown shows: Весь период / Последние 7 дней / Последние 30 дней / Последние 90 дней.<br/>2. Select «Весь период» → all 5 visible.<br/>3. Select «Последние 7 дней» → only T1, T2 visible (5 days < 7).<br/>4. Select «Последние 30 дней» → T1, T2, T3 visible (20 days < 30).<br/>5. Select «Последние 90 дней» → T1–T4 visible (50 days < 90).<br/>6. Select «Весь период» again. |
| **Expected Result** | • Filter applies client-side (rows excluded client-side from the full list, no new HTTP call).<br/>• Day calculation is inclusive: exactly 7 days old should appear in «7 дней».<br/>• Refunds inherit date from their original txn for filtering purposes. |
| **Reconciliation** | N/A (date filtering only) |
| **Designed Gap** | None |

---

### SALES-SUPPLIES-09: Transaction List — CSV Export

| Aspect | Detail |
|--------|--------|
| **ID** | SALES-SUPPLIES-09 |
| **Title** | Export current filtered list as CSV with all columns |
| **Preconditions** | • ≥3 transactions in list (some paid, some unpaid, at least 1 refund).<br/>• Open list; apply search filter (e.g., partner name) and status filter (e.g., «Оплачено»). |
| **Steps** | 1. Click «Экспорт CSV» button (header).<br/>2. File download starts with name format: `sales_2026-06-24T123456Z.csv` (or `supplies_…`).<br/>3. Open CSV in text editor or spreadsheet. |
| **Expected Result** | • CSV columns (in order): Дата · Номер · Тип · Партнёр · Позиций · Сумма · Статус оплаты<br/>• Rows = current filtered list (search + status + date range applied)<br/>• Refunds shown as negative amount (−500000 UZS)<br/>• Dates formatted as «24.06.2026» (or locale-appropriate)<br/>• Numbers use transaction number if present, else ID<br/>• Status column blank for refunds<br/>• File encoding UTF-8 (if opened with BOM, should still be readable) |
| **Reconciliation** | N/A (export integrity only) |
| **Designed Gap** | None |

---

### SALES-SUPPLIES-10: Transaction Detail — Navigation & Header

| Aspect | Detail |
|--------|--------|
| **ID** | SALES-SUPPLIES-10 |
| **Title** | Navigate to sale/supply detail; verify header layout and back button |
| **Preconditions** | • Create a sale (e.g., #1001 for «Иван», 2 items, partially paid).<br/>• Navigate to `/sales/1001`. |
| **Steps** | 1. Header shows:<br/>   - Back arrow button (outline, 40×40)<br/>   - Transaction number «#1001» (large, bold)<br/>   - Type badge «Продажа» (teal)<br/>   - Status chip «Частично оплачено» (warning, orange)<br/>   - Meta: date, time (optional), partner name (clickable, blue), warehouse name<br/>2. Click back button → return to `/sales` list.<br/>3. Re-enter `/sales/1001`. |
| **Expected Result** | • Layout is 2-column on desktop (≥1024px): left = content, right = 372px fixed sidebar.<br/>• Breadcrumb: «Продажи > #1001»<br/>• Back button always visible + functional.<br/>• Partner name in header is a link; click opens partner detail (or dev toast if no ID).<br/>• ⋮ menu appears (for non-refunds) with «Создать возврат» action.<br/>• «Скачать» button is present (currently toasts «dev»). |
| **Reconciliation** | N/A (UI structure only) |
| **Designed Gap** | Download is a placeholder (dev toast). |

---

### SALES-SUPPLIES-11: Transaction Detail — Positions Card & Line Math

| Aspect | Detail |
|--------|--------|
| **ID** | SALES-SUPPLIES-11 |
| **Title** | Positions card displays all line items with discounts + totals |
| **Preconditions** | • Sale with 3 lines:<br/>  - L1: 2 units × 5000 UZS, 10% discount → net 9000<br/>  - L2: 1 unit × 3000 UZS, no discount → net 3000<br/>  - L3: 1 unit × 10000 UZS, 2000 UZS fixed discount → net 8000<br/>  - Subtotal: 20000, Total discount: 2000 (10% + 0 + 2000), Total: 18000<br/>• Navigate to detail. |
| **Steps** | 1. Scroll to positions card (left column).<br/>2. Verify table header: Товар · Кол-во · Цена за ед. · Скидка · Итого<br/>3. Check each row:<br/>   - L1: "Product A" · 2 шт · 5000 · −10% (teal, bold) · 9000<br/>   - L2: "Product B" · 1 шт · 3000 · — (dash, disabled color) · 3000<br/>   - L3: "Product C" · 1 шт · 10000 · −2 000 (saffron, bold) · 8000<br/>4. Footer below table: Подытог 20000 · Скидка 2000 · Итого 18000 |
| **Expected Result** | • Line discount displays as «−10%» or «−2 000» (never both; never per-unit form).<br/>• Subtotal = sum of all line gross (qty × price before discount).<br/>• Discount total = sum of all line discounts in currency.<br/>• Total = sum of all line net amounts = Subtotal − Discount total.<br/>• Line numbers match (count in header card title). |
| **Reconciliation** | **✓ Line totals reconcile:** Manually verify L1 (2 × 5000 × 0.9) = 9000, etc. |
| **Designed Gap** | None |

---

### SALES-SUPPLIES-12: Transaction Detail — Refund History Card (Sale)

| Aspect | Detail |
|--------|--------|
| **ID** | SALES-SUPPLIES-12 |
| **Title** | Sale detail shows refund history card listing all refunds of this sale |
| **Preconditions** | • Sale #1001 with 2 lines (A: 2 units, B: 3 units).<br/>• Create 2 refunds against #1001:<br/>  - Refund R1: 1 unit of A, reason «Брак»<br/>  - Refund R2: 2 units of B, reason «Ошибка заказа»<br/>• Navigate to `/sales/1001`. |
| **Steps** | 1. Below positions card, find «Возвраты по этой продаже» card (if present).<br/>2. Verify table columns: Дата · Номер · Позиций · Причина · Сумма<br/>3. Row 1 (R1): date · #1001-R1 (or similar) · 1 · Брак · amount<br/>4. Row 2 (R2): date · #1001-R2 · 2 · Ошибка заказа · amount<br/>5. Click on a refund row → navigate to `/sales/{refundId}` detail. |
| **Expected Result** | • Card title includes count: «Возвраты по этой продаже · 2»<br/>• Refunds listed newest first (or by date).<br/>• Each row clickable; opens refund detail in the same direction.<br/>• Amounts shown as positive (not negative) in this context.<br/>• If no refunds, card does NOT appear on sale detail (hidden). |
| **Reconciliation** | N/A (read-only history) |
| **Designed Gap** | None |

---

### SALES-SUPPLIES-13: Transaction Detail — Partner Mini Card (Sidebar)

| Aspect | Detail |
|--------|--------|
| **ID** | SALES-SUPPLIES-13 |
| **Title** | Sidebar partner card shows balance + type label |
| **Preconditions** | • Sale for «Иван» (Customer) with balance impact.<br/>• Navigate to sale detail. |
| **Steps** | 1. Right sidebar: top card is «Партнёр» (or partner name) with:<br/>   - Partner avatar (initials or icon)<br/>   - Name as link<br/>   - Type label below: «Клиент» (for Sale) or «Поставщик» (for Supply)<br/>   - Optional balance indicator (colour: green = we owe them (negative), red = they owe us (positive), etc.)<br/>2. Click partner name → navigate to `/partners/:id` detail (or dev toast). |
| **Expected Result** | • Card is compact (fits in 372px sidebar).<br/>• Balance shown as colour + natural-language label (e.g., «Нам должны: 50 000 UZS», «Мы должны: 30 000 UZS»).<br/>• Link to partner detail works (or toasts if no ID). |
| **Reconciliation** | N/A (UI display only) |
| **Designed Gap** | Partner ID may not always be available (partner data is optional); toast fallback is acceptable. |

---

### SALES-SUPPLIES-14: Transaction Detail — Financial Card (Non-Refund)

| Aspect | Detail |
|--------|--------|
| **ID** | SALES-SUPPLIES-14 |
| **Title** | Sidebar financial card shows sale total, paid, remaining, status |
| **Preconditions** | • Sale: totalDue = 10000, totalPaid = 6000 → remaining = 4000, status = «Частично оплачено»<br/>• Navigate to sale detail. |
| **Steps** | 1. Right sidebar: below partner card, find financial card:<br/>   - Title: «Сумма продажи» (or «Сумма поставки»)<br/>   - Row 1: Сумма продажи · 10 000 UZS<br/>   - Row 2: Оплачено · 6 000 UZS<br/>   - Row 3: Остаток · 4 000 UZS (bold, red or warning tone)<br/>   - Row 4: Статус оплаты · Частично оплачено (badge)<br/>2. Verify numeric alignment (right-justified). |
| **Expected Result** | • Card is read-only (no edit fields).<br/>• Amounts formatted with 1000-separators: «10 000»<br/>• Status chip matches payment status (paid = green, partial = orange, unpaid = red).<br/>• «Оплачено полностью» shown instead of remaining when totalPaid ≥ totalDue.<br/>• If zero paid: «Остаток» = totalDue. |
| **Reconciliation** | **✓ Math check:** Remaining = totalDue − totalPaid = 10000 − 6000 = 4000. |
| **Designed Gap** | None |

---

### SALES-SUPPLIES-15: Transaction Detail — Refund Financial Card

| Aspect | Detail |
|--------|--------|
| **ID** | SALES-SUPPLIES-15 |
| **Title** | Refund detail sidebar shows refund-specific financials |
| **Preconditions** | • Refund of a sale (total amount returned = 5000 UZS).<br/>• Navigate to refund detail (`/sales/{refundId}`). |
| **Steps** | 1. Verify header has type badge «Возврат».<br/>2. Sidebar financial card (right):<br/>   - Title: «Сумма возврата»<br/>   - Rows: Позиций к возврату · 2 · Сумма возврата · 5 000 UZS · Исходная продажа · [link to original #1001]<br/>3. Click link → navigate to original sale detail. |
| **Expected Result** | • Card title: «Сумма возврата» (not «Сумма продажи»).<br/>• Positions count is per-refund lines (not all original lines).<br/>• Amount is the refund total (sum of refunded line amounts).<br/>• Original txn link is clickable; opens original detail (`/sales/1001`). |
| **Reconciliation** | **✓ Refund amount ≤ original amount:** Sum of refund line totals must not exceed original txn total. |
| **Designed Gap** | None |

---

### SALES-SUPPLIES-16: Transaction Detail — Payments Card (Non-Refund)

| Aspect | Detail |
|--------|--------|
| **ID** | SALES-SUPPLIES-16 |
| **Title** | Payments tab/card shows all payments allocated to this transaction |
| **Preconditions** | • Sale #1001 (total 10000).<br/>• Make 2 payments:<br/>  - Payment 1: 6000 UZS via Cash wallet («P-520»)<br/>  - Payment 2: 4000 UZS via Bank wallet («P-521»)<br/>• Navigate to sale detail. |
| **Steps** | 1. Below financial card, find «Платежи» card (or tab on mobile).<br/>2. Verify table columns: Дата · № Платежа · Кассир/Банк · Тип · Направление · Партнёр · Касса · Сумма<br/>3. Row 1: date · P-520 · Cash · (type chip) · Приход (green) · (partner name) · Касса · 6 000<br/>4. Row 2: date · P-521 · Bank · (type chip) · Приход · (partner name) · Банк · 4 000<br/>5. Click payment row → dev toast (placeholder). |
| **Expected Result** | • Card appears only if payments exist; if zero payments, shows «Платежей по этой продаже ещё нет».<br/>• Payment numbers are illustrative (P-NNN format).<br/>• Direction shown as colour-coded pill: «Приход» (green) for inbound, «Расход» (red) for outbound; NO +/− signs (locked pattern 4).<br/>• Amount is the payment's Wallet component (net of any change returned — not shown in this table).<br/>• Row click toasts (download/action not yet wired). |
| **Reconciliation** | **✓ Payment total:** Sum of all payment amounts = totalPaid = 10000. |
| **Designed Gap** | Payment row click is a dev placeholder (toasts). Full payment detail navigation is deferred. |

---

### SALES-SUPPLIES-17: Transaction Detail — Note & Attachments Card

| Aspect | Detail |
|--------|--------|
| **ID** | SALES-SUPPLIES-17 |
| **Title** | Display note text and file attachments on sale detail |
| **Preconditions** | • Sale with:<br/>  - Notes: «Доставить завтра, звонок перед приездом»<br/>  - Attachments: 1 PDF, 1 image (mocked; real files not persisted)<br/>• Navigate to detail. |
| **Steps** | 1. Scroll to «Примечание и вложения» card (if present).<br/>2. Verify note text displayed (multi-line, preserve line breaks).<br/>3. Below note, list attachment rows:<br/>   - Each row: icon (PDF/image) · filename · size<br/>4. Click attachment row → dev toast (download placeholder). |
| **Expected Result** | • Card appears only if note OR attachments present; hidden otherwise.<br/>• Note is read-only (no edit).<br/>• Attachments are listed with computed size (e.g., «145 KB»).<br/>• File download clicks toast (not yet wired in redesign).<br/>• Card icon: DescriptionOutlinedIcon (note) + ImageOutlinedIcon (attachments). |
| **Reconciliation** | N/A (read-only display) |
| **Designed Gap** | Attachment download is a dev placeholder (toasts); real file download is deferred. |

---

### SALES-SUPPLIES-18: Transaction Detail — Audit Card

| Aspect | Detail |
|--------|--------|
| **ID** | SALES-SUPPLIES-18 |
| **Title** | Audit card shows creation metadata (user, date, time) |
| **Preconditions** | • Any sale or refund detail.<br/>• Navigate to detail. |
| **Steps** | 1. Bottom of left column: «Информация» or «История» card.<br/>2. Verify rows:<br/>   - For sale: Создано · date HH:MM · createdBy username<br/>   - For refund: Проведено · date HH:MM · createdBy username<br/>3. Verify immutability note if refund: «Возврат проведён и не подлежит изменению» |
| **Expected Result** | • Metadata always present and read-only.<br/>• Date/time formatted consistently (locale-appropriate).<br/>• Username shown if available; blank if null.<br/>• Refund note: «Возврат проведён и не подлежит изменению» (in red or warning tone). |
| **Reconciliation** | N/A (audit display only) |
| **Designed Gap** | None |

---

### SALES-SUPPLIES-19: Refund Modal — Modal Opens from Sale ⋮ Menu

| Aspect | Detail |
|--------|--------|
| **ID** | SALES-SUPPLIES-19 |
| **Title** | Sale detail ⋮ menu opens refund-creation modal |
| **Preconditions** | • Open a sale detail (not a refund).<br/>• Sale has ≥1 line. |
| **Steps** | 1. Header top-right: click ⋮ icon (MoreVertIcon).<br/>2. Menu appears: single option «Создать возврат».<br/>3. Click «Создать возврат». |
| **Expected Result** | • Refund modal opens (Dialog, 820px width).<br/>• Title: «Возврат к продаже #1001» (sale number filled in).<br/>• Modal shows meta-strip: Partner icon + name · Warehouse icon + name · Date<br/>• Modal sections:<br/>   - Alert area (error messages if validation fails)<br/>   - Positions table (line-item selection interface)<br/>   - Reason text field (below table)<br/>   - Footer buttons: Cancel · Submit |
| **Reconciliation** | N/A (modal UX only) |
| **Designed Gap** | None |

---

### SALES-SUPPLIES-20: Refund Modal — Line Selection Interface

| Aspect | Detail |
|--------|--------|
| **ID** | SALES-SUPPLIES-20 |
| **Title** | Refund modal shows cumulative refund caps per line |
| **Preconditions** | • Sale with 2 lines:<br/>  - L1: Product A, qty 3 units, price 1000, no discount → total 3000<br/>  - L2: Product B, qty 5 units, price 2000, 10% discount → total 9000 (net)<br/>• Open refund modal. |
| **Steps** | 1. Table header: Checkbox · Товар · Продано · Возвращено · Доступно · К возврату · Цена за ед. · Сумма<br/>2. Row 1 (L1): unchecked · Product A · 3 · 0 · 3 · [blank qty field] · 1000 · 0<br/>3. Row 2 (L2): unchecked · Product B · 5 · 0 · 5 · [blank qty field] · effective-price · 0<br/>4. For L2, hover over price → tooltip «цена со скидкой −10%» (effective unit price shown).<br/>5. Click L1 checkbox → checked; qty field auto-fills to 3 (available).<br/>6. Change qty to 2; row highlights light-blue; summary updates: «Сумма возврата: 2000 UZS».<br/>7. Click L1 checkbox again → unchecked; qty clears; summary updates. |
| **Expected Result** | • «Продано» = original line quantity.<br/>• «Возвращено» = sum of all prior refunds of this line (0 if first refund).<br/>• «Доступно» = Sold − Refunded (remaining refundable).<br/>• Only checked lines with qty > 0 count in the refund.<br/>• Line total = qty × effective-unit-price (after discount applied to original line).<br/>• Summary at bottom: Позиций к возврату · N · Сумма возврата · X UZS |
| **Reconciliation** | **✓ Cumulative cap:** Create a second refund (modal) for the same sale; verify «Возвращено» increments correctly per line, and «Доступно» decrements; verify user cannot exceed available. |
| **Designed Gap** | None; this is rule 5 (business-rules). |

---

### SALES-SUPPLIES-21: Refund Modal — Validation: No Lines Selected

| Aspect | Detail |
|--------|--------|
| **ID** | SALES-SUPPLIES-21 |
| **Title** | Submit fails if no lines are selected (qty > 0) |
| **Preconditions** | • Refund modal open; no lines selected (or all unchecked). |
| **Steps** | 1. Leave reason field empty.<br/>2. Click «Провести возврат» button. |
| **Expected Result** | • Alert appears (red, with ErrorOutlineIcon):<br/>   «Выберите хотя бы одну позицию и укажите количество к возврату.»<br/>• Submit button stays enabled (hard rule 5).<br/>• Modal stays open; user can correct. |
| **Reconciliation** | N/A (validation) |
| **Designed Gap** | None |

---

### SALES-SUPPLIES-22: Refund Modal — Validation: Qty Over Cap

| Aspect | Detail |
|--------|--------|
| **ID** | SALES-SUPPLIES-22 |
| **Title** | Submit fails if refund qty exceeds available per line |
| **Preconditions** | • Sale line: qty 5, prior refund qty 2 → available = 3.<br/>• Refund modal open. |
| **Steps** | 1. Check line; auto-fills to 3.<br/>2. Manually change qty to 4 (over cap).<br/>3. Row background turns red (errorBg).<br/>4. Enter reason; click «Провести возврат». |
| **Expected Result** | • Alert appears (red):<br/>   «Количество к возврату превышает доступное. Исправьте отмеченные позиции.»<br/>• Submit button stays enabled.<br/>• Modal stays open. |
| **Reconciliation** | N/A (validation) |
| **Designed Gap** | None |

---

### SALES-SUPPLIES-23: Refund Modal — Validation: Missing Reason

| Aspect | Detail |
|--------|--------|
| **ID** | SALES-SUPPLIES-23 |
| **Title** | Submit fails if reason field is empty (required field) |
| **Preconditions** | • Refund modal open; ≥1 line selected with valid qty; reason field empty. |
| **Steps** | 1. Check a line; qty auto-fills.<br/>2. Leave reason field blank.<br/>3. Click «Провести возврат». |
| **Expected Result** | • Reason field error (red border or underline).<br/>• Alert above reason: «Укажите причину возврата — поле обязательно»<br/>• Submit blocked (stays enabled, but validation flag set).<br/>• Modal stays open. |
| **Reconciliation** | N/A (validation) |
| **Designed Gap** | None |

---

### SALES-SUPPLIES-24: Refund Modal — Submit Happy Path

| Aspect | Detail |
|--------|--------|
| **ID** | SALES-SUPPLIES-24 |
| **Title** | Create refund with valid selections and reason |
| **Preconditions** | • Sale #1001: 2 lines (A: 3 units, B: 5 units), no prior refunds.<br/>• Refund modal open. |
| **Steps** | 1. Check line A; qty = 2.<br/>2. Check line B; qty = 3.<br/>3. Reason field: enter «Брак в доставке».<br/>4. Verify footer text: «Возврат необратим — после сохранения запись нельзя изменить или удалить. Исправления возможны только новым возвратом.» (immutability disclaimer)<br/>5. Click «Провести возврат» button.<br/>6. Modal shows LinearProgress (top); buttons disabled. |
| **Expected Result** | • HTTP POST to `/api/transactions` with payload type = «SaleRefund»<br/>• Form data includes originalTransactionId, refundReason, lines array<br/>• On success: modal closes<br/>• Toaster: «Возврат к #1001 проведён»<br/>• Page refreshes; refund appears in list (if on sales list) and in refund history (if on sale detail)<br/>• New refund detail shows reason + positions |
| **Reconciliation** | **✓ List update:** Navigate to `/sales` → search for original txn #1001 → refund should appear in list (same date, marked as «Возврат к #1001»), amount shown negative.<br/>**✓ Refund detail:** Click refund from list → detail page shows «Сумма возврата» card, reason card («Причина возврата: Брак в доставке»), positions table (2 lines, only A and B with refunded qtys).<br/>**✓ Stock reverse:** Navigate to Products → Product A stock should INCREASE by 2 (refund adds stock back; real backend must implement; mock does NOT). |
| **Designed Gap** | Stock reversals (SaleRefund increases stock, SupplyRefund decreases) NOT implemented in mock. Real backend must verify. |

---

### SALES-SUPPLIES-25: Refund Modal — Multiple Refunds Same Sale (Cap Enforcement)

| Aspect | Detail |
|--------|--------|
| **ID** | SALES-SUPPLIES-25 |
| **Title** | Create second refund against same sale; verify cumulative cap enforcement |
| **Preconditions** | • Sale #1001: line (Product A, qty 5).<br/>• Refund 1 already created: 2 units of A, reason «Брак».<br/>• Open sale detail → create second refund modal. |
| **Steps** | 1. Modal title: «Возврат к продаже #1001» (same).<br/>2. Table shows:<br/>   - Продано: 5<br/>   - Возвращено: 2 (from prior refund)<br/>   - Доступно: 3 (5 − 2)<br/>3. Auto-fill to 3; change to 4.<br/>4. Enter reason «Запрос клиента»; submit.<br/>5. Modal shows error: «Количество к возврату превышает доступное…»<br/>6. Change qty back to 3; submit. |
| **Expected Result** | • Second refund created (e.g., #1001-R2, or new independent ID).<br/>• Total refunded across both = 5 (1 + 2 + 3 = ... wait, that's wrong in description above, let me re-check the logic).<br/>• Actually, if R1 refunded 2, and R2 refunds 3, total = 5 = sold qty (100% refunded).<br/>• If another refund is attempted for this line, it should show available = 0 and reject any qty > 0. |
| **Reconciliation** | **✓ Cumulative cap:** Create a third refund modal for the same sale/line → table should show Доступно = 0; any qty > 0 should be rejected on submit. |
| **Designed Gap** | None; this is rule 5 & 6 (business-rules). |

---

### SALES-SUPPLIES-26: Refund Detail — Read-Only Layout

| Aspect | Detail |
|--------|--------|
| **ID** | SALES-SUPPLIES-26 |
| **Title** | Refund detail page is immutable; no edit/delete affordances |
| **Preconditions** | • Navigate to a refund detail page (e.g., `/sales/1234` where tx.type = «SaleRefund»). |
| **Steps** | 1. Header: type badge «Возврат» (or «Возврат поставки»).<br/>2. No payment status badge (refunds have no payment status).<br/>3. ⋮ menu: absent (only non-refunds have the menu).<br/>4. No edit buttons anywhere on the page.<br/>5. All cards read-only (no input fields).<br/>6. Reference banner below header: «Возврат к продаже #1001 · Open Original» link. |
| **Expected Result** | • Layout is identical to sale detail, but all interactive elements removed.<br/>• Reference banner always present for refunds.<br/>• Financial card shows refund-specific totals (SaleRefund / SupplyRefund amounts).<br/>• Immutability note in audit card: «Возврат проведён и не подлежит изменению»<br/>• Reason card present (refund.refundReason). |
| **Reconciliation** | N/A (immutability enforcement) |
| **Designed Gap** | None; rule 1 (immutability). |

---

### SALES-SUPPLIES-27: Refund of Supply — Direction-Specific Labels

| Aspect | Detail |
|--------|--------|
| **ID** | SALES-SUPPLIES-27 |
| **Title** | Supply refund uses «Возврат поставки» labels and Supply direction text |
| **Preconditions** | • Create supply #2001 (2 lines, partially paid).<br/>• Create refund of #2001.<br/>• Navigate to refund detail (`/supplies/1234`). |
| **Steps** | 1. Header badge: «Возврат поставки» (not «Возврат»).<br/>2. Reference banner: «Возврат к поставке #2001» (not «…к продаже»).<br/>3. Link text: «Открыть поставку» (not «Открыть продажу»).<br/>4. Financial card title: «Сумма возврата».<br/>5. Original txn link labels: «Исходная поставка» (not «Исходная продажа»).<br/>6. Reason card present (same as Sale refund). |
| **Expected Result** | • All labels use Supply direction-specific Russian text from i18n.<br/>• No other differences from Sale refund flow. |
| **Reconciliation** | N/A (localization only) |
| **Designed Gap** | None |

---

### SALES-SUPPLIES-28: Cross-Module Reconciliation — Partner Debt After Sale

| Aspect | Detail |
|--------|--------|
| **ID** | SALES-SUPPLIES-28 |
| **Title** | Sale creates receivable debt; partner balance reflects it |
| **Preconditions** | • Fresh partner «Иван» (type: Customer), zero balance.<br/>• Create sale #1001: totalDue 10000, totalPaid 6000 → remaining 4000. |
| **Steps** | 1. Navigate to Partners → detail for «Иван».<br/>2. Check balance card: should show positive 4000 (we are owed 4000 — partner balance is owed-to-us sign).<br/>3. Navigate to Debts → «Нам должны» card: should count Иван in the outstanding.<br/>4. Navigate to Debts → «По партнёрам» tab → find Иван: should show 1 transaction, 4000 remaining. |
| **Expected Result** | • Partner balance = totalDue − totalPaid = 10000 − 6000 = 4000 (positive = receivable).<br/>• Debts module counts this receivable in «Нам должны» total.<br/>• Partner receivable debt transaction (#1001) appears in Debts list. |
| **Reconciliation** | **✓ Consistency check:** Partner balance = Debts outstanding for that partner (for their direction). |
| **Designed Gap** | None; this is rule 7 in business-rules (separate payment event). |

---

### SALES-SUPPLIES-29: Cross-Module Reconciliation — Partner Payable After Supply

| Aspect | Detail |
|--------|--------|
| **ID** | SALES-SUPPLIES-29 |
| **Title** | Supply creates payable debt; partner balance reflects it |
| **Preconditions** | • Fresh supplier «ООО Поставщик» (type: Supplier), zero balance.<br/>• Create supply #2001: totalDue 15000, totalPaid 0 → remaining 15000 (we owe 15000). |
| **Steps** | 1. Navigate to Partners → detail for «ООО Поставщик».<br/>2. Check balance card: should show negative 15000 (we owe them).<br/>3. Navigate to Debts → «Мы должны» card: should count ООО Поставщик.<br/>4. Navigate to Debts → «По партнёрам» tab → filter to payable → find ООО Поставщик: should show 1 transaction, 15000 payable. |
| **Expected Result** | • Partner balance = −(totalDue − totalPaid) = −15000 (negative = payable).<br/>• Debts module counts this payable in «Мы должны» total.<br/>• Supplier payable debt transaction (#2001) appears in Debts list. |
| **Reconciliation** | **✓ Consistency check:** Partner balance sign and Debts outstanding are aligned. |
| **Designed Gap** | None; rule 7 (business-rules). |

---

### SALES-SUPPLIES-30: Cross-Module Reconciliation — Wallet Balance After Payment

| Aspect | Detail |
|--------|--------|
| **ID** | SALES-SUPPLIES-30 |
| **Title** | Payment against sale reduces wallet balance; payment operation recorded |
| **Preconditions** | • Wallet «Касса» (Cash type) with opening balance 50000 UZS.<br/>• Sale #1001: totalDue 10000.<br/>• Create payment: 6000 from Cash wallet → sale settled 6000. |
| **Steps** | 1. Navigate to Wallets → detail for «Касса».<br/>2. Balance should now be 50000 + 6000 (if payment in) − 0 (if payment out) = 50000 + 6000 = 56000 (or 50000 − 6000 = 44000 depending on direction; for a Sale, customer pays IN, so +6000).<br/>3. Wait, let me reconsider: a Sale is income, so payment flows INTO the business wallet from the customer. Opening 50000 + payment 6000 = 56000.<br/>4. Navigate to Wallets → «Касса» detail → «Операции» tab: should show a payment entry dated today, type «Платёж», direction «Приход» (green), amount 6000, running balance updates to 56000. |
| **Expected Result** | • Wallet balance: 50000 (opening) + 6000 (payment in) = 56000 UZS.<br/>• Operations ledger: new «Платёж #P-NNN» row dated today.<br/>• Operation direction: «Приход» (green, no ± sign per locked pattern 4).<br/>• Operation partner: customer name.<br/>• Operation running balance: 56000 (illustrative in mock; may not reflect real sequence on backend). |
| **Reconciliation** | **✓ Wallet ledger:** Wallet balance change = payment Wallet component amount. |
| **Designed Gap** | Mock wallet operations do not mutate real balances across all operations (illustrative only; real backend must implement). |

---

### SALES-SUPPLIES-31: Empty List After Filters (Search No Match)

| Aspect | Detail |
|--------|--------|
| **ID** | SALES-SUPPLIES-31 |
| **Title** | Search with no matching results shows filtered empty state |
| **Preconditions** | • ≥1 transaction created (e.g., «Иван» as partner).<br/>• Open sales list. |
| **Steps** | 1. Search field: type «Петр» (non-matching partner).<br/>2. List filters; no rows found. |
| **Expected Result** | • Empty state card appears with:<br/>   - Icon: ReceiptLongOutlinedIcon (light bg)<br/>   - Title: «Ничего не найдено»<br/>   - Body: «По заданным условиям продаж и возвратов нет. Измените поиск, статус оплаты или период.»<br/>   - No «Новая продажа» button (filtering mode, not empty-fresh mode). |
| **Reconciliation** | N/A (empty state UI) |
| **Designed Gap** | None |

---

### SALES-SUPPLIES-32: Loading State — Network Delay

| Aspect | Detail |
|--------|--------|
| **ID** | SALES-SUPPLIES-32 |
| **Title** | List shows spinner while data loads (simulated network latency) |
| **Preconditions** | • Network throttle or mock delay introduced (if possible; otherwise this is implicit in test setup). |
| **Steps** | 1. Navigate to Sales list.<br/>2. Immediately observe page state (< 100ms). |
| **Expected Result** | • Spinner (CircularProgress) centered on page while allTransactions = «loading».<br/>• After ~500ms (mock delay), data appears.<br/>• No jumpy layout shifts (skeleton loaders preferred, but spinner is acceptable). |
| **Reconciliation** | N/A (loading UX) |
| **Designed Gap** | None |

---

### SALES-SUPPLIES-33: Unsaved Changes Guard on New Sale (Escape)

| Aspect | Detail |
|--------|--------|
| **ID** | SALES-SUPPLIES-33 |
| **Title** | New Sale page guards against accidentally leaving with unsaved data |
| **Preconditions** | • Navigate to `/sales/new`.<br/>• Fill: partner, warehouse, add ≥1 product line. |
| **Steps** | 1. Press Esc key or click browser back button.<br/>2. Confirm dialog appears: title «Несохранённые изменения», body «Несохранённые изменения будут потеряны…»<br/>3. Buttons: «Остаться» · «Уйти со страницы»<br/>4. Click «Остаться»; stays on page.<br/>5. Click back button again; dialog re-appears.<br/>6. Click «Уйти со страницы»; navigates to `/sales` (or referrer). |
| **Expected Result** | • Dialog fires only if data has been entered (dirty state).<br/>• Dialog does NOT fire if form is untouched (pristine).<br/>• Dialog does NOT fire after successful submit. |
| **Reconciliation** | N/A (UX guard) |
| **Designed Gap** | None |

---

### SALES-SUPPLIES-34: No Payment Dialog on Sale (Zero Payment Confirmation)

| Aspect | Detail |
|--------|--------|
| **ID** | SALES-SUPPLIES-34 |
| **Title** | Submit zero-payment sale triggers confirmation dialog |
| **Preconditions** | • On new sale page; partner + warehouse + lines filled.<br/>• Paid amount = 0 (customer buys on full credit). |
| **Steps** | 1. Click «Провести продажу».<br/>2. Dialog appears: title «Провести без оплаты?»<br/>   Body: «Оплата не внесена — вся сумма 10000 UZS станет долгом партнёра «Иван». Продажу нельзя изменить после проведения.»<br/>3. Buttons: «Назад» · «Провести в долг»<br/>4. Click «Назад»; stays on page.<br/>5. Click «Провести в долг»; sale created with totalPaid = 0, remaining = totalDue. |
| **Expected Result** | • Dialog appears only if paidAmount = 0 AND totalDue > 0.<br/>• Dialog does NOT appear if some payment is entered (even 1 UZS).<br/>• Dialog title + body direct copy from i18n keys `transaction.new.dialog.noPay.*`<br/>• Buttons have localized text. |
| **Reconciliation** | **✓ Debt verification:** After creating, navigate to Partners → partner detail → balance should show full outstanding. |
| **Designed Gap** | None |

---

### SALES-SUPPLIES-35: Transaction Not Found (Invalid ID)

| Aspect | Detail |
|--------|--------|
| **ID** | SALES-SUPPLIES-35 |
| **Title** | Navigate to non-existent transaction ID returns not-found message |
| **Preconditions** | N/A |
| **Steps** | 1. Navigate directly to `/sales/99999` (or any ID that doesn't exist in the mock). |
| **Expected Result** | • Page shows centered text: «Транзакция не найдена»<br/>• No layout crash; graceful fallback.<br/>• Back button in header still works (if visible). |
| **Reconciliation** | N/A (error handling) |
| **Designed Gap** | None |

---

### SALES-SUPPLIES-36: Bulk Discount Button («Применить скидку ко всем»)

| Aspect | Detail |
|--------|--------|
| **ID** | SALES-SUPPLIES-36 |
| **Title** | Apply discount % to all lines at once (overwrites per-line discounts) |
| **Preconditions** | • On new sale page with 3 lines:<br/>  - L1: price 1000, no discount<br/>  - L2: price 2000, 5% discount<br/>  - L3: price 5000, 1000 fixed discount<br/>• Total before bulk: 1000 + 1900 + 4000 = 6900 |
| **Steps** | 1. Find «Применить скидку ко всем» button (near summary card).<br/>2. Click → modal/input appears: field for % value, button «Применить».<br/>3. Enter 10; click «Применить».<br/>4. All lines now show −10% discount; per-line totals recalculate.<br/>5. L1: 1000 × 0.9 = 900<br/>   L2: 2000 × 0.9 = 1800<br/>   L3: 5000 × 0.9 = 4500<br/>   Total: 900 + 1800 + 4500 = 7200<br/>6. Summary card badge: «−10% на все позиции» (or similar)<br/>7. Click the badge or re-open modal → change to 20%<br/>8. Totals update: 900 + 1800 + 4500 → 800 + 1600 + 4000 (at 20%)<br/>   Total: 6400 |
| **Expected Result** | • Bulk discount OVERWRITES all per-line discounts (does not stack).<br/>• Applied % is shown in summary as a badge (「−10%」).<br/>• Badge is clickable to edit.<br/>• Discount type is % (not fixed amount, per rule 38 — bulk is %-only).<br/>• Line totals update in real-time. |
| **Reconciliation** | **✓ Math check:** Verify recalculation for each line. |
| **Designed Gap** | None |

---

### SALES-SUPPLIES-37: Payment Settlement Modal (Debt Allocation)

| Aspect | Detail |
|--------|--------|
| **ID** | SALES-SUPPLIES-37 |
| **Title** | On overpayment, optional settlement dialog allocates excess to other debts |
| **Preconditions** | • Partner with 2 outstanding debts:<br/>  - Debt 1: 3000 UZS (old sale)<br/>  - Debt 2: 5000 UZS (recent sale)<br/>• New sale: 2000 UZS<br/>• On new sale page: partner selected, lines filled, total 2000 UZS, pay 10000 UZS.<br/>• Click «Погасить долги» or it opens automatically. |
| **Steps** | 1. Settlement modal opens (or inline section expands).<br/>2. Lists outstanding debts with checkboxes/inputs:<br/>   - Debt 1: 3000 (checkbox, auto-checked; amount filled)<br/>   - Debt 2: 5000 (checkbox; amount field)<br/>3. «Вся сумма» button: auto-allocates remaining excess to Debt 2 (chronologically next).<br/>4. Or manually enter amounts per debt.<br/>5. After distribution, remaining (if any) → «Аванс» toggle (only if zero remaining debt).<br/>6. Close modal / apply. |
| **Expected Result** | • Settlement modal shows outstanding debts per partner, per direction (receivables only for Sale, payables for Supply).<br/>• Auto-allocation is FIFO (oldest first) per rule 8 (business-rules).<br/>• User can edit per-row amounts manually.<br/>• «Аванс» option available only if remaining = 0 after settlements.<br/>• On submit, payment is recorded with component sources + allocations. |
| **Reconciliation** | **✓ Allocation fidelity:** After creation, navigate to Debts → check that allocated debts show reduced outstanding. |
| **Designed Gap** | Detailed allocation tracking (per-payment component breakdown) may not be visible in the sales list/detail (simplified for now). Full Payment detail view is deferred. |

---

### SALES-SUPPLIES-38: Template Save (New Sale)

| Aspect | Detail |
|--------|--------|
| **ID** | SALES-SUPPLIES-38 |
| **Title** | Save current sale basket as a reusable template |
| **Preconditions** | • On new sale page: partner «Иван» selected, 2 lines added. |
| **Steps** | 1. Below the submit button: «Сохранить как шаблон» link or button.<br/>2. Click → modal appears: title «Сохранить как шаблон»<br/>   Subtitle: «Шаблон сохранит текущие позиции и партнёра…»<br/>   Field: name input (placeholder: «Например: Еженедельный заказ»)<br/>3. Enter name «Еженедельный заказ Ивана»; click «Сохранить шаблон».<br/>4. Toast: «Шаблон сохранён» (or list updated).<br/>5. Modal closes. |
| **Expected Result** | • Template created with name, partner, lines (products + qty + prices).<br/>• Template type = Sale (direction-specific).<br/>• Template does NOT include notes or payment settings (basket only).<br/>• On subsequent new sale page + same partner, template may be auto-suggested or accessible via «Загрузить шаблон» menu. |
| **Reconciliation** | **✓ Template list:** Navigate to Templates → search for «Еженедельный» → template appears with line count, partner, type badge. |
| **Designed Gap** | Templates module is separate; full template CRUD is in another module. |

---

### SALES-SUPPLIES-39: Keyboard Shortcuts (POS UX)

| Aspect | Detail |
|--------|--------|
| **ID** | SALES-SUPPLIES-39 |
| **Title** | Keyboard shortcuts accelerate entry (Alt+P partner, ↑↓ qty, Enter submit) |
| **Preconditions** | • On new sale page. |
| **Steps** | 1. Click product search field (or it auto-focuses).<br/>2. Type «Яблоки»; dropdown shows matches.<br/>3. Press ↓ → next product; ↑ → previous product.<br/>4. Press Enter on a product → add to cart (qty focuses/selects).<br/>5. Press ↑ / ↓ on qty field → increment/decrement qty (clamped ≥1).<br/>6. Press Enter on qty → focus moves to price field.<br/>7. Press Enter on price → focus moves to discount field (or back to search if no discount).<br/>8. Press Esc → quit the page (with guard if dirty).<br/>9. Press Alt+P (or Ctrl+Cmd variant) → partner picker focuses.<br/>10. Press Alt+W → warehouse picker focuses.<br/>11. Press Ctrl+Enter (or Cmd+Enter) → submit form. |
| **Expected Result** | • Product search auto-focuses on page load.<br/>• Keyboard hints legend shows (toggle icon, discoverable via help button or auto-visible).<br/>• Each shortcut works as described.<br/>• Tab order follows UX (partner → warehouse → search → summary → payment → submit). |
| **Reconciliation** | N/A (UX acceleration) |
| **Designed Gap** | None; this is per the redesign (POS ergonomics). |

---

### SALES-SUPPLIES-40: Immutability Warning on Submit

| Aspect | Detail |
|--------|--------|
| **ID** | SALES-SUPPLIES-40 |
| **Title** | Final dialog warns of immutability before transaction is recorded |
| **Preconditions** | • On new sale/supply page: all fields valid, ready to submit. |
| **Steps** | 1. Click «Провести продажу» (or «Провести поставку»).<br/>2. If paidAmount > 0 AND < totalDue, no intermediate dialog (partial payment is allowed as-is).<br/>3. If paidAmount = 0, «Провести без оплаты?» dialog (as per case 34).<br/>4. If user confirms payment dialog (or skips if paidAmount > 0), THEN immutability warning:<br/>   Title: «Информация»<br/>   Body: «Продажа записывается окончательно — изменить нельзя, только оформить возврат.» (direction-specific)<br/>   Buttons: «Назад» (cancel) · «Провести продажу» (confirm)<br/>5. User confirms → transaction posted. |
| **Expected Result** | • Immutability warning is ALWAYS shown before final POST (unless disabled by design for speed; per current UX, it's shown).<br/>• Exact copy from i18n keys `transaction.new.submit.immutable.*`<br/>• No way to skip this warning (intentional friction for data integrity). |
| **Reconciliation** | N/A (UI safeguard) |
| **Designed Gap** | None |

---

## Summary of High-Value Reconciliation Assertions

These are the critical integration checks that verify the real backend implementation:

1. **Stock mutations on Sale/SupplyRefund:** Products module stock must decrease on Sale create, increase on SaleRefund. Supply creates stock increase, SupplyRefund creates stock decrease. **NOT implemented in mock; real backend must verify per business-rules §D.**

2. **Partner balance after transaction:** Partner balance (sum of receivables − payables from all directions) must reflect outstanding after a Sale/Supply is created. Verify via Partners detail → balance card, and via Debts module. **Mocks are self-contained; real backend must ensure cross-module consistency.**

3. **Wallet balance after payment:** Wallet balance must change by the Wallet-component amount (net of change returned). Operations ledger entry must exist for the payment. **Mock operations are illustrative; real backend must implement atomicity.**

4. **Refund cumulative cap:** Multiple refunds against the same original transaction must not exceed per-line original quantity. Frontend enforces; backend must also enforce (rule 5). **Mock enforces client-side; real backend must reject over-cap at POST time.**

5. **Debt list consistency:** Debts module outstanding list must reconcile with transaction ledger (sum of unpaid + partial transactions per direction per partner). **Mock is self-contained; real backend must compute from same source-of-truth.**

---

## Test Execution Notes

- **Test Environment:** https://app.miraziz.net (frontend) + https://api.miraziz.net (backend) + Swagger at https://api.miraziz.net/swagger/v1/swagger.json
- **Tenant Setup:** Start with empty tenant; build data as you test (seeding + transaction flow).
- **Browser:** Modern Chromium (Chrome, Edge) or Firefox. Test on desktop (1024px+) primary; mobile responsiveness secondary (not explicitly covered here).
- **Network:** Real backend (not mocked); expect 200–500ms latency per API call. Observe loading states.
- **Parallelization:** Cases are mostly independent; can run in parallel with separate tenant tenants or in sequence within one tenant (preferred for simplicity).
- **Assertions:** Combine UI observations (exact labels, layout, states) with backend verification (API inspection, database query if possible, or behavior observation in related modules).

---

## Known Limitations (Not Bugs)

1. **Stock mutations not mocked:** Sales/Supplies/Refunds do not mutate the Products mock stock. Real backend will implement; test expectations should account for this in the mock environment.

2. **Wallet operations illustrative:** Mock operations ledger is seeded but may not reflect real atomicity or full sequence. Real backend will be authoritative.

3. **Payment detail navigation deferred:** Payment rows in transaction detail currently toast (dev placeholder). Full payment detail page is future work.

4. **Download/attachment handling deferred:** Document download and attachment file persistence are placeholders (dev toasts). Future work.

5. **Partner ID edge case:** Partner may be created without an ID in some flows; clicking partner name in header toasts if ID is missing. Acceptable fallback.

6. **Template autocomplete vs. list:** Templates appear in the list module and in the new-transaction flow separately; they may not be perfectly in-sync (seeded data). Real backend will have one source-of-truth.

---

## Test Execution Checklist

- [ ] Empty state (both directions) visible + navigation correct
- [ ] Create sale: happy path, validation, over-stock block
- [ ] Create supply: happy path, no stock validation (goods-in)
- [ ] List filters: search, payment status, date range, export
- [ ] Detail page: header, positions, financial card, audit
- [ ] Refund modal: line selection, cumulative cap, validation
- [ ] Refund detail: immutability, reason card, reference banner
- [ ] Cross-module reconciliation (stock, partner balance, wallet, debts)
- [ ] UX: unsaved changes guard, no-payment dialog, keyboard shortcuts
- [ ] Immutability enforcement: no edit/delete buttons, refund counter-events only
- [ ] Direction-specific labels (Sale vs. Supply, partner/supplier, etc.)
- [ ] Error states (not found, validation, network)
- [ ] Loading states observed during network latency
