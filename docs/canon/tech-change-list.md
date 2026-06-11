# Tech change list

**Status of doc:** canon working tracker. Refreshed 2026-06-11 against `business-rules.md` (rule numbers below refer to it). Supersedes the May version, which referenced the retired `rules.md` / `claude-context.md`.
**Scope:** backend only. Frontend gaps live in the frontend repo's CLAUDE.md "Repo state" section.

Item status: not started / in progress / complete / blocked.
Severity: blocker (cannot ship MVP without) / important / nice-to-have.

The Phase 1 backend audit will confirm "Current" descriptions below (they predate the audit) and extend this list.

---

## Blockers

### Payment model rework — source / allocation

**Status:** not started
Current: legacy payment model with `PaymentMethod` enum (Cash/Card/Bank/AccountBalance); no two-sided structure.
Target: rules 8–14 + Domain model. `PaymentComponent` (SourceType: Wallet | Advance) and `PaymentAllocation` (TransactionSettlement | AdvanceCredit | ChangeReturn). Sources = settling allocations enforced at write time; ChangeReturn excluded from the identity, wallet balance, and partner balance; Wallet components recorded net of change returned (rule 15). `PaymentMethod` enum removed. Advance is a claim, not a location (rule 11). AdvanceCredit gated on zero outstanding debt (rule 40).

### Wallet entity

**Status:** not started
Current: no wallet/money-location entity.
Target: Wallet (Cash | Card | Bank), computed balance (rule 15), opening balance as an auditable event, inter-wallet transfers as auditable events (rule 16), archive support (rules 29–31). "Our money" computed and served per rule 12.

### Server-computed balances served via API

**Status:** not started
Current: unknown / partial (audit to confirm).
Target: rule 12 — partner balance, wallet balance, our-money computed backend-side per read and returned in DTOs. No stored balance fields; clients never derive balances.

### Multi-tenancy enforcement

**Status:** in progress (partial)
Current: `OrganizationId` on User/Role only (audit to confirm extent).
Target: rule 34 — entity named `Tenant`/`TenantId`; all tenant-scoped entities covered through one shared scoping mechanism (likely EF Core global query filters) so new endpoints cannot silently skip it.

### StockAdjustment entity _(replaces the former WriteOff transaction-type item)_

**Status:** not started
Current: nothing (old plan had WriteOff as a TransactionType — superseded).
Target: rules 23–25 — standalone immutable entity, direction (Decrease | Increase), mandatory reason, partner-less, payment-less; Decrease records cost at WAC snapshot and reports as a loss line separate from COGS; Increase restores at current WAC. Hard-block negative stock (rule 20).

### Weighted-average cost on InventoryItem

**Status:** not started
Target: rules 17–19, 21–22 — stored `AverageCost` on InventoryItem, atomic update on every stock-in; stock leaves at WAC; base-unit movement with package count retained on lines.

### Inter-warehouse transfers

**Status:** not started
Target: Domain model Transfer — FromInventoryId, ToInventoryId, lines, status; immutable, audited, atomic on both inventories.

### Transaction-to-warehouse linkage

**Status:** not started
Target: required `InventoryId` on TransactionRecord for stock-affecting types.

### Refund linking

**Status:** not started
Target: rules 2–7 — `OriginalTransactionId` required for refund types, type matching, no refund-of-refund, cumulative-quantity enforcement, mandatory reason.

### Archive mechanism

**Status:** not started
Current: DELETE endpoints hard-delete.
Target: rules 29–32 — `IsDeleted` on **Product, Partner, Wallet, Warehouse** (wider than the old Product+Partner scope); never blocked by references; archived wallets/warehouses still count in totals; no hard delete with referential history.

### Audit log

**Status:** not started
Target: rules 26–28 — single table, EF Core interceptor; master-data CRUD (Product, Partner, Wallet, Warehouse, Employee, Template, Order) plus every money/stock event; actor, timestamp, event/entity type, id, before/after values; one Activity Log screen.

### Order: warehouse at creation

**Status:** not started
Current: no InventoryId on Order; promotion picks source.
Target: Domain model Order (updated 2026-06-11) — `InventoryId` set at creation, editable while open, used at promotion; no stock reservation while pending.

### System partner «Розничный покупатель»

**Status:** not started
Target: rule 39 — auto-created per tenant at setup (seed/migration for existing tenants), Customer type, non-editable, non-archivable; default partner for POS sales.

## Important

### Opening balance and opening stock as events

**Status:** not started
Target: rules 16, 22 — auditable ledger events with actor/timestamp, never raw number fields.

### Payroll: immutability + multi-payment

**Status:** not started
Current: PUT/DELETE on `/employees/{id}/payrolls`; possible one-per-month constraint.
Target: rule 1 — endpoints removed, corrections via reverse payments; any number of payroll payments per month including advances (Domain model Employee).

### User deactivation & invite

**Status:** not started
Target: rule 41 — users deactivated (auth blocked, audit attribution preserved, reactivation allowed), never hard-deleted. Invite flow per Settings design; mechanism (email link vs direct credential creation) decided at implementation.

### Tenant profile

**Status:** not started
Target: business profile fields (name, address, phone, email) and logo upload, backing the Settings «Организация» section.

### Per-user language preference

**Status:** not started
Target: `User.Language ∈ {ru, uz-Latn, uz-Cyrl}`, default ru; per-user, not per-tenant; settable from Settings and the header switch; returned at login.

### Server-side pagination, sorting, filtering, searching

**Status:** not started (deliberately deferred — decision 2026-06-11)
Current: all list endpoints return plain arrays (see frontend `docs/openapi.json`); paging, sorting, and filtering are client-side, and MSW mocks intentionally mirror that array shape so real and mocked modules stay uniform.
Target (when picked up): list endpoints adopt `PagedResponse<T> { items, total, page, pageSize }` (1-based; params: page, pageSize, search + module filters); frontend stores and DataTable migrate in the same effort.

### Cyrillic↔Latin search

**Status:** not started
Target: name search transparent across both scripts.

### Product.QuantityInStock removal

**Status:** not started
Target: rule 17 — removed; InventoryItem sole source of truth.

### Discounts: line-level, percentage or fixed

**Status:** not started
Current: percentage-only line discount.
Target: rules 37–38 — per-line percentage or fixed amount; no transaction-level discount input; transaction total discount computed; bulk apply overwrites lines.

### Default Category auto-creation _(replaces the old "Category optional" item — direction reversed)_

**Status:** not started
Current: Category required with no default (old list wrongly targeted making it optional).
Target: Domain model Product — Category stays required; a Default Category is auto-created per tenant so it is never null. CategoryDto additionally carries productCount and isDefault; DELETE is rejected (409, ProblemDetails) for the Default Category and for any category with referenced products — per the frontend mock CONTRACT blocks.

## Nice-to-have

### Currency machinery freeze

**Status:** not started
Target: rule 33 — UZS-only; existing currency endpoints/entities frozen: not used, not extended, not fixed. Removal deferred to post-MVP.

### Address structure

Target: text address field; `Order.DeliveryAddress` optional.

### OpenAPI route casing consistency

Target: consistent lowercase `{id}`.

---

## Added by Phase 1 audit

(Section to be populated by the Claude Code backend audit pass.)
