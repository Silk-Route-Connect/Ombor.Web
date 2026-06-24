# Manual Test Cases: Employees Module (Сотрудники)

**Scope:** Full-page `EmployeePage` (list + modals) and routed detail page `EmployeeDetailPage` (`/employees/:id`). Real backend at `/api/employees`, `/api/employees/{id}/payrolls`; wallets and payroll are real.

**Environment:** Deployed dev (app.miraziz.net frontend + api.miraziz.net backend). Tenant starts empty.

**Key Notes:**
- Employees carry immutable **status** (Active / OnVacation / Terminated); status change is called terminate/restore, never a hard delete.
- Payroll payments are **immutable** per rule 1 (no edit/delete).
- All balances and figures are **server-computed and served** — never recomputed client-side.
- Search covers name + position; status is a segmented filter.
- CSV export includes: Name, Position, Salary (UZS), Status, Date of Employment.
- Payroll period is **YYYY-MM** format (e.g., "2026-06"); display derives a label (e.g., "Июнь 2026").
- Contact info is optional (email, phone numbers, address, Telegram); email is validated, phone format is checked.

---

## List View & Filtering

### EMPLOYEES-01: List loads and displays all employees
**Preconditions:** Empty tenant. 
**Steps:**
1. Navigate to `/employees` (Сотрудники).
2. Observe the list container.

**Expected result:** Empty state displays: icon (PeopleOutlineIcon), heading "Пока нет сотрудников", body text "Добавьте сотрудника...", "Новый сотрудник" button. Page header shows "Сотрудники" title, "Экспорт" and "Новый сотрудник" buttons.

---

### EMPLOYEES-02: Create employee and verify list updates
**Preconditions:** Empty list.
**Steps:**
1. Click "Новый сотрудник" button in the list empty state.
2. Fill: Name="Бахром Саидов", Position="Продавец", Salary=5000000, Date of Employment=2024-01-15, Status=Active.
3. Click "Сохранить".

**Expected result:** Modal closes, notification "Сотрудник успешно создан" appears, list reloads with one row showing avatar (initials "Б"), name, position, salary (formatted as currency), status badge (green "Активный"), date of employment.

---

### EMPLOYEES-03: Search filters employees by name
**Preconditions:** At least 2 employees: "Бахром Саидов" (Продавец), "Алиса Петрова" (Менеджер).
**Steps:**
1. In the search input, type "Бахром".
2. Observe the table.

**Expected result:** Only "Бахром Саидов" row is shown. Clear the search; both rows reappear.

---

### EMPLOYEES-04: Search filters employees by position
**Preconditions:** At least 2 employees with different positions.
**Steps:**
1. In the search input, type "Менеджер".
2. Observe the table.

**Expected result:** Only employees with "Менеджер" in the position field are shown.

---

### EMPLOYEES-05: Status segmented filter (Active)
**Preconditions:** 1 Active employee, 1 Terminated employee.
**Steps:**
1. Status filter is at "Все" (all).
2. Both rows are visible.
3. Click "Активный" segment.

**Expected result:** Only the Active employee row is shown. Terminated employee is hidden. List label changes to show the filter is active.

---

### EMPLOYEES-06: Status segmented filter (OnVacation)
**Preconditions:** 1 Active, 1 OnVacation employee.
**Steps:**
1. Click "В отпуске" segment.

**Expected result:** Only the OnVacation employee is shown.

---

### EMPLOYEES-07: Status segmented filter (Terminated)
**Preconditions:** 1 Active, 1 Terminated employee.
**Steps:**
1. Click "Уволен" segment.

**Expected result:** Only the Terminated employee is shown.

---

### EMPLOYEES-08: Clear filters (Все status)
**Preconditions:** Status filter set to "Активный".
**Steps:**
1. Click "Все" segment.

**Expected result:** All employees (all statuses) are visible again.

---

### EMPLOYEES-09: Search + status filter combined
**Preconditions:** 2 Active employees ("Бахром", "Алиса"), 1 Terminated ("Бахром Уволенный").
**Steps:**
1. Search for "Бахром".
2. Click "Активный" filter.

**Expected result:** Only the Active "Бахром Саидов" is shown. The terminated "Бахром Уволенный" is hidden by both filters.

---

### EMPLOYEES-10: List loading state
**Preconditions:** None.
**Steps:**
1. Navigate to `/employees` and observe the network request in flight.

**Expected result:** While `allEmployees` is "loading", the table shows a centered `CircularProgress` spinner.

---

### EMPLOYEES-11: CSV export
**Preconditions:** 1 employee: name="Бахром Саидов", position="Продавец", salary=5000000, status="Active", dateOfEmployment="2024-01-15".
**Steps:**
1. Click "Экспорт" button.
2. A CSV file downloads.
3. Open the file in a text editor or Excel.

**Expected result:** File named `employees_<timestamp>.csv`. Columns (in order): ФИО, Должность, Зарплата, Статус, Дата найма. Row 1 contains the employee data with salary formatted as currency (e.g., "5000000"), status as the localized label (e.g., "Активный"), date as formatted (e.g., "15.01.2024").

---

