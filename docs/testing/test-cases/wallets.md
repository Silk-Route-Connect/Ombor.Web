# Wallets Module - Manual Browser Test Cases

## Overview
The Wallets (Касса) module manages cash locations (wallets) and inter-wallet transfers in Ombor.Web. A wallet is a money location of type **Cash** (Наличные), **Card** (Карта), or **Bank** (Банк). The module tracks wallet balances (server-computed), advances held for partners, and our own money (balance − advances). All balances and totals are served from the backend mock (never recomputed client-side). Wallets are archive-only; deletion is not permitted.

**Key Rules:**
- Wallet balance = opening balance + payment components + inter-wallet transfers (rule 15)
- "Our money" = balance − advances held (rule 12)
- Opening balance and inter-wallet transfers are immutable auditable events (rule 16)
- On edit, only the name is editable; type and opening balance are locked (rule 16)
- Archived wallets with money still count in all totals (rule 31)
- Archive toggle + summary strip show all wallets including archived (rule 31)

---

## Test Cases

### WALLETS-LIST: List View - Load & Display

**ID:** WALLETS-LIST-01  
**Title:** List page loads with all wallets and summary strip  
**Preconditions:** Empty tenant (no wallets yet); logged in  
**Steps:**
1. Navigate to the Wallets page («Касса» in the sidebar)
2. Observe the page load

**Expected Result:**
- Empty state displays: icon, "Пока нет касс" heading, descriptive body text, and a blue «Новая касса» button
- No summary strip (no data to show)
- Loading spinner briefly appears during fetch, then clears
- Page title is «Касса»

**Reconciliation:** N/A (empty state)

**Designed-gap note:** None

---

**ID:** WALLETS-LIST-02  
**Title:** Summary strip displays totals from all wallets including archived  
**Preconditions:** 3+ wallets created (mix of active and at least 1 archived with money)  
**Steps:**
1. Create Wallet A (Cash, opening balance 100,000)
2. Create Wallet B (Card, opening balance 50,000)
3. Create Wallet C (Bank, opening balance 30,000)
4. Archive Wallet C
5. Create a payment operation that increases Wallet A balance to 200,000 and creates advance of 10,000 in Wallet A
6. Observe the summary strip above the table

**Expected Result:**
- Summary strip shows 3 cards: **Общий баланс** (380,000 UZS), **Наши средства** (370,000 UZS), **Авансы партнёров** (10,000 UZS)
- All figures sum across ALL wallets including archived Wallet C (30,000 is counted)
- Cards display with left accent bars (primary / success / saffron color)
- Values use numeric monospace font
- UZS suffix in smaller, disabled-color text

**Reconciliation:** 
- Verify totals = sum of served wallet figures from the mock
- Verify Wallet C (archived) balance is included despite being archived

**Designed-gap note:** None

---

**ID:** WALLETS-LIST-03  
**Title:** Table displays all active wallets with correct columns  
**Preconditions:** 3 active wallets created; no filtering active  
**Steps:**
1. Create Wallet A (Cash, 100,000)
2. Create Wallet B (Card, 200,000)
3. Create Wallet C (Bank, 50,000)
4. Observe the table rows

**Expected Result:**
- Table has 6 columns: **Касса** (name+icon) | **Тип** (badge) | **Баланс, UZS** | **Авансы партнёров** | **Наши средства** | **⋮** (menu)
- All 3 wallets visible as rows
- Each row shows: type-tinted icon + name | type badge (e.g., «Наличные») | balance | advances (or «—» if zero) | our-money | action menu icon
- Rows are clickable (cursor becomes pointer)
- No row is grayed out (all active)
- Archive badge not visible (all active)

**Reconciliation:** 
- Verify column headers match the i18n keys: `wallet.table.name`, `wallet.table.type`, `wallet.table.balance`, `wallet.table.advances`, `wallet.table.ourMoney`, `wallet.table.status`
- Verify balances match the served wallet.balance field

**Designed-gap note:** None

---

### WALLETS-SEARCH: Search & Filter

**ID:** WALLETS-SEARCH-01  
**Title:** Search by wallet name filters the table  
**Preconditions:** 3+ wallets created with distinct names (e.g., "Касса Основная", "Kartin", "Банк ЦБУ")  
**Steps:**
1. In the search field, type "Карт"
2. Observe the table

**Expected Result:**
- Only the wallet with "Карт" in the name (e.g., "Kartin") remains visible
- Other wallets are hidden
- Table still displays all columns
- Summary strip remains unchanged (shows totals of all wallets, not filtered)

**Reconciliation:** 
- Verify client-side filtering: wallets are searched by `matchesSearch(w.name, searchTerm)`

**Designed-gap note:** None

---

**ID:** WALLETS-SEARCH-02  
**Title:** Clear search field restores full list  
**Preconditions:** Search is active with 1 result showing  
**Steps:**
1. Clear the search field (select all + delete or click the clear button if present)
2. Observe the table

**Expected Result:**
- All wallets reappear
- Table returns to full list view

**Reconciliation:** N/A

**Designed-gap note:** None

---

**ID:** WALLETS-SEARCH-03  
**Title:** Search on empty result shows "Кассы не найдены" empty state  
**Preconditions:** 2 wallets exist; search is active  
**Steps:**
1. Enter a search term that matches no wallet name (e.g., "XYZ")
2. Observe the empty state

**Expected Result:**
- Empty state shows: icon, "Кассы не найдены" heading, body text "По заданному запросу ничего не найдено. Измените поиск или включите показ архива."
- No table rows shown
- Summary strip still displays (serves totals of all wallets)

**Reconciliation:** N/A

**Designed-gap note:** None

---

### WALLETS-ARCHIVE: Archive Toggle

**ID:** WALLETS-ARCHIVE-01  
**Title:** Archive toggle hidden when no archived wallets exist  
**Preconditions:** 2+ active wallets; no archived wallets  
**Steps:**
1. Observe the header below the title row

**Expected Result:**
- No archive toggle button visible (or button shows count "0" and is subtle)
- Search input and action buttons are present

**Reconciliation:** 
- Implementation detail: toggle is present but badge shows `archivedCount = 0`, toggle is dimmed

**Designed-gap note:** None

---

**ID:** WALLETS-ARCHIVE-02  
**Title:** Archive toggle shows count and toggles visibility  
**Preconditions:** 2 active wallets, 1 archived wallet with money  
**Steps:**
1. Observe the archive toggle button
2. Note it displays "Архив 1" with a toggle icon
3. Click the toggle

**Expected Result:**
- Before click: Only 2 active wallets visible in table; toggle is OFF (gray), badge shows count "1"
- After click: Toggle is ON (teal/primary color), archived wallet now appears in table with gray icon + «Архив» badge next to name
- Summary strip remains unchanged (already includes archived wallet)

**Reconciliation:** 
- Verify `walletStore.archivedCount` correctly counts archived wallets
- Verify `showArchived` state toggles the list

**Designed-gap note:** None

---

