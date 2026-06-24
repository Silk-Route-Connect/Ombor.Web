# Categories Module — Manual Browser Test Cases

**Environment:** app.miraziz.net (frontend) + api.miraziz.net (backend with MOCKS OFF)  
**Tenant State:** Starts empty  
**Authority:** Live Swagger at https://api.miraziz.net/swagger/v1/swagger.json  

---

## Overview

The Categories module provides a list view of product categories with create, edit, and delete operations. Categories are uniform, deletable when unreferenced (no products), and blocked from deletion when products reference them. All list operations (search, sort, pagination) are client-side. The module enforces field-level validation and displays product-count references in the table.

---

## Test Cases

### CATEGORIES-01 | Page Load — Empty State

**Preconditions:**
- Tenant is fresh with zero categories
- User is authenticated

**Steps:**
1. Navigate to Categories page (URL: `/`)
2. Wait for page load to complete

**Expected Result:**
- Title displays "Категории" (no count shown while loading)
- Empty state card appears with icon, heading "Пока нет категорий", and body text "Создайте первую категорию, чтобы группировать товары каталога."
- "Новая категория" button is visible in the empty state
- Header contains "Экспорт" and "Новая категория" buttons
- Search input field displays placeholder "Поиск по названию…"

**Designed Gap:**
- Count in title only displays when allCategories finishes loading (null during "loading" state is acceptable per source code)

---

### CATEGORIES-02 | Page Load — With Data

**Preconditions:**
- At least 3 categories exist in the backend (create via Categories-04/05 first, or seed directly)
- User is authenticated

**Steps:**
1. Navigate to Categories page
2. Wait for table to load

**Expected Result:**
- Title displays "Категории (3)"
- DataTable appears with rows for each category
- Table columns: Name (with icon) · Description · Product Count (numeric right-aligned) · Actions (⋮)
- Pagination shows "10" rows per page option (other options: 25, 50)
- First page displays all 3 rows
- All rows are sortable by Name, Description, Product Count

---

### CATEGORIES-03 | Search — Match by Name

**Preconditions:**
- Categories exist: "Электроника", "Мебель", "Одежда"
- User is on Categories page

**Steps:**
1. Click search input field
2. Type "Элек"
3. Observe results

**Expected Result:**
- Table filters to show only "Электроника"
- Other rows are hidden
- Title still displays total count from allCategories (not filtered count)
- Result updates as typing occurs (onChange event)

**Reconciliation:**
- Search uses `matchesSearch()` utility, which is case-insensitive and substring-based on both name + description fields

---

### CATEGORIES-04 | Search — Match by Description

**Preconditions:**
- Category "Техника" with description "Крупная бытовая техника"
- User is on Categories page

**Steps:**
1. Search input: "бытовая"
2. Observe results

**Expected Result:**
- Row for "Техника" is displayed (matched via description field)
- Search is case-insensitive

---

### CATEGORIES-05 | Search — No Matches

**Preconditions:**
- At least one category exists
- User is on Categories page

**Steps:**
1. Search input: "несуществующее_слово"
2. Observe results

**Expected Result:**
- Empty state displays with heading "Категории не найдены"
- Body displays "По запросу «несуществующее_слово» ничего не найдено. Измените запрос поиска."
- No "Новая категория" button in search empty state
- Clear search field to restore table

---

### CATEGORIES-06 | Search — Clear / Reset

**Preconditions:**
- Search term is active ("Элек")
- Filtered results are showing

**Steps:**
1. Clear the search input (select all, delete or backspace)
2. Observe results

**Expected Result:**
- Table immediately shows all categories again
- searchTerm resets to ""

---

### CATEGORIES-07 | Sort by Name — Ascending

**Preconditions:**
- Categories exist: "Мебель", "Электроника", "Одежда"
- User is on Categories page

**Steps:**
1. Click the "Название" (Name) column header
2. Observe sort indicator (arrow ▲)

**Expected Result:**
- Table rows reorder A→Z: "Одежда", "Мебель", "Электроника"
- Sort icon appears on header (ascending indicator)
- Sort uses locale-aware string comparison (localeCompare with numeric: true)

---

### CATEGORIES-08 | Sort by Name — Descending

**Preconditions:**
- Name column is already sorted ascending
- User is on Categories page

**Steps:**
1. Click "Название" (Name) column header again
2. Observe sort indicator (arrow ▼)

**Expected Result:**
- Table rows reverse: Z→A: "Электроника", "Мебель", "Одежда"
- Sort icon updates to descending indicator
- Toggling again returns to ascending

---

### CATEGORIES-09 | Sort — Product Count Column

**Preconditions:**
- Categories with different productCounts:
  - "Категория A": 0 products
  - "Категория B": 5 products
  - "Категория C": 3 products
- User is on Categories page

**Steps:**
1. Click "Товаров" (Product Count) column header
2. Observe sort and order

**Expected Result:**
- Table sorts numerically (0, 3, 5 ascending)
- Numeric sort uses localeCompare with numeric: true option
- "Товаров" column header is sortable

---

### CATEGORIES-10 | Pagination — Default Page Size

**Preconditions:**
- 15 categories exist
- User is on Categories page

**Steps:**
1. Observe table
2. Scroll to bottom of table

