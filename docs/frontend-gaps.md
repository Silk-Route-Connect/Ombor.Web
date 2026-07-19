# Frontend gaps — verified recon + live gap register

**Status:** the authoritative FE↔backend gap list — F-items are live bugs, not latent debt. Since 2026-07-14 also the recording home for **new** frontend→backend gaps: append them as new F-items with contract evidence (the `backend-deltas.md` queue is retired; backend sessions read this file for incoming work).
**Generated:** 2026-07-09 · read-only recon session (Part B frontend + Part C capability snapshot). **Last updated:** 2026-07-14 (header/role update; findings unchanged).
**Supersedes:** `tech-change-list.md` (retired 2026-07 — see Ombor.Docs/README.md «Retired names»).
**Verification basis:** the `../Ombor.Docs/backend-contracts/` per-module contracts (the current API source of truth; the original 2026-07-09 recon ran against the since-removed `docs/openapi.json` snapshot, regenerated **2026-07-05** by commit `31277f2`) + the frontend source tree (`src/models`, `src/services/api`, `src/stores`, `src/components`) + `business-rules.md` (canon) + `decision-logs.md`. Every verdict cites a route/DTO/field or a `file:line`.
**Scope of confidence:** the frontend can authoritatively verify (a) the **contract surface** the backend serves and (b) how the FE code consumes it. It **cannot** verify backend internals (tenancy filter, WAC formula, negative-stock enforcement, audit interceptor, seeding, HTTP status codes). Those are marked **Cannot-verify-from-FE** and handed to a backend session.

Status: **Done / Partial / Missing / Superseded / Cannot-verify-from-FE**. Severity: **Blocker** (violates a hard rule / crashes a normal flow) / **Important** / **Nice-to-have**.

---

## The one finding that reframes everything

The `redesign/backend-alignment` pass (2026-07-05) regenerated `openapi.json` from the **real** backend **one day after** `backend-deltas.md` was last verified (2026-07-04). It closed **almost every open backend gap** — `Overdue`, list `number`, `originalTransactionNumber`+`refundReason`, movement counterparty ids, opening-stock `note`+decimal qty, template `sku`/`measurement`/`discountType`, wallet-op `partnerId`, the full payment source/allocation read model, archive+`isDeletable`, discounts `%`/fixed, server-computed balances, and the auth-reset + settings + dashboard + wallets + stock-adjustments + transfers + debts endpoints. Combined with `VITE_ENABLE_MOCKS=false` (`.env.development`, `.env.example`; `src/index.tsx:29-38`) — **the app runs on the real backend, MSW off** — the recon's real story is a **status inversion**:

1. **`docs/canon/tech-change-list.md` is stale**: it marks as "not started" a dozen items that are now **Done** in the contract.
2. **`docs/backend-deltas.md` is ~90% stale**: 8 of its 12 items are resolved by the alignment pass; only `lastUsedAt` and the runtime-only items remain.
3. **The genuine open work moved to the frontend**: because the FE modules were built against mocks and the contract then changed under them, several FE models diverge from the real DTOs. With mocks off, these are **live runtime bugs against the real backend**, not latent debt. This is the highest-value output of this recon.
4. **Two v1-scope FE modules were never built** (Activity Log, Акт сверки), and the **audit trail — the product's core differentiator — has no backend endpoint and no screen**.

---

## Summary table (fast-scan)

### A. Backend-capability items (verified via the aligned contract)

| # | Item | Status | Severity | Evidence |
|---|------|--------|----------|----------|
| A1 | Payment source/allocation **read** model | **Done** | — | `PaymentRecordDto.sources[]/allocations[]` served |
| A2 | Payment **write** model (advance-source, change-vs-advance) | **Partial** | Important | `CreatePaymentRecordRequest` is single-wallet + flat settlements; no `OverpaymentHandling` (partly deferred, DR-05) |
| A3 | Wallet entity (CRUD/ops/transfers/archive) | **Done** | — | routes `/api/wallets*` |
| A4 | Server-computed balances served (rule 12) | **Done** | — | `PartnerDto.balance`, `WalletDto.ourMoney`, `DebtDto.remaining` |
| A5 | Multi-tenancy enforcement (rule 34) | **Cannot-verify-from-FE** | Blocker | internal EF filter; no DTO surface |
| A6 | StockAdjustment entity (rules 23–25) | **Done** | — | `/api/stock-adjustments`, immutable |
| A7 | WAC on inventory (served) | **Done** | — | `averageCost` on product/warehouse DTOs (formula internal) |
| A8 | Inter-warehouse transfers | **Done** | — | `/api/transfers`; `TransferDto` (no stale status field) |
| A9 | Transaction→warehouse linkage | **Done** | — | multipart `WarehouseId`; `TransactionDetailDto.warehouseId` |
| A10 | Refund linking (rules 2–7) | **Done** | — | `originalTransactionId/Number`+`refundReason`; POST `/api/transactions` type-branch |
| A11 | Archive mechanism (rules 29–32) | **Partial** | Important | archive/restore on all 4; **`isDeletable` NOT on `ProductDto`** though DELETE product exists |
| A12 | **Audit log / Activity Log endpoint (rules 26–28)** | **Missing** | **Blocker** | no `/api/audit` or `/api/activity` route anywhere |
| A13 | Opening balance/stock as events | **Done** | — | `/opening-stock` + `openingBalance/openingDate` served |
| A14 | Payroll immutability + multi-payment | **Done** | — | GET/POST payrolls only, no PUT/DELETE |
| A15 | User deactivation & invite (rule 41) | **Done** | — | `/api/settings/users/*`, no user DELETE |
| A16 | Auth password reset | **Done** | — | `/forgot-password`,`/verify-reset-code`,`/reset-password` real |
| A17 | Tenant profile | **Done** | — | `/api/settings/organization` |
| A18 | Per-user language | **Partial** | Important | PUT `/language` exists; **not returned at login** |
| A19 | Server-side pagination/sort/filter/search | **Partial** | Important | filter/search **params exist** on most routes; **no pagination**, and the FE uses **none** of them (B2/B3) |
| A20 | Cyrillic↔Latin search | **Cannot-verify-from-FE** | Important | internal to backend search |
| A21 | `Product.QuantityInStock` removal (rule 17) | **Done** | — | not on `ProductDto` |
| A22 | Discounts line-level %/fixed (rules 37–38) | **Done** (contract) | — | `DiscountType` + `discount`+`discountType` on lines |
| A23 | Category `productCount` + delete-guard | **Partial** | Nice-to-have | `productCount` served; 409/seed internal |
| A24 | Currency freeze (rule 33) | **Done** | — | no currency field anywhere |
| A25 | Address structure | **Done** | — | optional text address fields |
| A26 | OpenAPI route casing consistency | **Missing** | Nice-to-have | still mixed `{Id}`/`{id}` on categories/products/wallets |

