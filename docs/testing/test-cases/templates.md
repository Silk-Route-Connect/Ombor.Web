# Ombor.Web — Templates Module (Шаблоны) — Manual Browser Test Cases

**Deployment target:** `app.miraziz.net` (frontend) + `api.miraziz.net` (backend, mocks ON)  
**Tenant:** Empty at start; data built up by test execution  
**Module:** Templates (`/templates`) — editable, partner-tied baskets of priced products  
**UI Language:** Russian  
**Currency:** UZS  

---

## Overview

The Templates module (Шаблоны) is a redesigned list view with an expand-row detail, a create/edit modal, and a delete confirmation. Templates are **editable** baskets (not immutable events), tied to one partner, typed Sale or Supply, containing priced product lines. A template does not affect stock or money when created, edited, or deleted. The intended use is to load a template into a new Sale/Supply transaction in one click, but that integration is deferred (see CLAUDE.md §12).

**Key UI patterns:**
- List: immutable-style table with expand-row detail revealing line items + footer totals
- Search & filter: by name/partner + type (All/Sale/Supply) segmented control
- Create/Edit: single modal (locked pattern 3), never-disabled submit, validation on submit + inline error banner
- Type toggle: re-prices all lines when switched (Sale ↔ Supply prices)
- Delete: confirm dialog with a "cannot undo" warning
- Responsive table: Product · SKU · Qty · Unit · Unit Price · Line Total; footer pluralizes the item count

---

## Test Data Seeds

The mock at `/api/templates` is seeded with 5 templates at initialization (see `src/mocks/data/template.ts`):

| ID | Name                      | Type    | Partner ID | Partner Name       | Items | Last Used |
|----|---------------------------|---------|------------|-------------------|-------|-----------|
| 1  | Еженедельная поставка Виктории | Sale   | 4          | Виктория           | 6     | 06.06.2026 (today) |
| 2  | Базовый заказ Орехникова  | Sale    | 3          | Артём Орехников    | 4     | 01.06.2026 |
| 3  | Закупка у Вероники       | Supply  | 5          | Вероника           | 5     | 02.06.2026 |
| 4  | Стандарт Парфёнова      | Supply  | 2          | Парфёнова         | 3     | 25.05.2026 |
| 5  | Ежемесячный заказ Каримова | Supply | 9          | Фарход Каримов     | 2     | (never used) |

The seed also references real Products and Partners from their respective mocks to ensure SKU/unit/partner names resolve correctly.

---

## Test Cases

### TEMPLATES-01: Load List & Verify Initial State

**Preconditions:**
- Tenant is empty (no prior templates)
- App is at `/templates` route

**Steps:**
1. Navigate to Шаблоны (Templates) sidebar menu item
2. Observe page load

**Expected result:**
- Page header: "Шаблоны (5)" (title with count)
- Subtitle: "Сохранённые корзины товаров"
- Primary button: "Новый шаблон" (New Template)
- Toolbar row below header:
  - SearchInput: placeholder "Поиск по названию или партнёру…"
  - SegmentedControl with options: "Все" (selected) | "Продажа" | "Поставка"
- Table loads and displays all 5 seeded templates
- Table has 8 columns: (expand) · Name · Type · Partner · Positions · Total · Last Used · (actions)
- Loading spinner appears briefly during load, then disappears

---

### TEMPLATES-02: Verify Table Row Structure

**Preconditions:**
- List loaded with templates (from TEMPLATES-01)

**Steps:**
1. Observe the first row ("Еженедельная поставка Виктории")

**Expected result:**
- Column 1 (expand): grey down-arrow icon in a bordered box; clickable to expand/collapse
- Column 2 (Name): "Еженедельная поставка Виктории" in bold; black text
- Column 3 (Type): soft pill chip — "Продажа" (Sale) with blue tone + receipt icon
- Column 4 (Partner): "Виктория" in blue, underlined on hover, clickable → navigates to `/partners/4`
- Column 5 (Positions): right-aligned number, monospace, "6"
- Column 6 (Total): right-aligned bold, monospace, "≈ sum of line items" in UZS
- Column 7 (Last Used): right-aligned, "06.06.2026" (formatted date)
- Column 8 (Actions): ⋮ menu icon

---

### TEMPLATES-03: Expand Row to Reveal Line Items

**Preconditions:**
- List loaded (from TEMPLATES-01)
- First row (Еженедельная поставка Виктории) is collapsed

**Steps:**
1. Click the expand-arrow icon in the first row
2. Observe the expanded detail
3. Click the arrow again to collapse

**Expected result:**
- Expand: Row background changes to teal-soft (`primarySoft`), arrow rotates 180°
- Detail table appears below the row with:
  - Header (all caps, grey): Product · SKU · Quantity · Unit · Unit Price · Line Total
  - Rows (one per line item):
    - Product: name in bold, black
    - SKU: monospace, disabled-grey, e.g. "ТОВ-001"
    - Quantity: right-aligned, monospace, e.g. "25"
    - Unit: e.g. "шт" (from `MEASUREMENT_SHORT`)
    - Unit Price: right-aligned, monospace, UZS currency
    - Line Total: right-aligned, bold, monospace (qty × price × (1 − discount%)), UZS
  - Footer row (grey bg):
    - Left: "Итого · 6 позиций" (pluralized via `positionsWord()`)
    - Right: bold large monospace total, e.g. "12,500,000 UZS"