### EMPLOYEES-12: CSV export when filtering
**Preconditions:** 3 employees: 2 Active, 1 Terminated.
**Steps:**
1. Filter to "Активный" (show 2).
2. Click "Экспорт".

**Expected result:** CSV contains only the 2 visible Active employees (not the Terminated one).

---

### EMPLOYEES-13: Empty state when search yields no results
**Preconditions:** 1 employee "Бахром".
**Steps:**
1. Search for "Zzz" (no match).

**Expected result:** Empty state displays: "Сотрудники не найдены", "Измените запрос поиска или фильтр по статусу.", no "Новый сотрудник" button (per design when filtering).

---

## Create Employee Modal

### EMPLOYEES-14: Create employee modal opens
**Preconditions:** Logged in, on Employees page.
**Steps:**
1. Click "Новый сотрудник" button (in header or empty state).

**Expected result:** Modal opens, titled "Новый сотрудник". Form fields visible: Name (required), Position (required), Salary (required) with UZS suffix, Date of Employment (required, date picker), Status (required, segmented control: Active/OnVacation/Terminated). Contact Info section with Email, Telegram, Address, Phone Numbers (all optional). "Сохранить" button is disabled initially (form is pristine, no validation errors yet). Close button (X) in the top-right.

---

### EMPLOYEES-15: Create employee – required field validation (Name)
**Preconditions:** Modal open.
**Steps:**
1. Leave Name empty.
2. Click outside the Name field (onBlur).

**Expected result:** Name field shows error: "ФИО обязательно". "Сохранить" button remains disabled.

---

### EMPLOYEES-16: Create employee – required field validation (Position)
**Preconditions:** Modal open.
**Steps:**
1. Leave Position empty.
2. Click outside the Position field.

**Expected result:** Position field shows error: "Должность обязательна". "Сохранить" button disabled.

---

### EMPLOYEES-17: Create employee – required field validation (Salary)
**Preconditions:** Modal open.
**Steps:**
1. Leave Salary empty or enter a negative value.
2. Click outside or try to submit.

**Expected result:** Salary field shows error: "Зарплата должна быть положительной" (or required). "Сохранить" button disabled.

---

### EMPLOYEES-18: Create employee – Date of Employment validation (no future dates)
**Preconditions:** Modal open.
**Steps:**
1. Set Date of Employment to tomorrow's date.
2. Click outside the date field.

**Expected result:** Error message: "Дата найма не может быть в будущем". "Сохранить" button disabled.

---

### EMPLOYEES-19: Create employee – Name too long
**Preconditions:** Modal open.
**Steps:**
1. Enter a name exceeding 250 characters.
2. Click outside the Name field.

**Expected result:** Error: "ФИО не должно превышать 250 символов". "Сохранить" button disabled.

---

### EMPLOYEES-20: Create employee – Position too long
**Preconditions:** Modal open.
**Steps:**
1. Enter a position exceeding 250 characters.

**Expected result:** Error: "Должность не должна превышать 250 символов". "Сохранить" button disabled.

---

### EMPLOYEES-21: Create employee – Email validation
**Preconditions:** Modal open.
**Steps:**
1. In Contact Info, enter Email = "invalid-email" (no @).
2. Click outside the email field.

**Expected result:** Error: "Неверный формат email". "Сохранить" button disabled.

---

### EMPLOYEES-22: Create employee – Email too long
**Preconditions:** Modal open.
**Steps:**
1. Enter an email exceeding 250 characters.

**Expected result:** Error: "Email не должен превышать 250 символов". "Сохранить" button disabled.

---

### EMPLOYEES-23: Create employee – Phone number validation
**Preconditions:** Modal open, Phone Numbers field.
**Steps:**
1. Add a phone number "12" (too short).
2. Click outside.

**Expected result:** Error: "Неверный формат номера телефона". "Сохранить" button disabled.

---

### EMPLOYEES-24: Create employee – Phone number format (7-15 digits)
**Preconditions:** Modal open.
**Steps:**
1. Add a valid phone "+998901234567" (11 digits with prefix).
2. Press Tab to move away.

**Expected result:** No error. "Сохранить" button becomes enabled (assuming other required fields are valid).

---

### EMPLOYEES-25: Create employee – Telegram too long
**Preconditions:** Modal open.
**Steps:**
1. Enter Telegram account exceeding 250 characters.

**Expected result:** Error: "Telegram не должен превышать 250 символов". "Сохранить" button disabled.

---

### EMPLOYEES-26: Create employee – Address too long
**Preconditions:** Modal open.
**Steps:**
1. Enter an address exceeding 250 characters in the Address field.

**Expected result:** Error: "Адрес не должен превышать 250 символов". "Сохранить" button disabled.

---

### EMPLOYEES-27: Create employee – Happy path (minimal)
**Preconditions:** Modal open.
**Steps:**
1. Fill required fields: Name="John Doe", Position="Manager", Salary=5000000, Date of Employment=2024-01-01, Status=Active.
2. Leave Contact Info empty.
3. Click "Сохранить".

**Expected result:** Modal closes. Notification "Сотрудник успешно создан". New employee appears in the list with avatar, name, position, salary, Active status badge, date.

---

