# Test Cases: Orders Module (Заказы + New Order)

## Overview

The **Orders** module manages customer purchase orders as **mutable, pre-delivery intents**. An order walks a linear state machine (Pending → Processing → Shipping → Delivered) with terminal branches (Cancelled, Rejected, Returned). Orders are never immutable events—they can be edited and cancelled before delivery. On delivery, an order promotes to an immutable Sale and moves stock off warehouse shelves.

**Testing environment:** Deployed dev app (app.miraziz.net frontend + api.miraziz.net backend, real mocks, empty tenant).

**Key rules:**
- Orders are editable pre-delivery only (Pending/Processing/Shipping).
- Stock is shown for guidance at creation; NOT reserved. Real stock check happens at delivery (hard-blocks shortfalls).
- Warehouse is chosen at **order creation** and shown as "intended" (not final); warehouse is picked again at delivery confirmation.
- Delivery confirmation opens a modal with per-line stock check; shortfalls block promotion.
- No payment or wallet involvement—orders are pre-money.
- Delivery creates a linked immutable Sale (promotion reference).

---

## List View (Orders / Заказы)

### ORDERS-L01 | Empty state (no orders, no filters)

**Preconditions:**  
Tenant is fresh, no orders exist.

**Steps:**
1. Navigate to `/orders` (Orders page, menu item "Заказы").
2. Observe the page.

**Expected result:**
- Page title "Заказы" with icon.
- Toolbar: "Новый заказ" (primary button), "Экспорт CSV" (ghost button), search box, status tabs (Все · Ожидает · В обработке · Доставляется · Доставлен · Отменён), date range dropdown (Весь период).
- Empty state card: icon (SearchIcon), title "Пока нет заказов", body "Здесь появятся заказы клиентов…", "Новый заказ" button.
- No table rows.

**Reconciliation:**  
Empty state is read-only; no reconciliation needed.

---

### ORDERS-L02 | Create first order from empty state

**Preconditions:**  
Starting from ORDERS-L01 (empty tenant).

**Steps:**
1. Click the "Новый заказ" button in the empty state or toolbar.
2. Navigate to `/orders/new`, verify breadcrumb: "Заказы > Новый заказ".
3. Click back or "Отмена".
4. Observe return to `/orders` with empty state.

**Expected result:**
- Create button navigates to `/orders/new`.
- New Order page loads (see ORDERS-N** test cases below).
- Back/cancel returns to orders list.

**Designed gap:**  
No unsaved-changes check on back from empty New Order.

---

### ORDERS-L03 | Status tabs count correctly

**Preconditions:**  
Orders exist in multiple statuses (Pending, Processing, Delivered, Cancelled).

**Steps:**
1. Open Orders list (`/orders`).
2. Observe status tabs: Все · Ожидает · В обработке · Доставляется · Доставлен · Отменён.
3. Each tab shows a count (e.g., "Ожидает · 3").
4. Click each tab; list filters correctly.
5. Click "Все"; all orders appear.

**Expected result:**
- Tab counts reflect live order counts per status (from `orderStore.statusCounts`).
- Clicking a tab filters `listOrders` by status.
- "Все" shows all statuses.
- "Доставляется" and "Возвращён" are omitted from the tabs (only 6 tabs: all + 5 statuses).

**Reconciliation:**  
Count must match the filtered rows returned by the API.

---

### ORDERS-L04 | Search by order number and customer name

