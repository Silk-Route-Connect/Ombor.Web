# Payments Module — Manual Browser Test Cases

**Scope:** app.miraziz.net frontend + api.miraziz.net backend (MOCKS OFF, tenant starts empty).
**Contract authority:** https://api.miraziz.net/swagger/v1/swagger.json
**Module:** `/payments` (Платежи) — standalone payment flow outside New Sale/Supply inline settlement.

---

## Test Setup & Preconditions

- **Empty tenant:** All data is created fresh during testing.
- **Wallets:** Create at least 2 test wallets (Касса type) via `/wallets` before payment tests.
- **Partners:** Create at least 2-3 test partners (Customer + Supplier types) via `/partners`.
- **Employees:** Create 1-2 test employees via `/employees` for payroll tests.
- **Transactions (for settlement):** Create 1-2 test Sales and 1-2 test Supplies via `/sales/new` and `/supplies/new` to populate outstanding debts.
- **Advance balance:** Ensure at least one partner has an advance (created by a prior Payment with overage that rolls to advance).

---

## Test Cases

### PAYMENTS-01 | List View — Empty State
**Precondition:** Tenant has no payments.
**Steps:**
1. Navigate to `/payments`.
2. Observe the page render.

**Expected result:**
- Header shows title "Платежи" with action buttons "Экспорт" (disabled state OK, or just renders) and "Новый платёж" (primary).
- Below: Search input ("Поиск по номеру, партнёру или сотруднику…"), Type dropdown ("Все типы"), Wallet dropdown ("Все кассы").
- Summary strip shows three cards: Приход (0 UZS), Расход (0 UZS), Платежей (0).
- Table displays empty state: icon + "Пока нет платежей" heading + "Проведите первый платёж…" body text.
- No loading spinner.

**Reconciliation:** —
**Designed gap:** None.

---

### PAYMENTS-02 | List View — Search by Payment Number
**Precondition:** At least 1 payment exists (create via PAYMENTS-05 first).
**Steps:**
1. On `/payments` list, enter a payment number (e.g., "P-1") in the search field.
2. Observe the filtered result.
3. Clear the search.

**Expected result:**
- Table filters in real-time to show only matching payment numbers.
- If no match, empty search state shows: "Платежи не найдены" + "Измените запрос поиска…".
- Clearing the search restores all payments.

**Reconciliation:** —
**Designed gap:** None.

---

### PAYMENTS-03 | List View — Type Filter
**Precondition:** At least 1 payment of each type exists.
**Steps:**
1. On `/payments`, click the Type dropdown.
2. Select each type: Оплата, Депозит, Вывод, Зарплата, Общий, then Все типы.
3. Observe the table updates.

**Expected result:**
- Each type filters the table to show only that payment type.
- The dropdown label changes to show the selected type name.
- Summary strip (Приход/Расход/count) updates to reflect only visible payments.
- "Все типы" restores the full list.

**Reconciliation:** Summary strip totals match the sum of displayed rows' amounts.
**Designed gap:** None.

---

### PAYMENTS-04 | List View — Wallet Filter
**Precondition:** Payments exist across ≥2 different wallets.
**Steps:**
1. On `/payments`, click the Wallet dropdown.
2. Select each wallet in the list, then Все кассы.
3. Observe the table updates.

**Expected result:**
- Table filters to show only payments from the selected wallet.
- The dropdown label shows the selected wallet name.
- Summary strip totals update.
- "Все кассы" shows all payments.

**Reconciliation:** All visible rows' walletName matches the filter selection (or all wallets when "Все").
**Designed gap:** None.

---

### PAYMENTS-05 | Create — Transaction (Оплата) with Manual Settlement
**Precondition:** 
- 2+ wallets exist.
- 1+ Customer partners exist.
- 1+ outstanding Sales to the partner (from `/sales/new`).