### EMPLOYEES-28: Create employee – Happy path (with contact info)
**Preconditions:** Modal open.
**Steps:**
1. Fill all required fields as above.
2. In Contact Info, enter: Email="john@example.com", Telegram="@johndoe", Address="123 Main St", add two phone numbers "+998901234567" and "+998881234567".
3. Click "Сохранить".

**Expected result:** Modal closes, notification shows, employee is created with all contact details stored.

---

### EMPLOYEES-29: Create employee – Discard changes confirm dialog
**Preconditions:** Modal open, form is dirty (e.g., Name filled but not saved).
**Steps:**
1. Click the close (X) button on the modal.

**Expected result:** A confirmation dialog appears: "Вы уверены, что хотите закрыть этот диалог? Несохраненные изменения будут потеряны." with "Отменить" and "Закрыть" buttons.

---

### EMPLOYEES-30: Create employee – Discard and leave modal
**Preconditions:** Discard dialog is open from EMPLOYEES-29.
**Steps:**
1. Click "Закрыть" button.

**Expected result:** Confirmation dialog closes, form modal closes, list is visible again. Changes are discarded.

---

### EMPLOYEES-31: Create employee – Cancel discard
**Preconditions:** Discard dialog is open.
**Steps:**
1. Click "Отменить" button.

**Expected result:** Discard dialog closes, form modal remains open with the user's unsaved data still present.

---

### EMPLOYEES-32: Create employee – Status segmented control
**Preconditions:** Modal open.
**Steps:**
1. Observe the Status field segmented control with three options: "Активный", "В отпуске", "Уволен".
2. Click each segment and observe that the form marks it as dirty.

**Expected result:** Each click updates the Status field value. All options are selectable.

---

### EMPLOYEES-33: Create employee – Salary accepts decimal input
**Preconditions:** Modal open.
**Steps:**
1. In Salary field, enter "5000000.50".
2. Click outside.

**Expected result:** No validation error. Salary accepts decimal values. "Сохранить" button enabled (if other fields valid).

---

### EMPLOYEES-34: Create employee – Salary shows UZS suffix
**Preconditions:** Modal open, Salary field visible.
**Steps:**
1. Observe the Salary field.

**Expected result:** An InputAdornment (suffix) shows "UZS" on the right side of the input.

---

### EMPLOYEES-35: Modal does not close on Escape when saving
**Preconditions:** Modal open, form is valid, saving is in progress (observe loading bar).
**Steps:**
1. Press the Escape key.

**Expected result:** Modal does not close (disableEscapeKeyDown is set during saving).

---

## Edit Employee Modal

### EMPLOYEES-36: Edit employee modal opens
**Preconditions:** 1 employee exists (e.g., "Бахром", status Active).
**Steps:**
1. On the list, click the ⋮ menu on the employee row.
2. Select "Редактировать".

**Expected result:** Modal opens, titled "Редактировать сотрудника". All form fields are pre-populated with the employee's current data. "Сохранить" button is disabled (form is pristine, no changes yet).

---

### EMPLOYEES-37: Edit employee – Change name
**Preconditions:** Edit modal open for "Бахром Саидов".
**Steps:**
1. Clear the Name field and enter "Новое имя".
2. Click "Сохранить".

**Expected result:** Modal closes, notification "Сотрудник успешно обновлен". List updates with the new name.

---

### EMPLOYEES-38: Edit employee – Change position
**Preconditions:** Edit modal open.
**Steps:**
1. Change Position to "Директор".
2. Click "Сохранить".

**Expected result:** Modal closes, notification "Сотрудник успешно обновлен". List shows the new position.

---

### EMPLOYEES-39: Edit employee – Change salary
**Preconditions:** Edit modal open, current salary 5000000.
**Steps:**
1. Change Salary to 6000000.
2. Click "Сохранить".

**Expected result:** Modal closes, notification "Сотрудник успешно обновлен". List displays the new salary.

---

### EMPLOYEES-40: Edit employee – Change status to OnVacation
**Preconditions:** Edit modal open for an Active employee.
**Steps:**
1. Click the "В отпуске" segment in the Status control.
2. Click "Сохранить".

**Expected result:** Modal closes, notification "Сотрудник успешно обновлен". List shows the employee's status as "В отпуске" (orange/different color badge).

---

### EMPLOYEES-41: Edit employee – Change Date of Employment
**Preconditions:** Edit modal open.
**Steps:**
1. Change the date to "2023-12-01".
2. Click "Сохранить".

**Expected result:** Modal closes, notification "Сотрудник успешно обновлен". List shows the new date.

---

### EMPLOYEES-42: Edit employee – Add contact info (email)
**Preconditions:** Edit modal open for employee with no contact info.
**Steps:**
1. In Contact Info section, enter Email="john@example.com".
2. Click "Сохранить".

**Expected result:** Modal closes, notification "Сотрудник успешно обновлен". On the detail page, the email is displayed.

---

### EMPLOYEES-43: Edit employee – Update contact info (phone)
**Preconditions:** Edit modal open for employee with existing phone "+998901234567".
**Steps:**
1. Clear the phone and add a new phone "+998881111111".
2. Click "Сохранить".

