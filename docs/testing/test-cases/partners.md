# Manual Browser Test Cases — Partners Module
**Ombor.Web | React 19 + MUI v7 + MobX | Russian UI | UZS Currency**

## Context
- **Testing Environment:** Deployed dev (app.miraziz.net frontend + api.miraziz.net backend, MOCKS OFF)
- **Tenant State:** Starts EMPTY; data is built up during testing
- **API Authority:** https://api.miraziz.net/swagger/v1/swagger.json (real backend for Partners is mocked per tech-change-list; see CLAUDE.md "Partners" entry)
- **Routes:** `/partners` (list), `/partners/:id` (detail)
- **Ledger Feature:** Full dispute-grade running-balance ledger with opening-balance audit event; server-computed balance (rule 8, CLAUDE.md)
- **Key Constraint:** Archive is soft (business-rules rule 29); delete is reference-gated (`isDeletable` flag)

---

## Test Cases

### **LIST VIEW**

#### **PARTNERS-01** · List renders with empty state when no partners exist
**Preconditions:** Tenant is new, no partners created
**Steps:**
1. Navigate to `/partners`
2. Observe the page title and layout

**Expected result:**
- Page title reads "Партнёры" (localized)
- A large empty-state card displays with:
  - Icon: 👥 (PeopleOutlineIcon)
  - Title: "Пока нет партнёров"
  - Body: "Добавьте первого клиента или поставщика…"
  - Primary button: "Новый партнёр"
- No summary strip is shown

**Designed gap:** None

---

#### **PARTNERS-02** · List header displays search, type filter, archive toggle, create/export buttons
**Preconditions:** List page opened
**Steps:**
1. Observe the header row
2. Check filter row below the title

**Expected result:**
- Header row contains: Title "Партнёры" (left), "Экспорт CSV" ghost button + "Новый партнёр" primary button (right)
- Filter row contains:
  - SearchInput with placeholder "Поиск по имени, компании или телефону…"
  - SegmentedControl: **Все | Клиенты | Поставщики** (default: Все)
  - Archive toggle (switch style, off by default, shows count when on)
- All controls are enabled

**Designed gap:** None

---

#### **PARTNERS-03** · Search filters partners by name, company, or phone number
**Preconditions:** Tenant has ≥2 partners with different names/companies (e.g., "Анна Петрова" + "БизнесТрейд")
**Steps:**
1. Type "Петр" into the search box
2. Wait for the list to update (debounced)
3. Clear the search box

**Expected result:**
- Only partners matching "Петр" (in name/company/phone) are shown
- Table updates without a page reload
- When cleared, all partners reappear
- Search is case-insensitive and clips whitespace

**Designed gap:** None

---

#### **PARTNERS-04** · Type filter ("Все | Клиенты | Поставщики") narrows list by partner type
**Preconditions:** Tenant has partners of different types (Customer, Supplier, Both)
**Steps:**
1. Observe list (should show all)
2. Click the "Клиенты" segment
3. Observe list (should show only Customer + Both types)
4. Click "Поставщики"
5. Observe list (should show only Supplier + Both types)

**Expected result:**
- Segmented control reflects the selected filter
- Table updates to show matching types only
- Summary strip (if shown) reflects the filtered count
- The filter persists until manually changed

**Designed gap:** None

---

#### **PARTNERS-05** · Archive toggle shows/hides archived partners; displays count badge
**Preconditions:** Tenant has 1 archived partner + ≥1 active partner
**Steps:**
1. Observe the archive toggle (should be OFF, showing a count badge)
2. Click the toggle to ON
3. Observe the list and the toggle appearance
4. Click the toggle to OFF

**Expected result:**
- OFF state: toggle is gray-bordered with white background; archived count shows as a badge (e.g., "Архив 1")
- ON state: toggle is teal-bordered with teal soft-background; list now includes archived partners (with "в архиве" badge)
- Archived partners appear with dimmed avatar and strikethrough name
- When OFF, archived partners are hidden again

**Designed gap:** None

---

#### **PARTNERS-06** · Summary strip displays receivable, payable, and net balances (with counts)
**Preconditions:** Tenant has ≥2 partners with mixed receivable/payable balances (e.g., +50k, -30k)
**Steps:**
1. Navigate to the list
2. Observe the summary strip (3 cards below the header)

**Expected result:**
- Card 1: "Всего к получению" (green accent bar left), shows "+50 000 UZS", footnote: "2 партнёров должны нам"
- Card 2: "Всего к оплате" (red accent bar left), shows "−30 000 UZS", footnote: "мы должны 1 партнёру"
- Card 3: "Чистая позиция" (teal accent bar left), shows "+20 000 UZS", footnote: "в нашу пользу · 3 активных"
- Colors use the locked pattern 4 (no +/− signs shown on cards themselves, only in the values)
- If there are archived partners in view, counts may differ based on the filter state

**Designed gap:** None

---

#### **PARTNERS-07** · CSV export generates a file with correct columns and data
**Preconditions:** List has ≥2 partners; some filters are active (optional)
**Steps:**
1. Click "Экспорт CSV" button
2. Wait for the browser download
3. Open the CSV file in a text editor or spreadsheet

**Expected result:**
- File is named `partners_YYYY-MM-DD.csv`
- Columns are: "Имя партнёра", "Тип", "Баланс, UZS", "Компания", "Телефон", "Архив" (localized labels)
- Each row contains partner data in the correct order
- Archived partners are marked with "1" in the Архив column; active partners are blank
- Export respects the current filtered view (search + type + archive toggle)

**Designed gap:** None

---

