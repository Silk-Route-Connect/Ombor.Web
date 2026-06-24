# Manual Browser Test Cases — Products Module

**Module:** Товары (Products)  
**Environment:** app.miraziz.net (frontend) + api.miraziz.net (backend)  
**Tenant State:** Starts empty; data builds up as testing proceeds  
**Language:** Russian UI  
**Currency:** UZS (single currency, immutable)

---

## TEST SUITE

### LIST VIEW & FILTERING

| ID | Title | Preconditions | Steps | Expected Result | Reconciliation | Designed Gap |
|---|---|---|---|---|---|---|
| PRODUCTS-01 | Load products list when empty | Tenant is brand new. | 1. Navigate to **Товары** (Products sidebar). | Page displays **"Пока нет товаров"** (empty state) with icon, title, and explanatory text. «Новый товар» button is visible. | N/A | N/A |
| PRODUCTS-02 | Create first product (happy path) | Empty tenant. | 1. Click **«Новый товар»** button. 2. Fill **Название:** "Шоколад молочный" (name, required, min 2 chars). 3. **Измерение:** select "Штука" (Unit, required). 4. **Тип товара:** select "Оба" (All, required). 5. **Артикул:** fill "SKU-001" (required). 6. Leave category, barcode, prices, description empty. 7. Click **«Сохранить»**. | Dialog closes. Success toast: **"Товар успешно создан"**. Product row appears in list: name «Шоколад молочный», SKU «SKU-001», type badge «Оба», stock «0», prices «—», no category. | In `/api/products` backend mock: product count = 1. Product has `id`, `name`, `sku`, `isArchived=false`, `totalStock=0`. | Product created at zero stock per rule 22 (canon). No opening-stock UI in Products module; stock enters via Warehouses module. |
| PRODUCTS-03 | Search by name | Products exist: "Шоколад", "Печенье", "Молоко". | 1. In search box, type "Шо". | Only "Шоколад" row displays. Matches are name + SKU both case-insensitive. | Search is client-side on `filteredProducts`. | N/A |
| PRODUCTS-04 | Search by SKU | Products with SKU: "SKU-001", "SKU-002", "ART-100". | 1. In search box, type "SKU". | Rows for "SKU-001" and "SKU-002" display. | Client-side substring match on SKU field. | N/A |
| PRODUCTS-05 | Filter by category | Products exist: 3 in "Напитки", 2 in "Закуски", 1 uncategorized. | 1. Click category dropdown (default «Все категории»). 2. Select «Напитки». | Only 3 rows from "Напитки" category display. Table footer shows "3 из 6". | Filter updates `categoryFilter` in store, re-filters `filteredProducts`. Uncategorized product is excluded. | N/A |
| PRODUCTS-06 | Clear category filter | Filtered by "Напитки" (3 results). | 1. Click category dropdown. 2. Select empty value or close. | All active products display again. | `categoryFilter` is set to null; `filteredProducts` re-includes all. | N/A |
| PRODUCTS-07 | Type filter: "Продажа" | Products: 2×Sale, 2×Supply, 2×All. | 1. Click type segmented control, select **«Продажа»**. | Shows 4 rows: the 2 Sale + the 2 All (type "All" matches both Sale and Supply). Supply-only products hidden. | `typeFilter="sale"` includes `Product.type ∈ {Sale, All}` per `matchesType()`. | N/A |
| PRODUCTS-08 | Type filter: "Закупка" | Products: 2×Sale, 2×Supply, 2×All. | 1. Click type segmented, select **«Закупка»**. | Shows 4 rows: the 2 Supply + the 2 All. Sale-only products hidden. | `typeFilter="supply"` includes `{Supply, All}`. | N/A |
| PRODUCTS-09 | Type filter: "Оба" | Products: 2×Sale, 2×Supply, 2×All. | 1. Click type segmented, select **«Оба»**. | Shows 2 rows: only the type-All products. Sale-only and Supply-only are hidden. | `typeFilter="both"` includes only `{All}`. | N/A |
| PRODUCTS-10 | Type filter: "Все" | After a type filter. | 1. Click type segmented, select **«Все»**. | All active (non-archived) products display. | `typeFilter="all"` applies no filter. | N/A |
| PRODUCTS-11 | Archive toggle off (default) | Products: 3 active, 2 archived. Title shows "(5)". | 1. Open list. | Only 3 active rows display. Title: **«Товары (5)»** (total dataset). Archive toggle: white card, label «Архив 2». | `showArchived=false`. `archivedCount=2` drives the badge. | Title shows dataset size including archived; table shows active only. |
| PRODUCTS-12 | Archive toggle on | Products: 3 active, 2 archived. | 1. Click archive toggle switch. | All 5 products display (active + archived). Archived rows: name strikethrough + small «Архив» badge + dimmed secondary cells (opacity 0.55). Toggle card: teal background, primary-line border. | `showArchived=true`. Toggle cart turns teal (active state). Archived rows styled per `.is-archived`. | N/A |
| PRODUCTS-13 | Combined filters: category + type + archive + search | Products: "Печенье SKU-P1" (Закуски, Sale, active), "Печенье SKU-P2" (Закуски, Supply, archived), "Печенье SKU-P3" (Напитки, All, active). | 1. Category: «Закуски». 2. Type: «Продажа». 3. Search: "печенье". 4. Archive: off. | Only SKU-P1 row displays (Закуски + Sale ∈ {Sale, All} + contains "печенье" + active). | All filters combine via AND logic in `filteredProducts` computation. | N/A |
| PRODUCTS-14 | Sort by name ascending | Products: "Яблоко", "Апельсин", "Банан". | 1. Click **Название** column header. | Order: Апельсин, Банан, Яблоко (A → Z). Header shows small ↑ arrow. | `sortField="name"`, `sortOrder="asc"`. Store's `applySort()` reorders `filteredProducts`. | Sorting is client-side. |
| PRODUCTS-15 | Sort by name descending | After ascending sort by name. | 1. Click **Название** header again. | Order: Яблоко, Банан, Апельсин (Z → A). Header shows ↓ arrow. | `sortOrder="desc"`. | N/A |
| PRODUCTS-16 | Sort by stock ascending | Products with stock: 100, 50, 0. | 1. Click **Остаток** header. | Order: 0, 50, 100. | `sortField="totalStock"`, `sortOrder="asc"`. | N/A |
| PRODUCTS-17 | Pagination: 10 rows per page (default) | 25 products in list. | 1. Open list (no filters). 2. Observe table footer. | Shows "1–10 из 25". Table displays 10 rows. Page dropdown: 10, 25, 50 options, "10" selected. | DataTable pagination with ROWS_PER_PAGE_OPTIONS=[10, 25, 50]. | Step 25/50 per product decision (prototype showed 25). |
| PRODUCTS-18 | Pagination: change to 25 rows per page | 25 products. | 1. Click page-size dropdown in footer. 2. Select "25". | Single page displays all 25 rows. Footer: "1–25 из 25". | Pagination updates. | N/A |
| PRODUCTS-19 | Pagination: next page | 30 products, 10 per page. Page 1 showing rows 1–10. | 1. Click next-page chevron or "2" in footer. | Page 2 displays rows 11–20. Footer: "11–20 из 30". | DataTable handles page navigation. | N/A |
| PRODUCTS-20 | Empty state with active filters | 10 products, none match "xyz" search. | 1. Type "xyz" in search. | Card with icon, **«Товары не найдены»** (no-results title), **«По заданным условиям ничего не найдено»** body, and no create button. | `isFiltering=true` (search term present); `filteredProducts.length===0`. EmptyState component renders search-specific UI. | N/A |
| PRODUCTS-21 | CSV export (empty list) | Zero products. | 1. Click **«Экспорт»** button. | CSV file downloads with headers but no data rows: "Название, Артикул, Категория, Ед. изм., Тип, Остаток, Цена продажи, Цена поставки, Статус". | Export uses `exportToCsv()` utility. Columns include name, SKU, category, measurement, type, stock, sale/supply prices, status (Active / Архив). | N/A |
| PRODUCTS-22 | CSV export (filtered results) | 5 products visible after applying category filter. | 1. Apply category filter. 2. Click **«Экспорт»**. | CSV contains only the 5 filtered rows + headers. Filename: «products_YYYYMMDD_HHMMSS.csv». | Export uses `filteredProducts`, not `allProducts`. | N/A |
| PRODUCTS-23 | Clicking table row navigates to detail | Product row for "Шоколад" (ID=42). | 1. Click product name/row in table. | Navigates to **`/products/42`** (detail page). No dialog opens. | `onOpen={(product) => navigate(productDetailPath(product.id))}` from ProductsTable. | N/A |