**Expected result:** Modal closes, notification "Сотрудник успешно обновлен". Detail page shows the new phone number.

---

### EMPLOYEES-44: Edit employee – Remove optional contact info
**Preconditions:** Edit modal open for employee with Email="john@example.com", Telegram="@john".
**Steps:**
1. Clear both the Email and Telegram fields.
2. Click "Сохранить".

**Expected result:** Modal closes, notification "Сотрудник успешно обновлен". On the detail page, email and Telegram are empty/not shown.

---

### EMPLOYEES-45: Edit employee – Validation still applies on edit
**Preconditions:** Edit modal open.
**Steps:**
1. Clear the Name field.
2. Click "Сохранить".

**Expected result:** Name field shows error "ФИО обязательно". Modal remains open. "Сохранить" button is disabled.

---

### EMPLOYEES-46: Edit employee – "Сохранить" button disabled when no changes
**Preconditions:** Edit modal open, form loaded with employee data.
**Steps:**
1. Do not modify any field.
2. Observe the "Сохранить" button.

**Expected result:** "Сохранить" button is disabled (no changes, form not dirty).

---

### EMPLOYEES-47: Edit employee – "Сохранить" button enabled after a change
**Preconditions:** Edit modal open, form pristine.
**Steps:**
1. Change any field (e.g., Name).
2. Observe the "Сохранить" button.

**Expected result:** "Сохранить" button becomes enabled.

---

## Detail Page

### EMPLOYEES-48: Detail page loads for an employee
**Preconditions:** Employee "Бахром Саидов" exists.
**Steps:**
1. Click the employee row on the list.

**Expected result:** Page navigates to `/employees/:id`. Header shows breadcrumb: "Сотрудники > Бахром Саидов". Back button (←) next to a large avatar with initials, name "Бахром Саидов", status badge (e.g., "Активный"), position and phone and employment date below. Primary action button "Выплатить" (if Active) or "Восстановить" (if Terminated), plus a ⋮ menu.

---

### EMPLOYEES-49: Detail page shows identity header
**Preconditions:** Employee "Бахром Саидов" (position="Продавец", phone="+998901234567", dateOfEmployment="2024-01-15"), status=Active.
**Steps:**
1. Open the employee's detail page.

**Expected result:** Large avatar with "Б" initial, name "Бахром Саидов" in large text, "Активный" badge, subtitle text showing "Продавец · +998901234567 · с 15.01.2024".

---

### EMPLOYEES-50: Detail page – back button navigates to list
**Preconditions:** On employee detail page.
**Steps:**
1. Click the back (←) button.

**Expected result:** Page navigates back to `/employees` (list view).

---

### EMPLOYEES-51: Detail page – breadcrumb navigates to list
**Preconditions:** On employee detail page.
**Steps:**
1. Click "Сотрудники" in the breadcrumb.

**Expected result:** Page navigates to `/employees`.

---

### EMPLOYEES-52: Detail page shows three stat cards
**Preconditions:** Employee "Бахром" with salary=5000000, 2 payroll payments in current month totaling 2000000, 5 payroll payments total.
**Steps:**
1. Open detail page.
2. Observe the stat cards below the header.

**Expected result:** Three cards in a row (responsive grid):
- Card 1: "Зарплата" label, value "5000000 UZS / мес"
- Card 2: "Выплачено за Июнь" (localized month name), value "2000000 UZS" (green/accent color)
- Card 3: "Выплат всего", value "5"

---

### EMPLOYEES-53: Detail page – Payroll section heading
**Preconditions:** Employee with payroll history.
**Steps:**
1. Scroll below the stat cards.

**Expected result:** Section heading "Выплаты" with a badge showing the total number of payments (e.g., "5").

---

### EMPLOYEES-54: Detail page – Payroll table columns
**Preconditions:** Employee with at least one payroll payment.
**Steps:**
1. Observe the payroll history table.

**Expected result:** Columns (left to right): Date, Type (always shows purple dot + "Зарплата"), Period, Amount (UZS, right-aligned), Wallet.

---

### EMPLOYEES-55: Detail page – Payroll table data
**Preconditions:** Employee with payroll: date="2026-06-15", amount=1000000, period="2026-06", walletName="Касса 1".
**Steps:**
1. Observe the payroll table row.

**Expected result:** Row displays: "15.06.2026", "Зарплата" with purple dot, "Июнь 2026" (derived from date), "1000000", "Касса 1".

---

### EMPLOYEES-56: Detail page – Payroll empty state
**Preconditions:** Employee with no payroll history.
**Steps:**
1. Open detail page.
2. Scroll to the Payroll section.

**Expected result:** Empty state displays: PaymentsOutlinedIcon, "Нет выплат" heading, "За выбранный период выплат не было." body text.

---

### EMPLOYEES-57: Detail page – Payroll period filter (Week)
**Preconditions:** Employee with payroll history spanning multiple weeks.
**Steps:**
1. Observe the SegmentedControl above the table: "Неделя / Месяц / Весь период".
2. Ensure "Неделя" is selected (default is "Неделя").

**Expected result:** Table shows only payroll from the current week (7 days ago to today).

---