**Expected Result:**
- First page shows 10 rows (default per code)
- Pagination control shows "1–10 из 15"
- "Rows per page" dropdown displays options: 10, 25, 50 (default selected: 10)

---

### CATEGORIES-11 | Pagination — Change Page Size

**Preconditions:**
- 15 categories exist
- User is viewing page 1 (10 rows shown)

**Steps:**
1. Click "Rows per page" dropdown
2. Select "25"
3. Observe table

**Expected Result:**
- All 15 rows now display on page 1
- Pagination shows "1–15 из 15"
- Dropdown value updates to 25

---

### CATEGORIES-12 | Pagination — Navigate to Page 2

**Preconditions:**
- 25 categories exist
- User is on page 1 with 10 rows per page

**Steps:**
1. Scroll to pagination controls (bottom of table)
2. Click "Next page" button (or the "2" page number)
3. Observe new rows

**Expected Result:**
- Page 2 displays rows 11–20
- Pagination shows "11–20 из 25"
- Previous page button is now enabled

---

### CATEGORIES-13 | Create — Happy Path (Minimal)

**Preconditions:**
- User is on Categories page
- No unsaved changes

**Steps:**
1. Click "Новая категория" button (in header)
2. Modal opens with title "Новая категория"
3. Type "Зелень" in Name field
4. Leave Description empty
5. Click "Сохранить" button
6. Wait for save to complete

**Expected Result:**
- Modal closes
- New row "Зелень" appears at the top of the table
- Product Count shows 0
- Toast notification displays "Категория успешно создана" (success message)
- Description cell shows "—" (em-dash) for empty descriptions

**Reconciliation:**
- New category is created via `POST /api/categories` with `{ name: "Зелень", description: undefined }`
- Frontend adds new category to allCategories array at the start (prepend)
- Backend returns the created Category with id, name, description, productCount

---

### CATEGORIES-14 | Create — With Description

**Preconditions:**
- User is on Categories page

**Steps:**
1. Click "Новая категория" button
2. Type "Напитки" in Name field
3. Type "Безалкогольные и алкогольные напитки" in Description field
4. Click "Сохранить" button
5. Wait for completion

**Expected Result:**
- Modal closes
- New row shows Name "Напитки" and Description "Безалкогольные и алкогольные напитки"
- Description is not truncated in table (max-width: 460px allows overflow)
- Toast displays success message

---

### CATEGORIES-15 | Create — Name Validation: Required Field

**Preconditions:**
- Create modal is open

**Steps:**
1. Leave Name field empty (or clear it if auto-focused)
2. Type anything in Description field to trigger validation
3. Click "Сохранить" button (or press Enter)
4. Observe validation error

**Expected Result:**
- Name field shows red outline (error state)
- Helper text below Name displays "Укажите название категории"
- "Сохранить" button remains enabled (never silently disabled per hard rule 5)
- Modal stays open

---

### CATEGORIES-16 | Create — Name Validation: Max Length 100

**Preconditions:**
- Create modal is open

**Steps:**
1. Type a 101-character string into Name field (e.g., 'a' × 101)
2. Blur the field or trigger onChange validation
3. Attempt to save

**Expected Result:**
- Name field shows error state
- Helper text displays "Название не должно превышать 100 символов"
- "Сохранить" button remains enabled
- Modal stays open

**Reconciliation:**
- Validation uses Zod schema: `z.string().trim().min(1).max(100)`

---

### CATEGORIES-17 | Create — Name Trimming

**Preconditions:**
- Create modal is open

**Steps:**
1. Type "  Спорт  " (spaces before and after) in Name field
2. Click "Сохранить"

**Expected Result:**
- Submitted name is trimmed to "Спорт"
- No leading/trailing spaces in the created category name

**Reconciliation:**
- Zod `.trim()` is applied to the name during validation

---

### CATEGORIES-18 | Create — Description Validation: Max Length 500

**Preconditions:**
- Create modal is open

**Steps:**
1. Type Name "Тест"
2. Type a 501-character string into Description field
3. Blur Description field or trigger validation
4. Attempt to save

**Expected Result:**
- Description field shows error state
- Helper text displays "Описание не должно превышать 500 символов"
- "Сохранить" button remains enabled

**Reconciliation:**
- Zod schema: `z.string().trim().max(500).nullable()`

---

### CATEGORIES-19 | Create — Description Hint Text

**Preconditions:**
- Create modal is open

**Steps:**
1. Click on Description field (without focus or error)
2. Observe the field

**Expected Result:**
- Helper text (when no error) displays hint "Помогает сотрудникам быстрее находить нужную категорию."

---

### CATEGORIES-20 | Create — Discard Changes Confirmation

**Preconditions:**
- Create modal is open
- User has typed "Напитки" in Name field

**Steps:**
1. Click the "X" (close button) on the modal header, or press Escape
2. Confirmation dialog appears with title (from translation "dialog.title") and body (from translation "dialog.body")
3. Click "Отмена" (cancel the discard action)

**Expected Result:**
- Confirmation dialog closes
- Create modal remains open with "Напитки" still in the Name field
- Form is still dirty

**Reconciliation:**
- Uses `useDirtyClose` hook to track form state
- Dialog displays when form is dirty and user attempts to close

---