---

### CREATE & EDIT FORM

| ID | Title | Preconditions | Steps | Expected Result | Reconciliation | Designed Gap |
|---|---|---|---|---|---|---|
| PRODUCTS-24 | Open create modal | Any list state. | 1. Click **«Новый товар»** (header button or empty-state button). | Modal opens, centered, 720px wide. Title: **«Новый товар»**. All fields empty (name="", categoryId=null, measurement="Unit", type="All", sku="", prices=0, no images). Subtitle row shows no SKU. No loading bar. Cancel/Save buttons at footer (Save disabled). | Modal opens via `productStore.openCreate()` → `dialogMode.kind="form"`, `product=undefined`. Form resets to DEFAULT_VALUES. | N/A |
| PRODUCTS-25 | Open edit modal | Product exists: "Шоколад", SKU="SKU-001", category="Напитки", type="All", salePrice=5000, supplyPrice=3000. | 1. Click row action menu (⋮) on product. 2. Select **«Редактировать»**. | Modal opens. Title: **«Редактировать товар»**. Subtitle: "SKU-001". All fields pre-filled: name="Шоколад", category="Напитки", type="All", prices visible. No loading bar. Save button enabled (form considered dirty on open). | `productStore.openEdit(product)` → `dialogMode.kind="form"`, `dialogMode.product=<product>`. Form populates via `mapProductToFormPayload()`. | N/A |
| PRODUCTS-26 | Form validation: name required | Create modal open. | 1. Leave name empty. 2. Tab or click Save. | Inline error below name field: **«Название должно содержать мин 2 символа»** (min 2 chars). Save disabled. | Zod schema: `name.min(2)`. Validation on blur (mode="onBlur"). | N/A |
| PRODUCTS-27 | Form validation: name max length | Create modal, name field focused. | 1. Type 251 characters. 2. Blur. | Error: **«Название не должно превышать 250 символов»**. | Zod: `name.max(250)`. | N/A |
| PRODUCTS-28 | Form validation: SKU required | Create modal. | 1. Leave SKU empty. 2. Tab or Save. | Error below SKU: **«Укажите артикул»**. Save disabled. | Zod: `sku.min(1)`. | N/A |
| PRODUCTS-29 | Form validation: measurement required | Create modal. | 1. Leave measurement unselected (if possible) or set to invalid. 2. Save. | Error displays: **«Неверная единица измерения»**. Save blocked. | Zod: `requiredEnum(MEASUREMENTS, ...)`. | The form auto-selects "Unit" by default, so this is hard to trigger in normal flow. |
| PRODUCTS-30 | Form validation: type required | Create modal. | 1. Set type to invalid value or blank. 2. Save. | Error: **«Неверный тип товара»**. | Zod: `type` enum validation. | Form defaults to "All", making this hard to trigger. |
| PRODUCTS-31 | Form validation: negative sale price | Create form, product type="All" (shows both prices). | 1. Enter salePrice = -100. 2. Blur. | Error: **«Цена продажи не может быть отрицательной»**. | Zod: `salePrice.min(0)`. | Prices accept 0 (valid). |
| PRODUCTS-32 | Form validation: negative supply price | Type="All" form. | 1. Enter supplyPrice = -50. 2. Blur. | Error: **«Цена поставки не может быть отрицательной»**. | Zod: `supplyPrice.min(0)`. | N/A |
| PRODUCTS-33 | Form validation: barcode EAN-13 invalid | Create form, barcode field. | 1. Type "123456789012" (12 digits, should be 13). 2. Blur. | Error: **«Некорректный штрих‑код»**. | Zod: `validateEan13()` checks length=13 + valid checksum. | Accepts EAN-8, EAN-13, UPC-A with spaces (stripped). |
| PRODUCTS-34 | Form validation: barcode EAN-13 valid | Barcode field. | 1. Type "5901234123457" (valid EAN-13). 2. Blur. | No error. Field valid. | EAN-13 checksum validates. | N/A |
| PRODUCTS-35 | Form validation: barcode empty is OK | Barcode field. | 1. Leave barcode empty. 2. Blur. | No error. Field is optional. | Zod: `.optional()`. | N/A |
| PRODUCTS-36 | Form validation: description max length | Type="Sale" form. | 1. Enter description: 501 characters. 2. Blur. | Error: **«Описание не должно превышать 500 символов»**. | Zod: `description.max(500)`. | N/A |
| PRODUCTS-37 | Form validation: category is optional | Create form. | 1. Leave category unselected. 2. Save (all other fields valid). | Form submits. Product saved with `categoryId=null`. | Zod: `categoryId.nullable()`. No required rule; canon rule 42 (no default category). | N/A |
| PRODUCTS-38 | Auto-select single category | Tenant has exactly 1 category: "Напитки". | 1. Open create modal. | Category field auto-fills: "Напитки" is pre-selected. Form is not marked dirty. | Hook: when `isOpen && !product && singleCategoryId`, `setValue("categoryId", singleCategoryId, {shouldDirty: false})`. | Only on create, not edit. |
| PRODUCTS-39 | Generate SKU button | Create modal. | 1. Click **«Сгенерировать»** icon next to SKU field. | SKU field populates with random value: "SKU-#####" (5 random digits). Form marked dirty. | `generateSku()` → `setValue("sku", \`SKU-${Math.floor(10000 + Math.random() * 89999)}\`, {shouldDirty: true})`. | Random generation only; does not check uniqueness. |
| PRODUCTS-40 | Type selector changes visible prices | Create modal, type="All" (both prices shown). | 1. Click type segmented, select **«Продажа»**. | supplyPrice field hides; salePrice remains visible. `salePrice` shown, `supplyPrice` zeroed server-side. | When type="Sale": `showSale=true, showSupply=false`. Hidden prices zeroed by form hook. | Hidden prices are zeroed in the request to backend (not shown in UI). |
| PRODUCTS-41 | Type selector: switch from Sale to Supply | Type="Sale" form with salePrice=5000 entered. | 1. Change type to **«Закупка»**. | salePrice field hides. supplyPrice field shows (value 0 or previous). salePrice is zeroed when submitted. | Switching direction hides/shows price pairs via controlled rendering. | N/A |
| PRODUCTS-42 | Packaging section: disabled by default | Create modal. | 1. Observe packaging section. | **«Фасовка»** section is collapsed/not visible initially, or toggle shows "off". | hasPackaging defaults to false. | N/A |
| PRODUCTS-43 | Packaging toggle: enable | Create modal. | 1. Toggle packaging on (or click button to add packaging). | Packaging inputs appear: **«Размер упаковки»** (integer ≥2), **«Этикетка»** (optional, max 50 chars), **«Штрих-код упаковки»** (optional, barcode format). | `enablePackaging()` sets `hasPackaging=true`, shows fields. | N/A |
| PRODUCTS-44 | Packaging validation: size < 2 | Packaging enabled, size field. | 1. Enter size = 1. 2. Blur. | Error: **«В упаковке должно быть не менее 2 единиц»**. | Zod: `size.min(2)`. | N/A |
| PRODUCTS-45 | Packaging validation: size not integer | Packaging enabled. | 1. Enter size = 2.5. 2. Blur. | Error: **«Некорректное количество в упаковке»**. | Zod: `.refine(Number.isInteger)`. | N/A |
| PRODUCTS-46 | Packaging validation: barcode invalid | Packaging enabled. | 1. Enter pack barcode = "123" (invalid EAN). 2. Blur. | Error: **«Некорректный штрих‑код упаковки»**. | Zod: same EAN/UPC validation as product barcode. | N/A |
| PRODUCTS-47 | Image upload: add main image | Create modal. | 1. In images section, click **«Загрузить главное изображение»** or drag-drop. 2. Select a .jpg/.png file (200×200 px, <5MB). | Image thumbnail displays in the modal (132×132 px preview). "Make main" badge on it. Image can be marked for deletion (X button). | `addAttachments()` → preview via `useFilePreviews()`. First image selected as main automatically. | Frontend shows previews; actual upload happens on form submit. |
| PRODUCTS-48 | Image upload: add multiple | After first image. | 1. Click **«Загрузить изображения»**. 2. Select 2–3 more images. | All images display as thumbnails. One marked "главное" (main); others show "Сделать главным" option. Removal (X) available on all. | Multiple attachments stored in `attachments` array. `mainSelection` tracks which is main. | N/A |
| PRODUCTS-49 | Image upload: set different main | 3 images loaded; first is main. | 1. Hover over 2nd image. 2. Click **«Сделать главным»**. | 2nd image gets the "главное" badge; 1st no longer marked main. Form marked dirty. | `selectMainNew(index)` → `mainSelection={kind:"new", index:1}`. | N/A |
| PRODUCTS-50 | Image upload: remove | 2 images uploaded. | 1. Click X on one image. | Image removed from preview list. If it was main, no image is main (or next one auto-selected). Form marked dirty. | `removeAttachment(index)` splices from attachments array. | Removed images submitted in POST/PUT as file parts (not deleted in detail). |
| PRODUCTS-51 | Discard unsaved changes: confirm | Create modal, name filled + dirty, user clicks cancel. | 1. Fill name="Test". 2. Click **Cancel** button (or press Esc). | Discard confirmation dialog: **«Вы уверены, что хотите закрыть форму без сохранения изменений?»**. Two buttons: **«Отмена»**, **«Удалить»** (red). | `useDirtyClose()` hook: if form dirty, shows ConfirmDialog. Pressing Esc triggers this. Saving removes dirty state. | N/A |
| PRODUCTS-52 | Discard unsaved changes: cancel | Discard dialog open. | 1. Click **«Отмена»**. | Dialog closes, form stays open with values intact. | `cancelDiscard()` closes the discard confirmation; form remains. | N/A |
| PRODUCTS-53 | Discard unsaved changes: confirm | Discard dialog open. | 1. Click **«Удалить»** (red). | Modal closes without saving. Form state is lost. User returns to list. | `confirmDiscard()` triggers `onClose()`. | N/A |
| PRODUCTS-54 | Submit form (create, all fields happy path) | Create modal, all required fields filled. Name="Чай черный", SKU="TEA-001", measurement="Gram", type="Sale", salePrice=2500. | 1. Click **«Сохранить»**. | Form submits. Modal closes. Success toast: **«Товар успешно создан»**. New row appears in list. | `handleFormSave()` builds `CreateProductRequest`, calls `productStore.create(request)` → `ProductApi.create()` → POST /api/products. | Backend URL is /api/products (mocked). |
| PRODUCTS-55 | Submit form (edit) | Edit modal open for product ID=42. Name changed to "Чай черный V2". | 1. Modify name. 2. Click **«Сохранить»**. | Modal closes. Success toast: **«Изменения сохранены»**. Row in list updates name. Detail page (if open in background) also updates. | `handleFormSave()` calls `productStore.update({...request, id:42, imagesToDelete:[]})` → PUT /api/products/42. | N/A |
| PRODUCTS-56 | Error banner: multiple validation failures | Create form. | 1. Fill name with 1 char, leave SKU empty, set invalid type. 2. Submit. | Red error banner at top of form: **«Заполните обязательные поля: проверьте отмеченные поля ниже»**. Three fields show inline errors. Save remains disabled. | `showErrorBanner = formState.isSubmitted && Object.keys(formState.errors).length > 0`. | N/A |
| PRODUCTS-57 | Loading state while saving | Create form, all fields valid. | 1. Click **«Сохранить»**. | Linear progress bar appears below dialog header. Save button disabled + shows spinner. Inputs remain interactive (no disable). | `isSaving=true` → LinearProgress visible, buttons disabled. | Dialog remains open during save. |