### EMPLOYEES-58: Detail page – Payroll period filter (Month)
**Preconditions:** Employee with payroll from multiple months.
**Steps:**
1. Click "Месяц" segment.

**Expected result:** Table updates to show only payroll from the current calendar month.

---

### EMPLOYEES-59: Detail page – Payroll period filter (All time)
**Preconditions:** Employee with payroll from multiple months.
**Steps:**
1. Click "Весь период" segment.

**Expected result:** Table shows all payroll payments (no date filtering).

---

### EMPLOYEES-60: Detail page – Payroll loads
**Preconditions:** On employee detail page.
**Steps:**
1. Observe the payroll section while it loads.

**Expected result:** While data is loading, a centered `CircularProgress` spinner is shown. Once loaded, the table or empty state appears.

---

## Terminate & Restore Actions

### EMPLOYEES-61: Terminate Active employee – confirm dialog
**Preconditions:** Active employee "Бахром" on detail page.
**Steps:**
1. Click the ⋮ menu in the detail header.
2. Select "Уволить".

**Expected result:** A confirmation dialog appears: icon (PersonOffOutlinedIcon, warning tone), title "Уволить сотрудника «Бахром Саидов»?", body "Сотрудник будет помечен как уволенный и скрыт из активного списка. История его выплат сохранится. Сотрудника можно восстановить позже.", "Отменить" button, "Уволить" button (danger/red).

---

### EMPLOYEES-62: Terminate employee – confirm
**Preconditions:** Confirm dialog from EMPLOYEES-61 is open.
**Steps:**
1. Click "Уволить" button.

**Expected result:** Dialog closes, notification "Сотрудник уволен" appears, detail page updates: status badge changes to "Уволен" (red/danger color), primary action button changes from "Выплатить" to "Восстановить", ⋮ menu now shows "Восстановить" instead of "Уволить".

---

### EMPLOYEES-63: Terminate employee – cancel
**Preconditions:** Confirm dialog from EMPLOYEES-61 is open.
**Steps:**
1. Click "Отменить" button.

**Expected result:** Dialog closes, employee status remains Active. Detail page is unchanged.

---

### EMPLOYEES-64: Terminate employee – list updates
**Preconditions:** Active employee "Бахром" on list.
**Steps:**
1. Click the ⋮ menu on the row.
2. Select "Уволить".
3. Confirm.

**Expected result:** Notification "Сотрудник уволен". List updates: employee row shows status badge as "Уволен", avatar is dimmed (gray background instead of primary blue).

---

### EMPLOYEES-65: Restore Terminated employee – confirm dialog
**Preconditions:** Terminated employee "Бахром" on detail page.
**Steps:**
1. Click ⋮ menu.
2. Select "Восстановить".

**Expected result:** Confirmation dialog appears: icon (RestartAltOutlinedIcon, info tone), title "Восстановить сотрудника «Бахром Саидов»?", body "Сотрудник снова станет активным, и по нему можно будет проводить выплаты.", "Отменить" and "Восстановить" (primary/blue) buttons.

---

### EMPLOYEES-66: Restore employee – confirm
**Preconditions:** Restore confirmation dialog is open.
**Steps:**
1. Click "Восстановить" button.

**Expected result:** Dialog closes, notification "Сотрудник восстановлен", detail page updates: status badge changes to "Активный" (green), primary action button changes to "Выплатить", ⋮ menu shows "Уволить" again.

---

### EMPLOYEES-67: Restore employee – cancel
**Preconditions:** Restore confirmation dialog is open.
**Steps:**
1. Click "Отменить" button.

**Expected result:** Dialog closes, employee remains Terminated.

---

### EMPLOYEES-68: Restore employee – list updates
**Preconditions:** Terminated employee on list.
**Steps:**
1. Click ⋮ menu.
2. Select "Восстановить".
3. Confirm.

**Expected result:** Notification "Сотрудник восстановлен". List row updates: status badge shows "Активный", avatar is no longer dimmed.

---

### EMPLOYEES-69: Terminated employee cannot receive payment
**Preconditions:** Terminated employee on list or detail page.
**Steps:**
1. Observe the row's ⋮ menu or detail header action buttons.

**Expected result:** "Выплатить" action is absent (only "Редактировать" and "Восстановить" are available). The detail page primary button shows only "Восстановить", not "Выплатить".

---

## Payroll Payment Modal

### EMPLOYEES-70: Open payroll modal from list (Active employee)
**Preconditions:** Active employee "Бахром" on list.
**Steps:**
1. Click ⋮ menu on the row.
2. Select "Выплатить".

**Expected result:** PayrollFormModal opens, titled "Оплата зарплаты". The employee name is displayed (locked, not editable). Fields visible: Wallet (required, dropdown), Period (required, month picker type="month"), Amount (required, number input), Notes (optional, textarea).

---

### EMPLOYEES-71: Open payroll modal from detail (Active employee)
**Preconditions:** Active employee on detail page.
**Steps:**
1. Click the "Выплатить" button.

**Expected result:** PayrollFormModal opens as in EMPLOYEES-70. Employee name is locked and displayed.

---

