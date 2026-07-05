# Findings 2 — Triage & Prep

> Triaged copy of `Findings 2.md`, prepared for the Chat → Design → Code workflow.
> Every item from the source is represented here — nothing dropped. Wording was rewritten for clarity and so each item is self-contained when pasted into a session. Recurring "instances of one underlying pattern" are pulled up into **Track A (Foundational)** and the per-module entries point back to them, so we fix the shared component once instead of patching every module.
>
> **Why this shape:** you flagged that some work (tables, chips, action menu, links…) needs a global refactor _before_ module-by-module polish. Track A is exactly that — do it first. Track B are product questions that must be **decided in Chat** before Design or Code can act. Track C are real bugs / data-integrity issues. Track D is the per-module polish, most of which is just instances of A or simple Code fixes.

---

## How to use this doc

**Priority** (reusing the Round-1 legend): **Blocker** (cannot use / data loss) · **High** (core flow broken or data wrong) · **Med** (degraded, workaround exists) · **Low** (cosmetic / polish).

**Venue** (your three operating venues):

- **Chat** — product/logic decisions and brainstorming. Resolve these first; their answers unblock Design/Code.
- **Design** — visual/UX exploration as interactive prototypes. Use when the _look or interaction_ needs deciding, not just the data.
- **Code** — implementation against the real codebase. Use when the fix is decided and unambiguous.
- **Backend** — server-side or DB change (called out so it routes to the backend Code session, not the frontend one).

A **path** like `Chat → Design → Code` means the item travels through those venues in order. `Code` alone means it can go straight to implementation.

**ID scheme:** `G#` foundational · `D#` decision · `B#` bug · module prefixes for Track D (`DSH` Dashboard, `PRD` Products, `WH` Warehouses, `ADJ` Adjustments, `TRF` Transfers, `PRT` Partners, `ORD` Orders, `TXN` Transactions, `TPL` Templates, `PAY` Payments, `DBT` Debts, `WAL` Wallets, `HDR` Header). `F-###` refers back to Round-1 `Findings.md`.

---

## Recommended sequence

1. **Decisions round (Track B, Chat).** Knock out the product questions first — especially the ones that fan out across modules (archive behavior, column-order convention, link approach, "Both" rename, filter layout). Several Track A and Track D items are blocked on these.
2. **Foundational refactor (Track A, mostly Design → Code).** Lock the canonical table, chip, action-menu, link, and typography patterns in Design, then refactor them globally in Code. Doing this first means the per-module list collapses dramatically.
3. **Bugs & data integrity (Track C, Code/Backend).** Can run in parallel with 1–2; B1 (warehouse-optional) and B2 (rejected-order crash) shouldn't wait.
4. **Per-module polish (Track D).** After A is in, most of these are either already fixed (they were instances of A) or are one-line Code changes.

**Counts:** Track A foundational = 14 · Track B decisions = 13 · Track C bugs = 13 · Track D module items ≈ 110. The large majority of Track D resolves through Track A.

---

# Track A — Foundational / global (do first)

These are shared components and conventions. Each one, fixed once, closes a long list of per-module instances. Most need a short Design pass to lock the canonical pattern, then a Code refactor.

**G1 · Shared table component** — _Med · Design → Code_
Tables differ across modules: header background (white in Warehouses / Adjustments / Templates / Wallets vs gray in Products / Partners / Categories), row height (Warehouses taller than Partners/Products), and header/footer band colors. Confirm there is **one** table component, lock the canonical look in Design, and refactor every list to it. _Round-1: F-025. Instances: WH-1, WH-3, ADJ-1, TPL-1, WAL-5, PAY-20._

**G2 · Sortable columns** — _Med · Chat (which columns) → Code_
Sorting is missing or partial on most tables. Decide the rule (default: every column sortable except free-text/action columns) and make it a table-level capability rather than per-page. _Instances: PRD-4, WH-20, PRT-3, TXN-5, PAY-5, DBT-4, WAL-4, TPL-4._

**G3 · Pagination defaults** — _Low · Code_
Standardize rows-per-page options to **10 / 25 / 50** everywhere. Several pages still show 25 / 50 / 100. _Instances: ORD-3, TXN-4, TPL-2._

**G4 · Shared link component** — _Med · Chat (approach) → Code_
Almost every "X should be a link" item below is the same gap: there's no shared, consistently-styled link. **Decision needed:** one flexible `<EntityLink>` vs. thin typed wrappers (`PartnerLink`, `ProductLink`, `WarehouseLink`, `WalletLink`) over a shared base. Recommendation: a shared base **plus** typed wrappers — wrappers keep call sites short and encode each entity's route, the base keeps styling/underline-on-hover identical. Then sweep all tables/details. _Instances: DSH-9, PRD-10, PRD-16, WH-22, WH-25, WH-26, ADJ-2, TRF-1, PAY-6, PAY-15, WAL-7, plus Orders/Transactions partner & warehouse cells._

**G5 · Chip / badge system** — _Med · Design → Code_
Chips are inconsistent in color, size, and icon use. Define one badge system with a documented color semantics map (e.g. Sale vs Supply, partner type, event type, direction) and apply everywhere. Note the open question of whether Sales/Supplies should even carry color+icon (see TPL-3). _Instances: PRT-4, WH-24, TXN-3, WAL-10, TPL-3._