- Collapse: arrow rotates back, detail vanishes, row bg returns to white/hover-gray

---

### TEMPLATES-04: Pagination & Page Size

**Preconditions:**
- List loaded with 5 templates

**Steps:**
1. Observe the table pager at the bottom
2. Verify default page size
3. (Skip if < 25 rows; the pager is present but inactive)

**Expected result:**
- Pager shows: "Showing 1–5 of 5" (or similar i18n key)
- Default rows per page: 25 (set in component state)
- No pagination controls visible (only 5 rows < 25)
- If manually seeded with 30+ templates, pagination controls appear and work

---

### TEMPLATES-05: Search by Template Name

**Preconditions:**
- List loaded with 5 templates (from TEMPLATES-01)

**Steps:**
1. Click SearchInput
2. Type "Виктория" (part of "Еженедельная поставка Виктории")
3. Observe filtered list
4. Clear the search field
5. Verify list resets to all 5

**Expected result:**
- During search: list filters to rows where name OR partner name matches case-insensitively
- "Виктория" match: shows rows 1 (name contains it) + potentially row 4 if partner name matches (it doesn't)
- After clear: all 5 rows reappear
- Page header title updates: "Шаблоны (1)" during search, "Шаблоны (5)" when cleared

---

### TEMPLATES-06: Search by Partner Name

**Preconditions:**
- List loaded with 5 templates

**Steps:**
1. SearchInput: type "Орехников" (partner name in row 2)

**Expected result:**
- Filters to: row 2 ("Базовый заказ Орехникова")
- Header shows: "Шаблоны (1)"

---

### TEMPLATES-07: Type Filter — Segmented Control (All)

**Preconditions:**
- List loaded with 5 templates

**Steps:**
1. Click the "Все" (All) option in the segmented control
2. Verify no change (it's already selected)

**Expected result:**
- All 5 templates visible: rows 1–2 (Sale), rows 3–5 (Supply)
- Header: "Шаблоны (5)"

---

### TEMPLATES-08: Type Filter — Sale

**Preconditions:**
- List loaded with 5 templates
- Type filter is "Все"

**Steps:**
1. Click "Продажа" (Sale) in the segmented control

**Expected result:**
- Filters to Sale-type templates: rows 1–2 only
- Header: "Шаблоны (2)"
- Table shows only rows 1 and 2
- Row type chips: both say "Продажа" (blue, info tone)

---

### TEMPLATES-09: Type Filter — Supply

**Preconditions:**
- List loaded; type filter is currently "Продажа"

**Steps:**
1. Click "Поставка" (Supply) in the segmented control

**Expected result:**
- Filters to Supply-type templates: rows 3–5
- Header: "Шаблоны (3)"
- Row type chips: all say "Поставка" (saffron/warning tone)

---

### TEMPLATES-10: Combined Search + Filter

**Preconditions:**
- List loaded with 5 templates

**Steps:**
1. Set type filter to "Поставка" (Supply)
2. Search for "Парфёнова"
3. Observe result
4. Clear search
5. Observe result

**Expected result:**
- With filter + search: shows row 4 only ("Стандарт Парфёнова", Supply)
- After clear search: shows rows 3–5 (all Supply templates)
- Type filter remains "Поставка" until changed

---

### TEMPLATES-11: Empty State — No Templates

**Preconditions:**
- List is empty (no templates exist)

**Steps:**
1. Navigate to `/templates` with an empty database (or manually delete all templates)
2. Observe empty state

**Expected result:**
- Table disappears
- Centered empty-state box appears:
  - Icon: Layers outline in a grey circle
  - Heading: "Шаблоны пока не созданы" (Templates not yet created)
  - Body: "Создайте шаблон вручную или сохраните позиции из продажи или поставки." (explanation)
  - Button: "Новый шаблон" (primary)
- Segmented control still visible above empty state
- Type filter has no effect (0 results stay 0)

---

### TEMPLATES-12: Empty State — Search with No Matches

**Preconditions:**
- List loaded with 5 templates

**Steps:**
1. Search for "XYZABC" (non-existent text)

**Expected result:**
- Empty state appears with different copy:
  - Heading: "Шаблоны не найдены" (Templates not found)
  - Body: "Измените запрос поиска или фильтр по типу." (Try different search/filter)
  - No "New Template" button (because templates exist, search just found none)

---

### TEMPLATES-13: Create Modal — Open & Close (Discard)

**Preconditions:**
- List loaded

**Steps:**
1. Click "Новый шаблон" button in header
2. Verify modal opens
3. Click the X close button (or press Esc)
4. Confirm "Discard changes?" dialog (if any form values were touched)

**Expected result:**
- Modal opens with title "Новый шаблон" and subtitle "Корзина товаров для партнёра…"
- Modal is centered, 760px wide (responsive 94% on mobile)
- Close button (X) in header
- Form is empty:
  - Name field: empty placeholder "Напр. Еженедельная поставка Виктории"
  - Type: "Продажа" (Sale) selected by default (two big card buttons)
  - Partner: empty "PartnerAutocomplete"
  - Product search: empty, placeholder "Добавить товар…"
  - Items table: empty with icon "Нет позиций" + help text
- Cancel button: "Отмена" (GhostButton)
- Submit button: "Создать шаблон" (PrimaryButton, always enabled per hard rule 5)
- Pressing Esc closes the modal without a discard confirm (form is clean at start)

---

### TEMPLATES-14: Create Modal — Name Field Validation

**Preconditions:**
- Create modal is open

**Steps:**
1. Leave Name empty
2. Click Submit
3. Observe error
4. Type "A" (single character)
5. Click Submit again
6. Type "Valid Name"
7. Click Submit (form still invalid due to missing partner/items, but no name error)

**Expected result:**
- Step 2: Error banner appears at top: "Заполните обязательные поля: название…"
- Step 2: Name field has red border, error message (if any)
- Step 4: Still shows error (< 2 chars)
- Step 6: Name error clears, field no longer red
- Validation message from schema: `"Введите название шаблона"` (min 2 chars) and `"Название шаблона слишком длинное"` (max 100 chars)

---

### TEMPLATES-15: Create Modal — Partner Selection

**Preconditions:**
- Create modal is open

**Steps:**
1. Observe Partner field (empty, required)
2. Click or focus the PartnerAutocomplete
3. Type "Орехников" to search
4. Select "Артём Орехников (Both)"
5. Verify field updates
6. Submit form (still needs items; expect error)

**Expected result:**
- Partner field: PartnerAutocomplete displays "Выберите партнёра" placeholder
- Step 3: Dropdown opens with matching partners
- Step 4: Selected partner name appears in the field
- Step 6: Partner error clears from the error banner if Name was filled

---

### TEMPLATES-16: Create Modal — Type Toggle (Sale vs Supply)

**Preconditions:**
- Create modal is open

**Steps:**
1. Verify "Продажа" (Sale) is selected by default
2. Click the "Поставка" (Supply) card
3. Verify it becomes selected (border + bg tint)
4. Add a product and observe price
5. Switch back to "Продажа"

**Expected result:**
- Type toggle: two equal-width cards, each with icon + label
  - Sale card: blue tone (info), receipt icon
  - Supply card: saffron/warning tone, shipping icon
- Selection: card has colored border, soft colored bg, shadow
- Step 2: Supply card is now selected
- Step 4–5 (see TEMPLATES-31 for re-pricing behavior)

---

### TEMPLATES-17: Create Modal — Add Product (Single)

**Preconditions:**
- Create modal is open
- Partner is selected (e.g., "Артём Орехников")
- Type is "Продажа" (Sale)

**Steps:**
1. Click the product search field (placeholder "Добавить товар…")
2. Type "ТОВ" (first 3 chars of a SKU)
3. Observe dropdown with matching products
4. Click on one product (e.g., a product with ID 1 and salePrice = 50,000)
5. Verify product is added to the items table

**Expected result:**
- Step 2: Dropdown appears with products matching the SKU or name
- Step 4:
  - Product is added to the items table
  - Search field clears and refocuses
  - The added product is removed from the dropdown options (filtered out)
  - Item row shows: name · monospace sku · qty stepper (1) · price field (50,000 UZS) · delete icon
  - Item row has a line total calculation below the name (e.g., "1 × 50,000 UZS")
  - Items count in header: "Товары · 1"
  - Total at top-right of items box: "Итого: 50,000 UZS"

---

### TEMPLATES-18: Create Modal — Duplicate Product Prevention

**Preconditions:**
- Create modal is open
- One product is already added (e.g., product ID 1)

**Steps:**
1. Search for the same product again
2. Click it

**Expected result:**
- Product is not added (silent no-op)
- Dropdown filters out the already-added product (it doesn't appear in the list)
- Validation schema includes a refine check: `duplicateProduct` error if any product ID appears twice

---

### TEMPLATES-19: Create Modal — Qty Stepper (Increment/Decrement)

**Preconditions:**
- Create modal is open
- One product line exists with qty = 1

**Steps:**
1. Click the − button (decrement)
2. Click the + button (increment)
3. Click the + button again
4. Manually type "99" in the qty input
5. Delete all text and click + to set to 1

**Expected result:**
- Step 1: Button is disabled (qty clamped ≥1), qty remains 1
- Step 2: Qty becomes 2
- Step 3: Qty becomes 3
- Step 4: Qty becomes 99
- Step 5: Qty resets to 1
- Line total updates in real-time: "qty × price"

---

### TEMPLATES-20: Create Modal — Edit Price Per Line

**Preconditions:**
- Create modal is open with 1 product added (e.g., price = 50,000)

**Steps:**
1. Click the price field for the product
2. Clear it and type "75000"
3. Tab out or click elsewhere
4. Verify line total updates

**Expected result:**
- Price field: NumericField, input accepts numbers only, shows "UZS" suffix
- Step 2: Field updates to 75,000
- Step 4: Line total updates to "qty × 75,000"

---

### TEMPLATES-21: Create Modal — Delete Line Item

**Preconditions:**
- Create modal is open with 2 product lines added

**Steps:**
1. Click the delete icon (trash) on the first line
2. Verify first line is removed
3. Verify item count updates

**Expected result:**
- Line is removed from the items table
- Item count in header: "Товары · 1"
- Total recalculates

---

### TEMPLATES-22: Create Modal — Form Validation (Missing Required Fields)

**Preconditions:**
- Create modal is open

**Steps:**
1. Leave all fields empty
2. Click "Создать шаблон" (Submit)
3. Observe error banner

**Expected result:**
- Error banner appears: "Заполните обязательные поля: название, партнёр, хотя бы одна позиция."
- Error fields are marked:
  - Name: red border
  - Partner: (error state in autocomplete, if styled)
  - Items: red border on the items box
- Form does not submit

---

### TEMPLATES-23: Create Modal — Happy Path (Submit)

**Preconditions:**
- Create modal is open

**Steps:**
1. Fill:
   - Name: "Test Template 1"
   - Type: "Продажа" (default)
   - Partner: Select a customer (e.g., Виктория)
2. Add 2 products with different prices
3. Click "Создать шаблон"
4. Wait for success

**Expected result:**
- Submit button shows a loading spinner (LinearProgress visible)
- After ~350ms delay (mock), button and form disable (isSaving=true)
- Modal closes
- List reloads and new template appears at the top
- Success toast: "Шаблон 'Test Template 1' создан"
- New template:
  - Name: "Test Template 1"
  - Type: "Продажа" (blue chip)
  - Partner: "Виктория"
  - Positions: 2
  - Total: sum of (qty × price) for both lines
  - Last Used: "—" (null, never used yet)

---

### TEMPLATES-24: Create Modal — Info Banner (Prices & Immutability Note)

**Preconditions:**
- Create modal is open with at least one product added

**Steps:**
1. Observe the info banner at the bottom of the form

**Expected result:**
- Blue info banner (info tone):
  - Icon: info outline (i)
  - Text: "Шаблон **не затрагивает** склад и деньги — это лишь сохранённая корзина. Цены подставляются как **цены продажи** и их можно изменить." (when type=Sale)
  - Text updates if type is Supply: "…цены поставки…"

---

### TEMPLATES-25: Edit Modal — Open & Pre-fill

**Preconditions:**
- List loaded with templates
- At least one template exists (e.g., template ID 1 "Еженедельная поставка Виктории")

**Steps:**
1. Click the ⋮ menu on any template row
2. Click "Редактировать" (Edit)
3. Observe modal opens with pre-filled data

**Expected result:**
- Modal title: "Редактировать шаблон" (vs "Новый шаблон" for create)
- Modal submit button: "Сохранить" (vs "Создать шаблон" for create)
- Form is pre-filled:
  - Name: template name
  - Type: template type (Sale/Supply)
  - Partner: template partner
  - Items: all line items with their quantities, prices, discounts (if any)
- Item count: "Товары · N"
- Total: sum of all lines

---

### TEMPLATES-26: Edit Modal — Modify & Save

**Preconditions:**
- Edit modal is open with a template loaded

**Steps:**
1. Change the name to "Updated Name"
2. Remove one line item (delete button)
3. Add a new product
4. Click "Сохранить"

**Expected result:**
- Request sent: `PUT /api/templates/{id}` with updated payload
- Modal closes
- List updates:
  - Template name changes to "Updated Name"
  - Positions count updates
  - Total recalculates
- Success toast: "Шаблон 'Updated Name' обновлён"

---

### TEMPLATES-27: Edit Modal — Type Switch Re-Prices Lines

**Preconditions:**
- Edit modal is open
- Current type: Sale
- Template contains products with different sale/supply prices (e.g., product 1: salePrice=100k, supplyPrice=80k)

**Steps:**
1. Observe product prices (e.g., 100,000)
2. Switch type to "Поставка" (Supply)
3. Observe prices update
4. Switch back to "Продажа"

**Expected result:**
- Step 2: All line prices re-price to supply prices (80,000)
  - Backend product catalog is consulted
  - Lines whose product is archived/missing keep their current price
- Step 3: All prices re-price back to sale prices (100,000)
- Line totals recalculate
- Form is marked dirty (submit button text still "Сохранить")

---

### TEMPLATES-28: Edit Modal — Discard Changes Confirm

**Preconditions:**
- Edit modal is open
- Form is dirty (e.g., name changed)

**Steps:**
1. Click X to close or press Esc
2. Observe confirm dialog
3. Click "Отмена" (Cancel)
4. Verify modal stays open
5. Click X again, then "Отменить изменения" (Confirm discard)

**Expected result:**
- Step 2: "Вы уверены?" confirm dialog appears: "Отмена" · "Отменить изменения" (with danger tone)
- Step 3: Modal stays open with form intact
- Step 5: Dialog closes, main modal closes, list shows original values

---

### TEMPLATES-29: Delete Modal — Open & Confirm

**Preconditions:**
- List loaded with templates

**Steps:**
1. Click the ⋮ menu on any template row
2. Click "Удалить" (Delete)
3. Observe confirm dialog

**Expected result:**
- Confirm dialog opens with:
  - Icon: exclamation (warning tone)
  - Title: "Удалить шаблон «[name]»?" (e.g., "Удалить шаблон «Еженедельная поставка Виктории»?")
  - Body: "Это действие нельзя отменить. Сам шаблон не влияет на склад и деньги — удаление затронет только сохранённую корзину."
  - Cancel button: "Отмена"
  - Danger button: "Удалить шаблон"

---

### TEMPLATES-30: Delete Modal — Confirm Delete

**Preconditions:**
- Delete confirm dialog is open (from TEMPLATES-29)

**Steps:**
1. Click "Удалить шаблон" button

**Expected result:**
- Request: `DELETE /api/templates/{id}`
- Template is removed from the list
- List reloads
- Success toast: "Шаблон '[name]' удалён"
- If it was the last template in the list, empty state appears
- Header count updates: e.g., "Шаблоны (4)"

---

### TEMPLATES-31: Type Re-Pricing Behavior (Sale ↔ Supply)

**Preconditions:**
- Create modal is open
- Type set to "Продажа" (Sale)
- Product catalog is loaded (e.g., product 1 has salePrice=100,000, supplyPrice=80,000)

**Steps:**
1. Add product 1
2. Verify price = 100,000
3. Switch type to "Поставка" (Supply)
4. Verify price updates to 80,000
5. Manually override price to 90,000
6. Switch type back to "Продажа"
7. Verify price re-prices to 100,000 (overrides the manual 90,000)

**Expected result:**
- Step 2: Price = salePrice (100,000)
- Step 3–4: Price = supplyPrice (80,000) — automatic re-price on type switch
- Step 5: Price manually set to 90,000
- Step 6–7: Price re-prices back to salePrice (100,000) — manual override is overwritten
- Form is dirty after each action

---

### TEMPLATES-32: Partner Autocomplete — Direction Filtering

**Preconditions:**
- Create modal is open

**Steps:**
1. Note the partner type (Sale expects Customers, Supply expects Suppliers)
2. Type is "Продажа" (Sale)
3. Click Partner field
4. Observe only Customers appear in dropdown (no Suppliers)
5. Switch type to "Поставка" (Supply)
6. Click Partner field again
7. Observe only Suppliers appear (list changes)

**Expected result:**
- Sale: partner options filtered to Customers and Both (direction=Sale)
- Supply: partner options filtered to Suppliers and Both (direction=Supply)
- The PartnerAutocomplete in the form takes the type as a prop and filters accordingly

---

### TEMPLATES-33: Product Search — By Name & SKU

**Preconditions:**
- Create modal is open
- Product search field is visible

**Steps:**
1. Click product search
2. Type "яйцо" (partial product name)
3. Verify matching products appear (e.g., "Яйца куриные")
4. Clear search, type a SKU like "ТОВ-001"
5. Verify products with that SKU appear

**Expected result:**
- Search is case-insensitive
- Matches by product name OR SKU
- Dropdown shows matching products with their names

---

### TEMPLATES-34: Line Item Discount Field

**Preconditions:**
- Create modal is open
- One product line is added

**Steps:**
1. Observe line item row (currently no discount field visible in the create modal)
2. (Check if discount is editable in this version)

**Expected result:**
- Current implementation: discount is sent as 0 in the request and cannot be edited in the create modal
- Line total = qty × price × (1 − discount% / 100)
- If discount UI is added in future, validate: 0–100% range

---

### TEMPLATES-35: Responsive Layout — Desktop

**Preconditions:**
- Viewport width: ~1920px (desktop)

**Steps:**
1. Navigate to `/templates`
2. Observe layout

**Expected result:**
- Sidebar visible on left
- Page header spans full width with button on right
- Search + filter controls in a flexbox row, wrapping as needed
- Table displays all 8 columns without horizontal scroll
- Modal (create/edit) is 760px wide, centered

---

### TEMPLATES-36: Responsive Layout — Tablet

**Preconditions:**
- Viewport width: ~768px (tablet)

**Steps:**
1. Navigate to `/templates`
2. Resize to tablet width

**Expected result:**
- Sidebar may collapse to icon-only
- Table may scroll horizontally (columns stack or truncate)
- Modal: 760px → clamped to 94% viewport width (slotProps.paper.sx.maxWidth)
- Search input: full width on small breakpoints

---

### TEMPLATES-37: Responsive Layout — Mobile

**Preconditions:**
- Viewport width: ~380px (mobile)

**Steps:**
1. Navigate to `/templates`
2. Resize to mobile width

**Expected result:**
- Search input: full width
- Segmented control: stacks or wraps
- Table: may scroll horizontally or columns collapse
- Modal: 94% width, full height minus padding

---

### TEMPLATES-38: Create Form Grid Layout

**Preconditions:**
- Create modal is open

**Steps:**
1. Observe form layout (desktop view)

**Expected result:**
- Top row (2 columns):
  - Left: Name field (FormFieldLabel + input)
  - Right: Type toggle (2 cards side-by-side)
- Second row (1 column):
  - Partner field (FormFieldLabel + PartnerAutocomplete)
- Third row (1 column):
  - Product search (FormFieldLabel + EntityAutocomplete)
- Items table (full width)
- Info banner (full width)
- Dialog actions (Cancel · Spacer · Save, sticky at bottom)

---

### TEMPLATES-39: Form Validation — Quantity Must Be ≥1

**Preconditions:**
- Edit modal is open with a line item

**Steps:**
1. Click qty field for a line
2. Clear and type "0"
3. Tab out
4. Click Submit

**Expected result:**
- Qty field: validation error "Количество должно быть больше 0"
- Form cannot submit
- Error banner includes "хотя бы одна позиция" if all lines have qty=0

---

### TEMPLATES-40: Form Validation — Unit Price Must Be >0

**Preconditions:**
- Create/edit modal is open with a line item

**Steps:**
1. Click price field
2. Clear and leave empty (or type "0")
3. Tab out
4. Click Submit

**Expected result:**
- Price field: validation error "Цена должна быть больше нуля"
- Form cannot submit
- Error banner: "хотя бы одна позиция" (because line is invalid)

---

### TEMPLATES-41: Name Field — Min/Max Length

**Preconditions:**
- Create modal is open

**Steps:**
1. Type "A" (single char)
2. Tab out
3. Type "AB" (two chars)
4. Verify valid
5. Type 101 characters
6. Verify invalid

**Expected result:**
- Step 1–2: Error "Введите название шаблона" (min 2 chars)
- Step 3–4: No error
- Step 5–6: Error "Название шаблона слишком длинное" (max 100 chars)

---

### TEMPLATES-42: Submit Button Always Enabled (Hard Rule 5)

**Preconditions:**
- Create or edit modal is open
- Form is empty or invalid

**Steps:**
1. Observe submit button ("Создать шаблон" or "Сохранить")
2. Try to click it with empty form

**Expected result:**
- Submit button is always enabled (never `disabled=true`)
- Clicking with invalid data triggers validation on submit
- Errors appear in the error banner and field borders turn red
- Form does not submit

---

### TEMPLATES-43: Loading State (LinearProgress)

**Preconditions:**
- Create or edit modal is open
- Ready to submit

**Steps:**
1. Fill form validly
2. Click Submit
3. Observe loading indicator while request is in flight

**Expected result:**
- LinearProgress appears above dialog content
- Cancel button is disabled during save
- Close button (X) is disabled during save
- `disableEscapeKeyDown` is set on Dialog
- After ~350ms, modal closes

---

### TEMPLATES-44: List Loading State

**Preconditions:**
- Page load is triggered (e.g., initial navigation to `/templates`)

**Steps:**
1. Observe the table during load

**Expected result:**
- CircularProgress spinner appears centered in the table area
- Pager and empty state are not shown
- After ~300ms (mock), list appears

---

### TEMPLATES-45: Last Used Date — Null Display

**Preconditions:**
- List loaded with templates
- Template 5 (Ежемесячный заказ Каримова) has `lastUsedAt: null`

**Steps:**
1. Find row 5 in the list
2. Observe the "Использован" (Last Used) column

**Expected result:**
- Shows "—" (em-dash) instead of a date
- Text is monospace, disabled-grey color

---

### TEMPLATES-46: Partner Column — Clickable Link

**Preconditions:**
- List loaded

**Steps:**
1. Click on the partner name in any template row (e.g., "Виктория")
2. Observe navigation

**Expected result:**
- Navigation to `/partners/4` (partner detail page)
- Row expansion/collapse is NOT triggered (click is stopped with `e.stopPropagation()`)
- Partner link is blue, underlined on hover
- Cursor changes to pointer on hover

---

### TEMPLATES-47: Row Expand — Stops Click Propagation

**Preconditions:**
- List loaded

**Steps:**
1. Click on the partner link in a row
2. Verify row does not expand
3. Click the ⋮ menu
4. Verify row does not expand
5. Click the expand arrow
6. Verify row expands

**Expected result:**
- Partner link: has `onClick={(e) => { e.stopPropagation(); navigate(...); }}`
- Menu icon: parent has `onClick={(e) => e.stopPropagation()}`
- Only the main row content (expand arrow area) triggers expand/collapse

---

### TEMPLATES-48: Segmented Control — Single Selection

**Preconditions:**
- List loaded

**Steps:**
1. Click "Продажа"
2. Click "Поставка"
3. Observe selection moves

**Expected result:**
- Only one option is selected at a time (radio-button behavior)
- Selected option has a teal/primary border + soft bg
- Unselected options are grey border + white bg

---

### TEMPLATES-49: Edit Modal — Quantity Field Direct Input

**Preconditions:**
- Edit modal is open with a line item (qty = 5)

**Steps:**
1. Click qty field
2. Select all (Ctrl+A)
3. Type "12"
4. Tab out

**Expected result:**
- Qty field updates to 12
- Line total recalculates immediately

---

### TEMPLATES-50: Search Field — Autofocus on Modal Open

**Preconditions:**
- Create modal is open
- (This test is for the product search field to verify if it autofocuses per the New Sale design; check if Templates implementation includes this)

**Steps:**
1. Click "Новый шаблон"
2. Verify which field receives focus

**Expected result:**
- Focus may be on Name field (first form field) or product search (for UX optimization)
- Check component to confirm intended behavior

---

### TEMPLATES-51: CSV Export (Future Feature)

**Preconditions:**
- List loaded with templates
- Header toolbar is visible

**Steps:**
1. (Look for CSV export button in header)

**Expected result:**
- **NOT YET IMPLEMENTED** per CLAUDE.md (locked pattern 12, no export action on Templates)
- If present, skip this test as it is out of scope

---

### TEMPLATES-52: Keyboard Navigation — Tab Through Form

**Preconditions:**
- Create modal is open

**Steps:**
1. Press Tab to cycle through fields: Name → Type (if tabbable) → Partner → Product Search → Items (if tabbable) → Cancel → Save
2. Verify logical tab order

**Expected result:**
- Tab order is logical top-to-bottom, left-to-right
- Buttons receive focus with visual outline
- Inputs receive focus with border color change

---

### TEMPLATES-53: Keyboard Shortcuts — None Implemented

**Preconditions:**
- Create/edit modal is open

**Steps:**
1. Try Ctrl+Enter (expected save shortcut from the New Sale design)
2. Try Esc (expected close)

**Expected result:**
- Esc closes the modal (standard MUI Dialog behavior)
- Ctrl+Enter: no action (not implemented for Templates)
- (The New Sale POS has ⌘/Ctrl+Enter as a submit shortcut; Templates uses the standard modal close pattern)

---

### TEMPLATES-54: Items Table — Footer Pluralization

**Preconditions:**
- Edit/create modal is open
- Add products to vary the item count

**Steps:**
1. Add 1 product
2. Expand to view the detail table footer
3. Note the pluralized word
4. Add 4 more products (5 total)
5. Expand again
6. Note pluralization change
7. Edit to 21 items (if possible)
8. Observe pluralization

**Expected result:**
- Qty=1: "1 позиция" (singular)
- Qty=2–4: "N позиции" (genitive plural)
- Qty=5+ (and 21): "N позиций" (nominative plural)
- Footer text uses `positionsWord(count)` function for proper Russian pluralization

---

### TEMPLATES-55: Modal — Paper Elevation & Border Radius

**Preconditions:**
- Create/edit modal is open

**Steps:**
1. Observe the modal dialog paper styling

**Expected result:**
- Dialog has rounded corners: `borderRadius: "12px"`
- Elevation: 1 (slotProps.paper.elevation or default MUI)
- Paper slotProps: `{ width: 760, maxWidth: "94%", borderRadius: "12px" }`

---

### TEMPLATES-56: Expand Row Inner Table — Styling

**Preconditions:**
- List loaded, a row is expanded

**Steps:**
1. Observe the inner table (line items detail)

**Expected result:**
- Inner table is wrapped in a Paper with:
  - `elevation: 1`
  - `border: 1px solid divider`
  - `borderRadius: "12px"`
- Header row: background `grey25`, text uppercase, grey disabled color
- Body rows: alternating white / slightly different shade (if designed)
- Footer row (totals): grey25 bg, bold text, right-aligned total, "UZS" label

---

### TEMPLATES-57: Expand Row — Background Color on Expand

**Preconditions:**
- List loaded

**Steps:**
1. Hover over a collapsed row
2. Click to expand
3. Observe row background

**Expected result:**
- Hover (collapsed): grey25 background
- Expanded: `primarySoft` (teal-soft) background persists
- Arrow icon color: grey when collapsed, primary-blue when expanded
- Arrow rotates 180°

---

### TEMPLATES-58: Table Borders & Dividers

**Preconditions:**
- List loaded

**Steps:**
1. Observe table styling

**Expected result:**
- Table: `borderCollapse: "collapse"`
- Header row: bottom border (1px, divider color)
- Body rows: bottom border (1px, divider color)
- Last row: border present (not omitted)
- All cells have padding: p: "12px 16px"

---

### TEMPLATES-59: Form Dialog Header — Sticky Close on Scroll

**Preconditions:**
- Create modal is open with many items (requires scrolling)

**Steps:**
1. Add 10+ products to make content scrollable
2. Scroll down in the DialogContent
3. Verify header (title, close button) stays visible

**Expected result:**
- DialogContent has `dividers` attribute (border between content and header)
- Header does not scroll (standard MUI Dialog behavior)
- Close button (X) is always accessible at the top-right

---

### TEMPLATES-60: Items Cost Calculation — Discount (Zero)

**Preconditions:**
- Create modal, 1 product added (qty=10, price=5,000, discount=0)

**Steps:**
1. Observe line total: 10 × 5,000 × (1 − 0/100) = 50,000

**Expected result:**
- Line total = 50,000 UZS
- No discount amount shown (not yet in UI; discount is stored as 0)

---

### TEMPLATES-61: Batch Validation on Submit

**Preconditions:**
- Create modal is open

**Steps:**
1. Leave Name empty, Partner empty, Items empty
2. Click Submit

**Expected result:**
- All three errors appear in the error banner: "Заполните обязательные поля: название, партнёр, хотя бы одна позиция."
- Field borders turn red (Name, Partner, Items box)
- Form does not submit

---

### TEMPLATES-62: Product Autocomplete — Case-Insensitive Match

**Preconditions:**
- Create modal is open

**Steps:**
1. Type "ЯЙЦА" (uppercase)
2. Observe matches for "яйцо" products

**Expected result:**
- Case-insensitive match works
- Products appear in dropdown

---

### TEMPLATES-63: Partner Autocomplete — Case-Insensitive Match

**Preconditions:**
- Create modal is open

**Steps:**
1. Click Partner field
2. Type "орехников" (lowercase)
3. Observe matches for "Орехников"

**Expected result:**
- Case-insensitive match works
- Partners appear in dropdown

---

### TEMPLATES-64: Modal Close — Form Dirty Detection

**Preconditions:**
- Create modal is open

**Steps:**
1. Fill Name: "Test"
2. Click X or press Esc
3. Observe discard confirm

**Expected result:**
- Discard confirm dialog appears (form is dirty)
- If no changes: Esc closes without confirm

---

### TEMPLATES-65: List Refresh After Create

**Preconditions:**
- Create modal is open
- List is behind the modal (on desktop, list is not visible)

**Steps:**
1. Create a new template
2. Modal closes
3. Observe list

**Expected result:**
- New template appears at the TOP of the list (prepended)
- No full page refresh; just the new item is inserted
- Page count updates: "Шаблоны (6)"

---

### TEMPLATES-66: List Refresh After Edit

**Preconditions:**
- Edit modal is open
- Editing an existing template

**Steps:**
1. Edit name: "Template OLD" → "Template NEW"
2. Save
3. Observe list

**Expected result:**
- Template in list is updated in-place (same position)
- Name changes
- No other properties change unless explicitly modified
- Count stays the same: "Шаблоны (5)"

---

### TEMPLATES-67: List Refresh After Delete

**Preconditions:**
- List loaded with templates
- Delete confirm dialog is accepted

**Steps:**
1. Delete a template
2. Observe list

**Expected result:**
- Template is removed
- Count updates: e.g., "Шаблоны (4)"
- List shifts up (remaining templates fill the gap)
- No full reload (no loading spinner; just list update)

---

### TEMPLATES-68: Error Toast — Network Failure

**Preconditions:**
- Create/edit modal is open
- Network is intercepted or mocked to fail (or mock handler returns error)

**Steps:**
1. Attempt to create or edit
2. Observe error handling

**Expected result:**
- Error toast appears (via NotificationStore)
- Message: "Не удалось создать шаблон" (from i18n key) or similar
- Modal may stay open or close depending on error handling
- Form is not marked as submitting anymore (isSaving resets)

---

### TEMPLATES-69: Partner Name Resolution — From Mock

**Preconditions:**
- List loaded
- Template 1 references partner ID 4 (Виктория)

**Steps:**
1. Observe the Partner column for template 1
2. Verify it shows "Виктория" (not a number)

**Expected result:**
- Partner name is resolved from the Partners mock data
- If the partner is deleted/missing, falls back to "#ID" (from `findPartner` mock logic)

---

### TEMPLATES-70: Product Info — SKU & Unit in Expand Row

**Preconditions:**
- List loaded, a row is expanded

**Steps:**
1. Observe the inner table columns: Product · SKU · Quantity · Unit · Unit Price · Line Total
2. Verify each line has SKU (e.g., "ТОВ-001") and Unit (e.g., "шт")

**Expected result:**
- SKU: resolved from Products mock (or "—" if missing)
- Unit: measurement enum short form, e.g., "шт" (Unit), "кг" (Kg), "л" (Liter)
- Both are served from the mock's enriched Template response (see mock `buildItem` logic)

---

## Reconciliation Assertions

These checks verify that the Templates module reconciles correctly with backend data and doesn't cause side effects on other modules.

### REC-01: Create Template Does NOT Mutate Partner Balance

**Setup:**
- Partner "Виктория" has initial balance (view via `/partners/[id]`)

**Steps:**
1. Create a template for partner "Виктория" with $10M of products
2. Navigate to Partner detail page for Виктория

**Expected result:**
- Partner balance unchanged
- Opening balance unchanged
- No entries appear in partner's ledger
- No new transactions created

---

### REC-02: Create Template Does NOT Mutate Product Stock

**Setup:**
- Product ID 1 has current stock = 100

**Steps:**
1. Create a template with product ID 1, qty=50
2. Navigate to Warehouses, check product stock

**Expected result:**
- Product stock remains 100
- No stock adjustment or transfer is created

---

### REC-03: Create Template Does NOT Create Wallet Entries

**Setup:**
- Wallet list loaded (if wallets module is available)

**Steps:**
1. Create a template with a significant total
2. Navigate to Wallets, check wallet balances and operations

**Expected result:**
- No wallet operations appear
- Wallet balances unchanged

---

### REC-04: Template Type & Partner Type Compatibility

**Setup:**
- Create a Sale template

**Steps:**
1. Partner autocomplete is restricted to Customers + Both (direction=Sale)
2. Verify Supply templates only allow Suppliers + Both

**Expected result:**
- Sale template cannot be created with a Supplier-only partner
- Supply template cannot be created with a Customer-only partner

---

### REC-05: Product Prices Reflect Catalog at Template Time

**Setup:**
- Product 1 has salePrice=100k, supplyPrice=80k

**Steps:**
1. Create a Sale template with product 1 (price auto-set to 100k)
2. Edit the template and switch type to Supply
3. Verify price re-prices to 80k

**Expected result:**
- Prices always pull from live catalog (Products mock)
- No stale price caching

---

## Known Limitations & Design Gaps

### GAP-01: Template "Use" Action Not Wired (Deferred)

The prototype's «Использовать» (load into transaction) button is listed in the mvp-plan §12 but not yet wired into the New Sale/Supply screens. The ⋮ row menu only shows Edit/Delete. Loading a template will be integrated when the redesigned New Sale/Supply POS lands (see CLAUDE.md §12 for the future integration point).

---

### GAP-02: Template Stock Reservation Not Implemented

When a template is created/edited, it does NOT reserve stock or mutate product stock. This is a known mock limitation. Real usage is expected in the future when templates are loaded into transactions, at which point stock checks/reserves will be evaluated.

---

### GAP-03: Last Used Date Not Updated by Loading

The `lastUsedAt` field is shown in the table but is never updated when a template is loaded into a transaction (because that action is not yet wired). It reflects the design intent but is currently illustrative.

---

### GAP-04: Discount Editing Not Exposed in UI

The template item schema supports a `discount` field (0–100%), but the create/edit modals do not expose a discount input. Lines default to 0% discount. Discount editing can be added in a future UI iteration.

---

### GAP-05: No Bulk Actions (Multi-Select)

The table does not support multi-select or bulk edit/delete. All actions are per-row via the ⋮ menu or expand-row detail.

---

### GAP-06: No CSV Export

Per locked pattern 12 and the deferred Reports v2 feature, no CSV export is available on the Templates list. (See TEMPLATES-51.)

---

## Summary

The Templates module is a fully functional redesigned list/create/edit/delete interface for managing reusable product baskets tied to partners. All CRUD operations are mocked at `/api/templates` and reconcile with the Products and Partners mocks. The module does not affect stock, money, or any other system state by design — templates are purely organizational tools for streamlining transaction creation.

