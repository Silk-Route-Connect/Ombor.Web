# Dashboard Module — Browser Test-Case Document

## Overview
The Dashboard (Главное) is a **read-only morning briefing** at the landing route (`/`). It displays KPI cards, two charts (sales/supplies and payments), aging receivables, top debtors, and a recent transactions preview. No data entry; navigation-only. The dashboard is mocked and debt-derived figures reconcile with the **Долги** (Debts) page.

---

## Test Cases

### DASHBOARD-01: Page Load — Initial Render with Data
**Preconditions:** User is logged in; tenant has existing data (debts, transactions, wallets).
**Steps:**
1. Navigate to `/` (dashboard landing page)
2. Wait for page load completion

**Expected result:**
- Page displays without error
- Header shows "Главное" title
- Subtitle displays business name (e.g., "Никитин Маркет") and period sub (e.g., "Этот месяц · по дням")
- Period selector visible in top-right showing three options: "Сегодня", "Неделя", "Месяц"
- Four KPI cards render below header: "Выручка", "Нам должны", "Мы должны", "Просрочено"
- All amounts animate in (count-up from 0 to final value) if motion is enabled
- Two main charts visible with legends and toggle buttons
- "Дебиторка по срокам" (Aging) panel with stacked bar
- "Топ должников" (Top Debtors) list
- "Последние транзакции" (Recent Transactions) table
- No loading spinner visible after render completes

**Reconciliation:**
- KPI receivable total matches `GET /api/debts` with direction="Receivable" sum
- KPI payable total matches `GET /api/debts` with direction="Payable" sum
- KPI overdue total matches aged receivables (>30 days) from the same mock
- Aging buckets sum to receivable total
- Top debtors list (up to 5) matches top partners by outstanding receivable
- Recent transactions sample is self-contained (mock preview)

---

### DASHBOARD-02: Period Selector — "Сегодня" (Today)
**Preconditions:** Dashboard loaded with "Месяц" (month) selected.
**Steps:**
1. Click the "Сегодня" button in the period control
2. Wait for data to reload

**Expected result:**
- Period selector updates to show "Сегодня" active
- Subtitle changes to "Сегодня · по часам"
- Revenue KPI chart shows hourly breakdown (labels like "09:00", "11:00", "13:00", etc.)
- Both charts (sales/supplies + payments) re-animate with new period data
- KPI cards count up to new values
- Aging and top debtors panels update (snapshot independent of period)

---

### DASHBOARD-03: Period Selector — "Неделя" (Week)
**Preconditions:** Dashboard loaded with "Сегодня" selected.
**Steps:**
1. Click the "Неделя" button in the period control
2. Wait for data to reload

**Expected result:**
- Period selector updates to show "Неделя" active
- Subtitle changes to "Неделя · по дням"
- Revenue KPI chart shows 7-day breakdown (labels like "17.06", "18.06", etc.)
- Charts re-render and re-animate
- KPI values update appropriately

---

### DASHBOARD-04: Period Selector — "Месяц" (Month)
**Preconditions:** Dashboard loaded with "Неделя" selected.
**Steps:**
1. Click the "Месяц" button in the period control
2. Wait for data to reload

**Expected result:**
- Period selector updates to show "Месяц" active
- Subtitle changes to "Этот месяц · по дням"
- Revenue KPI chart shows samples from start of month to today at 3-day intervals
- Charts re-animate; period-driven KPI values update

---

### DASHBOARD-05: KPI Card — "Выручка" (Revenue) Click Navigation
**Preconditions:** Dashboard loaded with data.
**Steps:**
1. Click the "Выручка" card

**Expected result:**
- User navigates to `/sales` (Sales list page)
- Card hover state shows slight elevation, border color lightens, and arrow appears

---

### DASHBOARD-06: KPI Card — "Нам должны" (Receivable) Click Navigation
**Preconditions:** Dashboard loaded with data.
**Steps:**
1. Click the "Нам должны" card