### EMPLOYEES-72: Payroll modal – employee is locked when opened from detail
**Preconditions:** PayrollFormModal open from detail page, employee is "Бахром Саидов".
**Steps:**
1. Observe the employee field.

**Expected result:** Employee field is read-only (not an autocomplete): displays "Бахром Саидов" with the position below (e.g., "Продавец").

---

### EMPLOYEES-73: Payroll modal – wallet defaults to first available
**Preconditions:** Wallets exist: Касса 1, Касса 2. Modal open.
**Steps:**
1. Observe the Wallet dropdown.

**Expected result:** Wallet dropdown shows "Касса 1" as the default selected value (the first in the list).

---

### EMPLOYEES-74: Payroll modal – wallet options (only non-archived)
**Preconditions:** 2 Active wallets, 1 Archived wallet. Modal open.
**Steps:**
1. Click the Wallet dropdown.

**Expected result:** Dropdown shows only the 2 non-archived wallets. Archived wallets are excluded.

---

### EMPLOYEES-75: Payroll modal – Period validation (required)
**Preconditions:** Modal open.
**Steps:**
1. Leave Period empty.
2. Click "Сохранить".

**Expected result:** Error message below Period field: "Укажите период (ГГГГ-ММ)". "Сохранить" button is disabled.

---

### EMPLOYEES-76: Payroll modal – Period format validation
**Preconditions:** Modal open.
**Steps:**
1. In the Period field (type="month"), enter an invalid format (e.g., "06-2026").
2. Try to submit.

**Expected result:** Error: "Укажите период (ГГГГ-ММ)". Button disabled.

---

### EMPLOYEES-77: Payroll modal – Amount validation (positive)
**Preconditions:** Modal open.
**Steps:**
1. Enter Amount = 0 or a negative value.
2. Click "Сохранить".

**Expected result:** Error: "Сумма должна быть положительной". Button disabled.

---

### EMPLOYEES-78: Payroll modal – Amount validation (required)
**Preconditions:** Modal open.
**Steps:**
1. Leave Amount empty.
2. Click "Сохранить".

**Expected result:** Error below Amount field (validation message). Button disabled.

---

### EMPLOYEES-79: Payroll modal – Wallet validation (required)
**Preconditions:** Modal open, no wallets available (edge case).
**Steps:**
1. Attempt to submit without selecting a wallet.

**Expected result:** Error: "Выберите кассу" (or validation message). Button disabled.

---

### EMPLOYEES-80: Payroll modal – Notes optional
**Preconditions:** Modal open.
**Steps:**
1. Fill Wallet, Period, Amount, but leave Notes empty.
2. Click "Сохранить".

**Expected result:** Form submits successfully. Notes are not required.

---

### EMPLOYEES-81: Payroll modal – Notes too long (>500 chars)
**Preconditions:** Modal open.
**Steps:**
1. In Notes field, paste or type 501+ characters.
2. Click outside the field.

**Expected result:** Error: "Примечания не должны превышать 500 символов". Button disabled.

---

### EMPLOYEES-82: Payroll modal – Happy path
**Preconditions:** Modal open, employee is "Бахром", wallets available.
**Steps:**
1. Wallet = "Касса 1" (select it).
2. Period = "2026-06" (select June 2026).
3. Amount = "1000000".
4. Notes = "June salary" (optional).
5. Click "Сохранить".

**Expected result:** Modal closes, notification "Выплата успешно создана", detail page's payroll table updates to show the new payment. If on the detail page, the "Выплачено за <месяц>" stat card updates.

---

### EMPLOYEES-83: Payroll modal – Multiple payments same employee, same month
**Preconditions:** Employee already has 1 payroll for June 2026. Modal open for the same employee.
**Steps:**
1. Enter Period="2026-06", Amount="500000", Wallet="Касса 1".
2. Click "Сохранить".

**Expected result:** Form submits (no one-per-month block, per CLAUDE.md). New payment is created. On the detail page, there are now 2 payroll rows for June 2026.

---

### EMPLOYEES-84: Payroll modal – Discard changes dialog
**Preconditions:** Modal open, form is dirty (e.g., Period entered).
**Steps:**
1. Click the close (X) button or press Escape.

**Expected result:** Discard confirmation dialog appears: "Вы уверены, что хотите закрыть этот диалог? Несохраненные изменения будут потеряны." with "Отменить" and "Закрыть" buttons.

---

### EMPLOYEES-85: Payroll modal – Confirm discard
**Preconditions:** Discard dialog from EMPLOYEES-84 is open.
**Steps:**
1. Click "Закрыть".

**Expected result:** Dialog and modal close. Unsaved payment data is discarded.

---

### EMPLOYEES-86: Payroll modal – Cancel discard
**Preconditions:** Discard dialog is open.
**Steps:**
1. Click "Отменить".

**Expected result:** Discard dialog closes, payroll modal remains open with unsaved data.

---

### EMPLOYEES-87: Payroll modal – Loading state
**Preconditions:** Modal open, submitting form.
**Steps:**
1. Observe the form while the request is in flight.

**Expected result:** A progress bar (LinearProgress) appears below the title. "Сохранить" button is disabled during submission.

---

## Row Actions Menu (List View)