### CATEGORIES-21 | Create — Discard Changes Confirmed

**Preconditions:**
- Create modal is open with dirty form ("Напитки" entered)
- Discard confirmation dialog is displayed

**Steps:**
1. Click "Подтвердить" (or button matching the "confirm" translation) to confirm discard
2. Observe dialogs

**Expected Result:**
- Both dialogs close
- Create modal is fully closed
- Changes are discarded (not saved)

---

### CATEGORIES-22 | Create — Save Button Disabled During Save

**Preconditions:**
- Create modal is open
- User has entered valid data ("Фрукты" in Name)

**Steps:**
1. Click "Сохранить" button
2. Immediately observe the button state (before save completes)

**Expected Result:**
- "Сохранить" button becomes disabled (inert) while isSaving is true
- Modal footer shows spinner or progress indicator
- LinearProgress bar appears at top of DialogContent
- Button re-enables after save completes

---

### CATEGORIES-23 | Create — Name Autofocus

**Preconditions:**
- Create modal is just opened

**Steps:**
1. Observe modal
2. Begin typing without clicking any field

**Expected Result:**
- Name field has focus (receives input without explicit click)
- Text appears in Name field

---

### CATEGORIES-24 | Edit — Happy Path

**Preconditions:**
- Category "Овощи" exists with description "Свежие овощи" and id=42
- User is on Categories page

**Steps:**
1. Click the ⋮ (three-dot menu) on the "Овощи" row
2. Click "Редактировать" (Edit option)
3. Modal opens with title "Редактировать категорию"
4. Name field contains "Овощи"
5. Description field contains "Свежие овощи"
6. Change Name to "Овощная продукция"
7. Click "Сохранить"

**Expected Result:**
- Modal closes
- Table row updates to display "Овощная продукция"
- Description remains "Свежие овощи"
- Toast displays "Категория успешно обновлена"

**Reconciliation:**
- Update is sent via `PUT /api/categories/{id}` with `{ id: 42, name: "Овощная продукция", description: "Свежие овощи" }`
- Frontend replaces the category in allCategories array
- Backend returns updated Category with same id

---

### CATEGORIES-25 | Edit — Clear Description

**Preconditions:**
- Category with existing description is in edit modal
- Description field contains "Старое описание"

**Steps:**
1. Select all text in Description field
2. Delete / clear it
3. Click "Сохранить"

**Expected Result:**
- Modal closes
- Table row's Description cell now shows "—" (em-dash)
- Toast displays success message
- Backend receives `description: undefined` (or `null` after trim on empty string)

---

### CATEGORIES-26 | Edit — Validation Works

**Preconditions:**
- Edit modal is open

**Steps:**
1. Clear the Name field completely (select all, delete)
2. Click "Сохранить"

**Expected Result:**
- Name field shows error
- Helper text displays "Укажите название категории"
- Modal stays open, no save occurs
- "Сохранить" button remains enabled

---

### CATEGORIES-27 | Edit — Discard Unsaved Changes

**Preconditions:**
- Edit modal is open
- User changed Name from "Овощи" to "Фрукты"

**Steps:**
1. Click X (close) button
2. Discard confirmation appears
3. Click "Подтвердить" to discard

**Expected Result:**
- Both dialogs close
- Category in table still shows "Овощи" (change was not saved)

---

### CATEGORIES-28 | Delete — Unreferenced Category (Happy Path)

**Preconditions:**
- Category "Растения" exists with productCount=0 (unreferenced)
- User is on Categories page

**Steps:**
1. Click ⋮ menu on "Растения" row
2. Click "Удалить"
3. Delete confirmation dialog appears with title "Удалить категорию «Растения»?"
4. Body text: "Категория будет удалена без возможности восстановления. Это действие нельзя отменить."
5. Click "Удалить" (red confirm button)

**Expected Result:**
- Dialog closes
- "Растения" row disappears from table
- Toast displays "Категория успешно удалена"
- Page count (if title shows it) decrements by 1

**Reconciliation:**
- Delete is sent via `DELETE /api/categories/{id}`
- Frontend removes category from allCategories array
- openDelete pre-checks productCount: if 0, opens "delete" dialog; if > 0, opens "deleteBlocked" dialog

---

### CATEGORIES-29 | Delete — Cancel Confirmation

**Preconditions:**
- Delete confirmation dialog is open for "Растения"

**Steps:**
1. Click "Отмена" (cancel button)

**Expected Result:**
- Dialog closes
- "Растения" row still exists in table
- No deletion occurs

---

### CATEGORIES-30 | Delete — Referenced Category (Blocked)

**Preconditions:**
- Category "Техника" exists with productCount=3 (3 products reference it)
- User is on Categories page

**Steps:**
1. Click ⋮ menu on "Техника" row
2. Click "Удалить"
3. Observe dialog

**Expected Result:**
- **Delete-blocked dialog** appears (not the regular delete confirm)
- Title: "Нельзя удалить «Техника»"
- Alert box displays one of:
  - "Невозможно удалить: категория содержит 1 товар" (productCount=1)
  - "Невозможно удалить: категория содержит 3 товара" (productCount=3)
  - "Невозможно удалить: категория содержит 5 товаров" (productCount=5)
  - Uses Russian plural forms (one/few/many)
