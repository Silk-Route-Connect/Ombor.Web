# Manual Test Cases — Warehouses Module (Склады)

## Overview

This document covers all user-facing flows in the Warehouses module (`/warehouses` list, `/warehouses/:id` detail). The module is fully mocked at `/api/warehouses` (backend contract). Testing is done against the deployed dev environment (app.miraziz.net frontend + api.miraziz.net backend with mocks enabled). The tenant starts empty; data is built up as testing proceeds.

**Key design principles:**
- Warehouses are immutable master-data entries (no delete, only archive/restore).
- Stock is recorded through the opening-stock flow (an audited event), not at warehouse creation.
- Warehouse detail shows two tabs: stock (current holdings) and movements (audit ledger of all stock events).
- All balances and stock counts are server-computed (rule 8 in business-rules.md).
- Archived warehouses still count in totals and can still hold stock (rule 31).

---

## LIST VIEW (Warehouses Page)

### WAREHOUSES-01: Load and Display Empty State

**Preconditions:** Tenant is empty (no warehouses created).

**Steps:**
1. Navigate to **Склады** in the sidebar.
2. Observe the page loading.

**Expected Result:**
- A centered empty state appears with a warehouse icon, heading «Пока нет складов», body text «Добавьте первый склад…», and a primary **«Новый склад»** button.
- Page title shows **«Склады»** (no count, since the total is 0).
- The search input and archive toggle are visible but disabled/inactive.

**Reconciliation:** None (empty state).

---

### WAREHOUSES-02: Create First Warehouse

**Preconditions:** Tenant is empty.

**Steps:**
1. From the empty state, click **«Новый склад»**.
2. In the modal, enter name **«Центральный»** and address **«ул. Навои 42»**.
3. Click **«Сохранить»**.

**Expected Result:**
- Modal closes.
- A success toast appears: **«Склад "Центральный" создан»**.
- The page now shows a table with one row: Центральный · ул. Навои 42 · 0 товаров · 0 ед. · 0 UZS.
- Page title updates to **«Склады (1)»**.
- The totals row at the bottom shows: Итого · (пусто) · 0 · 0 · 0 UZS.

**Reconciliation:** 
- Backend API call: `POST /api/warehouses` with payload `{name: "Центральный", location: "ул. Навои 42"}`.
- Response includes: `{id: 1, name: "Центральный", location: "ул. Навои 42", productCount: 0, totalUnits: 0, stockValue: 0, isArchived: false}`.
- Store updates `allWarehouses` list and `filteredWarehouses` re-renders.

---

### WAREHOUSES-03: Search Warehouse by Name

**Preconditions:** One or more warehouses exist.

**Steps:**
1. In the search input (placeholder "Поиск по названию или адресу…"), type **«Центр»**.
2. Observe the filtered list.
3. Clear the search (select all and delete).

**Expected Result:**
- After typing "Центр", the table shows only rows whose name or address matches (case-insensitive, substring). If a warehouse is named "Центральный", it appears.
- The totals row updates to reflect only the filtered rows.
- After clearing, all warehouses reappear.

**Reconciliation:** Search is client-side (in WarehouseStore.filteredWarehouses getter). No API calls.

---

### WAREHOUSES-04: Search Warehouse by Address

**Preconditions:** Two warehouses exist: one at "ул. Навои 42", another at "ул. Мирзо Улугбека 1".

**Steps:**
1. Type **«Мирзо»** in the search input.
2. Observe the filtered list.

**Expected Result:**
- Only the warehouse at "ул. Мирзо Улугбека 1" appears.

**Reconciliation:** Address search is included in the client-side filter (matchesSearch on both name and location).

---

### WAREHOUSES-05: Archive Toggle (Show/Hide Archived)

**Preconditions:** Two warehouses exist: one active ("Центральный"), one archived ("Филиал").

**Steps:**
1. Observe the archive toggle button (bottom-right of the filter row) showing **«Архив 1»** badge.
2. Click the toggle to turn it ON.
3. Observe the list.
4. Click the toggle to turn it OFF.

**Expected Result:**
- Initially (toggle OFF): only the active "Центральный" is shown; "Филиал" is hidden.
- Toggle appears as a segmented control with a switch indicator and a badge showing archived count.
- When toggle is ON: both active and archived warehouses appear. "Филиал" row is dimmed (opacity ~0.6) and shows an «Архив» grey badge next to its name.
- When toggle is OFF again: only active warehouses remain visible.
- Totals row always reflects the currently shown rows (including archived if the toggle is on).

**Reconciliation:** Toggle state is client-side (WarehouseStore.showArchived). Filtered list re-computes when the toggle changes.

---

### WAREHOUSES-06: Archive Toggle Badge Count

**Preconditions:** Three warehouses exist: two active, one archived.

**Steps:**
1. Observe the archive toggle button.

**Expected Result:**
- Badge shows **«Архив 1»** (the count of archived warehouses, from WarehouseStore.archivedCount, computed over allWarehouses regardless of search/show-archived state).

**Reconciliation:** archivedCount is a computed getter over allWarehouses (unfiltered). No API call.

---

### WAREHOUSES-07: CSV Export

**Preconditions:** Two warehouses exist: "Центральный" (100 товаров, 500 ед., 1,000,000 UZS) and "Филиал" (50 товаров, 200 ед., 500,000 UZS).

**Steps:**
1. Click the **«Экспорт»** button (ghost button with download icon in the top-right).
2. A CSV file downloads automatically (filename pattern: `warehouses_YYYY-MM-DD_HH-MM-SS.csv`).
3. Open the CSV in a spreadsheet editor.