**Expected result:**
- User navigates to `/debts` with receivable filter pre-applied
- `debtStore.applyCard("receivable")` is invoked
- Debts page shows receivable transactions only
- Card shows green text/sparkline; no +/− sign (colour only per design)

---

### DASHBOARD-07: KPI Card — "Мы должны" (Payable) Click Navigation
**Preconditions:** Dashboard loaded with data.
**Steps:**
1. Click the "Мы должны" card

**Expected result:**
- User navigates to `/debts` with payable filter pre-applied
- `debtStore.applyCard("payable")` is invoked
- Card shows red text/sparkline; no +/− sign

---

### DASHBOARD-08: KPI Card — "Просрочено" (Overdue) Click Navigation
**Preconditions:** Dashboard loaded with data; some overdue receivables exist (age >30 days).
**Steps:**
1. Click the "Просрочено" card

**Expected result:**
- User navigates to `/debts` with overdue filter pre-applied
- `debtStore.applyCard("overdue")` is invoked
- Card footnote shows count of overdue transactions in plural-aware Russian (e.g., "2 транзакции", "7 транзакций")

---

### DASHBOARD-09: KPI Card — Period Delta Badge
**Preconditions:** Dashboard loaded.
**Steps:**
1. Observe delta badges on all KPI cards (e.g., revenue shows "+12.4%", receivable shows "+5.1%", payable shows "−2.3%")

**Expected result:**
- Revenue badge shows up tone (green arrow + percentage)
- Receivable badge shows up tone (green arrow) — receives debt increase as positive
- Payable badge shows down tone (red arrow) — owes debt decrease as positive
- Overdue badge shows warning tone (orange icon) with transaction count instead of percentage
- All badges display "—" for null deltaPct
- Badges animate count-up of percentage values along with KPI amounts

---

### DASHBOARD-10: KPI Card Sparklines
**Preconditions:** Dashboard loaded.
**Steps:**
1. Observe sparkline in each KPI card (small mini line chart below the amount)