- Body text: "Сначала переместите товары в другую категорию или удалите их. Категории без товаров можно удалить сразу."
- Single button "Понятно" (understood) closes the dialog
- No deletion occurs

**Reconciliation:**
- Store logic: `openDelete()` checks `category.productCount > 0`
- If > 0, sets `dialogMode = { type: "deleteBlocked", category }`
- ProductCount is backend-computed from referencing products

---

### CATEGORIES-31 | Delete — Blocked → Move Products → Then Delete

**Preconditions:**
- Category "Техника" with 2 products (productCount=2)
- Another category "Электроника" exists
- User is on Categories page

**Steps:**
1. Try to delete "Техника" (gets blocked as per Categories-30)
2. Click "Понятно" to dismiss
3. Manually move products from "Техника" to "Электроника" in the Products module (out-of-scope for this module, but simulated by backend/seed changes)
4. Refresh Categories page (F5 or re-navigate)
5. Click ⋮ on "Техника" again
6. Click "Удалить"

**Expected Result:**
- This time, normal delete confirmation appears (productCount is now 0)
- Delete succeeds after confirmation

**Reconciliation:**
- Backend recomputes productCount when categories are listed
- Frontend observes new count on refresh

---

### CATEGORIES-32 | Delete — Confirm Error Inline

**Preconditions:**
- Network or API returns a 409 error during deletion (e.g., a race condition: products were re-added between pre-check and delete)
- Delete confirmation dialog is open

**Steps:**
1. Click "Удалить" to confirm deletion
2. Backend returns 409 error with ProblemDetails message
3. Observe dialog

**Expected Result:**
- Modal stays open
- Error alert appears inline in the dialog with severity="error"
- Alert displays the backend error message (from `getApiErrorMessage(error)`)
- If no specific message, falls back to "Ошибка при удалении категории"
- "Удалить" button becomes enabled again (save completes)
- User can retry or cancel

**Reconciliation:**
- Store's delete() catches errors and sets `deleteError` in runInAction
- Dialog displays deleteError in an Alert component (line 92–96 in CategoryPage.tsx)

---

### CATEGORIES-33 | Export CSV

**Preconditions:**
- At least 3 categories exist with various data:
  - "Электроника" · "Бытовая техника" · 2 products
  - "Мебель" · null/empty description · 0 products
  - "Одежда" · "Зимняя и летняя коллекция" · 5 products
- User is on Categories page

**Steps:**
1. Click "Экспорт" button (ghost button in header)
2. File download is triggered

**Expected Result:**
- CSV file is downloaded with filename format `categories_YYYY-MM-DD_HH-MM-SS.csv` (using `csvDateStamp()` utility)
- CSV contains three columns: "Название" (Name) · "Описание" (Description) · "Товаров" (Product Count)
- Rows:
  ```
  Название,Описание,Товаров
  Электроника,Бытовая техника,2
  Мебель,,0
  Одежда,Зимняя и летняя коллекция,5
  ```
- Empty descriptions export as empty string (not "—")
- Numeric Product Count exports as number, not formatted

**Reconciliation:**
- Export uses `filteredCategories` (sorted, searched) as the source
- Column headers use i18n keys: `t("category.table.name")`, `t("category.table.description")`, `t("category.table.productCount")`
- Empty descriptions output as `c.description ?? ""`

---

### CATEGORIES-34 | Export CSV — During Loading

**Preconditions:**
- Initial page load is still in progress (network latency simulated)

**Steps:**
1. Click "Экспорт" button before allCategories finishes loading

**Expected Result:**
- CSV exports with empty rows (or just headers)
- No error displayed
- Export uses `filteredCategories === "loading" ? [] : filteredCategories`

---

### CATEGORIES-35 | Export CSV — With Active Search/Sort

**Preconditions:**
- 5 categories exist
- User applied search "Мебель" (filters to 1 row)
- User sorted by Name ascending

**Steps:**
1. Click "Экспорт" button

**Expected Result:**
- CSV contains only the 1 filtered row (Name="Мебель")
- Not the full 5 categories
- Export respects search + sort (uses filteredCategories, which applies search then sort)

---

### CATEGORIES-36 | Table Actions — Row Selection via Icon

**Preconditions:**
- Category "Посуда" exists with id=10
- User is on Categories page

**Steps:**
1. Click the category icon (LocalOfferOutlined icon) on the "Посуда" row

**Expected Result:**
- Icon click does NOT trigger row action
- Only the ⋮ menu or row name is actionable for edit/delete

**Designed Gap:**
- Icon is purely decorative; clickable area is the ⋮ menu or other UI affordances

---

### CATEGORIES-37 | Table — Product Count Display (Zero)

**Preconditions:**
- Category "Новая категория" exists with productCount=0

**Steps:**
1. Observe the row in table

**Expected Result:**
- Product Count cell displays "0" in grey text color (text.disabled)
- Text is right-aligned (align="right")
- No special formatting (no commas for zero)

---

### CATEGORIES-38 | Table — Product Count Display (Non-Zero)

**Preconditions:**
- Category "Электроника" with productCount=42

**Steps:**
1. Observe the row in table

**Expected Result:**
- Product Count cell displays "42" in bold (fontWeight: 700)
- Text is right-aligned
- Number is rendered with numeric styling (numericSx)