**Expected Result:**
- CSV headers: Название · Адрес · Товаров · Единиц · Стоимость остатка · Статус.
- Rows match the currently shown warehouses (filtered if search is active, archived included if toggle is on).
- Values are formatted as shown in the table (no quotes, decimal thousands separator as per browser locale).
- Totals row is NOT exported (only the detail rows).
- For the example: 
  - Row 1: Центральный · (address) · 100 · 500 · 1,000,000 UZS · Активный
  - Row 2: Филиал · (address) · 50 · 200 · 500,000 UZS · Архив

**Reconciliation:** Export uses the current filteredWarehouses and the CsvColumn configuration defined in WarehousePage.tsx. No API call beyond the initial getAll().

---

### WAREHOUSES-08: Table Column Rendering — Name with Icon and Badge

**Preconditions:** A warehouse exists named "Центральный".

**Steps:**
1. Observe the name column of the warehouse row.

**Expected Result:**
- Name is displayed with a warehouse icon (WarehouseOutlinedIcon) in a teal circle to the left.
- Name is bold and colored `primary.main` (teal).
- When hovering the row, the name is underlined.
- If the warehouse is archived, the name is struck-through, greyed, and an «Архив» badge appears to the right of the name.

**Reconciliation:** Name rendering logic is in WarehousesTable.tsx; icon color and styling are from theme tokens.

---

### WAREHOUSES-09: Table Column Rendering — Address

**Preconditions:** Two warehouses exist: one with an address ("ул. Навои 42"), one without (address is null).

**Steps:**
1. Observe the address column.

**Expected Result:**
- For the warehouse with an address: a place icon (PlaceOutlinedIcon) followed by the address text, all in secondary grey.
- For the warehouse without: a dash (—) in disabled grey.

**Reconciliation:** Address rendering is conditional on null/empty (WarehousesTable.tsx lines 225–244).

---

### WAREHOUSES-10: Row Click Navigation to Detail

**Preconditions:** A warehouse "Центральный" with ID 1 exists.

**Steps:**
1. Click anywhere on the warehouse row (except the ⋮ menu).
2. Wait for navigation.

**Expected Result:**
- Browser navigates to `/warehouses/1`.
- The detail page loads with the warehouse header, KPIs, and tabs.

**Reconciliation:** onClick handler calls `navigate(warehouseDetailPath(warehouse.id))` (WarehousesTable.tsx line 87).

---

### WAREHOUSES-11: Totals Row Aggregation

**Preconditions:** Two warehouses exist with the following counts:
- "Центральный": 100 товаров, 500 ед., 1,000,000 UZS.
- "Филиал": 50 товаров, 200 ед., 500,000 UZS.

**Steps:**
1. Observe the totals row at the bottom of the table.
2. Search for "Центральный" to filter to one warehouse.
3. Observe the totals row.
4. Clear the search.

**Expected Result:**
- Initially, the totals row shows: 150 товаров, 700 ед., 1,500,000 UZS.
- After filtering to "Центральный", the totals row shows: 100 товаров, 500 ед., 1,000,000 UZS (sum of only the visible row).
- After clearing the search, totals revert to 150 · 700 · 1,500,000.
- The totals row has a bold font weight (700) and a top border (1.5px).
- When the archive toggle is ON and archived warehouses are shown, a small note next to "Итого" reads "(включая архив)".

**Reconciliation:** Totals are computed in WarehouseStore.totals getter (WarehouseStore.ts lines 102–115) by summing filtered rows only.

---

### WAREHOUSES-12: Action Menu (⋮) — Edit

**Preconditions:** A warehouse "Центральный" exists.

**Steps:**
1. Click the ⋮ icon in the rightmost column of the warehouse row.
2. A menu appears with options **«Редактировать»** and **«Архивировать»**.
3. Click **«Редактировать»**.

**Expected Result:**
- Menu closes.
- A modal opens with title **«Редактировать склад»** and subtitle **«Центральный»**.
- Name field is pre-filled with **«Центральный»**.
- Address field is pre-filled with the current address.
- A save and cancel button are at the bottom.

**Reconciliation:** WarehouseActionMenu component (WarehousesTable.tsx line 289) dispatches onEdit callback, which calls warehouseStore.openEdit(warehouse). Store updates dialogMode to `{kind: "form", warehouse}`.

---

### WAREHOUSES-13: Action Menu (⋮) — Archive

**Preconditions:** A warehouse "Центральный" exists and is active.

**Steps:**
1. Click the ⋮ icon.
2. Click **«Архивировать»**.

**Expected Result:**
- A confirmation dialog appears with:
  - Icon: ArchiveOutlinedIcon (warning tone, orange).
  - Title: **«Архивировать склад "Центральный"?»**
  - Body: **«Склад будет скрыт из активных списков. Его остатки и стоимость сохранятся и продолжат учитываться в общих итогах.»**
  - Buttons: **«Архивировать»** (warning red) and **«Отмена»** (grey).

**Reconciliation:** Confirm dialog triggers warehouseStore.archive(warehouse), which calls `POST /api/warehouses/{id}/archive`. Response returns the warehouse with `isArchived: true`. Store replaces the warehouse in allWarehouses and shows a success toast.

---

---

## DETAIL VIEW (Warehouse Detail Page)

### WAREHOUSES-14: Load Detail Page with KPIs

**Preconditions:** A warehouse with ID 1 exists: "Центральный", 50 товаров, 200 ед., 500,000 UZS.

**Steps:**
1. Navigate to `/warehouses/1`.
2. Wait for the page to load.

**Expected Result:**
- Breadcrumb: **«Склады › Центральный»** (left-aligned, small grey text with chevron separator).
- Back button: bordered chevron-left icon button (clickable).
- Page heading: **«Центральный»** (24px, bold).
- Subtext: address (if any) and "Архив" badge (if archived).
- Three KPI cards below the header:
  1. **Товаров** icon · 50 · "различных позиций на складе".
  2. **Единиц** icon · 200 · ед. (unit suffix) · "суммарное количество товара".
  3. **Стоимость остатка** icon · 500,000 UZS · "по средней себестоимости (WAC)".
