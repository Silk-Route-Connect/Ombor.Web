# Stock Adjustments Module — Browser Test Cases

**Module:** Stock Adjustments (Корректировки)  
**Environment:** Deployed dev (app.miraziz.net / api.miraziz.net)  
**Backend:** Mocked at `/api/stock-adjustments` (immutable)  
**Localization:** Russian UI  
**Currency:** All amounts UZS  

---

## Overview

Stock Adjustments record non-transactional inventory changes: loss (damage, theft, expiry, recount correction) via Decrease direction, and found/corrected stock via Increase direction. Adjustments are **immutable** — no edit, no delete. Each adjustment must specify a warehouse, product, direction, quantity, and reason (direction-specific). An optional note captures context. The module provides a list view with search/filter/export, and a create modal with hard-validation for non-negative stock.

---

## Preconditions (Tenant Setup)

- Tenant is empty; all data built up during test execution.
- At least **2 warehouses** are seeded (system creates Warehouse #1 at setup; create Warehouse #2 for multi-warehouse tests).
- At least **5 products** are seeded with stock in multiple warehouses (using the Products module or via the opening-stock warehouse flow).
- Current user: any authenticated user (mock creates by "Бахром Саидов", real backend will use session user).
- Mocks are ON (origin-agnostic matchers at `*/api/stock-adjustments`).

---

## Test Cases

### STOCK-ADJUSTMENTS-01 · List View — Initial Empty State
**Preconditions:**  
No adjustments exist yet.

**Steps:**
1. Navigate to Корректировки (Adjustments module).
2. Observe the page title, header actions, filters, and table area.

**Expected Result:**
- Page title: **"Корректировки"** (no count badge because no data).
- Header row contains:
  - Search input: placeholder "Поиск по товару…" (search product name/SKU).
  - Warehouse filter: dropdown showing "Все склады" + all active warehouses.
  - Direction filter: segmented control (Все · Списание · Оприходование).
  - Export button (greyed or disabled).
  - **"Новая корректировка"** primary button.
- Empty state displays:
  - Icon (scale/balance).
  - Title: **"Пока нет корректировок"**.
  - Body: **"Корректировки фиксируют изменения остатка без продаж и поставок — порча, недостача, пересчёт, находка. Создайте первую запись."**
  - Call-to-action button: **"Новая корректировка"** (mirroring the header).

---

### STOCK-ADJUSTMENTS-02 · Create Modal — Form Fields & Defaults
**Preconditions:**  
List is empty. Warehouses W1, W2 exist. Products P1–P5 exist with stock in both warehouses.

**Steps:**
1. Click **"Новая корректировка"** button in header or empty state.
2. Observe modal title, subtitle, fields, and their initial state.

**Expected Result:**
- Modal title: **"Новая корректировка"**.
- Modal subtitle: **"Изменение остатка без продажи или поставки"**.
- Fields visible:
  - **Warehouse** (dropdown, required): defaults to the first active warehouse (e.g., "Склад #1"); shows all active warehouses only.
  - **Direction** (toggle cards, no default/mandatory): two large cards side-by-side:
    - **Списание** (left, red-tinted): icon ↙, subtitle "Уменьшить остаток", initially unselected.
    - **Оприходование** (right, green-tinted): icon ↗, subtitle "Увеличить остаток", initially unselected.
  - **Product** (autocomplete, required): empty, no placeholder text visible (picker UI).
  - **Quantity** (numeric, required): empty field with unit adornment (e.g., "ед." fallback).
  - **Reason** (dropdown, required): shows placeholder **"Выберите причину"**, empty by default.
  - **Note** (textarea, optional): empty, placeholder **"Дополнительные детали корректировки…"**, 2 rows min.
- Below fields: info banner (info icon, amber background, italic text):
  - **"Корректировки"** (bold) **"необратимы"** — **"после сохранения запись нельзя изменить или удалить. Будет зафиксирован автор и время."**
- Footer: **"Отмена"** and **"Сохранить"** buttons; Save is disabled (no complete form yet).

---

### STOCK-ADJUSTMENTS-03 · Create Modal — Direction Toggle & Reason Chaining
**Preconditions:**  
Modal is open on an empty form.

**Steps:**
1. Click the **Списание** (Decrease) card.
2. Verify the card highlights (red border, red glow shadow, active state).
3. Observe the Reason dropdown remains disabled.
4. Click the **Оприходование** (Increase) card.
5. Verify Списание card loses its active state; Оприходование becomes active (green).
6. Return to Списание.
7. Observe the Reason dropdown.

**Expected Result:**
- On Списание select:
  - Card shows active styling: red-tinted background, red border + glow.
  - Reason dropdown is now **enabled** (and shows placeholder "Выберите причину").
  - Clicking dropdown shows options: **Порча** · **Истечение срока** · **Кража/утеря** · **Пересчёт (коррекция вниз)** · **Другое** (Decrease-specific reasons per `DECREASE_REASONS`).
- On Оприходование select:
  - Card shows active styling: green-tinted background, green border + glow.
  - Reason dropdown is now **enabled**.
  - Clicking dropdown shows options: **Находка** · **Пересчёт (коррекция вверх)** · **Другое** (Increase-specific reasons per `INCREASE_REASONS`).
  - Switching back to Списание clears the Reason field (revalidates on next submit).

---

### STOCK-ADJUSTMENTS-04 · Create Modal — Product Selection & Availability Hint
**Preconditions:**  
Modal is open. Direction = Списание. Warehouse = W1 (has multiple products with known stock).

**Steps:**
1. Click the Product autocomplete field.
2. Type part of a product name (e.g., "Прод" for "Продукт 1").
3. Verify dropdown shows matching products (name or SKU match).
4. Select a product (e.g., "Продукт 1 (SKU: P1-001)").
5. Observe the Quantity field and its hint.
6. Switch to another product with different stock in W1.
7. Switch warehouse to W2.
8. Reselect the original product.

**Expected Result:**
- Product autocomplete:
  - Dropdown shows products with name or SKU matching the search.
  - Selected product displays with name and icon.
  - On product select, **unit automatically loads** (e.g., "кг", "шт", "л") as an endAdornment on Quantity.
- Quantity hint (visible only for Decrease direction):
  - Below Quantity field: **"На складе: {available} {unit}"** (e.g., "На складе: **50 кг**").
  - The available stock is **per-warehouse and per-product** — changes when warehouse or product changes.
  - If availability is 0, text shows **"На складе: **0 ед.**"** (no error yet; error on submit if qty > 0).

---

### STOCK-ADJUSTMENTS-05 · Create Modal — Over-Stock Validation (Hard Block)
**Preconditions:**  
Modal is open. Product P1 in Warehouse W1 has exactly 50 units in stock. Direction = Списание.

**Steps:**
1. Select Product P1, Warehouse W1.
2. Observe the availability hint: **"На складе: 50 ед."**.
3. Enter Quantity = 50. Verify no error yet.
4. Change Quantity to 51.
5. Observe the form state and any error displays.
6. Try to click Save.
7. Correct Quantity to 50.
8. Verify error disappears.

**Expected Result:**
- **On Quantity > availability:**
  - Quantity field background turns **red (error border)**.
  - Availability hint text turns **red**.
  - Red error message appears below Quantity: **"Недостаточно товара: доступно {{available}} {{unit}}, запрошено {{requested}} {{unit}}"** (e.g., "Недостаточно товара: доступно 50 ед., запрошено 51 ед.").
  - A red banner appears at the top of the form: **"Количество превышает доступный остаток — исправьте перед сохранением."**.
  - Save button is **disabled** (cannot click).
- **On Quantity ≤ availability:**
  - All error states clear.
  - Banner disappears.
  - Save button is **enabled** (if all other fields are valid).
- **Note:** Save is disabled even if user clicks it while over-stock is true; the hard block is enforced client-side and would also be enforced on the (mocked) backend.

---

### STOCK-ADJUSTMENTS-06 · Create Modal — Field-Level Validation
**Preconditions:**  
Modal is open.

**Steps:**
1. Leave all fields empty; click Save.
2. Observe error states on each field.
3. Fill Warehouse (W1), Direction (Списание), Product (P1), but leave Reason empty; click Save.
4. Verify Reason error appears.
5. Fill Quantity = 0; verify it fails validation.
6. Fill Quantity = -10; verify it fails validation (numeric input may clamp, but test submission).
7. Fill all required fields correctly; leave Note empty; click Save.
8. Verify submission proceeds (Note is optional).

**Expected Result:**
- **Required field errors (on submit):**
  - **Warehouse:** empty dropdown shows red border + helper text **"Выберите склад"**.
  - **Product:** missing selection shows red text **"Выберите товар"** below the field.
  - **Direction:** form requires selection (no explicit error on submit, but Save is disabled if not selected).
  - **Quantity:** 
    - If empty or 0: **"Укажите количество"**.
    - If negative (user enters "-10"): NumericField may prevent input, or validation rejects it with **"Укажите количество"**.
  - **Reason:** if empty or invalid: **"Выберите причину"**.
  - General error banner: **"Заполните обязательные поля ниже."** (if form is submitted with errors).
- **Optional field:**
  - Note can be empty; no error is shown.
  - If Note is provided and exceeds 500 characters: **"Примечание не должно превышать 500 символов."**.
- Save button state:
  - Disabled until all required fields are filled and valid.
  - Enabled only when: Warehouse, Direction, Product, Quantity (> 0, ≤ availability if Decrease), Reason are all set.

---

### STOCK-ADJUSTMENTS-07 · Create Modal — Successful Creation (Decrease)
**Preconditions:**  
Modal is open. Warehouse W1, Product P1 (stock = 50 ед.), Direction = Списание.

**Steps:**
1. Select:
   - Warehouse: W1.
   - Direction: **Списание**.
   - Product: P1.
   - Quantity: 20.
   - Reason: **Порча**.
   - Note: **"Повреждено при разгрузке."**.
2. Click Save.
3. Observe the loading state (optional spinner) and modal dismissal.
4. Verify the success notification toast.
5. Verify the list view updates with the new record.

**Expected Result:**
- **Submission:**
  - POST `/api/stock-adjustments` with body:
    ```json
    {
      "warehouseId": <W1 id>,
      "productId": <P1 id>,
      "direction": "Decrease",
      "quantity": 20,
      "reason": "Damage",
      "note": "Повреждено при разгрузке."
    }
    ```
- **Success notification (toast):** **"Корректировка сохранена"** (green/success style, auto-dismiss ~3s).
- **Modal closes** immediately; form is reset to empty defaults.
- **List view updates:**
  - New record appears at the **top** of the table (newest first).
  - Row shows: date (today, current time), warehouse name (W1), product name (P1), **direction chip "Списание" (red)**, quantity **"−20 ед."** (red, with minus sign), reason **"Порча"**, author **"Бахром Саидов"**.
  - Page title updates: **"Корректировки (1)"** (count badge).

---

### STOCK-ADJUSTMENTS-08 · Create Modal — Successful Creation (Increase)
**Preconditions:**  
Modal is open. Warehouse W2, Product P2 (stock = 30 ед.), Direction = Оприходование.

**Steps:**
1. Select:
   - Warehouse: W2.
   - Direction: **Оприходование**.
   - Product: P2.
   - Quantity: 15.
   - Reason: **Находка**.
   - Note: (leave empty).
2. Click Save.
3. Verify success toast and modal dismissal.
4. Verify the new record in the list.

**Expected Result:**
- **POST submission:**
  ```json
  {
    "warehouseId": <W2 id>,
    "productId": <P2 id>,
    "direction": "Increase",
    "quantity": 15,
    "reason": "Found",
    "note": null
  }
  ```
- **Success notification:** **"Корректировка сохранена"**.
- **List record shows:**
  - Direction chip: **"Оприходование"** (green).
  - Quantity: **"+15 ед."** (green, with plus sign).
  - Reason: **"Находка"**.
  - Note field in expansion: **"Без примечания"** (placeholder text, since note is null).

---

### STOCK-ADJUSTMENTS-09 · List View — Table Columns & Expand Row Detail
**Preconditions:**  
At least 3 adjustments exist (from prior tests or seed data).

**Steps:**
1. Navigate to Корректировки list.
2. Observe the table header row.
3. Click on the first adjustment row (not the expand arrow; anywhere on the row).
4. Observe the expand row animation and its content.
5. Click the row again to collapse.
6. Click the small expand arrow icon (left of date) on another row.

**Expected Result:**
- **Table header:**
  - Columns: [expand toggle space] · Date · Warehouse · Product · Direction · Quantity (right-aligned) · Reason · Author.
- **Table body row (collapsed):**
  - Date: formatted as "ДД.ММ.ГГГГ" (e.g., "15.06.2026"), monospace font, gray color.
  - Warehouse: icon + name (e.g., "Склад #1").
  - Product: name, bold font.
  - Direction: chip (Списание red / Оприходование green), styled with alpha background.
  - Quantity: signed number (+ or −), right-aligned, bold, green (Increase) or red (Decrease).
  - Reason: localized string (e.g., "Порча", "Находка").
  - Author: gray text (e.g., "Бахром Саидов").
  - Expand arrow: left icon, gray, rotates on expand.
- **Expand row (when opened):**
  - Background: light gray (background.default).
  - 3-column grid (responsive: 1-column mobile, 3-column desktop):
    - **SKU** (left): "P1-001" (monospace).
    - **Category** (center): category name or "—" if null.
    - **Date & Time** (right): "ДД.ММ.ГГГГ, HH:mm" (e.g., "15.06.2026, 14:20"), monospace.
    - **Balance After** (left): quantity, monospace (e.g., "50 ед.") — the served stock of the product in that warehouse **right after** the adjustment.
    - **Reason** (center): full localized reason (same as table).
    - **Created By** (right): avatar (initials + teal bg) + name, bold and teal.
    - **Note** (full width): receipt-icon + text, or **"Без примечания"** (gray placeholder).
  - Collapse on second click; arrow rotates back.

---

### STOCK-ADJUSTMENTS-10 · List View — Search by Product Name & SKU
**Preconditions:**  
At least 3 adjustments exist with different products (e.g., P1 "Яблоки (SKU: APP-001)", P2 "Апельсины (SKU: ORG-001)", P5 "Молоко (SKU: MILK-500)").

**Steps:**
1. Navigate to Корректировки list.
2. Type "Яб" in the search field.
3. Verify the filtered results.
4. Clear and type "APP-".
5. Verify filtered results again (SKU match).
6. Clear search and verify all records return.
7. Type a non-matching term (e.g., "ZZZZ").

**Expected Result:**
- **Search matches product name and SKU (case-insensitive).**
- **On "Яб" search:** rows with product "Яблоки" display; others hidden.
- **On "APP-" search:** rows with SKU starting "APP-" display; others hidden.
- **On clear:** all adjustments reappear (if no other filters are active).
- **On non-matching term:** empty state displays: **"Ничего не найдено"** · **"По заданным условиям корректировок нет. Измените склад, направление или поиск."** (No search-specific CTA button, since adjustments exist elsewhere).
- **Note:** Search is **live** (filters as user types; no submit button).

---

### STOCK-ADJUSTMENTS-11 · List View — Warehouse Filter
**Preconditions:**  
At least 3 adjustments across multiple warehouses (W1, W2).

**Steps:**
1. Navigate to Корректировки list.
2. Observe the Warehouse dropdown showing "Все склады".
3. Click the dropdown and select W1.
4. Verify table shows only records from W1.
5. Click the dropdown and select W2.
6. Verify table shows only records from W2.
7. Click the dropdown and re-select "Все склады".
8. Verify all records return.

**Expected Result:**
- **Dropdown displays:**
  - "Все склады" (default, icon warehouse).
  - All active (non-archived) warehouses listed below.
- **On warehouse select:**
  - Table instantly filters to that warehouse's records (client-side, no API call).
  - Count in title updates if not already filtered.
- **On "Все склады" re-select:**
  - All records return (if no other filters are active).
- **Archived warehouse:** does NOT appear in the filter dropdown (only active warehouses).

---

### STOCK-ADJUSTMENTS-12 · List View — Direction Segmented Filter
**Preconditions:**  
At least 4 adjustments: 2 Decrease (red) and 2 Increase (green).

**Steps:**
1. Navigate to Корректировки list.
2. Observe the Direction segmented control showing: **Все** · **Списание** · **Оприходование** (Все is active).
3. Click **Списание**.
4. Verify table shows only Decrease records (red direction chips).
5. Click **Оприходование**.
6. Verify table shows only Increase records (green direction chips).
7. Click **Все**.
8. Verify all records return.

**Expected Result:**
- **Segmented control:**
  - Three segments with clear labeling.
  - Active segment is highlighted (teal/primary background).
- **On Списание select:**
  - Only direction === "Decrease" rows display.
  - Count updates (if filtering by direction alone).
- **On Оприходование select:**
  - Only direction === "Increase" rows display.
- **On Все select:**
  - All records return.
- **Filters combine:** if Warehouse W1 and Direction Списание are both set, only Decrease records from W1 show.

---

### STOCK-ADJUSTMENTS-13 · List View — CSV Export
**Preconditions:**  
At least 3 adjustments exist with mixed directions, warehouses, and products.

**Steps:**
1. Navigate to Корректировки list.
2. Apply filters (e.g., Warehouse W1, Direction Списание) or export all.
3. Click the **Export** button (header, top-right, icon with down arrow).
4. Verify the browser's download behavior (file saves with timestamp in name).
5. Open the CSV file in a text editor or spreadsheet.

**Expected Result:**
- **Export button:**
  - Icon: file-download.
  - Label: **"Экспорт"** (or appears as icon-only on mobile).
  - Button is always enabled (even with no data; would download empty CSV with headers).
- **Downloaded file:**
  - Name format: `stock-adjustments_ГГГГ-ММ-ДД_ЧЧ-мм-сс.csv` (ISO date + timestamp).
  - CSV includes only the **currently displayed** adjustments (respects active filters).
  - Columns (in order):
    - Дата (formatted date, e.g., "15.06.2026").
    - Склад (warehouse name, e.g., "Склад #1").
    - Товар (product name).
    - Артикул (SKU).
    - Направление (localized: "Списание" or "Оприходование").
    - Кол-во (signed quantity: "−20 ед." or "+15 ед.").
    - Причина (localized reason: "Порча", "Находка", etc.).
    - Автор (creator name).
    - Примечание (note, or empty if null).
  - File encoding: UTF-8 (handles Cyrillic correctly).
  - At least one data row present (if adjustments exist).

---

### STOCK-ADJUSTMENTS-14 · List View — Pagination (25 rows per page)
**Preconditions:**  
Create or seed 30+ adjustments.

**Steps:**
1. Navigate to Корректировки list.
2. Observe the table: verify 25 rows display (the default page size).
3. Scroll to the table footer.
4. Verify the pager shows: "Showing 1-25 of {total}" and navigation arrows/page selector.
5. Click next page (or select page 2).
6. Verify the next 5 rows display (if exactly 30 total; otherwise rows 26–50, etc.).
7. Click previous page.
8. Verify rows 1–25 reappear.

**Expected Result:**
- **Pager component (at table footer):**
  - Shows row range: "1–25 of {total}" (e.g., "1–25 of 35").
  - "Rows per page" dropdown (default 25, options: 10, 25, 50, 100).
  - Left/right arrows (first/prev/next/last navigation).
  - Current page indicator.
- **On filter/search change:**
  - Pager resets to page 1.
  - Any open expand rows collapse.

---

### STOCK-ADJUSTMENTS-15 · Modal Discard Confirm (Unsaved Changes Guard)
**Preconditions:**  
Modal is open with an empty form.

**Steps:**
1. Fill some fields (e.g., Warehouse W1, Quantity 10).
2. Click the **X** (close button) at the top-right of the modal header.
3. Observe the confirm dialog.
4. Click **"Отмена"** on the confirm dialog.
5. Verify the modal remains open with fields still filled.
6. Click the **X** again.
7. This time, click **"Удалить"** (or confirm-variant danger button).

**Expected Result:**
- **On close-with-dirty fields:**
  - Confirm dialog appears: title **"Отменить изменения?"**, body **"Вы теряете все несохранённые данные."** (or similar wording).
  - Buttons: **"Отмена"** (cancel, returns to form) · **"Удалить"** (danger variant, red, closes modal).
- **On Отмена:**
  - Dialog closes; form remains open with all entries preserved.
- **On Удалить:**
  - Modal closes; form is discarded.
- **If form is clean (no edits):**
  - Modal closes immediately without confirm dialog (close is free).
- **If form is saving (isSaving=true):**
  - Close button is disabled; X is not clickable.

---

### STOCK-ADJUSTMENTS-16 · Loading State
**Preconditions:**  
Page is being loaded or list is being fetched (simulate slow network or observe initial load).

**Steps:**
1. Navigate to Корректировки and observe the page as it loads.
2. Or open the create modal and watch it load products/warehouses.

**Expected Result:**
- **On list load:**
  - Central spinner (CircularProgress) appears while `filteredAdjustments === "loading"`.
  - Once data arrives, table renders.
- **On create modal open:**
  - Modal opens immediately.
  - Loading bar (LinearProgress) appears at the top of the modal during submission (if saving).
  - Modal is non-interactive while `isSaving === true` (close button and form inputs are disabled).

---

### STOCK-ADJUSTMENTS-17 · Immutability — No Edit/Delete Affordances
**Preconditions:**  
At least one adjustment record exists in the list.

**Steps:**
1. Navigate to Корректировки list.
2. Hover over a row; observe for any menu icons (⋮, pencil, trash, etc.).
3. Right-click on a row.
4. Expand the row detail.
5. Observe all displayed content.

**Expected Result:**
- **No edit affordances:**
  - No pencil/edit icon on the row.
  - No edit button in expand-row detail.
  - No context menu on right-click (or context menu has no edit option).
- **No delete affordances:**
  - No trash/delete icon.
  - No delete button or menu option anywhere.
- **Row interaction:**
  - Only action is expand/collapse (click row or arrow).
  - Expand-row detail is **read-only** (no inline editing fields).
- **Note:** This reflects hard rule 1 (immutable events get no edit/delete) and hard rule 23 (stock adjustments are immutable).

---

### STOCK-ADJUSTMENTS-18 · Cross-Module Reconciliation — Stock Balance After Adjustment
**Preconditions:**  
- Product P1 in Warehouse W1 has 100 units of stock (verified in Products or Warehouse detail).
- Create a Decrease adjustment: P1, W1, −25 units, Reason "Damage".

**Steps:**
1. Before submitting: note the current stock of P1 in W1 (should be 100 ед.).
2. Complete the adjustment create and save.
3. Verify the adjustment displays `balanceAfter: 75` in the expand-row detail.
4. Navigate to Warehouse W1 detail (Остатки tab).
5. Find Product P1 in the stock listing.
6. Observe its current balance.
7. Navigate back to Корректировки and expand the adjustment record again.

**Expected Result:**
- **Adjustment record shows:**
  - Detail expand row, "Остаток после операции" field: **"75 ед."** (100 − 25).
- **Expected (mock limitation):**
  - Product P1 stock in Warehouse W1 detail will **NOT change** (stays at 100 ед.) because the mock does not mutate the Products backend.
  - This is a **known mock limitation** per CLAUDE.md: adjustments do not mutate product stock in the mocked environment.
  - **On real backend:** stock would decrement to 75; the Warehouse detail and Products list would reflect the change.

---

### STOCK-ADJUSTMENTS-19 · Cross-Module Reconciliation — Increase Adjustment Consistency
**Preconditions:**  
- Product P2 in Warehouse W2 has 50 units of stock.
- Create an Increase adjustment: P2, W2, +10 units, Reason "Found".

**Steps:**
1. Complete the adjustment and verify success.
2. Expand the adjustment row and note the `balanceAfter`.
3. Navigate to Warehouse W2 Остатки tab and check P2's stock.

**Expected Result:**
- **Adjustment record:**
  - "Остаток после операции": **"60 ед."** (50 + 10).
  - Direction chip: **"Оприходование"** (green).
  - Quantity: **"+10 ед."** (green, plus sign).
- **Known limitation:**
  - Warehouse detail still shows P2 at 50 ед. (mock does not mutate).
  - Real backend would show 60 ед.

---

### STOCK-ADJUSTMENTS-20 · Reason-by-Direction Correctness
**Preconditions:**  
Modal is open with multiple adjustments already created, showing various reasons.

**Steps:**
1. Create a Decrease adjustment with Reason "Damage" (Порча).
2. Create a Decrease adjustment with Reason "Expiry" (Истечение срока).
3. Create a Decrease adjustment with Reason "Theft" (Кража/утеря).
4. Create a Decrease adjustment with Reason "RecountDown" (Пересчёт коррекция вниз).
5. Create an Increase adjustment with Reason "Found" (Находка).
6. Create an Increase adjustment with Reason "RecountUp" (Пересчёт коррекция вверх).
7. For each, verify the Reason dropdown shows only the direction-appropriate list.

**Expected Result:**
- **Decrease (Списание) reason dropdown shows exactly:**
  - Порча (Damage)
  - Истечение срока (Expiry)
  - Кража/утеря (Theft)
  - Пересчёт (коррекция вниз) (RecountDown)
  - Другое (Other)
- **Increase (Оприходование) reason dropdown shows exactly:**
  - Находка (Found)
  - Пересчёт (коррекция вверх) (RecountUp)
  - Другое (Other)
- **Switching direction clears Reason field** (forces user to re-select).
- **Saved adjustments display the correct reason localization** (e.g., list row shows "Порча", expand row shows "Порча", CSV exports "Порча").

---

### STOCK-ADJUSTMENTS-21 · Note Field Trimming & Null Handling
**Preconditions:**  
Modal is open.

**Steps:**
1. Select valid Warehouse, Direction, Product, Quantity, Reason.
2. In Note field, enter: **"   Trimmed note text   "** (whitespace-padded).
3. Submit and save.
4. Expand the adjustment row and verify the note.
5. Create a second adjustment with Note field **completely empty** (no text, no spaces).
6. Submit and expand the row.

**Expected Result:**
- **First adjustment (with padded text):**
  - Saved note is **"Trimmed note text"** (leading/trailing whitespace removed per schema `.trim()`).
  - Expand row displays: **"Trimmed note text"** (correct trimming).
- **Second adjustment (empty note):**
  - Saved note is **null** (empty string converted to null per schema transform).
  - Expand row displays: **"Без примечания"** (gray placeholder, per design).

---

### STOCK-ADJUSTMENTS-22 · Multiple Adjustments Same Product — Historical Sequence
**Preconditions:**  
Product P1 in Warehouse W1 starts with 100 units. Create three adjustments in sequence.

**Steps:**
1. Create Adjustment #1: P1, W1, −10 (Damage), note "First loss".
2. In expansion, verify balanceAfter = 90.
3. Create Adjustment #2: P1, W1, +5 (Found), note "Recount up".
4. In expansion, verify balanceAfter = 95.
5. Create Adjustment #3: P1, W1, −20 (Expiry), note "Expired batch".
6. In expansion, verify balanceAfter = 75.
7. Navigate back to list; verify all three records appear (newest first).

**Expected Result:**
- **Adjustments list (newest first):**
  - Row 1: Adj #3, −20, "Expiry", balanceAfter = 75.
  - Row 2: Adj #2, +5, "Found", balanceAfter = 95.
  - Row 3: Adj #1, −10, "Damage", balanceAfter = 90.
- **balanceAfter fields:**
  - Each reflects the served stock at that moment in time (a snapshot, not recomputed).
  - **Mock limitation:** balanceAfter is arithmetic on the mock's current "available" quantity, not a true historical record. Real backend would persist the exact balance at each point in time.

---

### STOCK-ADJUSTMENTS-23 · Warehouse Defaults & Selection
**Preconditions:**  
Warehouses W1, W2, W3 exist (active).

**Steps:**
1. Open create modal for the first time.
2. Observe which warehouse is pre-selected.
3. Select W2 explicitly.
4. Close the modal (no save).
5. Open the modal again.
6. Observe the warehouse field.

**Expected Result:**
- **First open:**
  - Warehouse defaults to **the first active warehouse** in the list (e.g., W1, assuming sorted by creation/ID).
- **After manual select & close:**
  - Next modal open resets to the same first warehouse (form resets on each open per hook logic).
- **Warehouse dropdown:**
  - Shows all active warehouses only (archived warehouses excluded).
  - No warehouse marked as "system" or non-editable.

---

### STOCK-ADJUSTMENTS-24 · Empty Search, Filter Reset Behavior
**Preconditions:**  
Multiple adjustments exist. Filters are applied (e.g., Warehouse W1, Direction Списание, search "яблоки").

**Steps:**
1. Observe the filtered results (reduced list).
2. Clear the search input (delete text or click clear button).
3. Observe the list.
4. Click "Все склады" in warehouse dropdown.
5. Click "Все" in direction segmented control.
6. Observe the final list state.

**Expected Result:**
- **On search clear:**
  - List expands to show all records matching the remaining filters (if any).
- **On warehouse reset to "Все склады":**
  - All warehouses' records reappear.
- **On direction reset to "Все":**
  - Both Decrease and Increase records reappear.
- **Final state (all filters cleared):**
  - Full unfiltered list displays (or empty state if no adjustments exist in total).
- **All filter operations are instant (client-side)** — no loading spinner.

---

### STOCK-ADJUSTMENTS-25 · User Attribution — Created By
**Preconditions:**  
Multiple adjustments have been created.

**Steps:**
1. Navigate to Корректировки list.
2. Observe the "Автор" (Author) column for each row.
3. Expand a record and check the "Провёл" field in the detail.

**Expected Result:**
- **Author field displays:**
  - In table row: "Автор" column shows a name (e.g., "Бахром Саидов", the mock default).
  - In expand-row detail: "Провёл" field shows the same name with an avatar (initials + teal background).
- **Mock behavior:**
  - All adjustments created via the mock are attributed to **"Бахром Саидов"** (hardcoded).
- **Real backend behavior:**
  - Author would be the authenticated user's name (from session).

---

### STOCK-ADJUSTMENTS-26 · Timestamp Precision & Formatting
**Preconditions:**  
Create an adjustment and observe its timestamp.

**Steps:**
1. Note the current date/time in the browser.
2. Create an adjustment.
3. Verify the timestamp in the expand-row "Дата и время" field.

**Expected Result:**
- **Timestamp format:** "ДД.ММ.ГГГГ, HH:mm" (e.g., "15.06.2026, 14:20").
- **Precision:** minutes (no seconds displayed in the expanded detail; table shows only date).
- **ISO storage:** the adjustment's `date` field is stored as an ISO 8601 string internally (e.g., "2026-06-15T14:20:00Z").
- **Local time:** the time displayed is derived from the ISO string by extracting hours and minutes (per the mock's `timeOf()` helper).

---

### STOCK-ADJUSTMENTS-27 · Product Categories in Expand Detail
**Preconditions:**  
Create adjustments for products with categories (e.g., P1 category "Фрукты") and one without (P5 has no category).

**Steps:**
1. Create Adj with P1 (category "Фрукты").
2. Expand and check the "Категория" field.
3. Create Adj with P5 (no category).
4. Expand and check the "Категория" field.

**Expected Result:**
- **With category:**
  - Detail shows category name (e.g., **"Фрукты"**).
- **Without category:**
  - Detail shows **"—"** (dash, empty placeholder).

---

### STOCK-ADJUSTMENTS-28 · Quantity Formatting with Units
**Preconditions:**  
Create adjustments with different product units (e.g., "кг", "шт", "л").

**Steps:**
1. Create Adj: P1 (kg), Quantity 15.5.
2. Verify table row quantity display.
3. Expand and check expand-row quantity.
4. Create Adj: P2 (units/шт), Quantity 250.
5. Verify formatting.

**Expected Result:**
- **Table row quantity:**
  - Format: **"−15.5 кг"** or **"+15.5 кг"** (signed, with unit).
  - Monospace font, right-aligned.
  - Green (Increase) or red (Decrease).
- **Expand-row detail quantity (Остаток после операции):**
  - Format: **"15.5 кг"** (unsigned; the balance is always positive).
  - Monospace font.
- **Units respected:**
  - "кг", "шт", "л", "м", etc. all render correctly per product definition.

---

### STOCK-ADJUSTMENTS-29 · Error Recovery after Submission Fail
**Preconditions:**  
Modal is open with a valid form (all fields filled, ready to save).

**Steps:**
1. Fill all fields correctly.
2. (Simulate a network error or backend rejection by temporarily disabling mocks or introducing a mock delay.)
3. Click Save.
4. Verify an error notification appears (e.g., toast: "Не удалось сохранить корректировку").
5. Verify the modal remains open with form intact.
6. Correct any fields (if needed) and click Save again.

**Expected Result:**
- **On API failure:**
  - Error notification toast: **"Не удалось сохранить корректировку"** (red/error style).
  - Modal remains open (not dismissed).
  - Form is not reset; all entered data is preserved.
  - Loading spinner / progress bar dismisses.
- **On retry (after fix):**
  - User can correct and resubmit.
  - If the retry succeeds, normal success flow proceeds.

---

### STOCK-ADJUSTMENTS-30 · Responsive Behavior — Expand Detail Grid
**Preconditions:**  
Create an adjustment and open it on both wide (desktop) and narrow (mobile ~380px) viewports.

**Steps:**
1. On desktop, expand an adjustment detail.
2. Observe the 3-column grid layout.
3. Resize browser to mobile width (~380px).
4. Expand the same adjustment (or navigate to it).
5. Observe the layout change.

**Expected Result:**
- **Desktop (≥600px):**
  - Expand-row detail uses a 3-column grid: SKU / Category / DateTime on row 1, BalanceAfter / Reason / CreatedBy on row 2, Note full-width on row 3.
- **Mobile (<600px):**
  - Expand-row detail uses a 1-column grid: fields stack vertically.
  - All fields remain readable; no overflow or truncation.

---

### STOCK-ADJUSTMENTS-31 · Date Range Not Seeded (Locked Pattern 12)
**Preconditions:**  
List view is displayed.

**Steps:**
1. Observe the header controls.
2. Look for any date-range picker, calendar, or period dropdown.

**Expected Result:**
- **No date range controls exist:**
  - The header shows: Search · Warehouse filter · Direction segmented · Export · Create button.
  - No calendar, date-from/date-to fields, or period selector.
- **Reason:** locked pattern 12 (date filter is deferred; it's client-side only and not in MVP per CLAUDE.md).
- **Note:** CSV export includes all visible records' dates (not filtered by range).

---

## Reconciliation Assertions (Real Backend Contract)

When testing against a **real backend** (not mocked), the following must hold:

1. **Stock Adjustment POST returns 201 Created** with the complete StockAdjustment object (ID, timestamp, balanceAfter).
2. **GET /api/stock-adjustments returns all adjustments** (no pagination query params; client handles pagination).
3. **Direction-specific reason validation:** the backend rejects Decrease with "Found" or Increase with "Damage" (reason must match direction).
4. **Over-stock hard block:** POST with Decrease quantity > availability returns 400 ValidationProblemDetails with error message.
5. **Immutability:** PUT / PATCH / DELETE on a StockAdjustment ID return 405 Method Not Allowed or 404 Not Found (no edit/delete endpoints).
6. **balanceAfter is server-computed:** the backend calculates it from the transaction's delta + the current served stock, never accepts it as input.
7. **Author is server-determined:** the createdBy field is set to the authenticated user (from Bearer token / session), never overridable from the request body.

---

## Known Limitations & Design Gaps

### Mock Limitations (Not Bugs)

1. **Stock not mutated:** Creating an adjustment does not decrement/increment the product's stock in the mocked Products or Warehouses. The `balanceAfter` field is computed arithmetic, but the actual served `warehouseItems.quantity` is untouched. Real backend will mutate stock atomically with the adjustment creation.

2. **Author hardcoded:** All mock-created adjustments are attributed to "Бахром Саидов", regardless of the authenticated user. Real backend will use the session user's name.

3. **balanceAfter arithmetic, not historical:** In the mock, `balanceAfter` is computed fresh from the current stock each time a record is rendered. On a real backend with a true historical ledger, `balanceAfter` would be persisted as a snapshot of the exact balance at event time.

4. **No cross-ref mutation:** adjustments do not propagate to the Dashboard KPIs, Debts list, or other read models in the mock. Real backend will integrate adjustments into loss reporting and audit.

### Deferred (Locked) Features

1. **Date-range filter:** not in MVP (locked pattern 12). Search, warehouse, and direction filters are sufficient; full-featured reporting is v2.

2. **Edit/Delete:** intentionally absent per hard rule 1. Adjustments are immutable; corrections use counter-events (v2 linkage feature).

3. **Bulk operations:** no multi-select or bulk adjustments.

4. **Attachment/image upload:** notes are plain text only.

---

## Summary Checklist

- [ ] **List View**
  - [ ] Empty state renders correctly.
  - [ ] Search works (product name + SKU).
  - [ ] Warehouse filter works (active warehouses only).
  - [ ] Direction filter works (Все/Списание/Оприходование).
  - [ ] Export CSV generates file with correct columns and format.
  - [ ] Pagination displays 25 rows per page; next/prev navigation works.
  - [ ] Expand-row detail shows all fields (SKU, Category, DateTime, BalanceAfter, Reason, CreatedBy, Note).
  - [ ] No edit/delete affordances present.
- [ ] **Create Modal**
  - [ ] All required fields render (Warehouse, Direction, Product, Quantity, Reason, Note).
  - [ ] Warehouse defaults to first active warehouse.
  - [ ] Direction toggle shows Списание (red) and Оприходование (green) cards.
  - [ ] Direction toggle updates Reason dropdown options correctly.
  - [ ] Product autocomplete searches name and SKU.
  - [ ] Quantity shows per-warehouse availability hint (Decrease only).
  - [ ] Over-stock validation blocks Decrease > availability with red error + disabled Save.
  - [ ] Reason dropdown shows direction-specific list.
  - [ ] Note is optional; trimmed on save; converted to null if empty.
  - [ ] Immutability banner is present (warning icon, yellow bg, explanatory text).
  - [ ] Discard confirm dialog appears on close with unsaved changes.
  - [ ] Successful save: POST to `/api/stock-adjustments`, success toast, modal closes, list updates.
- [ ] **Data Integrity**
  - [ ] Author field captures user (mocked as "Бахром Саидов"; real backend uses session user).
  - [ ] Timestamp captures date and time (ISO, displayed as ДД.ММ.ГГГГ, HH:mm).
  - [ ] balanceAfter reflects served stock at event time (not mutated in mock; real backend will).
  - [ ] Direction sign (− or +) is consistent with direction (Decrease red, Increase green).
  - [ ] Reason localization matches the enum (Damage → Порча, Found → Находка, etc.).
  - [ ] All records are immutable (no edit/delete in UI; no mutations via API).

---

End of Test-Case Document