**ID:** WALLETS-ARCHIVE-03  
**Title:** All archived state shows appropriate empty message  
**Preconditions:** 1+ wallets all archived; archive toggle OFF  
**Steps:**
1. Ensure archive toggle is OFF
2. Observe the table

**Expected Result:**
- Empty state displays: "Нет активных касс" heading, body text "Все кассы в архиве. Включите показ архива или создайте новую кассу."
- A blue «Новая касса» button appears in the empty state

**Reconciliation:** N/A

**Designed-gap note:** None

---

### WALLETS-CREATE: Create Modal

**ID:** WALLETS-CREATE-01  
**Title:** Create modal opens with all fields editable  
**Preconditions:** On Wallets list page  
**Steps:**
1. Click the blue «Новая касса» button (or click in empty state)
2. Observe the modal

**Expected Result:**
- Modal opens with title "Новая касса" and subtitle "Наличная касса, карта или банковский счёт"
- Three fields visible: **Название** (text input, autofocused), **Тип** (type segmented control), **Начальный баланс** (numeric input)
- Название field has placeholder "Например: Основная касса, Терминал Uzcard, Расчётный счёт Капиталбанк"
- Тип field shows 3 buttons: « icon Cash », « icon Card », « icon Bank »
- Начальный баланс field shows "0" placeholder, with "UZS" suffix
- Below opening balance: hint text "Записывается как событие аудита. После создания изменить нельзя."
- Footer has Cancel + Save buttons; Save is disabled until form is valid
- Modal is 520px wide (or responsive on smaller screens)

**Reconciliation:** 
- Verify modal uses i18n keys: `wallet.form.createTitle`, `wallet.form.createSubtitle`, `wallet.field.name`, `wallet.field.type`, `wallet.field.openingBalance`, `wallet.form.namePlaceholder`, `wallet.form.openingHint`

**Designed-gap note:** None

---

**ID:** WALLETS-CREATE-02  
**Title:** Type selector is mutually exclusive segmented control  
**Preconditions:** Create modal is open  
**Steps:**
1. Observe the Тип field
2. Click the "Card" button
3. Observe it is now selected
4. Click the "Bank" button

**Expected Result:**
- Each button shows an icon (ATM / Credit card / Bank building)
- Only one button is selected at a time (gray bg, darker text)
- Unselected buttons are transparent, lighter text
- Clicking a new button deselects the previous one
- Selected button has slight elevation (shadow)

**Reconciliation:** 
- Verify `WALLET_TYPE_META` provides correct icon, label, and colors for each type

**Designed-gap note:** None

---

**ID:** WALLETS-CREATE-03  
**Title:** Validation: name required, min 2 chars, max 250  
**Preconditions:** Create modal is open with name field focused  
**Steps:**
1. Leave name empty and click Save → observe error
2. Enter "A" (1 char) and click Save → observe error
3. Enter "AB" (2 chars) and click Save → should pass validation
4. Clear and enter 251 characters → click Save → observe error

**Expected Result:**
- Empty: error message "Введите название кассы (минимум 2 символа)."
- 1 char: same error
- 2 chars: no error (validation passes for this field)
- 251+ chars: error message "Название не должно превышать 250 символов."
- Error banner appears at top of modal "Проверьте отмеченные поля перед сохранением." when form is submitted with errors
- Name field shows red border and error text below it

**Reconciliation:** 
- Verify Zod schema validates: `min(2)`, `max(250)`, i18n keys: `wallet.validation.nameMin`, `wallet.validation.nameMax`

**Designed-gap note:** None

---

**ID:** WALLETS-CREATE-04  
**Title:** Validation: opening balance non-negative  
**Preconditions:** Create modal is open  
**Steps:**
1. Enter name "Test Wallet"
2. In opening balance field, try to enter "-100" → click Save

**Expected Result:**
- Numeric field rejects negative input (may show red border, or NumericField component prevents negative)
- Error message: "Начальный баланс не может быть отрицательным."
- Save button remains disabled

**Reconciliation:** 
- Verify Zod schema: `min(0)`, i18n key: `wallet.validation.openingNonNegative`

**Designed-gap note:** None

---

**ID:** WALLETS-CREATE-05  
**Title:** Happy path: create wallet with all fields  
**Preconditions:** Create modal is open  
**Steps:**
1. Enter name "Основная касса"
2. Select type "Cash"
3. Enter opening balance "500000"
4. Click Save
5. Observe the modal closes and notification

**Expected Result:**
- Modal closes
- Success toast appears: "Касса «Основная касса» создана"
- List updates: new wallet appears in table with balance 500,000, type badge "Наличные", icon in green
- Summary strip totals update to include the new wallet
- No loading spinner visible after toast

**Reconciliation:** 
- Verify new wallet appears in `walletStore.allWallets`
- Verify API call is `POST /api/wallets` with `{ name, type, openingBalance }`
- Verify success message uses i18n key: `wallet.success.create` with `{{ name: "Основная касса" }}`

**Designed-gap note:** None

---

**ID:** WALLETS-CREATE-06  
**Title:** Modal closes on Cancel with unsaved changes prompt  
**Preconditions:** Create modal is open with some data entered  
**Steps:**
1. Enter name "Test Wallet"
2. Click Cancel
3. Observe the confirm dialog

**Expected Result:**
- A confirm dialog appears: title "Отменить?"  (or similar discard-changes prompt), body "Вы уверены, что хотите отменить действие?"
- Two buttons: «Отменить», «Продолжить»
- Clicking «Отменить» closes the confirm dialog and keeps the form modal open
- Clicking «Продолжить» closes the form modal and the list is displayed

**Reconciliation:** 
- Verify `useDirtyClose` hook detects dirty state and prompts; confirm uses i18n keys: `common.dialog.discardChanges.title`, `common.dialog.discardChanges.body`, etc.

**Designed-gap note:** None

---

### WALLETS-EDIT: Edit Modal

**ID:** WALLETS-EDIT-01  
**Title:** Edit modal opens with only name editable  
**Preconditions:** 1+ wallet exists (e.g., "Primary Cash", type Cash, opening balance 100,000)  
**Steps:**
1. Click on the wallet row in the table (any part except the ⋮ menu)
2. When detail page opens, click the ⋮ menu → «Редактировать»
3. Or from list, click row ⋮ menu → «Редактировать»
4. Observe the edit modal

**Expected Result:**
- Modal opens with title "Редактировать кассу" and subtitle "Тип и начальный остаток изменить нельзя"
- Name field is editable, shows current value
- Тип field shows a locked/read-only display box (dashed border, gray bg) displaying "Наличные" with an info icon and tag "нельзя изменить"
- Начальный баланс field shows a locked display showing "500 000 UZS" (formatted) with info icon and tag "записан при создании"
- Both locked fields are visually distinct from editable fields

**Reconciliation:** 
- Verify i18n keys: `wallet.form.editTitle`, `wallet.form.editSubtitle`, `wallet.form.lockedType`, `wallet.form.lockedOpening`
- Verify type and opening balance are NOT passed to form submit (only name is updated via `PUT /api/wallets/{id}` with `{ name }`)