---

### DETAIL PAGE

| ID | Title | Preconditions | Steps | Expected Result | Reconciliation | Designed Gap |
|---|---|---|---|---|---|---|
| PRODUCTS-58 | Navigate to product detail | Product "Шоколад" exists with ID=42. | 1. From list, click product row. 2. Observe URL. | URL changes to **`/products/42`**. Breadcrumb: **«Товары › Шоколад»**. Back chevron button visible. | `navigate(productDetailPath(product.id))`. Route is `/products/:id`. | N/A |
| PRODUCTS-59 | Detail header: active product | Product: name="Шоколад", SKU="SKU-001", category="Напитки", type="All", archived=false. | 1. Open detail for this product. | Header: **«Шоколад»** (h1, 24px). Sub-row: SKU badge «SKU-001», category chip «Напитки», type chip «Оба». Actions: ⋮ menu (Edit, Archive). No restore button. | ProductDetailHeader renders with onEdit, onArchive callbacks. Menu calls `productStore.openEdit()` / `productStore.openArchive()`. | N/A |
| PRODUCTS-60 | Detail header: archived product | Product: name="Хлеб", archived=true. | 1. Open detail. | Header same as above, but name strikethrough + small «Архив» badge post-name. Type & category chips faded. Actions: primary blue **«Восстановить»** button (no ⋮ menu). | `product.isArchived=true` → render restore button, hide menu. | N/A |
| PRODUCTS-61 | Archive banner: archived product | Archived product open. | 1. Observe page below header. | Yellow/warning banner: **«Товар в архиве. Он скрыт из списков и форм подбора, но его остаток и стоимость по-прежнему учитываются в общих итогах. Действия недоступны — восстановите товар, чтобы редактировать.»** | Rendered if `product.isArchived`. Banner uses i18n keys `product.detail.archived.title/body`. | N/A |
| PRODUCTS-62 | Tab navigation: Overview (default) | Detail page loads. | 1. Observe tabs below header. | Underline tabs: **«Обзор»** (active, teal underline), **«Транзакции»**, **«Движения»**. Content area shows Overview. | Three tabs: overview, transactions, movements. Default `tab="overview"`. Clicking tab updates state. | N/A |
| PRODUCTS-63 | Tab: Transactions (loading state) | Detail page loads. | 1. Click **«Транзакции»** tab. 2. Observe briefly. | Spinner (CircularProgress) displays in the content area while transactions fetch. | Transactions fetch on tab select if not cached. `transactions === "loading"`. | Transactions are fetched via `selectedProductStore.loadTransactions()` on detail load or tab switch. |
| PRODUCTS-64 | Tab: Transactions (with data) | Product has 3 associated transactions (1 sale, 1 supply, 1 refund). | 1. Click **«Транзакции»** tab. 2. Wait for data. | Table displays: date, type chip (Продажа / Поставка / Возврат in color), partner name, quantity (±, color-coded: green in, red out), price (UZS), total (UZS). «Все транзакции» link at bottom → navigates to /sales. Tab badge shows count: "3". | `ProductTransactionsTab` renders transactions list. Quantity signed: +/− prefix. `transactionCount` badge on tab. Click link goes to PATHS.sales. | Transactions are a preview; full list is on Sales/Supplies pages. |
| PRODUCTS-65 | Tab: Transactions (empty) | Product has no transactions. | 1. Click **«Транзакции»** tab. | Empty state card: icon, **«Нет записей»** title, **«По этому товару ещё не было продаж, поставок или возвратов»** body. No link. | Conditional: `transactions.length === 0` → HistoryEmptyState. | N/A |
| PRODUCTS-66 | Tab: Movements (with data) | Product: stock history: opening balance 50, sale −10, supply +20, adjustment +5. | 1. Click **«Движения»** tab. | Table: date, type (Открытие / Продажа / Поставка / Корректировка), warehouse, In/Out/Balance columns. Opening row at bottom shows calculated opening qty (50). Newest first. | MovementsTab shows ledger with running balance. Oldest movement's `balanceAfter - quantity` = opening. | N/A |
| PRODUCTS-67 | Tab: Movements (empty) | Product never stocked. | 1. Click **«Движения»** tab. | Empty state: icon, **«Нет движений»** title, **«Товар ещё не поступал на склад и не списывался»** body. | `movements.length === 0` → HistoryEmptyState. | N/A |
| PRODUCTS-68 | Overview Tab: Images section (with images) | Product has 2 images. | 1. Click **«Обзор»** tab. 2. Scroll to images card. | Card titled **«Изображения»**. Thumbnails displayed (132×132 px), arranged in flex row. Image filenames shown below thumbnails. | ProductOverviewTab renders `DetailCard` with images list. | N/A |
| PRODUCTS-69 | Overview Tab: Images section (no images) | Product has no images. | 1. Click **«Обзор»** tab. 2. Scroll to images. | Images card: **«Нет изображений»** message in gray text. | `product.images.length === 0` → text node. | N/A |
| PRODUCTS-70 | Overview Tab: Description section (with text) | Product: description="A premium dark chocolate from Belgium." | 1. Scroll to description card. | Card titled **«Описание»**. Full text displays in normal font. | DetailCard renders description text. | N/A |
| PRODUCTS-71 | Overview Tab: Description section (empty) | Product: description undefined/empty. | 1. Scroll to description card. | Text: **«Описание не заполнено»** in gray. | `product.description ? ... : t("product.detail.descriptionEmpty")`. | N/A |
| PRODUCTS-72 | Overview Tab: Stock by Warehouse table (multiple warehouses) | Product stock: Склад 1 (100 units, WAC 500, value 50k), Склад 2 (50 units, WAC 500, value 25k), Склад 3 (0 units). | 1. Scroll to "Наличие на складах" card. | Table rows: one per warehouse (3 rows). Columns: Warehouse name + icon, Quantity (Кол-во), Unit (Ед.), WAC (Средняя себестоимость), Value (Стоимость). Quantity 0 in red. WAC shown only if qty > 0, else "—". Total row (bold): sums qty, "—" for unit/WAC columns, sum value. | Table uses `product.warehouseItems` (served backend aggregates). Zero-qty rows show WAC="—" (per component logic). Total row at end. | N/A |
| PRODUCTS-73 | Right rail: Prices card (active product) | Product: salePrice=5000, supplyPrice=3000, averageCost=2500. | 1. Observe sticky right rail. | Card titled **«Цены»** with icon. Rows: **«Цена продажи»** 5000 UZS (teal), **«Цена поставки»** 3000 UZS (info blue), divider, **«WAC»** 2500 UZS (saffron, emphasized large), **«Маржа»** shows calc: margin=2500, pct=100%. | `PriceRow` renders each price. Margin computed: `(salePrice - WAC) / WAC * 100 = 100%`. Emphasis on WAC + margin. | WAC is server-computed, never recomputed client-side (rule 12). |
| PRODUCTS-74 | Right rail: Prices card (no supply price) | Product: salePrice=5000, supplyPrice=0, averageCost=null. | 1. Observe prices rail. | supplyPrice row: "—". WAC row: "—". Margin row: absent (cannot compute without WAC). | When `supplyPrice ≤ 0` or `averageCost == null`, shows "—". Margin hidden if basis is null. | N/A |
| PRODUCTS-75 | Right rail: Stock hero section (with stock) | Product: totalStock=100, unit="Штука". | 1. Observe rail stock card. | Large number **"100"** (28px bold). Unit label **"Шт"** smaller. Caption: **«Всего на складах»**. Below: per-warehouse breakdown inline («Склад 1: 50 · Склад 2: 50»). Border line. Footer row: **«Стоимость остатка»** = 50,000 UZS. | Stock hero: large numeric display. Per-warehouse inline string. Total value = `totalStock × averageCost`. | N/A |
| PRODUCTS-76 | Right rail: Stock hero section (zero stock) | Product: totalStock=0. | 1. Observe stock hero. | Large "0" in red (error.main color). Unit "Шт". Red zero-stock tag with icon: **«Нет на складе»**. | Stock number red when `totalStock === 0`. Tag appears in the hero section. | N/A |
| PRODUCTS-77 | Right rail: Info card (full details) | Product: SKU="SKU-001", barcode="5901234123457", category="Напитки", type="All", measurement="Kilogram", packaging={size:24, label:"Мастербокс"}. | 1. Scroll right rail to info card. | Card titled **«Информация»** with icon. Rows: SKU (mono font), Barcode (mono), Category, Type («Оба»), Measurement («Килограмм (кг)»), Packaging («Мастербокс»). | DetailCard renders info rows from product fields. | Packaging label = user label if set, else "24 кг". |
| PRODUCTS-78 | Right rail: Info card (empty fields) | Product: barcode undefined, category=null, packaging undefined. | 1. Scroll to info card. | Barcode row: "—". Category row: "—". Packaging row: "—". | Undefined/null fields display "—". | N/A |
| PRODUCTS-79 | Right rail: Archived product styling | Archived product detail. | 1. Observe all rail cards. | Stock hero and images fade slightly (opacity ~0.7). All other cards normal. | When `product.isArchived`, large stock number has `opacity:0.7`. | N/A |
| PRODUCTS-80 | Back navigation (chevron) | On detail page. | 1. Click back chevron button. | Navigates back to **`/products`** list. URL changes to `/products`. | `onBack() → navigate(PATHS.products)`. | N/A |
| PRODUCTS-81 | Back navigation (breadcrumb link) | On detail page. | 1. Click **«Товары»** in breadcrumb. | Navigates back to list. | Breadcrumb link calls `onBack()`. | N/A |

