# Backend deltas — frontend → backend handoff

Running list of backend changes the frontend needs. Each item carries evidence from `docs/openapi.json` (the generated contract) and the user-visible symptom, so a backend session can act on it without the frontend context. **Frontend passes append here when they flag a gap; the backend session checks items off (and regenerates `openapi.json`).**

Last verified against `openapi.json`: **2026-07-03** (Transactions + Templates module passes). The Round-1 backend items from `docs/testing/findings.md` (June 2026 manual sweep) are **absorbed below** (§ From Round 1) — findings.md stays as the historical test report; this doc is the live list.

---

## Open

### 1. `TransactionStatus` enum lacks `Overdue` — the «Просрочено» filter/chip can never match

- **Contract:** `TransactionStatus` = `["Open", "Closed", "PartiallyPaid"]` (openapi ~8494). `TransactionDetailDto` already carries `dueDate`, so the input exists — the server-side "past due date ⇒ Overdue" computation doesn't.
- **Symptom:** the Sales/Supplies list's «Просрочено» filter segment always shows the empty state, and the overdue status chip never renders — even for transactions past their due date. In a debt-tracking product this reads as a false "nothing is overdue".
- **Required:** compute and serve `Overdue` in `TransactionDto.status` / `TransactionDetailDto.status` (due-date-driven, backend-owned — the frontend deliberately never derives it; see `statusOf` in `src/utils/transactionUtils.ts`).
- **Frontend impact when done:** none — the filter, chips and CSV already key off the served enum incl. `Overdue`.

### 2. List `TransactionDto` omits `number`

- **Contract:** `TransactionDto` (list, ~8359) has no `number` property; `TransactionDetailDto` (~8256) has it.
- **Symptom:** the Sales/Supplies **list** shows the id fallback («№1927») while opening the same row's **detail** shows the real served number («№S-1927»); list search-by-number and the CSV «Номер» column only see ids; the copyable № cell copies the id, not the document number.
- **Required:** add `number` to the list `TransactionDto`.
- **Frontend impact when done:** none — `toRecord` already maps `number` when present.

### 3. No `originalTransactionNumber` on refunds (list or detail)

- **Contract:** both transaction DTOs carry only `originalTransactionId` (nullable int).
- **Symptom:** on refund rows/pages every "reference to the original" affordance has no number to show — the list's «Возврат к №N» sublabel never renders, and the refund detail's reference banner + «Исходная продажа/поставка» row show a bare «#».
- **Required:** serve `originalTransactionNumber` (the original's document number) alongside `originalTransactionId` on refund records — or, once №2 lands list-wide, the frontend can resolve it; the served field is simpler and works on the detail DTO in isolation.
- **Frontend interim option (not done):** fall back to `formatEntityId(originalTransactionId)` — deliberately skipped to avoid showing an id styled as a document number next to real numbers.

### 4. `WarehouseMovementDto.counterparty` is a display string — no ids for entity links

- **Contract:** `WarehouseMovementDto` (~9234) serves `counterparty` as a nullable **string** (a name); there is no `counterpartyWarehouseId` / `counterpartyPartnerId`.
- **Symptom:** in the Warehouse detail «Движения» tab, the transfer-destination warehouse and the partner in a movement row render as plain text and can't deep-link to their detail pages.
- **Required:** add the optional counterparty ids (`counterpartyWarehouseId` for transfer rows, `counterpartyPartnerId` for sale/supply rows).
- **Frontend impact when done:** none — `WarehouseLink`/`PartnerLink` are already forward-wired behind optional ids (WH-26 + the detail-table polish pass); they light up as soon as the ids arrive.

### 5. `AddOpeningStockRequest` — no `note` field; `quantity` is `int32`

- **Contract:** `OpeningStockLine` (~7029) = `productId` + `quantity` (**int32**) + `unitCost`; neither the line nor `AddOpeningStockRequest` carries a note.
- **Symptom:** the opening-stock modal's note («Будет записано как событие начального остатка…» context) is silently dropped, and fractional quantities (e.g. 2.5 kg for weight-measured products) cannot be posted.
- **Required:** add an optional `note` to `AddOpeningStockRequest`; widen `OpeningStockLine.quantity` to a decimal (matching how transaction lines measure quantity).

### 6. `TemplateDto` — no `lastUsedAt`; `TemplateItemDto` — no `sku`/`measurement`/`discountType`, `quantity` is `int32`

- **Contract:** `TemplateDto` (~8116) = id/partnerId/partnerName/name/type/items only; `TemplateItemDto` (~8149) = id/productId/productName/templateId/templateName/quantity(**int32**)/unitPrice/discount.
- **Symptom:** the Templates list's «Использован» column shows «—» on every row (the redesign shows the last-used date, and New Sale/Supply's template-load is supposed to stamp it), and the expand-row line items render empty SKU/unit cells against the real backend (the mock enriched them from the product catalogue).
- **Discount semantics undefined (data-visible bug):** `TemplateItemDto.discount` is a bare `double` with no `discountType` — the frontend computes line totals treating it as a **percent** (`qty × price × (1 − discount/100)`), while the live data clearly carries **fixed amounts** (thousands), producing absurd negative template totals like «−51 724 238 336,28» on the deployed list. Transactions solved this with the `DiscountType { Percentage, Fixed }` enum per line — templates need the same field (or a documented single semantic), after which the frontend math follows.
- **Required:** add `lastUsedAt` (nullable date-time, stamped when a template is loaded into a transaction) to `TemplateDto`; add `sku` + `measurement` + `discountType` to `TemplateItemDto`; widen `quantity` to a decimal (weight-measured products).