**Designed-gap note:** None

---

**ID:** WALLETS-EDIT-02  
**Title:** Edit: change wallet name and save  
**Preconditions:** Edit modal is open for an existing wallet  
**Steps:**
1. Clear the name field and enter "Updated Wallet Name"
2. Click Save
3. Observe the result

**Expected Result:**
- Modal closes
- Success toast: "Изменения сохранены"
- List updates: wallet name changes in the table
- Detail page (if open) updates to show new name

**Reconciliation:** 
- Verify API call is `PUT /api/wallets/{id}` with only `{ id, name }`
- Verify success message i18n key: `wallet.success.update`

**Designed-gap note:** None

---

**ID:** WALLETS-EDIT-03  
**Title:** Edit: name validation same as create  
**Preconditions:** Edit modal is open  
**Steps:**
1. Clear name and try to enter 1 character
2. Try to enter 251+ characters
3. Observe errors

**Expected Result:**
- Same validation errors as create modal: min 2 chars, max 250 chars
- Error banner and field-level errors display

**Reconciliation:** 
- Verify same schema validation applies

**Designed-gap note:** None

---

### WALLETS-DETAIL: Detail Page

**ID:** WALLETS-DETAIL-01  
**Title:** Detail page loads with header, stats, and tabs  
**Preconditions:** Wallet exists (e.g., "Primary Cash", balance 500,000, advances 50,000)  
**Steps:**
1. Click on a wallet row in the list
2. Detail page navigates (URL becomes `/wallets/{id}`)
3. Observe the page layout

**Expected Result:**
- Breadcrumb at top: «Касса › Primary Cash»
- Back button (chevron left, bordered)
- Header shows wallet name, type badge (e.g., «Наличные» in green), "Начальный остаток: 500 000 UZS · создана" meta row
- If archived: «Архив» badge visible; if active: no archive badge
- If active: ⋮ menu (Edit / Archive); if archived: primary blue «Восстановить» button
- Three stat cards below: **Баланс** (500,000 UZS, primary color), **Наши средства** (450,000 UZS, success green), **Авансы** (50,000 UZS, saffron)
- Two tabs below stats: **Операции** (tab 1, selected by default), **Переводы** (tab 2)
- Tab shows operation count (e.g., "Операции (8)")

**Reconciliation:** 
- Verify wallet is loaded via `SelectedWalletStore.load(walletId)`
- Verify i18n keys: `wallet.detail.back`, `wallet.detail.openingLabel`, `wallet.detail.createdLabel`, `wallet.detail.stats.balance`, `wallet.detail.stats.ourMoney`, `wallet.detail.stats.advances`, `wallet.detail.tabs.operations`, `wallet.detail.tabs.transfers`
- Verify balances match served figures (not recomputed)

**Designed-gap note:** None

---

**ID:** WALLETS-DETAIL-02  
**Title:** Archived wallet shows archive banner and restore button  
**Preconditions:** An archived wallet  
**Steps:**
1. Navigate to archived wallet detail
2. Observe the banner and header

**Expected Result:**
- Below the meta row: orange/info banner with text "Касса в архиве. Она скрыта из форм выбора, но её баланс сохранён и учитывается в общих итогах. Восстановите кассу, чтобы снова проводить через неё платежи."
- Header shows «Архив» badge in gray (archived tint)
- No ⋮ menu; instead primary blue «Восстановить» button (text: `wallet.detail.restore` or similar)
- Clicking restore: confirm dialog appears, on confirm the wallet is restored and page updates

**Reconciliation:** 
- Verify i18n keys: `wallet.detail.archived.title`, `wallet.detail.archived.body`, and the restore flow

**Designed-gap note:** None

---

### WALLETS-OPERATIONS: Operations Tab

**ID:** WALLETS-OPERATIONS-01  
**Title:** Operations tab displays list of money movements  
**Preconditions:** Wallet has ≥3 operations (e.g., opening, payment in, payment out)  
**Steps:**
1. Navigate to wallet detail
2. Click the **Операции** tab (or observe it is selected)
3. Scroll through the table

**Expected Result:**
- Table has 7 columns: **Дата** | **Платёж** | **Тип** | **Направление** | **Партнёр / получатель** | **Сумма, UZS** | **Баланс после**
- Search input above table with placeholder "Поиск по партнёру или номеру…"
- Segmented filter: «Все» / «Приход» / «Расход» (default «Все»)
- Rows are newest first (reverse chronological)
- Each row shows: date · payment# or transfer chip · operation type (e.g., "Платёж") · direction pill (green «Приход» or red «Расход» with icon) · party name · amount (no +/− sign, color indicates direction) · running balance
- Rows are clickable; payment rows link to payment detail; transfer rows open transfer detail modal

**Reconciliation:** 
- Verify columns use i18n keys: `wallet.operations.date`, `wallet.operations.payment`, `wallet.operations.type`, `wallet.operations.direction`, `wallet.operations.party`, `wallet.operations.amount`, `wallet.operations.balanceAfter`
- Verify direction pill shows «Приход» (In, green ↓ icon) or «Расход» (Out, red ↑ icon) per business-rules locked pattern 4 (no +/− signs)
- Verify amounts are from served `WalletOperation.amount` field

**Designed-gap note:** None

---

**ID:** WALLETS-OPERATIONS-02  
**Title:** Direction filter segments the operations list  
**Preconditions:** Operations tab with mixed In/Out operations  
**Steps:**
1. Observe the segmented control set to «Все»
2. Click «Приход»
3. Observe the table

**Expected Result:**
- Only "In" direction operations are shown
- Count updates (e.g., "Операции (3)" if 3 inbound)
- Click «Расход» → only "Out" operations show
- Click «Все» → all operations return

**Reconciliation:** 
- Verify client-side filtering by `o.direction` in `useMemo`

**Designed-gap note:** None

---

**ID:** WALLETS-OPERATIONS-03  
**Title:** Operations search filters by party name or payment number  
**Preconditions:** Operations tab with multiple operations involving different partners  
**Steps:**
1. Type a partner name (e.g., "Ali") in the search field
2. Observe the table

**Expected Result:**
- Only operations with that partner name (or payment number) visible
- Search is case-insensitive substring match (per `matchesSearch`)
- Clear search → all operations return

**Reconciliation:** 
- Verify filtering by `matchesSearch(o.party, query) || matchesSearch(o.paymentNumber, query)`

**Designed-gap note:** None

---

**ID:** WALLETS-OPERATIONS-04  
**Title:** Empty operations state  
**Preconditions:** Wallet with no operations (just created with opening balance)  
**Steps:**
1. Navigate to operations tab
2. Observe the empty state

**Expected Result:**
- Centered empty state: swap icon, "Нет операций" heading, "По этой кассе ещё не было движений денег." body

**Reconciliation:** 
- Verify i18n keys: `wallet.operations.emptyTitle`, `wallet.operations.emptyBody`

**Designed-gap note:** None

---

