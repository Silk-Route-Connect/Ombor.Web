# Debts (Долги) Module — Manual Test Cases

**App:** Ombor.Web React 19 + MUI v7 + MobX  
**Module:** Debts overview (read-only, aggregated view of unpaid/partially-paid transactions)  
**Route:** `/debts`  
**Language:** Russian UI  
**Currency:** UZS  
**Testing environment:** dev (app.miraziz.net frontend + api.miraziz.net backend; real backend, mocks OFF)  
**Tenant state:** Empty at start; test data seeded via mock as needed

---

## Overview

The Debts module (`/debts`) is a **read-only, server-computed aggregated view** over unpaid and partially-paid transactions. It is NOT a transactional entity — debts are produced by Sales, Supplies, and their refunds, and are settled via Payments. Every figure (remaining balance, age, overdue status) is **served by the API**, not computed client-side.

**Key principles:**
- Two tabs: **По партнёрам** (by Partner — grouped view) and **По транзакциям** (by Transaction — flat view)
- Four summary cards at the top (Нам должны / Мы должны / Просрочено / Чистая позиция) — all clickable except net
- Shared filters: search + age buckets (Все/0–7/8–30/31–60/60+)
- Transaction tab adds: direction segmented (Все/Нам должны/Мы должны) + sort dropdown
- No +/− signs; **colour only** (green = receivable/income, red = payable/expense)
- CSV export
- All amounts in UZS

---

## Test Data Seed

The mock data in `src/mocks/data/debt.ts` is **self-contained** — partner IDs match the Partners mock for deep-linking, but amounts are independent. Test data includes:

**Receivable (clients owe us):**
- #1042: Виктория / Орлова Сбыт, 2,340,000 (paid 1,200,000, remaining 1,140,000), from 2026-06-06
- #1038: Виктория / Орлова Сбыт, 1,100,000 (paid 600,000, remaining 500,000), from 2026-05-22
- #1040: Дима Мирзадова, 1,650,000 (unpaid), from 2026-06-01
- #1036: Артём Орехников, 3,200,000 (unpaid), from 2026-05-16 **← OLDEST, OVERDUE**
- #1031: Виктория Собянина, 1,100,000 (paid 550,000, remaining 550,000), from 2026-05-23

**Payable (we owe suppliers):**
- #2018: Парфёнова, 1,280,000 (unpaid), from 2026-06-05
- #2017: Вероника, 2,450,000 (paid 1,000,000, remaining 1,450,000), from 2026-06-02
- #2014: Геннадий Зайцев, 1,750,000 (unpaid), from 2026-05-21 **← OLDEST, LIKELY OVERDUE**

---

## Test Cases

### DEBTS-01 · Page Load and Summary Cards

**Preconditions:** Fresh session, `/debts` not yet visited  
**Steps:**
1. Navigate to `/debts`
2. Wait for the page to load (observe loading spinner)
3. Observe the four summary cards below the header

**Expected result:**
- Page title: "Долги"
- Subtitle: "Открытые задолженности по всем партнёрам и транзакциям"
- Four cards visible in a 4-column grid (responsive: 2 on tablet, 1 on mobile):
  - Card 1 (green): **Нам должны** = sum of all receivable remaining balances = 6,490,000 UZS, count = 5 транзакций
  - Card 2 (red): **Мы должны** = sum of all payable remaining balances = 3,480,000 UZS, count = 3 транзакции
  - Card 3 (orange/warning): **Просрочено** = sum of overdue remaining balances (those past due date), count = N (depends on current date vs 14-day net terms)
  - Card 4 (teal): **Чистая позиция** = (Нам должны) − (Мы должны) = 3,010,000 UZS, count = 8 транзакций (total unique debts)
- Each card shows icon + caption + large currency value + "UZS" suffix + transaction count pill
- Cards 1–3 are clickable (cursor pointer on hover, slight lift animation); card 4 is not clickable

**Reconciliation:**
- Totals computed server-side from `/api/debts` response; verify against the seed data
- Count must match total unique transaction rows in the list

---

### DEBTS-02 · Summary Card Click Navigation

**Preconditions:** Page loaded, summary cards visible, test data seeded  
**Steps:**
1. Click the "Нам должны" (green) card
2. Observe tab and filter state

**Expected result:**
- Auto-switches to "По транзакциям" tab
- Direction filter set to "Нам должны" (green segmented button selected)
- Only receivable transactions shown
- overdue filter cleared (if previously set)
- Sort remains default "Остаток"