---

## From Round 1 (`docs/testing/findings.md`, June 2026 sweep — absorbed 2026-07-03)

The frontend halves of all of these shipped in the frontend bug-fix pass; what remains is backend-only.

### 7. F-006 (Blocker) — drop `RetailPrice` from the product contract + the `0 < supply < retail < sale` rule

- **Contract (still open):** `RetailPrice` is still a field of the product create/update multipart requests (openapi ~2623/2998) and the served product DTOs (~6314).
- **Symptom:** **product create is still blocked** — the form no longer sends `RetailPrice` (FE half shipped), so the backend's `0 < supply < retail < sale` validation rejects every create with 400.
- **Required (owner decision):** remove `RetailPrice` from the API contract and drop the `retail` term from the price rule (keep the column in the DB/entity only, for later).

### 8. F-013 + F-027 — default-partner seeding: don't auto-seed «Розничный покупатель», or seed it as **Both**

- Two halves of one decision: stop auto-seeding the walk-in customer partner (the redesign has **no system walk-in partner** — partner is required on every sale), or if a default partner is kept, seed it as type **Both** (Supplier + Customer), not Customer-only.
- Runtime/seeding behavior — not contract-visible; verify in the backend session.

### 9. F-017 — invalid `OrderSource` should return **400, not 500**

- FE half shipped (the «Нет»/`None` option was dropped; New Order defaults to `OmborWeb`), so the app no longer triggers it — but the API still 500s on an invalid enum value instead of a 400 validation error. Runtime behavior — not contract-visible.

### 10. F-023 (High) — implement the password-reset endpoints

- **Contract (still open):** `/api/auth/*` has only `register`, `verification`, `login`, `refresh-token`, `logout` — no reset endpoints.
- **Required:** implement the target v1 contract the frontend already ships mocked (`POST /api/auth/forgot-password`, `/verify-reset-code`, `/reset-password` — see `src/mocks/handlers/auth.ts`). Until then, real users cannot reset a password (the flow works only against the mock's demo code).

### 11. F-029 (High, suspected) — multi-tenant isolation: scope payments (and audit other resources) by `OrganizationId`

- Rules.md #7 requires tenant scoping; the Round-1 sweep suspected payments aren't filtered/stamped by `OrganizationId`. Ran single-tenant, so unconfirmed — **needs a dedicated two-tenant test first**, then the fix and an audit of the other resources.

---

## Closed (verified in the current `openapi.json` — don't re-flag)

- **Warehouse delete (D9/WH-5):** `DELETE /api/warehouses/{id}` exists (409 when referenced) and `WarehouseDto.isDeletable` is served.
- **Partner delete gating:** `PartnerDto` serves `isDeletable` + `activityCount`.
- **Transfers author/note:** `TransferDto` serves `createdBy` + `note`; the unused `status` is gone.
- **Payments redesigned contract:** `PaymentRecordDto` (number/type/direction/partner/employee…) replaced the legacy method/currency DTO.