---

### ARCHIVE & RESTORE

| ID | Title | Preconditions | Steps | Expected Result | Reconciliation | Designed Gap |
|---|---|---|---|---|---|---|
| PRODUCTS-82 | Archive product from detail | Product "Шоколад" (active) on detail page. | 1. Click ⋮ menu. 2. Select **«Архивировать»** (saffron text). | Confirm dialog: **«Архивировать товар "Шоколад"?»** (title with name), **«Товар будет скрыт из списков и форм подбора, но сохранится в истории»** (body). Two buttons: **«Отмена»**, **«Архивировать»** (saffron/warning style). | `productStore.openArchive(product)` → ConfirmDialog. | N/A |
| PRODUCTS-83 | Confirm archive | Confirm dialog open. | 1. Click **«Архивировать»**. | Dialog closes. Success toast: **«Товар "Шоколад" архивирован»**. Product re-renders: name strikethrough, «Архив» badge appears, restore button replaces ⋮ menu. | `productStore.archive(product)` → PUT /api/products/{id}/archive (mocked). `isArchived=true`. Toast via i18n param `{{name}}`. | N/A |
| PRODUCTS-84 | Cancel archive | Confirm dialog open. | 1. Click **«Отмена»**. | Dialog closes without archiving. Product remains active. | No API call. Dialog closes. | N/A |
| PRODUCTS-85 | Restore product from detail | Archived product on detail page. | 1. Click **«Восстановить»** (primary blue button). | Confirm dialog: **«Восстановить товар "Хлеб"?»** (title with name), **«Товар снова появится в списках и формах подбора»** (body). Buttons: **«Отмена»**, **«Восстановить»** (primary style). | `productStore.openRestore(product)` → ConfirmDialog with blue icon/tone. | N/A |
| PRODUCTS-86 | Confirm restore | Restore dialog open. | 1. Click **«Восстановить»**. | Dialog closes. Success toast: **«Товар "Хлеб" восстановлен»**. Product re-renders: name normal (no strikethrough), badge removed, ⋮ menu returns. | `productStore.restore(product)` → PUT /api/products/{id}/restore. `isArchived=false`. Toast via i18n. | N/A |
| PRODUCTS-87 | Archive from list row menu | Product row visible in list. | 1. Click row ⋮ action menu. 2. Select **«Архивировать»**. | Same confirm dialog as PRODUCTS-82. | Same flow as detail page. Confirm dialog triggered from ProductActionMenu. | N/A |
| PRODUCTS-88 | Archive gating: archived product is read-only (no edit in detail) | Archived product on detail. | 1. Observe ⋮ menu. | No Edit option in menu. Only Restore. (Archived products cannot be edited per the banner message.) | Menu conditionally includes Edit only when `!product.isArchived`. | Rule 16 (canon): archive disables edit. The banner says **«Действия недоступны»**. |
| PRODUCTS-89 | Archived products remain in stock totals | 2 active products (total stock=200), 1 archived (stock=100). | 1. View dashboard or any page showing total stock count. | Total stock = 300 (active + archived). | Server-computed totals include archived (rule 31). | N/A |
| PRODUCTS-90 | Archive toggle shows archived products | 3 active, 2 archived products. Archive toggle off. | 1. Click archive toggle. | Both archived products appear in the list (total 5 rows). Archived rows styled distinctly. | `showArchived=true` includes archived in filter. Store's `archivedCount` drives the badge showing "2". | N/A |