**Steps:**
1. Navigate to `/payments`, click "Новый платёж".
2. In the modal, select Type = Оплата (Transaction).
3. Select a Partner with outstanding transactions (e.g., Customer A).
4. Observe the displayed balance and advance.
5. Select a Wallet.
6. Enter an Amount (e.g., 500,000 UZS) that is less than or equal to the total outstanding.
7. Click "Распределить и провести".
8. The Settlement modal opens.
9. In the settlement modal:
   - Verify the list shows the outstanding transactions (date, sale #, total, paid, remaining).
   - Manually uncheck one transaction and adjust allocations on others.
   - Leave some amount unallocated (excess will become advance).
10. Click "Провести платёж".

**Expected result:**
- Create modal closes.
- List refreshes, shows the new Payment P-N with:
  - Type badge = teal "Оплата".
  - Direction badge = green "↓ Приход".
  - Party = Partner A.
  - Wallet = selected wallet.
  - Amount in green.
- Summary strip updated: income increased.
- No errors on the page.

**Reconciliation:**
- Navigate to the partner detail (`/partners/{id}`) → "Платежи" tab → verify the new payment is listed.
- Partner balance moved by the settled amount.
- Open the payment detail → "Распределение" card shows settlement allocations (e.g., "Продажа #N" with amount) + any advance surplus.

**Designed gap:** None.

---

### PAYMENTS-06 | Create — Transaction (Оплата) with Auto-Allocation (FIFO)
**Precondition:** Same as PAYMENTS-05.
**Steps:**
1. Navigate to `/payments`, click "Новый платёж".
2. Type = Оплата, Partner with ≥2 outstanding transactions.
3. Select wallet, Amount (e.g., 700,000 UZS).
4. Click "Распределить и провести" → Settlement modal opens.
5. Click "Авто (по порядку)".
6. Verify allocations auto-populate FIFO (oldest outstanding first).
7. Click "Провести платёж".

**Expected result:**
- Settlement auto-fills rows in date order (FIFO).
- Excess amount shown in "В аванс" field updates correctly.
- Payment is created and appears in the list.

**Reconciliation:**
- Open payment detail → "Распределение" shows the same FIFO order.
- Partner's first transactions are marked fully paid, second is partial or empty if full overage.

**Designed gap:** None.

---

### PAYMENTS-07 | Create — Transaction (Оплата) with Excess Becoming Advance
**Precondition:** Partner with open transactions totaling <500,000 UZS.
**Steps:**
1. Create a new Оплата payment for the partner.
2. Amount = 1,000,000 UZS (excess).
3. In settlement modal, allocate the full outstanding (~500,000) and leave remainder.
4. Click "Провести платёж".

**Expected result:**
- Payment created.
- Settlement modal showed: "К распределению" = 1,000,000, "Распределено" = 500,000, "В аванс" = 500,000.
- "В аванс" field displays the excess amount and a note: "Зачислится как аванс партнёра".
- Payment detail → "Распределение" includes a row with "Аванс партнёра" type showing the 500,000 advance.

**Reconciliation:**
- Partner's advance balance increases by 500,000.
- Partner balance (after settling 500,000 debt) shows net change.

**Designed gap:** None.

---

### PAYMENTS-08 | Create — Deposit (Депозит) — No Partner Required
**Precondition:** 1+ wallets exist.
**Steps:**
1. Navigate to `/payments`, click "Новый платёж".
2. Type = Депозит.
3. Observe: no Partner picker is shown.
4. Select a Wallet.
5. Enter an Amount.
6. Click "Провести платёж".

**Expected result:**
- Payment created.
- List shows new Депозит with:
  - Type badge = blue "Депозит".
  - Direction = "↓ Приход" (Income, auto-derived).
  - Party = empty (shows "—").
  - Amount in green.
- Summary strip: income increased.

**Reconciliation:**
- Payment detail → "Касса" card shows a single wallet source.
- Wallet's operations ledger (`/wallets/{id}` → Операции tab) includes the payment (type chip "Депозит", direction Приход).
- Wallet balance increased by the amount.

**Designed gap:** None.

---

### PAYMENTS-09 | Create — Withdrawal (Вывод) — Advance Return
**Precondition:** 1+ partner with advance balance ≥ 500,000 UZS (create via prior Transaction payment with overage).
**Steps:**
1. Navigate to `/payments`, click "Новый платёж".
2. Type = Вывод.
3. Select a Partner with advance.
4. Observe: balance + advance are shown.
5. Select a Wallet.
6. Enter Amount = 300,000 UZS (less than advance).
7. Click "Провести платёж".

**Expected result:**
- Payment created.
- Type badge = saffron "Вывод".
- Direction = "↑ Расход" (Expense).
- Amount in red.
- Summary strip: expense increased.

**Reconciliation:**
- Partner's advance decreased by 300,000.
- Payment detail → "Возврат аванса" card shows: "Возврат аванса партнёру" + amount.

**Designed gap:** None.

---

### PAYMENTS-10 | Create — Withdrawal Over-Advance (Blocked)
**Precondition:** Partner with advance = 200,000 UZS.
**Steps:**
1. Navigate to `/payments`, click "Новый платёж".
2. Type = Вывод.
3. Select the partner.
4. Select wallet, Amount = 300,000 UZS (exceeds advance).
5. Click "Провести платёж" (submit button).

**Expected result:**
- Form shows inline error below the Amount field: "Аванс партнёра: 200 000 UZS. Нельзя вывести больше."
- An error banner appears at the top: "Проверьте отмеченные поля перед проведением."
- Submit button remains enabled (hard rule).
- Payment is NOT created.

**Reconciliation:** —
**Designed gap:** None.

---

### PAYMENTS-11 | Create — Payroll (Зарплата)
**Precondition:** 1+ employee exists with salary = 5,000,000 UZS.
**Steps:**
1. Navigate to `/payments`, click "Новый платёж".
2. Type = Зарплата.
3. Observe: Employee picker (required) and Period (required) appear.
4. Select an employee.
5. Observe: Amount field auto-fills with the employee's salary.
6. Select Period month/year.
7. Select a Wallet.
8. Click "Провести платёж".

**Expected result:**
- Payment created.
- Type badge = purple "Зарплата".
- Direction = "↑ Расход" (auto, Expense).
- Party = employee name.
- Amount = employee salary.
- Summary strip: expense increased.

**Reconciliation:**
- Payment detail → "Зарплата" card shows: employee name, position, period, salary, paid amount.
- Employee detail (`/employees/{id}`) → "Выплаты" tab includes the new payment.

**Designed gap:** None.

---

### PAYMENTS-12 | Create — Payroll Multiple Times Same Employee+Month (Allowed)
**Precondition:** Payroll payment already created for Employee A in June 2026.
**Steps:**
1. Navigate to `/payments`, create a second Payroll payment for the same employee, same month.
2. Verify the form allows the creation.
3. Submit.

**Expected result:**
- Payment created (no one-per-month block).
- List shows two Payroll entries for the same employee+period.

**Reconciliation:**
- Employee detail → "Выплаты" tab shows both payments for June 2026.

**Designed gap:** None (canon: no one-per-month limit).

---

### PAYMENTS-13 | Create — General (Общий) with Expense Direction
**Precondition:** 1+ wallets exist.
**Steps:**
1. Navigate to `/payments`, click "Новый платёж".
2. Type = Общий.
3. Observe: Direction picker appears (required) with "Приход" / "Расход" toggle.
4. Select Direction = "Расход".
5. Observe: Description field appears (required).
6. Enter Description = "Аренда офиса".
7. Select Wallet.
8. Enter Amount.
9. Click "Провести платёж".

**Expected result:**
- Payment created.
- Type badge = gray "Общий".
- Direction badge = red "↑ Расход".
- No party shown (displays "—").
- Amount in red.

**Reconciliation:**
- Payment detail → "Описание" card shows: "Аренда офиса".

**Designed gap:** None.

---

### PAYMENTS-14 | Create — General (Общий) with Income Direction
**Precondition:** 1+ wallets exist.
**Steps:**
1. Navigate to `/payments`, click "Новый платёж".
2. Type = Общий.
3. Select Direction = "Приход".
4. Enter Description.
5. Select Wallet, Amount.
6. Click "Провести платёж".

**Expected result:**
- Payment created with direction green "↓ Приход".
- Amount in green.
- Summary strip: income increased.

**Reconciliation:** —
**Designed gap:** None.

---

### PAYMENTS-15 | Create — General with Missing Description (Validation)
**Precondition:** —
**Steps:**
1. Navigate to `/payments`, click "Новый платёж".
2. Type = Общий.
3. Select Direction, Wallet, Amount.
4. Leave Description empty.
5. Click "Провести платёж".

**Expected result:**
- Error banner shows: "Проверьте отмеченные поля перед проведением."
- Description field shows inline error: "Укажите описание платежа".
- Payment is NOT created.

**Reconciliation:** —
**Designed gap:** None.

---

### PAYMENTS-16 | Create — Validation — Amount Required
**Precondition:** —
**Steps:**
1. Open create modal, select Type = Депозит.
2. Select Wallet.
3. Leave Amount empty (0 or blank).
4. Click "Провести платёж".

**Expected result:**
- Error banner shows.
- Amount field shows inline error: "Введите сумму платежа".
- Payment is NOT created.

**Reconciliation:** —
**Designed gap:** None.

---

### PAYMENTS-17 | Create — Validation — Wallet Required
**Precondition:** No wallets exist (or simulated by not selecting one).
**Steps:**
1. Open create modal, Type = Депозит.
2. Leave Wallet unselected.
3. Enter Amount.
4. Click "Провести платёж".

**Expected result:**
- Error banner shows.
- Wallet field shows inline error: "Выберите кассу".
- Payment is NOT created.

**Reconciliation:** —
**Designed gap:** None.

---

### PAYMENTS-18 | Create — Partner Balance Display
**Precondition:** Partner with balance = 1,500,000 UZS (receivable, positive), advance = 100,000 UZS.
**Steps:**
1. Open create modal, Type = Оплата.
2. Select the partner.
3. Observe the info box below the partner picker.

**Expected result:**
- Info box shows:
  - Partner type chip ("Клиент" / "Поставщик" / "Оба").
  - "Баланс:" label + amount in green (receivable is positive, success color) = "1 500 000 UZS".
  - "Аванс:" label + amount = "100 000 UZS".

**Reconciliation:** Balances match the partner detail `/partners/{id}`.
**Designed gap:** None.

---

### PAYMENTS-19 | Create — Direction Auto-Derived (Transaction Type)
**Precondition:** Partner type = Customer.
**Steps:**
1. Open create modal, Type = Оплата.
2. Select a Customer partner.
3. Observe: no Direction picker appears.

**Expected result:**
- Direction is auto-derived based on partner type.
- No Direction toggle is shown in the form.
- The effective direction is used internally for settlement direction determination.

**Reconciliation:**
- Payment created; the direction matches the partner type logic (Customer + Transaction → Income).

**Designed gap:** None (per business-rules rule 14: direction auto-derives for Transaction based on partner type; "Оба" partners require explicit direction choice).

---

### PAYMENTS-20 | Create — Direction Choice (Both Partner Type)
**Precondition:** Partner type = Оба (Both).
**Steps:**
1. Open create modal, Type = Оплата or Deposit or Withdrawal.
2. Select a partner of type "Оба".
3. Observe: Direction picker appears (required), labeled "Направление (партнёр типа «Оба»)".
4. Toggle between "Приход" and "Расход".
5. Select one direction, then submit.

**Expected result:**
- Direction picker is visible and usable.
- The form respects the selected direction.
- Payment is created with the chosen direction.

**Reconciliation:**
- Payment badge shows the chosen direction.

**Designed gap:** None.

---

### PAYMENTS-21 | Create — Modal Unsaved Changes Guard
**Precondition:** —
**Steps:**
1. Open create modal, Type = Депозит.
2. Select a Wallet, enter Amount.
3. Click the Close (X) button on the modal.

**Expected result:**
- A confirmation dialog appears: "Отменить изменения?" with "Отменить" and "Назад" buttons.
- Clicking "Отменить" closes the modal.
- Clicking "Назад" returns to the form.

**Reconciliation:** —
**Designed gap:** None.

---

### PAYMENTS-22 | Create — Form Loading State
**Precondition:** —
**Steps:**
1. Open create modal (first time from the page).
2. Observe the initial render while form-data loads.

**Expected result:**
- Form fields show briefly in a loading state or remain populated from cache if already loaded.
- If first time, the create modal may render with "loading" dropdowns or disabled state until `/api/payments/form-data` returns.
- Once loaded, all selectors are enabled.

**Reconciliation:** —
**Designed gap:** None.

---

### PAYMENTS-23 | Detail View — Full Payment Inspection (Transaction Type)
**Precondition:** A Transaction payment exists with settlements and excess advance.
**Steps:**
1. On `/payments` list, click a Transaction payment row.
2. Navigate to its detail page `/payments/{id}`.
3. Inspect all sections.

**Expected result:**
- Header: breadcrumb "Платежи › P-N", back button, title "P-N · Платёж", immutability note.
- Left column:
  - "Касса" card: single wallet source with amount, type badge.
  - "Распределение" table: rows for each allocation (TransactionSettlement, AdvanceCredit, ChangeReturn). Each row shows allocation type, target (e.g., "Продажа #123"), amount. Settlement rows are clickable links to the sale/supply detail.
  - Footer of allocation card: "Распределено: <total UZS>".
- Right column: "Информация" card with:
  - Partner name (clickable → partner detail).
  - Type, Direction, Wallet, Created By, Date.

**Reconciliation:**
- Allocations sum to the payment amount.
- Partner link navigates to partner detail and shows the payment in the partner's "Платежи" tab.

**Designed gap:** None.

---

### PAYMENTS-24 | Detail View — Payroll Payment
**Precondition:** A Payroll payment exists.
**Steps:**
1. Click the payment row → detail page.

**Expected result:**
- Left column shows: "Зарплата" (Payroll) card instead of allocation, with grid:
  - Employee name, Position (first row).
  - Period (e.g., "Июнь 2026"), Salary (second row).
  - Paid amount spanning the full width, labeled "Выплачено", color = success (green).
- Остальные карточки as usual (Касса, Информация).

**Reconciliation:** —
**Designed gap:** None.

---

### PAYMENTS-25 | Detail View — General Payment
**Precondition:** A General payment exists.
**Steps:**
1. Click the payment row → detail page.

**Expected result:**
- Left column shows: "Описание" (General) card with the free-text description (e.g., "Аренда офиса").
- No allocation card (Общий payments do not have allocations).
- Касса and Информация cards present.

**Reconciliation:** —
**Designed gap:** None.

---

### PAYMENTS-26 | Detail View — Withdrawal Payment
**Precondition:** A Withdrawal payment exists.
**Steps:**
1. Click the payment row → detail page.

**Expected result:**
- Left column shows: "Возврат аванса" card with a single line: "Возврат аванса партнёру" + amount (red).
- No allocation table.
- Касса and Информация cards present.

**Reconciliation:** —
**Designed gap:** None.

---

### PAYMENTS-27 | Detail View — Deposit Payment (No Allocations)
**Precondition:** A Deposit payment exists.
**Steps:**
1. Click the payment row → detail page.

**Expected result:**
- Left column: "Касса" card only (single source).
- No allocation card (Deposits do not allocate).
- No special type card (e.g., no Payroll, General, or Withdrawal card).
- Right column: "Информация" card (Party = empty "—").

**Reconciliation:** —
**Designed gap:** None.

---

### PAYMENTS-28 | Detail View — Allocation Link to Sale
**Precondition:** A Transaction payment with a settlement to a Sale exists.
**Steps:**
1. On payment detail, in the Распределение card, locate a row with allocationType = TransactionSettlement and transactionType = Sale.
2. Click the target link (e.g., "Продажа #456").

**Expected result:**
- Navigates to `/sales/456` (the sale detail page).
- No errors.

**Reconciliation:** —
**Designed gap:** None.

---

### PAYMENTS-29 | Detail View — Allocation Link to Supply
**Precondition:** A Transaction payment with a settlement to a Supply exists.
**Steps:**
1. On payment detail, in Распределение card, click a "Поставка #N" link.

**Expected result:**
- Navigates to `/supplies/{id}`.

**Reconciliation:** —
**Designed gap:** None.

---

### PAYMENTS-30 | Detail View — Partner Link
**Precondition:** A payment with an associated partner exists.
**Steps:**
1. On payment detail, in the "Информация" card, click the partner name link.

**Expected result:**
- Navigates to `/partners/{id}`.
- The partner detail page loads.

**Reconciliation:** Partner detail "Платежи" tab shows this payment in the history.
**Designed gap:** None.

---

### PAYMENTS-31 | Detail View — Immutability Message
**Precondition:** Any payment detail page.
**Steps:**
1. Observe the info banner below the header.

**Expected result:**
- Blue info banner displays: "Платёж проведён окончательно — изменить или удалить нельзя."
- No edit button, no delete button, no row actions.

**Reconciliation:** —
**Designed gap:** Payment reverse/correction is deferred (out of MVP); rule 1 enforced.

---

### PAYMENTS-32 | Detail View — Back Navigation
**Precondition:** On a payment detail page.
**Steps:**
1. Click the breadcrumb "Платежи" link or the back button (chevron).

**Expected result:**
- Navigates back to `/payments` list.
- List view is restored with the same filters/search as before (if supported by store state).

**Reconciliation:** —
**Designed gap:** None.

---

### PAYMENTS-33 | CSV Export — Empty List
**Precondition:** All payments filtered to empty (e.g., search for non-existent payment).
**Steps:**
1. On `/payments` list (empty after filter), click "Экспорт".

**Expected result:**
- CSV file downloaded with headers only (no data rows).
- Filename: `payments_<date-stamp>.csv`.

**Reconciliation:** —
**Designed gap:** None.

---

### PAYMENTS-34 | CSV Export — Full List
**Precondition:** ≥3 payments exist of different types and directions.
**Steps:**
1. On `/payments` list, click "Экспорт".
2. Open the downloaded CSV in a spreadsheet app.

**Expected result:**
- CSV contains columns: № (number), Дата (date), Тип (type label, e.g., "Оплата"), Направление (direction label, e.g., "Приход"), Партнёр / Сотрудник, Касса (wallet), Сумма (amount).
- Each payment row populates correctly.
- Amounts are numeric (no currency symbols in the cell).
- All visible rows are included (respects active filters).

**Reconciliation:**
- Row count matches the visible list.
- Amount values match the displayed amounts.

**Designed gap:** None.

---

### PAYMENTS-35 | CSV Export — Filtered List
**Precondition:** ≥3 payments exist; filter to Type = Зарплата.
**Steps:**
1. On `/payments`, filter Type = "Зарплата".
2. Click "Экспорт".
3. Open the CSV.

**Expected result:**
- CSV includes only Payroll rows.
- All other payment types are excluded.

**Reconciliation:** CSV row count = list visible row count.
**Designed gap:** None.

---

### PAYMENTS-36 | List — Column Alignment & Formatting
**Precondition:** ≥3 payments exist.
**Steps:**
1. On `/payments` list, observe the table columns.

**Expected result:**
- № (number): left-aligned, numeric font, teal color (primary.main), bold.
- Дата: center/right-aligned, numeric font, secondary color.
- Тип: left-aligned, type badge (colored pill).
- Направление: left-aligned, direction badge (green/red pill with ↓/↑ symbol).
- Партнёр/Сотрудник: left-aligned, bold if populated, "—" if empty, secondary color.
- Касса: left-aligned, with small wallet icon, secondary text for name.
- Сумма: right-aligned, numeric font, bold, green (success.main) for Income / red (error.main) for Expense.

**Reconciliation:** —
**Designed gap:** None.

---

### PAYMENTS-37 | List — Row Hover Interaction
**Precondition:** ≥1 payment exists.
**Steps:**
1. On `/payments` list, hover over a payment row.

**Expected result:**
- Row background color changes (light gray highlight, designTokens.gray25).
- Cursor becomes pointer (clickable).
- No row action buttons appear (immutable, no edit/delete affordances).

**Reconciliation:** —
**Designed gap:** None.

---

### PAYMENTS-38 | List — Row Click Navigation
**Precondition:** ≥1 payment exists.
**Steps:**
1. On `/payments` list, click any payment row.

**Expected result:**
- Navigates to `/payments/{id}` detail page.
- Detail page loads and renders payment information.

**Reconciliation:** —
**Designed gap:** None.

---

### PAYMENTS-39 | List — Type Badge Styling (All 5 Types)
**Precondition:** ≥1 payment of each type exists: Transaction, Deposit, Withdrawal, Payroll, General.
**Steps:**
1. On `/payments` list, observe the Type badges.

**Expected result:**
- Transaction (Оплата): teal badge with "Оплата" text.
- Deposit (Депозит): blue badge with "Депозит" text.
- Withdrawal (Вывод): saffron/orange badge with "Вывод" text.
- Payroll (Зарплата): purple badge with "Зарплата" text.
- General (Общий): gray badge with "Общий" text.

**Reconciliation:** Colors match PAYMENT_TYPE_META in PaymentPresentation.tsx.
**Designed gap:** None.

---

### PAYMENTS-40 | List — Direction Badge Styling
**Precondition:** ≥1 Income and ≥1 Expense payment exist.
**Steps:**
1. On `/payments` list, observe Direction badges.

**Expected result:**
- Income (Приход): green badge, downward arrow "↓", text "Приход".
- Expense (Расход): red badge, upward arrow "↑", text "Расход".
- No +/− signs (locked pattern 4).

**Reconciliation:** —
**Designed gap:** None.

---

### PAYMENTS-41 | Summary Strip — Income Calculation
**Precondition:** ≥2 Income payments (Deposit, Transaction settlements, General Income) totaling 3,000,000 UZS.
**Steps:**
1. On `/payments` list, observe the "Приход" card.

**Expected result:**
- Displays icon (downward green arrow) + caption "Приход" + value "3 000 000 UZS" in green.

**Reconciliation:**
- Manual sum of all visible Income payment amounts = displayed value.

**Designed gap:** None.

---

### PAYMENTS-42 | Summary Strip — Expense Calculation
**Precondition:** ≥2 Expense payments (Withdrawal, Payroll, General Expense) totaling 2,500,000 UZS.
**Steps:**
1. On `/payments` list, observe the "Расход" card.

**Expected result:**
- Displays icon (upward red arrow) + caption "Расход" + value "2 500 000 UZS" in red.

**Reconciliation:**
- Manual sum of all visible Expense amounts = displayed value.

**Designed gap:** None.

---

### PAYMENTS-43 | Summary Strip — Count Calculation
**Precondition:** ≥5 payments exist (any types/directions).
**Steps:**
1. On `/payments` list, observe the "Платежей" card.

**Expected result:**
- Displays icon (receipt) + caption "Платежей" + value "5" (or the actual count).

**Reconciliation:**
- Count matches the number of rows in the visible list.

**Designed gap:** None.

---

### PAYMENTS-44 | Summary Strip — Updates with Filters
**Precondition:** ≥5 payments; Type = All, Wallet = All.
**Steps:**
1. Observe summary strip totals.
2. Apply Type filter = "Зарплата".
3. Observe summary strip again.

**Expected result:**
- After filter, summary strip shows only Payroll payments' totals (income/expense/count).
- Cleared filter restores full summary.

**Reconciliation:**
- Summary income/expense reflect only the filtered payment types.

**Designed gap:** None.

---

### PAYMENTS-45 | Search & Filter Combination
**Precondition:** ≥5 payments across multiple types and wallets.
**Steps:**
1. Enter a search term (e.g., partner name "John").
2. Select Type = "Оплата".
3. Select Wallet = "Касса 1".
4. Observe the list.

**Expected result:**
- Table filters to show only payments matching ALL criteria: number/partner/employee contains "John" AND type is "Оплата" AND wallet is "Касса 1".
- Summary strip reflects only matching rows.

**Reconciliation:** —
**Designed gap:** None.

---

### PAYMENTS-46 | Create Modal — Loading Reference Data
**Precondition:** —
**Steps:**
1. Navigate to `/payments`.
2. Click "Новый платёж" for the first time in the session.
3. Observe the modal render.

**Expected result:**
- Modal opens quickly.
- Selectors (Partner, Employee, Wallet) populate with data from `/api/payments/form-data`.
- No loading spinners unless data is delayed (network-dependent).

**Reconciliation:** —
**Designed gap:** None.

---

### PAYMENTS-47 | Settlement Modal — Outstanding Transactions List
**Precondition:** A partner has 2 outstanding transactions (1 Sale, 1 Supply) with remaining balances.
**Steps:**
1. Create a Transaction payment for the partner.
2. On settlement modal, observe the table.

**Expected result:**
- Table shows one row per outstanding transaction.
- Columns: checkbox (for allocation toggle), date, transaction (e.g., "#123 · Продажа"), total (e.g., "500 000"), paid (e.g., "100 000"), remaining (e.g., "400 000"), allocate (input field).
- All rows are initially **checked** (on = true) and auto-populated with FIFO amounts.

**Reconciliation:**
- Transactions are sorted by date (FIFO order).
- Remaining amounts match the partner's outstanding detail (if accessible).

**Designed gap:** None.

---

### PAYMENTS-48 | Settlement Modal — Toggle Row Allocation
**Precondition:** Settlement modal with ≥2 outstanding rows.
**Steps:**
1. On settlement modal, uncheck the checkbox for the second row.
2. Observe the allocation input and summary.

**Expected result:**
- Row becomes dimmed (opacity ~0.5).
- "Распределить" (allocate) input for the unchecked row disables (grayed).
- "К распределению", "Распределено", "В аванс" totals recalculate.
- The unchecked row's remaining amount is excluded from "Распределено".

**Reconciliation:**
- Distributed + To Advance = Total to Distribute.

**Designed gap:** None.

---

### PAYMENTS-49 | Settlement Modal — Manual Allocation Adjustment
**Precondition:** Settlement modal with 1 outstanding transaction of 500,000 UZS remaining.
**Steps:**
1. In the "Распределить" input for the row, clear the auto-filled value.
2. Type "250000".
3. Observe the summary.

**Expected result:**
- "Распределено" = 250,000 (only this row's allocation).
- "В аванс" = 750,000 (the remainder of the payment amount).
- Input capping: if you try to type a value > remaining for the row, it is capped to max(rowRemaining, paymentRemaining - others).

**Reconciliation:**
- Distributed + Advance = Total amount.

**Designed gap:** None.

---

### PAYMENTS-50 | Settlement Modal — Over-Allocation Prevention
**Precondition:** Settlement modal, payment amount = 1,000,000, outstanding row remaining = 800,000.
**Steps:**
1. Attempt to allocate 900,000 to the row (manually or via input).
2. Observe the input behavior.

**Expected result:**
- Input rejects the overallocation.
- The value is capped to 800,000 (the row's remaining amount).
- No error message; the input silently clamps to the valid range.

**Reconciliation:** —
**Designed gap:** None.

---

### PAYMENTS-51 | Settlement Modal — Auto-Allocate Button (FIFO Reset)
**Precondition:** Settlement modal with manual allocations edited.
**Steps:**
1. Manually adjust allocations (uncheck rows, change amounts).
2. Click "Авто (по порядку)" button.

**Expected result:**
- All allocations reset to FIFO auto-distribution (oldest transaction first).
- All rows re-enabled (checked).
- Summary recalculates.

**Reconciliation:** —
**Designed gap:** None.

---

### PAYMENTS-52 | Settlement Modal — Empty Outstanding (No Debts)
**Precondition:** A partner with NO outstanding transactions.
**Steps:**
1. Create a Transaction payment for the partner.
2. Settlement modal opens.

**Expected result:**
- No table rows.
- Success message: "Открытых долгов нет" + "Вся сумма будет записана как аванс партнёра."
- "К распределению" = payment amount, "Распределено" = 0, "В аванс" = full payment amount.
- No "Авто (по порядку)" button (or disabled).

**Reconciliation:** —
**Designed gap:** None.

---

### PAYMENTS-53 | Settlement Modal — Confirm & Create Payment
**Precondition:** Settlement modal with confirmed allocations.
**Steps:**
1. Review the summary (Distribution, Advance).
2. Click "Провести платёж".

**Expected result:**
- Modal closes.
- Payment is created and appears in the list.
- Allocations are stored in the PaymentRecord.allocations array.

**Reconciliation:**
- Payment detail → "Распределение" card shows the allocations exactly as configured.

**Designed gap:** None.

---

### PAYMENTS-54 | Settlement Modal — Back Without Saving
**Precondition:** Settlement modal with manual allocations.
**Steps:**
1. Click "Назад" button (or close button).

**Expected result:**
- Modal closes without saving.
- Returns to the create modal.
- Allocation state is lost (user can re-enter settlement by clicking "Распределить и провести" again).

**Reconciliation:** —
**Designed gap:** None.

---

### PAYMENTS-55 | Reconciliation — Transaction Payment Reduces Partner Outstanding
**Precondition:** Partner A with outstanding Sale #100 (remaining 500,000 UZS).
**Steps:**
1. Create a Transaction payment for Partner A, Amount = 500,000, settle fully to Sale #100.
2. Navigate to `/debts` → "По транзакциям" tab.
3. Find Sale #100.

**Expected result:**
- Sale #100's remaining balance = 0.
- Progress bar (paid/total) shows 100%.
- "Остаток" column = 0.

**Reconciliation:**
- Transaction detail (`/sales/100`) → "Платежи" tab shows the new Payment P-N.
- Partner detail (`/partners/{id}`) → balance = original + (sale debt settled).

**Designed gap:** None.

---

### PAYMENTS-56 | Reconciliation — Deposit Increases Wallet Balance
**Precondition:** Wallet "Cash Box" has balance = 1,000,000 UZS.
**Steps:**
1. Create a Deposit payment, amount = 500,000 UZS, wallet = Cash Box.
2. Navigate to wallet detail (`/wallets/{id}`).

**Expected result:**
- Wallet balance = 1,500,000 UZS (1,000,000 + 500,000).
- Операции ledger includes the payment (type chip "Депозит", direction "Приход", amount = 500,000).

**Reconciliation:** —
**Designed gap:** None.

---

### PAYMENTS-57 | Reconciliation — Withdrawal Decreases Partner Advance & Wallet Balance
**Precondition:** 
- Partner A advance = 200,000 UZS.
- Wallet "Cash Box" = 800,000 UZS.

**Steps:**
1. Create a Withdrawal payment for Partner A, amount = 100,000, wallet = Cash Box.
2. Check partner balance on `/partners/{id}`.
3. Check wallet balance on `/wallets/{id}`.

**Expected result:**
- Partner A advance = 100,000 UZS (200,000 - 100,000).
- Wallet balance = 900,000 UZS (800,000 + 100,000, since Withdrawal is Expense/outflow from our perspective but adds cash to wallet).

**Reconciliation:** Wallet ledger shows the Withdrawal with direction "Расход".
**Designed gap:** None.

---

### PAYMENTS-58 | Reconciliation — Payroll Expense Decreases Wallet & Creates Payroll Record
**Precondition:** Employee A salary = 5,000,000, Wallet = 2,000,000.
**Steps:**
1. Create Payroll payment for Employee A, amount = 5,000,000.
2. Check employee detail.
3. Check wallet balance.

**Expected result:**
- Wallet balance decreased by 5,000,000 (may be negative if overpayment; tested separately).
- Employee detail → "Выплаты" tab includes the payment.

**Reconciliation:** —
**Designed gap:** None.

---

### PAYMENTS-59 | Reconciliation — General Income (Expense) Updates Wallet
**Precondition:** Wallet balance = 1,000,000.
**Steps:**
1. Create General payment, Direction = "Приход", amount = 300,000.
2. Check wallet balance.

**Expected result:**
- Wallet balance = 1,300,000 (1,000,000 + 300,000).

**Reconciliation:**
- Wallet ledger shows the payment as "Приход" direction.

**Designed gap:** None.

---

### PAYMENTS-60 | Reconciliation — General Expense Withdraws Wallet
**Precondition:** Wallet balance = 1,000,000.
**Steps:**
1. Create General payment, Direction = "Расход", amount = 200,000.
2. Check wallet balance.

**Expected result:**
- Wallet balance = 800,000 (1,000,000 - 200,000).

**Reconciliation:**
- Wallet ledger shows "Расход" direction.

**Designed gap:** None.

---

### PAYMENTS-61 | Create Modal — Partner Picker Displays Type Labels
**Precondition:** Multiple partners of different types exist (Customer, Supplier, Both).
**Steps:**
1. Open create modal, Type = Оплата.
2. Click the Partner dropdown.

**Expected result:**
- Each partner shows: name + partner type label (e.g., "Иван Петров · Клиент").

**Reconciliation:** —
**Designed gap:** None.

---

### PAYMENTS-62 | Create Modal — Employee Picker Displays Position
**Precondition:** Multiple employees exist.
**Steps:**
1. Open create modal, Type = Зарплата.
2. Click the Employee dropdown.

**Expected result:**
- Each employee shows: name · position (e.g., "Сергей Иванов · Менеджер продаж").

**Reconciliation:** —
**Designed gap:** None.

---

### PAYMENTS-63 | Create Modal — Wallet Picker Displays Type Badge
**Precondition:** Multiple wallets of different types exist.
**Steps:**
1. Open create modal, any Type.
2. Click the Wallet dropdown.

**Expected result:**
- Each wallet shows: name · type label (e.g., "Касса 1 · Наличные").

**Reconciliation:** —
**Designed gap:** None.

---

### PAYMENTS-64 | Create Modal — Payroll Auto-Fills Amount from Salary
**Precondition:** Employee with salary = 3,500,000.
**Steps:**
1. Open create modal, Type = Зарплата.
2. Amount field is initially empty or 0.
3. Select the employee from the dropdown.
4. Observe the Amount field.

**Expected result:**
- Amount field auto-populates with the employee's salary (3,500,000).
- User can override by editing the field.

**Reconciliation:** —
**Designed gap:** None.

---

### PAYMENTS-65 | Create Modal — Discard Guard with Dirty Form
**Precondition:** Form has unsaved changes.
**Steps:**
1. On the create modal, select Type = Депозит.
2. Select a Wallet.
3. Enter an Amount.
4. (Do NOT click submit).
5. Click the X (close) button.

**Expected result:**
- Confirmation dialog: "Отменить изменения?" with buttons "Отменить" and "Назад".

**Reconciliation:** —
**Designed gap:** None.

---

### PAYMENTS-66 | Create Modal — No Discard Guard on Fresh Modal
**Precondition:** —
**Steps:**
1. Open create modal.
2. Immediately click the X (close) button (no changes made).

**Expected result:**
- Modal closes without confirmation dialog (form is clean).

**Reconciliation:** —
**Designed gap:** None.

---

### PAYMENTS-67 | Create Modal — Error Banner Position
**Precondition:** Form submission fails validation.
**Steps:**
1. Open create modal.
2. Leave required fields empty.
3. Click "Провести платёж".

**Expected result:**
- Red error banner appears below the horizontal divider (after Type selector).
- Banner text: "Проверьте отмеченные поля перед проведением."
- Individual field errors appear inline below each field.

**Reconciliation:** —
**Designed gap:** None.

---

### PAYMENTS-68 | Detail View — Source Displayed Correctly
**Precondition:** Payment with a single Wallet source.
**Steps:**
1. Open payment detail.
2. Observe "Касса" card.

**Expected result:**
- Single row showing:
  - Wallet icon (type-specific, e.g., cash/card icon) in a colored square.
  - Wallet name + type label.
  - Amount in numeric font, large + bold, right-aligned.

**Reconciliation:** —
**Designed gap:** None.

---

### PAYMENTS-69 | Detail View — Multiple Sources (Advance + Wallet)
**Precondition:** A Payment created with both a Wallet source and an Advance source (simulated by prior payment overage → advance).
**Steps:**
1. Open payment detail.
2. Observe "Касса" card.

**Expected result:**
- Two rows:
  - Wallet source: wallet icon + name + type.
  - Advance source: no wallet icon, text "Аванс партнёра", amount.
- Both amounts sum to the payment total.

**Reconciliation:** —
**Designed gap:** None.

---

### PAYMENTS-70 | Detail View — Allocation Table Styling
**Precondition:** Transaction payment with multiple allocations (settlement + advance).
**Steps:**
1. Open payment detail → "Распределение" card.

**Expected result:**
- Header row: gray background, white text, column headers (Назначение, Тип, Сумма).
- TransactionSettlement rows: clickable (blue text, underline on hover).
- AdvanceCredit rows: secondary color text.
- ChangeReturn rows: gray background (whole row), italic text, "ПАМЯТКА" tag in the amount cell.

**Reconciliation:** —
**Designed gap:** None.

---

### PAYMENTS-71 | Create — Type Selection Resets Direction
**Precondition:** Form open, Type = Оплата, selected a direction.
**Steps:**
1. Change Type from Оплата to Общий.
2. Observe Direction field.

**Expected result:**
- Direction resets to a default (e.g., "Расход" for General types).
- When changing back to Оплата, the direction behavior depends on the partner type (auto or manual).

**Reconciliation:** —
**Designed gap:** None.

---

### PAYMENTS-72 | List — No Row Actions (Immutable Payments)
**Precondition:** ≥1 payment exists.
**Steps:**
1. On `/payments` list, look for edit/delete buttons, context menus, or row actions on payment rows.

**Expected result:**
- No edit button, delete button, or ⋮ menu on rows.
- Row is clickable only to open detail view (read-only).

**Reconciliation:** Hard rule 1 enforced (immutable events).
**Designed gap:** Reverse payment is deferred (out of MVP).

---

### PAYMENTS-73 | Create Modal — Dialog Width & Responsive
**Precondition:** —
**Steps:**
1. Open create modal on desktop (wide screen).
2. Observe the modal width.
3. Resize browser to mobile width.
4. Observe modal behavior.

**Expected result:**
- Desktop: modal width = 720px, maxWidth = 96% (to leave padding on small desktops).
- Mobile: modal scales to 96% viewport width, remains readable.

**Reconciliation:** —
**Designed gap:** None.

---

### PAYMENTS-74 | Settlement Modal — Dialog Width
**Precondition:** Settlement modal open with ≥2 outstanding rows.
**Steps:**
1. Observe modal width.
2. Resize to mobile.

**Expected result:**
- Desktop: modal width = 760px.
- Mobile: maxWidth = 96%.
- Table remains readable (may scroll horizontally if needed).

**Reconciliation:** —
**Designed gap:** None.

---

### PAYMENTS-75 | Form Validation — Required Field Indicators
**Precondition:** —
**Steps:**
1. Open create modal.
2. Observe field labels.

**Expected result:**
- Required fields have a "required" indicator (e.g., red asterisk * or "required" text).
- Optional fields (Description for non-General types) have no indicator.

**Reconciliation:** —
**Designed gap:** None.

---

### PAYMENTS-76 | Settlement Modal — Summary Totals Accuracy
**Precondition:** Payment amount = 1,000,000, outstanding totaling 800,000.
**Steps:**
1. On settlement modal, allocate 800,000 to transactions.
2. Observe summary boxes: "К распределению", "Распределено", "В аванс".

**Expected result:**
- К распределению = 1,000,000 (payment amount).
- Распределено = 800,000 (allocated to transactions).
- В аванс = 200,000 (1,000,000 - 800,000).
- Sum(Распределено + В аванс) = К распределению.

**Reconciliation:** Allocations are mathematically consistent.
**Designed gap:** None.

---

### PAYMENTS-77 | Create — Form Field Order
**Precondition:** —
**Steps:**
1. Open create modal.
2. Note the order of fields.

**Expected result:**
- Step 1: Type selector (segmented control, 5 options).
- Divider.
- Error banner (if any).
- Step 2: Per-type fields (Partner for Transaction/Deposit/Withdrawal, Employee for Payroll, Direction for General, Direction for "Both" partner types).
- Wallet selector (required).
- Amount selector (required).
- Debts banner (if applicable).
- Action buttons (Cancel, Submit).

**Reconciliation:** UI matches the implemented form structure.
**Designed gap:** None.

---

### PAYMENTS-78 | Create Modal — Loading & Saving States
**Precondition:** —
**Steps:**
1. Open create modal while form-data is loading (or simulate delay).
2. Observe the modal.
3. Submit a payment (trigger create).
4. Observe the modal while isSaving.

**Expected result:**
- While loading form-data: dropdowns may be disabled or show spinners; close (X) button remains active.
- While isSaving: LinearProgress bar appears below the header; close button disabled; action buttons disabled.
- On success: modal closes, list updates.

**Reconciliation:** —
**Designed gap:** None.

---

### PAYMENTS-79 | List — Refresh After Create
**Precondition:** On `/payments` list.
**Steps:**
1. Click "Новый платёж".
2. Create a payment (complete the form + modal flows).
3. Modal closes.
4. Observe the list.

**Expected result:**
- New payment appears at the top or in the sorted position of the list.
- Summary strip updates (income/expense/count).
- No manual refresh needed.

**Reconciliation:** —
**Designed gap:** None.

---

### PAYMENTS-80 | Create Modal — Employee Selection Clears on Type Change
**Precondition:** Payroll type selected, Employee chosen.
**Steps:**
1. On create modal, Type = Зарплата, select an Employee.
2. Change Type to Оплата.
3. Observe the form.

**Expected result:**
- Employee field is removed (not visible for Оплата).
- Form reorganizes to show Partner picker instead.

**Reconciliation:** —
**Designed gap:** None.

---

### PAYMENTS-81 | Detail View — Breadcrumb Navigation
**Precondition:** On payment detail page.
**Steps:**
1. Click the breadcrumb "Платежи" link.

**Expected result:**
- Navigates back to `/payments` list view.

**Reconciliation:** —
**Designed gap:** None.

---

### PAYMENTS-82 | List Column — Wallet Name with Icon
**Precondition:** ≥1 payment in a named wallet.
**Steps:**
1. On list, observe the Wallet column.

**Expected result:**
- Each row shows: wallet icon (AccountBalanceWalletOutlined) + wallet name.
- Icon is small (14px), gray color.
- Name is bold, dark.

**Reconciliation:** —
**Designed gap:** None.

---

### PAYMENTS-83 | Create — Direction Label per Payment Type
**Precondition:** —
**Steps:**
1. Open create modal.
2. Select Type = Оплата (no Direction shown if Partner is Customer).
3. Select Type = Общий (Direction shown, labeled "Направление").
4. Select Type = Депозит (no Direction shown, auto Income).
5. Select Type = Вывод (no Direction shown, auto Expense).
6. Select Type = Зарплата (no Direction shown, auto Expense).

**Expected result:**
- Direction picker label changes context:
  - Общий: "Направление".
  - "Both" partner type + Transaction: "Направление (партнёр типа «Оба»)".

**Reconciliation:** —
**Designed gap:** None.

---

### PAYMENTS-84 | Settlement — Numeric Formatting in Input
**Precondition:** Settlement modal open.
**Steps:**
1. In an allocation input field, type "1000000" (no separators).
2. Observe the input display.

**Expected result:**
- Input may display formatted with Russian locale separator (e.g., "1 000 000") or remain as typed.
- Internally, the value is stored as a number (1000000).

**Reconciliation:** —
**Designed gap:** None.

---

### PAYMENTS-85 | Create Modal — Immutability Warning Message
**Precondition:** Create modal open.
**Steps:**
1. Observe the dialog actions (footer).

**Expected result:**
- A warning message is displayed: "Платёж будет записан окончательно — изменить или удалить нельзя." with an icon (warning/info).
- Positioned in the dialog actions, left-aligned, yellow/warning tone.

**Reconciliation:** —
**Designed gap:** None.

---

### PAYMENTS-86 | List — Loading State (Initial Page Load)
**Precondition:** —
**Steps:**
1. Navigate to `/payments` for the first time in the session.
2. Observe the loading state.

**Expected result:**
- Breadcrumb and header render immediately.
- Summary strip and table may show a loading spinner (CircularProgress) while data loads.
- Once data arrives, table renders with payment rows.

**Reconciliation:** —
**Designed gap:** None.

---

### PAYMENTS-87 | API Error Handling — Create Fails
**Precondition:** Network issue or backend error simulated.
**Steps:**
1. Open create modal.
2. Fill in all fields.
3. Trigger a scenario where the POST /api/payments endpoint returns an error (e.g., 400 Bad Request, 500 Internal Server Error).

**Expected result:**
- Modal remains open.
- An error toast or banner appears with a message (e.g., "Не удалось провести платёж").
- isSaving state clears, buttons are re-enabled.
- Payment is NOT created.

**Reconciliation:** —
**Designed gap:** Error handling scope depends on backend contract.

---

### PAYMENTS-88 | API Error Handling — Form Data Load Fails
**Precondition:** —
**Steps:**
1. Open create modal.
2. Simulate a failed GET /api/payments/form-data request.

**Expected result:**
- Error toast or inline error message appears (e.g., "Не удалось загрузить данные для формы").
- Form may remain partially usable or fully disabled.
- User can close and retry.

**Reconciliation:** —
**Designed gap:** Error handling scope depends on backend contract.

---

### PAYMENTS-89 | Detail Page — 404 Not Found
**Precondition:** —
**Steps:**
1. Navigate to `/payments/99999` (non-existent payment ID).

**Expected result:**
- Loading spinner briefly appears.
- Page renders with a message: "Платёж не найден." (center-aligned, secondary text color).

**Reconciliation:** —
**Designed gap:** None.

---

### PAYMENTS-90 | Reconciliation — Payment with Multiple Allocations Reduces Multiple Debts
**Precondition:** Partner with 2 outstanding transactions (Sale #100 remaining 300,000, Sale #101 remaining 400,000).
**Steps:**
1. Create a Transaction payment for the partner, amount = 700,000.
2. In settlement modal, allocate 300,000 to Sale #100 and 400,000 to Sale #101 (full FIFO auto).
3. Submit.
4. Navigate to `/debts` or partner detail.

**Expected result:**
- Both sales are now paid (remaining = 0, progress = 100%).
- No outstanding transactions remain for the partner.

**Reconciliation:**
- Partner detail shows both sales settled.
- Payment detail allocations match the settled amounts.

**Designed gap:** None.

---

## Known Limitations & Designed Gaps

- **Payment reverse/correction:** Out of MVP. The immutability rule is enforced; no UI affordances to delete or edit payments. Corrections are a future feature (business-rules §A, rule 1).
- **Date range filtering:** Locked pattern 12 — the list does NOT include a date-range picker. Filtering is by Type, Wallet, and search only.
- **Pagination/pager:** Not in the MVP. The list loads all payments (or a large default set, subject to backend limits).
- **Stock mutation on refunds/transfers:** The standalone Payments mock (like Partners, Wallets, Orders) is self-contained and does NOT mutate product stock or transaction balances client-side when payments are created. All balances are served by the API (rule 12).
- **Settlement period:** The outstanding transactions list is always current (fetched fresh on modal open). Historical settlement recomputation is not supported.
- **Advance to Wallet transfer:** The "Возврат аванса" (Withdrawal) decrements the partner advance and increments the wallet. There is no inverse "transfer advance to wallet" flow outside the Withdrawal payment type.

---

## Cross-Module Reconciliation Checklist

When verifying payments against other modules:

1. **Partner Module (`/partners/{id}`):**
   - Partner detail shows updated balance after a payment.
   - "Платежи" tab lists all payments for the partner.
   - Advance displayed on the partner detail matches the sum of Payment allocations (AdvanceCredit) minus Withdrawals.

2. **Wallet Module (`/wallets/{id}`):**
   - Wallet balance updates after a payment.
   - "Операции" tab includes all payments using the wallet as a source.
   - "Переводы" tab is separate (inter-wallet transfers, not payments).

3. **Transactions Module (`/sales/:id`, `/supplies/:id`):**
   - Transaction detail "Платежи" tab lists all payments that settled this transaction.
   - Transaction's "paid" and "remaining" reflect allocations from payments.
   - Refund detail shows parent transaction reference + linked payments.

4. **Debts Module (`/debts`):**
   - Outstanding (remaining) balances update after payments settle them.
   - "По транзакциям" tab shows the same transactions with updated remaining amounts.
   - Overdue status is recomputed (not affected by payment date, only transaction date vs. current date).

5. **Employees Module (`/employees/{id}`):**
   - Employee detail "Выплаты" tab lists all Payroll payments for the employee.
   - Payroll payment amount matches or is set by user (auto-fills from salary at create time but is editable).

---