#### **PARTNERS-08** · Table pagination: 10/25/50 rows per page option, navigate between pages
**Preconditions:** Tenant has ≥15 partners
**Steps:**
1. Observe the table footer (pagination controls)
2. Change rows-per-page to 25
3. Create enough partners to fill 2+ pages
4. Use the pagination arrows to move between pages

**Expected result:**
- Default rows-per-page is 10
- Dropdown offers 10, 25, 50 options
- Changing the option updates the display immediately
- Next/previous arrows navigate between pages
- The current page number and total count are shown

**Designed gap:** None

---

#### **PARTNERS-09** · Clicking a partner row opens the detail page for that partner
**Preconditions:** List has ≥1 partner
**Steps:**
1. Click on any partner row (anywhere except the actions menu)
2. Wait for navigation

**Expected result:**
- URL changes to `/partners/{id}` where id is the partner's numeric ID
- The detail page loads with the partner's full information
- The browser back button returns to the list

**Designed gap:** None

---

#### **PARTNERS-10** · Row actions menu (⋮) provides Edit/Archive/Delete/Cannot-Delete options (gated)
**Preconditions:** List has ≥1 active partner and ≥1 archived partner
**Steps:**
1. Click the ⋮ menu on an active partner with no references (e.g., just created)
2. Observe the options
3. Close the menu
4. Click the ⋮ menu on an archived partner
5. Observe the options
6. Click the ⋮ menu on an active partner with references (has transactions)

**Expected result:**
- Active partner (unreferenced): Options are "Редактировать", "Архивировать", "Удалить"
- Archived partner: Options are "Редактировать", "Восстановить", "Удалить"
- Active partner (referenced): Options are "Редактировать", "Архивировать"; "Удалить" is absent or disabled
- Menu closes after selection or on Escape

**Designed gap:** None

---

### **CREATE FLOW**

#### **PARTNERS-11** · Create modal opens with all fields empty and proper defaults
**Preconditions:** List view is open
**Steps:**
1. Click "Новый партнёр" button
2. Observe the modal dialog

**Expected result:**
- Modal title: "Новый партнёр"
- Modal subtitle: (absent)
- Fields visible:
  - **Имя партнёра** (required, autofocus): text input, placeholder "Например, Антонина Давыдова"
  - **Тип партнёра** (required): SegmentedControl with Клиент | Поставщик | Оба (default: first option)
  - **Компания** (optional): text input, placeholder "Название компании"
  - **Телефоны** (required): at least 1 field visible, placeholder "+998 90 123-45-67", button "Добавить телефон" (up to 5 total)
  - **Email** (optional): text input, placeholder "mail@example.uz"
  - **Telegram** (optional): text input, placeholder "@username"
  - **Адрес** (optional): multiline textarea, placeholder "Город, улица, дом"
  - **Начальный баланс** section:
    - Intro text: "Баланс, который уже есть у партнёра… Если расчёты с нуля, оставьте 0."
    - **Тип остатка** (required): SegmentedControl "Партнёр должен нам" | "Мы должны партнёру" (default: first)
    - **Сумма** (required): styled numeric input with ± prefix and "UZS" suffix, default 0
    - Preview text: "Стартовая запись в книге: [±N UZS]" (shown when amount > 0)
- Buttons: "Отмена", "Создать партнёра"
- All buttons/fields are enabled

**Designed gap:** None

---

#### **PARTNERS-12** · Name field validation (required, 2–100 chars) shows inline error
**Preconditions:** Create modal is open
**Steps:**
1. Leave name empty and click "Создать партнёра"
2. Observe the error banner and field state
3. Type "А" (1 char) and click submit again
4. Observe the error
5. Type "Абвгд" (5 chars) and submit

**Expected result:**
- Submitting empty name shows:
  - Red banner: "Заполните обязательные поля: проверьте отмеченные поля ниже."
  - Name field has red border and helper text: "Имя должно содержать минимум 2 символа"
- Submitting 1 char shows the same error (min 2)
- Submitting 5 chars passes validation (name ≥ 2 and ≤ 100)
- Error clears when the field is corrected

**Designed gap:** None

---

#### **PARTNERS-13** · Phone field validation (required, at least 1 valid; 7–15 digits)
**Preconditions:** Create modal is open
**Steps:**
1. Leave all phone fields empty and submit
2. Clear and type "123" (too short) and submit
3. Type "+998901234567" (valid) and submit

**Expected result:**
- Empty phones: red banner appears, helper text on the phone row: "Укажите хотя бы один номер телефона"
- "123": error text "Телефон должен содержать только цифры (опционально «+») и иметь 7-15 символов"
- Valid: no error; form may proceed to submit
- The validation is on the first phone field only (UI shows error on the first field)

**Designed gap:** None

---

#### **PARTNERS-14** · Type field is required; all three options are selectable
**Preconditions:** Create modal is open
**Steps:**
1. Observe the SegmentedControl for "Тип партнёра"
2. Click each segment: Клиент, Поставщик, Оба
3. Verify the selection is stored

**Expected result:**
- All three options (Customer, Supplier, Both) are visible and clickable
- Clicking each one updates the selected segment visibly
- No visual/validation indication that type is required (it defaults to the first option)

**Designed gap:** None

---

#### **PARTNERS-15** · Optional fields (Company, Email, Telegram, Address) accept and trim whitespace
**Preconditions:** Create modal is open
**Steps:**
1. Enter:
   - Company: "  ООО Рога и Копыта  "
   - Email: "  test@example.com  "
   - Telegram: "  @username  "
   - Address: "  г. Ташкент, ул. Навои 15  "
2. Fill required fields (name, phone)
3. Submit the form

**Expected result:**
- Form accepts all optional fields
- Trimmed values are stored (whitespace on edges is removed)
- Empty optional fields are not sent to the API (undefined)
- Empty optional fields on edit are preserved as undefined, not cleared