### EMPLOYEES-88: Row action menu opens
**Preconditions:** Employee row on list.
**Steps:**
1. Click the ⋮ icon on the row (rightmost column).

**Expected result:** A menu pops up with options.

---

### EMPLOYEES-89: Row action menu – Active employee options
**Preconditions:** Active employee row.
**Steps:**
1. Click the ⋮ menu.

**Expected result:** Menu shows: "Выплатить" (PaymentsOutlinedIcon, primary blue), "Редактировать" (EditOutlinedIcon, secondary), a divider, "Уволить" (PersonOffOutlinedIcon, red).

---

### EMPLOYEES-90: Row action menu – Terminated employee options
**Preconditions:** Terminated employee row.
**Steps:**
1. Click the ⋮ menu.

**Expected result:** Menu shows: "Редактировать", a divider, "Восстановить" (RestartAltOutlinedIcon, green).

---

### EMPLOYEES-91: Row action menu – Edit action
**Preconditions:** Menu open.
**Steps:**
1. Click "Редактировать".

**Expected result:** EmployeeFormModal opens in edit mode.

---

### EMPLOYEES-92: Row action menu – Pay action (Active)
**Preconditions:** Active employee row, menu open.
**Steps:**
1. Click "Выплатить".

**Expected result:** PayrollFormModal opens with the employee locked.

---

### EMPLOYEES-93: Row action menu – Terminate action
**Preconditions:** Active employee row, menu open.
**Steps:**
1. Click "Уволить".

**Expected result:** Terminate confirmation dialog appears.

---

### EMPLOYEES-94: Row action menu – Restore action
**Preconditions:** Terminated employee row, menu open.
**Steps:**
1. Click "Восстановить".

**Expected result:** Restore confirmation dialog appears.

---

## Detail Page Actions Menu

### EMPLOYEES-95: Detail page ⋮ menu – Active employee
**Preconditions:** Active employee detail page.
**Steps:**
1. Click the ⋮ menu in the top-right.

**Expected result:** Menu shows: "Редактировать", a divider, "Уволить" (red).

---

### EMPLOYEES-96: Detail page ⋮ menu – Terminated employee
**Preconditions:** Terminated employee detail page.
**Steps:**
1. Click the ⋮ menu.

**Expected result:** Menu shows: "Редактировать", a divider, "Восстановить" (green).

---

## Cross-Module Reconciliation

### EMPLOYEES-97: Payroll creates a payment record
**Preconditions:** Employee "Бахром" exists. Direct API knowledge (via Swagger or mock).
**Steps:**
1. Create payroll for "Бахром": Amount=1000000, Period="2026-06", Wallet="Касса 1".
2. Via API (GET /api/payments), search for the created payment.
3. Verify the payment type is "Payroll".

**Expected result:** A payment record exists with:
- type = "Payroll"
- amount = 1000000
- walletName = "Касса 1"
- employeeId = Бахром's ID
- employeeName = "Бахром Саидов"
- period = "Июнь 2026" (derived display) or stored as "2026-06"
- direction: checked against the business logic (Expense for salary)

---

### EMPLOYEES-98: Wallet balance decreases after payroll
**Preconditions:** Wallet "Касса 1" has balance=5000000. Create payroll for 1000000.
**Steps:**
1. Create payroll: Amount=1000000 from "Касса 1".
2. Via API (GET /api/wallets/:id), fetch "Касса 1".
3. Check the balance.

**Expected result:** Wallet balance is now 4000000 (5000000 - 1000000). Wallet reconciles with the payment.

---

### EMPLOYEES-99: Payroll immutability (no edit/delete)
**Preconditions:** Payroll payment created and visible in detail page.
**Steps:**
1. On the employee detail page, observe the payroll table row.
2. Try clicking the row (check for detail view or edit modal).
3. Try right-clicking the row for context menu.
4. Check the ⋮ menu in the table row (if any).

**Expected result:** Payroll table rows are not interactive. No edit or delete actions are available. The immutability rule is enforced.

---

### EMPLOYEES-100: Detail page stat "Выплачено за <месяц>" uses current calendar month
**Preconditions:** Employee with payroll history. Current date = June 15, 2026.
**Steps:**
1. Open employee detail page.
2. Observe the middle stat card.