- Below the KPIs: two underline tabs: **«Остатки»** (active) and **«Движения»**.

**Reconciliation:**
- API calls: `GET /api/warehouses/1`, `GET /api/warehouses/1/stock`, `GET /api/warehouses/1/movements`.
- SelectedWarehouseStore loads all three in parallel and renders accordingly.

---

### WAREHOUSES-15: Detail Header — Edit Button (Active Warehouse)

**Preconditions:** A warehouse "Центральный" exists and is active (not archived).

**Steps:**
1. Navigate to the detail page for "Центральный".
2. Observe the top-right button area.

**Expected Result:**
- A ghost button **«Начальный остаток»** (with AddIcon) appears on the left.
- A bordered ⋮ menu button appears on the right.
- No primary "Восстановить" button (since the warehouse is active).

**Reconciliation:** WarehouseDetailHeader (lines 194–209) renders the "Начальный остаток" button and ⋮ menu when `!warehouse.isArchived`.

---

### WAREHOUSES-16: Detail Header — Restore Button (Archived Warehouse)

**Preconditions:** A warehouse "Филиал" exists and is archived.

**Steps:**
1. Navigate to the detail page for "Филиал".
2. Observe the top-right button area.

**Expected Result:**
- A primary button **«Восстановить»** (with UnarchiveOutlinedIcon) appears.
- No "Начальный остаток" button.
- No ⋮ menu.

**Reconciliation:** WarehouseDetailHeader (lines 195–209) renders the restore button when `warehouse.isArchived`.

---

### WAREHOUSES-17: Detail Header — Archived Banner

**Preconditions:** A warehouse is archived.

**Steps:**
1. Navigate to its detail page.

**Expected Result:**
- Directly below the header, a blue-background banner appears:
  - Icon: InfoOutlinedIcon.
  - Title: **«Склад в архиве.»**
  - Body: **«Остатки и их стоимость по-прежнему учитываются в общих итогах, но новые операции по складу недоступны. Восстановите склад, чтобы возобновить приёмки, корректировки и перемещения.»**

**Reconciliation:** WarehouseArchivedBanner (WarehouseDetailPage.tsx line 111) is rendered conditionally when `warehouse.isArchived`.

---

### WAREHOUSES-18: Остатки Tab — Search and Filter

**Preconditions:** A warehouse holds 5 products:
1. "Яблоки" (SKU: "APPLE-01", category: "Фрукты", 100 ед., WAC 500 UZS, value 50,000).
2. "Апельсины" (SKU: "ORANGE-01", category: "Фрукты", 50 ед., WAC 600 UZS, value 30,000).
3. "Морковь" (SKU: "CARROT-01", category: "Овощи", 200 ед., WAC 100 UZS, value 20,000).
4. "Молоко" (SKU: "MILK-01", category: null, 30 л, WAC 2000 UZS, value 60,000).
5. "Йогурт" (SKU: "YOGURT-01", category: null, 20 л, WAC 1500 UZS, value 30,000).

**Steps:**
1. Navigate to the warehouse detail and ensure the "Остатки" tab is active.
2. Observe the search input and category dropdown.
3. Type **«Яб»** in the search (searches by product name and SKU).
4. Observe the filtered list.
5. Clear the search.
6. Change the category dropdown from «Все категории» to **«Фрукты»**.
7. Observe the filtered list.
8. Search for **«01»** (which matches SKUs) while the category filter is still "Фрукты".

**Expected Result:**
- Search placeholder: **«Поиск по товару или артикулу…»**.
- Initially (no search, all categories), all 5 products appear.
- After searching "Яб": only "Яблоки" appears (matched by name substring).
- After clearing: all 5 reappear.
- After selecting «Фрукты»: only "Яблоки", "Апельсины" appear (products with categoryName="Фрукты").
- After searching "01" with «Фрукты» selected: only "Яблоки" and "Апельсины" appear (both have "01" in SKU and category="Фрукты").
- At the bottom-right of the filter bar, a count appears: **«5 позиций показано»** (or the filtered count).

**Reconciliation:** Search and category filters are client-side (WarehouseStockTab.tsx lines 81–103). No API calls beyond the initial getStock().

---

### WAREHOUSES-19: Остатки Tab — Column Sorting

**Preconditions:** A warehouse with multiple products with varying quantities, WACs, and values.

**Steps:**
1. Click the **«Товар»** column header.
2. Observe the sort indicator (arrow) and the re-ordered list.
3. Click **«Товар»** again to reverse the sort.
4. Click the **«Кол-во»** column header to sort by quantity.
5. Verify the sort direction toggles on subsequent clicks.

**Expected Result:**
- The column header of the active sort shows an up or down arrow icon.
- Default sort is by value descending.
- Clicking a header toggles between ascending and descending.
- Clicking the same header again reverses the direction.
- The sort state applies and the table re-renders immediately.

**Reconciliation:** Sort state is local to WarehouseStockTab component (lines 73, 105–106). No API calls.

---

### WAREHOUSES-20: Остатки Tab — Empty State

**Preconditions:** A warehouse has no stock (productCount = 0).

**Steps:**
1. Navigate to the warehouse detail.

**Expected Result:**
- Instead of the tabs, a centered empty state appears with:
  - Icon: WarehouseOutlinedIcon (grey, larger).
  - Heading: **«На складе пока нет товаров»**.
  - Body: **«Добавьте начальный остаток, чтобы зафиксировать текущие запасы при переходе с Excel или открытии склада. Это будет записано как аудируемое событие.»**
  - Primary button: **«Добавить начальный остаток»**.