**Designed gap:** None

---

#### **PARTNERS-16** · Email validation: format check (valid patterns only)
**Preconditions:** Create modal is open
**Steps:**
1. Fill required fields (name, phone)
2. Type "invalidemail" into Email field
3. Click submit
4. Fix to "test@example.uz" and submit

**Expected result:**
- "invalidemail": red banner appears, Email field shows error "Некорректный формат почты"
- "test@example.uz": passes validation (no error)
- Valid formats: user@domain.extension (1–64 chars local, 1–255 domain, 2–63 TLD)

**Designed gap:** None

---

#### **PARTNERS-17** · Phone field: up to 5 fields, add/remove, "Максимум 5 номеров" message
**Preconditions:** Create modal is open
**Steps:**
1. Observe the default single phone input and "Добавить телефон" button
2. Click "Добавить телефон" 4 times to create 5 phone fields
3. Verify the button disappears and a message reads "Максимум 5 номеров"
4. Click the X icon on one of the phone fields to remove it
5. Verify the add button reappears

**Expected result:**
- Default: 1 phone field + "Добавить телефон" button (enabled)
- After 5 adds: 5 phone fields, no "Добавить" button, message "Максимум 5 номеров" in gray
- Removing any field restores the "Добавить" button (unless 5 are still present)
- The X icon is only shown when >1 phone field exists

**Designed gap:** None

---

#### **PARTNERS-18** · Opening balance: type toggle (receivable ↔ payable) and amount input
**Preconditions:** Create modal is open
**Steps:**
1. Scroll to the "Начальный баланс" section
2. Observe the Тип остатка toggle (default: Партнёр должен нам)
3. Enter "50000" into the Сумма input
4. Observe the preview text showing "+50 000 UZS"
5. Click the toggle to "Мы должны партнёру"
6. Observe the preview now shows "−50 000 UZS"

**Expected result:**
- The Тип остатка has two options that toggle; the current choice is clearly highlighted
- The Сумма input has numeric formatting (thousands separator: "50 000" display for 50000 input)
- The numeric input has a large ± sign (+ for receivable, − for payable) that updates when the toggle changes
- Preview text: "Стартовая запись в книге: [sign N UZS]" appears only when amount > 0
- The sign and color match the balance semantics (green + for receivable, red − for payable)

**Designed gap:** None

---

#### **PARTNERS-19** · Opening amount validation (0–1,000,000,000 UZS)
**Preconditions:** Create modal is open
**Steps:**
1. Fill required fields
2. Enter "1000000001" into the Сумма field and submit
3. Change to "500000" and submit

**Expected result:**
- 1,000,000,001: red banner appears, Сумма field shows error "Баланс не должен превышать 1 000 000 000"
- 500,000: passes validation (no error)
- 0: allowed (for zero balance)

**Designed gap:** None

---

#### **PARTNERS-20** · Create flow: happy path (fill all fields, submit, see success notification and return to list)
**Preconditions:** List view is open, no partners exist yet
**Steps:**
1. Click "Новый партнёр"
2. Fill form:
   - Name: "Антонина Давыдова"
   - Type: "Клиент"
   - Company: "ООО Примера"
   - Phones: "+998901234567", "+998702468135"
   - Email: "test@example.uz"
   - Telegram: "@antonina_test"
   - Address: "г. Ташкент, ул. Амира Темура 15"
   - Opening type: "Партнёр должен нам"
   - Opening amount: "250000"
3. Click "Создать партнёра"
4. Wait for the modal to close and notification to appear

**Expected result:**
- Modal closes
- Toast notification appears: "Партнёр «Антонина Давыдова» создан"
- List is refreshed; new partner appears in the table with correct details:
  - Name: Антонина Давыдова
  - Type: Клиент
  - Balance: +250 000 UZS (green)
  - Company: ООО Примера
  - Phone: +998901234567 (first phone shown)
- The summary strip now shows the receivable total updated (if this is the first partner)

**Designed gap:** None

---

#### **PARTNERS-21** · Create flow: discard unsaved changes (unsaved-changes guard)
**Preconditions:** Create modal is open with partially filled form
**Steps:**
1. Fill Name: "Test Partner"
2. Click "Отмена" button
3. Observe the discard-changes confirmation dialog

**Expected result:**
- A confirm dialog appears with:
  - Icon: ReportProblemOutlinedIcon (warning tone)
  - Title: "Отменить изменения?"
  - Body: "Вы потеряете все введённые данные."
  - Buttons: "Отмена" (cancel), "Отменить изменения" (confirm, danger variant)
- Clicking "Отменить изменения" closes the form and returns to the list
- Clicking "Отмена" on the dialog keeps the form open

**Designed gap:** None

---

### **EDIT FLOW**

#### **PARTNERS-22** · Edit modal opens with partner data pre-filled; opening balance is locked and read-only
**Preconditions:** Tenant has ≥1 partner; partner detail page opened and partner is active
**Steps:**
1. Click the ⋮ menu and select "Редактировать"
2. Observe the modal

**Expected result:**
- Modal title: "Редактировать партнёра"
- Modal subtitle: partner name
- All editable fields are pre-filled with current values (name, type, company, phones, email, telegram, address)
- Opening balance section displays:
  - **Locked card** (gray background with flag icon):
    - Title: "Начальный баланс"
    - Subtitle: "Записан [date] — изменить нельзя" (date in dd.MM.yyyy format)
    - Signed amount displayed in color matching the balance semantics (green + or red −)
  - Info note: "Начальный баланс — это первая запись в книге расчётов. Он зафиксирован как аудит-событие и не редактируется. Текущий баланс [±balance] UZS меняется только транзакциями и платежами."