**Preconditions:**  
At least 3 orders exist (e.g., order #1001 for "Alice", #1002 for "Bob").

**Steps:**
1. Open Orders list.
2. Type "#1001" in the search box.
3. Observe list shows only order #1001.
4. Clear search; type "Alice".
5. Observe list shows only Alice's order(s).
6. Type "xyz"; observe no results (empty search state).
7. Clear search.

**Expected result:**
- Search is case-insensitive, partial match on order number (with or without #) or customer name.
- Search filters `listOrders` in real-time (no debounce).
- Empty search result shows: icon (SearchIcon), title "Ничего не найдено", body "По заданным условиям заказов нет…".

**Reconciliation:**  
Search string matches client-side logic in `OrderStore.listOrders`.

---

### ORDERS-L05 | Date range filter (7 / 30 / 90 days / all)

**Preconditions:**  
Orders created on different dates: one 2 days ago, one 15 days ago, one 90 days ago.

**Steps:**
1. Open Orders list.
2. Click date dropdown (default "Весь период").
3. Select "Последние 7 дней".
4. Observe list shows only order from 2 days ago.
5. Select "Последние 30 дней".
6. Observe list shows orders from 2 and 15 days ago.
7. Select "Весь период".
8. Observe all orders appear.

**Expected result:**
- Date filter narrows `listOrders` by comparing `(now - orderDate) / MS_PER_DAY <= days`.
- Orders are sorted newest first.
- Filter works independently of search and status tabs.

**Reconciliation:**  
Date range logic matches `OrderStore.listOrders` date filtering.

---

### ORDERS-L06 | CSV export with all columns

**Preconditions:**  
At least one order exists.

**Steps:**
1. Open Orders list.
2. Click "Экспорт CSV".
3. Observe browser download starts (filename: `orders_<timestamp>.csv`).
4. Open CSV file (text editor or spreadsheet).

**Expected result:**
- CSV headers (in order): Дата · Номер · Клиент · Позиций · Сумма, UZS · Доставка · Статус · Источник.
- Rows match visible orders (respecting filters).
- Dates formatted as "DD.MM.YYYY" (or locale-appropriate).
- Order numbers prefixed with "#".
- Delivery dates formatted as "DD.MM.YYYY" or "DD.MM.YYYY HH:mm" if time is set; "—" if unset.
- Status values are i18n labels (e.g., "Ожидает", not "Pending").
- Source values are i18n labels (e.g., "Telegram", or "—" for "None").

**Reconciliation:**  
CSV columns and data match the `buildOrderColumns` schema in code.

---

### ORDERS-L07 | List row contains date, number, customer (clickable), positions count, total, delivery date/time, status chip, source chip

**Preconditions:**  
At least one order exists (e.g., order #1001, customer "Alice", 3 lines, total 15000, delivery date tomorrow, status Pending, source Telegram).

**Steps:**
1. Open Orders list.
2. Observe table columns: Date · Number · Customer · Positions · Total · Delivery · Status · Source.
3. Verify order row shows: date (formatted) · "#1001" (primary color, numeric font) · "Alice" (primary color, underline on hover) · "3" (numeric) · "15,000 UZS" (numeric, right-aligned) · calendar icon + delivery date + optional time (green if upcoming, red if overdue) · status chip (Pending = soft gray) · source chip (Telegram).
4. Click on "Alice" (customer name).
5. Navigate to `/partners/<customerId>`.
6. Go back to `/orders`.
7. Click on any other part of the row (non-customer).
8. Navigate to `/orders/<id>` (detail page).

**Expected result:**
- Customer name is a clickable link (stops propagation) that opens the partner detail page.
- Other row cells are part of the row click handler, which opens the order detail page.
- Delivery date shows: red + error icon if overdue, muted + calendar if done (Delivered/Returned), primary + calendar if upcoming.
- If no delivery date, shows "—".
- If delivery time is set, shows after the date (e.g., "15.06.2026 · 10:30").

**Reconciliation:**  
Row rendering matches `orderColumns` configuration and `OrderDeliveryCell` logic.

---

### ORDERS-L08 | Sort by newest first

**Preconditions:**  
At least 3 orders created on different dates.

**Steps:**
1. Open Orders list.
2. Observe order of rows: should be newest first (by creation date, then by ID).
3. Create a new order (see ORDERS-N**).
4. Navigate back to list.
5. Observe new order appears at the top.

**Expected result:**
- List is always sorted by `order.date` descending, then by `order.id` descending (tiebreaker).
- No explicit sort UI (sort is hardcoded).

**Reconciliation:**  
Sort logic in `OrderStore.listOrders`.

---

### ORDERS-L09 | Combine filters (status + search + date) independently

**Preconditions:**  
Orders exist: order #1001 "Alice" created 5 days ago (Pending), order #1002 "Bob" created 95 days ago (Pending), order #2001 "Alice" created 5 days ago (Delivered).

**Steps:**
1. Open Orders list.
2. Select status "Ожидает" → observe #1001 and #1002.
3. Add search "Alice" → observe #1001 only.
4. Add date filter "Последние 7 дней" → observe #1001.
5. Flip date to "Весь период" → observe #1001 (status and search still active).
6. Clear search, keep date "Последние 7 дней" and status "Ожидает" → observe #1001.
7. Select status "Все" → observe #1001 and #2001 (only within 7 days).

**Expected result:**
- All three filters (status, search, date) apply independently (AND logic).
- Each filter can be modified without resetting others.

**Reconciliation:**  
Filter logic in `OrderStore.listOrders`.

---

### ORDERS-L10 | Overdue delivery date highlighted in red

**Preconditions:**  
Order with delivery date in the past and status still pre-delivery (e.g., Pending, delivery date was 3 days ago).

**Steps:**
1. Open Orders list.
2. Find the order with past delivery date.
3. Observe delivery cell: red text, error icon, date.
4. Hover over cell; tooltip "Доставка просрочена" (or similar).

**Expected result:**
- Overdue delivery date (past date + pre-delivery status) = red + error icon.
- Icon is ErrorOutlineIcon (13px).
- Color is "error.main".

**Reconciliation:**  
`deliveryDateState()` returns "overdue" when order is pre-delivery and delivery date is before today.

---

## Detail View (Order Detail / Деталь заказа)

### ORDERS-D01 | Load order detail page successfully

**Preconditions:**  
Order #1001 exists (customer "Alice", status Pending, 2 lines, created today).

**Steps:**
1. Open Orders list.
2. Click on order #1001 row.
3. Navigate to `/orders/1001`.
4. Wait for page to load.

**Expected result:**
- Breadcrumb: "Заказы > Заказ #1001".
- Back button (chevron left) navigates to `/orders`.
- Page title: "#1001 · Pending badge · source chip".
- Subtitle: "Создан <date> · <customer name link>".
- Stepper showing progress: Pending (current) → Processing → Shipping → Delivered.
- Positions card, Delivery card, Status History card.
- Right sidebar: Partner mini card, Financial card, Promote-to-Sale hint.
- Menu button (⋮).

**Reconciliation:**  
Order data fetched from API (or mock).

---

### ORDERS-D02 | Order stepper shows progress correctly

**Preconditions:**  
Order #1001 (Pending), order #2001 (Processing), order #3001 (Delivered).

**Steps:**
1. Open order #1001 detail. Observe stepper: Pending (filled) → Processing → Shipping → Delivered (all unfilled).
2. Open order #2001 detail. Observe stepper: Pending (filled) ✓ → Processing (filled, current) → Shipping → Delivered.
3. Open order #3001 detail. Observe stepper: all filled ✓, last step shows check mark.

**Expected result:**
- Stepper visualizes the linear flow: Pending → Processing → Shipping → Delivered.
- Completed steps show check mark + primary color.
- Current step shows dot + primary color + subtle glow.
- Future steps show unfilled circle + gray.
- If order is cancelled/rejected/returned, branch stops at that point and remaining steps are dashed.

**Reconciliation:**  
Stepper logic in `OrderStepper` component, derived from `order.history`.

---

### ORDERS-D03 | Positions card shows all line items with subtotal, discount, total

**Preconditions:**  
Order #1001 with 2 lines:
- Line 1: product "Widget" (SKU "WIDGET-1"), qty 2, unit price 5000, no discount → total 10000.
- Line 2: product "Gadget" (SKU "GADGET-1"), qty 1, unit price 3000, discount 10% → total 2700.

**Steps:**
1. Open order #1001 detail.
2. Scroll to "Позиции" card.

**Expected result:**
- Table header: Товар · Кол-во · Цена за ед. · Скидка · Итого.
- Row 1: "Widget" (bold) + "WIDGET-1" (small, gray) · "2 шт" · "5,000" · "—" · "10,000" (bold).
- Row 2: "Gadget" + "GADGET-1" · "1 шт" · "3,000" · "−10%" (saffron, bold) · "2,700" (bold).
- Footer rows:
  - Подытог: 13000
  - Скидка по позициям: −300
  - Итого: 12700
- If order is pre-delivery, header shows "Позиции · 2" + "Можно редактировать" (primary, edit icon).

**Reconciliation:**  
Line math: gross = qty × unitPrice; discount = (discountType == "Percentage") ? gross × % : min(fixed, gross); net = gross − discount. Total = sum of nets. Matches `orderUtils` functions.

---

### ORDERS-D04 | Delivery info card shows date, time, address, warehouse (gated)

**Preconditions:**  
Order #1001:
- Delivery date: 2026-06-28, time: 10:30.
- Address: "Tashkent, Mirabad 123".
- Status: Pending (pre-delivery).
- Warehouse: not yet set (null).

**Steps:**
1. Open order detail.
2. Scroll to "Доставка" card.

**Expected result:**
- Card title "Доставка".
- Rows:
  - Адрес доставки: "Tashkent, Mirabad 123" (or "— не указан" if null).
  - Дата доставки: "28 июня 2026" (formatted date).
  - Время доставки: "в 10:30" (if set) or "время не указано" (if null).
  - Склад списания: "— не выбран" or "Warehouse A" (if status Delivered/Returned).
- If status is pre-delivery (Pending/Processing/Shipping) and warehouse is set, show it but don't emphasize.
- If status is Delivered/Returned, warehouse shows prominently.

**Reconciliation:**  
Warehouse display gated by `order.status`; shown in detail only post-delivery.

---

### ORDERS-D05 | Status history timeline shows all transitions

**Preconditions:**  
Order #3001 transitioned: created (Pending) → process (Processing) → ship (Shipping) → deliver (Delivered). Each transition recorded with timestamp and actor.

**Steps:**
1. Open order #3001 detail.
2. Scroll to "История статусов" card.

**Expected result:**
- Timeline (vertical list) with entries (newest/oldest? check direction):
  - "Создан" · "создан" (label from i18n) · date/time · actor.
  - "Взят в обработку" (or similar per status) · date/time · actor.
  - "Отправлен" · date/time · actor.
  - "Доставлен" · date/time · actor.
- Each event shows the transition and timestamp.
- Order history reflects `order.history` array.

**Reconciliation:**  
History entries match `order.history` array in API response.

---

### ORDERS-D06 | Partner mini card shows customer name, type badge, balance, customer name is link

**Preconditions:**  
Order #1001, customer "Alice" (type "Customer"), balance 5000 (Alice owes the business).

**Steps:**
1. Open order #1001 detail.
2. Observe right sidebar, first card (Partner mini).

**Expected result:**
- Card shows:
  - Avatar (initials "A" on primary-soft bg).
  - Name "Alice" (bold, primary color, underline on hover, clickable).
  - Type badge: "Клиент" (blue-ish background).
  - Separator line.
  - Balance label: "Вам должны <amount>" (green) or "Вы должны <amount>" (red) or "Нет долга" (gray).
  - Balance value formatted as currency (e.g., "5,000 UZS").
- Clicking "Alice" navigates to `/partners/<customerId>`.

**Reconciliation:**  
Partner balance fetched from order's `customerBalance` field.

---

### ORDERS-D07 | Financial card shows order total, position count, source, status

**Preconditions:**  
Order #1001, total 12700, 2 lines, source "Telegram", status Pending.

**Steps:**
1. Open order detail.
2. Observe right sidebar, second card (Financial / Финансовая).

**Expected result:**
- Card shows:
  - Label: "Сумма заказа" (secondary color).
  - Large value: "12,700" (numeric font, primary color, bold) + "UZS" (secondary, small).
  - Separator.
  - Rows:
    - Клиент: "Alice" (or value).
    - Позиций: "2" (numeric).
    - Источник: "Telegram" (chip) or "—" if "None".
    - Статус: Pending badge.
- If order is pre-delivery, info box at bottom: "Деньги и склад не затронуты, пока заказ не доставлен".

**Reconciliation:**  
Total computed from lines; position count = `order.lines.length`.

---

### ORDERS-D08 | Promote-to-Sale hint shows when Shipping (ready to deliver)

**Preconditions:**  
Order #2001, status Shipping.

**Steps:**
1. Open order #2001 detail.
2. Scroll right sidebar to bottom.

**Expected result:**
- Blue info box (primary-soft background) with primary-colored icon (ReceiptLongOutlinedIcon).
- Text: "Подтверждение доставки спишет товар со склада и создаст окончательную продажу."

**Reconciliation:**  
Hint shown when `ORDER_NEXT_STEP[status].promote` is true (only for Shipping).

---

### ORDERS-D09 | Terminal banner shows for Cancelled, Rejected, Returned

**Preconditions:**  
Order #4001 (Cancelled), order #5001 (Rejected), order #6001 (Returned with saleId).

**Steps:**
1. Open order #4001 detail.
2. Below stepper, observe banner:
   - Title: "Заказ отменён".
   - Body: "Движения товара и денег не было — заказ закрыт без продажи."
3. Open order #5001.
4. Observe banner: "Заказ отклонён клиентом", body "Клиент отказался от заказа до доставки."
5. Open order #6001.
6. Observe banner: "Заказ возвращён", body "Создан возврат продажи. Исходная продажа остаётся в учёте."

**Expected result:**
- Terminal banner (TerminalBanner component) renders only for final statuses: Cancelled, Rejected, Returned.
- Color and icon vary by status.
- No banner for Pending/Processing/Shipping/Delivered.

**Reconciliation:**  
Terminal states defined in `orderUtils`.

---

### ORDERS-D10 | Forward action button (Взять в обработку / Отправить / Подтвердить доставку)

**Preconditions:**  
Orders: #1001 (Pending), #2001 (Processing), #3001 (Shipping).

**Steps:**
1. Open order #1001 detail.
2. Observe top-right primary button: "Взять в обработку" (process icon).
3. Open order #2001.
4. Observe button: "Отправить" (shipping icon).
5. Open order #3001.
6. Observe button: "Подтвердить доставку" (check icon).

**Expected result:**
- Button text and icon match the next transition action.
- Clicking button executes the transition (for Pending/Processing, direct API call; for Shipping, opens delivery confirmation modal).
- Button is always enabled (no disabled state when clean).

**Reconciliation:**  
Action derived from `ORDER_NEXT_STEP[status]`.

---

### ORDERS-D11 | Menu button (⋮) shows context-sensitive actions

**Preconditions:**  
Orders: #1001 (Pending), #3001 (Delivered).

**Steps:**
1. Open order #1001 detail.
2. Click menu button (⋮).
3. Observe menu items:
   - "Редактировать" (EditOutlinedIcon).
   - "Скачать" (DownloadOutlinedIcon).
   - Divider.
   - "Отметить отклонён клиентом" (CloseIcon, saffron/warning color).
   - "Отменить заказ" (DeleteOutlineIcon, error color).
4. Click away to close menu.
5. Open order #3001 (Delivered).
6. Click menu.
7. Observe:
   - "Скачать".
   - "Оформить возврат" (UndoOutlinedIcon, error color).

**Expected result:**
- Edit: shown only for pre-delivery orders (Pending/Processing/Shipping).
- Download: always shown (toasts "Готовится PDF…" on click).
- Reject & Cancel: shown only for pre-delivery.
- Return: shown only for Delivered.
- No actions for Cancelled/Rejected/Returned (except Download).

**Reconciliation:**  
Menu actions gated by `isOrderEditable()` and order status.

---

### ORDERS-D12 | Promoted sale link shows for Delivered and Returned

**Preconditions:**  
Order #3001 (Delivered, saleId 5001), order #6001 (Returned, saleId 5002).

**Steps:**
1. Open order #3001 detail.
2. In header area (after primary button), observe green-tinted box:
   - Icon: ReceiptLongOutlinedIcon.
   - Caption: "Оформлено как продажа" (in green).
   - Sale ID: "#5001" (large, numeric).
   - Chevron right icon.
3. Click the sale link.
4. Observe toast: "Продажа #5001 — оформлена при доставке заказа".
5. Open order #6001.
6. Observe similar link but muted (gray bg/border): "Исходная продажа" (not "Оформлено как") + "#5002".

**Expected result:**
- Sale link appears in header for Delivered (green, "Оформлено как продажа") and Returned (gray, "Исходная продажа").
- Link click toasts the sale info (navigation not implemented; info toast only).

**Reconciliation:**  
Sale promotion link present only when `order.saleId` is set.

---

## Create Order (New Order / Новый заказ)

### ORDERS-N01 | New order page loads and auto-defaults warehouse

**Preconditions:**  
Tenant has ≥1 active warehouse, ≥1 active customer partner, ≥1 product.

**Steps:**
1. Navigate to `/orders/new` (or click "Новый заказ" from list).
2. Wait for page to load.

**Expected result:**
- Breadcrumb: "Заказы > Новый заказ".
- Page title: "Новый заказ" (heading).
- Back button and cancel link.
- Left column:
  - Selectors card: Client (empty, required), Warehouse (auto-defaults to first), Source (None).
  - Date/time: Delivery date (required, empty), delivery time (optional, empty).
  - Product search bar (auto-focuses on page load per design).
  - Empty cart (no items).
- Right sidebar:
  - "Выберите клиента…" placeholder card.
  - Summary rows (all showing placeholders or dashes).
  - Address input (empty).
  - Note input (empty).
  - "Заказ можно изменить…" info box.
  - "Создать заказ" button (enabled).

**Expected result (continued):**
- Warehouse picker pre-filled with first warehouse ID.
- Focus is on product search input (SearchIcon visible, white background).

**Reconciliation:**  
Initial state matches `NewOrder` component defaults.

---

### ORDERS-N02 | Select customer and observe balance card update

**Preconditions:**  
On New Order page. Customer "Alice" exists with balance 5000 (Alice owes).

**Steps:**
1. Click the "Клиент" picker.
2. Type "Alice" or see her in dropdown.
3. Click to select "Alice".

**Expected result:**
- Picker updates to show "Alice" + type badge "Клиент".
- Right sidebar updates: customer card now shows Alice's avatar, name (clickable), type badge.
- Balance row: "Вам должны 5,000 UZS" (green).
- Summary rows update to show client name.

**Reconciliation:**  
Balance fetched from partner's `balance` field.

---

### ORDERS-N03 | Validate required fields and show errors

**Preconditions:**  
On New Order page with no fields filled.

**Steps:**
1. Leave all fields blank.
2. Click "Создать заказ" (submit).
3. Observe page doesn't submit.
4. Errors appear:
   - Client field border red, error message "Выберите клиента".
   - Warehouse field border red (if unset), error "Выберите склад" (but default should be set, so may not show).
   - Delivery date border red, error "Укажите дату доставки".
   - Cart shows error state: "Добавьте хотя бы одну позицию".
5. Add a customer, a delivery date, and 1 product.
6. Click submit again.

**Expected result:**
- Validation is on-submit, not real-time.
- Required fields: Client, Warehouse (if unset), Delivery date, ≥1 line.
- Errors display inline with red border and helper text.
- Cart error state: background changes to error tone, error icon, bold text.
- Submit doesn't fire until all errors resolved.

**Reconciliation:**  
Validation logic in `NewOrder` component (`clientErr`, `warehouseErr`, `deliveryErr`, `linesErr`).

---

### ORDERS-N04 | Add product from search and observe stock guidance

**Preconditions:**  
New Order page. Warehouse "A" selected. Product "Widget" (stock 10 in warehouse A) and "Gadget" (stock 2).

**Steps:**
1. Click product search input.
2. Type "Widget".
3. Observe dropdown shows "Widget" with SKU and salePrice.
4. Click to add.
5. Observe:
   - Product search input clears and refocuses.
   - Cart now shows 1 line: "Widget" · qty 1 · stock indicator: "На складе: 10 шт".
   - Summary updates: subtotal, total.
6. Add "Gadget" (stock 2).
7. In "Gadget" line, see "На складе: 2 шт".
8. Change "Gadget" qty to 5 (more than stock).
9. Observe warning: "· больше остатка (не блокирует)" (orange/warning color, but doesn't block).

**Expected result:**
- Search is debounced/instant, filters by name or SKU.
- Picking a product adds it to cart with qty 1, defaults to `product.salePrice`.
- Search input clears after add, refocuses (ready for next product).
- Stock is shown per line as "На складе: <count> <unit>" where unit is from `MEASUREMENT_SHORT`.
- Over-stock qty shows warning text but DOES NOT block creation (only guidance).
- Warehouse must be set for stock to show; if not set, shows "Выберите склад, чтобы увидеть остаток".

**Reconciliation:**  
Stock loaded from product's `warehouseItems` array, filtered by warehouseId.

---

### ORDERS-N05 | Edit line item qty, unit price, discount

**Preconditions:**  
New Order with 1 line: "Widget" qty 2, price 5000, no discount → total 10000.

**Steps:**
1. In the line, observe:
   - Qty stepper: − button · input (2) · + button.
   - Unit price: × · input (5000).
   - Discount: input (0) · type toggle (% selected).
2. Click − to reduce qty to 1.
3. Observe subtotal updates to 5000.
4. Click the unit price input, clear, type "6000".
5. Observe subtotal updates to 6000.
6. Click the discount input, type "1000".
7. Observe discount type toggle; currently "%" should be selected.
8. Click "%" to toggle to "$" (fixed).
9. Observe discount now shows as fixed 1000 (not 1000%).
10. In summary, observe discount row: "−1,000" and total now 5000 (6000 − 1000).

**Expected result:**
- Qty stepper: − disabled if qty ≤ 1; + always enabled. Input validates ≥1.
- Unit price: numeric input, can be 0.
- Discount: numeric input (value), type toggle (Percentage / Fixed).
  - Percentage: `discount% of gross` (e.g., 10% of 6000 = 600).
  - Fixed: `min(discountValue, gross)` (e.g., 1000 on 6000 = 1000; 1000 on 5000 = 1000).
- Summary updates live: subtotal, discount amount, total.
- Line total: shows gross − discountAmount (e.g., "5,000" if 1000 discount).

**Reconciliation:**  
Line math in `NewOrder` using `lineGrossOf`, `lineDiscountOf`, `lineTotalOf` helpers.

---

### ORDERS-N06 | Remove line from cart

**Preconditions:**  
New Order with 2 lines: "Widget", "Gadget".

**Steps:**
1. In the cart, find the "Gadget" line.
2. Click the trash icon (DeleteOutlineIcon) at the right.
3. Observe "Gadget" line removed.
4. Cart now shows "Позиции · 1".
5. Summary updates: total recomputed from 1 line.

**Expected result:**
- Delete icon removes the line from `items` array.
- Cart updates live.
- If all lines removed, cart shows empty state (SearchIcon + "Позиций пока нет").

**Reconciliation:**  
Line removal in `NewOrder` via `removeItem()`.

---

### ORDERS-N07 | Set delivery date and time

**Preconditions:**  
New Order page.

**Steps:**
1. Click the delivery date field (CalendarTodayOutlinedIcon).
2. Calendar picker opens (native date input).
3. Select a date (e.g., 28 June 2026).
4. Field shows "2026-06-28" (ISO format, then formatted on display).
5. Click the delivery time field (ScheduleOutlinedIcon).
6. Time picker opens (native time input).
7. Enter "10:30".
8. Field shows "10:30".
9. In summary card, observe "Доставка" row: "2026-06-28 · 10:30".

**Expected result:**
- Date field: required, type="date", ISO format "YYYY-MM-DD".
- Time field: optional, type="time", ISO format "HH:mm".
- Both show in summary and submitted in order creation.
- Validation: date required (shown by red border on submit if empty); time optional.

**Reconciliation:**  
Date/time collected in `deliveryDate`/`deliveryTime` state.

---

### ORDERS-N08 | Enter delivery address and note

**Preconditions:**  
New Order page.

**Steps:**
1. Scroll right sidebar.
2. Find "Адрес доставки" field (optional).
3. Type "Tashkent, Mirabad 123".
4. Find "Примечание" field (optional).
5. Type "Call before delivery".
6. Both fields appear in right sidebar.

**Expected result:**
- Address field: single-line text input, placeholder "Город, улица, дом…".
- Note field: multi-line text input (minRows: 2), placeholder "Комментарий к заказу…".
- Both optional; trimmed on submit (leading/trailing whitespace removed, null if empty).

**Reconciliation:**  
Address and note in `CreateOrderRequest`.

---

### ORDERS-N09 | Bulk discount toggle (apply to all lines at once)

**Preconditions:**  
New Order with 3 lines: Widget (price 5000), Gadget (price 3000), Thingamajig (price 2000).

**Steps:**
1. In one line, set discount to 10% (Widget).
2. In the summary, observe each line's discount.
3. Look for a "Применить скидку ко всем" button (if present in design).
4. (Note: This feature is mentioned in CLAUDE.md but not yet visible in current code; may be deferred.)

**Expected result:**
- Bulk discount button (if implemented) overwrites all lines' discount with the same value/type.
- If not yet implemented, document as designed gap (see end).

**Designed gap:**  
Bulk discount ("Применить скидку ко всем") mentioned in CLAUDE.md §10 is not yet wired in the code. Feature deferred.

---

### ORDERS-N10 | Keyboard shortcuts (Enter, Ctrl+Enter, Esc, ↑/↓, Alt+P/Alt+W)

**Preconditions:**  
New Order page with product search focused.

**Steps:**
1. Type "Wid" in search.
2. Press Enter.
3. Observe product added to cart (if autocomplete), search refocused.
4. Qty field in cart selected? (Check if Enter navigates to next line control.)
5. Press Escape.
6. Observe unsaved-changes dialog (if dirty): "Несохранённые изменения".
7. Click "Выйти без сохранения".
8. Navigate back to `/orders`.

**Expected result (from design; may be deferred):**
- Enter: next input in flow (e.g., from search to add, qty to price).
- Ctrl/Cmd+Enter: submit order.
- Esc: leave (guarded by unsaved check).
- ↑/↓: step qty in focused line.
- Alt+P: focus partner picker.
- Alt+W: focus warehouse picker.

**Designed gap:**  
Keyboard shortcuts are designed but may not be fully wired. Verify in code; document if deferred.

---

### ORDERS-N11 | Unsaved changes guard on back/cancel

**Preconditions:**  
New Order page with some data entered (e.g., customer selected, 1 product added).

**Steps:**
1. Click back button (ChevronLeftIcon) or "Отмена" link.
2. Observe dialog: title "Несохранённые изменения", body "Новый заказ ещё не создан…".
3. Buttons: "Остаться" · "Выйти без сохранения".
4. Click "Остаться".
5. Dialog closes, stay on page.
6. Click "Отмена" again.
7. Dialog reappears.
8. Click "Выйти без сохранения".
9. Navigate to `/orders`.

**Expected result:**
- Dirty state tracked (items, client, address, note, dates, source).
- Leaving (back/cancel) triggers confirm if dirty.
- If clean, navigates directly.

**Reconciliation:**  
Dirty flag in `NewOrder` component.

---

### ORDERS-N12 | Submit new order and redirect to detail

**Preconditions:**  
New Order form filled:
- Client: "Alice".
- Warehouse: "A".
- Delivery date: "2026-06-28".
- Delivery time: "10:30".
- Lines: 1 (Widget, qty 2, price 5000, no discount → total 10000).
- Address: "Tashkent, Mirabad 123".
- Note: "Call 30 min before".
- Source: "Telegram".

**Steps:**
1. Click "Создать заказ".
2. Observe loading state (button disabled? spinner?).
3. Wait for API response (POST `/api/orders`).
4. On success:
   - Toast: "Заказ #1001 создан".
   - Navigate to `/orders/1001` (detail page).
5. Verify order detail shows all fields as entered.

**Expected result:**
- Order created with status Pending.
- Order number auto-assigned by API (e.g., #1001).
- Order history seeded with creation event.
- All fields persisted.
- Toast confirms creation.

**Reconciliation (backend promises):**
- API POST `/api/orders` with `CreateOrderRequest`.
- Returns `Order` with id, orderNumber, status Pending, date (current), history.
- Customer balance fetched separately or included.

**Reconciliation (forward):**  
New order appears at top of orders list (sorted newest first).

---

### ORDERS-N13 | Error handling on create failure

**Preconditions:**  
New Order form valid but backend errors (network fail, validation fail, etc.).

**Steps:**
1. Fill form as in ORDERS-N12.
2. Mock backend to return 400 or 500.
3. Click "Создать заказ".
4. Wait for error response.

**Expected result:**
- Loading state ends.
- Error toast: "Не удалось создать заказ".
- Page stays on `/orders/new`.
- Form data preserved (not cleared).
- User can retry or adjust and resubmit.

**Reconciliation:**  
Error handling in `orderStore.create()`.

---

## Edit Order (OrderFormModal)

### ORDERS-E01 | Open edit modal from pre-delivery order

**Preconditions:**  
Order #1001 (Pending).

**Steps:**
1. Open order #1001 detail.
2. Click menu (⋮).
3. Click "Редактировать".

**Expected result:**
- Modal opens with title "Редактировать заказ #1001".
- Subtitle: "Деньги и склад не затрагиваются — заказ можно изменить до доставки".
- Form pre-populated with current order data:
  - Client: "Alice" (resolved from partner list).
  - Warehouse: current order's warehouse (or empty if null).
  - Source: current source.
  - Delivery date/time: current.
  - Lines: current (each line fully editable).
  - Address, note: current.
- Close button (X) in header.
- Cancel button (left), Save button (right) in footer.

**Expected result (continued):**
- All fields start clean (no "dirty" indication until user edits).

**Reconciliation:**  
Edit modal driven by `OrderFormModal` component; pre-populated from order.

---

### ORDERS-E02 | Edit order: change customer

**Preconditions:**  
Edit modal open for order #1001 (customer "Alice").

**Steps:**
1. Clear the "Клиент" autocomplete.
2. Type "Bob" (another customer).
3. Select "Bob".
4. Customer updates in form.
5. (Note: Summary doesn't show customer balance in edit modal, unlike New Order.)

**Expected result:**
- Autocomplete filters by customer type (Type = "Customer" only, like New Order).
- Customer changes; can submit with new customer.

**Reconciliation:**  
Customer change allowed pre-delivery.

---

### ORDERS-E03 | Edit order: add/remove lines

**Preconditions:**  
Edit modal for order #1001 (2 lines: Widget, Gadget).

**Steps:**
1. Observe current lines.
2. Find product search field (TextField autocomplete).
3. Type "Thingamajig", select to add.
4. Observe new line added to list (now 3 lines).
5. In "Gadget" line, click delete icon.
6. "Gadget" removed (now 2 lines: Widget, Thingamajig).
7. Click Save.
8. Modal closes.
9. Detail page updates to show 2 lines.

**Expected result:**
- Lines list starts with current lines from order.
- Product autocomplete filters to products not yet in the list (no duplicates).
- Adding/removing updates line count and total display.
- Saving persists changes.

**Reconciliation:**  
Line editing in `OrderFormModal`.

---

### ORDERS-E04 | Edit order: change warehouse (now optional)

**Preconditions:**  
Edit modal for order #1001 (warehouse "A" set).

**Steps:**
1. Click warehouse dropdown (select field with displayEmpty).
2. Observe current selection: "A".
3. Options: "Не выбран" · "A" · "B" · "C" (etc.).
4. Select "Не выбран" (empty).
5. Warehouse field shows empty.
6. Or select "B".
7. Warehouse updates to "B".
8. Click Save.
9. Detail updates.

**Expected result:**
- Warehouse field is a `TextField select` (not required on edit).
- Can be set, cleared, or changed.
- If cleared, order's intended warehouse is removed (warehouseId = null).
- On delivery, warehouse must be chosen again (delivery modal).

**Reconciliation:**  
Warehouse optional on edit per CLAUDE.md; `UpdateOrderRequest.warehouseId?: number | null` handles both undefined (omit) and null (explicit clear).

---

### ORDERS-E05 | Edit order: unsaved changes guard

**Preconditions:**  
Edit modal open.

**Steps:**
1. Change a field (e.g., qty).
2. Click close (X) or Cancel without saving.
3. Observe discard dialog: "Несохранённые изменения".
4. Click "Отмена" (cancel discard).
5. Return to modal (changes preserved).
6. Click X again.
7. Dialog reappears.
8. Click "Отказаться" (confirm discard).
9. Modal closes, changes discarded.

**Expected result:**
- Dirty tracking on form changes.
- Close without save triggers confirm if dirty.
- Saving clears dirty state.

**Reconciliation:**  
`useDirtyClose` hook in `OrderFormModal`.

---

### ORDERS-E06 | Submit edit and return to detail

**Preconditions:**  
Edit modal with changes (e.g., qty changed from 2 to 3).

**Steps:**
1. Click "Сохранить".
2. Loading state (button disabled?).
3. Wait for API response (PUT `/api/orders/<id>`).
4. On success:
   - Toast: "Заказ #1001 обновлён".
   - Modal closes.
   - Detail page reloads to show updated data.

**Expected result:**
- Order updated via API.
- All edited fields persisted.
- Toast confirms save.
- Detail reflects changes immediately.

**Reconciliation:**  
`OrderStore.update()` calls `OrderApi.update()` with `UpdateOrderRequest`.

---

### ORDERS-E07 | Edit validation errors

**Preconditions:**  
Edit modal with valid data.

**Steps:**
1. Clear the client field.
2. Clear delivery date.
3. Remove all lines.
4. Click "Сохранить".
5. Observe error alert at top: "Заполните обязательные поля: клиент, дата доставки, хотя бы одна позиция."
6. Fields show red borders.
7. Fix errors (add client, date, line).
8. Click "Сохранить" again.

**Expected result:**
- Required fields: client, delivery date, ≥1 line.
- Warehouse optional.
- Validation on submit.
- Error alert lists missing fields.

**Reconciliation:**  
Validation in `OrderFormModal`.

---

### ORDERS-E08 | Edit not available for Delivered and beyond

**Preconditions:**  
Order #3001 (Delivered).

**Steps:**
1. Open order #3001 detail.
2. Click menu (⋮).
3. Observe no "Редактировать" item (or it's absent).

**Expected result:**
- Edit only shown/enabled for pre-delivery orders (Pending/Processing/Shipping).
- Delivered/Cancelled/Rejected/Returned cannot be edited.

**Reconciliation:**  
Menu conditional on `isOrderEditable(order.status)`.

---

## Delivery Confirmation (DeliveryConfirmModal)

### ORDERS-DELIV01 | Open delivery modal from Shipping order

**Preconditions:**  
Order #2001 (Shipping).

**Steps:**
1. Open order #2001 detail.
2. Click "Подтвердить доставку" (primary button).
3. Modal opens.

**Expected result:**
- Title: "Подтвердить доставку".
- Subtitle: "Заказ #2001 · Alice".
- Warehouse dropdown (pre-filled with order's intended warehouse, or first if not set).
- Info text: "Заказ будет доставлен и преобразован в продажу…".
- Stock check table below.

**Reconciliation:**  
Modal driven by `DeliveryConfirmModal` component, opened via `orderStore.openDelivery()`.

---

### ORDERS-DELIV02 | Stock check: all items sufficient

**Preconditions:**  
Order #2001 (Shipping) with 2 lines:
- Widget: qty 2 ordered, warehouse "A" has 10 in stock.
- Gadget: qty 1 ordered, warehouse "A" has 5 in stock.

**Steps:**
1. Open delivery modal for order #2001.
2. Warehouse pre-filled with "A" (order's intended warehouse).
3. Below warehouse field, stock check section shows:
   - Header: "Проверка остатков на складе" · green checkmark + "Хватает на всё".
   - Rows:
     - Widget: "в наличии 10 шт" (green ✓), sub-row "в заказе 2 шт".
     - Gadget: "в наличии 5 шт" (green ✓), sub-row "в заказе 1 шт".
4. No error alert.
5. Click "Доставить и создать продажу" button (enabled).

**Expected result:**
- Stock check passes (all lines have sufficient stock).
- Header shows green checkmark + "Хватает на всё".
- Line rows show green status for each item.
- Submit button enabled.

**Reconciliation:**  
Stock validation in `DeliveryConfirmModal` via `checks` array; `allOk` determines header tone and button state.

---

### ORDERS-DELIV03 | Stock check: shortfall detected

**Preconditions:**  
Order #2001 (Shipping) with 2 lines:
- Widget: qty 2 ordered, warehouse "A" has 10 (OK).
- Gadget: qty 5 ordered, warehouse "A" has 2 (SHORTFALL).

**Steps:**
1. Open delivery modal.
2. Warehouse pre-filled with "A".
3. Observe stock check section:
   - Header: red × + "Не хватает: 1" (count of short lines).
   - Widget row: green ✓, "в наличии 10 шт".
   - Gadget row: red background, red × + error icon, "Недостаточно товара: доступно 2 шт, в заказе 5 шт".
4. "Доставить и создать продажу" button disabled (or enabled but validation blocks on click).
5. Click button anyway.
6. Error alert: "Доставка заблокирована: не хватает остатка по 1 позиц. на складе «A». Выберите другой склад или измените заказ."

**Expected result:**
- Shortfall detected: line count in header.
- Short lines highlighted in red with "Недостаточно товара" message.
- Submit blocked (hard stop).
- Error alert explains issue.
- User must change warehouse or go back to edit order.

**Reconciliation:**  
Validation in `DeliveryConfirmModal`; shortfall check blocks submit (`allOk` check).

---

### ORDERS-DELIV04 | Change warehouse and re-check stock

**Preconditions:**  
Delivery modal with shortfall (Widget ok in "A", Gadget short in "A").

**Steps:**
1. Warehouse "B" has 10 Gadgets.
2. Click warehouse dropdown.
3. Select "B".
4. Stock check updates:
   - Widget: now shows warehouse "B" stock (assume 0 → SHORT).
   - Gadget: now shows "в наличии 10 шт" (OK).
5. Header now shows shortfall (Widget short).
6. Error still blocks submit.

**Expected result:**
- Changing warehouse re-runs stock check immediately.
- Each line queries stock for the selected warehouse.
- Header and error messages update.

**Reconciliation:**  
Stock check re-computed when warehouse changes.

---

### ORDERS-DELIV05 | Submit delivery confirmation and promote to sale

**Preconditions:**  
Delivery modal open, warehouse selected, all stock OK.

**Steps:**
1. Observe info box: "Убедитесь, что на складе достаточно товара для отгрузки."
2. Click "Доставить и создать продажу".
3. Loading state (button disabled).
4. Wait for API response (POST `/api/orders/<id>/deliver` with warehouse ID).
5. On success:
   - Modal closes.
   - Toast: "Заказ #2001 доставлен · создана продажа #5001".
   - Detail page updates:
     - Status changes to "Delivered".
     - Stepper completes.
     - Terminal banner appears (none for Delivered actually, unlike Cancelled).
     - Sale link appears (green, "Оформлено как продажа #5001").
     - Warehouse row now shows "A" (write-off warehouse).

**Expected result:**
- Order transitions to Delivered.
- Sale created and linked (saleId set).
- Order history updated with delivery event.
- Menu no longer shows Reject/Cancel (only Download, Return).

**Reconciliation (backend promises):**
- POST `/api/orders/<id>/deliver` with `{ warehouseId }`.
- Returns updated `Order` with status Delivered, saleId, warehouseId, history.
- Sale is created (self-contained, doesn't mutate Products mock per CLAUDE.md limitation).

---

### ORDERS-DELIV06 | Delivery modal cancel/close

**Preconditions:**  
Delivery modal open.

**Steps:**
1. Click X (close) or "Отмена".
2. Modal closes.
3. Order detail still shows status Shipping (unchanged).

**Expected result:**
- Close without confirm; modal dismissed.
- No changes to order.

**Reconciliation:**  
Modal state managed by `dialogMode` in OrderStore.

---

## State Transitions (Process / Ship / Cancel / Reject / Return)

### ORDERS-S01 | Pending → Processing (process action)

**Preconditions:**  
Order #1001 (Pending).

**Steps:**
1. Open order detail.
2. Click "Взять в обработку".
3. Loading state.
4. Wait for API (POST `/api/orders/<id>/process`).
5. On success:
   - Toast: "Заказ #1001: взят в обработку".
   - Status updates to "Processing".
   - Stepper updates (Processing now filled).
   - Button changes to "Отправить".
   - Menu Reject/Cancel still available.

**Expected result:**
- Linear transition Pending → Processing.
- No dialog; direct API call.

**Reconciliation:**  
`OrderStore.process()` calls `OrderApi.process()`.

---

### ORDERS-S02 | Processing → Shipping (ship action)

**Preconditions:**  
Order #2001 (Processing).

**Steps:**
1. Open order detail.
2. Click "Отправить".
3. Toast: "Заказ #2001: отправлен".
4. Status → Shipping.
5. Stepper updates.
6. Button changes to "Подтвердить доставку" (delivery action, which opens modal).

**Expected result:**
- Linear transition Processing → Shipping.

**Reconciliation:**  
`OrderStore.ship()` calls `OrderApi.ship()`.

---

### ORDERS-S03 | Shipping → Delivered (deliver action via modal)

**Preconditions:**  
Order #3001 (Shipping).

**Steps:**
1. Open order detail.
2. Click "Подтвердить доставку".
3. Delivery modal opens.
4. (See ORDERS-DELIV** test cases.)
5. Click "Доставить и создать продажу" (all stock OK).
6. Toast: "Заказ #3001 доставлен · создана продажа #5001".
7. Order transitions to Delivered.
8. Sale link appears.

**Expected result:**
- Delivery promotion (Shipping → Delivered + Sale creation).

**Reconciliation:**  
`OrderStore.deliver()` calls `OrderApi.deliver()` with warehouse ID.

---

### ORDERS-S04 | Cancel action (Pending/Processing/Shipping only)

**Preconditions:**  
Order #1001 (Pending).

**Steps:**
1. Open order detail.
2. Click menu (⋮).
3. Click "Отменить заказ".
4. Confirm dialog: title "Отменить заказ #1001?", body "Заказ Alice будет отменён. Товар и деньги не затронуты. Действие необратимо." Buttons: "Назад" · "Отменить заказ" (danger).
5. Click "Отменить заказ".
6. Toast: "Заказ #1001 отменён".
7. Status → Cancelled.
8. Stepper shows Cancelled (struck-through).
9. Terminal banner: "Заказ отменён", body "Движения товара и денег не было — заказ закрыт без продажи."
10. Menu only shows Download now.

**Expected result:**
- Cancel is available pre-delivery (Pending/Processing/Shipping).
- Confirm dialog required.
- Status becomes Cancelled (terminal).
- No stock or payment changes.

**Reconciliation:**  
`OrderStore.cancel()` calls `OrderApi.cancel()`.

---

### ORDERS-S05 | Reject action (Pending/Processing/Shipping only)

**Preconditions:**  
Order #1001 (Pending).

**Steps:**
1. Click menu.
2. Click "Отметить отклонён клиентом" (saffron/warning color).
3. Confirm dialog: "Отметить заказ #1001 отклонённым?", body "Заказ будет помечен как отклонён клиентом и закрыт без доставки."
4. Click "Отметить отклонённым".
5. Toast: "Заказ #1001 отмечен как отклонён".
6. Status → Rejected.
7. Terminal banner: "Заказ отклонён клиентом", body "Клиент отказался от заказа до доставки."

**Expected result:**
- Reject available pre-delivery only.
- Terminal status (can't move forward).
- No stock/payment changes.

**Reconciliation:**  
`OrderStore.reject()` calls `OrderApi.reject()`.

---

### ORDERS-S06 | Return action (Delivered only)

**Preconditions:**  
Order #3001 (Delivered, saleId 5001).

**Steps:**
1. Open order detail.
2. Click menu.
3. Click "Оформить возврат" (error red color).
4. Confirm dialog: "Оформить возврат по заказу #3001?", body "Будет создан возврат продажи #5001. Исходная продажа останется в учёте без изменений." Buttons: "Назад" · "Оформить возврат" (danger).
5. Click "Оформить возврат".
6. Toast: "Создан возврат по заказу #3001".
7. Status → Returned.
8. Stepper completes (Returned is terminal).
9. Terminal banner: "Заказ возвращён", body "Создан возврат продажи. Исходная продажа остаётся в учёте."
10. Sale link remains but is now muted (gray, "Исходная продажа").

**Expected result:**
- Return available only for Delivered.
- Creates a refund transaction (linked by saleId).
- Order becomes Returned (terminal).
- Original Sale unmodified.

**Reconciliation:**  
`OrderStore.returnOrder()` calls `OrderApi.returnOrder()`.

---

## Reconciliation & Cross-Module Assertions

### ORDERS-REC01 | Create order does NOT mutate product stock

**Preconditions:**  
Product "Widget" with warehouse "A" stock 100.

**Steps:**
1. Create order with 10 units of Widget.
2. Navigate to Products module or check product stock.
3. Warehouse "A" stock for Widget should still be 100.

**Expected result:**
- Order creation does NOT reserve or deduct stock.
- Stock only changes on delivery confirmation.

**Reconciliation note (known limitation):**  
Order creation is mocked; promotion to Sale also doesn't mutate stock in current mock (per CLAUDE.md). On real backend, stock mutation will happen at delivery.

---

### ORDERS-REC02 | Create order does NOT affect customer balance

**Preconditions:**  
Customer "Alice" with balance 5000.

**Steps:**
1. Create order for Alice for 10000.
2. Check Alice's balance via Partners module.
3. Balance should still be 5000.

**Expected result:**
- Order is a pre-money intent; doesn't create debt.
- Debt is created only when order promotes to Sale (on delivery).

**Reconciliation note (known limitation):**  
Promotion to Sale is mocked; balance doesn't change (per CLAUDE.md). On real backend, Sale creation will increase Alice's debt.

---

### ORDERS-REC03 | Delivery confirmation creates linked Sale

**Preconditions:**  
Order #2001 (Shipping, 2 lines).

**Steps:**
1. Confirm delivery (see ORDERS-DELIV05).
2. Order transitions to Delivered, saleId set (e.g., 5001).
3. Navigate to Sales module.
4. Search for Sale #5001.
5. Sale exists with same customer, lines, date.

**Expected result:**
- Sale created with same lines, totals, customer.
- Sale linked back to order (order.saleId = 5001).
- Sale is immutable (can only refund, not edit).
- Sale appears in Sales/Supplies feed.

**Reconciliation note (known limitation):**  
Sale creation in current mock is self-contained; Transactions mock doesn't cross-reference. On real backend, Sale will be queryable and reconcile.

---

### ORDERS-REC04 | Return order creates refund transaction

**Preconditions:**  
Order #3001 (Delivered, saleId 5001).

**Steps:**
1. Confirm return (see ORDERS-S06).
2. Order transitions to Returned.
3. Navigate to Sales module.
4. Find Sale #5001 detail.
5. Refund exists (row with same lines but negative quantity).

**Expected result:**
- Refund created for the original Sale #5001.
- Refund references the Sale.
- Return order references the Sale (originalSaleId or similar).
- Refund is immutable.

**Reconciliation note (known limitation):**  
Refund creation is mocked. On real backend, refund will deduct from customer debt or create an advance.

---

### ORDERS-REC05 | Order history timeline matches status transitions

**Preconditions:**  
Order #3001 transitioned Pending → Processing → Shipping → Delivered over time.

**Steps:**
1. Open order detail.
2. Check status history timeline.
3. Entries should show (in order, from oldest to newest):
   - Creation (Pending).
   - Process action (Pending → Processing).
   - Ship action (Processing → Shipping).
   - Delivery action (Shipping → Delivered).
4. Each entry shows timestamp, actor (user or system), transition.

**Expected result:**
- History array in `order.history` matches the state machine transitions.
- Each event has `from`, `to`, `at`, `by` fields.

**Reconciliation:**  
History array from API; events are cumulative (immutable, append-only).

---

## Error Scenarios

### ORDERS-ERR01 | API timeout on order list load

**Preconditions:**  
Network slow or backend slow.

**Steps:**
1. Navigate to `/orders`.
2. Wait >2 seconds.
3. Observe no data; page may show loading state or empty.

**Expected result:**
- Spinner or skeleton (loading state).
- If timeout occurs, error toast: "Не удалось загрузить заказы".
- Empty list shown (or retry button).

**Reconciliation:**  
Error handling in `OrderStore.getAll()`.

---

### ORDERS-ERR02 | Order not found (404 on detail load)

**Preconditions:**  
Navigate directly to `/orders/999999` (non-existent order).

**Steps:**
1. Load URL.
2. Page fetches order, gets 404.

**Expected result:**
- Message: "Заказ не найден".
- Back link to orders list.

**Reconciliation:**  
Error handling in `OrderDetailPage`.

---

### ORDERS-ERR03 | Transition fails (business rule violation)

**Preconditions:**  
Order #1001 (Pending). Backend has validation (e.g., must have ≥1 line; this shouldn't happen but test defensive).

**Steps:**
1. Click "Взять в обработку".
2. Mock backend to return 400 (validation error).
3. Wait for response.

**Expected result:**
- Error toast: "Не удалось изменить статус заказа".
- Order remains in current status.
- User can retry.

**Reconciliation:**  
Error handling in `OrderStore.runTransition()`.

---

### ORDERS-ERR04 | Delivery blocked by insufficient stock (hard validation)

**Preconditions:**  
Delivery modal, shortfall detected (see ORDERS-DELIV03).

**Steps:**
1. Click "Доставить и создать продажу" (attempt submit).
2. Frontend validation blocks (allOk = false).
3. Error alert appears.

**Expected result:**
- User cannot proceed.
- Must change warehouse or cancel.

**Reconciliation:**  
Hard block on delivery if stock insufficient.

---

## Designed Gaps & Limitations

1. **Bulk discount ("Применить скидку ко всем"):** Mentioned in design but not yet wired in New Order. Deferred.
2. **Keyboard shortcuts (Ctrl+Enter, Esc, ↑/↓, Alt+P/W):** Designed but may be deferred. Verify in code.
3. **Stock mutation on delivery:** Current mock does NOT mutate Products stock on delivery promotion (known limitation per CLAUDE.md). Real backend will.
4. **Balance mutation on delivery:** Current mock does NOT create debt on Sale promotion (known limitation per CLAUDE.md). Real backend will.
5. **Payment integration:** Orders have no payment flow (no wallets, no settlement). Sales created from orders are immutable and must be settled via Payments module separately.
6. **Warehouse choice gating:** Warehouse shown as "Склад списания" on detail is gated to Delivered/Returned status only (not shown for pending). This is by design (intended warehouse at creation, written-off warehouse at delivery).
7. **PDF download:** "Скачать" action toasts "Готовится PDF…" but actual PDF generation not implemented. Deferred.
8. **Sale link navigation:** Clicking sale link in order detail toasts info message (navigation not wired). On real backend, will deep-link to Sale detail.
9. **Rejection from pre-delivery:** "Отметить отклонён клиентом" is a status, not a soft deletion. Order remains in system, marked terminal.
10. **Cancelled vs Rejected distinction:** Both are terminal but represent different business events (internal cancellation vs customer rejection). UI distinguishes via icons/colors.

---

## Key Fields & Validation Summary

| Field | Type | Required | Notes |
|-------|------|----------|-------|
| Client | Partner autocomplete | Y (create), Y (edit) | Type = "Customer" only |
| Warehouse | Dropdown | Y (create) | Optional on edit; always chosen at delivery |
| Source | Enum dropdown | N | None / Telegram / OmborWeb |
| Delivery Date | Date (ISO) | Y | Required; past dates allowed pre-delivery (overdue status) |
| Delivery Time | Time (ISO) | N | Optional; "HH:mm" format |
| Address | Text | N | Free-form; trimmed, null if empty |
| Note | Text | N | Free-form; trimmed, null if empty |
| Lines | Array | Y, ≥1 | Each line: productId, qty (≥1), unitPrice (≥0), discount (0–100% or fixed), discountType |
| Discount type | "Percentage" \| "Fixed" | — | Per-line choice |

---

## URL Routes Summary

| Route | Action |
|-------|--------|
| `/orders` | Orders list (all filters, search, export, create button) |
| `/orders/:id` | Order detail (stepper, positions, sidebar, menu actions) |
| `/orders/new` | New order POS (full-page form, customer/warehouse/date/lines/address/note) |

---

## i18n Namespace (order.json) Highlights

All labels use the `order.*` namespace (keyed in `src/i18n/ru/order.json`). Key prefixes:
- `order.title`, `order.create`: "Заказы", "Новый заказ"
- `order.status.*`: "Ожидает", "В обработке", "Доставляется", "Доставлен", "Отменён", "Отклонён", "Возвращён"
- `order.action.*`: "Взять в обработку", "Отправить", "Подтвердить доставку", "Отменить заказ", "Оформить возврат", etc.
- `order.detail.*`: Detail page-specific labels
- `order.edit.*`: Edit modal labels
- `order.deliver.*`: Delivery confirmation modal labels
- `order.new.*`: New Order page labels
- `order.toast.*`: Toast messages on success
- `order.error.*`: Error messages

All copy is Russian (interface language); Uzbek backfill deferred.

---

## Summary

The **Orders module** provides a complete mutable-transaction workflow for customer purchase orders. Tester should verify:

1. **List view:** Filters (status, search, date), sort, CSV export, empty states.
2. **Creation:** Full-page New Order POS with real-time validation, stock guidance (non-blocking), unsaved-changes guard.
3. **Detail:** Stepper, positions, sidebar (partner + financial), terminal banners, menu actions, history timeline.
4. **Edit:** Pre-delivery only, modal, dirty tracking, line item CRUD.
5. **Delivery:** Modal with per-line hard-blocking stock validation, warehouse selection, Sale promotion.
6. **State machine:** Pending → Processing → Shipping → Delivered (+ Cancel, Reject, Return branches).
7. **Reconciliation:** Order→Sale link, history timeline, no stock/balance mutation in mock (known).

All major flows are testable end-to-end on the deployed dev environment.