- No tabs are shown.

**Reconciliation:** WarehouseEmptyStock component (WarehouseDetailPage.tsx lines 115–116) is rendered when `empty && !warehouse.isArchived`. When archived, even an empty warehouse shows the tabs and an empty movements table (logic line 115).

---

### WAREHOUSES-21: Остатки Tab — Empty State CTA

**Preconditions:** A warehouse has no stock.

**Steps:**
1. From the empty state, click **«Добавить начальный остаток»**.

**Expected Result:**
- The opening-stock modal opens (see WAREHOUSES-30).

**Reconciliation:** Both the empty-state button (WarehouseEmptyStock line 116) and the detail-header "Начальный остаток" button (WarehouseDetailHeader line 108) call warehouseStore.openOpeningStock(warehouse), which sets dialogMode to `{kind: "opening", warehouse}`.

---

### WAREHOUSES-22: Остатки Tab — Totals Row (Итого по складу)

**Preconditions:** A warehouse with 3 products:
1. Product A: 100 ед., WAC 500 UZS, value 50,000.
2. Product B: 50 ед., WAC 600 UZS, value 30,000.
3. Product C: 200 ед., WAC 100 UZS, value 20,000.

**Steps:**
1. Navigate to the warehouse detail, Остатки tab.
2. Observe the totals row at the bottom of the table.
3. Apply a filter (e.g., category filter to show only 2 products).
4. Observe the totals row again.

**Expected Result:**
- Totals row shows: Итого по складу · (blank address cell) · 3 · 350 · 100,000 UZS.
- After filtering to 2 products, totals show: Итого по складу · (blank) · 2 · (sum of those 2) · (sum of values of those 2).
- The row has a bold font (fontWeight 700), a top border, and a grey background.

**Reconciliation:** The totals are computed as the sum of displayed rows (after search/category filter). This is client-side only; no API call.

---

### WAREHOUSES-23: Движения Tab — Load and Display Ledger

**Preconditions:** A warehouse with stock movements:
1. Opening event (2026-06-01): +50 "Яблоки" @ 500 UZS/ед. (Opening kind).
2. Supply event (2026-06-05): +20 "Яблоки" @ 600 UZS/ед. from partner "Фермер Иван" (Supply kind).
3. Sale event (2026-06-10): −15 "Яблоки" to partner "Магазин А" (Sale kind).

**Steps:**
1. Navigate to the warehouse detail and click the **«Движения»** tab.
2. Wait for the ledger to load.

**Expected Result:**
- A table with columns: Дата · Событие · Товар · Контрагент / направление · Кол-во · Остаток.
- Rows in reverse chronological order (newest first):
  1. 2026-06-10 · [red "Продажа" chip] · Яблоки · Магазин А · −15 · 55 (after the sale).
  2. 2026-06-05 · [green "Поставка" chip] · Яблоки · Фермер Иван · +20 · 70 (after the supply).
  3. 2026-06-01 · [grey "Начальный остаток" chip] · Яблоки · — (dash, no partner) · +50 · 50 (after opening).
- Quantity column shows signed values: +20, −15, etc. (green for positive, red for negative per the design, though the color logic may be implicit in the ChIP).
- Balance-after column shows running balance after each event (50, 70, 55).

**Reconciliation:**
- API call: `GET /api/warehouses/{id}/movements`.
- Movements are sorted newest-first by the backend (WarehouseMovement[]).
- balanceAfter is served per-event; no client-side recalculation.

---

### WAREHOUSES-24: Движения Tab — Filter by Event Type

**Preconditions:** A warehouse with 6 movements of different kinds (Opening, Supply, Sale, Refund, Adjustment, Transfer).

**Steps:**
1. Navigate to the Движения tab.
2. Click the event type filter dropdown (showing «Все события» by default).
3. Select **«Поставка»** (Supply).
4. Observe the filtered list.
5. Select **«Все события»** to reset.

**Expected Result:**
- Dropdown label includes a FilterListIcon.
- Options: Все события, Начальный остаток, Поставка, Продажа, Возврат, Корректировка, Перемещение.
- After selecting "Поставка", only supply movements appear.
- After selecting "Все события", all movements reappear.
- The count at the bottom-right updates: **«2 события»** (if 2 supplies match).

**Reconciliation:** Event type filter is client-side (WarehouseMovementsTab.tsx lines 42–56). No API calls beyond initial getMovements().

---

### WAREHOUSES-25: Движения Tab — Search by Product Name

**Preconditions:** Warehouse with movements including "Яблоки" and "Молоко" products.

**Steps:**
1. In the search input (placeholder «Поиск по товару…»), type **«Мол»**.

**Expected Result:**
- Only movements involving "Молоко" appear.
- Count updates to show the number of matching movements.

**Reconciliation:** Product name search is client-side (WarehouseMovementsTab.tsx lines 88–91). No API calls.

---

### WAREHOUSES-26: Движения Tab — Movement Kind Chips

**Preconditions:** Warehouse with various movements.

**Steps:**
1. Observe the event-type chips in the table.

**Expected Result:**
- Each movement displays a chip with the localized event type:
  - «Начальный остаток» (Opening) — grey.
  - «Поставка» (Supply) — green (incoming).
  - «Продажа» (Sale) — blue (outgoing).
  - «Возврат» (Refund) — orange/warning.
  - «Корректировка» (Adjustment) — yellow/info.
  - «Перемещение» (Transfer) — purple/secondary.
- Chips are from MovementKindChip.tsx component.

**Reconciliation:** Movement kind i18n keys are in warehouse.json (lines 108–113). Chip color is determined by a `getKindColor()` or similar logic in MovementKindChip.tsx.

---

### WAREHOUSES-27: Движения Tab — Empty State (No Movements)