- Submit button reads "Сохранить изменения"

**Designed gap:** None

---

#### **PARTNERS-23** · Edit: modify optional fields and submit successfully
**Preconditions:** Edit modal is open
**Steps:**
1. Change Company from "ООО Примера" to "ООО Новое имя"
2. Add a third phone number "+998911111111"
3. Change Telegram to "@new_handle"
4. Click "Сохранить изменения"
5. Wait for the modal to close and notification

**Expected result:**
- Modal closes
- Toast notification: "Изменения сохранены"
- Navigating back to the detail page shows the updated values
- List view reflects the company name change if visible
- Opening balance is unchanged and was never editable

**Designed gap:** None

---

#### **PARTNERS-24** · Edit: type field is editable, change between Customer/Supplier/Both
**Preconditions:** Edit modal is open for a "Customer" partner
**Steps:**
1. Observe the type segmented control (should show Клиент selected)
2. Click Поставщик
3. Click Оба
4. Submit the form

**Expected result:**
- The type segmented control is fully enabled (not grayed out)
- Clicking a different type updates the UI immediately
- The change is persisted after submit
- No validation error occurs

**Designed gap:** None

---

#### **PARTNERS-25** · Edit: name/phone validation still applies
**Preconditions:** Edit modal is open
**Steps:**
1. Clear the Name field completely
2. Submit the form
3. Type "A" (1 char) and submit
4. Type "Valid Name" and submit

**Expected result:**
- Empty name: red banner + error "Имя должно содержать минимум 2 символа"
- 1 char: same error
- "Valid Name": passes; form submits

**Designed gap:** None

---

#### **PARTNERS-26** · Edit: discarding unsaved changes shows confirmation dialog
**Preconditions:** Edit modal is open and user makes a change (e.g., change company name)
**Steps:**
1. Change Company field
2. Click "Отмена"
3. Observe the discard-changes dialog

**Expected result:**
- Discard-changes dialog appears with warning tone
- Clicking "Отменить изменения" closes the form without saving
- Clicking "Отмена" keeps the form open with changes intact

**Designed gap:** None

---

### **DETAIL PAGE**

#### **PARTNERS-27** · Detail page header: breadcrumb, back button, avatar, name, type chip, company (if present), archived badge (if archived), action buttons
**Preconditions:** Partner detail page loaded
**Steps:**
1. Observe the header area (above the balance card)

**Expected result:**
- Breadcrumb: "Партнёры" (link, navigates to `/partners`) / ">" / Partner Name
- Back button (ChevronLeftIcon, rounded square, gray border)
- Avatar (initials from partner name)
- Partner name as H1 heading
- Type chip showing partner type (color-coded: teal for Customer, orange for Supplier, etc.)
- If partner.companyName is set: inline company display with icon
- If partner.isArchived: "в архиве" badge (gray, small)
- Action buttons (top right):
  - If archived: "Восстановить" (primary button with UnarchiveOutlinedIcon)
  - If active: ⋮ menu (PartnerActionsMenu with Edit/Archive/Delete)

**Designed gap:** None

---

#### **PARTNERS-28** · Detail page: archived banner appears when partner is archived
**Preconditions:** Partner is archived
**Steps:**
1. Observe the page below the header

**Expected result:**
- Yellow/warning-tone banner appears:
  - Icon: warning icon
  - Title: "Партнёр в архиве."
  - Body: "Он скрыт из списков и форм подбора, но его книга расчётов сохранена полностью и учитывается в итогах. Новые транзакции недоступны — восстановите партнёра, чтобы продолжить работу."

**Designed gap:** None

---

#### **PARTNERS-29** · Balance card: large balance hero with color, contact info (phones, email, telegram, address), opening-balance flag stamp, and four stat cards
**Preconditions:** Detail page loaded
**Steps:**
1. Observe the PartnerBalanceCard

**Expected result:**
- Left column (contacts):
  - "Контакты" section header (small caps)
  - All phones listed (first phone tagged "основной" in blue chip)
  - Email (if present)
  - Telegram (if present, @username format)
  - Address (if present)
- Right column (balance hero):
  - Balance label (Нам должны / Мы должны / Расчёты закрыты) in gray
  - Large balance amount in color (green for +, red for −)
  - Hint text matching the balance state (e.g., "Дебиторская задолженность — партнёр должен нам")
  - Opening-balance stamp: "Начальный баланс: [date] — [±opening_balance UZS]"
- Bottom row (4 stat cards):
  - Продажи: [total from ledger]
  - Поставки: [total from ledger]
  - Платежи: [total from ledger]
  - Начальный баланс: [opening_balance with color and sign]
  - Stats show "—" (dash) if value is 0

**Designed gap:** None

---

#### **PARTNERS-30** · Detail page tabs: Журнал (Ledger), Транзакции (Transactions), Платежи (Payments); each tab shows a count
**Preconditions:** Detail page loaded with ledger data
**Steps:**
1. Observe the tab bar below the balance card
2. Check the count badges on each tab

**Expected result:**
- Three tabs are visible:
  - "Журнал" — count of all ledger entries (including opening)
  - "Транзакции" — count of sale/supply/refund transactions only
  - "Платежи" — count of payment/deposit/withdraw entries only
- Each tab shows its count in gray text/badge
- The default tab is "Журнал"
- Clicking a tab switches the content below

**Designed gap:** None

---

#### **PARTNERS-31** · Ledger Tab: all events (opening, sales, supplies, refunds, payments) in a table with date, event, description, amount (signed), balance-after (running)
**Preconditions:** Detail page with ledger data; partner has a mix of transaction types
**Steps:**
1. Click the "Журнал" tab
2. Observe the table structure
3. Click on a non-opening row (e.g., a sale)