**Expected result:**
- Revenue sparkline: teal (#12676B) smooth area line
- Receivable sparkline: green (#17835A) smooth area line
- Payable sparkline: red (#C53D31) smooth area line
- Overdue sparkline: orange (#C57E14) smooth area line
- Sparklines animate on mount/period change if motion preference is enabled
- Hover over card → sparkline opacity increases

---

### DASHBOARD-11: "Динамика продаж и поставок" Chart — Default Line View
**Preconditions:** Dashboard loaded.
**Steps:**
1. Observe the left chart panel titled "Динамика продаж и поставок"
2. Legend shows "Продажи" (teal) and "Поставки" (saffron)
3. Chart displays smooth area-filled lines

**Expected result:**
- Sales (Продажи) line in teal (theme.palette.primary.main)
- Supplies (Поставки) line in saffron (theme.palette.secondary.main)
- Smooth area-filled curves with light fill opacity
- Y-axis shows formatted amounts (e.g., "2M", "4M")
- X-axis shows period labels (hourly for today, daily for week/month)
- Hover over chart → tooltip shows both series amounts for that point

---

### DASHBOARD-12: "Динамика продаж и поставок" Chart — Toggle to Bars
**Preconditions:** Dashboard loaded; sales/supplies chart in line mode.
**Steps:**
1. Click the "Столбцы" toggle button in the chart panel toolbar

**Expected result:**
- Chart switches to bar mode
- Sales and supplies render as separate bar groups (teal + saffron)
- Bar radius: top 3px
- Smooth animation transition if motion enabled
- Toggle button now shows line icon/label to switch back

---

### DASHBOARD-13: "Динамика продаж и поставок" Chart — Toggle Back to Lines
**Preconditions:** Chart in bar mode.
**Steps:**
1. Click the "Линия" toggle button

**Expected result:**
- Chart switches back to line/area mode
- Smooth animation transition

---

### DASHBOARD-14: "Платежи" Chart — Default Diverging Bars
**Preconditions:** Dashboard loaded.
**Steps:**
1. Observe the right chart panel titled "Платежи" (Payments)
2. Legend shows "Поступления" (green) and "Выплаты" (red)
3. Chart displays diverging bars

**Expected result:**
- Inflows (Поступления) rendered as green bars above the zero line
- Outflows (Выплаты) rendered as red bars below the zero line
- Zero reference line visible (horizontal at y=0)
- Y-axis shows absolute values (no negative labels, e.g., "2M" not "−2M")
- Tooltip shows payin, payout, and net (payin − payout) on hover
- Wallet filter dropdown visible in toolbar ("Все кассы" by default)

---

### DASHBOARD-15: "Платежи" Chart — Toggle to Net Line
**Preconditions:** Payments chart in diverging bars mode.
**Steps:**
1. Click the "Нетто" toggle button in the chart panel toolbar

**Expected result:**
- Chart switches to net-flow line mode
- Single line showing net cash flow (payin − payout)
- Line color: primary (teal)
- Area fill light teal
- Dots at data points (r=2.6)
- Smooth animation transition

---

### DASHBOARD-16: "Платежи" Chart — Wallet Filter "Все кассы"
**Preconditions:** Payments chart displayed.
**Steps:**
1. Click the wallet filter dropdown (shows "Все кассы")
2. Confirm "Все кассы" is checked

**Expected result:**
- Dropdown menu opens showing:
  - "Все кассы" (icon: layers) — checked
  - Three wallet options: "Наличные UZS" (cash), "Банковский счёт" (bank), "Карта" (card)
- Chart shows combined payments from all wallets
- Close dropdown

---

### DASHBOARD-17: "Платежи" Chart — Wallet Filter — Select Single Wallet
**Preconditions:** Payments chart with wallet filter open on "Все кассы".
**Steps:**
1. Click "Банковский счёт" (bank wallet)
2. Observe chart update

**Expected result:**
- Dropdown closes
- Filter button now shows "Банковский счёт" (bank icon instead of layers)
- Chart re-renders showing only payments for the selected wallet
- Payin/payout values filtered to that wallet's subset (aligned from `walletPayin[index]` / `walletPayout[index]`)
- Tooltip still shows three rows (payin, payout, net) but narrowed to the wallet

---

### DASHBOARD-18: "Платежи" Chart — Wallet Filter — Select Cash Wallet
**Preconditions:** Payments chart with bank wallet selected.
**Steps:**
1. Click wallet filter dropdown
2. Click "Наличные UZS" (cash)

**Expected result:**
- Chart updates to show cash wallet payments only
- Filter button shows "Наличные UZS" with cash icon

---

### DASHBOARD-19: "Платежи" Chart — Wallet Filter — Switch Back to All
**Preconditions:** Payments chart with single wallet selected.
**Steps:**
1. Click wallet filter dropdown
2. Click "Все кассы"

**Expected result:**
- Chart updates to show combined payments
- Filter button shows "Все кассы" with layers icon

---

### DASHBOARD-20: "Дебиторка по срокам" (Aging Panel) — Overview
**Preconditions:** Dashboard loaded with receivable data.
**Steps:**
1. Observe the "Дебиторка по срокам" panel on the right side

**Expected result:**
- Title: "Дебиторка по срокам"
- Overdue amount displayed prominently (heading on left): e.g., "1,500,000 UZS" in warning color
- If overdue > 0: orange badge showing "⚠ X транзакций" (e.g., "⚠ 2 транзакций")
- If overdue = 0: no badge; overdue amount in gray disabled color
- Stacked proportion bar showing 4 age buckets with escalating colors:
  - 0–7 days: green (success.main)
  - 8–30 days: teal (primary.main)
  - 31–60 days: orange (warning.main)
  - 60+ days: red (error.main)
- Bar animates in from zero width on mount
- Below bar: 4 rows with legend dot + bucket label + amount + percentage
- Footer border + "Всего к получению" label + total receivable in green

---

### DASHBOARD-21: "Дебиторка по срокам" — Period Change Re-animation
**Preconditions:** Aging panel loaded.
**Steps:**
1. Click period selector to change (e.g., "Неделя")
2. Observe aging panel

**Expected result:**
- Stacked bar widths re-animate smoothly (staggered transition per bucket: 90ms delays)
- Amounts update (new snapshot)
- Total receivable updates if period affects debt snapshot

---

### DASHBOARD-22: "Топ должников" (Top Debtors) — List Display
**Preconditions:** Dashboard loaded; receivable partners exist.
**Steps:**
1. Observe the "Топ должников" panel

**Expected result:**
- Title: "Топ должников"
- List of up to 5 partners sorted by outstanding receivable (descending)
- Each row shows:
  - Avatar: first letter of partner name in circle (background: primary.light, text: primary.main)
  - Name (truncated with ellipsis if long)
  - Company name or "Без компании" (gray, smaller font)
  - Outstanding amount in red (error.main), right-aligned, no +/− sign
- Each row clickable with hover background (gray25)
- Footer: "Все партнёры" link with right arrow, clickable

---

### DASHBOARD-23: "Топ должников" — Debtor Row Click Navigation
**Preconditions:** Dashboard loaded with top debtors visible.
**Steps:**
1. Click a debtor row (e.g., first partner)

**Expected result:**
- User navigates to `/partners/{partnerId}` (partner detail page)
- Navigation passes the clicked partner's ID

---

### DASHBOARD-24: "Топ должников" — "Все партнёры" Link Click
**Preconditions:** Dashboard loaded; top debtors panel visible.
**Steps:**
1. Click the "Все партнёры" link at the bottom of the panel

**Expected result:**
- User navigates to `/partners` (full partners list)

---

### DASHBOARD-25: "Последние транзакции" (Recent Transactions) — Table Overview
**Preconditions:** Dashboard loaded with transaction data.
**Steps:**
1. Observe the "Последние транзакции" table at the bottom

**Expected result:**
- Title: "Последние транзакции"
- Header row with columns: Дата · Партнёр · Тип · Сумма · Оплачено · Статус
- Up to 8 recent transactions displayed (rows: sales + supplies)
- Each row shows:
  - Date/time (formatted, e.g., "24.06.2026 14:20")
  - Partner name
  - Type icon + badge: Sales (green box + NorthEastIcon) or Supply (brown box + ShippingIcon)
  - Total amount (right-aligned, numeric font)
  - Paid amount (right-aligned, secondary color)
  - Status chip: "Оплачено" (green) / "Частично" (orange) / "Не оплачено" (red)
- Row hover → background color changes to gray25
- Three explicit links in header: "Все продажи" · "Все поставки" · "Все заказы"

---

### DASHBOARD-26: "Последние транзакции" — Transaction Row Click
**Preconditions:** Recent transactions table visible.
**Steps:**
1. Click a transaction row (any cell)

**Expected result:**
- Toast notification appears: "Открытие: Продажа #5000" (or Supply #...)
- No navigation (self-contained mock preview, not deep-linking to detail)

---

### DASHBOARD-27: "Последние транзакции" — "Все продажи" Link
**Preconditions:** Recent transactions table visible.
**Steps:**
1. Click the "Все продажи" link in the table header

**Expected result:**
- User navigates to `/sales` (Sales list page)
- List shows sales + sale-refunds

---

### DASHBOARD-28: "Последние транзакции" — "Все поставки" Link
**Preconditions:** Recent transactions table visible.
**Steps:**
1. Click the "Все поставки" link

**Expected result:**
- User navigates to `/supplies` (Supplies list page)
- List shows supplies + supply-refunds

---

### DASHBOARD-29: "Последние транзакции" — "Все заказы" Link
**Preconditions:** Recent transactions table visible.
**Steps:**
1. Click the "Все заказы" link

**Expected result:**
- User navigates to `/orders` (Orders list page)

---

### DASHBOARD-30: Empty State — Welcome Banner (New Business)
**Preconditions:** Tenant is new; no revenue, debts, or transactions.
**Steps:**
1. Load dashboard
2. Wait for data to load

**Expected result:**
- Instead of KPI cards and charts, a welcome banner displays:
  - Heading: "Добро пожаловать в Ombor!"
  - Body text: "Несколько шагов — и складской учёт переедет из тетради в систему. Начните с трёх простых действий, остальное появится здесь само."
  - Three numbered step cards (1, 2, 3) in grid layout:
    1. "Добавьте товары" → navigates to `/products`
    2. "Добавьте партнёров" → navigates to `/partners`
    3. "Создайте первую продажу" → navigates to `/sales/new`
  - Each card has light teal background, border on hover, slight lift animation
  - KPI cards, charts, aging, debtors, and recent transactions are hidden
- Subtitle shows "новый бизнес"

---

### DASHBOARD-31: Welcome Banner — Step 1 Card Click
**Preconditions:** Welcome banner visible (new business).
**Steps:**
1. Click the "Добавьте товары" (Add Products) card

**Expected result:**
- User navigates to `/products` (Products list)

---

### DASHBOARD-32: Welcome Banner — Step 2 Card Click
**Preconditions:** Welcome banner visible (new business).
**Steps:**
1. Click the "Добавьте партнёров" (Add Partners) card

**Expected result:**
- User navigates to `/partners` (Partners list)

---

### DASHBOARD-33: Welcome Banner — Step 3 Card Click
**Preconditions:** Welcome banner visible (new business).
**Steps:**
1. Click the "Создайте первую продажу" (Create First Sale) card

**Expected result:**
- User navigates to `/sales/new` (New Sale POS)

---

### DASHBOARD-34: Layout Responsiveness — Desktop (Lg)
**Preconditions:** Viewport width ≥ 1200px; dashboard loaded.
**Steps:**
1. Observe layout

**Expected result:**
- KPI cards: 4-column grid
- Charts + panels grid: 7fr (left) / 3fr (right)
  - Left: Sales/Supplies chart (full width of left column)
  - Right: Aging panel, Payments chart, Top Debtors stacked
- Recent transactions table spans full width below

---

### DASHBOARD-35: Layout Responsiveness — Tablet (Md)
**Preconditions:** Viewport width 960–1199px; dashboard loaded.
**Steps:**
1. Resize browser to tablet width (e.g., 900px)
2. Observe layout

**Expected result:**
- KPI cards: 2-column grid
- Charts grid collapses to single column (Sales/Supplies, then Aging, then Payments, then Debtors)
- Recent transactions remains full width

---

### DASHBOARD-36: Layout Responsiveness — Mobile (Xs)
**Preconditions:** Viewport width < 600px; dashboard loaded.
**Steps:**
1. Resize browser to mobile width (e.g., 375px)
2. Observe layout

**Expected result:**
- KPI cards: 1-column grid (stack vertically)
- Charts: 1-column (Sales/Supplies full width, then Aging, then Payments, then Debtors)
- Recent transactions table remains (may scroll horizontally)
- All text readable; no overlap

---

### DASHBOARD-37: Error Handling — Load Failure
**Preconditions:** Mock API configured to fail (e.g., 401 Unauthorized).
**Steps:**
1. Navigate to dashboard
2. Wait for load attempt

**Expected result:**
- Loading spinner visible initially
- After timeout, spinner disappears
- Error notification appears: "Не удалось загрузить сводку"
- Dashboard does not display any KPI data, charts, or panels
- Page remains accessible; user can retry or navigate away

---

### DASHBOARD-38: Loading State
**Preconditions:** Dashboard not yet loaded (e.g., fresh page load).
**Steps:**
1. Load dashboard; observe during the 300ms mock delay

**Expected result:**
- Loading spinner (CircularProgress) visible in center of page
- Spinner disappears once data loads
- Page animates in content (if motion enabled) with staggered delays

---

### DASHBOARD-39: Motion Preferences — Reduced Motion Enabled
**Preconditions:** User has prefers-reduced-motion enabled in OS settings.
**Steps:**
1. Load dashboard
2. Observe animations

**Expected result:**
- KPI count-up animations disabled (values display instantly)
- Chart animations disabled
- Staggered children animations disabled (all content visible immediately)
- Aging bar stacked animation disabled
- Sparklines don't animate
- Page remains fully functional; layout identical to motion-enabled state

---

### DASHBOARD-40: Reconciliation — Receivable Total vs Debts Module
**Preconditions:** Dashboard and Debts pages both load.
**Steps:**
1. Note receivable total on dashboard KPI card (e.g., "2,500,000 UZS")
2. Navigate to `/debts`
3. Check the "Нам должны" summary card total

**Expected result:**
- Debts page "Нам должны" total matches dashboard receivable KPI value
- Both sourced from the same `listDebts()` seed in the mock

---

### DASHBOARD-41: Reconciliation — Payable Total vs Debts Module
**Preconditions:** Dashboard and Debts pages both load.
**Steps:**
1. Note payable total on dashboard KPI card (e.g., "1,200,000 UZS")
2. Navigate to `/debts`
3. Check the "Мы должны" summary card total

**Expected result:**
- Debts page "Мы должны" total matches dashboard payable KPI value

---

### DASHBOARD-42: Reconciliation — Overdue Total and Count vs Debts
**Preconditions:** Dashboard and Debts pages both load; overdue receivables exist.
**Steps:**
1. Note overdue amount and count on dashboard "Просрочено" card
2. Navigate to `/debts` → click "Просрочено" card or filter to overdue
3. Verify the total and transaction count

**Expected result:**
- Overdue total matches the sum of receivables aged >30 days
- Transaction count matches the number of overdue receivables
- Both computed from the same debt seed

---

### DASHBOARD-43: Reconciliation — Aging Buckets Sum
**Preconditions:** Dashboard loaded.
**Steps:**
1. Observe aging panel bucket amounts and percentages
2. Add up all four bucket amounts

**Expected result:**
- Sum of all bucket amounts equals the receivable total
- Percentages sum to 100% (within rounding)

---

### DASHBOARD-44: Reconciliation — Top Debtors vs Debts by Partner
**Preconditions:** Dashboard loaded; navigate to `/debts` → "По партнёрам" tab.
**Steps:**
1. Note the top 5 debtors on dashboard and their amounts
2. Check the grouped debts by partner list

**Expected result:**
- Dashboard top debtors (largest to smallest) match the first 5 partners in the debts "По партнёрам" list
- Amounts align

---

### DASHBOARD-45: Accessibility — Keyboard Navigation
**Preconditions:** Dashboard loaded.
**Steps:**
1. Press Tab key repeatedly to cycle through interactive elements
2. Verify focus order

**Expected result:**
- Period selector buttons are focusable
- KPI cards are focusable; Enter/Space triggers click
- Chart toggle buttons are focusable
- Wallet filter button is focusable
- Top debtors rows are focusable
- Recent transaction rows are focusable
- All explicit links ("Все продажи", etc.) are focusable
- Focus order is logical (left-to-right, top-to-bottom)
- Visual focus ring appears (MUI default)

---

### DASHBOARD-46: Accessibility — Aria Labels
**Preconditions:** Dashboard loaded; screen reader active.
**Steps:**
1. Use screen reader to navigate KPI cards

**Expected result:**
- KPI card announces: "Выручка [amount] UZS, [delta], [footnote]"
- Card is identified as button/clickable
- Receivable/payable cards announced as "Нам должны" / "Мы должны"

---

### DASHBOARD-47: Data Persistence — Period Selection Across Navigation
**Preconditions:** Dashboard loaded; period set to "Неделя".
**Steps:**
1. Change period to "Сегодня"
2. Navigate to `/sales`
3. Return to dashboard

**Expected result:**
- Period selection resets to "Месяц" (the default; no persistence across page reload)
- OR if sessionStorage is implemented: period remains "Сегодня"

**Designed-gap note:** Per CLAUDE.md, period persistence is not specified. Current implementation resets on reload (default="month" in store).

---

### DASHBOARD-48: Header Styling — Title and Subtitle
**Preconditions:** Dashboard loaded.
**Steps:**
1. Observe page header

**Expected result:**
- Title: "Главное" (fontSize 22, fontWeight 700, letterSpacing -0.02em)
- Subtitle: "Никитин Маркет · Этот месяц · по дням" (business name · period sub, smaller font)
- Period control right-aligned in header, no subtitle overlap

---

### DASHBOARD-49: Theme Consistency — Color Usage
**Preconditions:** Dashboard loaded.
**Steps:**
1. Verify all visual elements use theme colors

**Expected result:**
- Revenue sparkline: #12676B (teal)
- Receivable (success): #17835A green
- Payable (error): #C53D31 red
- Overdue (warning): #C57E14 orange
- All dividers: theme.palette.divider
- All text: theme.palette.text.primary / secondary / disabled
- Background surfaces: theme.palette.background.paper (white on light theme)

---

### DASHBOARD-50: Chart Legend Colors
**Preconditions:** Dashboard loaded.
**Steps:**
1. Verify chart legend swatches

**Expected result:**
- Sales/Supplies legend: teal + saffron (theme.palette.primary + secondary)
- Payments legend: green (success) + red (error) + teal (primary for net)
- Aging legend: green (0–7), teal (8–30), orange (31–60), red (60+)

---

### DASHBOARD-51: Numeric Formatting — Currency Display
**Preconditions:** Dashboard loaded with various amount values.
**Steps:**
1. Observe KPI card amounts
2. Check chart axis labels
3. Check aging panel amounts
4. Check top debtors amounts
5. Check recent transactions amounts

**Expected result:**
- All amounts formatted via `formatCurrency()` utility
- Large numbers abbreviated (e.g., "2.5M", "150K")
- Amounts right-aligned in tables/lists
- Numeric font (tabular numbers): `numericSx` applied
- UZS suffix on KPI revenue/overdue cards (smaller, secondary color)
- No thousand separators (format function handles display)

---

### DASHBOARD-52: Numeric Formatting — Percentages
**Preconditions:** Dashboard loaded.
**Steps:**
1. Observe delta badges on KPI cards (e.g., "+12.4%", "−2.3%")
2. Check aging panel percentages (e.g., "45%")

**Expected result:**
- Percentages show 1 decimal place (e.g., "+12.4%")
- Negative percentages show minus sign (e.g., "−2.3%")
- "—" displayed for null values (overdue delta)

---

### DASHBOARD-53: Numeric Formatting — Chart Axis Labels
**Preconditions:** Dashboard loaded with different period selections.
**Steps:**
1. Observe Y-axis labels on charts (sales/supplies and payments)

**Expected result:**
- Large numbers formatted as short (e.g., "4M", "200K")
- Font-size: 11px, fontWeight 600, color: #5E6E6E
- Payments chart Y-axis shows absolute values (e.g., "4M" not "−4M" for payout)

---

### DASHBOARD-54: Timezone Handling — Date/Time Display
**Preconditions:** Dashboard loaded; recent transactions visible.
**Steps:**
1. Verify recent transaction dates/times are correct
2. Check timestamp formatting

**Expected result:**
- Dates formatted as "ДД.МММ.ГГГГ ЧЧ:МЫ" (e.g., "24.06.2026 14:20")
- Times reflect transaction ISO datetime
- No timezone suffix shown (all dates in UTC or local per app config)

---

### DASHBOARD-55: Mock Data Stability — Seeded Randomness
**Preconditions:** Load dashboard multiple times without changing mock data.
**Steps:**
1. Note chart values and KPI amounts
2. Refresh page
3. Note same values again

**Expected result:**
- Chart series values remain identical across reloads
- KPI amounts don't change (deterministic seeded pseudo-random in mock)
- Recent transaction data identical
- This ensures test stability (no flaky assertions on "roughly X amount")

---

## Design Gaps & Known Limitations

### Designed-Gap-01: No Custom Date Range
The period control is hardcoded to three options (Сегодня/Неделя/Месяц). The prototype's "Свой период" (custom date-range popover) is omitted per locked pattern 12 (deferred for future UX iteration).

### Designed-Gap-02: No Dashboard Export (PDF/PNG)
The chart panels in the prototype show download buttons. Dashboard export is deferred to the Reports v2 module per the current product plan. Not implemented.

### Designed-Gap-03: No Demo Data Toggle
The prototype shows a «Пример: С данными / Новый бизнес» switch to toggle between demo state and new business. This is a design device, not app UI—omitted per docs/product-brief.md.

### Designed-Gap-04: Aging Definition — 31+ Days vs Past-Due Date
The dashboard's "Просрочено" card shows receivables aged 31+ days from the transaction date. The `/debts` page's "Просрочено" (overdue) filter may use a different definition (past due date). Both are correct per their respective business rules but may show different counts/totals. This is a faithful divergence per the mvp-plan §2 requirements; not a bug.

### Designed-Gap-05: Recent Transactions — No Deep Linking
Clicking a recent transaction row shows an info toast only—no navigation to the transaction detail. This is by design (a briefing preview, not a full browser). Full list navigation is via the explicit "Все продажи" / "Все поставки" / "Все заказы" links.

### Designed-Gap-06: Top Debtors — No Direct Count Display
Top debtors list shows names/amounts only, not the count of open transactions per debtor. This is intentional (minimalist card design). Full transaction count is on `/debts` → "По партнёрам" tab.

### Designed-Gap-07: Aging Banner Buckets — No Period Filter
Aging buckets show a current snapshot (not period-driven). Switching the period changes the snapshot (different underlying debts) but the bucketing logic remains the same. This is correct per the design.

### Designed-Gap-08: Mock Limitation — Stock Mutations Not Simulated
Recent transaction data is illustrative (self-contained preview). Creating a real sale/supply via the app does NOT update the dashboard's revenue/recent transactions or affect the mock debts. This is a known mock limitation for MVP; production reconciliation will be automatic via the backend.

### Designed-Gap-09: Mock Limitation — Wallet Advances Not Shown
The payments chart does NOT account for advance-in or advance-out transactions separately. Only Income/Expense directions are shown. Advance operations are part of the Payments module but are illustrative in the chart (seeded deterministically, not derived from real payment records).

---

## Summary

The Dashboard module is a **read-only briefing with no mutations**. All test cases focus on:
- **Data display accuracy** (KPI amounts, chart rendering, aging buckets, debtors, recent transactions)
- **Navigation flows** (all clickable elements route correctly to their targets)
- **Reconciliation** (dashboard figures match underlying module pages)
- **Period switching** (chart and KPI re-render correctly for different time windows)
- **Responsive layouts** (desktop / tablet / mobile breakpoints)
- **Accessibility** (keyboard navigation, screen reader labels)
- **Styling and formatting** (currency, percentage, date/time display)
- **Empty state** (welcome banner for new business)
- **Error handling** (load failure notifications)

The module is **fully mocked** at `/api/dashboard` (no backend endpoint). Debt-derived figures (receivable/payable/overdue/aging/topDebtors) reconcile with the `/api/debts` mock, fulfilling the mvp-plan §2 "Done" criterion.