**G6 · Action menu (row actions)** — _Med · Design → Code_
The row "⋯" / actions tooltip differs per page: Products uses different color+icon for Edit than Category; Products & Warehouses use a separator, Category doesn't; Partners/Wallets use smaller icons and fonts. Build one reusable action-menu component and apply it. _Instances: PRT-10, WAL-1, plus Products/Category/Warehouses divergence._

**G7 · Typography scale + Date component** — _Med · Design → Code_
There's no shared type scale, so font size/weight/color drift per page, and several texts are too light to read on light backgrounds (SKU cells, measurement text, "balance after", widget dividers, the tiny fonts in the Order lines table). Define a type scale (sizes + colors, including a minimum readable contrast) and a single **Date** display component, then apply. _Instances: DSH-7, DSH-8, PRD-14, WH-21, TRF-4, ORD-8, ORD-9, PAY-14, PAY-17, PAY-18, PAY-19, WAL-8, WAL-11._

**G8 · Currency formatting** — _Low · Code_
One `formatCurrency` for display (consistent `3 500 000 UZS` spacing) **and** as-you-type thousands separators in money inputs. _Round-1: F-009 (display), F-024 (input). Already logged there — listing here so the foundational sweep doesn't miss it._

**G9 · Phone number component** — _Med · Code_
Single reusable phone input/display: `+998` affordance, E.164 normalization, and correct grouping as you type. This also fixes the live formatting bug (B6 / PRT-8). _Round-1: F-004, F-012._

**G10 · Column-order convention** — _Low · Chat (convention) → Code/Design_
Columns are ordered differently per page. Agree a default order — e.g. **ID/Number first, Date second, money/amount columns last** — and apply it (with room for justified exceptions). _Decision lives in D3. Instances: PRT-2, ORD-5, TXN-1._

**G11 · Confirmation modal** — _Low · Design → Code_
Confirm there's one shared confirmation dialog, then fix its title/icon alignment (title currently drops to a separate line below the icon) and tighten the body copy. _Instances: WH-6, PAY-11._

**G12 · Search box behavior** — _Low · Code_
Search inputs are too narrow in places, so placeholder/helper text is clipped. Decide a sensible default width (or let it flex) so helper text isn't trimmed. _Instances: WH-18, PAY-2, plus Stocks tab._

**G13 · Filter layout pattern** — _Med · Chat (decide) → Design → Code_
Some detail tables put filters **inside** the table widget (Stocks, Transfers in Warehouse detail); others (Partner → Ledger / Transactions / Payments, Wallet → Operations) keep filters and table as separate UI blocks. Decide one pattern and unify. _Decision lives in D5. Instances: PRT-16, PRT-19, WAL-6._

**G14 · Dropdown option ordering** — _Low · Code (decide rule)_
Decide and apply a consistent ordering for dropdown/select options (default: alphabetical, unless relevance/recency is clearly better for a given picker). Currently inconsistent. _Source: General line 281._

---

# Track B — Decisions to make first (Chat)

Resolve these in Chat. Each blocks Design/Code work downstream. I've added a recommendation where I have one — push back as you like.

**D1 · Archive toggle behavior (global)** — _Med_
Today the archive toggle _adds_ archived rows into the list. Across Products, Warehouses, Partners, and Wallets you asked whether toggling should instead show **only** archived items. Your own reasoning (50+ items, 10/page, archived rows scattered by sort) is the strong argument: when a user opts into "archived" they're hunting for archived things, so show only those. **Recommendation: toggle = "show only archived".** Decide once, apply everywhere. _Also resolve the archivable-entity inconsistency — see Inconsistency #1. Instances: PRD-1, WH-2, PRT-1, WAL-2._

**D2 · User-facing numbering scheme** — _Med_
Agree a friendly, consistent numbering/ID scheme and best-practice format for transactions, payments, and orders (prefixes? per-type sequences? zero-padding?). Drives display, search, and copy-to-clipboard items. _Source: General line 288._

**D3 · Column-order convention** — _Low_
The decision behind G10: lock the default column order (ID → Date → … → money last) and whether per-module exceptions are allowed. Covers "number vs date, which comes first" (PRD/ORD/TXN).

**D4 · Rename "Both" partner type** — _Low_
"Both" is unclear outside the Partners page (e.g. "John Doe · Both" on a payment). Rename to **"Customer + Supplier"** (or "Клиент + Поставщик"). Confirm the label and apply via the chip system (G5). _Relates to Round-1 F-027 (default partner should be Both). Instances: PRT-5, PAY-16._

**D5 · Filter layout pattern** — _Med_
The decision behind G13: filters **inside** the table widget vs. a separate filter block. Recommendation: pick the in-widget pattern (it reads as one unit and you already use it in Warehouse detail) and unify.