**Preconditions:** A warehouse exists but has no movements (never stocked, newly created).

**Steps:**
1. Navigate to the Движения tab.

**Expected Result:**
- A centered empty state:
  - Icon: LayersOutlinedIcon (grey).
  - Heading: **«Нет движений»**.
  - Body: **«По этому складу ещё не было движений товара.»**
- No table is shown.

**Reconciliation:** Empty state is rendered when `rows.length === 0 && !isFiltering` (WarehouseMovementsTab.tsx lines 121–145).

---

### WAREHOUSES-28: Detail Header ⋮ Menu — Edit Warehouse

**Preconditions:** A warehouse exists and is active.

**Steps:**
1. Navigate to its detail page.
2. Click the ⋮ menu.
3. Click **«Редактировать»**.

**Expected Result:**
- The form modal opens with title **«Редактировать склад»** and subtitle showing the warehouse name.
- The name and address fields are pre-filled.

**Reconciliation:** WarehouseDetailHeader DetailActionsMenu (lines 39–92) dispatches onEdit callback, triggering warehouseStore.openEdit(warehouse).

---

### WAREHOUSES-29: Detail Header ⋮ Menu — Archive Warehouse

**Preconditions:** A warehouse exists and is active.

**Steps:**
1. Navigate to its detail page.
2. Click the ⋮ menu.
3. Click **«Архивировать»**.

**Expected Result:**
- Confirmation dialog appears (same as WAREHOUSES-13).
- After confirming, the page updates:
  - The warehouse name becomes struck-through and greyed.
  - An «Архив» badge appears next to the name.
  - The "Начальный остаток" button and ⋮ menu disappear; a primary **«Восстановить»** button appears.
  - The blue banner **«Склад в архиве.»** appears below the header.
- A success toast: **«Склад "Name" архивирован»**.

**Reconciliation:**
- API call: `POST /api/warehouses/{id}/archive`.
- Response returns warehouse with `isArchived: true`.
- SelectedWarehouseStore.applyWarehouse() updates the local warehouse state and re-renders.

---

### WAREHOUSES-30: Opening Stock Modal — Create and Record Entry

**Preconditions:**
- A warehouse "Центральный" exists with no stock (productCount = 0).
- Products exist: "Яблоки" (id: 1), "Апельсины" (id: 2).

**Steps:**
1. Navigate to the warehouse detail and click **«Начальный остаток»**.
2. In the opening-stock modal (title: «Начальный остаток», subtitle: «Центральный»):
   a. Click the product autocomplete.
   b. Type **«Яблоки»** and select it.
   c. Enter quantity: **100**.
   d. Enter unit cost: **500** (UZS/ед.).
   e. Observe the preview box that shows: **«Стоимость партии: 50,000 UZS · остаток станет 100 ед.»**
   f. Optionally, enter a note: **«Начальный остаток при переходе с Excel»**.
   g. Click **«Сохранить»**.

**Expected Result:**
- A **preview box** appears when all three fields (product, quantity, unitCost) are filled with positive values. It shows:
  - Batch value: quantity × unitCost.
  - New balance: currentStock + quantity.
- After saving:
  - Modal closes.
  - Success toast: **«Начальный остаток записан»**.
  - The warehouse KPIs update: productCount becomes 1, totalUnits becomes 100, stockValue becomes 50,000.
  - The Остатки tab now shows "Яблоки" with quantity 100, WAC 500, value 50,000.
  - The Движения tab shows a new row with:
    - Date: today's date.
    - Event: «Начальный остаток» (grey chip).
    - Product: Яблоки.
    - Counterparty: — (dash).
    - Quantity: +100.
    - Balance: 100.
    - Note (if entered): appears in a tooltip or detail view.

**Reconciliation:**
- API call: `POST /api/warehouses/{warehouseId}/opening-stock` with payload:
  ```json
  {
    "items": [{
      "productId": 1,
      "quantity": 100,
      "unitCost": 500
    }],
    "note": "Начальный остаток при переходе с Excel"
  }
  ```
- Response returns the updated warehouse with incremented `productCount`, `totalUnits`, and `stockValue`.
- SelectedWarehouseStore.reloadLedgers() fetches updated stock and movements.

---

### WAREHOUSES-31: Opening Stock Modal — Field Validation

**Preconditions:** Opening-stock modal is open.

**Steps:**
1. Leave all fields empty and click **«Сохранить»**.
2. Observe error messages.
3. Fill product but leave quantity empty, then try to save.
4. Fill quantity and cost with zeros or negative values, then try to save.

**Expected Result:**
- On submit without all required fields:
  - An error banner appears at the top: **«Заполните обязательные поля: проверьте отмеченные поля ниже.»**
  - Each required field without a value shows an error message inline:
    - Product field: **«Выберите товар»** (from schema validation).
    - Quantity field: **«Укажите количество»**.
    - Unit cost field: **«Укажите себестоимость за единицу»**.
- For zero or negative values (validation constraint: `.positive()`):
  - Quantity: **«Укажите количество»** (or a positive-value message).
  - Unit cost: **«Укажите себестоимость за единицу»** (or similar).
- The save button remains enabled (hard rule 5 — never disable; validation runs on submit).

**Reconciliation:** OpeningStockSchema (WarehouseSchema.ts lines 33–43) enforces `.positive()` on productId, quantity, and unitCost. useOpeningStockForm hook handles form state and validation via React Hook Form + Zod.

---

### WAREHOUSES-32: Opening Stock Modal — Note Field (Optional)

**Preconditions:** Opening-stock modal is open and product/quantity/unitCost are filled.

**Steps:**
1. Leave the note field empty and save.
2. Record the entry.
3. Open the same warehouse's opening-stock modal again.
4. Fill product, quantity, unitCost, and note with **«Найден старый ящик»** (500 chars max).
5. Save.