---

### CATEGORIES-39 | Table — Description with Line Breaks

**Preconditions:**
- Category with description "Первая линия\nВторая линия\nТретья линия" (multiline description)

**Steps:**
1. Observe the row in table

**Expected Result:**
- Description text displays across multiple lines (if rendering supports it)
- Text wraps within max-width: 460px
- No truncation of content beyond the viewport

**Designed Gap:**
- MUI Typography does NOT preserve newlines by default (white-space: normal); multiline breaks display as spaces unless explicitly styled

---

### CATEGORIES-40 | Form — Description MultiRow Behavior

**Preconditions:**
- Edit or create modal is open
- Description field is focused

**Steps:**
1. Type a long description with manual newlines (paste or Shift+Enter)
2. Type at least 250+ characters across multiple lines
3. Observe the TextField

**Expected Result:**
- TextField minRows={3} ensures minimum 3 row height
- TextField maxRows={6} prevents expansion beyond 6 rows (overflow scrolls internally)
- Text input spans multiple visible rows

---

### CATEGORIES-41 | Page Title — Count Updates

**Preconditions:**
- Page shows 5 categories with title "Категории (5)"
- User opens create modal and saves a new category

**Steps:**
1. Wait for success toast
2. Observe page title

**Expected Result:**
- Title updates to "Категории (6)"
- Count reflects the new allCategories.length

**Reconciliation:**
- Store prepends new category to allCategories array
- computed `filteredCategories` getter re-evaluates
- Component re-renders with updated totalCount

---

### CATEGORIES-42 | API Failure — getAll()

**Preconditions:**
- Backend `/api/categories` endpoint is unavailable or returns 500 error

**Steps:**
1. Navigate to Categories page
2. Wait for initial load to complete

**Expected Result:**
- Table displays empty state (no categories shown, though page may attempt to render)
- Error toast displays "Ошибка при загрузке категорий: [error details]"
- Page is usable; user can still click "Новая категория" to create (stores maintains empty array fallback)

**Reconciliation:**
- `getAll()` catches errors via `tryRun()` helper
- Sets allCategories to `[]` on failure
- Notifies error via `notificationStore.error()`

---

### CATEGORIES-43 | API Failure — Create

**Preconditions:**
- Backend `/api/categories` POST endpoint returns 400 or 500 error

**Steps:**
1. Open create modal
2. Enter valid data "Новая категория"
3. Click "Сохранить"
4. Backend returns error

**Expected Result:**
- Modal stays open
- "Сохранить" button becomes enabled (save completed)
- Error toast displays "Ошибка при создании категории"
- No new row is added to table
- allCategories is unchanged

**Reconciliation:**
- `create()` catches errors via `withSaving()`
- Notifies error but does not update allCategories
- Modal remains open (closeDialog not called)

---

### CATEGORIES-44 | API Failure — Update

**Preconditions:**
- Edit modal is open
- Backend returns 400/500 during PUT

**Steps:**
1. Change category name
2. Click "Сохранить"
3. Backend returns error

**Expected Result:**
- Modal stays open
- Error toast: "Ошибка при обновлении категории"
- Table row shows original (unchanged) data
- "Сохранить" button re-enables

---

### CATEGORIES-45 | Concurrency — Delete While Create in Flight

**Preconditions:**
- Create modal is open with data entered
- User has initiated a save (button is disabled, isSaving=true)
- Somehow another user deletes the same category in the backend (unlikely but possible)

**Steps:**
1. Wait for create to complete
2. Observe result

**Expected Result:**
- Create succeeds regardless (creates a new category, not affected by external delete)
- New category is added to the frontend array
- No race condition visible to user

**Designed Gap:**
- Frontend does not poll for external changes; concurrent user modifications to the same category are not detected

---

### CATEGORIES-46 | Keyboard Navigation — Tab Through Create Form

**Preconditions:**
- Create modal is open
- Name field is autofocused

**Steps:**
1. Press Tab key
2. Observe focus movement

**Expected Result:**
- Focus moves from Name to Description field
3. Press Tab again
4. Focus moves to "Сохранить" button
5. Press Tab again
6. Focus moves to "Отмена" button

---

### CATEGORIES-47 | Keyboard Navigation — Submit with Enter (Name Field)

**Preconditions:**
- Create modal is open
- Name field is focused with valid data "Test"
- Description is empty (not required)

**Steps:**
1. Press Enter while Name field has focus

