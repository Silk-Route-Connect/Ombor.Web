# Backend deltas — frontend → backend handoff

Running list of backend changes the frontend needs. Each item carries evidence from `docs/openapi.json` (the generated contract) and the user-visible symptom, so a backend session can act on it without the frontend context. **Frontend passes append here when they flag a gap; the backend session checks items off (and regenerates `openapi.json`).**

> Round-1 backend findings (F-013 payroll tenancy, F-027 default partner type, F-029 payments `OrganizationId` scoping, and the backend halves of F-006/017/023) are tracked in `docs/testing/findings.md` — not duplicated here.

Last verified against `openapi.json`: **2026-07-03** (Transactions module pass).

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

---

## Closed (verified in the current `openapi.json` — don't re-flag)

- **Warehouse delete (D9/WH-5):** `DELETE /api/warehouses/{id}` exists (409 when referenced) and `WarehouseDto.isDeletable` is served.
- **Partner delete gating:** `PartnerDto` serves `isDeletable` + `activityCount`.
- **Transfers author/note:** `TransferDto` serves `createdBy` + `note`; the unused `status` is gone.
- **Payments redesigned contract:** `PaymentRecordDto` (number/type/direction/partner/employee…) replaced the legacy method/currency DTO.