**Expected Result:**
- The note field is optional (no validation error when empty).
- When a note is provided, it is saved with the opening-stock event and appears in the audit trail (movements ledger detail).
- Maximum length is 500 characters; entering more shows a validation error: **«Примечание не должно превышать 500 символов.»**
- Placeholder text: **«Например: Начальный остаток при переходе с Excel»**.

**Reconciliation:** Note field uses `z.string().trim().max(500, ...)` in OpeningStockSchema (lines 38–42). The payload is sent to the backend in AddOpeningStockRequest.note field.

---

### WAREHOUSES-33: Opening Stock Modal — Current Stock Indicator

**Preconditions:** A warehouse holds "Яблоки" with current quantity 100 ед.

**Steps:**
1. Open the opening-stock modal.
2. Select "Яблоки" from the product autocomplete.
3. Observe the hint text below the product field.

**Expected Result:**
- Text appears: **«Текущий остаток на складе: 100 ед.»** (with the actual quantity in bold monospace).
- The unit label is taken from the product's measurement (e.g., "ед.", "кг", "л").

**Reconciliation:** Hint is rendered conditionally when a product is selected (WarehouseOpeningStockModal.tsx lines 145–155). Current quantity is looked up from the stock prop (line 91).

---

### WAREHOUSES-34: Form Modal (Edit Warehouse) — Validation

**Preconditions:** A warehouse exists.

**Steps:**
1. Click the ⋮ menu and select **«Редактировать»** (or click edit from list).
2. Clear the name field completely.
3. Click **«Сохранить»**.
4. Observe error messages.
5. Enter a name with only 1 character (e.g., **«А»**) and try to save.
6. Enter a name with 251+ characters and try to save.

**Expected Result:**
- When the name is empty:
  - Error banner: **«Укажите название склада — это обязательное поле.»**
  - Name field shows error: **«Введите название склада (минимум 2 символа).»**
  - Save button remains enabled.
- With 1 character:
  - Error: **«Введите название склада (минимум 2 символа).»**
- With 251+ characters:
  - Error: **«Название не должно превышать 250 символов.»**
- Address field:
  - Max length is 250 characters; exceeding shows: **«Адрес не должен превышать 250 символов.»**
  - Address is optional (no error when empty).

**Reconciliation:** WarehouseSchema (WarehouseSchema.ts lines 10–22) enforces `.min(2)` and `.max(250)` on name, `.max(250)` on location. Validation is client-side via Zod schema. Validation runs on form submit via react-hook-form.

---

### WAREHOUSES-35: Form Modal — Discard Changes Confirmation

**Preconditions:** Edit modal is open for a warehouse.

**Steps:**
1. Change the name field (e.g., add " 2" to the end).
2. Click the close (X) button on the modal.
3. A confirmation dialog appears («Отменить изменения?»).
4. Click **«Отменить»** to confirm discard.

**Expected Result:**
- Confirmation dialog shows:
  - Icon: ReportProblemOutlinedIcon (warning tone).
  - Title: **«Отменить изменения?»**
  - Body: **«Все внесённые изменения будут потеряны. Это невозможно отменить.»**
  - Buttons: **«Отменить»** (danger red) and **«Вернуться в редактирование»** (grey).
- After clicking "Отменить", the modal closes and changes are discarded.
- After clicking "Вернуться в редактирование", the dialog closes and the modal remains open with unsaved changes intact.

**Reconciliation:** useDirtyClose hook (WarehouseFormModal.tsx lines 45–49) manages dirty state and confirmation logic. Dirty state is tracked by React Hook Form's formState.isDirty.

---

### WAREHOUSES-36: Form Modal — Save with Valid Changes

**Preconditions:** Edit modal is open for warehouse "Центральный" with address "ул. Навои 42".

**Steps:**
1. Change the address to **«ул. Мирзо Улугбека 1»**.
2. Click **«Сохранить»**.

**Expected Result:**
- Modal closes.
- Success toast: **«Изменения сохранены»**.
- The detail header updates to show the new address.
- The list page (if navigated back) shows the updated address.

**Reconciliation:**
- API call: `PUT /api/warehouses/{id}` with payload `{name: "Центральный", location: "ул. Мирзо Улугбека 1", id: ...}`.
- Response returns the updated warehouse.
- Store replaces the warehouse in allWarehouses (WarehouseStore.replaceWarehouse).
- SelectedWarehouseStore.applyWarehouse() updates the detail page state.

---

### WAREHOUSES-37: Back Navigation

**Preconditions:** User is on a warehouse detail page.

**Steps:**
1. Click the back chevron button (top-left of the header).

**Expected Result:**
- Browser navigates to `/warehouses`.
- The list page loads with the same filter state (search, archive toggle) as before.

**Reconciliation:** Back button calls navigate(PATHS.warehouses) (WarehouseDetailPage.tsx line 43).

---

### WAREHOUSES-38: Detail Page — Not Found

**Preconditions:** User navigates to `/warehouses/9999` (non-existent warehouse ID).

**Steps:**
1. Navigate to a URL with a non-existent warehouse ID.
2. Wait for the page to load.

**Expected Result:**
- A centered message appears: **«Склад не найден.»** (grey text).
- No header, tabs, or KPIs are rendered.

**Reconciliation:**
- API call: `GET /api/warehouses/9999` returns 404 or null.
- SelectedWarehouseStore.load() catches the error and sets warehouse to null.
- WarehouseDetailPage renders the not-found state (lines 57–63).

---

### WAREHOUSES-39: Detail Page Loading State

**Preconditions:** User navigates to a warehouse detail page.

**Steps:**
1. Navigate to `/warehouses/1` (with intentional network delay if possible).
2. Observe the loading state.