### B. Frontend implementation gaps (the new work — mocks off = live against the real backend)

> **⏩ wave-4 update (2026-07-19 · `redesign/issue-fixes` working tree, uncommitted, `npm run validate` green — ⚠ live-verify pending, behind-login).** Ground-truthed every F-item against current code + `backend-contracts/`; several 2026-07-14 statuses were stale.
> - **Already fixed before this pass (docs were stale):** **F1** — `ProductApi`/`ProductStore` return the full `Product` (no lean PUT); no crash. **F3** — `CategoryStore` preserves `productCount` on edit. **F11** — `EmployeeDto.status` is a strict non-null enum in the FE, action logic is safe. **F9 walletId** + **F10 direction** — already aligned/guarded.
> - **Fixed this pass (code-complete):** **F4** (Fixed-discount math via shared `lineNet` + `discountType` round-trip), **F5** (recent-tx status fallback), **F7** (attachment shape `{contentType,sizeBytes,url}` + `formatBytes` + download link), **F9** (allocation-render guard), **F10/XC-8-partner** (`WalletOperationDto.partnerId` is served — modeled + party now links), **F13** (transfer over-balance clamp), **F15** (Partner `Both` + Employee `Terminated` autocomplete leaks), **F16** (`«Нет записей»` key + `emptyMessage`, payment months → `common.month.*`, Debt/Template plurals → i18next).
> - **Confirmed backend-blocked (handed to `issues-tracker.md` §12):** **F12** (no `telegram` on the partner contract — owner ruled keep-FE-block-on-BE; §2.5's "served" was wrong), **F20** (ledger `reference` on sale/supply rows), **XC-8 wallet-half** (no `walletId` on `TransactionPaymentDto`), **F21** (no pack-count line field).
> - **Scope correction — F18 (refined 2026-07-19):** the note↔`description` **mechanism** round-trips (create persists `Description`→`Notes`; GET serves it back on `PaymentRecordDto.description`, served `string?` for all types). **But** the FE create modal collects/sends `description` **only for `General`** payments (`PaymentCreateModal.tsx:160,444` gate on `type==="General"`), and `General` already displays it (`PaymentGeneralCard`). So a *display-only* "surface the served description" change is a **no-op** — non-General payments carry no note to show. A genuine note-on-any-payment is a **feature**: add an optional note input to the create modal for all types (→ `description`) **and** show it on the detail. That is the deferred §6 "notes + attachments" item, not a quick display fix — keep F18 **deferred** (feature), owner to schedule. Payment **attachments** remain BE-blocked regardless.
>
> **⏩ wave-5 update (2026-07-19 · `redesign/issue-fixes`, LIVE-VERIFIED on `:3000` against the local wave-5 backend at `:5062`).** The backend wave-5 (F12/F18/F20/F21 + counterparty) merged, so the FE halves landed and were driven live:
> - **F20 ✅ Fixed + live-verified** — the served `reference` on sale/supply/refund ledger rows now renders via `formatEntityId` in **both** `LedgerTab` and `TransactionsTab` (render cell only; sort/CSV/search stay on the raw value). Live: partner №24 ledger shows «№178»/«№179» on Поставка rows and «№525» on Продажа (was «—»).
> - **F12 ✅ Fixed (was backend-blocked) + live-verified** — backend now persists+serves partner `telegram`; the already-wired FE form/rail light up. Live: added «@antonina_med», reloaded, renders in «Контакты» (full FE→BE→FE round-trip).
> - **F21 ✅ Fixed (was backend-blocked) + live-verified** — FE sends `packageQuantity` (pack count) on transaction lines + template items and reads `packageSize`; detail/table show "N упак". Live: pack supply (2 × «Коробка 12 шт») persisted base qty 24; detail «2 упак / 24». Silent template round-trip (no modal UI); fixed the `loadTemplate` `discountType` drop in the same pass.
> - **F18 attachments ✅ Fixed (was backend-blocked) + live-verified** — payment-create switched JSON→**multipart** (`PaymentApi extends BaseApi`, `Attachments` file parts); create modal gained the shared `AttachmentPicker`; detail gained a `PaymentAttachmentsCard` (own attachments + echoed `transactionNotes`/`transactionAttachments`). Extracted the shared `AttachmentChip` (used by transaction + payment detail). Live: General payment with 2 files → POST 201 with `attachments[]`; detail shows both chips. The **note-on-any-payment** half stays a deferred feature.
>   - **Attachment download URLs — FE resolves against the API base now.** The backend serves a *relative* file path; `AttachmentChip` runs it through the shared `getImageFullUrl` (same resolver as product images) so the link targets the backend origin (previously resolved to the app origin, doubly wrong). Fixes downloads for **transaction (F7) and payment (F18)** attachments in one place. *(Observation: the local `:5062` backend 404s on uploaded static files — product images 404 too — so the file itself isn't retrievable locally; this is a local-dev static-serving config issue, not FE and not F18-specific.)*
> - **counterparty ✅ live-verified** — the FE was already wired; warehouse «Движения» rows deep-link to the counterparty partner (sale/supply) and warehouse (transfer).
> - **XC-8 wallet-half — UNBLOCKING (backend in progress, 2026-07-19):** the backend is adding `walletId` to `TransactionPaymentDto` + `PartnerLedgerEntryDto` (contracts updated to serve it). The FE wallet-link wiring (model `walletId` on the payment/ledger rows + render a `WalletLink`, mirroring the wallet-ops partner link F10) is the remaining FE step — not yet done (needs the served field to live-verify once the backend lands).

| # | Item | Status | Severity | Evidence |
|---|------|--------|----------|----------|
| F1 | **Product edit crashes/blanks the list & detail** — PUT returns lean `UpdateProductResponse` (no images/warehouseItems/totalStock/averageCost); store keeps it with no refetch | **Missing** (broken) | **Blocker** | `ProductApi.ts:56`, `ProductStore.ts:185`, `ProductDetailPage.tsx:84` |
| F2 | **Partner edit drops served balance** → «—»/NaN + delete-gating breaks until reload (PUT returns lean `UpdatePartnerResponse`; `update()` doesn't re-read like `create()` does) | **Fixed** (E1 — `update()` now re-reads by id, like `create`) | Important | `PartnerApi.ts:51`, `PartnerStore.ts:188` |
| F3 | **Category create/edit** stores lean response → `productCount` undefined → count shows 0, delete-guard misroutes (backend 409 still protects data) | **Missing** (broken) | Important | `CategoryStore.ts:92` |
| F4 | **Templates: Fixed line-discount unsupported → negative totals on real data** (contract now serves `discountType`, FE model omits it; math treats `discount` as percent) — delta §6 FE half never landed | **Missing** (broken) | Important | `models/template.ts`, `productUtils.ts:50`, `TemplatesTable.tsx:67` |
| F5 | **Dashboard recent-tx table crash-risk** — `status` narrowed to `paid/partial/unpaid`, indexed unguarded; real backend serves `string?` | **Partial** (risk) | Important | `models/dashboard.ts:78`, `RecentTransactionsTable.tsx:31` |
| F6 | **Refund «Возврат к №N» renders blank** — served `originalTransactionNumber` dropped by `toRecord` | **Resolved** (2026-07-16 · folded into F19) | Important | fixed: `TransactionApi.ts:74` now maps `originalTransactionNumber`; commit `48f1abf` |
| F7 | **Transaction attachments mis-shaped** — FE `{kind,size}` vs served `{contentType,sizeBytes,url}` → wrong icon, blank size, no download link | **Fixed** (wave-4 shape; wave-5 shared `AttachmentChip` + API-base URL resolution) | Important | `AttachmentChip.tsx`, `models/transaction.ts:43` |
| F8 | **Warehouse «Движения» refund filter matches nothing** — FE collapses to one `Refund` kind; contract splits `SaleRefund`/`SupplyRefund` | **Resolved** (2026-07-16) | Important | fixed: `models/warehouse.ts:62-63` + `MovementKindChip`; commit `31b7a2e` |
| F9 | **Payment allocation/source rendering unguarded** — served as free strings; `ALLOC_META[allocationType].color` throws on an unknown value; `walletId` nullable but modeled required | **Partial** (risk) | Important | `PaymentDetailCards.tsx:135`, `models/payment.ts:106` |
| F10 | **Wallet ops direction risk** — FE narrows to `In/Out`; if backend serves `Income/Expense` every row renders red; `partnerId` not modeled (WAL-7 unresolved) | **Partial** (risk) | Important | `models/wallet.ts:60`, `WalletOperationsTab.tsx:143` |
| F11 | **Employee status null-handling** — served `string?`; action logic `status==='Terminated'` treats null/unknown as active (badge has a fallback, actions don't) | **Partial** (risk) | Important | `models/employee.ts:15`, `EmployeeActionMenu.tsx:32` |
| F12 | **Partner Telegram** — form collects `telegram`, sent in create/update; backend now persists+serves it (wave-5) | **Fixed** (live-verified 2026-07-19; FE was already wired) | Important | `PartnerFormModal.tsx:331`, `PartnerDetailRail.tsx:303` |
| F13 | **Wallet transfer over-balance guard** blocks all transfers from a negatively-balanced wallet (needs `Math.max(available,0)`). The POS supply guard and the standalone payment modal (guard + «Доступно только…» copy; Income stays balance-ungated) got the clamp 2026-07-17 (`NewTransactionEntry.tsx`, `TransactionSummaryCard.tsx`, `PaymentCreateModal.tsx`); only the transfer modal is still unclamped | Latent | Important | `WalletTransferModal.tsx:158` |
| F14 | **All lists fetch-all + paginate/sort/search client-side** (B2/B3); server filter/search params exist on 12 routes but **no store passes them** | By design (deferred) → risk | Important | shared-infra §4; every `Store.getAll()` argument-less |
| F15 | **Archive leak: `PartnerAutocomplete type="Both"` includes archived** → Template partner picker can pick an archived partner (B4) | **Missing** (broken) | Important | `PartnerAutocomplete.tsx:25`, `TemplateFormModal.tsx:336` |
| F16 | **i18n: shared empty-state `«Нет записей»` hardcoded** (app-wide, no key) + month arrays/plural forms in Employee/Payment/Debt/Template (B5) | **Missing** | Important | `DataTable.tsx:280` + list |
| F17 | **uz-Latn / uz-Cyrl backfill absent** — 11 substantive namespaces missing, `common` ~8%, `template.json` empty `{}`; **launch blocker** per mvp-plan cross-cutting #14 (gated to ru-only, so not live) | **Missing** | **Blocker** (launch) | `i18n/config.ts`, `languages.ts:16` |
| F20 | **Partner ledger `reference` on sale/supply/refund rows** — backend now serves the bare doc number (wave-5); FE renders it via `formatEntityId` («№…») in `LedgerTab` + `TransactionsTab` (render cell only) | **Fixed** (live-verified 2026-07-19) | Important | `LedgerTab.tsx:250`, `TransactionsTab.tsx:264` |

### C. Unbuilt v1-scope modules

| # | Item | Status | Severity | Evidence |
|---|------|--------|----------|----------|
| U1 | **Activity Log screen** (mvp-plan §17, rules 26–28) — routed to a `PlaceholderPage` stub; no `AuditApi`, no backend endpoint | **Missing** | **Blocker** | `App.tsx:110`, `paths.ts:26` |
| U2 | **Акт сверки / reconciliation statement** (mvp-plan §16) — ledger data is served (`/api/partners/{id}/ledger`) but the print screen isn't built | **Missing** | Important | no component; ledger endpoint exists |
| U3 | Reports module | Deferred (v2) | — | not a gap (mvp-plan Deferred) |

---

## Per-item detail

### A. Backend-capability items (verified via the contract)

**A1/A2 — Payment source/allocation model (was tech-change-list blocker, "not started").**
Read model: **Done** — `PaymentRecordDto` serves `sources: PaymentSourceDto[]` (`sourceType`,`walletId`,`amount`) and `allocations: PaymentAllocationEntryDto[]` (`allocationType`,`transactionId`,`amount`); the detail renders both (`PaymentDetailCards.tsx`). Write model: **Partial** — `CreatePaymentRecordRequest` = `{type,direction,partnerId?,employeeId?,walletId,amount,description?,period?,settlements[]}` (single wallet, flat `SettlementInput{transactionId,amount}`). It **cannot express** (a) an **Advance source** (rules 9/11) or (b) the **change-vs-advance disposition** (rule 40) — the `OverpaymentHandling` enum exists but is referenced **only** by the multipart `POST /api/transactions` (New-Sale POS), **not** by payment-create. The standalone modal's simplification is partly **by design per DR-05** (settlement semantics deferred to v2); the missing overpayment disposition on the standalone flow is the concrete gap to reconcile. `PaymentMethod`/currency removed from the contract ✅. *Evidence:* `models/payment.ts:227-240`, `PaymentCreateModal.tsx:154-164,644-647`, `openapi.json:4386-4388` vs `6400-6443`.

**A3 — Wallet entity. Done.** Nine routes `/api/wallets*` (list?SearchTerm, POST, GET/{Id}, operations, transfers, POST transfers, PUT, archive, restore); `WalletDto` with computed `balance/advancesHeld/ourMoney`. No DELETE by design. The tech-change-list "not started" is stale.

**A4 — Server-computed balances. Done.** `PartnerDto.balance`, `WalletDto.balance/ourMoney/advancesHeld`, `DebtDto.remaining`, `PaymentFormPartnerDto.balance+advance`, `TransactionDetailDto.remaining`. No stored-balance write fields. Rule 12 satisfied at the contract level; the FE reads them (except the F2 edit-response regression).

**A6 — StockAdjustment. Done.** `/api/stock-adjustments?WarehouseId,ProductId` (GET) + POST; `StockAdjustmentDto` (direction/quantity/reason/note/balanceAfter/createdBy); immutable (no PUT/DELETE). Negative-stock hard-block is internal.

**A7 — WAC served. Done.** `averageCost` on `ProductWarehouseItemDto`, `WarehouseStockItemDto`, `ProductDto.averageCost?`. The formula/atomic-update is internal — Cannot-verify.

**A8 — Transfers. Done.** `/api/transfers?WarehouseId`; `TransferDto`+`TransferLineDto`. The DTO has **no status field** — the "unused status" the old notes mention is gone.

**A9 — Transaction→warehouse. Done.** POST `/api/transactions` multipart carries `WarehouseId` (`openapi.json:4396`; `TransactionApi.ts:127`); `TransactionDetailDto.warehouseId/warehouseName`. List `TransactionDto` omits it (detail-only) — fine.

**A10 — Refund linking. Done.** `originalTransactionId`+`originalTransactionNumber`+`refundReason` on **both** DTOs; create multipart carries `OriginalTransactionId`+`RefundReason`+`Type`; no dedicated `/refund` route (refund = POST `/api/transactions` with a refund `Type`). Type-match / no-refund-of-refund / cumulative-cap enforcement is internal. *(But the FE drops the served `originalTransactionNumber` — see F6.)*

**A11 — Archive. Partial.** archive/restore on Product(53/54), Partner(39/40), Wallet(84/85), Warehouse(94/95); `isArchived` on all four. **Gap:** `isDeletable` is served on `PartnerDto` + `WarehouseDto` **only** — `ProductDto` has no `isDeletable` although `DELETE /api/products/{id}` exists, so the FE can't gate the product-delete affordance from a served predicate the way Partners/Warehouses do (rule 32 pattern incomplete for Product).

**A12 — Audit log. Missing. Blocker.** No `/api/audit`, `/api/activity`, or equivalent route in the contract; no audit DTO. An EF interceptor may exist internally, but rules 26–28 ("one Activity Log screen") have **no backing endpoint** — see U1.

**A13 — Opening balance/stock as events. Done.** `POST /api/warehouses/{id}/opening-stock` with `AddOpeningStockRequest{items,note?}`+`OpeningStockLine{quantity:double,unitCost}`; `PartnerDto.openingBalance/openingDate`; `WalletDto.openingBalance`; `PartnerLedgerEntryDto` opening event; wallet `MovementKind` has `Opening`. Also closes backend-delta §5.

**A14 — Payroll immutable + multi-payment. Done.** GET+POST `/api/employees/{employeeId}/payrolls` only (no PUT/DELETE). No one-per-month constraint is expressible; the FE allows repeated POST. The constraint absence is server-enforced — Cannot-verify but nothing blocks it.

**A15 — User deactivation & invite. Done.** `/api/settings/users` (GET), `/invite`, `/{id}/deactivate`, `/{id}/reactivate`; `TenantUserDto.active`; no user DELETE (rule 41).

**A16 — Auth password reset. Done.** Routes 6–8 exist; `AuthApi` calls the real routes (`AuthApi.ts:100-128`). Resolves backend-delta §11 / F-023. *(FE comments still say "mocked" — stale, see F-docs below.)*

**A17 — Tenant profile. Done.** GET+PUT `/api/settings/organization` (PUT multipart for logo); `OrganizationProfileDto{name,address,phone,email,logoUrl}`.

**A18 — Per-user language. Partial. Important.** `PUT /api/settings/language` exists and `SettingsStore.updateLanguage` persists it, but `LoginResponse = {accessToken,refreshToken}` carries **no language** and there is **no GET language** route. The FE reads locale only from `localStorage("ombor.locale")` (`i18n/config.ts:37`); `AuthStore` does nothing with language at login. So a server-saved preference is **ignored on a fresh device/session** — the canon target ("returned/applied at login") is unmet.

**A19 — Server-side pagination/sort/filter/search. Partial. Important.** **Search/filter query params now exist** on: categories?SearchTerm; employees?SearchTerm; orders?SearchTerm,Status,CustomerId,FromDate,ToDate; partners?SearchTerm,IsArchived; payments?(8 params); products?SearchTerm,CategoryId,MinPrice,MaxPrice,Type,IsArchived; templates?SearchTerm,Type; transactions?SearchTerm,PartnerId,Status,Type; transfers?WarehouseId; wallets?SearchTerm; warehouses?SearchTerm; stock-adjustments?WarehouseId,ProductId. **No pagination anywhere** (all responses are bare arrays; no `PagedResponse`/`page`/`pageSize`) and **no sort params**. This was a deliberate deferral (decision 2026-06-11); the search/filter params are new since. See F14 for the FE consequence (none are used).

**A23 — Category productCount + delete-guard. Partial.** `CategoryDto.productCount` served → Done; the 409 delete-guard and tenant-setup seeding are internal — Cannot-verify.

**A26 — Route casing. Missing (Nice-to-have).** Still mixed: `categories GET/DELETE /{Id}` vs `PUT /{id}`; `products /{Id}` + `/{Id}/transactions` vs `/{id}/movements`+mutations; `wallets GET /{Id}` vs `/{id}/*`. Cosmetic — routing works because the FE builds URLs from ids.

**backend-deltas.md reconciliation:** §1 Overdue **Done** · §2 list `number` **Done** · §3 `originalTransactionNumber` **Done** (served; but FE drops it — F6) · §4 movement counterparty ids **Done** · §5 opening-stock note+decimal **Done** · §6a `lastUsedAt` **Missing** (Nice-to-have) · §6b template sku/measurement/discountType **Done** (but FE model omits `discountType` — F4) · §7 wallet-op `partnerId` **Done** (served; FE doesn't model it — F10) · §8 F-006 RetailPrice **Done** (zero `retailPrice` in openapi; unblocks product create) · §9/§10/§12 **Cannot-verify** · §11 reset **Done**.

### B. Frontend implementation gaps — detail

**Cross-cutting root cause for F1/F2/F3 — "lean write-response stored without re-read."** `create()` handlers were hardened to re-read the full entity via `getById` (Partner F-011 fix, `PartnerApi.ts:41-49`), but the `update()`/PUT handlers store the **lean** write-response DTO directly. Because the aligned contract's `Update*Response`/`Create*Response` omit server-computed fields the list/detail render (`images`,`warehouseItems`,`totalStock`,`averageCost`,`balance`,`isDeletable`,`productCount`), an in-session edit leaves the row with `undefined` in those fields until a full reload. **Products is a crash/blank (Blocker); Partners loses the balance and breaks delete-gating (Important); Categories shows count 0 and misroutes the delete dialog (Important).** The fix pattern is the same as `create()`: re-read via `getById` after PUT (or widen the write-response DTOs backend-side).

**F4 — Templates Fixed-discount / negative totals (Important).** The contract now serves `TemplateItemDto.discountType` and `CreateTemplateItem`/`UpdateTemplateItem` **require** it, but the FE `TemplateItem` model omits `discountType`, `TemplateSchema.ts:21-24` caps `discount` at `max(100)` (percentage-only), `TemplateFormModal` has no discount-type control, and `calculateLineTotals`/`TemplatesTable.tsx:67` compute `qty×price×(1−discount/100)` unconditionally. A served **Fixed** discount (e.g. 5000) computes `1 − 5000/100 = −49` → the absurd negative template totals on the deployed list. **The backend half of delta §6 landed; the FE half did not.** This is the single clearest data-visible bug and now unblockable (the contract disambiguates the semantics).

**F5 — Dashboard recent-tx crash-risk (Important).** `DashboardRecentTransactionDto.status` is served `string?`; the FE narrows to `"paid"|"partial"|"unpaid"` and does `STATUS_TONE[status].bg` with **no fallback** (`RecentTransactionsTable.tsx:31-39,177`). If the real backend serves any other casing/value (e.g. `TransactionStatus` `"Open"/"PartiallyPaid"`), `tone` is `undefined` → the recent-transactions table crashes **on the landing page**. Unverified which values the backend serves — flag as a crash-risk to confirm/guard.

**F6/F7 — Transactions.** F6: `RawTransaction`/`toRecord` (`TransactionApi.ts:27-77`) omit the served `originalTransactionNumber`, so on the real backend the list «Возврат к №N» sublabel and the refund-detail reference banner/financial card render blank (the refund→original link still works via client-side re-resolution). F7: `TransactionAttachment` is FE-typed `{name, kind:'pdf'|'img', size:string}` but the contract serves `{name, contentType, sizeBytes:int64, url}` → attachments render the wrong icon, a blank size, and **no download URL** (only the disabled mock supplied `{kind,size}`).

**F8 — Warehouse movements refund filter (Important).** FE `WAREHOUSE_MOVEMENT_KINDS = [Opening,Supply,Sale,Refund,Adjustment,Transfer]` collapses refunds to one `Refund`; the contract `MovementKind` splits `SaleRefund`+`SupplyRefund` (7 values). Display is defended, but the «Движения» type-filter's «Возврат» option (`movement.kind===type`) matches **zero real-backend rows** — refund movements are unfilterable against the real API.

**F9 — Payment rendering unguarded (Important).** `sourceType`/`allocationType`/`direction`/`type`/`walletType` are served as free `string?`; the FE types them as strict unions with **no runtime guard**, and `PaymentAllocationCard` does `ALLOC_META[a.allocationType].color` — an unknown `allocationType` throws. Also `walletId` is nullable in the contract but modeled required; a wallet-less record breaks `WalletLink`.

**F10 — Wallet ops (Important).** `WalletOperationDto.direction` is served `string?`; FE narrows to `"In"|"Out"` and branches on `=== "In"` for the green/red badge — if the backend serves canon `Income/Expense`, **every row renders red "Out"** (unverified). Separately, the served `partnerId` (delta §7) is **not in the FE model**, so WAL-7 (clickable party) stays unresolved — the field is now available to wire.

**F11 — Employee status (Important).** `EmployeeDto.status` is served `string?`; only `EmployeeStatusBadge` has a null/unknown fallback. The **action logic** (`EmployeeActionMenu.tsx:32`, `EmployeesTable.tsx:72`: `status==='Terminated'`) treats a null/unknown status as **active** — shows «Выплатить»/«Уволить» and a non-dimmed avatar for an employee whose real status is unresolved.

**F12 — Partner Telegram dropped (Important).** `Partner`, `CreatePartnerRequest`, `UpdatePartnerRequest` all carry `telegram?`, the form collects it (`PartnerFormModal.tsx:331`), and it's sent — but the contract has **no telegram field**. On the real backend the entered Telegram is silently discarded and blank on every reload. Decide: add `telegram` backend-side, or drop it from the FE.

**F13 — Wallet transfer over-balance guard (Important, latent).** `WalletTransferModal.tsx:158`: `over = amount > available` with `available = balance ?? 0`. When `balance < 0`, this is true for **every** amount ≥ 0 → an overdrawn wallet can never be a transfer source (blocks even amount 0). Needs `Math.max(available, 0)`. Mirrored in the mock and presumably server-side.

**F14 — Client-side lists & search (Important; B2/B3).** Both shared tables (`DataTable.tsx:141`, `ExpandableDataTable.tsx:142`) slice the full array client-side (`count = rows.length`, canonical 10/25/50; no `PagedResponse` type exists). The param-forwarding plumbing exists (`BaseApi.getUrl(request)`; `TransactionApi`/`OrderApi.getAll(request?)` forward), but **every list store calls `getAll()` with no arguments**, so search/filter/sort/paging run entirely client-side even where the contract advertises server params. Consequence: **Cyrillic↔Latin search parity is whatever the client `matchesSearch` does** (no server normalization), and every list does an unbounded full-array fetch (a scale risk as design partners migrate real books — DR-15/DR-16). Deliberate for v1 (decision 2026-06-11); flagged because the server capability now exists and is unused.

**F15 — Archive leak (Important; B4).** `PartnerAutocomplete type="Both"` returns `partnerStore.allPartners` (**includes archived**); `TemplateFormModal` uses `type="Both"`, so its partner picker can select an archived partner. The `Customer`/`Supplier` branches correctly use the archived-excluding getters, and New Sale / New Order / Order-edit pickers are clean. Minor sibling: `EmployeeAutocomplete` returns all employees incl. `Terminated` (Payments payroll flow can pick a terminated employee) — Nice-to-have. Details/totals correctly resolve archived references everywhere (served denormalized names; totals span archived per rule 31).

**F16/F17 — i18n (B5).** F16 (Important): the shared `DataTable.tsx:280` renders `«Нет записей»` as a hardcoded literal with no i18n key and no `emptyMessage` override — it surfaces untranslated on **every** empty list app-wide; plus month arrays (`EmployeeDetailPage`, `PaymentCreateModal`), hardcoded plural forms (`DebtSummaryCards`, `TemplatesTable`), and a few hardcoded `UZS` units. Otherwise ru discipline holds (no hardcoded JSX text, no hardcoded toasts). F17 (Blocker, launch): uz-Latn is missing **11 substantive namespaces** (dashboard, debt, order, partner, payment, settings, stockAdjustment, transaction, transfer, wallet, warehouse), `common` is ~8% filled, `uz/template.json` is an empty `{}`, and uz-Cyrl is an empty stub. This backfill is a **launch blocker** per mvp-plan cross-cutting #14 — currently masked because `languages.ts` gates the picker to ru-only, so it's latent, not a live break.

### C. Unbuilt v1-scope modules — detail

**U1 — Activity Log (Blocker).** `PATHS.activityLog = "/activity-log"` is routed but only to `<PlaceholderPage>` (`App.tsx:110`). There is **no `AuditApi`** and **no backend audit endpoint** (A12). Rules 26–28 (the dispute-grade audit trail — the product's stated core differentiator) have **no surface at all**. This is the largest single open gap; it needs both a backend endpoint and a screen (the screen has no Design prototype yet — mvp-plan Open item #1).

**U2 — Акт сверки / reconciliation statement (Important).** mvp-plan §16: a per-partner, date-range, print-friendly statement rendered from the ledger. The **data exists** (`GET /api/partners/{id}/ledger` → `PartnerLedgerEntryDto[]`, already consumed by the partner-detail ledger), but the print screen isn't built. Lower effort than U1 because the backend is ready.

---

## Superseded (dead targets — with the rule that killed each)

- **"System partner «Розничный покупатель»"** (old blocker) → **rule 39** (updated 2026-06-30): *no* system/walk-in partner; `partnerId` required on every sale. The contract has no system-partner flag and `customerId`/`partnerId` is required. Dead.
- **"Order: warehouse (InventoryId) required at creation"** (old blocker) → **business-rules Domain model** (warehouse chosen at **delivery** confirmation). The contract matches: `CreateOrderRequest.warehouseId` is **optional**, `DeliverOrderBody.warehouseId` is required. (The product owner reinstated an *optional intended* warehouse at create — supported.)
- **`OrderSource.None`** (in the canon **enum reference**) → dropped from the contract (`OrderSource = [Telegram, OmborWeb]`), aligned with F-017; New Order defaults `OmborWeb`. The **canon enum reference is stale** and should drop `None`.
- **"No `Overdue` in `TransactionStatus`"** (backend-deltas §1) → the enum now includes `Overdue`; the FE already consumes it. Dead delta.
- **"Whole payment model is legacy `PaymentMethod`"** (old current-state) → `PaymentMethod`/currency/exchangeRate removed from the contract; the source/allocation model is served. The FE's `models/payment.ts` still *declares* the legacy types for the Payroll / New-Sale debt flows — dead vs the contract but kept as living code (see Found-during-recon).
- **"Warehouses live at the stale `/api/inventories`; the FE mocks `/api/warehouses`"** → `/api/warehouses*` is real; the FE calls it directly. The "dead inventory module" was removed in the same alignment commit.
- **"No backend endpoint" for Wallets / Stock-Adjustments / Transfers / Debts / Dashboard / Settings / Auth-reset** (CLAUDE.md repo-state + module docstrings) → **all real now**. Those docstrings are stale (see Found-during-recon).

---

## Found during recon (gaps / debt not on the original list)

1. **The FE runtime-drift class (F1–F12)** — the whole "backend aligned, frontend lagging" surface above. None of it is on the backend-only tech-change-list because it is frontend work; it is the highest-value output of this recon.
2. **Stale docstrings / repo-state across the FE** — `DebtApi`, `DashboardApi/Store`, `OrderApi`+`models/order.ts`, `AuthApi`, `models/auth.ts`, `SettingsStore`, and the matching mock handlers all still assert "no backend endpoint / mocked" for resources that are now real. CLAUDE.md's repo-state paragraphs for Settings ("no backend exists"), Dashboard ("no backend dashboard endpoint"), Wallets/Stock-Adjustments/Transfers/Debts ("not started"/"no backend") are stale. Recommend a doc-sync pass.
3. **`backend-deltas.md` is ~90% resolved** but still lists all 12 as open (verified 2026-07-04, one day before the alignment). Recommend pruning it to the 4 genuinely-open items: §6a `lastUsedAt`, §9 seeding, §10 400-vs-500, §12 tenancy. *(Done 2026-07-14 — the queue was retired; backend verification showed only §6a still open, carried as `backend-gaps.md` D1.)*
4. **Stale mock handlers are now divergent debt** — with mocks off they don't run, but if a dev flips `VITE_ENABLE_MOCKS=true` several would misbehave: `transaction.ts` POST reads a single `payload` part while the real create sends flat model-binder fields (`Lines[0].ProductId`) → 400 on every create; `template.ts` emits items without `discountType` + a `lastUsedAt`/`total` the real DTO lacks; `settings.ts` seeds `contactType:"email"` (real enum `Email`); `warehouse.ts` collapses refund kinds + omits counterparty ids; `partner.ts` serves `telegram` + a full PUT response. Dev-only, but the mocks no longer reflect the contract they're supposed to mirror.
5. **`ProductDto` lacks `isDeletable`** (A11) though a product DELETE route exists — the FE can't gate product deletion from a served predicate (rule 32 pattern is complete for Partner/Warehouse only).
6. **`OverpaymentHandling` asymmetry** (A2) — expressible on transaction-create (POS) but not on standalone payment-create; the standalone flow can only produce `TransactionSettlement`+`AdvanceCredit`, never `ChangeReturn`.
7. **Dead FE code carrying destructive/legacy capability**: `EmployeeApi.delete`+`EmployeeStore.delete/openDelete` (hard-delete, unreachable in UI); legacy `SaleStore` (`setTimeout(500)` + hardcoded `Sale[]`, violates hard rule 6 — confirm no consumer before removal); legacy `models/payment.ts` `PaymentMethod`/`PaymentCurrency`/old allocation union; `ProductAutocomplete` (orphaned, and its `type==='All'` branch leaks archived).
8. **`GET /api/transfers/{id}`** is served but unimplemented in `TransferApi` (the detail modal is fed the list-row object) — harmless, but a served route unused.

---

## Decisions needed (not fixes — for v2 planning)

1. **Quantity type: `number(double)` contract-wide vs rule 21 / DR-12 (integer base units in MVP).** The aligned contract types **every** quantity as `double` (transaction/order/transfer/opening-stock/template/adjustment/stock/movement lines); the FE inherits `number` with no integer guard (steppers clamp to ≥1 but nothing enforces integer end-to-end). DR-12 still says integer-only, fractional → V2 — **but DR-16 (today, 2026-07-09) moved design partner #3 to an oil reseller (multi-warehouse, loose-volume)**, which is exactly DR-12's revisit trigger. **Decision:** is the `double` typing an intentional early adoption of fractional stock (then rule 21/DR-12 should be reopened and the FE should format/accept decimals), or contract drift ahead of canon (then the backend should reject fractional in MVP)? This is a dispute-grade-core decision, not polish.
2. **Payment write-model completeness (A2/F9/§6).** Should `CreatePaymentRecordRequest` gain advance-source + `OverpaymentHandling` for parity with the POS, or is the standalone flow's DR-05 deferral the accepted MVP state? Ties into the v2 settlement-semantics round.
3. **Partner Telegram (F12).** Add `telegram` to the partner contract, or drop the field from the FE form/model? (It's silently dropped today.)
4. **Server-side search/pagination adoption (A19/F14).** The params exist; DR-15/DR-16 (real books migrating, multi-warehouse partner) raise the scale pressure. Decide whether v2 wires the existing `SearchTerm`/filter params (and adds pagination) or keeps client-side. Also gates the Cyrillic↔Latin search-parity requirement (A20).
5. **Canon reconciliation:** drop `OrderSource.None` from the enum reference; type `PaymentSourceType`/`PaymentAllocationType` as enums in the contract (served as free strings today); reconcile `DR-14` (no persisted numbering) with the now-served `number` field.

---

## Cannot-verify-from-frontend (backend-session handoff)

Needs a backend session / two-tenant test — the contract can't reveal these:
- **A5 / delta §12 — multi-tenant isolation** (rule 34): confirm every org-scoped query + payments are `OrganizationId`-scoped. Blocker; needs a two-tenant test.
- **WAC formula & atomic stock-in update** (rules 18–19); **negative-stock hard-block** (rule 20); **refund type-match / no-refund-of-refund / cumulative-cap** (rules 3–5) — served fields exist; the enforcement is internal.
- **Category 409 delete-guard + tenant-setup seeding** (rules 42, A23); **delta §9** default-partner seeding; **delta §10** invalid-`OrderSource` 400-vs-500.
- **Cyrillic↔Latin search normalization** (A20) — behavior of the `SearchTerm` implementation.

---

## Part C — capability snapshot (the "what exists" baseline for v2)

One line per module — what it does today + notable absences. No judgments.

- **Products + Categories** — Client-side CRUD: product create/edit via multipart (images, packaging, sale/supply prices — no RetailPrice/QuantityInStock), archive/restore, routed detail with per-warehouse WAC stock + transactions/movements sub-tabs; category CRUD with reference-gated (productCount) delete. *Absences:* product **edit crashes/blanks** on the real lean PUT response (F1); `isDeletable` not served for products; search/filter/paging all client-side (12 unused server params).
- **Partners** — List (summary strip, search/type/archive filters, CSV), routed detail with server-computed balance + dispute-grade running-balance ledger (Журнал/Транзакции/Платежи), create/edit (opening editable→locked), archive/restore, reference-gated delete. *Absences:* **edit drops the served balance** until reload (F2); Telegram field silently dropped (F12); `type="Both"` autocomplete leaks archived (F15).
- **Transactions (Sales/Supplies/Refunds)** — Unified immutable feed from `GET /api/transactions` (client-filtered by direction/search/status incl. served `Overdue`/date), routed detail from `/{id}` (positions, payments, refund history, audit card), single multipart `POST` creates sale/supply/refund; correctly no edit/delete. *Absences:* served `originalTransactionNumber` dropped → blank refund refs (F6); attachment DTO mis-shaped (F7); all four server filter params unused.
- **Payments** — List/detail of 5 immutable payment types; detail renders the two-sided `sources[]/allocations[]` read model; create with a client-side FIFO settlement modal. *Absences:* write model can't express an Advance source or change-vs-advance disposition (A2); allocation rendering unguarded (F9); dual payroll-create paths (standalone vs employee endpoint).
- **Wallets** — List with server-computed balance/advancesHeld/ourMoney, routed detail with immutable Операции ledger + Переводы tab, create/name-only-edit/archive/restore, inter-wallet transfers; all nine routes real. *Absences:* served op `partnerId` not modeled (WAL-7); direction narrowed `In/Out` (risk if backend serves Income/Expense, F10); over-balance guard blocks overdrawn-wallet sources (F13).
- **Warehouses + Stock Adjustments + Transfers** — All three real endpoints (MSW off): warehouses list + detail (Остатки/Движения) + create/edit/archive/restore + reference-gated delete + opening-stock (note sent); adjustments & transfers immutable list+create with over-stock hard-block; movements deep-link via served counterparty ids. *Absences:* «Движения» refund filter matches nothing (collapsed `Refund` kind, F8); list warehouse-filters exclude archived warehouses; served `GET /transfers/{id}` unused.
- **Templates** — Partner-tied Sale/Supply baskets on the shared ExpandableDataTable, client search/type filter, expand-row line items + totals, create/edit/delete modal. *Absences:* **percentage-only discounts → negative totals on Fixed data** (F4); «Использован» always «—» (lastUsedAt unserved); server params unused.
- **Orders** — The one mutable transaction: list/filter/search (client-side), routed detail (stepper, status-history, delivery card, positions, partner-mini), full state machine (process/ship/deliver/cancel/reject/return) with warehouse chosen at delivery + self-contained Sale promotion, New Order POS + pre-delivery edit with %/fixed line discounts. *Absences:* warehouse required at create (contract allows null; canon says at-delivery); `UpdateOrderRequest.warehouseId` sends a raw scalar vs the contract's `Int32NullableOptional` wrapper (verify PUT); server filters unused.
- **Employees + Payroll** — Real backend: list (search/status filter/sort/pager), routed detail with immutable payroll history (GET+POST payrolls, no PUT/DELETE), create/edit, terminate/restore as a status change (never hard delete). *Absences:* served `status` is nullable string but action logic treats null/unknown as active (F11); hard-delete plumbing retained but unreachable; local test backend serves **zero** payrolls (only the empty state was exercised).
- **Debts** — Read-only client-aggregated view over `GET /api/debts` (`DebtDto[]`): summary cards, По партнёрам + По транзакциям tables (shared DataTable, sortable, 10/25/50), search/age/direction filters, card-preset jumps, partner + transaction deep-links, CSV. *Absences:* no server filtering (endpoint has zero params — expected for the aggregate); nullable served enums narrowed non-null.
- **Dashboard** — Single served snapshot `GET /api/dashboard?period=` (real now): 4 clickable KPI cards, sales-vs-supplies + diverging-payments charts (per-wallet client filter), aging panel, top-5 debtors (deep-linked), 8-row recent-tx preview (row → toast). *Absences:* recent-tx `status` unguarded (crash-risk, F5); period sent lowercase vs PascalCase enum (works via case-insensitive binding); recent-tx rows don't drill through.
- **Auth + Settings/Org** — Real backend: register (form→4-digit OTP→welcome), phone+password login, silent refresh, logout, **real** password reset (forgot→verify→reset), org profile (multipart+logo), tenant users list/invite(phone-only)/deactivate/reactivate, write-only per-user language. *Absences:* no `/me` (identity from JWT; `organizationName` never populated); language **not restored at login** (A18); no email invite; no roles (v2, rule 35).

---

**F18 — Payment attachments (Important; found 2026-07-15 · attachments landed + live-verified 2026-07-19).** ~~The served detail `PaymentRecord` shows no attachment metadata.~~ **Resolved (attachments):** the backend wave-5 made payment-create **multipart** and serves `attachments: PaymentAttachmentDto[]` (+ echoed `transactionNotes`/`transactionAttachments`). FE landed: `PaymentApi.create` → multipart (`extends BaseApi`), the create modal gained the shared `AttachmentPicker`, and the detail gained `PaymentAttachmentsCard` (own attachments + a muted "Из операции" echo). Extracted the shared `AttachmentChip` (transaction + payment). Live-verified: General payment with 2 files → POST 201 with `attachments[]`; detail renders both chips; download URLs resolve to the API base (via `getImageFullUrl`). **Still deferred (feature):** a note-on-any-payment input (non-General payments carry no note) — owner to schedule. *(The note↔`description` mechanism round-trips for `General` only, as before.)*

**F19 — DR-21 bare document numbers: FE hand-prefixed `#`/«№» not routed through `formatEntityId` (Important; found + resolved 2026-07-15).** After DR-21 (`redesign/issue-numbering`) the backend serves **bare** document numbers — `TransactionDto.number` `"S-42"`→`"42"`, `PaymentRecordDto.number` `"P-7"`→`"7"`, `OrderDto.orderNumber` GUID→`"3"`, plus `originalTransactionNumber` / `paymentNumber` / `DebtDto.number`, all bare strings (contract: `../Ombor.Docs/backend-contracts/transactions-payments.md`, `partners-debts-dashboard.md`). Several FE sites hand-assembled `#`/«№» inline instead of the canon `formatEntityId` helper, so on the bare contract they rendered inconsistently (`#42`, bare `7`, or a raw GUID): transaction detail refund banner / financial-card / refund-history + payments sub-card (`cards.tsx`), POS settlement chips (`TransactionSummaryCard.tsx`), refund modal title + success toast (`RefundModal.tsx`, `TransactionStore.ts`), the `transaction.list.refundOf` string; payment list / detail / links / settlement (`PaymentsTable.tsx`, `pages/PaymentDetailPage.tsx`, `pages/PaymentPage.tsx`, `PaymentDetailCards.tsx`, `PaymentLink.tsx`, `AllocationLink.tsx`, `PaymentSettlementModal.tsx`); order-number substring search (`OrderStore.ts`). **Also folded in F6** — `TransactionApi.toRecord` dropped the served `originalTransactionNumber`, blanking the «Возврат к №N» sublabel. **Resolved** — every document number renders via `formatEntityId` («№…»), the inline prefixes are dropped, and order-number search is exact-match integer (chunks: `redesign/issue-transaction-numbering`, `redesign/issue-payment-numbering`, `redesign/issue-order-search`).

**F21 — POS package-unit pack-count persistence (Important; found 2026-07-17 · landed + live-verified 2026-07-19).** ~~The entered pack count was FE-only, lost on submit.~~ **Resolved:** the backend wave-5 is server-authoritative — the line/template-item create accepts `packageQuantity` (the count), computes base `quantity = count × size`, and snapshots `packageSize` (served on read; count = `quantity ÷ packageSize`). FE landed: `buildPayload`/`TransactionApi.create` send `packageQuantity` for pack lines (base `quantity` stays the source of truth for FE math); the transaction detail (`cards.tsx PositionsCard`) and template table show "N упак"; templates round-trip silently (no modal UI); POS save-as-template + load restore pack mode (and the `loadTemplate` `discountType` drop was fixed in the same pass). Live-verified: a pack supply (2 × «Коробка 12 шт») persisted base qty 24; detail shows «2 упак / 24».

*End of regenerated list. Items A1–A26, F1–F21, U1–U3 above are the verified state as of 2026-07-09 (F18–F21 appended later, dated inline) against the API contract and the current working tree.*