**D6 · Standalone payment & "type" column semantics** — _Med_
Three linked questions: (a) what is a standalone "Оплата" (payment outside a sale/supply) and how does it differ from Deposit/Withdrawal? (b) the Payments table "Type" column is always "Payment" — where does it come from and does it earn its place? (c) the Wallet Operations "Payment"/"Type" columns are likewise single-valued ("Transfer"/"Payment"). Clarify the model, then decide whether to keep, rename, or drop these columns. _Instances: PAY-1, PAY-8, WAL-9._

**D7 · Initial stock for an already-stocked product** — _Med_
The "Add initial stock" modal lets you add opening stock for a product that's already in the warehouse. Decide the intent: keep it, or hide already-present products from the picker and route the user to **Corrections/Adjustments** instead. Also decide sane validation bounds for quantity and price (today you can enter a billion). _Instances: WH-12, WH-13._

**D8 · WAC — naming & explanation** — _Low_
"WAC" is opaque to users. Decide a translated label and/or a helper tooltip (on the table header and the detail page) explaining what weighted-average cost is and how it's computed. _Formula is fixed by Rules.md #10. Instances: WH-16._

**D9 · Warehouse delete/empty rules** — _High_
You specified: deletable when total stock across all items is 0 (even if items exist at 0 qty); delete action shown-but-disabled with a reason when stock is present; archive always allowed. Confirm this against the business rules, then it's a Code task. **Flag:** Rules.md #15 says archive is for Product & Partner only, which contradicts this and the Design operating doc — see Inconsistency #1. _Instances: WH-5._

**D10 · Validation-message convention** — _Med_
For warehouse (and consistency elsewhere): should a failed submit show a generic "Заполните обязательные поля" at the top, or name the specific field? Reconcile with the hard rule "never silently disable; show **inline** validation errors on submit." Recommendation: inline per-field errors are the rule — a top summary can accompany but not replace them. _Instances: WH-8, and B8 is the bug where the wrong message shows._

**D11 · Date-range filter approach** — _Med_
Dashboard/Orders/Transactions diverge from the day/week/month + custom toggle pattern, using a dropdown ("whole time / day / 7 / 30 / 90 days"). Decide the canonical date-range control (and whether to add a custom range picker to the Dashboard widgets). _Also in V2 list. Instances: DSH-5, and the Dynamics/ Payments widgets._

**D12 · Negative amount sign on sales** — _Low (but clarify)_
The Transactions amount column shows a negative sign on some sales. Clarify whether this is meaningful (refund? direction?) or a display bug. _Instances: TXN-2._

**D13 · Small clarifications** — _Low_
Quick product questions to settle so copy/UX can follow: what "leftover stock" counts (all warehouses?) (PRD-7); why the Transactions-tab quantity always shows a leading "+" (PRD-13); whether "Direction" should render as a chip (WAL-10); whether to show product counts in the Adjustments product dropdown (ADJ-5).

---

# Track C — Bugs & data integrity

**B1 · Warehouse optional on Orders & Transactions → no stock write-off** — _Blocker · Backend + Code (clarify first)_
Backend treats `warehouse` as optional on orders, and most COMPLETED orders have none. Since a completed order promotes to a sale (which **must** reduce stock), a missing warehouse means stock never decrements — a correctness/data-integrity failure. Same optionality exists on Transactions. Clarify why it's optional, then make warehouse required on the relevant flows and backfill/repair existing rows. _Source: Orders detail. Relates to the agreed "select warehouse on order creation, re-confirm at close, no reservation" model._

**B2 · Rejected-order detail page crashes** — _High · Code_
Opening a rejected order throws `Cannot read properties of undefined (reading 'at')` at `TerminalBanner.tsx:96` and the page fails to render. Guard the undefined access. _Source: Orders, with stack trace._

**B3 · Refund integrity not enforced in DB** — _High · Backend_
Sale/Supply refunds exist with **null `originalTransactionId`**, which violates Rules.md #2 (required for SaleRefund/SupplyRefund). Add the DB/non-null constraint and audit existing rows. _Source: General line 286._

**B4 · Order status history empty** — _Med · Backend (clarify)_
Status history renders empty on orders; confirm whether the backend is populating/returning it. _Source: Orders detail._

**B5 · Product create modal — missing price validation** — _Med · Code_
The create modal validates name and SKU but not **category, supply price, and sale price**, which are also required — submit fails without inline errors on them. _Source: Products → Modal._

**B6 · Partner phone not grouped while typing** — _Med · Code (via G9)_
The phone field formats the `+998` prefix but not the number body: `123456789` should render `12 345 67 89` (confirm grouping pattern). Fold into the shared phone component. _Source: Partners → Modal. Instances: PRT-8._

**B7 · Payment create dropdown overflows the page** — _Med · Code_
The create-payment dropdown isn't a proper typeahead — its options overflow the whole page instead of opening below the field. _Source: Payments → Modal._