**Expected Result:**
- Initially, a centered CircularProgress spinner is shown.
- Text should be absent or minimal.
- After data loads, the full detail page renders.

**Reconciliation:** WarehouseDetailPage renders a loading spinner when `warehouse === "loading"` (lines 49–54).

---

### WAREHOUSES-40: Warehouse Creation — Empty Name Field

**Preconditions:** Create modal is open.

**Steps:**
1. Leave the name field empty.
2. Fill the address field with **«Some Address»**.
3. Click **«Сохранить»**.

**Expected Result:**
- Error banner and name field error message appear (as per WAREHOUSES-34).
- Modal remains open.

**Reconciliation:** Validation enforces non-empty, ≥2 char name (WarehouseSchema.ts lines 11–15).

---

## RECONCILIATION TESTS

These tests verify that the warehouse module integrates correctly with other modules and that served balances are accurate.

### WAREHOUSES-41: Stock Reconciliation After Opening Stock

**Preconditions:**
- A warehouse exists with no stock.
- A product "Яблоки" exists.

**Steps:**
1. Open the opening-stock modal and add 100 units of "Яблоки" @ 500 UZS/unit.
2. Record the entry.
3. Navigate back to the warehouse detail.
4. Observe the KPIs and Остатки tab.
5. In a browser dev console or via API inspection, check the backend state by calling `GET /api/warehouses/{id}`.

**Expected Result:**
- KPIs update:
  - productCount: 1.
  - totalUnits: 100.
  - stockValue: 50,000 UZS.
- Остатки tab shows one row: Яблоки · APPLE-01 (if SKU exists) · category · ед. · 100 · 500 (WAC) · 50,000 (value).
- API response includes the updated aggregates.
- Movements tab shows the opening-stock event.

**Reconciliation:** The opening-stock operation should update the warehouse's served aggregates atomically on the backend. No client-side recomputation.

---

### WAREHOUSES-42: Multiple Opening Stock Entries — WAC Calculation

**Preconditions:**
- A warehouse with "Яблоки" already has 100 units @ 500 UZS/unit (value 50,000).

**Steps:**
1. Add a second opening-stock entry: 100 units of "Яблоки" @ 600 UZS/unit.
2. Observe the stock tab and movements.

**Expected Result:**
- Остатки tab now shows:
  - Quantity: 200 ед.
  - WAC: 550 UZS/unit (weighted average: (100*500 + 100*600) / 200 = 550).
  - Value: 110,000 UZS (200 × 550).
- Movements tab shows two opening-stock events in reverse chronological order.
- stockValue in the warehouse aggregate is updated to 110,000.

**Reconciliation:** WAC calculation is server-side (business-rules rule 18). The frontend displays the served WAC and value without recalculation.

---

### WAREHOUSES-43: Archive Does Not Affect Totals

**Preconditions:**
- Two warehouses exist: "Центральный" (100 товаров, 500 ед., 1M UZS) and "Филиал" (50 товаров, 200 ед., 500K UZS).
- Both are active.

**Steps:**
1. On the list page, observe the totals row: 150 · 700 · 1.5M UZS.
2. Archive "Филиал" via its ⋮ menu.
3. Observe the list (archive toggle is still OFF).
4. Turn the archive toggle ON.
5. Observe the list totals again.

**Expected Result:**
- After archiving (toggle OFF): totals show 100 · 500 · 1M UZS (only "Центральный").
- After toggling archive ON: totals show 150 · 700 · 1.5M UZS (both warehouses, including archived "Филиал").
- The archived warehouse's stock and value are counted in totals when shown.

**Reconciliation:** The totals row is computed from filteredWarehouses (which respects the show-archived toggle). Business-rules rule 31 states: archived warehouses holding stock still count in totals — this is enforced client-side by including archived rows in the summation when the toggle is on.

---

### WAREHOUSES-44: Movements Ledger Ordering

**Preconditions:** A warehouse with 3 movements recorded on different dates:
1. 2026-06-01: Opening (50 units).
2. 2026-06-05: Supply (20 units, running balance 70).
3. 2026-06-03: Sale (10 units, running balance 60).

**Steps:**
1. Navigate to the warehouse Движения tab.
2. Observe the order of events.

**Expected Result:**
- Events are displayed newest-first (reverse chronological):
  1. 2026-06-05: Supply, +20, balance 70.
  2. 2026-06-03: Sale, −10, balance 60.
  3. 2026-06-01: Opening, +50, balance 50.
- Note: The balance-after values assume chronological processing by the backend; the frontend displays them as-served.

**Reconciliation:** The backend returns movements sorted newest-first. The frontend does not re-sort. Each movement's balanceAfter is served per-event and should reflect the state after that event in the time sequence.

---

## EDGE CASES & KNOWN LIMITATIONS

### WAREHOUSES-45: Archived Warehouse with Empty Stock Detail

**Preconditions:** A warehouse is archived but holds stock (productCount > 0).

**Steps:**
1. Navigate to the detail page for the archived warehouse.
2. Observe the view (tabs, empty state).

**Expected Result:**
- Tabs are shown (no empty state, since productCount > 0).
- The blue archive banner is displayed.
- Остатки and Движения tabs are visible and functional.
- "Начальный остаток" button is not shown (archive restricts new operations).

**Reconciliation:** The empty-state check (WarehouseDetailPage.tsx line 115) is `empty && !warehouse.isArchived` — archived warehouses skip the empty state and go straight to tabs even if stock is zero. This is intentional: archived warehouses retain their audit trail.

---

### WAREHOUSES-46: Stock Page Pagination

**Preconditions:** A warehouse with 50+ products.

**Steps:**
1. Navigate to the warehouse detail and view the Остатки tab.
2. Scroll to the bottom of the table.
3. Observe pagination controls.