---

### EDIT FLOWS & FORM STATE PERSISTENCE

| ID | Title | Preconditions | Steps | Expected Result | Reconciliation | Designed Gap |
|---|---|---|---|---|---|---|
| PRODUCTS-91 | Edit maintains unsaved state: images | Edit modal open. Product has 1 image. | 1. Add a 2nd image via upload. 2. Click Cancel. 3. Confirm discard. | Images are lost (form state discarded). | `useDirtyClose()` detects form.isDirty=true on image add. Discard clears state. | N/A |
| PRODUCTS-92 | Edit price change (type="Sale" → "All") | Edit product, currently type="Sale" with salePrice=5000, no supplyPrice. | 1. Change type to "All". 2. Enter supplyPrice=3000. 3. Save. | Product updates. API receives `salePrice=5000, supplyPrice=3000, type="All"`. | Form hook manages price visibility and zeroing. | N/A |
| PRODUCTS-93 | Edit disable type change in archived | Attempting to open edit on archived product. | 1. From detail (archived), click attempt to edit (if exposed). | Form opens but with `disabled=true` state. Buttons disabled. Or no edit option at all. | Archived product has no Edit menu option (flow prevents this). If opened programmatically, form would show disabled state. | Designed gating prevents edit access entirely. |
| PRODUCTS-94 | Form reflects backend data after successful edit | Edit modal: changed name + save. | 1. Modify name. 2. Click Save. 3. Observe detail page. | Detail page product name updates immediately (no refresh needed). Other tabs/sections show updated product via `selectedProductStore.applyProduct(updated)`. | On edit success in detail, `handleFormSave()` calls `selectedProductStore.applyProduct(updated)` to sync in-page rendering. | N/A |
| PRODUCTS-95 | Form reset on modal close & reopen | Edit form open, field modified. | 1. Close modal (or discard). 2. Re-open the same product. | Form resets to current product state (not the previous edit). | Hook: `useEffect` on `isOpen && product` calls `reset()` and `setInitialImages()`. | N/A |

