# Redesign issues — CodeRabbit review backlog

**Status:** triage backlog captured at merge time so nothing is lost. These are **not** verified live bugs — they are the CodeRabbit review comments left across the redesign PR stack (#42–#64), curated down to the ones worth attention. Treat each as "flagged, needs triage against current `master`," not "known broken."
**Generated:** 2026-07-20, when the redesign stack was merged to `master` and the feature branches were removed.
**Source:** ~244 CodeRabbit inline comments across 22 stacked PRs, deduplicated and grouped by theme. GitHub thread-resolution was unusable (0 threads ever marked resolved — the stacked PRs were auto-reviewed, never formally triaged), so curation is content-based.
**Severity:** **Blocker** (violates a hard rule / crashes a normal flow) · **Important** (correctness or a documented hard rule, non-crashing) · **Nice-to-have** (polish, a11y, cosmetics).

> ⚠️ **Read this first — much of this predates the fix waves.** Most comments were written against **June** code (PRs #46–#63). The app has since been through the F1–F21 and XC-series fix waves. **Some are already fixed.** Spot-checks done at capture time:
>
> | Claim | File | Verdict at capture |
> | --- | --- | --- |
> | CSV formula-injection guard missing | `utils/exportToCsv.ts` | ✅ **Already fixed** — `escapeCell` now neutralises leading `= + - @ \t \r` |
> | Discounted line total not clamped at zero | `utils/transactionUtils.ts:41` | ❌ **Still present** — `gross - line.discount`, no zero floor |
> | `disabled={busy}` on auth submit (hard rule #5) | `pages/ResetPasswordPage.tsx` | ❌ **Still present** — 3 occurrences |
> | Client-side `remaining` recompute (hard rule #8) | `pages/TransactionDetailPage.tsx:136` | ⚠️ **Partial** — prefers backend `tx.remaining`, but falls back to a client recompute |
>
> Before acting on any item, confirm it still reproduces. Cross-reference [frontend-gaps.md](frontend-gaps.md) (F-items) and [repo-state.md](repo-state.md).

---

## Fast-scan summary

| # | Theme | Count | Severity | Hard rule | Notes |
| --- | --- | --- | --- | --- | --- |
| 1 | Financial correctness | 7 | Important | #8 | Client-side recompute, refund matching, discount clamp |
| 2 | Silently-disabled buttons | 10 | Important | **#5** | Direct hard-rule violation across auth + modals |
| 3 | Stale async overwrites | 7 | Important | — | Out-of-order `load()` responses clobber newer state |
| 4 | Money/quantity display | 9 | Important | — | Real zero/negative collapsed to «—»; stock shown as currency |
| 5 | Discrete real bugs | ~12 | Important | — | JWT decode, infinite-load on bad `:id`, dropped error banners, … |
| 6 | Accessibility (keyboard/ARIA) | 26 | Nice-to-have | — | Click-only rows/cards; custom tabs lack tab semantics |
| 7 | Hardcoded UI strings / i18n | 38 | Nice-to-have | **#2** | Bulk cleanup; hard-rule class but individually cosmetic |
| 8 | Validation UX | ~10 | Important | #5 | Errors collapsed / not reported inline |
| 9 | CSV export polish | 3 | Nice-to-have | — | Guard-while-loading; injection guard already landed |
| 10 | Non-English code comments | 3 | Nice-to-have | — | Russian comments in source |
| — | Mock-layer comments | 33 | **Moot** | #6 | `src/mocks/` is dead code (`VITE_ENABLE_MOCKS=false`), pending deletion |
| — | Doc / test-case consistency | 40 | Nice-to-have | — | Internal contradictions in canon + `docs/testing/test-cases/` |

---

## 1. Financial correctness — Important (hard rule #8)

Computed balances must come from the backend; refund/discount math must not silently go negative or mis-match lines.

- `pages/TransactionDetailPage.tsx:140` (PR#52) — Don't recompute `remaining` on the client. ⚠️ *still partially present as a fallback.*
- `utils/transactionUtils.ts:47` (PR#52) — Clamp discounted line totals at zero. ❌ *still present.*
- `components/order/Create/NewOrder.tsx:49` (PR#63) — Clamp percentage discounts before deriving line totals.
- `components/transaction/Refund/RefundModal.tsx:81` (PR#52) — Match prior refund lines by `productId`, not `productName`.
- `models/transaction.ts:91` (PR#52) — Tie refund lines to the original transaction line, not client-supplied price/name.
- `stores/TransactionStore.ts:117` (PR#52) — Order refunds relative to their own original transaction only.
- `components/warehouse/Detail/WarehouseStockTab.tsx:117` (PR#49) — Clamp pagination state after upstream data-size changes.

## 2. Silently-disabled buttons — Important (hard rule #5)

Hard rule #5: *never silently disable buttons — keep actions enabled, validate on submit, report inline.* These directly violate it.

- `pages/ResetPasswordPage.tsx:154` (PR#62/#63) — remove `disabled={busy}`. ❌ *still present (×3).*
- `pages/LoginPage.tsx:96` (PR#62) — keep submit enabled during validation/submit.
- `pages/RegisterPage.tsx:195` (PR#62) — keep auth buttons enabled; dedupe requests inside handlers instead.
- `components/order/Modal/OrderFormModal.tsx:308` (PR#54) — `PartnerAutocomplete` missing `disabled` during save (inverse: control not locked while saving).
- `components/order/Modal/DeliveryConfirmModal.tsx:332` (PR#54) — Confirm button save-state handling.
- `components/settings/InviteUserModal.tsx:200` (PR#59) — do not disable action buttons in this flow.
- `components/transaction/Create/CartLineRow.tsx:195` (PR#60) — don't silently disable the decrement action.
- `components/transaction/Create/SaveTemplateModal.tsx:57` (PR#60) — validate/report inline instead of disabling modal actions.
- `components/wallet/Form/WalletTransferModal.tsx:292` (PR#55) — use a focusable button for "transfer all".

## 3. Stale async overwrites — Important

Out-of-order responses overwrite newer state — the same bug class as the [store update must re-read] memory. Guard `load()` with a request token / abort.

- `stores/PartnerLedgerStore.ts:57` (PR#52)
- `stores/SelectedProductStore.ts:62` (PR#48)
- `stores/SelectedWarehouseStore.ts:64` (PR#49)
- `stores/DashboardStore.ts:48` (PR#59) — stale dashboard responses overwrite newer period data.
- `hooks/wallet/useWalletTransferForm.ts:55` (PR#55) — default transfer route seeding goes stale when wallets load async.
- `components/transfer/Form/TransferFormModal.tsx:153` (PR#51) — default warehouse init misses async-loaded warehouses.
- `components/product/Form/ProductFormModal.tsx:63` (PR#48) — validate auto-selected category after async load.

## 4. Money / quantity display — Important

Real zeros and negatives must render, not collapse to «—»; stock is a quantity, not currency.

- `components/product/Table/productsTableConfigs.tsx:45` (PR#48) — don't collapse a real zero price into «—».
- `components/product/Table/productsTableConfigs.tsx:194` (PR#48) — render stock as quantity, not currency.
- `components/product/Detail/ProductDetailRail.tsx:57` (PR#48) — render zero/negative monetary values.
- `pages/ProductPage.tsx:68` (PR#48) — preserve zero prices in CSV export.
- `components/employee/Form/EmployeeFormFields.tsx:87` (PR#58) — preserve zero-vs-empty salary state.
- `pages/OrderPage.tsx:45` (PR#54) — use `formatCurrency` for exported totals.
- `utils/orderUtils.ts:119` (PR#54) — use `formatCurrency` for fixed discount amounts.
- `pages/StockAdjustmentPage.tsx:67` (PR#49) — use the shared quantity formatter in CSV export.
- `components/order/Modal/OrderFormModal.tsx:495` (PR#54) — `NumericField` shows empty when `unitPrice` is `0`.

## 5. Discrete real bugs — Important (triage individually)

- `stores/AuthStore.ts:43` (PR#46) — JWT claim decoding in `userFromAccessToken`.
- `pages/EmployeeDetailPage.tsx:195` (PR#58) — invalid/non-numeric `:id` route param → infinite loading state.
- `components/partner/Detail/ledgerHelpers.ts:27` (PR#52) — future-dated entries incorrectly pass period filters.
- `pages/RegisterPage.tsx:63` (PR#62) — backend registration errors dropped (`banner` state never rendered).
- `pages/ResetPasswordPage.tsx:79` (PR#63) — wrong reset codes surface the wrong inline error.
- `pages/ProductPage.tsx:51` (PR#48) — edit image-removal not propagated on update.
- `pages/WalletDetailPage.tsx:127` (PR#55) — restore action bypasses the page's confirmation flow.
- `stores/TransferStore.ts:84` (PR#51) — created transfer dropped when list is still loading.
- `stores/WalletStore.ts:130` (PR#55) — cached wallets not preserved on refresh failure after a successful mutation.
- `stores/PartnerStore.ts:246` (PR#52) — clear `selectedPartner` when the selected partner is removed.
- `components/dashboard/motion.ts:77` (PR#59) — guard `duration` to prevent a non-terminating animation loop.
- `components/order/Detail/TerminalBanner.tsx:99` (PR#54) — guard `last` before dereferencing terminal history metadata.
- `services/api/SettingsApi.ts:13` (PR#63) — remove the manual `Content-Type` header for FormData uploads.
- `models/order.ts:120` (PR#63) — don't require `warehouseId` on order creation (contract mismatch — cross-check vs backend-contracts).
- `layouts/config.ts:75` (PR#46) — restore links for the still-mounted payroll/activity routes.

## 6. Accessibility (keyboard / ARIA) — Nice-to-have (26)

No a11y bar is set in canon, so these are polish — but they cluster into two cheap, high-leverage fixes: **(a)** a keyboard-accessible "clickable table row" primitive (reused by partner, wallet, warehouse, employee, dashboard, stock-adjustment tables), and **(b)** ARIA tab semantics for the custom tab strips (product, warehouse detail). Representative:

- Click-only rows: `partner/Detail/TransactionsTab.tsx:134`, `wallet/Detail/WalletOperationsTab.tsx:190`, `warehouse/Table/WarehousesTable.tsx:192`, `employee/Table/EmployeesTable.tsx:155`, `dashboard/RecentTransactionsTable.tsx:87`, `stockAdjustment/Table/StockAdjustmentsTable.tsx:194`.
- Custom tabs need tab semantics: `product/Detail/ProductDetailTabs.tsx:69`, `warehouse/Detail/WarehouseDetailTabs.tsx:42`.
- Archive/group toggles not exposed to AT: `partner/List/PartnerListHeader.tsx:53`, `product/Header/ProductHeader.tsx:50`, `warehouse/Header/WarehouseHeader.tsx:55`, `layouts/Sidebar.tsx:111`.
- Clickable non-buttons: `dashboard/DashboardWelcome.tsx:112`, `dashboard/TopDebtorsPanel.tsx:73`, `settings/SettingsNav.tsx:40`, `stockAdjustment/Form/StockAdjustmentModal.tsx:84`, `transaction/Create/TransactionSummaryCard.tsx:301`, `transaction/Detail/cards.tsx:286`, `auth/AuthFields.tsx:427` (TermsCheckbox), `auth/AuthChrome.tsx:36` (AuthLink), `product/Form/Images/ProductFormImages.tsx:67` (icon-only buttons).

## 7. Hardcoded UI strings / i18n — Nice-to-have, but hard rule #2 (38)

Hard rule #2 forbids hardcoded UI strings. Mostly hardcoded `UZS`/currency suffixes and un-namespaced labels/aria-labels. High-frequency offenders:

- Hardcoded currency/`UZS`: `wallet/List/WalletSummaryStrip.tsx:65`, `warehouse/Detail/WarehouseKpis.tsx:103`, `partner/Detail/PartnerBalanceCard.tsx:207`, `partner/List/PartnerSummaryStrip.tsx:66`, `partner/Form/PartnerFormModal.tsx:460`, `transaction/Create/TransactionSummaryCard.tsx:171`, `wallet/Form/WalletTransferModal.tsx:84`.
- Un-namespaced labels/placeholders: `layouts/Sidebar.tsx:66`, `layouts/Topbar.tsx:31`, `auth/BrandPanel.tsx:37`, `order/OrderDeliveryCell.tsx:37`, `transfer/Detail/TransferDetailModal.tsx:218`, `settings/OrganizationSection.tsx:107`, `settings/InviteUserModal.tsx:119`, `transaction/Create/PartnerPicker.tsx:93`, `transaction/Create/NewTransactionEntry.tsx:585`, `pages/EmployeeDetailPage.tsx:59`, `pages/OrderPage.tsx:55`, `wallet/Detail/WalletDetailHeader.tsx:50`.
- Aria-label not localized: `partner/PartnerActionsMenu.tsx:50`, `warehouse/Detail/WarehouseDetailHeader.tsx:52`, `shared/Table/TablePager.tsx:45`.
- `models/transaction.ts:27` (PR#52) — keep payment method as a **code**, not a localized label (data-model concern, not just display).
- Theme-token extraction (dashboard styling literals): `dashboard/{ChartPanel,ChartTooltip,PaymentsChart,DashboardWelcome,TopDebtorsPanel,KassaFilter,AgingPanel}` — move inline `sx` colors/values into `theme.ts`.

## 8. Validation UX — Important where it hides errors

- `components/partner/Form/PartnerFormModal.tsx:90` (PR#52) — phone validation errors collapsed / can point to the wrong field; `openingAmount` can fail with no visible feedback.
- `components/wallet/Form/WalletTransferModal.tsx:261` (PR#55) — `fromWalletId` validation not reported inline.
- `pages/LoginPage.tsx:33` / `pages/RegisterPage.tsx:165` (PR#62) — reinstate Zod schema-based submit validation.
- `hooks/transactions/useTransactionEntry.ts:246` (PR#60) — require warehouse/wallet IDs before treating an entry as valid.
- `schemas/StockAdjustmentSchema.ts:27` (PR#49) — enforce direction-specific reason validation in schema.
- `schemas/PartnerSchema.ts:69` (PR#52) — `message` → `error` for Zod v4 compatibility.
- `schemas/PayrollSchema.ts:13` (PR#63) — reject invalid months.

## 9. CSV export polish — Nice-to-have (3)

- `pages/CategoryPage.tsx:50` (PR#48) / `pages/EmployeePage.tsx:55` (PR#58) — block/guard export while rows are still loading.
- `utils/exportToCsv.ts:50` (PR#48) — defer object-URL revocation until the download starts.
- *(CSV formula-injection in `escapeCell` — ✅ already landed, not outstanding.)*

## 10. Non-English code comments — Nice-to-have (3)

- `components/stockAdjustment/Header/StockAdjustmentHeader.tsx:36`, `components/warehouse/Header/WarehouseHeader.tsx:93`, `components/order/Detail/DeliveryInfoCard.tsx:128` — Russian comments in source (English-only rule).

---

## Deprioritized / moot

### Mock-layer comments (33) — Moot per hard rule #6
All under `src/mocks/`. Since the 2026-07-05 contract alignment the app runs on the **real backend** (`VITE_ENABLE_MOCKS=false`) and `src/mocks/` is **dead code pending deletion** ([repo-state.md](repo-state.md)). Fixing mock seed/validation logic has no runtime effect. If the mocks are deleted as planned, these close themselves. (Examples: `mocks/data/stockAdjustment.ts:157` seeded `balanceAfter` ignores direction; `mocks/handlers/transfer.ts:65` over-stock guard bypass; `mocks/data/wallet.ts:263` non-null assertions.)

### Doc & test-case consistency (40) — Nice-to-have
CodeRabbit flagged internal contradictions in canon (`CLAUDE.md`, `docs/canon/*`) and `docs/testing/test-cases/*.md` — mostly "real-backend vs mock-seeded" environment contradictions, contradictory expected results, markdownlint, and stray non-English glyphs. Worth a single housekeeping pass over the test-case docs; none block product behavior. Notable: `docs/testing/test-cases/payments.md:1065` — wallet reconciliation math for Withdrawal looks wrong; `docs/canon/business-rules.md:50` — reconcile canon with nullable categories.

---

## How this list was built

Fetched every CodeRabbit inline comment from PRs #42–#64 via the GitHub API, categorised by CodeRabbit's own tags (152 "Potential issue", 15 Nitpick, 11 Refactor, 7 Committable, 59 uncategorised), then bucketed by theme and dropped pure nitpicks. Counts are pre-dedup where the same issue was re-flagged on a later stacked PR; file:line + PR# let you jump straight to the original thread. Nothing here is a merge blocker — the stack was merged with these captured as follow-up.
