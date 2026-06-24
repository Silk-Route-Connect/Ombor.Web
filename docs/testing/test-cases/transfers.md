# Transfers Module — Manual Test Cases

**Application:** Ombor.Web (React 19 + MUI v7 + MobX)  
**Module:** Transfers (Перемещения)  
**Environment:** Deployed dev (frontend: app.miraziz.net, backend: api.miraziz.net)  
**Test Focus:** User-facing flows for inter-warehouse stock transfers (immutable, no status workflow)

**Context:** Transfers are atomic, immutable inter-warehouse stock movements (business-rules §D, rule 16/116). Both warehouses update at once, no status workflow, no partner, no money. The resource is mocked at the target v1 contract; transfers reference real products and warehouses but do not mutate their stock (known limitation).

---

## PRECONDITIONS

- **Tenant state:** EMPTY (data built up as testing proceeds)
- **Test user:** Logged in to the deployed dev environment as a regular user
- **Backend:** Real MOCKS OFF (Swagger: https://api.miraziz.net/swagger/v1/swagger.json)
- **Password reset:** No backend endpoint (404 by design)
- **i18n:** All labels in Russian (Перемещения, Новое перемещение, etc.)
- **Product and Warehouse setup:**
  - Must create at least 2 active warehouses (e.g., "Главный склад", "Филиал")
  - Must create at least 3 products with diverse SKUs and measurements (e.g., "Мороженое пломбир 500г" in Piece, "Молоко 1л" in Liter, "Сыр 1кг" in Kilogram)
  - Set opening stock for each product in each warehouse (e.g., Product A: 100 units in Warehouse 1, 20 in Warehouse 2)

---

## TEST CASES

### TRANSFERS-01 · List view — empty state

**Preconditions:**
- Transfers table is empty (no transfers exist yet)
- Tenant has ≥2 active warehouses and ≥3 products with opening stock

**Steps:**
1. Navigate to the Transfers module (sidebar → Перемещения)
2. Verify the page title displays "Перемещения" with total count (initially parentheses empty or count=0)
3. Observe the empty state container
4. Read the empty-state heading and body text

**Expected result:**
- Page title: "Перемещения"
- Two action buttons visible in the header: "Экспорт" (ghost button, disabled) and "Новое перемещение" (primary button)
- Warehouse filter dropdown visible below header, value = "Все склады"
- Empty-state card appears with:
  - Icon: SwapHorizontal outline in light gray box
  - Heading: "Пока нет перемещений"
  - Body: "Перемещения переносят товар между складами. Оба склада обновляются сразу — без статусов и подтверждений. Создайте первое перемещение."
  - "Новое перемещение" button in the empty state card
- No table/rows visible

**Reconciliation:** None (empty state is UI-only)

**Designed-gap note:** None

---

### TRANSFERS-02 · Create modal — happy path (single line)

**Preconditions:**
- Two warehouses exist: "Главный склад" (WH1, ID=1) and "Филиал" (WH2, ID=2)
- Product "Мороженое пломбир 500г" (ID=1) with opening stock: 100 units in WH1, 20 units in WH2
- Transfers list is empty or has existing transfers

**Steps:**
1. Click "Новое перемещение" button in header or empty state
2. Verify form modal opens with title "Новое перемещение" and subtitle "Перенос товара между складами"
3. Inspect the warehouse route section:
   - From field is pre-populated with first warehouse ("Главный склад")
   - To field is pre-populated with second warehouse ("Филиал") 
   - A right-pointing chevron icon sits between them
4. Inspect the lines section:
   - One empty line row visible with three columns: Product (autocomplete), Quantity (numeric input), Delete button
   - "Добавить товар" button below
5. Inspect the note section: empty textarea with placeholder "Например: Пополнение филиала"
6. Inspect the immutability hint banner (yellow bg, info icon): text "Перемещение проводится **сразу и необратимо**…"
7. Dialog footer shows "Позиций: 0" counter and action buttons (Cancel, submit button disabled)
8. Click the product autocomplete in line 1
9. Type "Мороженое" to filter
10. Select "Мороженое пломбир 500г" from the dropdown
11. Verify the autocomplete closes and shows the selected product
12. Tab or click the quantity field
13. Type "50"
14. Verify below the quantity field: "На складе «Главный склад»: **100 шт**" (availability shown)
15. Click the note textarea and type "Test transfer for ice cream"
16. Verify the submit button becomes enabled (showing "Провести перемещение")
17. Verify the positions counter updates to "Позиций: 1"
18. Click the submit button
19. Verify a loading bar appears briefly
20. Verify the modal closes and returns to the list view

**Expected result:**
- Modal opens with correct defaults
- Product autocomplete shows filtered options
- Quantity accepts numeric input and shows availability
- Form fields are editable
- Note text appears in the textarea
- Submit button enabled when ≥1 complete line exists
- On submit: brief loading indicator, modal closes
- List view returns with new transfer visible (or empty state still shown if just 1 transfer and not yet scrolled/paginated)
- Success notification toast appears: "Перемещение проведено: Главный склад → Филиал, 1 поз."
- Transfer date/time, warehouse names, positions count visible in the new row

**Reconciliation:**
- **Source warehouse stock:** Product A's stock in "Главный склад" should NOT visibly decrease in the stock table (known limitation — mocked transfers do not mutate product stock)
- **Destination warehouse stock:** Product A's stock in "Филиал" should NOT visibly increase (known limitation)
- **Transfer record:** The created transfer is queryable via the list endpoint (POST /api/transfers internally creates and appends to the mock data)

**Designed-gap note:** Stock mutations are not implemented in the mocked transfers endpoint — the UI acknowledges this with the immutability hint. In production, both warehouses' InventoryItems are atomically updated.

---

### TRANSFERS-03 · Create modal — multiple lines

**Preconditions:**
- Two warehouses exist with ≥3 products, each with opening stock in both warehouses
- Example data:
  - Product A: 100 units in WH1
  - Product B: 80 units in WH1
  - Product C: 50 units in WH1

**Steps:**
1. Click "Новое перемещение"
2. Verify modal opens with one empty line
3. Select Product A in line 1, enter quantity 30
4. Click "Добавить товар" button
5. Verify a second empty line row appears below line 1
6. Select Product B in line 2, enter quantity 40
7. Verify availability shown for line 2: "На складе «Главный склад»: **80 шт**"
8. Click "Добавить товар" again
9. Verify a third empty line row appears
10. Select Product C in line 3, enter quantity 25
11. Verify the positions counter updates: "Позиций: 3"
12. Verify all three delete buttons are enabled (not disabled)
13. Click delete button on line 2 (middle row)
14. Verify line 2 is removed; lines 1 and 3 remain
15. Verify positions counter updates: "Позиций: 2"
16. Click submit button
17. Verify success toast and new transfer in list with "Позиций: 2" and "Единиц: 55" (30+25)

**Expected result:**
- Multiple lines can be added via "Добавить товар"
- Each line supports product selection, quantity entry, and availability display
- Delete button removes any line (except the last one, which remains disabled)
- Positions counter reflects complete lines (product + qty > 0)
- Form submits with all complete lines
- Success toast shows positions and warehouse names
- List transfer row displays correct position and unit counts

**Reconciliation:** Transfer created in mock with 2 complete lines (Product A, Product C). Transfer ID and created-by user recorded.

**Designed-gap note:** None

---

### TRANSFERS-04 · Create modal — validation — same warehouse

**Preconditions:**
- Two warehouses exist
- Create modal is open

**Steps:**
1. Verify "From" warehouse defaults to first warehouse
2. Verify "To" warehouse defaults to second warehouse
3. Click "To" warehouse dropdown
4. Select the same warehouse as "From" (e.g., change "Филиал" to "Главный склад" when "From" is already "Главный склад")
5. Verify the "To" field shows an error state (red border)
6. Verify an error message appears below the "To" field: "Выберите разные склады"
7. Verify an error banner appears at the top: "Склад-источник и склад-получатель не могут совпадать."
8. Verify the submit button is disabled
9. Add a product line and quantity
10. Verify banner still shows and submit remains disabled
11. Change "To" warehouse to a different one
12. Verify the "To" field error clears
13. Verify the banner disappears
14. Verify the submit button becomes enabled (if ≥1 complete line)

**Expected result:**
- Same-warehouse selection triggers both field-level and form-level validation
- Error message "Выберите разные склады" appears below "To" field
- Error banner appears at top of form
- Submit button disabled when warehouses are equal (regardless of lines)
- Changing "To" to a different warehouse clears all errors
- Form becomes submittable again (if other validations pass)

**Reconciliation:** None (validation is client-side)

**Designed-gap note:** None

---

### TRANSFERS-05 · Create modal — validation — over-stock block

**Preconditions:**
- Two warehouses exist: WH1, WH2
- Product A has 100 units in WH1, 20 in WH2
- Create modal is open

**Steps:**
1. Ensure "From" = WH1, "To" = WH2
2. Select Product A in line 1
3. Enter quantity 101 (exceeding the 100 available in WH1)
4. Tab out of the quantity field
5. Verify the quantity field shows an error state (red background/border)
6. Verify below the quantity field: "На складе «Главный склад»: **100 шт** — запрошено 101 шт" (in red text, error color)
7. Verify an error banner appears at the top: "Количество в одной из позиций превышает остаток на складе-источнике."
8. Verify the submit button is disabled
9. Change the quantity to 100 (exactly available)
10. Verify the quantity field error clears (no red styling)
11. Verify the availability text: "На складе «Главный склада»: **100 шт**" (in normal color, no overflow message)
12. Verify the error banner disappears
13. Verify the submit button becomes enabled
14. Add a second line with Product B (50 units in WH1), enter quantity 60
15. Verify error banner reappears (second line is now over-stock)
16. Verify submit button remains disabled
17. Correct line 2 quantity to 50
18. Verify both errors clear and submit becomes enabled
19. Submit the form
20. Verify success and new transfer appears in list

**Expected result:**
- Over-stock validation runs on blur of quantity field
- Quantity exceeding warehouse availability shows:
  - Red error styling on the quantity input
  - Red error text below: "На складе «Главный склад»: **100 шт** — запрошено X шт"
  - Form-level error banner: "Количество в одной из позиций превышает остаток на складе-источнике."
  - Submit button disabled
- Correcting to ≤available clears all errors
- Form is submittable when all lines are within availability

**Reconciliation:** None (validation is client-side; stock is not actually checked against live server state)

**Designed-gap note:** Over-stock is hard-blocked per business-rules rule 20. In production, the backend would also validate and reject over-stock submissions.

---

### TRANSFERS-06 · Create modal — validation — no complete lines

**Preconditions:**
- Create modal is open with one empty line row

**Steps:**
1. Verify "From" and "To" warehouses are selected (defaults applied)
2. Do NOT select a product or quantity in line 1
3. Do NOT add any additional lines
4. Verify the submit button is disabled
5. Verify the positions counter shows "Позиций: 0"
6. Click "Добавить товар" 3 times
7. Verify three empty line rows exist (all with productId=0, quantity=0)
8. Do NOT fill any of them
9. Click submit button (should remain disabled)
10. Verify error banner: "Добавьте хотя бы одну позицию с товаром и количеством."
11. Select a product in line 2 but enter quantity 0
12. Verify the line is still incomplete (quantity must be >0)
13. Verify positions counter: "Позиций: 0"
14. Verify error banner remains and submit button disabled
15. Enter quantity 1 in line 2
16. Verify positions counter: "Позиций: 1"
17. Verify error banner disappears
18. Verify submit button becomes enabled

**Expected result:**
- Form starts with ≥1 empty line
- No complete lines initially: submit button disabled
- Error banner: "Добавьте хотя бы одну позицию с товаром и количеством." or "Заполните количество для выбранных товаров."
- A line is complete only when both productId > 0 AND quantity > 0
- Positions counter reflects only complete lines
- Submit button enabled when ≥1 complete line AND warehouses differ AND all quantities within availability

**Reconciliation:** None (validation is client-side)

**Designed-gap note:** None

---

### TRANSFERS-07 · Create modal — discard changes confirmation

**Preconditions:**
- Create modal is open
- User has made changes: selected a product, entered a quantity, typed in note

**Steps:**
1. Select Product A, enter quantity 50, type "Test note" in note field
2. Verify form fields are dirty (changes made)
3. Click the X (close button) in the dialog header
4. Verify a confirmation dialog appears with:
   - Icon: warning triangle
   - Title: "Отменить изменения?" or similar discard-changes message
   - Body: confirmation text
   - "Отменить" (cancel, left button) and "Отменить изменения" (confirm discard, right button)
5. Click "Отменить" (cancel discard)
6. Verify the confirmation dialog closes
7. Verify the create form is still open with all changes preserved (Product A selected, quantity 50, note text visible)
8. Modify the form again or click X again
9. Click "Отменить изменения" (confirm)
10. Verify both dialogs close and the list view is shown

**Expected result:**
- Closing the form while dirty (changes made) triggers a discard-changes confirmation
- Cancelling the confirmation keeps the form open with changes preserved
- Confirming the discard closes the form and returns to list view
- Discarded changes are not saved

**Reconciliation:** None (confirmation is UI-only)

**Designed-gap note:** None

---

### TRANSFERS-08 · List view — table columns and sorting

**Preconditions:**
- ≥3 transfers exist with different dates and warehouse routes
- Example transfers:
  - Transfer 1: 2026-06-24 09:15, WH1 → WH2, 2 positions, 150 units, created by "Алексей"
  - Transfer 2: 2026-06-23 14:30, WH2 → WH1, 1 position, 75 units, created by "Мария"
  - Transfer 3: 2026-06-24 16:00, WH1 → WH3, 3 positions, 200 units, created by "Юрий"

**Steps:**
1. Navigate to Transfers module
2. Verify the table displays with the following columns (left to right):
   - Date (ISO format, e.g., "24.06.2026")
   - From (source warehouse name with warehouse icon, not accented)
   - To (destination warehouse name with warehouse icon, accented in teal/primary color, bold)
   - Positions (right-aligned, numeric)
   - Units (right-aligned, numeric, bold)
   - Created By (author name, right-aligned)
   - Chevron (right-aligned, navigation affordance)
3. Verify rows are sorted by date descending (newest first):
   - Row 1: Transfer 3 (2026-06-24 16:00)
   - Row 2: Transfer 1 (2026-06-24 09:15)
   - Row 3: Transfer 2 (2026-06-23 14:30)
4. Verify numeric columns (Positions, Units) use monospace font and are right-aligned
5. Verify the "From" warehouse name is not accented (gray, normal weight)
6. Verify the "To" warehouse name is accented in teal, bold font
7. Verify the chevron icon is visible and grey
8. Verify pagination controls appear at the bottom if >10 rows
9. Verify the page title shows: "Перемещения (3)" with count

**Expected result:**
- Table displays all transfers with correct column headers
- Rows sorted by date descending (newest first)
- Warehouse names display with correct icons and styling (From = normal, To = accented teal/bold)
- Numeric values right-aligned and monospace
- Pagination controls visible if needed
- Page title includes count in parentheses

**Reconciliation:** Transfers are queryable and sorted correctly in the mock data.

**Designed-gap note:** Sorting is not user-interactive in the current implementation (always date descending, client-side).

---

### TRANSFERS-09 · List view — warehouse filter

**Preconditions:**
- ≥4 transfers exist:
  - Transfer A: WH1 → WH2 (involves WH1 and WH2)
  - Transfer B: WH2 → WH3 (involves WH2 and WH3)
  - Transfer C: WH1 → WH3 (involves WH1 and WH3)
  - Transfer D: WH3 → WH1 (involves WH3 and WH1)
- Three warehouses exist: WH1, WH2, WH3

**Steps:**
1. Verify the warehouse filter dropdown displays "Все склады" initially
2. Verify all 4 transfers are visible in the table
3. Click the warehouse filter dropdown
4. Select "WH1" (first warehouse)
5. Verify the table updates to show only transfers involving WH1:
   - Transfer A (WH1 → WH2) ✓
   - Transfer B (WH2 → WH3) ✗
   - Transfer C (WH1 → WH3) ✓
   - Transfer D (WH3 → WH1) ✓
   - Result: 3 transfers visible
6. Verify the filter value in the dropdown shows "WH1"
7. Click the dropdown again
8. Select "WH2"
9. Verify only transfers involving WH2 are shown:
   - Transfer A (WH1 → WH2) ✓
   - Transfer B (WH2 → WH3) ✓
   - Transfer C (WH1 → WH3) ✗
   - Transfer D (WH3 → WH1) ✗
   - Result: 2 transfers visible
10. Verify the page title updates: "Перемещения (2)"
11. Click the filter dropdown
12. Select "Все склады" (or the initial value)
13. Verify all 4 transfers reappear

**Expected result:**
- Warehouse filter applies to both "From" and "To" warehouses (OR logic)
- Selecting a warehouse shows only transfers where that warehouse is source OR destination
- Count in title updates to reflect filtered results
- Filter persists in the dropdown value
- "Все склады" resets the filter and shows all transfers

**Reconciliation:** Filter is applied client-side; all transfers are fetched from the mock and filtered in the store.

**Designed-gap note:** Warehouse filter is client-side per business-rules § (locked pattern 11 — view-shaping filters are on the page, not parameterized to the backend).

---

### TRANSFERS-10 · List view — empty state when filtered

**Preconditions:**
- ≥2 transfers exist, none involving warehouse WH4
- Warehouse WH4 exists but has no transfers

**Steps:**
1. Navigate to Transfers
2. Verify transfers are visible in the table
3. Click the warehouse filter dropdown
4. Select WH4
5. Verify the table is replaced with an empty state:
   - Icon: SwapHorizontal outline
   - Heading: "Ничего не найдено"
   - Body: "По выбранному складу перемещений нет. Измените фильтр."
   - NO "Создать" button in the empty state (because data exists, just filtered)
6. Verify the page title shows: "Перемещения (0)" or "Перемещения" (depending on implementation)
7. Click the warehouse filter
8. Select "Все склады"
9. Verify transfers reappear in the table

**Expected result:**
- Filtering to a warehouse with no transfers shows the filtered empty state
- Heading: "Ничего не найдено"
- Body text advises changing the filter
- NO "Create" button (to distinguish from the true empty state)
- Count in title shows 0 or updates
- Resetting filter restores all transfers

**Reconciliation:** Filter applies client-side; all transfers fetched and filtered in-store.

**Designed-gap note:** None

---

### TRANSFERS-11 · List view — row click opens detail modal

**Preconditions:**
- ≥1 transfer exists
- Transfer details: 2026-06-24 15:30, WH1 → WH2, 2 positions:
  - Line 1: Product A, 50 units, measurement = "шт" (Piece)
  - Line 2: Product B, 30 units, measurement = "л" (Liter)
- Note: "Пополнение филиала вечерних закусок"
- Created by: "Мария"

**Steps:**
1. Navigate to Transfers
2. Verify the transfer row is visible
3. Click anywhere on the transfer row (or specifically the chevron)
4. Verify the detail modal opens with:
   - Header title: "Перемещение"
   - Subtitle: "24.06.2026 15:30 · Мария" (date/time · author)
   - Close button (X) in top right
5. Inspect the from → to route section:
   - From box with label "Откуда", warehouse name "WH1" with icon
   - Chevron icon in circular blue/primary-light badge
   - To box with label "Куда", warehouse name "WH2" with icon
6. Inspect the lines table:
   - Columns: Product, SKU, Quantity, Unit
   - Row 1: "Product A", "[SKU]", "50", "шт"
   - Row 2: "Product B", "[SKU]", "30", "л"
   - Total row: "Итого позиций: 2", empty SKU cell, "80", "ед."
7. Verify the note section displays:
   - Icon: ReceiptLong outline
   - Text: "Пополнение филиала вечерних закусок"
8. Verify the immutability hint banner (blue bg, primary info icon):
   - Text: "Перемещение проведено и **неизменяемо**. Остатки обоих складов были обновлены в момент создания."
9. Verify the footer has only a "Закрыть" (Close) button
10. Verify NO edit, delete, or action menu (⋮) buttons
11. Click the Close button
12. Verify the modal closes and returns to the list view

**Expected result:**
- Row click opens detail modal (read-only)
- Header shows transfer ID/identifier, date/time, and author
- Route section displays from/to warehouses with icons and styling
- Lines table shows product name, SKU, quantity, and unit for each line
- Total row sums quantities across all units with fallback unit label "ед."
- Note displays if present
- Immutability hint banner informs user (blue info-level styling)
- No edit/delete affordances
- Close button returns to list

**Reconciliation:** Transfer data from mock matches submission payload.

**Designed-gap note:** Transfers are immutable (rule 16) — no edit/delete flows exist in the UI.

---

### TRANSFERS-12 · List view — detail modal without note

**Preconditions:**
- Transfer exists with no note (note = null)

**Steps:**
1. Click the transfer row to open detail
2. Verify the modal opens
3. Scroll down past the lines table
4. Verify the note section is NOT displayed (no note box, no "Примечание" label)
5. Verify the immutability banner is still visible below the lines table
6. Click Close and verify the modal closes

**Expected result:**
- When transfer.note is null or empty, the note section is not rendered
- The layout flows directly from the lines table to the immutability banner
- No "empty note" placeholder or message

**Reconciliation:** None (conditional rendering)

**Designed-gap note:** None

---

### TRANSFERS-13 · CSV export — happy path

**Preconditions:**
- ≥3 transfers exist with varied dates and warehouse routes
- Transfer data:
  - Transfer 1: 2026-06-24 09:00, WH1 → WH2, 2 positions, 150 units, Author: "Алексей"
  - Transfer 2: 2026-06-23 14:30, WH2 → WH1, 1 position, 75 units, Author: "Мария"
  - Transfer 3: 2026-06-24 16:00, WH1 → WH3, 3 positions, 200 units, Author: "Юрий"

**Steps:**
1. Navigate to Transfers
2. Verify the "Экспорт" button is visible and enabled in the header
3. Click the "Экспорт" button
4. Verify a CSV file download is triggered (browser download)
5. Open the downloaded file in a text editor or spreadsheet app
6. Verify the CSV structure:
   - Header row: "Дата,Откуда,Куда,Позиций,Единиц,Автор"
   - Data rows (3 rows for 3 transfers):
     - "24.06.2026,WH1,WH2,2,150,Алексей"
     - "23.06.2026,WH2,WH1,1,75,Мария"
     - "24.06.2026,WH1,WH3,3,200,Юрий"
7. Verify the file name contains "transfers_" prefix and a date stamp (e.g., "transfers_2026-06-24_153045.csv")

**Expected result:**
- Export button is enabled and triggers a CSV download
- CSV includes header row with columns: Date, From, To, Positions, Units, Author
- Data rows contain all transfers visible in the current view
- Values are formatted correctly (date as DD.MM.YYYY, numeric values as integers, names as text)
- File is named "transfers_[timestamp].csv"

**Reconciliation:** CSV export includes all filterable data; no server-side aggregation needed.

**Designed-gap note:** CSV export only runs on the current filtered view (client-side export).

---

### TRANSFERS-14 · CSV export — with warehouse filter

**Preconditions:**
- ≥4 transfers exist across multiple warehouses
- Warehouse filter is applied (e.g., WH1)
- Filtered results show 2 transfers

**Steps:**
1. Apply warehouse filter to show only transfers for WH1
2. Verify the table shows 2 transfers
3. Click "Экспорт"
4. Open the downloaded CSV
5. Verify the CSV contains only the 2 filtered transfers (not all 4)
6. Verify the header row and format are correct

**Expected result:**
- Export button exports only the filtered transfers visible in the current view
- CSV includes only rows matching the active warehouse filter
- Header row and format match the base export case

**Reconciliation:** Client-side filtering is reflected in the export.

**Designed-gap note:** None

---

### TRANSFERS-15 · Product autocomplete — search and filtering

**Preconditions:**
- Create modal is open with an empty line
- ≥5 active products exist with diverse SKUs:
  - Product A: SKU "A-100-1", name "Мороженое пломбир 500г"
  - Product B: SKU "B-200-2", name "Молоко жирное 1л"
  - Product C: SKU "C-300-3", name "Сыр голландский 1кг"
  - Product D: SKU "D-400-4", name "Йогурт питьевой 200мл"
  - Product E: SKU "E-500-5", name "Масло сливочное 200г"

**Steps:**
1. Click the product autocomplete input in line 1
2. Verify the dropdown opens showing all 5 products
3. Type "мор" (part of "Мороженое")
4. Verify the dropdown filters to show only Product A ("Мороженое пломбир 500г")
5. Clear the input
6. Type "A-100" (SKU search)
7. Verify the dropdown shows Product A (search works on SKU via `additionalFilter`)
8. Select Product A
9. Verify the autocomplete closes and displays "Мороженое пломбир 500г"
10. Add a second line
11. Click the product autocomplete in line 2
12. Verify the dropdown shows all remaining products EXCEPT Product A (already picked)
13. Verify if the same product is selected in another line, that option is excluded
14. Type "йо" to search for Product D
15. Verify Product D is shown (not filtered out by duplicate check)
16. Select Product D
17. Verify autocomplete closes
18. Click the product autocomplete in line 1 again
19. Verify the dropdown still shows Product A (current line's product is always included)
20. Click the product autocomplete in line 2
21. Verify the dropdown now excludes Product A and Product D (both already in use)

**Expected result:**
- Product autocomplete opens dropdown on click
- Typing filters by product name (case-insensitive)
- SKU search works via `additionalFilter` (e.g., "A-100" matches SKU)
- Selecting a product displays it in the input
- Duplicate-check logic: options exclude products already picked in OTHER lines
- The current line's product is always included in its own dropdown (allows re-selection)
- Autocomplete closes on selection
- SKU and measurement persist after selection

**Reconciliation:** None (client-side filtering)

**Designed-gap note:** None

---

### TRANSFERS-16 · Quantity field — numeric input and availability

**Preconditions:**
- Create modal is open
- Product A selected in line 1
- Product A has 100 units in the source warehouse

**Steps:**
1. Verify the quantity field is a NumericField (MUI input, type=number)
2. Click the quantity field
3. Type "50"
4. Verify the input shows "50"
5. Verify below the input: "На складе «[warehouse]»: **100 шт**"
6. Clear the input and type "0"
7. Verify the input shows "0"
8. Verify the line is incomplete (quantity must be >0)
9. Type "abc"
10. Verify the input rejects non-numeric characters (NumericField prevents them)
11. Verify the input remains empty or shows only valid numeric characters
12. Type "100"
13. Verify the input shows "100"
14. Verify no error (exactly available, not over-stock)
15. Type "101"
16. Verify the input shows "101"
17. Tab out of the field
18. Verify error styling on the quantity field (red border/background)
19. Verify error text appears: "На складе «[warehouse]»: **100 шт** — запрошено 101 шт" (in red)
20. Type "50" to correct
21. Verify error clears

**Expected result:**
- Quantity field accepts numeric input only
- Non-numeric characters are rejected
- Availability text displays: "На складе «[warehouse]»: **X шт**"
- Over-stock (quantity > availability) shows error on blur
- Error text includes requested and available amounts
- Correcting the quantity clears the error
- Quantity must be >0 to mark the line as complete

**Reconciliation:** None (input validation is client-side)

**Designed-gap note:** Quantity field has a `min=0` constraint but quantity must be >0 to be complete.

---

### TRANSFERS-17 · Line deletion — multi-line scenario

**Preconditions:**
- Create modal is open with 3 complete lines added:
  - Line 1: Product A, 50 units
  - Line 2: Product B, 30 units
  - Line 3: Product C, 20 units

**Steps:**
1. Verify all three delete buttons are enabled (not disabled)
2. Verify positions counter shows "Позиций: 3"
3. Click the delete button on line 2
4. Verify line 2 is removed from the DOM
5. Verify lines 1 and 3 remain (now appearing as lines 1 and 2)
6. Verify positions counter updates to "Позиций: 2"
7. Click the delete button on what is now line 2 (former line 3, Product C)
8. Verify it is removed
9. Verify only line 1 remains (Product A, 50 units)
10. Verify the delete button for the last remaining line is DISABLED
11. Verify positions counter shows "Позиций: 1"
12. Attempt to click the disabled delete button
13. Verify the click has no effect (button is disabled)
14. Select a product in line 1 but set quantity to 0
15. Verify the line is still rendered (not auto-deleted)
16. Add a new line via "Добавить товар"
17. Verify a second empty line appears
18. Click delete on the empty line
19. Verify it is removed
20. Verify the single complete line (Product A, 50) remains
21. Verify positions counter still shows "Позиций: 1"

**Expected result:**
- Delete button removes the corresponding line
- Last line's delete button is disabled (at least 1 line must remain for form submission)
- Positions counter updates correctly after deletion
- Form structure is preserved after deletion (no layout shift)
- Empty lines can be deleted like any other
- Deleting lines does not prevent form submission if ≥1 complete line remains

**Reconciliation:** None (client-side line management)

**Designed-gap note:** At least one line must remain in the form, but it may be empty until populated.

---

### TRANSFERS-18 · Loading state during submission

**Preconditions:**
- Create modal is open with a complete transfer ready to submit:
  - From: WH1, To: WH2
  - Line 1: Product A, 50 units

**Steps:**
1. Click the submit button
2. Verify a loading progress bar appears below the modal header (LinearProgress component)
3. Verify the warehouse select fields are disabled during loading
4. Verify the product autocomplete is disabled during loading
5. Verify the quantity field is disabled during loading
6. Verify the delete button is disabled during loading
7. Verify the note textarea is disabled during loading
8. Verify the "Добавить товар" button is disabled during loading
9. Verify the submit button is disabled during loading
10. Verify the cancel button is disabled during loading
11. Wait for the POST request to complete (mock returns after 150-400ms delay)
12. Verify the loading progress bar disappears
13. Verify the modal closes
14. Verify the list view is displayed

**Expected result:**
- Loading progress bar appears on submit
- All form inputs are disabled (isSaving=true)
- All buttons are disabled during submission
- Modal closes after successful submission
- List view returns with the new transfer visible
- Success notification toast appears

**Reconciliation:** None (loading state is UI feedback)

**Designed-gap note:** None

---

### TRANSFERS-19 · Pagination — list table with 50+ transfers

**Preconditions:**
- 51 transfers exist (or simulate pagination by checking the rows-per-page options)
- Example: 30 transfers in the mock data, add 21 more for total 51

**Steps:**
1. Navigate to Transfers
2. Verify the table shows the first 10 rows (default page size or configured max)
3. Verify pagination controls appear at the bottom of the table:
   - "Rows per page: [10▼]" dropdown
   - Page navigation (Previous/Next buttons or numbered pages)
   - "Showing X-Y of Z" text
4. Click the rows-per-page dropdown
5. Verify options appear: 10, 25, 50
6. Select "25"
7. Verify the table updates to show 25 rows per page
8. Verify the pagination text updates
9. Click the "Next" or ">" button to go to the next page
10. Verify rows 26-50 are displayed
11. Verify the "Next" button is disabled if this is the last page
12. Click "Previous" or "<" button
13. Verify rows 1-25 are displayed again
14. Select "50" rows per page
15. Verify all 51 rows are displayed (or first 50, with next page showing 1)

**Expected result:**
- DataTable pagination works correctly
- Rows per page can be adjusted via dropdown (10, 25, 50 options)
- Page navigation works (Previous/Next or numeric)
- Displaying correct row ranges
- Pagination controls update appropriately
- Last page shows remaining rows

**Reconciliation:** Pagination is client-side (all transfers fetched at once, paginated in DataTable).

**Designed-gap note:** Server-side pagination is locked per business-rules § (client-side operations).

---

### TRANSFERS-20 · Module integration — warehouse filter scope

**Preconditions:**
- Warehouses module is populated: 3 warehouses (WH1, WH2, WH3)
- Products module is populated: 5 products with stock
- ≥2 transfers exist involving different warehouse routes

**Steps:**
1. Navigate to Transfers
2. Click the warehouse filter dropdown
3. Verify the dropdown shows exactly the 3 warehouses from the Warehouses module (matching names and IDs)
4. Verify no archived warehouses appear in the filter (if any exist)
5. Select WH1
6. Verify the filter applies and shows only transfers involving WH1
7. Navigate to Warehouses module
8. Create a new warehouse "WH4"
9. Navigate back to Transfers
10. Click the warehouse filter dropdown
11. Verify "WH4" now appears in the dropdown (without page refresh)
12. Select "WH4"
13. Verify the filter shows no results (WH4 has no transfers yet)

**Expected result:**
- Warehouse filter dropdown dynamically reflects active warehouses from the Warehouses module
- Filter is synchronized across sessions
- New warehouses created in Warehouses appear in Transfers filter
- Archived warehouses are excluded from the filter

**Reconciliation:** Warehouse data is fetched via WarehouseStore (shared across modules).

**Designed-gap note:** None

---

### TRANSFERS-21 · Module integration — product stock display in form

**Preconditions:**
- Products module: Product A with 100 units in WH1, 20 units in WH2
- Create modal is open
- From warehouse = WH1, To warehouse = WH2

**Steps:**
1. Select Product A in line 1
2. Verify the availability text shows: "На складе «WH1»: **100 шт**" (WH1's stock)
3. Change the From warehouse to WH2
4. Verify the availability text updates: "На складе «WH2»: **20 шт**" (WH2's stock)
5. Change back to WH1
6. Verify the availability text updates again: "На складе «WH1»: **100 шт**"
7. Enter quantity 100
8. Verify no error (exactly available in WH1)
9. Change the From warehouse to WH2
10. Verify the quantity field now shows an error (100 > 20 available in WH2)
11. Correct the quantity to 20
12. Verify the error clears

**Expected result:**
- Availability text updates when the From warehouse changes
- Availability reflects the selected From warehouse's stock for that product
- Over-stock validation re-runs when the From warehouse changes
- Quantities that were valid may become over-stock after changing warehouses

**Reconciliation:** Product stock is fetched from ProductStore (shared); availability is derived from warehouseItems.

**Designed-gap note:** None

---

### TRANSFERS-22 · Accessibility — keyboard navigation in create form

**Preconditions:**
- Create modal is open
- User has a keyboard and can tab through form elements

**Steps:**
1. Press Tab from the initial focus (likely the From warehouse dropdown)
2. Verify focus moves to the To warehouse dropdown
3. Press Tab
4. Verify focus moves to the product autocomplete in line 1
5. Press Tab
6. Verify focus moves to the quantity field
7. Press Tab
8. Verify focus moves to the delete button (if not disabled)
9. Press Tab
10. Verify focus moves to the "Добавить товар" button
11. Press Tab
12. Verify focus moves to the note textarea
13. Press Tab
14. Verify focus moves to the cancel button
15. Press Tab
16. Verify focus moves to the submit button
17. In the product autocomplete, press the Down arrow key
18. Verify the dropdown opens showing product options
19. Press Down arrow to cycle through options
20. Press Enter to select the highlighted product
21. Verify the autocomplete closes and the selected product is displayed
22. In the quantity field, press Arrow Up/Down
23. Verify the quantity value increments/decrements (if stepper is implemented)

**Expected result:**
- Tab order is logical and follows the form layout
- Form fields are keyboard-accessible
- Autocomplete supports keyboard navigation (arrow keys, Enter)
- Submit button is submittable via Enter key (if not disabled)
- All form controls are focusable

**Reconciliation:** None (accessibility is built into MUI components)

**Designed-gap note:** Keyboard stepper (↑/↓ to increment quantity) may be present but is not documented in the provided code.

---

### TRANSFERS-23 · Responsive design — mobile viewport (if applicable)

**Preconditions:**
- Browser resize or mobile device simulation
- Create modal is open

**Steps:**
1. Resize browser window to a narrow viewport (e.g., 375px wide, simulating mobile)
2. Verify the create modal adapts:
   - Modal width is constrained (maxWidth: 94%)
   - Content is readable without horizontal scroll
3. Verify the from → to warehouse route section is still visible (may stack vertically)
4. Verify the lines table is readable (may adjust column widths or wrap)
5. Verify the submit button and action buttons are still reachable
6. Scroll the modal content to ensure all fields are accessible
7. Tap the product autocomplete
8. Verify the dropdown is visible and selectable
9. Resize back to desktop width
10. Verify the layout returns to normal

**Expected result:**
- Modal remains responsive on narrow viewports
- Content remains readable and accessible
- Form fields are usable on mobile
- No horizontal scrolling required
- Buttons remain clickable

**Reconciliation:** MUI Dialog and components are responsive by default.

**Designed-gap note:** Mobile testing is out of scope for this document if the app targets desktop.

---

### TRANSFERS-24 · Error handling — network failure on list fetch

**Preconditions:**
- Network or mock is configured to simulate a failure on GET /api/transfers
- User navigates to Transfers module

**Steps:**
1. Navigate to Transfers
2. Verify the page loads with a loading state (spinner or skeleton)
3. Simulate a network error or mock a 500 response from GET /api/transfers
4. Verify after a timeout, the page shows an error state or notification
5. Verify the error message: "Не удалось загрузить перемещения" (from transfer.error.getAll i18n key)
6. Verify the table is empty (no rows visible)
7. Verify the user can retry by refreshing the page or clicking a retry button (if implemented)
8. After fixing the mock/network, refresh or click retry
9. Verify the transfers load correctly

**Expected result:**
- Network errors on list fetch are caught and displayed to the user
- Error notification shows: "Не удалось загрузить перемещения"
- User can retry after fixing the issue
- No app crash or hang

**Reconciliation:** Error handling is in TransferStore.getAll() and NotificationStore.error().

**Designed-gap note:** None

---

### TRANSFERS-25 · Error handling — network failure on create

**Preconditions:**
- Create modal is open with a valid transfer ready to submit
- Network or mock is configured to simulate a failure on POST /api/transfers

**Steps:**
1. Fill in a complete transfer form
2. Click the submit button
3. Verify the loading progress bar appears
4. Simulate a network error or mock a 500 response from POST /api/transfers
5. Verify after a timeout, the loading bar disappears
6. Verify an error notification appears: "Не удалось провести перемещение" (from transfer.error.create i18n key)
7. Verify the create modal remains open (form not cleared)
8. Verify all form fields retain the entered data (not lost on error)
9. Verify the user can click submit again to retry
10. After fixing the mock/network, click submit again
11. Verify the transfer is created successfully

**Expected result:**
- Network errors on create are caught and displayed to the user
- Error notification shows: "Не удалось провести перемещение"
- Modal remains open with data preserved (not lost)
- User can retry after fixing the issue

**Reconciliation:** Error handling is in TransferStore.create() and NotificationStore.error().

**Designed-gap note:** None

---

### TRANSFERS-26 · Immutability — no edit or delete affordances

**Preconditions:**
- ≥1 transfer exists
- Transfer detail modal is open
- Transfer list view is active

**Steps:**
1. In the list view, verify each transfer row has only:
   - Data columns (Date, From, To, Positions, Units, Author)
   - Chevron icon (navigation affordance)
   - NO ⋮ (menu button)
   - NO edit icon
   - NO delete icon
2. Open the transfer detail modal
3. Verify the detail modal header has:
   - Title and subtitle
   - Close (X) button only
   - NO edit button
   - NO delete button
   - NO ⋮ menu
4. Verify the detail modal footer has:
   - "Закрыть" (Close) button only
   - NO other action buttons
5. Verify the immutability hint banner is visible and emphasizes the permanent nature:
   - Text includes "неизменяемо" (immutable)
6. Attempt to right-click on the transfer row or detail modal
7. Verify no context menu appears or the context menu has no edit/delete options

**Expected result:**
- No edit or delete affordances exist anywhere in the Transfers module UI
- Transfer rows are read-only after creation
- Detail modals are read-only
- Immutability is reinforced via UI and messaging
- Transfers follow business-rules rule 16 (immutable events)

**Reconciliation:** None (UI design reflects immutable business model)

**Designed-gap note:** Transfers are immutable by design. Corrections via counter-events are out of scope for MVP (business-rules § corrections are a future effort).

---

### TRANSFERS-27 · State persistence — warehouse filter persists during session

**Preconditions:**
- Transfers module has been accessed
- ≥2 transfers involving multiple warehouses

**Steps:**
1. Navigate to Transfers
2. Apply warehouse filter: select WH1
3. Verify the filter is applied and only WH1 transfers are shown
4. Navigate away to another module (e.g., Products)
5. Wait a few seconds
6. Navigate back to Transfers
7. Verify the warehouse filter persists: WH1 is still selected and filtered transfers are shown
8. Click the filter dropdown
9. Select "Все склады"
10. Navigate away and back again
11. Verify the filter resets to "Все склады" (all transfers shown)

**Expected result:**
- Warehouse filter persists during the current session navigation
- When returning to the Transfers module, the previously selected filter remains active
- Selecting "Все склады" resets the filter state
- State is preserved in the MobX TransferStore

**Reconciliation:** Filter state is stored in TransferStore.warehouseFilter and persists in MobX.

**Designed-gap note:** Filter state is NOT persisted across page reloads (no localStorage in this implementation).

---

### TRANSFERS-28 · Theme and styling — color palette and visual hierarchy

**Preconditions:**
- Transfers module is displayed
- Transfer list and create form are visible

**Steps:**
1. Inspect the page header:
   - Title text color and font weight (should be strong/bold)
   - Export and Create buttons (primary and ghost styling)
2. Inspect the warehouse filter:
   - Background color (should match paper background)
   - Border color (should be subtle gray)
   - Icon color (should be disabled gray)
3. Inspect the transfer table:
   - Header row styling (background color, text color)
   - Data rows (alternating background if applicable)
   - Chevron icon color (should be disabled gray)
   - From warehouse name styling (normal weight, secondary color)
   - To warehouse name styling (teal/primary color, bold font)
   - Numeric columns (right-aligned, monospace font)
4. Inspect the create form:
   - Header title and subtitle styling
   - Form field backgrounds (should be white/paper)
   - Warehouse select styling (borders, icons)
   - Chevron between warehouses (teal/primary color)
   - Error states (red borders, red text)
   - Over-stock banner (red severity)
   - Immutability hint banner (yellow/warning background)
5. Inspect the detail modal:
   - Route section background (subtle gray)
   - Chevron badge background (primary light color)
   - Lines table styling
   - Immutability banner (primary light background, info icon color)
6. Verify the color palette matches the app's MUI theme (designTokens)

**Expected result:**
- Colors are consistent with MUI theme and designTokens
- Visual hierarchy is clear (primary actions prominent, secondary muted)
- Error and warning states use appropriate colors (red, yellow/saffron)
- Text contrast is sufficient for accessibility
- Icons use appropriate colors (primary, secondary, disabled gray)
- Warehouse destination is visually accented (teal, bold) to emphasize direction

**Reconciliation:** None (styling is built into components and theme.ts)

**Designed-gap note:** Color palette must match the existing MUI v7 theme and designTokens.

---

### TRANSFERS-29 · Confirmation flows — discard changes and form reset

**Preconditions:**
- Create modal is open
- User has filled in some form fields

**Steps:**
1. Fill the form: select warehouses, add product, enter quantity, type note
2. Verify the form is dirty (fields have changed from defaults)
3. Close the modal via the X button without submitting
4. Verify a discard-changes dialog appears
5. Click "Отменить" (cancel discard)
6. Verify the discard dialog closes and the form is still open with all data intact
7. Close the modal again and click "Отменить изменения" (confirm discard)
8. Verify both dialogs close and the list view is shown
9. Open the create modal again
10. Verify the form is reset to defaults (warehouses set to first two, empty lines, no note)
11. Verify no data from the previous session remains

**Expected result:**
- Closing a dirty form prompts for confirmation
- Cancelling keeps the form open with data preserved
- Confirming discards the data and closes the form
- Re-opening the form resets it to defaults
- Form state is not persisted across open/close cycles

**Reconciliation:** Form state management is in useTransferForm hook and RHF.

**Designed-gap note:** None

---

### TRANSFERS-30 · Cross-module data consistency — warehouse and product references

**Preconditions:**
- Warehouses: WH1, WH2, WH3 (all active)
- Products: Product A, Product B, Product C (all active with stock)
- Transfer created: WH1 → WH2, Product A (50 units)
- Transfer detail modal is open

**Steps:**
1. Verify the transfer detail shows warehouse names matching the Warehouses module (same names, IDs)
2. Verify the transfer detail shows product names matching the Products module (same names, SKUs)
3. Verify the products' measurements match the Products module
4. Archive Product A in the Products module
5. Navigate back to Transfers
6. Open the archived transfer's detail modal
7. Verify the product name still displays correctly (archived products resolve in detail views)
8. Verify the transfer route still shows the correct warehouse names
9. Open a new transfer creation modal
10. Verify the product autocomplete still shows only ACTIVE products (Product A is excluded)
11. Verify the warehouse dropdowns still show only ACTIVE warehouses

**Expected result:**
- Transfer data references are resolved correctly to warehouse and product names
- Archived products and warehouses continue to resolve in historical transfers
- Create forms only offer active products and warehouses
- Data consistency is maintained across modules

**Reconciliation:**
- Transfer data is mocked with product and warehouse names hard-coded
- Live product/warehouse IDs must match between modules
- Archived filtering applies on the form side, not in transfer data

**Designed-gap note:** Archived product/warehouse resolution is allowed per business-rules rule 30 (archiving does not break references).

---

### TRANSFERS-31 · Localization — Russian UI labels

**Preconditions:**
- App language is set to Russian (ru)
- Transfers module is displayed

**Steps:**
1. Verify all UI labels are in Russian:
   - Page title: "Перемещения"
   - Create button: "Новое перемещение"
   - Export button: "Экспорт"
   - Warehouse filter: "Все склады", warehouse names
   - Table headers: "Дата", "Откуда", "Куда", "Позиций", "Единиц", "Автор"
   - Empty state: "Пока нет перемещений", body text
   - Create form title: "Новое перемещение", subtitle: "Перенос товара между складами"
   - Field labels: "Со склада", "На склад", "Позиции", "Примечание"
   - Buttons: "Добавить товар", "Провести перемещение", "Отменить"
   - Error messages: "Выберите разные склады", "Количество…превышает остаток", etc.
   - Detail modal: "Перемещение", "Откуда", "Куда", etc.
   - Close button: "Закрыть"
   - Immutability hints: "неизменяемо", etc.
2. Change the app language to English (if supported) or another locale
3. Verify labels change appropriately to the selected language (or revert to Russian if only Russian is supported)

**Expected result:**
- All user-facing labels are in Russian
- Localization keys resolve correctly from the i18n namespace
- Language switching (if implemented) updates all labels
- No hardcoded English strings appear

**Reconciliation:** i18n keys are sourced from src/i18n/ru/transfer.json and common namespaces.

**Designed-gap note:** Uzbek (uz) locales are empty and pending (per CLAUDE.md); Russian (ru) is the primary MVP language.

---

### TRANSFERS-32 · Edge case — warehouse with no stock

**Preconditions:**
- Two warehouses exist: WH1 (has stock), WH2 (empty)
- Create modal is open
- From warehouse = WH1 (stock: 100 units of Product A)

**Steps:**
1. Select Product A in line 1
2. Verify availability: "На складе «WH1»: **100 шт**"
3. Enter quantity 50
4. Change From warehouse to WH2
5. Verify availability updates: "На складе «WH2»: **0 шт**" (or no stock message)
6. Verify entering any quantity >0 triggers an over-stock error
7. Correct the From warehouse back to WH1
8. Verify availability reverts: "На складе «WH1»: **100 шт**"
9. Verify no error if quantity is 50 (within 100)

**Expected result:**
- When a warehouse has zero stock of a product, availability shows 0
- Attempting to transfer any quantity from the empty warehouse triggers an over-stock error
- Switching back to a warehouse with stock clears the error

**Reconciliation:** Stock availability is derived from ProductStore warehouseItems.

**Designed-gap note:** None

---

### TRANSFERS-33 · Edge case — large quantity values

**Preconditions:**
- Create modal is open
- Product A has 1,000,000 units in source warehouse

**Steps:**
1. Select Product A
2. Enter quantity "1000000"
3. Verify the input displays the full value (numeric formatting, if any)
4. Verify availability text: "На складе «Warehouse»: **1 000 000 шт**" or similar formatted display
5. Verify no validation error (within availability)
6. Enter quantity "1000001"
7. Verify over-stock error appears
8. Submit with quantity 1000000
9. Verify the transfer is created with the large quantity
10. Verify the list shows formatted units: "1 000 000" or similar

**Expected result:**
- Large numeric values are accepted and displayed correctly
- Numeric formatting (thousand separators) applies where appropriate
- Over-stock validation works with large numbers
- Form submits successfully with large quantities

**Reconciliation:** Numeric field and currency formatting utilities handle large values.

**Designed-gap note:** None

---

### TRANSFERS-34 · Audit trail — transfer author and timestamp

**Preconditions:**
- User "Мария" logged in
- Transfer created by Мария
- Transfer detail modal is open

**Steps:**
1. Inspect the detail modal subtitle
2. Verify it displays: "[date] [time] · [author]"
   - Date format: DD.MM.YYYY (e.g., "24.06.2026")
   - Time format: HH:MM (e.g., "15:30")
   - Author: "Мария"
3. Verify the timestamp matches the server's recorded date
4. Verify the author matches the authenticated user

**Expected result:**
- Transfer records the creation timestamp (date and time)
- Transfer records the creating user's name (createdBy field)
- Audit information is immutable (not editable)
- Timestamp and author are displayed in the detail modal

**Reconciliation:** Transfer.date and Transfer.createdBy are set by the server on creation (mocked).

**Designed-gap note:** Audit logs per business-rules rule 26 are a separate feature (not implemented in MVP).

---

## SUMMARY

This test suite covers **34 test cases** spanning:

- **List view** (empty, filtering, sorting, pagination, CSV export)
- **Create flow** (modal, field validation, multi-line, error handling, submission)
- **Detail view** (read-only, immutability reinforcement)
- **Cross-module integration** (warehouse/product references, data consistency)
- **Error handling** (network failures, validation)
- **Accessibility & responsive design** (keyboard navigation, mobile)
- **Localization** (Russian labels)
- **Edge cases** (empty warehouses, large values)

All cases are grounded in the deployed dev environment and real backend behavior (with mocks where noted). Each case includes:
- **Preconditions** (setup required)
- **Steps** (concrete UI actions)
- **Expected result** (observable outcomes)
- **Reconciliation** (cross-module assertions where applicable)
- **Designed-gap notes** (known limitations, per design or MVP scope)

Cases validate the **immutable transfer model** (business-rules §D, rule 16) and confirm the UI correctly conveys that transfers cannot be edited or deleted after creation.