**Expected Result:**
- A pager component appears at the bottom showing: current page / total pages, and prev/next buttons.
- Default rows-per-page: 25.
- Clicking next loads the next 25 rows.
- Sorting or filtering resets to page 1.

**Reconciliation:** WarehouseStockTab uses TablePager component (MUI Table Pagination wrapper). Pagination is client-side over the filtered stock array.

---

### WAREHOUSES-47: Movements Page Pagination

**Preconditions:** A warehouse with 50+ movements.

**Steps:**
1. Navigate to the Движения tab.
2. Observe pagination controls.

**Expected Result:**
- Pager is shown; default 25 rows per page.
- Filtering or type selection resets to page 1.

**Reconciliation:** WarehouseMovementsTab uses the same TablePager component.

---

### WAREHOUSES-48: Search Placeholder Hints

**Preconditions:** List page or detail tabs are open.

**Steps:**
1. Observe placeholder text in search inputs across the module.

**Expected Result:**
- List page search: **«Поиск по названию или адресу…»**
- Остатки tab search: **«Поиск по товару или артикулу…»**
- Движения tab search: **«Поиск по товару…»**

**Reconciliation:** Placeholders are i18n keys from warehouse.json (lines 19, 80, 94).

---

### WAREHOUSES-49: Warehouse ⋮ Menu in List — Row Click Stoppage

**Preconditions:** A warehouse row is visible in the list.

**Steps:**
1. Click the ⋮ menu button (far right of a warehouse row).
2. Click outside the menu to close it.
3. Click the same ⋮ button again (without clicking the row).

**Expected Result:**
- The ⋮ button click does not trigger row navigation (onClick calls `e.stopPropagation()`).
- The menu opens and closes as expected.
- Clicking elsewhere on the row navigates to detail.

**Reconciliation:** WarehousesTable row click handler wraps the menu in `onClick={(e) => e.stopPropagation()}` (line 287).

---

### WAREHOUSES-50: Opening Stock — Product Autocomplete Seeding

**Preconditions:** Opening-stock modal is being opened for the first time.

**Steps:**
1. Open a warehouse detail page.
2. Click **«Начальный остаток»**.
3. Wait for the modal to fully render.
4. Click the product autocomplete.

**Expected Result:**
- The autocomplete dropdown appears with all products available in the system.
- Products are seeded from `productStore.getAll()` on mount (OpeningStockModal.tsx lines 76–81).

**Reconciliation:** useEffect in OpeningStockModal fetches productStore.getAll() when isOpen changes to true.

---

## CROSS-MODULE FLOWS (if applicable)

### WAREHOUSES-51: Stock Aggregates in Summary Cards

**Preconditions:** Navigate to Dashboard or Debts or any page showing organization-wide aggregates.

**Steps:**
1. Create or modify a warehouse's stock.
2. Navigate to a page that displays organization-wide statistics.
3. Verify that warehouse stock is included in the aggregates.

**Expected Result:**
- The warehouse's stock and value are reflected in any organization-wide total (e.g., Dashboard summary stock value).

**Reconciliation:** Warehouse stock is counted in the organization-level inventory aggregates via the backend. The frontend displays served aggregates and does not recompute them.

---

## KNOWN GAPS (Not Bugs)

1. **Stock-adjustment and transfer creation do not mutate warehouse stock in this mock.** The `/api/stock-adjustments` and `/api/transfers` mocks are self-contained; they do not call back to update `/api/warehouses/{id}/stock`. In the real backend, these operations would update inventory.

2. **Opening-stock events are immutable.** Corrections are not available via the UI; they would be modeled as a reverse adjustment (per business-rules rule 1).

3. **Warehouse deletion is not supported.** Only archive and restore are available (per business-rules rules 29–30).

4. **Multi-line opening stock is not yet exposed in the UI.** The form supports only one product at a time (OpeningStockSchema has a single productId, not an array). The backend contract allows `items: OpeningStockLine[]` for future multi-line expansion.

5. **Warehouse-level cost allocation per product is simplified.** WAC is served per-product per-warehouse; no drill-down into cost-layer history is exposed.

---

## APPENDIX: API Contract Summary

All API calls use the mocked `/api/warehouses` endpoint (not the stale `/api/inventories`).

| Method | Endpoint | Purpose |
|--------|----------|---------|
| GET | `/api/warehouses` | Fetch all warehouses (for the list). |
| GET | `/api/warehouses/{id}` | Fetch a single warehouse (for detail). |
| GET | `/api/warehouses/{id}/stock` | Fetch stock holdings (Остатки tab). |
| GET | `/api/warehouses/{id}/movements` | Fetch movement ledger (Движения tab). |
| POST | `/api/warehouses` | Create a warehouse. |
| PUT | `/api/warehouses/{id}` | Update warehouse name/location. |
| POST | `/api/warehouses/{id}/archive` | Archive a warehouse. |
| POST | `/api/warehouses/{id}/restore` | Restore a warehouse. |
| POST | `/api/warehouses/{id}/opening-stock` | Record an opening-stock event. |

**Request/response shapes** are defined in `src/models/warehouse.ts` and `src/services/api/WarehouseApi.ts`.

---

## TEST EXECUTION NOTES

- **Prerequisites:** Tenant is empty at the start. Create data incrementally as you work through test cases.
- **Isolation:** Each test case should leave the system in a consistent state for the next test (or explicitly clean up if needed).
- **Mocks:** All data persists only for the browser session; refresh or logout/login will reset to the mock seed.
- **Notifications:** Toast messages appear in the top-right corner; verify text and duration (~3–5 seconds).
- **Accessibility:** All modals have close buttons (X) and keyboard support (Esc to close). Forms use labels + helper text. Aria-labels are present on icon buttons.