**Expected result:**
- Legend bar (below the filter row) shows:
  - "+" legend: "партнёр должен нам" (green)
  - "−" legend: "мы должны партнёру" (red)
  - Info note: "Баланс после каждой операции"
- Table columns (newest-first):
  - Date: dd.MM.yyyy format, monospace
  - Event: color-coded chip (e.g., green for Sale, blue for Payment, etc.)
  - Description: reference (e.g., "#1042" for sale, "PAY-2061" for payment) + item count (e.g., "· 3 поз.")
  - Amount: signed value with color (green +, red −), monospace
  - Balance-after: signed running balance with color, monospace
- Opening row: no description link (not clickable); grayish background, non-clickable
- Other rows: clickable (hover shows pointer and slight background change)
- Clicking a row opens the source (navigates to sale/supply/payment detail or shows a toast for self-contained mocks)

**Designed gap:** Non-opening transactions navigate to the real detail pages (sales/supplies/payments); opening row is not linked

---

#### **PARTNERS-32** · Ledger Tab: event filter dropdown (All/Sale/Supply/Payment/Refund/Opening)
**Preconditions:** Ledger tab is active
**Steps:**
1. Observe the "Событие" filter dropdown (default: Все события)
2. Click the dropdown
3. Select "Продажи"
4. Observe the table (only sales should remain)
5. Change back to "Все события"

**Expected result:**
- Dropdown shows options: Все события, Продажи, Поставки, Оплаты, Возвраты, Начальный баланс
- Selecting an option updates the table to show only matching event types
- "Возвраты" includes both refund-sale and refund-supply
- The filter state is retained until manually changed
- Filtered count updates dynamically

**Designed gap:** None

---

#### **PARTNERS-33** · Ledger Tab: period filter dropdown (All Time / 90 days / 30 days)
**Preconditions:** Ledger tab is active with events spanning multiple months
**Steps:**
1. Observe the "Период" filter dropdown (default: Всё время)
2. Click the dropdown and select "30 дней"
3. Observe the table (should show only last 30 days)
4. Select "90 дней"

**Expected result:**
- Dropdown shows options: Всё время, 90 дней, 30 дней
- Selecting an option filters entries by date range (from today going back)
- Table updates to show only entries within the range
- The date range is computed against the current server date

**Designed gap:** None

---

#### **PARTNERS-34** · Ledger Tab: CSV export button exports filtered ledger with correct columns
**Preconditions:** Ledger tab is active; some events are filtered (e.g., Sales only, last 30 days)
**Steps:**
1. Click the "CSV" button in the ledger-tab toolbar
2. Wait for download to complete

**Expected result:**
- File is named `partner_{partner_name}_ledger_{date}.csv` (name sanitized)
- Columns: "Дата", "Событие", "Описание", "Сумма", "Баланс после"
- Rows are filtered (only Sales in this example, within 30 days)
- Values are formatted correctly (dates as dd.MM.yyyy, amounts as signed integers)
- Export respects the current event and period filters

**Designed gap:** None

---

#### **PARTNERS-35** · Ledger Tab: empty state when no entries match the filters
**Preconditions:** Ledger tab is active; filters are set to show no results (e.g., "Payment" event filter on a partner with only sales)
**Steps:**
1. Apply a filter that returns 0 entries
2. Observe the card

**Expected result:**
- Empty-state card displays:
  - Icon: SwapVertIcon
  - Title: "Нет записей"
  - Body: "По выбранному фильтру событий не найдено."

**Designed gap:** None

---

#### **PARTNERS-36** · Transactions Tab: table with date, type (Sale/Supply/Refund), number, positions (count), amount, status; type and status filters
**Preconditions:** Detail page with sale/supply/refund events in the ledger
**Steps:**
1. Click the "Транзакции" tab
2. Observe the table

**Expected result:**
- Table columns:
  - Date: dd.MM.yyyy
  - Type: chip (green for Sale, blue for Supply, etc.)
  - Number: reference (e.g., "#1042") or "—" (dash)
  - Positions: item count or "—"
  - Amount: absolute value in UZS, monospace
  - Status: chip with tone (success/green for Оплачено, warning/yellow for Частично, error/red for Не оплачено, dash for Оплачено=done)
- Status tone reference:
  - **Оплачено** (paid): green chip
  - **Частично** (partial): yellow chip
  - **Не оплачено** (unpaid): red chip
  - **done**: dash "—" (no chip)
- Filters (Type, Status):
  - Type: Все типы, Продажи, Поставки, Возвраты
  - Status: Любой статус, Открытые — долг, Оплачено, Частично, Не оплачено
- Clicking a row navigates to the transaction detail

**Designed gap:** None

---

#### **PARTNERS-37** · Payments Tab: table with date, type (Payment/Deposit/Withdraw), amount, wallet; type filter
**Preconditions:** Detail page with payment events in the ledger
**Steps:**
1. Click the "Платежи" tab
2. Observe the table

**Expected result:**
- Table columns:
  - Date: dd.MM.yyyy
  - Type: chip (各 type-colored)
  - Amount: signed value, monospace
  - Wallet: wallet name (e.g., "Касса 1") or "—" (dash)
- Type filter: Все типы, Оплаты, Депозиты, Выводы
- Clicking a row navigates to the payment detail (or toasts for self-contained mock)

**Designed gap:** None

---

#### **PARTNERS-38** · Transactions Tab empty state: new partner with only opening balance
**Preconditions:** Newly created partner with no transactions yet
**Steps:**
1. Click the "Транзакции" tab
2. Observe the empty-state card