**B8 · Warehouse modal shows wrong error for over-long input** — _Low · Code_
Entering a too-long name/address surfaces "Укажите название склада — это обязательное поле," which is misleading (the field isn't empty). Show a length/validation error instead. _Source: Warehouses → Modal._

**B9 · Warehouse edit submits with no changes** — _Low · Code_
The edit form lets you submit when nothing changed. Disable submit until the form is dirty (or no-op the save). _Source: Warehouses → Modal._

**B10 · Initial-stock negative values show wrong message** — _Low · Code_
Negative price/quantity shows "укажите значение" (specify a value) instead of "не может быть отрицательным" (cannot be negative). _Source: Initial stock modal._

**B11 · Partner starting balance shows "+0"** — _Low · Code_
When starting balance is 0 it renders "+0"; drop the sign at zero. _Source: Partners → Details._

**B12 · Missing translation `product.txn.Opening`** — _Low · Code_
Raw i18n key leaks on the Movements "type" column. Add the string. _Source: Products → Movements._

**B13 · Debts → partner navigation doesn't apply filters** — _Med · Code_
Clicking through from Debts opens the partner's **Ledger** without applying filters. It should open the **Transactions** tab with the status filter preset to "open". _Source: Debts._

---

# Track D — Per-module polish

Each item is tagged `Priority · Venue`. Items that are instances of a foundational pattern point to their `G#` (do them there, not per-module). Items needing a decision point to their `D#`.

## Header

- **HDR-1** · _Low · Code_ — Make the "Create" button the same height as the search box.
- **HDR-2** · _Low · Code_ — Enlarge the notification and language icons; they read as too small next to neighboring items.

## Dashboard

- **DSH-1** · _Med · Code_ — The post-registration helper/CTA bar has no dismiss control. Add a close button so users can discard it without being forced to complete an action first.
- **DSH-2** · _Low · Code_ — Dynamics widget subtitle "Продажи против поставок · UZS" is redundant; remove it. _(Source lists this twice — see Duplicate #1.)_
- **DSH-3** · _Med · Design → Code_ — The sales widget repeats the same chart that already appears in its own dedicated widget below. Remove the in-widget mini-chart and reduce widget height.
- **DSH-4** · _Low · Design_ — On month view the x-axis dates are unevenly spaced (some cramped, some loose). Try a 10-day tick interval instead of 15.
- **DSH-5** · _Med · Design (after D11)_ — The date-range filter dropped the original "custom range" option. Add a well-designed custom range picker for longer ranges. _See D11._
- **DSH-6** · _Low_ — Payments widget has the same issues as the Dynamics widget — apply DSH-4 and DSH-5 there too. _(See Duplicate #2.)_
- **DSH-7** · _Low · Code (via G7)_ — In "Latest transactions", the "Paid" cell font differs from the "Amount" cell; unify.
- **DSH-8** · _Low · Code (via G7)_ — Same table: the date font differs from the others; unify via the Date component.
- **DSH-9** · _Low · Code (via G4)_ — Partner names should be links.

## Products

- **PRD-1** · _Med · Chat (D1)_ — Archive toggle has no "show only archived" filter, making archived products hard to find. _See D1._
- **PRD-2** · _Low · Code_ — The last column is narrower than its text, so text wraps and inflates the header height. Widen it (or truncate — see PRD-6).
- **PRD-3** · _Med · Code_ — Unit-of-measurement labels are truncated (e.g. "кор" is ambiguous between коробка/корзина). Show the full localized term. _Relates to Round-1 F-007 (unit enum/i18n)._
- **PRD-4** · _Low · Code (via G2)_ — The measurement column isn't sortable.
- **PRD-5** · _Low · Design_ — The hover sort icon appears on the **left** for price columns (stock amount, sale price, supply price) and on the **right** for others. Decide one side (right is the common convention) and apply.
- **PRD-6** · _Low · Design → Code_ — Long product names need a max width with truncation + a tooltip showing the full name on hover. Establish this as the table truncation pattern.
- **PRD-7** · _Low · Chat (D13)_ — Clarify what "leftover stock" means — total across all warehouses?
- **PRD-8** · _Med · Code_ — Create modal is missing validation errors for category, supply price, and sale price. _Tracked as B5._
- **PRD-9** · _Low · Code_ — Info tab: the per-warehouse stock list shows a redundant icon next to each warehouse name; remove it.
- **PRD-10** · _Low · Code (via G4)_ — Info tab: warehouse name should be a link.
- **PRD-11** · _Low · Code (via PRD-3)_ — Info tab: show the unit as full text with proper casing, not truncated.
- **PRD-12** · _— · Clarify_ — **Incomplete item in source:** "When the unit of measurement is 'box'" — the sentence is cut off. What's the intended issue? _(See Inconsistency/Gap list.)_
- **PRD-13** · _Low · Chat (D13)_ — Transactions tab: the quantity column always prefixes "+". Clarify the intent; drop it if it adds nothing.
- **PRD-14** · _Low · Code (via G7)_ — Transactions tab: "Price" and "Total" cells are styled differently; unify.
- **PRD-15** · _Low · Code_ — Movements: missing translation `product.txn.Opening` on the type column. _Tracked as B12._
- **PRD-16** · _Low · Code (via G4)_ — Movements: warehouse should be a link.

## Warehouses

- **WH-1** · _Med · Design → Code (via G1)_ — Table header background is white here vs gray in Products/Categories. _See G1._
- **WH-2** · _Med · Chat (D1)_ — Same archive-toggle question. _See D1._
- **WH-3** · _Low · Code (via G1)_ — Row height is taller than Partners/Products/Categories. _See G1._
- **WH-4** · _Med · Design_ — On row hover the warehouse name gets link styling, but the pointer cursor already signals clickability. The link style should instead mark **actual links** (so hovering a name tells users it's a link). Tie into the link affordance decision in G4.
- **WH-5** · _High · Chat (D9) → Code_ — Delete action is absent when a warehouse is empty. Implement: deletable at 0 total stock; shown-but-disabled with a reason when stock exists; archive always allowed. _See D9._
- **WH-6** · _Low · Design (via G11)_ — Confirmation dialog: put the title next to the icon rather than on a separate line. _See G11._
- **WH-7** · _Low · Code_ — Modal: remove the address helper text "Адрес помогает различать склады в накладных и перемещениях" — it states the obvious.
- **WH-8** · _Med · Chat (D10)_ — Modal: validation names the specific field; decide whether to use a generic "fill required fields" message for consistency. _See D10._
- **WH-9** · _Low · Code_ — Modal: an over-long value wrongly shows the "name is required" error. _Tracked as B8._
- **WH-10** · _Low · Code_ — Modal: editing lets you submit with no changes. _Tracked as B9._
- **WH-11** · _Low · Chat_ — Detail: should the button read "+ Добавить продукт" instead of "+ Начальный остаток"? Pick the clearer label.
- **WH-12** · _Med · Chat (D7) → Code_ — Initial-stock modal: no validation bounds on quantity/price. _See D7._
- **WH-13** · _Med · Chat (D7)_ — Initial-stock modal: it allows adding initial stock for an already-stocked product — clarify intent vs routing to Corrections. _See D7._
- **WH-14** · _Low · Code_ — Initial-stock helper text is too long; trim to "Будет записано как событие начального остатка с автором и временем."
- **WH-15** · _Low · Code_ — Initial-stock modal: drop the warehouse name from the title (you're already inside that warehouse).
- **WH-16** · _Low · Chat (D8) → Design_ — WAC needs a translated label and/or explanatory tooltip. _See D8._
- **WH-17** · _Low · Code_ — Initial-stock: negative values show "specify a value" instead of "cannot be negative". _Tracked as B10._
- **WH-18** · _Low · Code (via G12)_ — Stocks tab: search box is too narrow; text is clipped. _See G12._
- **WH-19** · _Low · Design_ — Stocks tab: "2 позиций показано" sits top-right; consider bottom-left.
- **WH-20** · _Low · Code (via G2)_ — Stocks tab: only price/quantity/WAC are sortable.
- **WH-21** · _Low · Code (via G7)_ — Stocks tab: SKU font is too light to read on the light table background.
- **WH-22** · _Low · Code (via G4)_ — Stocks tab: product cell should be a link (link color + underline on hover).
- **WH-23** · _Low · Code_ — Stocks tab: rename the "ед." column header to "Измерение".
- **WH-24** · _Low · Design → Code (via G5)_ — Movements: all Event chips share one color; differentiate by event type. _See G5._
- **WH-25** · _Low · Code (via G4)_ — Movements: product cell should be a link.
- **WH-26** · _Low · Code (via G4)_ — Movements: on transfer events, the destination warehouse isn't a link.

## Adjustments

- **ADJ-1** · _Med · Design → Code (via G1)_ — Table header is white vs gray in Partners/Products. _See G1._
- **ADJ-2** · _Low · Code (via G4)_ — Product and Warehouse cells should be links.
- **ADJ-3** · _Low · Design_ — New-adjustment modal: the product dropdown has both a top label and a floating border label on focus. Consider using only the placeholder ("Search products…").
- **ADJ-4** · _Med · Design → Code_ — Show the resulting final stock amount in the form so the user sees the post-adjustment result before submitting.
- **ADJ-5** · _Low · Chat (D13)_ — Consider showing product counts alongside names in the products dropdown.

## Transfers

- **TRF-1** · _Low · Code (via G4)_ — Warehouses aren't links.
- **TRF-2** · _Low · Design_ — Each row has a ">" icon not used in other tables. Decide whether it's needed; if not, remove and rely on hover + pointer.
- **TRF-3** · _Low · Design → Code_ — The "notes" column isn't shown. Consider displaying it with a max length + truncation.
- **TRF-4** · _Low · Code (via G7)_ — Details modal: SKU font is too light on the white background.

## Partners

- **PRT-1** · _Med · Chat (D1)_ — Archive-toggle behavior. _See D1._
- **PRT-2** · _Low · Design (via G10)_ — Consider moving the balance column to last (it currently sits in the middle). _See G10/D3._
- **PRT-3** · _Low · Code (via G2)_ — Columns aren't sortable.
- **PRT-4** · _Low · Design → Code (via G5)_ — "Client" and "Both" chips look identical in color. _See G5._
- **PRT-5** · _Low · Chat (D4)_ — Rename "Both" to "Customer + Supplier". _See D4._
- **PRT-6** · _Low · Design_ — The create/edit modal has grown too tall; tighten it.
- **PRT-7** · _Low · Design → Code_ — Move the Name and Company inputs onto the same row.
- **PRT-8** · _Med · Code (via G9)_ — Phone number isn't grouped while typing. _Tracked as B6._
- **PRT-9** · _Low · Code_ — Remove the long "initial balance" description text for now to make the modal more compact.
- **PRT-10** · _Low · Design → Code (via G6)_ — Actions tooltip uses smaller icons/fonts and lacks the separator used on Products. _See G6._
- **PRT-11** · _Low · Code_ — Make the helper text "Положительный = партнёр должен нам…" bold.
- **PRT-12** · _Low · Design → Code_ — Details: add copy-to-clipboard icons on contact rows (phone, address, email, Telegram).
- **PRT-13** · _Low · Code_ — Details: starting balance shows "+0" at zero; drop the sign. _Tracked as B11._
- **PRT-14** · _Med · Chat → Design → Code_ — Details: add a "Payment" button that opens a payment modal with the partner pre-selected and locked, to settle that partner's debts from their page. May need a trimmed variant of the general payment modal. _Product decision first._
- **PRT-15** · _Med · Code_ — Ledger tab: table has no pagination.
- **PRT-16** · _Med · Chat (D5)_ — Ledger tab: filters sit outside the table widget. _See D5/G13._
- **PRT-17** · _Low · Design → Code_ — Ledger tab: the "Баланс после каждой операции" helper (top-right) font is too quiet — make it noticeable or remove it if filters move inside the widget.
- **PRT-18** · _Low · Code_ — Ledger tab: add a search box for payments.
- **PRT-19** · _Med · Chat (D5)_ — Transactions & Payments tabs: same filter-layout question. _See D5._
- **PRT-20** · _Med · Code_ — Transactions & Payments tabs: no pagination.
- **PRT-21** · _Low · Code_ — Transactions & Payments tabs: add search boxes.
- **PRT-22** · _Low · Code_ — The download button exists only on the Ledger tab; add it to all tabs.

## Orders

- **ORD-1** · _High · Code_ — Opening a rejected order's detail crashes the page. _Tracked as B2._
- **ORD-2** · _Med · Design → Code (via G5/toggle)_ — The status toggle group is styled differently here; the height fix applied elsewhere wasn't applied to Orders. _Round-1: F-026._
- **ORD-3** · _Low · Code (via G3)_ — Pagination options are 25/50/100; change to 10/25/50.
- **ORD-4** · _Low · Design → Code_ — Color the per-status counts so users can differentiate statuses at a glance (currently all one color).
- **ORD-5** · _Low · Code (via G10)_ — Put the order number before the date (it's the more important identifier). _See D3._
- **ORD-6** · _Med · Design / Chat_ — There are two delivery dates (customer-requested vs actual). The "Delivery" column is ambiguous about which it shows — label/disambiguate them.
- **ORD-7** · _Med · Code_ — Add copy-to-clipboard for the order number from the table; today selecting the text fires a row click and navigates to the order. _Relates to D2 numbering._
- **ORD-8** · _Low · Code (via G7)_ — Details: the lines table uses unusually small fonts.
- **ORD-9** · _Low · Code (via G7)_ — Details: the measurement text is too light to read.
- **ORD-10** · _Blocker · Backend + Code_ — Warehouse is optional on orders/transactions; completed orders without a warehouse never write off stock. _Tracked as B1._
- **ORD-11** · _Med · Backend_ — Details: status history is empty. _Tracked as B4._

## Transactions (Sales & Supplies)

- **TXN-1** · _Low · Code (via G10)_ — Number vs date column order. _See D3._
- **TXN-2** · _Low · Chat (D12)_ — The amount column shows a negative sign on some sales — clarify meaning or fix display. _See D12._
- **TXN-3** · _Low · Design → Code (via G5)_ — Chips aren't visually appealing; consider larger chips as part of the chip system. _See G5._
- **TXN-4** · _Low · Code (via G3)_ — Pagination 25/50/100 → 10/25/50.
- **TXN-5** · _Low · Code (via G2)_ — No sorting at all.
- **TXN-6** · _Low · Code (via G7)_ — Details: the "·" separator in the title is invisible; make it larger or a different color. _(Same as PAY-12.)_
- **TXN-7** · _Med · Design_ — Details: the title carries too much (date+time, partner, type, warehouse, status). Rethink the layout — e.g. a compact title with breadcrumb navigation ("Продажи → Продажа #123") plus a single consolidated info widget (top-right), reusing/relocating the existing bottom info widget and reconciling the partner widget (which oddly shows balance on Orders but only the name here).

## Templates

- **TPL-1** · _Med · Design → Code (via G1)_ — Header background differs from Sales/Supplies. _See G1._
- **TPL-2** · _Low · Code (via G3)_ — Pagination 25/50/100 → 10/25/50.
- **TPL-3** · _Med · Design → Code (via G5)_ — Sales/Supplies chips here use blue/orange + icons. Decide whether that color+icon treatment is the app-wide standard (it doesn't appear used for Sales/Supplies elsewhere) and apply consistently — or drop it. _Drives part of G5._
- **TPL-4** · _Low · Code (via G2)_ — Table isn't sortable.
- **TPL-5** · _Low · Design_ — Create modal: consider restructuring rows from (name, type / partner) to (name, partner / type).
- **TPL-6** · _Low · Code_ — Create modal: the Type switch buttons are taller than other inputs (icon-driven); match input height. _Relates to the toggle-group sizing, Round-1 F-026._

## Payments

- **PAY-1** · _Med · Chat (D6)_ — The "Type" column is always "Payment"; clarify its source/value and whether it stays. _See D6._
- **PAY-2** · _Low · Code (via G12)_ — Search box helper text is half-cut by its length. _See G12._
- **PAY-3** · _Med · Design → Code_ — Make the Income/Expense widgets clickable to filter the table, with the hover effect + appearing icon used on the Debts widgets.
- **PAY-4** · _Low · Code_ — Filters have no fixed width, so selecting a longer value shifts the UI. Give them a sensible fixed width.
- **PAY-5** · _Med · Code (via G2)_ — Make all columns sortable.
- **PAY-6** · _Low · Code (via G4)_ — Partner and Wallet cells should be links.
- **PAY-7** · _Med · Code_ — Create modal: dropdown overflows the page instead of opening below the field (not a proper typeahead). _Tracked as B7._
- **PAY-8** · _Med · Chat (D6)_ — Create modal: clarify the standalone "Оплата" role vs Deposit/Withdrawal (subtitle "Самостоятельный платёж · вне продажи или поставки"). _See D6._
- **PAY-9** · _Low · Design → Code_ — Create modal: "Cancel" sits above "Submit" — reorder to the standard arrangement.
- **PAY-10** · _Low · Code_ — Create modal: reassess the footer helper "Платёж будет записан окончательно — изменить или удалить нельзя." — keep only if it earns its space.
- **PAY-11** · _Low · Design → Code (via G11)_ — Close-confirmation modal: title isn't aligned with the icon; improve the description to e.g. "Закрыть форму? Несохранённые изменения будут потеряны." _See G11._
- **PAY-12** · _Low · Code (via G7)_ — Details: the leading "·" in the title is unclear/invisible. _(Same as TXN-6.)_
- **PAY-13** · _Low · Code_ — Details: reassess the "Платёж проведён окончательно…" helper text.
- **PAY-14** · _Low · Code (via G7)_ — Details: widget dividers are too faint to see.
- **PAY-15** · _Low · Code (via G4)_ — Details: the info widget's "Wallet" isn't a link while the partner is.
- **PAY-16** · _Low · Chat (D4)_ — Details: partner type shows "Both", unclear outside the Partners page. _See D4._
- **PAY-17** · _Low · Code (via G7)_ — Details: the Info widget row headers don't match the Allocation table header style.
- **PAY-18** · _Low · Code (via G7)_ — Details: the Allocation "type" cell font is too light/inconsistent.
- **PAY-19** · _Low · Code (via G7)_ — Details: in the Wallet widget, the wallet type font is too light; match the currency color.
- **PAY-20** · _Low · Design → Code (via G1)_ — Details: the table/widget header & footer background colors look different from other pages. _See G1._
- **PAY-21** · _Low · Design / Chat_ — Details: add a tooltip (top-right of Allocations) explaining what allocations mean.

## Debts

- **DBT-1** · _Med · Code_ — Navigating to a partner from Debts opens the Ledger without applying filters; it should open the Transactions tab with status filter = "open". _Tracked as B13._
- **DBT-2** · _Low · Code_ — Remove the page subtitle "Открытые задолженности по всем партнёрам и транзакциям."
- **DBT-3** · _Med · Code_ — Table has no pagination.
- **DBT-4** · _Low · Code (via G2)_ — Table has no sorting.

## Wallets

- **WAL-1** · _Low · Design → Code (via G6)_ — Actions tooltip styled differently. _See G6._
- **WAL-2** · _Med · Chat (D1)_ — Archive-logic question. _See D1._
- **WAL-3** · _Med · Code_ — Operations tab: no pagination.
- **WAL-4** · _Low · Code (via G2)_ — Operations tab: no sorting.
- **WAL-5** · _Med · Design → Code (via G1)_ — Operations tab: white table header vs gray elsewhere. _See G1._
- **WAL-6** · _Med · Chat (D5)_ — Operations tab: filters outside the table widget. _See D5._
- **WAL-7** · _Low · Code (via G4)_ — Operations tab: partners aren't clickable.
- **WAL-8** · _Low · Code (via G7)_ — Operations tab: date text font differs from elsewhere — use the shared Date component.
- **WAL-9** · _Med · Chat (D6)_ — Operations tab: "Payment"/"Type" columns are always single-valued ("Transfer"/"Payment") — clarify. _See D6._
- **WAL-10** · _Low · Design / Chat (D13)_ — Operations tab: should "Direction" be a chip? _See G5/D13._
- **WAL-11** · _Low · Code (via G7)_ — Operations tab: "balance after" uses a light font where other tables use bold black for balance/amount columns.
- **WAL-12** · _Low · Code_ — Operations tab: rename column "Сумма, UZS" to "Сумма" (drop UZS for now).
- **WAL-13** · _Med · Design / Chat_ — Transfers tab: move the "New transfer" button to the top near the "⋯" menu (like Order detail) so users don't have to open the Transfers tab to act. _Relates to the V2 "buttons on detail" idea._
- **WAL-14** · _Low · Code_ — Transfer modal: the "…изменить или удалить нельзя" helper is too long and the submit label overflows. Shorten to "Перевод будет записан окончательно" and rename the button to "Перевести" / "Провести".
- **WAL-15** · _Low · Code_ — Transfer modal: make "notes" a larger textarea, not a single-line input.
- **WAL-16** · _Low · Design_ — Transfer modal: wallet balance is shown three times (background, source dropdown, and under the input). Reduce duplication.
- **WAL-17** · _Low · Design_ — Transfer modal: place source and destination wallets on the same row.
- **WAL-18** · _Low · Design_ — Transfer modal: move the "use all amount" quick button next to the amount input rather than below the source.

---

# Duplicates, inconsistencies & things to raise

**Duplicates within Findings 2**

1. The Dynamics-widget subtitle "Продажи против поставок · UZS" is flagged twice (Dashboard bullet and the Dynamics-widget subsection). Merged into **DSH-2**.
2. "Payments — same issues as in Dynamics widget" is a pointer, not a new item. Captured as **DSH-6** (inherits DSH-4/DSH-5).
3. The "·" separator in the title being invisible appears for both Transactions (**TXN-6**) and Payments (**PAY-12**) — same fix.
4. The "filters inside vs outside the table widget" question recurs in Partner (Ledger, Transactions, Payments) and Wallet (Operations) — consolidated into **D5 / G13**.
5. The archive-toggle question recurs in Products, Warehouses, Partners, Wallets — consolidated into **D1**.

**Logical inconsistencies / contradictions to resolve**

1. **Archivable entities disagree across your own docs.** `Rules.md` #15 says archive is allowed for **Product and Partner only**, but the Design operating method says **Product, Partner, Wallet, Warehouse**, and both Findings rounds treat Warehouse and Wallet as archivable. One of these is stale — reconcile before D1/D9. (Likely Rules.md #15 needs updating.)
2. **Refund integrity rule isn't enforced** (B3): Rules.md #2 requires `OriginalTransactionId` on Sale/Supply refunds, yet such rows exist with null. The rule exists; the DB constraint doesn't.
3. **Validation-message convention vs hard rule** (D10/WH-8): you ask whether to show a generic "fill required fields" message, but the operating rule is "never silently disable; show **inline** validation errors on submit." A top summary can complement inline errors but shouldn't replace them — decide the combination.
4. **Tenancy (carry-over, not in Findings 2 but relevant):** Round-1 F-029 suspects payments aren't scoped by `OrganizationId`, which would violate Rules.md #7. Worth a dedicated multi-tenant check while you're in the data-integrity track (B1/B3).

**Gaps / unclear source items**

1. **PRD-12** — the source line "When the unit of measurement is 'box'" is cut off mid-thought. Needs your intended meaning before it can be triaged.
2. **Partners** source has an empty trailing bullet (line 122) — nothing to action; noted so it isn't mistaken for a lost item.

**Cross-references to Round 1 (`Findings.md`)**

- Table styling → **F-025** (≈ G1)
- Status toggle-group sizing → **F-026** (≈ ORD-2, TPL-6)
- Currency display/input formatting → **F-009 / F-024** (≈ G8)
- Phone `+998` normalization → **F-004 / F-012** (≈ G9, B6)
- Partner "Both" / default partner type → **F-027** (≈ D4)
- Unit-of-measurement enum & i18n → **F-007** (≈ PRD-3, PRD-11)
- Payments tenancy → **F-029** (≈ Inconsistency #4)

---

# Ideas for V2 (carried over)

Routing noted so these slot in later without re-triage.

- **Improve downloaded-file formatting/styling** (Orders, Payments, Transactions, Debts) — _Design → Code._
- **Surface up to two primary actions directly on detail pages**; 3+ go into the "⋯" menu — _Design → Code. Related to WAL-13._
- **Date-range filter redesign** — replace the dropdown ("whole time / day / 7 / 30 / 90 days") with the day/week/month + custom toggle group — _decide in D11, then Design → Code._
- **Add archive for Templates** — _Chat (confirm against Rules.md #15 archivable-entity decision) → Code._
- **Add copy to clipboard** on each detail in details view

---

## Suggested first sessions (not exhaustive)

- **Chat #1 — Decisions round A:** D1 (archive), D3/G10 (column order), D4 (Both), G4 approach (links). These four unblock the most downstream work.
- **Chat #2 — Decisions round B:** D5/G13 (filter layout), D6 (payment/type semantics), D7 (initial stock), D8 (WAC), D9 (warehouse delete + archivable-entity reconciliation).
- **Design #1 — Foundations:** lock the canonical table (G1), chips (G5), action menu (G6), and type scale + Date component (G7) on one reference screen.
- **Code #1 — Bugs:** B1 (warehouse-optional, with backend), B2 (rejected-order crash), B3 (refund constraint, backend). Don't gate these on the design work.