**ID:** WALLETS-OPERATIONS-05  
**Title:** Empty filtered operations state  
**Preconditions:** Operations tab with some operations; apply filter that yields no results  
**Steps:**
1. Set direction filter to «Приход» (but only outbound operations exist)
2. Or search for a partner name that doesn't exist

**Expected Result:**
- Empty state shows: swap icon, "Нет операций" heading, "По выбранным условиям движений не найдено." body (different from the zero-operations body)

**Reconciliation:** 
- Verify i18n key: `wallet.operations.emptyFiltered`

**Designed-gap note:** None

---

**ID:** WALLETS-OPERATIONS-06  
**Title:** Payment operation row opens payment detail (or toast)  
**Preconditions:** Operations tab with a payment-kind operation (e.g., P-520)  
**Steps:**
1. Click a row with a payment number (e.g., «P-520» visible in the "Платёж" column)
2. Observe navigation

**Expected Result:**
- If `operation.paymentId` is set: navigate to `/payments/{paymentId}` (Payments detail page)
- If `paymentId` is null (mock limitation): show info toast "Платёж P-520 — переход в раздел «Платежи» появится после его перестройки"

**Reconciliation:** 
- Verify condition in `handleOpenPayment`: if `paymentId` exists, navigate; else toast
- Verify i18n key: `wallet.operations.openPayment`

**Designed-gap note:** This is a known limitation of the mock: payment numbers are illustrative and the full payment-to-wallet link is not wired. Toast is the placeholder until Payments are fully integrated.

---

**ID:** WALLETS-OPERATIONS-07  
**Title:** Transfer operation row opens transfer detail modal  
**Preconditions:** Operations tab with a transfer operation (transfer chip visible)  
**Steps:**
1. Click a row with a transfer («Перевод» chip in the "Платёж" column, no payment number)
2. Observe the modal

**Expected Result:**
- Transfer detail modal opens with readonly transfer info (from/to route, amount, date, createdBy, note)
- Modal is read-only (transfers are immutable per rule 16)
- Only close button available

**Reconciliation:** 
- Verify condition: if `o.transferId` is set, call `onOpenTransfer(o.transferId)`

**Designed-gap note:** None

---

### WALLETS-TRANSFERS: Transfers Tab

**ID:** WALLETS-TRANSFERS-01  
**Title:** Transfers tab displays inter-wallet transfers  
**Preconditions:** Wallet has ≥2 inter-wallet transfers  
**Steps:**
1. Navigate to wallet detail, click **Переводы** tab
2. Observe the table

**Expected Result:**
- Table has 5 columns: **Дата** | **Из кассы** | **В кассу** | **Сумма, UZS** | **Создал**
- Each row shows: date · source wallet (icon + name) · dest wallet (icon + name) · amount · creator user name
- Rows are newest first
- All rows are clickable → opens transfer detail modal (readonly)
- Blue «Новый перевод» button top-right (if wallet is active)

**Reconciliation:** 
- Verify columns use i18n keys: `wallet.transfers.date`, `wallet.transfers.from`, `wallet.transfers.to`, `wallet.transfers.amount`, `wallet.transfers.createdBy`
- Verify transfers come from served `SelectedWalletStore.transfers`

**Designed-gap note:** None

---

**ID:** WALLETS-TRANSFERS-02  
**Title:** Empty transfers state  
**Preconditions:** Wallet with no transfers  
**Steps:**
1. Navigate to transfers tab
2. Observe the empty state

**Expected Result:**
- Centered empty state: swap icon, "Нет переводов" heading, "Между этой и другими кассами ещё не было переводов." body
- If wallet is active: blue «Новый перевод» button below the text

**Reconciliation:** 
- Verify i18n keys: `wallet.transfers.emptyTitle`, `wallet.transfers.emptyBody`

**Designed-gap note:** None

---

**ID:** WALLETS-TRANSFERS-03  
**Title:** Archived wallet: no "New Transfer" button  
**Preconditions:** Archived wallet detail  
**Steps:**
1. Navigate to transfers tab of archived wallet
2. Look for the «Новый перевод» button

**Expected Result:**
- No «Новый перевод» button visible (not even in the empty state)
- The tab is read-only
- Existing transfer rows are still visible

**Reconciliation:** 
- Verify `canTransfer={!wallet.isArchived}` prop gates the button

**Designed-gap note:** None

---

**ID:** WALLETS-TRANSFERS-04  
**Title:** Click transfer row opens transfer detail modal  
**Preconditions:** Transfers tab with transfers present  
**Steps:**
1. Click a transfer row
2. Observe the modal

**Expected Result:**
- Readonly transfer detail modal opens (see WALLETS-TRANSFER-DETAIL cases below)

**Reconciliation:** N/A

**Designed-gap note:** None

---

### WALLETS-TRANSFER-DETAIL: Transfer Detail Modal

**ID:** WALLETS-TRANSFER-DETAIL-01  
**Title:** Transfer detail modal displays immutable transfer info  
**Preconditions:** Transfer detail modal is open  
**Steps:**
1. Observe the modal content

**Expected Result:**
- Title: "Перевод между кассами", subtitle: formatted date of transfer
- Route preview card (gray bg): source wallet (icon + name) → ChevronRight → dest wallet (icon + name), and amount far right (large, monospace font)
- Key/value rows below:
  - Сумма: formatted amount with UZS
  - Дата: formatted date
  - Создал: creator user name
  - Примечание: note text (or «—» if null)
- All rows are read-only
- Info bar at bottom: info icon + "Перевод записан окончательно."
- Only button: «Закрыть»

**Reconciliation:** 
- Verify i18n keys: `wallet.transfer.detailTitle`, `wallet.transfer.amount`, `wallet.transfer.date`, `wallet.transfer.createdBy`, `wallet.transfer.note`, `wallet.transfer.detailImmutable`
- Verify data comes from `WalletTransfer` model

**Designed-gap note:** None

---

### WALLETS-NEW-TRANSFER: Create Transfer Modal

**ID:** WALLETS-NEW-TRANSFER-01  
**Title:** Transfer modal opens with wallet pickers and validation  
**Preconditions:** ≥2 active wallets; on transfers tab, click «Новый перевод»  
**Steps:**
1. Click «Новый перевод» button
2. Observe the modal

**Expected Result:**
- Modal opens with title "Новый перевод", subtitle "Перемещение денег между кассами"
- Route preview card at top (gray, shows from/to wallets and amount live)
- Two wallet picker dropdowns: **Из кассы** (required) and **В кассу** (required)
- Both pickers show: icon + wallet name + balance (gray, smaller font)
- Amount field: numeric input, placeholder "0", UZS suffix
- Below source wallet picker: available balance hint with "Перевести всё" link
- Note field: optional text input, placeholder "Например: Инкассация за май"
- Info bar: info icon + "Перевод будет записан окончательно — изменить или удалить нельзя."
- Buttons: Cancel (ghost), «Провести перевод» (primary with icon)