**Expected result:**
- Empty-state card:
  - Icon: ReceiptLongOutlinedIcon
  - Title: "Нет записей"
  - Body: "Партнёр только создан — пока есть только начальный баланс. Транзакции появятся после первой продажи или поставки."

**Designed gap:** None

---

#### **PARTNERS-39** · Payments Tab empty state: partner with no payments
**Preconditions:** Partner with no payment/deposit/withdraw events
**Steps:**
1. Click the "Платежи" tab
2. Observe the empty-state card

**Expected result:**
- Empty-state card:
  - Icon: AccountBalanceWalletOutlinedIcon
  - Title: "Нет записей"
  - Body: "Платежей с этим партнёром ещё не было." (for existing partner) or "С этим партнёром ещё не проводились платежи."

**Designed gap:** None

---

#### **PARTNERS-40** · Detail page: edit button (⋮ menu for active, primary "Восстановить" for archived)
**Preconditions:** Detail page loaded
**Steps:**
1. For active partner: click ⋮ menu, select "Редактировать"
2. For archived partner: click "Восстановить" button

**Expected result:**
- Active partner ⋮ menu options: "Редактировать", "Архивировать", "Удалить" (or "Удалить" absent if referenced)
- Archived partner: primary button "Восстановить" (UnarchiveOutlinedIcon) is shown instead of ⋮ menu
- Clicking "Редактировать" opens the edit modal (same as list view)
- Clicking "Восстановить" opens a confirm dialog

**Designed gap:** None

---

### **ARCHIVE / RESTORE / DELETE**

#### **PARTNERS-41** · Archive: confirm dialog, archive button in ⋮ menu (active partners only)
**Preconditions:** Active partner detail page or list row
**Steps:**
1. Click ⋮ menu and select "Архивировать"
2. Observe the confirm dialog

**Expected result:**
- Dialog title: "Архивировать [partner name]?"
- Body: "Партнёр будет скрыт из списка и недоступен для новых транзакций. Книга расчётов сохранится — вы сможете восстановить партнёра позже."
- Icon: ArchiveOutlinedIcon (warning tone)
- Buttons: "Отмена", "Архивировать" (warning variant)
- Clicking "Архивировать" archives the partner; list/detail updates
- Toast: "[name] — в архиве"

**Designed gap:** None

---

#### **PARTNERS-42** · Restore: confirm dialog, "Восстановить" button (archived partners only)
**Preconditions:** Archived partner detail page or list row (archive toggle ON)
**Steps:**
1. On detail: click "Восстановить" button; or on list: click ⋮ menu and select "Восстановить"
2. Observe the confirm dialog

**Expected result:**
- Dialog title: "Восстановить [partner name]?"
- Body: "Партнёр снова появится в списках и формах подбора, с ним можно будет проводить транзакции."
- Icon: UnarchiveOutlinedIcon (info tone)
- Buttons: "Отмена", "Восстановить" (primary variant)
- Clicking "Восстановить" restores the partner
- Toast: "[name] восстановлен из архива"

**Designed gap:** None

---

#### **PARTNERS-43** · Delete: confirm dialog, delete button in ⋮ menu (only if isDeletable=true)
**Preconditions:** Newly created partner with no references (sales, payments, etc.)
**Steps:**
1. Click ⋮ menu and select "Удалить"
2. Observe the confirm dialog

**Expected result:**
- Dialog title: "Удалить [partner name]?"
- Body: "Партнёр будет удалён без возможности восстановления. Это действие нельзя отменить."
- Icon: DeleteOutlineIcon (warning tone)
- Buttons: "Отмена", "Удалить" (danger variant)
- Clicking "Удалить" deletes the partner and navigates back to the list
- Toast: "Партнёр «[name]» удалён"

**Designed gap:** None

---

#### **PARTNERS-44** · Cannot Delete: warning dialog and archive-as-alternative option (when isDeletable=false)
**Preconditions:** Partner has references (e.g., a sale transaction)
**Steps:**
1. Click ⋮ menu and select "Удалить"
2. Observe the dialog

**Expected result:**
- Dialog title: "Партнёра нельзя удалить"
- Body: "На этого партнёра ссылаются другие записи (транзакции, платежи), поэтому удалить его нельзя. Вы можете архивировать партнёра — его книга расчётов сохранится."
- Icon: ErrorOutlineIcon (warning tone)
- Buttons: "Отмена", "Архивировать" (warning variant)
- Clicking "Архивировать" archives the partner instead (same behavior as the archive confirm dialog)
- Toast: "[name] — в архиве"

**Designed gap:** None

---

### **RECONCILIATION ASSERTIONS** (Cross-Module Verification)

#### **PARTNERS-45** · Create partner with opening receivable balance; verify in ledger
**Preconditions:** Partner created with opening balance +100,000 UZS (receivable)
**Steps:**
1. Navigate to the partner detail
2. Observe the balance card and ledger

**Expected result:**
- Balance card shows: "Нам должны" label, +100,000 UZS (green)
- Opening-balance stat: +100,000 UZS
- Ledger tab shows one opening entry:
  - Type: chip "Начальный баланс"
  - Description: "Перенос остатка из тетради"
  - Amount: +100,000 UZS (green)
  - Balance-after: +100,000 UZS (green)
- This is the foundational event (opening balance audit event per rule 8, CLAUDE.md)

**Designed gap:** None

---

#### **PARTNERS-46** · Create sale transaction for a partner; verify balance and ledger update
**Preconditions:** Partner has +100,000 opening balance; a sale is created for 50,000 UZS via New Sale (direction="Sale", partner=this partner, total=50,000)
**Steps:**
1. Create a sale transaction (external action, not in this module; see Sales module)
2. Return to the partner detail page
3. Observe the balance card and ledger