**Expected result:** The stat card is labeled "Выплачено за Июнь" (current month name derived from today's date). The amount is the sum of all payroll payments where the payment date is in June 2026.

---

### EMPLOYEES-101: Payroll with period different from payment date
**Preconditions:** Employee with no payroll.
**Steps:**
1. Create payroll: Period="2026-05" (May), payment date=2026-06-15 (June 15).
2. On the detail page, observe the payroll table row.

**Expected result:** Row displays Period="Май 2026" (derived from the stored period "2026-05"), Date="15.06.2026" (actual payment date). The two are independent.

---

### EMPLOYEES-102: Multiple payroll payments appear in payroll history
**Preconditions:** Employee with 3 payroll payments created at different times.
**Steps:**
1. Open the employee detail page.
2. Observe the payroll table.

**Expected result:** All 3 payments are visible as separate rows, sorted by date (most recent first or per backend order). The stat card "Выплат всего" shows "3".

---

### EMPLOYEES-103: Payroll history is immutable (backend enforces)
**Preconditions:** Payroll record created.
**Steps:**
1. Via API, attempt to PATCH or PUT the payroll record.

**Expected result:** Backend returns 405 Method Not Allowed or 400 Bad Request. Payroll records are immutable (rule 1).

---

### EMPLOYEES-104: Archived wallets are excluded from payroll picker
**Preconditions:** 2 Active wallets, 1 Archived wallet. Employee detail page, payroll modal.
**Steps:**
1. Open payroll modal.
2. Click Wallet dropdown.

**Expected result:** Only 2 Active wallets are shown. Archived wallet is not listed.

---

### EMPLOYEES-105: Employee terminate does not affect payroll history
**Preconditions:** Employee with 2 payroll payments. Terminate the employee.
**Steps:**
1. Terminate the employee.
2. Detail page updates.
3. Observe the payroll section and stat "Выплат всего".

**Expected result:** Payroll history is unchanged. The stat still shows "2" payments. Payroll records persist after termination.

---

## Edge Cases & Error Handling

### EMPLOYEES-106: Navigate to non-existent employee detail page
**Preconditions:** Employee list loaded.
**Steps:**
1. Manually navigate to `/employees/99999` (non-existent ID).

**Expected result:** Page shows a loading spinner briefly, then an error state or empty detail (depending on backend behavior). Or a notification appears: "Ошибка загрузки сотрудника". Back button is still available.

---

### EMPLOYEES-107: Network error during employee list load
**Preconditions:** Simulate network failure or backend down.
**Steps:**
1. Navigate to `/employees` with no connectivity.
2. Observe the list.

**Expected result:** Spinner appears, then error state (empty list). If notification is shown: "Ошибка загрузки сотрудников". List is empty.

---

### EMPLOYEES-108: Network error during payroll creation
**Preconditions:** Payroll modal open, network fails during submit.
**Steps:**
1. Fill the form and click "Сохранить".
2. Simulate network failure mid-request.

**Expected result:** Loading bar stops/disappears. "Сохранить" button re-enables. Error notification: "Не удалось создать выплату". Modal remains open with data preserved.

---

### EMPLOYEES-109: Empty search results with filters
**Preconditions:** 1 employee "Бахром" (Active). Filter by "Уволен", search for "Бахром".
**Steps:**
1. Set Status filter to "Уволен".
2. Search for "Бахром".

**Expected result:** Empty state: "Сотрудники не найдены". Both filters are active, no employee matches.

---

### EMPLOYEES-110: Very long employee name in list
**Preconditions:** Employee with name="Очень Длинное Полное Имя Сотрудника С Много Символов Которое Не Влезет В Строку".
**Steps:**
1. View the employee on the list.

**Expected result:** Name is displayed and truncated or wrapped to fit the column (no horizontal overflow). Text is readable. Avatar initials are derived from the name correctly.

---

### EMPLOYEES-111: All contact fields filled with max-length values
**Preconditions:** Create/edit modal open.
**Steps:**
1. Fill all contact fields (Email, Telegram, Address) with 250-character strings.
2. Add 2 phone numbers, each valid.
3. Click "Сохранить".

**Expected result:** Form submits successfully. All fields are saved and visible on the detail page.

---

### EMPLOYEES-112: Salary = 0
**Preconditions:** Create employee modal.
**Steps:**
1. Enter all required fields except Salary. Leave Salary = 0.
2. Click "Сохранить".

**Expected result:** Validation error: "Зарплата должна быть положительной". Form does not submit.

---

### EMPLOYEES-113: Multiple phone numbers – one invalid
**Preconditions:** Create modal open, add 2 phone numbers. First is valid (+998901234567), second is invalid (12).
**Steps:**
1. Click "Сохранить".

**Expected result:** Error appears under the second phone field: "Неверный формат номера телефона". Form does not submit.

---

### EMPLOYEES-114: Remove a phone number from the list
**Preconditions:** Edit modal for employee with 2 phone numbers.
**Steps:**
1. In the Phone Numbers field, click the delete/remove icon on one phone.
2. Click "Сохранить".

**Expected result:** Modal closes, notification "Сотрудник успешно обновлен". Detail page shows only 1 phone number.

---

## Key Designed Gaps (Not Bugs)

### EMPLOYEES-115: No avatar image upload
**Note:** The detail page shows initials in an avatar circle. There is no image-upload field in the create/edit form. Avatars are derived from initials only.

---

### EMPLOYEES-116: No hard-delete of employees
**Note:** The delete action (hard remove from the database) is not exposed in the UI. Employees are managed via status (Active/OnVacation/Terminated). A terminated employee can be restored.

---

### EMPLOYEES-117: Payroll history period is server-derived, not a choice
**Note:** The "Period" field in the payroll form is a month picker. The backend stores the period as "YYYY-MM". The display label (e.g., "Июнь 2026") is derived from the date or the period token on the detail page.

---

### EMPLOYEES-118: No bulk payroll operation
**Note:** Payroll is created one at a time per employee. There is no bulk "pay all" or batch create feature.

---