**Steps (alt — Payable card):**
1. Click the "Мы должны" (red) card

**Expected result:**
- Switches to "По транзакциям" tab
- Direction filter set to "Мы должны" (red segmented button selected)
- Only payable transactions shown

**Steps (alt — Overdue card):**
1. Click the "Просрочено" (orange) card

**Expected result:**
- Switches to "По транзакциям" tab
- Direction filter set to "Все" (shows all)
- **"Только просроченные" chip appears** (orange/warning tone, with close button)
- Only transactions with `overdueDays > 0` displayed
- Sort auto-set to "Возраст" (age, descending)

**Designed gap:**
- "Просрочено" on the dashboard and here may differ: the dashboard's definition is 31+ days old; `/debts` is past-due-date. Inform the user if discrepancy observed.

---

### DEBTS-03 · Tabs: Partners View (По партнёрам)

**Preconditions:** Page loaded, tab = "По партнёрам"  
**Steps:**
1. Observe the partner-debt table
2. Verify table columns: Partner | Type | Count | Oldest Debt | Amount | (arrow)
3. Verify grouping and sorting

**Expected result:**
- **Grouping:** Each unique partner appears once per debt direction (e.g., Виктория as both Receivable and Payable if she appears in both; in test seed, Виктория appears as Receivable only)
- **Sorting:** Groups sorted by absolute debt amount, largest first
  - Row 1: Виктория + Орлова Сбыт (Receivable): 2 txns (1042 + 1038), oldest 2026-05-22, remaining 1,640,000 (1,140,000 + 500,000), shows "в сроке" chip
  - Row 2: Артём Орехников (Receivable): 1 txn, oldest 2026-05-16, remaining 3,200,000, shows "N просрочено" chip (1 overdue)
  - Row 3: Дима Мирзадова (Receivable): 1 txn, oldest 2026-06-01, remaining 1,650,000
  - Row 4: Виктория Собянина (Receivable): 1 txn, oldest 2026-05-23, remaining 550,000
  - Row 5: Геннадий Зайцев (Payable): 1 txn, oldest 2026-05-21, remaining 1,750,000
  - (Remaining payable rows by amount desc)
- **Type chip:** "Клиент" (blue) for Receivable, "Поставщик" (orange) for Payable
- **Amount column:** Displayed in colour — green for Receivable, red for Payable, no +/− sign
- **Oldest date + overdue status:** 
  - If any line in the group is overdue, show "N просрочено" chip (red/orange)
  - Otherwise, show "в сроке" label (green)

**Reconciliation:**
- Partner name and count must match the seed
- Remaining = sum of remaining per debt in the group
- Oldest date = earliest transaction date in the group
- Overdue count = count of transactions with overdueDays > 0

---

### DEBTS-04 · Tabs: Transactions View (По транзакциям)

**Preconditions:** Page loaded, switch to "По транзакциям" tab  
**Steps:**
1. Observe the transaction-debt table
2. Verify table columns: Document | Type | Partner | Total | Paid | Remaining | Age | (arrow)
3. Verify sorting (default: Остаток, descending)

**Expected result:**
- Flat list, one row per unique debt
- Default sort order: largest remaining balance first
  - Row 1: #1036, Артём Орехников, 3,200,000 total, 0 paid, 3,200,000 remaining, ~38 days old (if today is ~2026-06-24), red overdue chip "просрочка 10 дн" (if past due-date)
  - Row 2: #1042, Виктория, 2,340,000 total, 1,200,000 paid, 1,140,000 remaining, ~18 days old
  - (etc., sorted by remaining desc)
- **Type chip:** Green "Продажа" for Sale/SaleRefund (Receivable), orange "Поставка" for Supply/SupplyRefund (Payable)
- **Paid column:** Shows amount + progress bar (width = paid/total %, primary color fill)
- **Remaining:** Green for Receivable, red for Payable, no sign
- **Age:** Displayed as "X дн" (e.g., "18 дн")
- **Overdue:** Red chip "просрочка Y дн" only if overdueDays > 0; otherwise, no chip in this column

---

### DEBTS-05 · Shared Filter: Search by Partner Name

**Preconditions:** Page loaded, either tab  
**Steps:**
1. Click the search input (leftmost filter)
2. Type "Виктория"
3. Observe results

**Expected result:**
- **Partners tab:** Shows only groups containing "Виктория" in partner name or company
  - Matches: Виктория (2 rows), Виктория Собянина
  - Non-matches hidden