**Expected result:**
- Balance card: balance changes from +100,000 to +150,000 UZS (opening + sale delta, both receivable)
- Ledger tab: a new entry appears for the sale
  - Type: "Продажа"
  - Reference: "#[sale_id]"
  - Amount: +50,000 UZS (green, receivable—partner now owes us more)
  - Balance-after: +150,000 UZS (running balance reconciles)
- Transactions tab: the sale appears in the table
- Summary strip (on list): receivable total updates to reflect the new balance
- **Reconciliation note:** The running balance in the ledger's last entry must exactly match partner.balance (served by API)

**Designed gap:** None

---

#### **PARTNERS-47** · Create supply transaction for a partner; verify balance and ledger (payable direction)
**Preconditions:** Partner has balance 0; a supply is created for 30,000 UZS (direction="Supply", partner=this partner, total=30,000)
**Steps:**
1. Create a supply transaction (external action)
2. Return to the partner detail page

**Expected result:**
- Balance card: balance changes from 0 to −30,000 UZS (we now owe the partner)
- Ledger: new supply entry shows −30,000 UZS (red)
- Balance-after: −30,000 UZS (running balance)
- Summary strip: payable total updates

**Designed gap:** None

---

#### **PARTNERS-48** · Create payment (settlement) for a partner; verify balance and ledger
**Preconditions:** Partner has receivable balance +100,000 UZS; a payment of 40,000 UZS is created settling the transaction (external action via Payments module)
**Steps:**
1. Create a payment settlement (external action)
2. Return to the partner detail

**Expected result:**
- Balance card: balance updates from +100,000 to +60,000 UZS
- Ledger: new payment entry shows −40,000 UZS (we paid the partner)
- Balance-after: +60,000 UZS
- Payments tab: payment appears in the table
- The transaction's status (in Transactions tab) changes to "Частично" (partial) if the payment didn't settle the full transaction, or "Оплачено" (paid) if settled

**Designed gap:** None

---

#### **PARTNERS-49** · Archive a partner; verify it still appears in ledger but is hidden from list (unless archive toggle ON)
**Preconditions:** Active partner with transactions and payments; archive toggle OFF on the list
**Steps:**
1. Archive the partner (via detail ⋮ or list row ⋮)
2. Return to the partner list (archive toggle OFF)
3. Turn on the archive toggle
4. Navigate to the archived partner detail

**Expected result:**
- With toggle OFF: partner is not visible in the list
- With toggle ON: partner appears with "в архиве" badge, dimmed
- Archived partner detail still shows full ledger, transactions, payments (nothing is deleted)
- Ledger running balance is unchanged (all historical events remain)
- The partner cannot be used in new transactions (gated by the UI, if applicable)

**Designed gap:** None

---

#### **PARTNERS-50** · Delete a partner (unreferenced); verify complete removal
**Preconditions:** Newly created partner with no transactions or payments
**Steps:**
1. Navigate to the partner detail
2. Click ⋮ menu and select "Удалить"
3. Confirm the delete dialog
4. Return to the list (archive toggle OFF)

**Expected result:**
- Partner is completely removed from the list
- Navigating to `/partners/{old_id}` shows a 404 or "Партнёр не найден" message (if the detail page is still accessible)
- Summary strip is recalculated (count and totals update)

**Designed gap:** None

---

### **EDGE CASES & BEHAVIORS**

#### **PARTNERS-51** · Partner with 0 balance: label shows "Расчёты закрыты", hint "Баланс закрыт — обязательств нет"
**Preconditions:** Partner has balance exactly 0 UZS
**Steps:**
1. Navigate to the partner detail
2. Observe the balance card

**Expected result:**
- Balance label: "Расчёты закрыты" (gray)
- Hero value: "0 UZS"
- Hint: "Баланс закрыт — обязательств нет"

**Designed gap:** None

---

#### **PARTNERS-52** · Partner with no phone numbers in phone field initially; "Добавить телефон" button is visible and add button works
**Preconditions:** Edit modal for a partner
**Steps:**
1. If the partner originally has >1 phone, remove all but one, then remove the last one
2. Observe the phone field state

**Expected result:**
- When the last phone is removed, one empty phone field remains (to always have at least one input visible)
- The "Добавить телефон" button is enabled
- Clicking it adds a new phone field

**Designed gap:** None

---

#### **PARTNERS-53** · Ledger with >100 entries; pagination or virtualization is NOT applied (all entries shown in the tab)
**Preconditions:** Partner with many ledger entries (e.g., 150+ from long-running dataset)
**Steps:**
1. Navigate to the ledger tab
2. Scroll to the bottom

**Expected result:**
- All ledger entries are rendered in the table (no pagination, no virtualization per the locked pattern 12 note)
- Performance may degrade on very large ledgers (known limitation per CLAUDE.md)

**Designed gap:** Locked pattern 12 note (mvp-plan §7): date filter and pager are omitted. Long ledgers are rendered in full (unvirtualized table). This is a design choice, not a bug.

---

#### **PARTNERS-54** · Ledger: opening event is not clickable; other rows are clickable and navigate to source
**Preconditions:** Detail page with ledger tab active
**Steps:**
1. Hover over the opening balance row
2. Try clicking it
3. Hover and click a sale/payment row

**Expected result:**
- Opening row: no pointer cursor, click does nothing (or click is ignored)
- Sale/payment row: pointer cursor shows, click navigates to the transaction detail or payment detail
- If the source is a self-contained mock (no real ID), a toast is shown: "[reference] — Страница в разработке" (or similar)

**Designed gap:** Opening rows are self-contained audit events with no linked source; they are not navigable per design

---