**Reconciliation:** 
- Verify i18n keys: `wallet.transfer.title`, `wallet.transfer.subtitle`, `wallet.transfer.from`, `wallet.transfer.to`, `wallet.transfer.amount`, `wallet.transfer.note`, `wallet.transfer.notePlaceholder`, `wallet.transfer.available`, `wallet.transfer.transferAll`, `wallet.transfer.immutableHint`, `wallet.transfer.submit`

**Designed-gap note:** None

---

**ID:** WALLETS-NEW-TRANSFER-02  
**Title:** Wallet pickers exclude archived wallets and prevent same source/dest  
**Preconditions:** Transfer modal is open; 3+ active wallets exist  
**Steps:**
1. Click the source (from) wallet dropdown
2. Observe the options

**Expected Result:**
- All active (non-archived) wallets listed with their balance
- No archived wallets in the list
- Select a source wallet (e.g., Wallet A)
- Click the destination (to) dropdown
3. Observe options

**Expected Result (continued):**
- All active wallets listed EXCEPT the source wallet (Wallet A is disabled/grayed)
- Zod validation prevents from === to (schema rule: `fromWalletId !== toWalletId`)

**Reconciliation:** 
- Verify `wallets` prop filters to active only: `walletStore.allWallets.filter((w) => !w.isArchived)`
- Verify validation i18n key: `wallet.transfer.validation.sameWallet`

**Designed-gap note:** None

---

**ID:** WALLETS-NEW-TRANSFER-03  
**Title:** "Перевести всё" link fills amount with available balance  
**Preconditions:** Transfer modal is open with source wallet selected (balance 500,000)  
**Steps:**
1. Observe the available balance hint: "Доступно: 500 000 UZS"
2. Click the teal "Перевести всё" link
3. Observe amount field

**Expected Result:**
- Amount field is populated with 500,000
- Field is marked as dirty (so discard-changes guard activates if user closes)
- Form validation runs

**Reconciliation:** 
- Verify `setValue("amount", available, { shouldDirty: true, shouldValidate: true })`
- Verify i18n key: `wallet.transfer.available`, `wallet.transfer.transferAll`

**Designed-gap note:** None

---

**ID:** WALLETS-NEW-TRANSFER-04  
**Title:** Validation: amount must be positive and not exceed available balance  
**Preconditions:** Transfer modal is open with source wallet (balance 500,000)  
**Steps:**
1. Leave amount at 0 and click Save
2. Clear and enter "600000" (exceeds balance) and click Save
3. Enter "500000" (equals balance) and click Save

**Expected Result:**
- Step 1: Error message "Введите сумму перевода" (amount must be positive, i18n key: `wallet.transfer.validation.amountPositive`)
- Step 2: Error message "Доступно только 500 000 UZS — нельзя перевести больше остатка." (over-balance, i18n key: `wallet.transfer.overBalance`); amount field shows red border; error banner appears at top
- Step 3: Validation passes (amount = available is OK); can proceed to submit

**Reconciliation:** 
- Verify Zod: `amount.positive()`
- Verify over-balance check in guard function: `source.balance >= values.amount`

**Designed-gap note:** None

---

**ID:** WALLETS-NEW-TRANSFER-05  
**Title:** Live route preview updates as wallets are selected  
**Preconditions:** Transfer modal is open  
**Steps:**
1. Observe route preview card (should show placeholder/empty state)
2. Select source wallet "Wallet A"
3. Observe preview updates
4. Select destination wallet "Wallet B"
5. Observe preview updates
6. Enter amount "100000"
7. Observe amount in preview

**Expected Result:**
- Route preview live-updates as you change fields
- Shows from wallet icon+name, arrow, to wallet icon+name, and amount far right
- If source/dest not selected: shows placeholder gray boxes
- Amount shows "0 UZS" if empty, or the entered amount in large monospace font
- Route preview is purely informational (not clickable)

**Reconciliation:** 
- Verify watch() on `fromWalletId`, `toWalletId`, `amount` drives the preview

**Designed-gap note:** None

---

**ID:** WALLETS-NEW-TRANSFER-06  
**Title:** Happy path: create inter-wallet transfer  
**Preconditions:** Transfer modal is open with 2+ active wallets; Wallet A has balance 500,000, Wallet B has 200,000  
**Steps:**
1. Select Wallet A as source
2. Select Wallet B as destination
3. Enter amount "150000"
4. Optionally enter note "Monthly collection"
5. Click «Провести перевод»
6. Observe result

**Expected Result:**
- Modal closes
- Success toast: "Перевод проведён: Wallet A → Wallet B"
- Returns to transfers tab
- Transfers list now includes the new transfer (newest first)
- Detail page wallets stats update: Wallet A balance decreases by 150,000, Wallet B balance increases by 150,000
- Transfer appears in both wallets' transfers tab
- Transfer also appears in operations tab of both wallets (as Transfer type operations)

**Reconciliation:** 
- Verify API call: `POST /api/wallets/transfers` with `{ fromWalletId, toWalletId, amount, note }`
- Verify success message i18n key: `wallet.success.transfer` with `{{ from: fromWalletName, to: toWalletName }}`
- Verify both wallets' served balances are refreshed via `walletStore.getAll()` + `selectedWalletStore.reload()`
- Verify transfer touches both wallets' balances and appears in operations ledgers (business-rules rule 15)

**Designed-gap note:** None

---

**ID:** WALLETS-NEW-TRANSFER-07  
**Title:** Note field is optional; transfers without note show «—» in detail  
**Preconditions:** Create a transfer without entering a note  
**Steps:**
1. Create transfer with all required fields but leave note empty
2. Navigate to transfer detail
3. Observe note row

**Expected Result:**
- Transfer is created successfully
- In transfer detail modal, note row shows: "Примечание: —" (dash, gray text)

**Reconciliation:** 
- Verify schema allows `note` to be empty/null: `.nullable()`

**Designed-gap note:** None

---

### WALLETS-ARCHIVE-ACTIONS: Archive & Restore

**ID:** WALLETS-ARCHIVE-ACTIONS-01  
**Title:** Archive wallet from list via row menu  
**Preconditions:** Active wallet exists (e.g., "Test Wallet")  
**Steps:**
1. On the wallets list, click the ⋮ menu on a wallet row
2. Click «Архивировать» (or «Archive»)
3. Observe the confirm dialog

**Expected Result:**
- Confirm dialog appears with warning icon (orange), title "Архивировать кассу «Test Wallet»?", body "Касса будет скрыта из форм выбора. Её баланс сохранится и продолжит учитываться в общих итогах. Кассы нельзя удалить — только архивировать."
- Buttons: «Отменить», «Архивировать» (warning/orange variant)
- Clicking «Архивировать» → confirm dialog closes, wallet is archived

**Expected after archive:**
- Wallet disappears from active list (unless archive toggle is ON)
- If archive toggle ON: wallet reappears with gray icon and «Архив» badge
- Summary strip totals unchanged (wallet still counted)
- If archive toggle OFF: empty state shows "Нет активных касс" with button to show archive
- Success toast: "Касса «Test Wallet» архивирована"