---

### CROSS-MODULE RECONCILIATION ASSERTIONS

These verify the Products module's API interactions with the backend.

| ID | Title | Preconditions | Setup | Backend Assertion | Expected UI Result |
|---|---|---|---|---|---|
| PRODUCTS-96 | Create product → appears in list | Empty tenant. | 1. Create product "Яблоко" via UI form. | `/api/products` GET returns the new product in the list with `id`, `name`, `sku`, `isArchived=false`, `totalStock=0`. | New row appears in Products list without refresh. |
| PRODUCTS-97 | Edit product name → updates in list | Product "Яблоко" exists with ID=1. | 1. Open detail. 2. Edit name to "Яблоко красное". 3. Save. | PUT `/api/products/1` receives updated payload. Backend returns updated Product with new name. | List row updates: name changes to "Яблоко красное". Detail page name updates immediately. |
| PRODUCTS-98 | Archive product → hidden from active list, shown with toggle | Product "Яблоко" (ID=1) active. | 1. Archive via detail ⋮ menu. | PUT `/api/products/1/archive` sets `isArchived=true`. | Product row vanishes from active list. Archive toggle badge increments "1". Toggle on reveals it. |
| PRODUCTS-99 | Supply transaction increases product stock (mock assertion) | Product "Яблоко" created (stock=0). New Supply transaction for 100 units at warehouse. | 1. Manually create Supply in Sales/Supplies module OR observe seeded supply in mocks. | `/api/products` GET for "Яблоко" returns `totalStock=100`, `warehouseItems[0].quantity=100`. (Mock limitation: Supplies module does NOT mutate Products stock; this tests that if the backend did, the UI would reflect it.) | Product detail: stock hero shows "100". Overview tab warehouse table shows 100 units. |
| PRODUCTS-100 | Sale transaction decreases product stock (mock assertion) | Product "Яблоко" stock=100. New Sale transaction for 30 units. | 1. Manually create Sale or observe seeded sale. | `/api/products` GET returns `totalStock=70`. | Product detail: stock updates to 70. |
| PRODUCTS-101 | Product prices used in Sales/Supplies autocomplete (integration assertion) | Product "Яблоко": salePrice=5000. | 1. Open New Sale page. 2. Add "Яблоко" to cart. | ProductAutocomplete loads `productStore.saleProducts` (direction-filtered). Line populates with `salePrice=5000`. | Sale line shows product qty + price field pre-filled 5000 UZS. |
| PRODUCTS-102 | Product low-stock threshold drives warnings (integration assertion) | Product "Яблоко": stock=5, lowStockThreshold=10. | 1. Observe product detail or list (if low-stock column exists). | Product model has `isLowStock=true` (server-computed per `quantity < lowStockThreshold`). | Low-stock visual indicator appears (if implemented). |
| PRODUCTS-103 | Archived product excluded from Sales line picker | Product "Яблоко" archived. | 1. Open New Sale page. 2. Search for "Яблоко". | `productStore.saleProducts` filters `!p.isArchived` (only active products). Archived product absent from dropdown. | Autocomplete dropdown does not show archived product. |