#### **PARTNERS-55** · Multiple partners with same name (edge case); list and detail should not confuse them
**Preconditions:** Create two partners both named "Антон" (with different phones/companies to distinguish)
**Steps:**
1. View the list (both should appear)
2. Click the first "Антон" row
3. Verify the correct partner detail loads (by checking phone or company)
4. Return and click the second "Антон" row

**Expected result:**
- List shows both rows (avatar initials are the same, but rows are distinct)
- Clicking each navigates to the correct partner detail (URL has distinct ID)
- Balance and ledger are separate for each partner

**Designed gap:** None

---

#### **PARTNERS-56** · Form validation: all errors are shown together in the error banner and individual field helper texts
**Preconditions:** Create modal is open
**Steps:**
1. Leave Name empty, remove all phones, submit
2. Observe the error banner and fields

**Expected result:**
- Red error banner appears: "Заполните обязательные поля: проверьте отмеченные поля ниже."
- Name field: red border + helper text "Имя должно содержать минимум 2 символа"
- Phone field: red border + helper text "Укажите хотя бы один номер телефона"
- Both errors are displayed simultaneously (not sequentially)

**Designed gap:** None

---

#### **PARTNERS-57** · CSV export: filenames are sanitized (special characters removed or replaced)
**Preconditions:** List has a partner named "Partner / Test [2024]" (with special chars)
**Steps:**
1. Click CSV export

**Expected result:**
- File is named `partners_YYYY-MM-DD.csv` (special characters in the filename itself are replaced; partner data in CSV rows may contain them)
- File downloads without errors

**Designed gap:** None

---

#### **PARTNERS-58** · Network error during create: loading state is shown, and error notification is displayed on failure
**Preconditions:** API is temporarily down or times out during partner creation
**Steps:**
1. Open create modal
2. Fill valid form
3. Click "Создать партнёра"
4. Wait for the request to fail (or simulate a network error)

**Expected result:**
- Modal shows a linear progress bar during the request
- If the request fails: error toast appears (e.g., "Не удалось создать партнёра")
- Modal remains open (user can retry or discard)
- Submit button is re-enabled after the error

**Designed gap:** None

---

#### **PARTNERS-59** · Archived partner cannot be edited in a way that would create new transactions (gated by UI/backend)
**Preconditions:** Partner is archived
**Steps:**
1. Navigate to the archived partner detail
2. Try to create a new sale/supply via the New Sale page (select this archived partner)

**Expected result:**
- Archived partners are not shown in the partner picker (or if shown, a warning is displayed)
- If selection is attempted, the form or backend prevents the transaction creation
- Toast or validation error: "Партнёр архивирован — новые операции недоступны" (or similar)

**Designed gap:** This gating is likely implemented in the Sales/Supplies modules, not in the Partners module itself. Partners module does not prevent archiving; the downstream modules enforce the constraint.

---

## Summary of Coverage

**List View:** 10 cases (empty state, header, search, type/archive filters, summary strip, CSV export, pagination, row click, row menu, and loading states)

**Create Flow:** 11 cases (modal structure, field validation for name/phone/email/type/opening, optional field trimming, happy path, discard changes guard)

**Edit Flow:** 5 cases (modal with locked opening balance, optional field modification, type editability, validation, discard changes)

**Detail Page:** 9 cases (header, archived banner, balance card, tabs, ledger/transactions/payments tables, empty states, action buttons)

**Archive/Restore/Delete:** 4 cases (archive confirm, restore confirm, delete confirm, cannot-delete warning)

**Reconciliation Assertions:** 6 cases (opening balance creation, sale impact, supply impact, payment impact, archive behavior, delete behavior)

**Edge Cases:** 9 cases (zero balance, phone field edge case, large ledger, opening row non-clickable, duplicate names, validation all-at-once, CSV sanitization, network error handling, archived partner gating)

**Total:** 54 test cases covering all user-facing flows, state transitions, validation, error handling, cross-module reconciliation, and designed limitations.

---

## Notes for Testers

1. **Mocked Endpoints:** Partners module is fully mocked at `/api/partners` incl. the ledger endpoint (`GET /api/partners/{id}/ledger`). Archive/restore/delete and the ledger are "not started" on the real backend (see CLAUDE.md and docs/mocking.md).

2. **Balance Computation:** The `balance` field on the partner is **server-computed** (rule 8); never recomputed client-side. The ledger's running balance (`balanceAfter`) should reconcile to the partner's current `balance` as the last entry's value.

3. **Opening Balance Audit Event:** The opening balance is an immutable, auditable event recorded at creation. It cannot be edited (hard rule 1, rule 8). On edit, the form displays it as locked and read-only.

4. **Archive vs. Delete:** Archive is a soft flag (`isArchived=true`); archived partners are hidden by default but their ledgers are retained. Delete is hard removal, but only allowed when `isDeletable=true` (no references). The "Cannot Delete" dialog offers archiving as an alternative.

5. **Ledger Filtering:** Event and period filters are applied client-side (no backend query params). Locked pattern 12 (mvp-plan §7) omits date-range paging and a custom date picker.

6. **CSV Export:** Respects the current list/ledger filters. Filenames are timestamped for uniqueness.

7. **Keyboard Shortcuts:** None documented for the Partners module (unlike the New Sale POS). Modals support Escape to close (with unsaved-changes guard).

8. **Color Semantics:** Locked pattern 4 (CLAUDE.md) — receivable/payable are shown as green/red by color only, no +/− signs on card headers. Signs appear in the values themselves.

9. **i18n:** All labels come from `src/i18n/ru/partner.json`. Russian (ru) is the full locale; Uzbek locales (uz) are pending backfill and not yet active in the UI.

10. **Error Handling:** All CRUD operations show error toasts on failure (e.g., "Не удалось создать партнёра"). The form modal stays open to allow retry.