**Reconciliation:** 
- Verify API call: `POST /api/wallets/{id}/archive`
- Verify i18n keys: `wallet.archive.title`, `wallet.archive.body`
- Verify wallet disappears from `filteredWallets` unless `showArchived` is ON
- Verify summary totals remain unchanged

**Designed-gap note:** None

---

**ID:** WALLETS-ARCHIVE-ACTIONS-02  
**Title:** Archive wallet from detail page via ⋮ menu  
**Preconditions:** Active wallet detail page is open  
**Steps:**
1. Click ⋮ menu in header
2. Click «Архивировать»
3. Observe confirm, confirm archive

**Expected Result:**
- Confirm dialog displays (as above)
- On confirm: dialog closes, page updates
- Archived banner appears: "Касса в архиве. Она скрыта из форм выбора, но её баланс сохранён и учитывается в общих итогах. Восстановите кассу, чтобы снова проводить через неё платежи."
- Header shows «Архив» badge
- ⋮ menu disappears, replaced by primary blue «Восстановить» button
- Transfers tab: «Новый перевод» button disappears (archived wallet can't be source/dest for new transfers)

**Reconciliation:** 
- Verify wallet is updated with `isArchived = true`
- Verify `canTransfer={!wallet.isArchived}` hides the transfer button

**Designed-gap note:** None

---

**ID:** WALLETS-ARCHIVE-ACTIONS-03  
**Title:** Restore archived wallet from list archive toggle ON  
**Preconditions:** Archived wallet visible in list (archive toggle ON)  
**Steps:**
1. On archived wallet row, click ⋮ menu
2. Click «Восстановить»
3. Observe confirm dialog

**Expected Result:**
- Confirm dialog: info icon (blue), title "Восстановить кассу «Archived Wallet»?", body "Касса снова станет активной. Через неё можно будет проводить платежи и переводы."
- Buttons: «Отменить», «Восстановить» (primary/blue variant)
- Clicking «Восстановить» → wallet is restored

**Expected after restore:**
- Wallet row updates: gray icon returns to colored icon, «Архив» badge disappears
- If archive toggle is OFF: wallet row disappears (now active, not shown when archive OFF)
- Success toast: "Касса «Archived Wallet» восстановлена"

**Reconciliation:** 
- Verify API call: `POST /api/wallets/{id}/restore`
- Verify i18n keys: `wallet.restore.title`, `wallet.restore.body`
- Verify wallet.isArchived becomes false

**Designed-gap note:** None

---

**ID:** WALLETS-ARCHIVE-ACTIONS-04  
**Title:** Restore archived wallet from detail page  
**Preconditions:** Archived wallet detail page is open  
**Steps:**
1. Click primary blue «Восстановить» button in header
2. Observe confirm dialog and confirm

**Expected Result:**
- Confirm dialog appears (as above)
- On confirm: page updates, banner disappears, header shows no «Архив» badge, ⋮ menu returns, «Новый перевод» button reappears on transfers tab
- Success toast

**Reconciliation:** 
- Verify wallet is updated with `isArchived = false`

**Designed-gap note:** None

---

### WALLETS-CSV-EXPORT: CSV Export

**ID:** WALLETS-CSV-EXPORT-01  
**Title:** CSV export downloads file with all visible wallets  
**Preconditions:** 3+ wallets in list (mix of active/archived, archive toggle OFF so only active shown)  
**Steps:**
1. Click «Экспорт» button in header
2. Observe file download

**Expected Result:**
- File downloads with name `wallets_YYYY-MM-DD.csv` (formatted date)
- File contains rows:
  - Header row: «Касса» | «Тип» | «Баланс, UZS» | «Авансы партнёров» | «Наши средства» | «Статус»
  - Data rows: one per filtered wallet (respects search + archive toggle)
  - Each row has: name | type label (e.g., "Наличные") | balance | advances | our-money | status (e.g., "Активна" or "Архив")
- Columns match i18n labels from wallet i18n namespace

**Reconciliation:** 
- Verify columns use `CsvColumn<Wallet>` with formatters
- Verify only `filteredWallets` are exported (respects search and archive toggle)
- Verify i18n keys: `wallet.table.name`, `wallet.table.type`, etc., and type label from WALLET_TYPE_META
- Verify status uses: `wallet.table.statusActive` or `wallet.table.archivedBadge`

**Designed-gap note:** None

---

**ID:** WALLETS-CSV-EXPORT-02  
**Title:** CSV export respects active filters  
**Preconditions:** 5 wallets (3 active, 2 archived); search term "Test" matches 2 wallets  
**Steps:**
1. Enter search "Test" (filters to 2 wallets)
2. Click «Экспорт»
3. Inspect CSV

**Expected Result:**
- CSV contains only the 2 filtered wallets (search and archive toggle both applied)
- Summary strip figures are NOT exported (only the table data)

**Reconciliation:** 
- Verify `walletStore.filteredWallets` is used (not `allWallets`)

**Designed-gap note:** None

---

### WALLETS-EMPTY-STATES: Empty States

**ID:** WALLETS-EMPTY-STATES-01  
**Title:** True empty state when no wallets exist  
**Preconditions:** Tenant is empty (no wallets created)  
**Steps:**
1. Navigate to wallets list
2. Observe the page

**Expected Result:**
- Summary strip is absent (no totals to show)
- Empty state in table: icon, heading "Пока нет касс", body "Добавьте кассу — наличную, карту или банковский счёт, — чтобы учитывать движение денег.", blue «Новая касса» button
- Header shows create button (primary) and export button (ghost, likely disabled or just shows no data)

**Reconciliation:** 
- Verify `hasAny = false` → empty variant
- Verify i18n keys: `wallet.empty.title`, `wallet.empty.body`

**Designed-gap note:** None

---

**ID:** WALLETS-EMPTY-STATES-02  
**Title:** Filtered empty state when search matches nothing  
**Preconditions:** 2+ wallets exist; search is active with no matches  
**Steps:**
1. Type search term that matches no wallet
2. Observe the empty state

**Expected Result:**
- Empty state: icon, heading "Кассы не найдены", body "По заданному запросу ничего не найдено. Измените поиск или включите показ архива."
- No «Новая касса» button in empty state (to avoid confusion with the true empty state)
- Summary strip still visible (shows totals of all wallets, not filtered)

**Reconciliation:** 
- Verify `emptyVariant = "filtering"` when `isFiltering && filteredWallets.length === 0`
- Verify i18n keys: `wallet.empty.searchTitle`, `wallet.empty.searchBody`

**Designed-gap note:** None

---

**ID:** WALLETS-EMPTY-STATES-03  
**Title:** All archived state when only archived wallets exist and toggle OFF  
**Preconditions:** All wallets archived; archive toggle OFF (default)  
**Steps:**
1. Observe the list with toggle OFF
2. Observe empty state

**Expected Result:**
- Empty state: icon, heading "Нет активных касс", body "Все кассы в архиве. Включите показ архива или создайте новую кассу.", blue «Новая касса» button (option to create new)
- Summary strip visible (archived wallets counted)
- Archive toggle shows count badge (e.g., "Архив 3")

**Reconciliation:** 
- Verify `emptyVariant = "allArchived"` when `!hasActive && !showArchived`
- Verify i18n keys: `wallet.empty.allArchivedTitle`, `wallet.empty.allArchivedBody`

**Designed-gap note:** None

---

### WALLETS-CROSS-MODULE: Cross-Module Reconciliation

**ID:** WALLETS-CROSS-RECONCILIATION-01  
**Title:** Wallet balances reconcile after payment operations  
**Preconditions:** Wallet exists with opening balance 100,000; no operations yet  
**Steps:**
1. Create a payment (via Payments module or mock) that deposits 50,000 to this wallet
2. Navigate to wallet detail
3. Observe balance and operations

**Expected Result:**
- Wallet detail: balance stat card shows 150,000 UZS (100,000 opening + 50,000 deposit)
- Operations tab: new row appears with deposit operation, direction "In" (green), amount 50,000, running balance after = 150,000
- List view: wallet balance column shows 150,000
- Summary strip: total balance includes this wallet's updated figure

**Reconciliation:** 
- Verify served `wallet.balance` field reflects the payment component
- Verify `walletOperation.balanceAfter = 150,000` matches the wallet's served balance
- This tests rule 12 (wallet balance is server-computed and served)

**Designed-gap note:** The mock may not fully mutate all related figures (e.g., if a payment references this wallet + a partner advance, the partner's balance may not update). This is a known limitation documented in CLAUDE.md ("Self-contained mock").

---

**ID:** WALLETS-CROSS-RECONCILIATION-02  
**Title:** Inter-wallet transfer affects both wallets' balances  
**Preconditions:** 2 wallets: A (100,000) and B (50,000); no transfers yet  
**Steps:**
1. On wallet A detail, transfers tab, click «Новый перевод»
2. Create transfer: 30,000 from A → B, note "Test"
3. Observe wallet A detail after transfer
4. Navigate to wallet B detail
5. Observe wallet B

**Expected Result:**
- Wallet A: balance decreases to 70,000 (100,000 − 30,000)
- Wallet A operations tab: new Transfer operation row with direction Out (red), amount 30,000, running balance = 70,000
- Wallet A transfers tab: new transfer row from A → B, 30,000
- Wallet B: balance increases to 80,000 (50,000 + 30,000)
- Wallet B operations tab: new Transfer operation row with direction In (green), amount 30,000, running balance = 80,000
- Wallet B transfers tab: new transfer row from A → B, 30,000
- Both wallets' running balance sequences match the updated serve balances

**Reconciliation:** 
- Verify `walletStore.getAll()` refreshes both wallets' balances after transfer
- Verify transfer appears in both wallets' operations and transfers ledgers
- Verify rule 15: wallet balance includes inter-wallet transfers

**Designed-gap note:** None

---

**ID:** WALLETS-CROSS-RECONCILIATION-03  
**Title:** Archived wallet with balance still appears in summary totals  
**Preconditions:** 2 active wallets (A: 100,000, B: 50,000); create wallet C (30,000) then archive it  
**Steps:**
1. Observe summary strip with all 3 wallets (A, B, C archived)
2. Archive toggle ON (C now visible in list, grayed)
3. Observe summary totals

**Expected Result:**
- Summary totals: balance = 180,000 (100 + 50 + 30), our-money = 180,000 (no advances yet), advances = 0
- Totals do NOT change when archive toggle is toggled (archived wallets always counted per rule 31)
- Toggle OFF: C disappears from list, but summary totals remain 180,000

**Reconciliation:** 
- Verify `walletStore.summary` sums ALL wallets regardless of `showArchived` (it iterates `allWallets`, not `filteredWallets`)
- This tests rule 31: "An archived wallet or warehouse that still holds a balance or stock still counts in totals."

**Designed-gap note:** None

---

### WALLETS-LOADING: Loading States

**ID:** WALLETS-LOADING-01  
**Title:** Loading spinner shows during list fetch  
**Preconditions:** Wallets list page not yet loaded  
**Steps:**
1. Navigate to wallets page (or refresh if already on the page)
2. Watch for loading indicator

**Expected Result:**
- Circular progress spinner displays in the center of the table area
- After data loads: spinner clears, wallets table or empty state displays

**Reconciliation:** 
- Verify `filteredWallets === "loading"` renders CircularProgress

**Designed-gap note:** None

---

**ID:** WALLETS-LOADING-02  
**Title:** Loading spinner shows on detail page while data loads  
**Preconditions:** Wallet ID is valid, detail page not yet loaded  
**Steps:**
1. Navigate directly to `/wallets/{id}` (e.g., via URL)
2. Observe page during load

**Expected Result:**
- Page shows centered CircularProgress spinner
- After load: header, stats, tabs, and content display

**Reconciliation:** 
- Verify condition: `wallet === "loading"` renders CircularProgress

**Designed-gap note:** None

---

**ID:** WALLETS-LOADING-03  
**Title:** Not found state on detail page if wallet doesn't exist  
**Preconditions:** Navigate to `/wallets/999` (non-existent ID)  
**Steps:**
1. Navigate to the invalid ID
2. Observe the page

**Expected Result:**
- Page displays centered message: "Касса не найдена." (gray text, no icon)
- No crash or error toast

**Reconciliation:** 
- Verify condition: `wallet === null` renders not-found message
- Verify i18n key: `wallet.detail.notFound`

**Designed-gap note:** None

---

### WALLETS-ERROR-HANDLING: Error Handling

**ID:** WALLETS-ERROR-01  
**Title:** API error on list fetch shows toast  
**Preconditions:** Mock network failure or backend unavailable  
**Steps:**
1. Simulate API error on `GET /api/wallets`
2. Observe the result

**Expected Result:**
- Error toast displays: "Не удалось загрузить кассы" (red/error variant)
- List displays empty array (no wallets shown)
- Page is stable (no crash)

**Reconciliation:** 
- Verify error toast uses i18n key: `wallet.error.getAll`

**Designed-gap note:** None

---

**ID:** WALLETS-ERROR-02  
**Title:** API error on create shows error banner in modal + toast  
**Preconditions:** Create modal is open, mock network failure on POST  
**Steps:**
1. Fill in form with valid data
2. Click Save
3. Observe modal and notifications

**Expected Result:**
- Modal remains open
- Error banner appears in modal: "Проверьте отмеченные поля перед сохранением." (or a more specific API error message if returned)
- Error toast displays: "Не удалось создать кассу"
- Save button becomes enabled again (not stuck in loading)

**Reconciliation:** 
- Verify error toast uses i18n key: `wallet.error.create`

**Designed-gap note:** None

---

**ID:** WALLETS-ERROR-03  
**Title:** API error on transfer shows error modal + toast  
**Preconditions:** Transfer modal is open, attempt transfer with API error  
**Steps:**
1. Fill in transfer form with valid data
2. Click «Провести перевод»
3. Observe

**Expected Result:**
- Modal remains open
- Error banner appears: "Проверьте отмеченные поля перед проведением перевода."
- Error toast displays: "Не удалось провести перевод"
- Button becomes enabled again

**Reconciliation:** 
- Verify error toast uses i18n key: `wallet.error.transfer`

**Designed-gap note:** None

---

### WALLETS-VALIDATION: Form Validation Summary

| Field | Validation Rule | Error Message i18n Key | Notes |
|-------|-----------------|----------------------|-------|
| **Wallet Name** | min 2 chars | `wallet.validation.nameMin` | "Введите название кассы (минимум 2 символа)." |
| **Wallet Name** | max 250 chars | `wallet.validation.nameMax` | "Название не должно превышать 250 символов." |
| **Opening Balance** | ≥ 0 | `wallet.validation.openingNonNegative` | "Начальный баланс не может быть отрицательным." |
| **Type** | required on create; locked on edit | (schema) | Segmented control, always one selected |
| **Transfer From** | required, must be positive int | `wallet.transfer.validation.fromRequired` | "Выберите кассу-источник" |
| **Transfer To** | required, must be positive int | `wallet.transfer.validation.toRequired` | "Выберите кассу-получатель" |
| **Transfer To** | ≠ From | `wallet.transfer.validation.sameWallet` | "Касса-получатель должна отличаться от источника" |
| **Transfer Amount** | > 0 | `wallet.transfer.validation.amountPositive` | "Введите сумму перевода" |
| **Transfer Amount** | ≤ available balance | (modal guard) | "Доступно только {{available}} UZS — нельзя перевести больше остатка." |
| **Transfer Note** | max 500 chars | `wallet.transfer.validation.noteMax` | "Примечание не должно превышать 500 символов." |

---

## Edge Cases & Design Patterns

### Dirty Form Close Confirmation
When a user modifies a form and attempts to close via the X button or Cancel with unsaved changes:
- A confirm dialog appears (ReportProblemOutlinedIcon, warning tone)
- Title: "Отменить?" (i18n key: `common.dialog.discardChanges.title`)
- Body: "Вы уверены, что хотите отменить действие?" (i18n key: `common.dialog.discardChanges.body`)
- Buttons: «Отменить» (cancel, keep form open) | «Продолжить» (danger variant, close and discard)

This applies to: Create/Edit wallet modals, Transfer modals.

---

### Type & Opening Balance Immutability on Edit
Per business-rules rule 16, once a wallet is created:
- Type is **locked** (displayed in a dashed-border read-only field with info icon + tag "нельзя изменить")
- Opening balance is **locked** (displayed in a dashed-border read-only field with info icon + tag "записан при создании")
- Only the name field is editable
- The API contract enforces this: `PUT /api/wallets/{id}` accepts only `{ id, name }` (type and opening balance are ignored if sent)

---

### Wallet Type Color Coding
Each wallet type has a distinct visual identity (icon + color + bg):
- **Cash** (Наличные): green (#17835A) icon, light green bg
- **Card** (Карта): teal (#12676B) icon, light teal bg
- **Bank** (Банк): blue (#2A6F97) icon, light blue bg

These are used in: avatars (list + detail), type badges, route previews (transfers), type selector (segmented control).

---

### Direction Color Coding (Locked Pattern 4)
Amounts in the operations ledger show direction via color and icon, NOT +/− signs:
- **In** (Приход): green (#17835A), downward arrow (↓ SouthEastIcon)
- **Out** (Расход): red error color, upward arrow (↑ NorthEastIcon)

This applies to: operations ledger amounts, operations filter options.

---

### Archived Badge & Graying
When a wallet is archived:
- Name in list: grayed text + « Архив» badge next to name
- Avatar icon: grayed (light gray icon on light gray bg instead of colored icon on colored bg)
- Archived-state badges on detail header: visible, labeled «Архив»
- Wallet cannot be source/destination for new transfers
- Can still view its operations and transfer history
- Can only restore, not further edit or modify

---

### Summary Strip Scope (Rule 31)
The summary strip on the list page shows **totals across ALL wallets including archived**. This differs from the filtered table:
- Table rows: respect search + archive toggle (only showing `filteredWallets`)
- Summary totals: always sum all wallets in `allWallets` (independent of filters)
- This ensures users see the true organization total at a glance

---

## Known Limitations

1. **Payment detail linking**: Payment numbers in the operations ledger are illustrative. Clicking a payment row shows a toast instead of navigating to the Payments detail page (the full integration awaits the Payments module rebuild). Toast message: "Платёж {{number}} — переход в раздел «Платежи» появится после его перестройки" (i18n key: `wallet.operations.openPayment`)

2. **Running balance reconciliation**: The `balanceAfter` field in the operations ledger is illustrative and not reconciled to the wallet's opening balance + transaction sum. This is a known mock limitation (documented in CLAUDE.md: "Operations' `balanceAfter` running balances are illustrative (not reconciled to the opening balance — a known mock limitation)").

3. **Wallet-to-payment balance cross-reference**: The mock serves the wallet ledger independently of the Payments mock. A payment that affects this wallet is recorded in the wallet's operations, but the partner's balance and payment details may not fully reconcile across modules. This is a self-contained mock limitation.

4. **Stock/product impact**: Transfers do not mutate product stock or partner balances in the current mock. This is addressed in the Payments + Sales/Supplies integration as those modules are fully rebuilt.

---

## Related Modules & Integration Points

- **Payments**: Payment operations appear in the wallet's operations ledger; payment rows link to payment detail (currently toasts due to limitation #1)
- **Partners**: Partner names appear in operation "party" column; partner balances and advances are aggregated and held in wallets
- **Sales / Supplies**: Sale and supply payments flow through wallets and appear as payment-kind operations
- **Orders**: When an order is delivered to sale, payments flow through wallets

---

## Summary

This test case document covers all user-facing flows in the Wallets module:
- **List view**: empty states, search, archive toggle, summary strip, CSV export
- **Create modal**: field validation, type selection, opening balance, happy path
- **Edit modal**: name-only editing, locked type/opening balance, validation
- **Detail page**: header, stats, tabs (operations + transfers)
- **Operations tab**: ledger with search + direction filter, payment/transfer linking, running balances
- **Transfers tab**: transfer list, new transfer button (gated for archived), empty states
- **Transfer detail modal**: read-only transfer info, immutability note
- **Create transfer modal**: wallet pickers, validation, over-balance guard, live route preview
- **Archive/restore**: confirm dialogs, state transitions, visibility in list, summary totals
- **Error handling**: API errors, validation errors
- **Cross-module reconciliation**: balance mutations, inter-wallet transfers, archived totals

All cases ground in the actual source code (WalletPage, WalletDetailPage, WalletsTable, form modals, detail components, WalletStore, WalletApi) and the i18n strings from `src/i18n/ru/wallet.json`. The module is fully rebuilt to the redesign per CLAUDE.md and implements immutability (rule 1), server-computed balances (rule 12), auditable events (rule 16), archive-only deletion (rule 29), and archived totals (rule 31).