---

### EDGE CASES & ERROR HANDLING

| ID | Title | Preconditions | Steps | Expected Result | Reconciliation | Designed Gap |
|---|---|---|---|---|---|---|
| PRODUCTS-104 | Network error: GET all products | List page loading. | 1. Simulate offline or API failure. | Toast error: **«Не удалось загрузить товары»** (i18n: `product.error.getAll`). List shows loading state or empty fallback. | `tryRun()` catches error, calls `notificationStore.error()`. `allProducts` remains "loading". | No retry UI; user must refresh page. |
| PRODUCTS-105 | Network error: Create product | Form open, ready to submit. | 1. Trigger create with network failure. | Toast error: **«Не удалось создать товар»**. Dialog remains open. Form retains entered data. Save button re-enabled. | Error caught, notification shown, `isSaving=false`. | User must retry manually. |
| PRODUCTS-106 | Network error: Edit product | Edit form open. | 1. Submit with network failure. | Toast error: **«Не удалось обновить товар»**. Form stays open, data intact. | Same error handling as create. | N/A |
| PRODUCTS-107 | Network error: Archive product | Archive confirm dialog open. | 1. Confirm with network failure. | Toast error: **«Не удалось архивировать товар»**. Confirm dialog closes. Product remains active (not archived). | Error caught during `productStore.archive()`. | N/A |
| PRODUCTS-108 | Network error: Get product detail | Detail page loading. | 1. Product fetch fails. | Message: **«Товар не найден»** (or error message). | `selectedProductStore.load()` fails. Product set to null. Render "not found" message. | N/A |
| PRODUCTS-109 | Very long product name (edge) | Create form. | 1. Enter 250-char name (max). 2. Submit. | Saves successfully. Row displays full name (truncation/ellipsis in list if narrow). | Zod max length enforced. Backend accepts valid length. | N/A |
| PRODUCTS-110 | Barcode with spaces (edge) | Create form. | 1. Enter barcode "5901 2341 23457" (spaces). 2. Blur. | No error. Validation strips spaces internally, validates EAN. | `validateEan13()` calls `stripSpaces()` before checking. | N/A |
| PRODUCTS-111 | Product SKU is not unique constraint (edge) | Create 2nd product. | 1. Create product 1 with SKU="SKU-001". 2. Create product 2 with same SKU. 3. Submit product 2. | Outcome: either accepted (backend allows duplicate SKU) or backend rejects with error. Frontend form has no uniqueness check (depends on backend rules). | Zod schema does NOT validate uniqueness (server-side responsibility). | No frontend validation for SKU uniqueness. Backend rules determine if duplicates allowed. |
| PRODUCTS-112 | Category deleted after product created | Product linked to category. | 1. (Simulate backend state) Category soft-deleted or unlinked. 2. View product detail. | Product's `categoryName` renders as "—" or null if category is gone. Detail Info card shows "—". | Product model has `categoryName: string | null`. If null/undefined, rendered as "—". | N/A |
| PRODUCTS-113 | Concurrent edits: two users (isolation test) | User A opens edit modal, User B edits same product, saves. | 1. User A still has form open. 2. User A saves their version. | Outcome: User A's save overwrites User B's (last write wins). No merge conflict detection. | No optimistic concurrency; backend accepts last write. Toast shown. Form uses data from response. | Frontend does not detect conflicts. Audit trail records both edits. |
| PRODUCTS-114 | Special characters in product name | Create form. | 1. Enter name: "Шоколад & Печенье / Конфеты". 2. Submit. | Saves and renders correctly (Cyrillic, &, /, handled). | Zod does not restrict special chars. Backend/frontend both preserve them. | N/A |
| PRODUCTS-115 | Decimal prices entered as integers | Form, salePrice field. | 1. Enter "5000" (integer). 2. Submit. | Accepted as 5000.00. Form hook accepts numeric input (0 or positive). | NumericField or standard input stores as number. Backend accepts. | Prices are always treated as integers (no cents in UZS). |