**Expected Result:**
- Form does NOT submit (Enter on a text input does not trigger form submit unless it's the last field or a specific onKeyDown handler exists)
- Focus remains in Name field OR moves to next field (standard browser behavior)

**Designed Gap:**
- No explicit Enter-to-submit handler on text fields; users must click "Сохранить" button

---

### CATEGORIES-48 | Keyboard Navigation — Escape Key

**Preconditions:**
- Create modal is open with no changes (fresh open)

**Steps:**
1. Press Escape key

**Expected Result:**
- Modal closes immediately (no confirmation, form is clean)

---

### CATEGORIES-49 | Keyboard Navigation — Escape Key with Unsaved Changes

**Preconditions:**
- Create modal is open
- User typed "Категория" in Name field

**Steps:**
1. Press Escape key

**Expected Result:**
- Discard confirmation dialog appears
- Modal is still open behind it

---

### CATEGORIES-50 | Responsive Design — Mobile Width (xs: 100%)

**Preconditions:**
- Viewport width ≤ 600px (mobile)
- User is on Categories page

**Steps:**
1. Observe search input width

**Expected Result:**
- Search input displays at full width (100%)
- Not constrained to 320px

**Reconciliation:**
- `sx={{ width: { xs: "100%", sm: 320 } }}`

---

### CATEGORIES-51 | Responsive Design — Desktop Width (sm: 320px)

**Preconditions:**
- Viewport width > 600px (desktop)
- User is on Categories page

**Steps:**
1. Observe search input width

**Expected Result:**
- Search input displays at fixed 320px width (not full width)

---

### CATEGORIES-52 | Loading State — AllCategories Initially "loading"

**Preconditions:**
- Page just navigated to Categories page
- Network latency is high

**Steps:**
1. Observe initial render

**Expected Result:**
- Title shows "Категории" (no count, since totalCount is null during loading)
- Table shows skeleton or loading indicator (depends on DataTable's loading state handling)
- Pagination and other controls are still visible but may be disabled

**Reconciliation:**
- Component passes `totalCount == null ? t("category.title") : ...` to PageHeader

---

### CATEGORIES-53 | Form Validation Mode — onChange (Not onBlur)

**Preconditions:**
- Create modal is open
- Name field is focused

**Steps:**
1. Type "A" (1 character, valid)
2. Continue typing normally
3. Delete all (now empty, invalid)
4. Observe error timing

**Expected Result:**
- Error message appears immediately as you delete (onChange validation)
- Not delayed until blur event
- Real-time feedback as user types

**Reconciliation:**
- `useCategoryForm` uses `mode: "onChange"` + `reValidateMode: "onChange"` in useForm config

---

### CATEGORIES-54 | Form — Can Save State Logic

**Preconditions:**
- Create modal is open

**Steps:**
1. Observe "Сохранить" button state
2. Start typing valid data
3. Observe button state
4. Trigger a save
5. Observe button state during and after save

**Expected Result:**
- Button is enabled when not saving (isSaving=false), regardless of form validity
- Button becomes disabled during save (isSaving=true)
- Button re-enables after save completes
- Never disabled due to validation errors (hard rule 5)

**Reconciliation:**
- `canSave = !isSaving` (only checks isSaving flag, never form validity)

---

### CATEGORIES-55 | Store — MobX Reactivity

**Preconditions:**
- Multiple observers of the store exist (e.g., header count, table data)
- Store state changes

**Steps:**
1. Create a new category
2. Observe that all components referencing categoryStore update

**Expected Result:**
- Title count updates
- Table adds new row
- No manual refresh needed (MobX runs reactions automatically)

**Reconciliation:**
- Store uses `makeAutoObservable()` with autoBind: true
- Components wrap with `observer()` from mobx-react-lite

---

### CATEGORIES-56 | Cross-Module Reconciliation — Category + Products

**Preconditions:**
- Category "Электроника" exists with productCount=0
- User navigates to Products module and creates a product in "Электроника" category

**Steps:**
1. Go to Products page
2. Create a new product, assign it to "Электроника"
3. Navigate back to Categories page

**Expected Result:**
- "Электроника" row now shows productCount=1
- Delete attempt on this category now shows the blocked dialog

**Reconciliation:**
- ProductCount is backend-computed (served in Category DTO)
- When Categories are re-fetched after product operations, the count reflects current state
- No client-side re-computation; store receives fresh data from backend

---

### CATEGORIES-57 | Cross-Module Reconciliation — Delete Category with Products

**Preconditions:**
- Category "Спорт" exists with 1 product assigned
- User tries to delete "Спорт"
- Blocked dialog is shown
- Before user clicks "Понятно", another user (in parallel) deletes the product from "Спорт"

**Steps:**
1. User clicks "Понятно" to dismiss blocked dialog
2. User immediately clicks ⋮ and "Удалить" again
3. Try to delete "Спорт"

**Expected Result:**
- This time, normal delete dialog appears (backend count updated to 0)
- Delete succeeds

**Designed Gap:**
- No real-time sync; second delete attempt requires a refresh/re-check to see backend state change

---

### CATEGORIES-58 | Empty State — After Deleting All Categories

**Preconditions:**
- Exactly 1 category exists ("Одна категория")
- User is on Categories page

**Steps:**
1. Delete the category
2. Observe page

**Expected Result:**
- Empty state appears with icon, heading "Пока нет категорий", body text, and "Новая категория" button
- Table is completely hidden
- Page title shows "Категории" (no count)

---

### CATEGORIES-59 | Table Column Alignment — Name Left

**Preconditions:**
- Categories page is loaded

**Steps:**
1. Observe Name column

**Expected Result:**
- Text and icon are left-aligned (default)

---

### CATEGORIES-60 | Table Column Alignment — Product Count Right

**Preconditions:**
- Categories page is loaded

**Steps:**
1. Observe "Товаров" column

**Expected Result:**
- Numbers are right-aligned (align="right" on the column)
- Improves scanability for numeric data

---

### CATEGORIES-61 | Modal Dialog Settings — Escape Key Disabled During Save

**Preconditions:**
- Create modal is open
- User saved and isSaving=true

**Steps:**
1. Press Escape key

**Expected Result:**
- Modal does NOT close
- `disableEscapeKeyDown={isSaving}` prevents closure while saving

---

### CATEGORIES-62 | Modal Dialog Settings — Focus Restore Disabled

**Preconditions:**
- User has focus on a background element
- Opens create modal

**Steps:**
1. Close modal
2. Observe focus location

**Expected Result:**
- Focus does not return to the previously focused element before modal opened
- `disableRestoreFocus` is set on Dialog component

**Designed Gap:**
- Default browser behavior (restoring focus) is disabled; user must manually navigate back

---

### CATEGORIES-63 | Form Reset — Opening Modal Multiple Times

**Preconditions:**
- User opens create modal and enters "Категория 1"
- User closes (discarding) without saving
- User opens create modal again

**Steps:**
1. Observe Name field

**Expected Result:**
- Name field is empty (reset to default empty form)
- Not retaining previous input

**Reconciliation:**
- `useEffect` in form hook resets form when isOpen changes
- `form.reset(category ? mapCategoryToFormPayload(category) : { ...emptyCategoryFormDefaults })`

---

### CATEGORIES-64 | Edit Modal — Form Pre-Population

**Preconditions:**
- Category "Спорт" with id=5, name="Спорт", description="Спортивная одежда и обувь"
- User clicks Edit on this row

**Steps:**
1. Observe create modal (now in edit mode)

**Expected Result:**
- Title shows "Редактировать категорию"
- Name field displays "Спорт"
- Description field displays "Спортивная одежда и обувь"
- No new id is generated (existing id is maintained)

**Reconciliation:**
- Store passes `selectedCategory` to modal
- Modal receives it as `category` prop
- Form resets with `mapCategoryToFormPayload(category)` data

---

### CATEGORIES-65 | Dialog — Progressive Linear Loading Indicator

**Preconditions:**
- Create modal is open
- User enters valid data and clicks "Сохранить"

**Steps:**
1. Watch the modal during save (before completion)

**Expected Result:**
- LinearProgress bar appears at the top of DialogContent
- Progress bar is indeterminate (animated, not a percentage)
- `sx={{ position: "absolute", inset: 0 }}` positions it at full width
- Bar disappears when save completes

**Reconciliation:**
- Conditional render: `{isSaving && <Box sx={{ position: "relative", height: 4 }}><LinearProgress .../></Box>}`

---

### CATEGORIES-66 | List — No Filtering UI Controls (Search Only)

**Preconditions:**
- Categories page is loaded

**Steps:**
1. Observe the header

**Expected Result:**
- Only a search input is visible for filtering
- No multi-select dropdowns for "status" or other filters
- No segmented control buttons (unlike some other modules)
- All list operations (search/sort/pagination) are simple and transparent

**Designed Gap:**
- Categories are uniform; no status, archive, or complex filters exist

---

### CATEGORIES-67 | Table Row Menu — Order of Actions

**Preconditions:**
- Category row is displayed

**Steps:**
1. Click ⋮ menu on a row

**Expected Result:**
- Menu items appear in order:
  1. "Редактировать" (Edit) — with warning-colored icon
  2. "Удалить" (Delete) — with error-colored icon

**Reconciliation:**
- `CategoryActionMenu.tsx` defines actions array with Edit first, Delete second

---

### CATEGORIES-68 | Store Initialization — Dialog Mode Default

**Preconditions:**
- App loads with Categories page

**Steps:**
1. Observe initial state

**Expected Result:**
- No modals are open
- dialogMode is `{ type: "none" }`
- selectedCategory is `null`

---

### CATEGORIES-69 | Store Method — setSearch Updates searchTerm

**Preconditions:**
- Page is loaded

**Steps:**
1. Type "Мебель" in search input

**Expected Result:**
- Store's `setSearch("Мебель")` is called
- searchTerm becomes "Мебель"
- filteredCategories computed getter re-evaluates with new search

---

### CATEGORIES-70 | Store Method — setSort Updates sortField and sortOrder

**Preconditions:**
- Page is loaded

**Steps:**
1. Click Name column header

**Expected Result:**
- Store's `setSort("name", "asc")` is called
- sortField becomes "name"
- sortOrder becomes "asc"
- filteredCategories computed getter re-evaluates

---

### CATEGORIES-71 | API Call — getAll Request/Response

**Preconditions:**
- Network monitoring is active (DevTools)

**Steps:**
1. Navigate to Categories page
2. Observe network tab

**Expected Result:**
- GET request to `/api/categories` (no query params)
- Response is a JSON array of Category objects:
  ```json
  [
    { "id": 1, "name": "Категория 1", "description": null, "productCount": 0 },
    { "id": 2, "name": "Категория 2", "description": "Desc", "productCount": 3 }
  ]
  ```

**Reconciliation:**
- `CategoryApi.getAll()` does `http.get<Category[]>(this.baseUrl)`
- baseUrl is `/api/categories`
- No pagination/filtering params (client-side operations)

---

### CATEGORIES-72 | API Call — Create Request/Response

**Preconditions:**
- Network monitoring is active

**Steps:**
1. Open create modal
2. Enter "Новая категория"
3. Click "Сохранить"
4. Observe network tab

**Expected Result:**
- POST request to `/api/categories` with body:
  ```json
  { "name": "Новая категория", "description": undefined }
  ```
  (or description omitted if schema doesn't send it)
- Response is 201 Created with the new Category:
  ```json
  { "id": 5, "name": "Новая категория", "description": null, "productCount": 0 }
  ```

---

### CATEGORIES-73 | API Call — Update Request/Response

**Preconditions:**
- Category with id=3 exists
- Network monitoring is active

**Steps:**
1. Click Edit on category id=3
2. Change name to "Обновлённая"
3. Click "Сохранить"
4. Observe network tab

**Expected Result:**
- PUT request to `/api/categories/3` with body:
  ```json
  { "id": 3, "name": "Обновлённая", "description": null }
  ```
- Response is 200 OK with updated Category:
  ```json
  { "id": 3, "name": "Обновлённая", "description": null, "productCount": 2 }
  ```

---

### CATEGORIES-74 | API Call — Delete Request

**Preconditions:**
- Category with id=7 exists, productCount=0
- Network monitoring is active

**Steps:**
1. Click Delete on category id=7
2. Confirm deletion
3. Observe network tab

**Expected Result:**
- DELETE request to `/api/categories/7`
- Response is 204 No Content (or 200 OK with no body)
- Category is removed from frontend list

---

### CATEGORIES-75 | Schema Validation — CategorySchema Zod

**Preconditions:**
- Schema is defined in `src/schemas/CategorySchema.ts`

**Steps:**
1. Code review or test the schema directly

**Expected Result:**
- Schema enforces:
  - name: string, trimmed, min 1 char, max 100 chars, required
  - description: string, trimmed, max 500 chars, nullable
- Validation messages are i18n translated

---

### CATEGORIES-76 | Utils — mapCategoryToFormPayload

**Preconditions:**
- Utility function is called with a Category

**Steps:**
1. Call `mapCategoryToFormPayload({ id: 1, name: "Test", description: "Desc", productCount: 0 })`

**Expected Result:**
- Returns `{ name: "Test", description: "Desc" }`
- id and productCount are omitted (not part of form values)
- description is preserved as-is (null or string)

---

### CATEGORIES-77 | Utils — csvDateStamp

**Preconditions:**
- Export is triggered

**Steps:**
1. Observe exported filename

**Expected Result:**
- Filename format: `categories_YYYY-MM-DD_HH-MM-SS.csv`
- Example: `categories_2024-06-24_14-30-45.csv`

---

### CATEGORIES-78 | i18n — Module Namespace Keys

**Preconditions:**
- All category i18n keys are defined

**Steps:**
1. Check `src/i18n/ru/category.json` for completeness

**Expected Result:**
- All keys used in components are present:
  - `category.title`, `category.create`, `category.searchPlaceholder`
  - `category.title.create`, `category.title.edit`, `category.title.autocomplete`
  - `category.table.*` (name, description, productCount)
  - `category.form.*` (labels, placeholders, hints)
  - `category.validation.*` (error messages)
  - `category.empty.*` (empty state messages)
  - `category.delete.*` (delete flow messages)
  - `category.error.*`, `category.success.*` (toast messages)

---

### CATEGORIES-79 | i18n — Plural Forms (Russian)

**Preconditions:**
- A category with productCount=1, 3, or 5 cannot be deleted

**Steps:**
1. Try to delete each category
2. Observe the error message text

**Expected Result:**
- productCount=1: "Невозможно удалить: категория содержит 1 товар"
- productCount=2–4: "Невозможно удалить: категория содержит 3 товара"
- productCount=5+: "Невозможно удалить: категория содержит 5 товаров"
- i18next uses Russian plural rules (one/few/many) correctly

**Reconciliation:**
- Translation key: `category.delete.blocked.referenced_{{ count | one/few/many }}`
- i18next pluralization resolves based on Russian grammar rules

---

### CATEGORIES-80 | Type Safety — TypeScript Compilation

**Preconditions:**
- Repo is set up, TypeScript is configured

**Steps:**
1. Run `npm run type-check`

**Expected Result:**
- No TypeScript errors in category module files
- All types resolve correctly
- Store methods, API calls, and components are properly typed

---

## Summary

**Total Test Cases:** 80  
**Coverage Areas:**
- List view (search, filter, sort, pagination, empty states, loading)
- Create flow (validation, discard guards, success/error handling)
- Edit flow (pre-population, updates, validation)
- Delete flow (unreferenced success, referenced blocking, error handling)
- Export (CSV format, filtered data)
- API integration (all CRUD operations, error scenarios)
- Keyboard + responsive UX
- Cross-module reconciliation (Products ↔ Category.productCount)
- i18n and Russian pluralization
- MobX reactivity and store logic
- Form validation modes and field-level behavior

**Key Design Decisions Confirmed:**
1. Delete is never silently disabled; blocked deletions show inline explanation.
2. All list operations (search/sort/pagination) are client-side.
3. Validation runs on form change/submit with inline error messages.
4. ProductCount is backend-computed and drives delete-blocking logic.
5. Export respects active search/sort filters.
6. Discard confirmation guards appear only when form is dirty.