- **Transactions tab:** Shows only rows for partners matching "Виктория"
- Placeholder text: "Поиск по партнёру или номеру…"
- Search is case-insensitive and partial-match

**Steps (alt — search by document number):**
1. Clear the search and type "1042"

**Expected result:**
- Partners tab: Shows Виктория group (contains #1042)
- Transactions tab: Shows only #1042
- Search matches both partner names and document numbers

**Steps (alt — clear search):**
1. Clear the search field

**Expected result:**
- All rows restored to full list

---

### DEBTS-06 · Shared Filter: Age Buckets (Срок)

**Preconditions:** Page loaded  
**Steps:**
1. Click the "Срок" dropdown (shows current value, default "Все сроки")
2. Select "0–7 дней"
3. Observe filtered results

**Expected result:**
- Only debts with `ageDays <= 7` shown
- Partners tab: Only partner groups with at least one debt in this bucket
- Transactions tab: Only transactions in this bucket, sorted by current sort order
- Dropdown button shows "Срок: 0–7 дней" (active state: teal border, teal icon)
- Other age options available: "Все сроки", "8–30 дней", "31–60 дней", "60+ дней"

**Steps (alt — oldest debts):**
1. Select "60+ дней"

**Expected result:**
- Only debts older than 60 days shown (e.g., #1036 from 2026-05-16 if today is ~2026-06-24)
- May be empty or show a few very old debts

**Steps (alt — reset to all):**
1. Select "Все сроки"

**Expected result:**
- All rows restored, age filter cleared

---

### DEBTS-07 · Direction Filter (Все/Нам должны/Мы должны) — Transactions Tab Only

**Preconditions:** Page loaded, "По транзакциям" tab active  
**Steps:**
1. Observe the segmented control "Все | Нам должны | Мы должны" (only visible on this tab)
2. Default value: "Все"
3. Click "Нам должны"

**Expected result:**
- Only receivable transactions shown (green type chip, positive color)
- Count = 5 (the 5 receivable debts in seed)
- Segmented button shows teal highlight on "Нам должны"

**Steps (alt):**
1. Click "Мы должны"

**Expected result:**
- Only payable transactions shown (orange type chip, red/warning color)
- Count = 3 (the 3 payable debts in seed)

**Steps (alt — reset):**
1. Click "Все"

**Expected result:**
- All 8 rows shown

---

### DEBTS-08 · Sort Dropdown (Transactions Tab Only) — Сортировка

**Preconditions:** Page loaded, "По транзакциям" tab, direction filter = "Все"  
**Steps:**
1. Observe default sort: "Остаток" (sorts by remaining balance, largest first)
2. Click the "Сортировка" dropdown
3. Select "Возраст" (sorts by age, oldest first)

**Expected result:**
- Rows re-sorted by ageDays, descending (oldest first)
- First row: #1036 (oldest, ~38 days if today is 2026-06-24)
- Dropdown shows "Сортировка: Возраст" (active state)

**Steps (alt):**
1. Select "Дата" (sorts by transaction date, newest first)

**Expected result:**
- Rows sorted by date descending
- First row: #2018 (2026-06-05) or whichever is newest

**Steps (alt — reset):**
1. Select "Остаток"

**Expected result:**
- Back to default: sorted by remaining balance descending

---

### DEBTS-09 · "Только просроченные" (Overdue-Only Filter)

**Preconditions:** Page loaded  
**Steps:**
1. Click the "Просрочено" summary card
2. Observe filter chip

**Expected result:**
- Tab switched to "По транзакциям"
- Orange "Только просроченные" chip appears (with close button and icon)
- Only rows with overdueDays > 0 shown
- Rows are automatically sorted by "Возраст" (age descending)

**Steps (clear the filter):**
1. Click the close (×) button on the chip, OR click "Только просроченные" text

**Expected result:**
- Chip disappears
- All rows restored to full list
- Sort order reverts to previous or default ("Остаток")

---

### DEBTS-10 · Filter Combinations

**Preconditions:** Page loaded, "По транзакциям" tab  
**Steps:**
1. Search: type "Виктория"
2. Age bucket: select "8–30 дней"
3. Direction: select "Нам должны"
4. Observe results

**Expected result:**
- Rows matching ALL filters:
  - Partner name contains "Виктория"
  - Age 8–30 days
  - Direction Receivable
- Likely matches: #1042 (18 days, if today ~2026-06-24) and #1038 (33 days — may not match if filter is strict)
- Order maintained by current sort ("Остаток" default)

**Steps (clear all filters):**
1. Click search and clear the text
2. Click age dropdown and select "Все сроки"
3. Click direction segmented and select "Все"

**Expected result:**
- All filters cleared
- Full list restored

---

### DEBTS-11 · Partner Table: Click a Row to Deep-Link

**Preconditions:** Page loaded, "По партнёрам" tab  
**Steps:**
1. Hover over a partner row (e.g., Виктория)
2. Observe chevron-right arrow fade in
3. Click the row

**Expected result:**
- Navigate to `/partners/{partnerId}` (e.g., `/partners/4` for Виктория)
- Partner detail page loads with the full partner profile
- Partner balance shown in detail page (may differ from debts page totals — known mock limitation)

---

### DEBTS-12 · Transaction Table: Click a Row to Deep-Link

**Preconditions:** Page loaded, "По транзакциям" tab  
**Steps:**
1. Hover over a transaction row
2. Observe chevron-right arrow fade in
3. Click on row (anywhere except type chip)

**Expected result:**
- Determine transaction type from the row's type chip:
  - "Продажа" → navigate to `/sales/{transactionId}` (Sale detail)
  - "Поставка" → navigate to `/supplies/{transactionId}` (Supply detail)
- Detail page loads showing full transaction data
- All amounts, partner, lines, and payment status visible
- The debt's remaining/paid/total should match the debts list (if the detail calls the same backend endpoint)

---

### DEBTS-13 · Empty State: No Debts

**Preconditions:** Backend returns empty Debt[] array (manually remove seed or mock returns [])  
**Steps:**
1. Navigate to `/debts`
2. Observe the state

**Expected result:**
- Summary cards show all zeros (0 UZS, 0 транзакций)
- Both tabs show the empty-state graphic:
  - Large icon (reset/replay icon) in a light gray box
  - Heading: "Нет открытых задолженностей"
  - Body: "Все расчёты закрыты — дебиторской и кредиторской задолженности нет."
- Tables empty, no rows

---

### DEBTS-14 · Empty State: Filtered Results

**Preconditions:** Page loaded with data, filters applied that yield no results  
**Steps:**
1. Search: type "ХХХХХХХХХх" (nonsense string that matches no partner/document)
2. Observe result

**Expected result:**
- Both tabs show empty state:
  - Heading: "Ничего не найдено"
  - Body: "Под выбранные фильтры не попала ни одна транзакция. Измените условия поиска."
- Summary cards still show totals over ALL debts (not filtered totals)

**Designed gap:**
- Summary card totals are global (hard rule 8). Only the table rows are filtered. This is intentional per the design.

---

### DEBTS-15 · CSV Export

**Preconditions:** Page loaded, data visible  
**Steps:**
1. Click the "Скачать CSV" button (top-right, next to page header)
2. File downloads

**Expected result:**
- File name: `debts_<date-stamp>.csv` (e.g., `debts_2026-06-24.csv`)
- Columns (from the transactions view):
  - Document (e.g., "#1042")
  - Date (formatted, e.g., "24.06.2026")
  - Type (e.g., "Продажа" or "Поставка")
  - Partner (e.g., "Виктория")
  - Total (number, e.g., "2340000")
  - Paid (number, e.g., "1200000")
  - Remaining (number, e.g., "1140000")
  - Age in days (e.g., "18")
- Rows: All visible transaction rows (respects current filters and sort)
- Data matches the displayed table exactly

**Steps (alt — with filters):**
1. Search "Виктория" + Direction "Нам должны"
2. Click "Скачать CSV"

**Expected result:**
- CSV contains only filtered rows
- Headers unchanged
- Filename still uses current date

---

### DEBTS-16 · Paid Progress Bar

**Preconditions:** Page loaded, "По транзакциям" tab  
**Steps:**
1. Observe a partially-paid transaction (e.g., #1042: 1,200,000 paid / 2,340,000 total)
2. Check the "Paid" column

**Expected result:**
- Shows amount (e.g., "1 200 000")
- Below amount: a thin horizontal progress bar (5px tall, rounded corners)
- Bar width = (paid / total) × 100% = (1_200_000 / 2_340_000) ≈ 51%
- Bar color: primary.main (teal)
- Background bar: gray.300
- Fills left-to-right

**Steps (alt — unpaid):**
1. Observe a fully-unpaid row (e.g., #1040: 0 paid / 1,650,000 total)

**Expected result:**
- Shows "0"
- Progress bar: 0% filled, visible as empty gray bar

**Steps (alt — fully paid):**
1. Observe a fully-paid row (if any in seed; or create a test scenario)

**Expected result:**
- Shows remaining amount
- Progress bar: 100% filled (if fully paid) or remaining amount if partially paid
- Bar fills to match the displayed percentage

---

### DEBTS-17 · Numeric Formatting: Currency

**Preconditions:** Page loaded  
**Steps:**
1. Observe amounts in all tables and summary cards

**Expected result:**
- All amounts formatted with `formatCurrency()` utility:
  - Thousands separator (space): "1 200 000" instead of "1200000"
  - "UZS" suffix on summary cards (inline or pill)
  - Decimal precision: whole numbers only (no .00 suffix)
- Consistent across all sections (cards, tables, CSV)

---

### DEBTS-18 · Responsive Design

**Preconditions:** Page loaded, various viewport sizes  
**Steps:**
1. Test on desktop (1920×1080)
2. Reduce to tablet (768×1024)
3. Reduce to mobile (375×667)

**Expected result:**
- **Desktop:** 4-column card grid, tables visible, all filters inline
- **Tablet (sm):** 2-column card grid, filters wrap to next line, tables scroll horizontally if needed
- **Mobile (xs):** 1-column card grid, search full-width, filters stack vertically, direction segmented may collapse
- Age dropdown and sort dropdown always visible (not hidden on mobile)
- Chevron-right arrow on table rows visible at all sizes
- Table text truncates if needed (no overflow)

---

### DEBTS-19 · Loading State

**Preconditions:** Network configured to slow/throttle, or manually delay the API call  
**Steps:**
1. Navigate to `/debts`
2. Observe the loading state (before the 300ms mock delay elapses)

**Expected result:**
- Centered `CircularProgress` spinner displayed
- Summary cards: not yet rendered (loading state)
- Tabs / filters: not yet rendered
- Subtitle and header: visible
- Spinner continues until API returns (mock delay: 300ms)
- After load, full page renders

---

### DEBTS-20 · Color Convention: No +/− Signs

**Preconditions:** Page loaded  
**Steps:**
1. Observe all monetary displays

**Expected result:**
- **Receivable (green):** No leading +; color is the only indicator of direction
  - "Нам должны" card: green value
  - "Продажа" type chip: green
  - Remaining amount in green rows: no +
- **Payable (red):** No leading −; color only
  - "Мы должны" card: red value
  - "Поставка" type chip: orange/warning
  - Remaining amount in red rows: no −
- **Net position:** Green if positive (receivable > payable), red if negative (payable > receivable)

**Designed constraint:** This is locked pattern 4 — no arithmetic signs, colour-coding only. Differs from some backend data representations.

---

### DEBTS-21 · Tab Count Badges

**Preconditions:** Page loaded  
**Steps:**
1. Observe the two tabs below the filters

**Expected result:**
- "По партнёрам" tab shows a pill badge = number of unique partner groups
  - In test seed: likely 6–7 (5 receivable partners + 2–3 payable)
- "По транзакциям" tab shows a pill badge = number of transaction rows
  - In test seed: 8
- Badges update when filters change
- Selected tab: badge has teal background; unselected: gray background
- Badge count is correct and matches visible row count

---

### DEBTS-22 · Colour Legend

**Preconditions:** Page loaded on desktop (sm breakpoint and larger)  
**Steps:**
1. Observe the tabs area (to the right of tab buttons, before sorting dropdown on transactions tab)
2. Look for small coloured squares with text labels

**Expected result:**
- Legend visible on desktop:
  - Teal square + "нам должны" (green, lowercase)
  - Red square + "мы должны" (red, lowercase)
- On mobile (xs): legend hidden (display: none)
- Legend is **passive/informational** — not interactive, just visual aid

---

### DEBTS-23 · Reconciliation: Summary Card Totals

**Preconditions:** Page loaded, full data  
**Steps:**
1. Read the summary card values
2. Cross-check with backend `GET /api/debts` response

**Expected result:**
- **Receivable sum:** = sum of all `remaining` where `direction === "Receivable"`
  - Expected: 1,140,000 + 500,000 + 1,650,000 + 3,200,000 + 550,000 = 7,040,000
  - (Note: test seed may vary; recalculate based on actual seed data)
- **Payable sum:** = sum of all `remaining` where `direction === "Payable"`
  - Expected: 1,280,000 + 1,450,000 + 1,750,000 = 4,480,000
- **Overdue sum:** = sum of all `remaining` where `overdueDays > 0`
  - Depends on current date and due-date calculation (14-day net terms)
- **Net:** = receivable − payable = 7,040,000 − 4,480,000 = 2,560,000
- **Counts:** Match row counts in each category

**Designed gap:**
- The mock data is seeded and static (age/overdue computed live). If the test is run on a different date, overdue amounts will change. Update seed or adjust expectations based on testing date.

---

### DEBTS-24 · API Contract: GET /api/debts

**Preconditions:** Network monitoring (F12 DevTools Network tab)  
**Steps:**
1. Navigate to `/debts`
2. Observe the network request

**Expected result:**
- **Endpoint:** `GET /api/debts` (matches the real target v1 contract)
- **Query params:** None (full set of outstanding transactions)
- **Response status:** 200 OK
- **Response body:** Array of Debt objects, each with:
  - `transactionId`: number (e.g., 1042)
  - `number`: string or null (e.g., "1042")
  - `direction`: "Receivable" | "Payable"
  - `transactionType`: "Sale" | "Supply" | "SaleRefund" | "SupplyRefund"
  - `partnerId`: number
  - `partnerName`: string
  - `partnerCompany`: string | null
  - `partnerType`: "Customer" | "Supplier" | "Both"
  - `date`: ISO string
  - `dueDate`: ISO string | null
  - `total`: number
  - `paid`: number
  - `remaining`: number (served: total − paid)
  - `ageDays`: number (served)
  - `overdueDays`: number (served: days past due date)
- **Timing:** Request on mount (`useEffect` in DebtPage); retried on demand (manual refresh)

**Designed limitation:**
- The backend `/api/debts` endpoint does not exist yet (marked "not started" in tech-change-list.md). The frontend mocks at the target v1 contract. When the real endpoint ships, the mock is removed; no code changes needed in DebtPage or DebtStore.

---

### DEBTS-25 · Browser Back/Forward Navigation

**Preconditions:** Page loaded with filters applied (e.g., search + age bucket + direction)  
**Steps:**
1. Apply filters to reach a specific state
2. Click browser back button
3. Observe filter state

**Expected result:**
- **Current behavior (likely):** Filter state persists in MobX store; browser back does NOT restore previous filter state (not browser history-aware)
- This is a **known design limitation** — the UI does not use URL query params for filters, so back/forward don't restore filter state
- User stays on `/debts` route but filters remain at current values

**Designed gap:**
- URL-driven filter state (query params) is NOT implemented. This is acceptable per locked pattern 12 — no custom date ranges or client-side paging are exposed, keeping the URL clean. Filter preservation across sessions is out of MVP scope.

---

### DEBTS-26 · Concurrency: Data Refresh While Filters Applied

**Preconditions:** Page loaded with active filters  
**Steps:**
1. Apply filters to a narrow result (e.g., search "Виктория")
2. Trigger a manual refresh (e.g., `Ctrl+R` or close/re-open the tab)
3. Observe results

**Expected result:**
- Fresh API call fetches all debts
- Filters are cleared (MobX state reset on mount)
- Full dataset displayed
- Summary cards reflect global totals

**Designed gap:**
- The page has no explicit "Refresh" button; filters are not persisted in URL, so reloading clears them. This is intentional — the debts view is designed as a quick daily check, not a persistent filtered workspace.

---

### DEBTS-27 · Error Handling: API Failure

**Preconditions:** Mock the API to return an error (500, network timeout, etc.)  
**Steps:**
1. Configure the test to simulate an API error on `/api/debts`
2. Navigate to `/debts`

**Expected result:**
- Spinner displays
- After timeout/error, spinner removed
- Error toast notification appears (see `notificationStore.error()` call in DebtStore)
- Toast message: "Не удалось загрузить задолженности" (from i18n key `debt.error.getAll`)
- `allDebts` state set to `[]` (empty fallback)
- Tables show empty-state screen
- Summary cards show all zeros

**Designed constraint:**
- No retry mechanism; user must manually reload to try again. Hard rule 5 states "never silently disable buttons" — this error is surfaced, not hidden.

---

### DEBTS-28 · Accessibility: Keyboard Navigation

**Preconditions:** Page loaded  
**Steps:**
1. Tab through interactive elements (filters, tabs, rows)

**Expected result:**
- Focus outlines visible (MUI default)
- Tabs focusable: `Tab` key moves between "По партнёрам" and "По транзакциям"
- Dropdown buttons focusable and openable with `Space` or `Enter`
- Search input focusable: `Tab` + type to filter
- Table rows focusable (clickable rows have focus styling)
- No keyboard traps; focus can leave any element with `Escape` or `Tab`

---

### DEBTS-29 · i18n: Russian Labels and Formatting

**Preconditions:** Page loaded  
**Steps:**
1. Verify all visible text matches i18n keys from `src/i18n/ru/debt.json`

**Expected result:**
- Page title: "Долги" (debt.title)
- Subtitle: "Открытые задолженности по всем партнёрам и транзакциям" (debt.subtitle)
- Summary cards: "Нам должны", "Мы должны", "Просрочено", "Чистая позиция" (debt.summary.*)
- Tab labels: "По партнёрам", "По транзакциям" (debt.tabs.*)
- Filter prefixes: "Срок" with options like "Все сроки", "0–7 дней", etc.
- Direction segmented: "Все", "Нам должны", "Мы должны"
- Sort prefix: "Сортировка" with options "Остаток", "Возраст", "Дата"
- Table headers (partners): "Партнёр", "Тип", "Транзакций", "Старейший долг", "Сумма долга"
- Table headers (transactions): "Документ", "Дата", "Тип", "Партнёр", "Сумма", "Оплачено", "Остаток", "Возраст"
- Type chips: "Клиент" / "Поставщик" (partners), "Продажа" / "Поставка" (transactions)
- Empty state: "Нет открытых задолженностей" or "Ничего не найдено" depending on filters
- All strings use Russian grammar (pluralization in txWord() function for transaction counts)

---

### DEBTS-30 · Mobile UX: Touch Interaction

**Preconditions:** Page loaded on mobile device or mobile viewport (375×667)  
**Steps:**
1. Tap a summary card
2. Tap a table row
3. Tap a filter dropdown
4. Swipe to see table columns (if horizontal scroll needed)

**Expected result:**
- All tap targets are large enough (min 44×44 px)
- Cards respond to tap with visual feedback (opacity change or scale)
- Dropdown menus open on tap and close on backdrop tap
- Table rows respond with hover-like styling on tap (gray background)
- No "ghost click" delays; 300ms rule respected
- Swipe gestures work for horizontal scrolling tables

---

## Cross-Module Reconciliation

### RECONCILIATION-A: Debts Summary ↔ Transactions List

**Scenario:** A sale is created with a partner, then partially paid.

**Setup:**
1. Create a Sale for partner #4 (Виктория), amount 500,000, no payment
2. Create a Payment settling 200,000 against the sale
3. Navigate to `/debts`

**Expected result:**
- **Summary card (Нам должны):** Increases by 500,000
- **Transaction row:** 
  - New row appears with document #, date, total 500,000, paid 200,000, remaining 300,000
  - Progress bar shows 40% filled
- **Partner group row (По партнёрам):**
  - Виктория group updated; count increases; sum updated
- **Backend logic:** All figures served from API, not recomputed client-side

**Known limitation:**
- The debts mock is self-contained. In reality, creating a transaction would update the `/api/debts` mock seeding. For testing, manually seed new debts or verify the transaction detail shows the same remaining balance.

---

### RECONCILIATION-B: Debts ↔ Partner Detail

**Scenario:** Navigate from debts list to a partner's detail page.

**Setup:**
1. On `/debts`, "По партнёрам" tab
2. Click on Виктория's row

**Expected result:**
- Navigate to `/partners/4` (Виктория's detail)
- Partner balance card visible
- Balance may differ from the debts list total (known mock limitation — the two mocks are seeded independently)
- Transactions tab shows transaction history including the debts visible in the debts list
- Return to `/debts` (browser back or sidebar) — debt list state reset (filters cleared)

---

### RECONCILIATION-C: Debts ↔ Payment Settlement

**Scenario:** A payment is recorded with multiple allocations.

**Setup:**
1. Partner has outstanding debts (e.g., #1042: 1,140,000 remaining)
2. Create a Payment (type "Оплата") for this partner, amount 1,140,000, settled to #1042
3. Navigate to `/debts`

**Expected result:**
- #1042 row: remaining updated to 0
- Progress bar: 100% filled
- Row may disappear if truly fully paid (depends on implementation — it may stay with 0 remaining or be excluded)
- Summary: totals updated to reflect full payment
- Age: unchanged (transaction date unchanged)

**Known limitation:**
- The mocks don't cross-reference. In reality, creating a payment updates the `/api/debts` endpoint to reflect the allocation. For MVP testing, verify the payment detail and the transaction detail show matching paid amounts.

---

### RECONCILIATION-D: Dashboard Receivable/Payable ↔ Debts Summary

**Scenario:** Dashboard KPI cards show receivable/payable totals.

**Setup:**
1. Visit `/` (Dashboard)
2. Observe "Нам должны" KPI card
3. Navigate to `/debts`
4. Observe summary card

**Expected result:**
- Dashboard "Нам должны" value = Debts "Нам должны" card value
- Both computed from the same `/api/debts` seed (dashboard mocks a read model that includes debts aggregation)
- Counts match (number of receivable transactions)
- Click the dashboard card → routes to `/debts` with "Нам должны" filter pre-applied

**Designed gap:**
- Dashboard's "Просрочено" is 31+ days old; `/debts` "Просрочено" is past-due-date. These may show different results on the same date.

---

## Designed Gaps & Known Limitations

1. **Static mock data:** The debt seed is frozen at creation time. New transactions (created in-app) are not added to the `/api/debts` mock. For full testing, populate test data via backend or reseed the mock.

2. **Partner balance mismatch:** Debts and Partners pages seed independently. A partner's balance on `/partners/:id` may differ from their total debt on `/debts`. This is intentional (the mocks are self-contained), but in production with a real backend, they must match.

3. **No filter URL persistence:** Filters are not reflected in the URL (no query params like `?search=...&age=0-7`). Browser back/forward don't restore filter state. This is locked pattern 12.

4. **No date-range picker:** The prototype included a custom date-range filter. This is omitted (locked pattern 12) — the app stays focused on current, aggregated views, not historic analysis.

5. **No pagination or row limit:** The mock returns all outstanding debts at once. Real data at scale may need pagination (deferred to v2 per mvp-plan).

6. **CSV export locale:** Date formatting (DD.MM.YYYY) is hardcoded per the design. Locales other than Russian may format differently in real deployments.

7. **Overdue definition divergence:** 
   - **Dashboard "Просрочено":** 31+ days old (age-based)
   - **Debts "Просрочено":** Past the due date (date-based)
   - These can differ on the same calendar date and may confuse users. Document this or align definitions in a future refinement.

8. **Transaction-row click doesn't deep-link on transaction-detail page itself:** When viewing `/sales/123` or `/supplies/456`, clicking a related debt in the page (if such a list existed) would navigate. Currently, the debts page is read-only; this is not applicable. Future versions may add debt cross-references in transaction details.

---

## Summary of Paths Covered

✅ **List view:** Both tabs, all filters, sorting, empty states, loading  
✅ **Search:** Partner name and document number  
✅ **Filters:** Age buckets, direction (transactions tab), overdue toggle  
✅ **Summary cards:** All four, click navigation, totals reconciliation  
✅ **Navigation:** Partner deep-link, transaction deep-link  
✅ **Export:** CSV download with correct format  
✅ **Responsiveness:** Mobile/tablet/desktop layouts  
✅ **Accessibility:** Keyboard, color contrast, i18n  
✅ **Error handling:** API failure, empty state, filtered empty state  
✅ **Data reconciliation:** Summary vs. list, dashboard vs. debts, debts vs. partners/payments  
✅ **API contract:** Endpoint, method, response shape  

---

## Testing Checklist

- [ ] Load `/debts` and verify initial state (summary cards, both tabs, default filters)
- [ ] Click each summary card and verify filter preset applied
- [ ] Search for partner name; search for document number; verify results
- [ ] Cycle through age buckets and verify row counts change
- [ ] On transactions tab, toggle direction segmented and verify row counts
- [ ] Sort by each option (Остаток, Возраст, Дата) and verify row order
- [ ] Click "Только просроченные" chip and verify only overdue rows shown
- [ ] Click a partner row and verify navigate to partner detail
- [ ] Click a transaction row and verify navigate to correct sale/supply detail
- [ ] Export CSV and verify file contains expected columns and rows
- [ ] Test on mobile viewport and verify responsive layout
- [ ] Verify all Russian text matches i18n keys
- [ ] Verify no arithmetic signs (+/−) on amounts, only colour
- [ ] Test with filters and confirm empty-state text is "Ничего не найдено"
- [ ] Test with no data and confirm empty-state text is "Нет открытых задолженностей"
- [ ] Verify progress bars in "Paid" column match percentage
- [ ] Verify overdue chips only appear when overdueDays > 0
- [ ] Verify summary card totals match sum of underlying rows
- [ ] Check Network tab and verify GET /api/debts is called with no query params
- [ ] Test on slow network and verify loading spinner displays
- [ ] Verify keyboard navigation (Tab, Enter, Escape) works on all interactive elements