---

### DESIGN NOTES & KNOWN LIMITATIONS

| ID | Note | Impact |
|---|---|---|
| DN-01 | **Product creation stock = 0 (rule 22).** Initial stock must be added via Warehouses module → opening-stock event, not here. | List/detail show zero stock for all new products until warehouse stock entry created. |
| DN-02 | **Archived products remain in totals (rule 31).** `totalStock`, `warehouseItems`, and profit/cost calculations include archived products. | Dashboard KPIs and warehouse stock counts include archived goods. |
| DN-03 | **Retail price is dormant.** The field exists in the backend model but is always 0 in the UI and never shown to users. | Not tested or exposed in any form. |
| DN-04 | **Products-to-Stocks linking happens via Warehouses mock.** Products module shows stock but does not mutate it. Stock mutations (Sales, Supplies, Transfers, Adjustments, opening stock) are isolated mocks with no cross-mock reconciliation. | Product detail stock figures may not match Supplies/Sales mock data in real usage; mocks are self-contained. |
| DN-05 | **Packaging size must be ≥ 2.** A size of 1 is rejected. Packaging is optional; when enabled, size is required. | Products without packaging work fine; packaging support is opt-in. |
| DN-06 | **Images are file uploads on form submit.** Preview is local; actual upload happens during POST/PUT as multipart/form-data (one `payload` JSON part + `attachments` file parts). | Frontend shows previews immediately; backend processes binaries during save. |
| DN-07 | **Type selector determines visible prices:** Sale shows salePrice, Supply shows supplyPrice, All shows both. Hidden prices are zeroed in the API request. | User cannot set both prices for a Sale-only product; hidden price is always 0 server-side. |
| DN-08 | **No validation errors on create-time category requirement.** Category is optional in the schema. Starter category (rule 42) can be pre-selected if tenant has exactly 1. | Tenant with many categories shows empty category selector on create. |
| DN-09 | **Search matches name + SKU only, not description/barcode/category.** | Users cannot find products by description or barcode via list search. |
| DN-10 | **Sorting is client-side.** All products are fetched, then sorted in-browser. Large datasets (1000+ products) may be slow. | No backend sort parameter; UI is responsible for ordering. |
| DN-11 | **Pagination is client-side** via DataTable. No backend limit/offset. | Large datasets load entirely into memory. |
| DN-12 | **No product-level delete affordance.** Only archive/restore. Hard-delete is never exposed (rule 32). | Archived products can only be unarchived, never purged. |
| DN-13 | **SKU is a string, not unique at the schema level.** Validation enforces min 1, max 100 chars but not uniqueness. | Duplicate SKUs are possible if the backend allows; frontend does not prevent. |
| DN-14 | **Barcode validation accepts EAN-8, EAN-13, UPC-A with valid checksums.** Invalid formats are rejected inline; user must correct before save. | Barcode is optional and validated only on blur. |
| DN-15 | **Form reset on modal reopen.** If user opens create, cancels, then opens create again, the form is blank (not cached). | Each create session starts fresh. |
| DN-16 | **Low-stock threshold is optional per-product.** UI can set it; backend computes `isLowStock` boolean. Frontend shows only the boolean, not the threshold value. | Low-stock field exists in schema/model but is not prominently surfaced in detail view. |

---

## TEST EXECUTION SUMMARY

**Total Cases:** 116 (including reconciliation + edge cases + design notes)  
**Coverage Areas:**
- List view: search, filters (category, type), archive toggle, sort, pagination, CSV export, empty states
- Create/Edit modal: all field validations, image upload, packaging, discard dialogs, error handling
- Detail page: all three tabs (Overview, Transactions, Movements), right rail (Prices, Stock, Info), archived state
- Archive/Restore: confirm dialogs, state transitions, gating on archived products
- Reconciliation: product creation, edits, archive, integration with Sales/Supplies modules
- Edge cases: network errors, concurrent edits, special characters, constraints
- Design notes: known limitations and rule-based design decisions

**Prerequisites for Testing:**
- Backend mock API at `/api/products` is running
- i18n Russian strings loaded from `src/i18n/ru/product.json`
- Tenant is empty or pre-seeded with test data per test preconditions
- Browser is at app.miraziz.net with valid session

**Post-Test Steps:**
- Verify no console errors during all flows
- Check that archived products appear in CSV exports with "Архив" status
- Confirm warehouse stock reconciliation via manual Warehouses module stock entry
- Validate that sales/supplies product pickers correctly filter by product type
