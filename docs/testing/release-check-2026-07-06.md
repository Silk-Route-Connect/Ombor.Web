# Release-validation sweep — 2026-07-06

**Environment:** deployed dev build — `https://app.miraziz.net` (frontend) + `https://api.miraziz.net` (real backend, **mocks OFF**).
**Auth:** logged in as `+998908221722` (phone + password, no OTP).
**Driver:** Playwright MCP (browser automation) against the live build.
**Tenant:** «Test Market» — began near-empty (welcome dashboard); 4 seed products + 1 warehouse + 1 wallet + system partner existed.
**Run type:** autonomous overnight smoke + cross-module reconciliation sweep. All test records are prefixed **`QA0706`**.

**Headline:** the app is in strong shape for release. Every module passed a smoke pass, and the high-value cross-module reconciliation chains (supply → stock↑ + WAC weighted-average; sale → stock↓ + receivable + wallet credit; refund → stock restored; order deliver → promote-to-sale + stock write-off; payment → wallet/debt; Debts + Dashboard read models) **all reconcile to the exact expected numbers on the real backend**. The two historically-fragile blockers (F-006 product create, F-10 refund `WarehouseId`) are **fixed on the deploy**. One genuine release-blocking bug was found (employee hire-date validation) — **fixed, pushed, and re-verified live this run**. No new Sentry errors were triggered by any create/POS flow.

---

## 1. Per-module status

| # | Module | Status | Notes |
|---|--------|--------|-------|
| 0 | Auth + App shell | ✅ Pass | Login OK; sidebar/topbar/nav render; deep-links + F5 load. |
| 1 | Settings | ✅ Pass | Org + Users hit **real** backend (200) — the "no backend" note is stale. Owner data left unmodified. |
| 2 | Categories | ✅ Pass | Create → 201, toast, count updates. |
| 3 | Products | ✅ Pass | **Create → POST /api/products 201 — F-006 blocker is FIXED on deploy.** No retail field in form. |
| 4 | Warehouses + opening stock | ✅ Pass | Create → 201; opening stock 100 @12000 reconciles (Товаров 1 / 100 ед / 1 200 000; WAC 12000). |
| 5 | Stock Adjustments | ✅ Pass | `/adjustments` (not `/stock-adjustments`). +20 increase → 201; preview 100→120; reason-by-direction. |
| 6 | Partners | ✅ Pass | Create «Оба» → 201 + re-read GET/{id}. Minor F-QA6 (summary +/− signs). |
| 7 | Wallets | ✅ Pass | Create opening 500000 → 201; debits/credits reconcile through the run. |
| 8 | Templates | ✅ Pass | Create → 201; total correct (no §6 negative-total with 0 discount). |
| 9 | New Supply POS | ✅ Pass + reconciles | Stock 120→150, **WAC weighted-avg = 12 400 exact**, wallet 500000→80000. |
| 10 | New Sale POS | ✅ Pass + reconciles | Partial pay; 600 000 / paid 400 000 / rem 200 000 / Частично; payment P-2 linked; stock 150→120. |
| 11 | Refunds | ✅ Pass | **F-10 verified fixed** — request carries `PartnerId` + `WarehouseId`. Stock 120→130 restored at WAC. |
| 12 | Orders | ✅ Pass + reconciles | Create → 201; process/ship/deliver → 200; **promoted to real Sale №500**, stock 130→129 written off. |
| 13 | Transfers | ✅ Pass | Warehouse transfer 5u wh17→wh16 → 201; both warehouses update. |
| 14 | Payments | ✅ Pass | 5 types; **settlement modal** FIFO auto-alloc → 201; detail allocation renders. Minor F-QA4. |
| 15 | Debts | ✅ Pass + reconciles | Нам должны 200k / Мы должны 200k / Чистая 0 — ties to transactions. |
| 16 | Dashboard | ✅ Pass + reconciles | Выручка 600k, receivable/payable 200k each — ties to Debts. |
| 17 | Employees + payroll | ⚠️ Finding | **F-QA1 (blocking, FIXED+deployed)** hire-date; **F-QA2 (S3)** stuck spinner after payroll. |
| 18 | New Order | ✅ Pass | Create → 201; stock guidance non-blocking; warehouse-at-creation. Minor F-QA3 (ISO date in summary). |
| — | Cross-cutting X1–X13 | ✅ Pass | DD.MM.YYYY dates, space-grouped amounts (no symbol, no +/− on money — color/arrows), sortable 10/25/50 tables, entity links, toasts, Russian UI, deep-link F5. |

---

## 2. Consolidated findings

Severity: **S1** crash/data-corruption/money-math/security · **S2** broken, no workaround · **S3** wrong-with-workaround/UX · **S4** cosmetic.

### F-QA1 — Employee hire-date validation rejects *today* (the default) as "in the future" · **S2** · Employees · **Blocking** · ✅ FIXED + DEPLOYED + VERIFIED
- **Repro:** Employees → «Новый сотрудник» → fill name/position/salary, leave the pre-filled hire date (today) → «Сохранить».
- **Expected:** saves with today's date (POST 201).
- **Actual (before fix):** save blocked; hire-date field `[invalid]` with «Дата найма не может быть в будущем». Setting the date to *yesterday* let it save (POST 201) — the date was the sole blocker.
- **Root cause:** [`src/schemas/EmployeeSchema.ts`](../../src/schemas/EmployeeSchema.ts) parsed the `YYYY-MM-DD` date-input string with `new Date(date)` (→ **UTC midnight**) but compared it against **local** midnight. In any timezone ahead of UTC — including **UTC+5 (Uzbekistan, the target market)** — today parses to 05:00 local, which is `>` local-midnight-today, so **today is always rejected**. A naive user is blocked on the happy path.
- **Fix:** parse the `YYYY-MM-DD` parts as a *local* date so both sides compare at local midnight. Commit `9cdc8af`, pushed to `origin/redesign/bug-fixes`.
- **Evidence:** POST /api/employees was absent (blocked) with today's date; after the deploy landed, re-created «QA0706 Сотрудник 2 (дата-фикс)» with today's date `06.07.2026` → **POST 201**, row shows `06.07.2026`.

### F-QA2 — Employee detail hangs on an infinite spinner after creating a payroll · **S3** · Employees · not blocking · LOGGED
- **Repro:** Employee detail → «Выплатить» → fill amount → «Сохранить».
- **Expected:** modal closes and the payroll history + stat cards refresh in place.
- **Actual:** POST `/api/employees/{id}/payrolls` → **201** (data persists), but the detail page renders only a full-page `CircularProgress` with **no refetch and no console error**. A manual page reload recovers and shows the correct data (Выплачено 3 000 000 / 1 payment).
- **Diagnosis:** the page falls into the `employee === null` full-page-spinner branch of [`EmployeeDetailPage.tsx`](../../src/pages/EmployeeDetailPage.tsx) after `handlePayrollSave`; `selectedEmployee` is lost / not re-hydrated. A store-lifecycle/refetch race, not a one-line fix → left for a follow-up session.
- **Evidence:** post-POST snapshot = `main` contains only a progressbar; reload → full render.

### F-QA3 — New Order summary shows delivery date in ISO (`2026-07-10`) not `DD.MM.YYYY` · **S4** · New Order · LOGGED
- **Repro:** `/orders/new`, pick a delivery date → the right-summary «Доставка» row shows `2026-07-10`.
- **Actual vs expected:** should be `10.07.2026` (the order **detail** and everywhere else render `10.07.2026` correctly). The summary echoes the raw native-date input value.
- **Evidence:** create summary «Доставка 2026-07-10»; detail «Дата доставки 10.07.2026».

### F-QA4 — Payment detail «Создал» (created-by) row renders blank · **S4** · Payments · LOGGED
- **Repro:** open any payment detail (`/payments/{id}`) → Информация card → «Создал» label has no value.
- **Actual vs expected:** the transaction detail shows «…· Miraziz Khidoyatov» for the author; the payment detail's «Создал» is empty. Likely the served payment DTO lacks the creator name (backend) — verify before treating as FE.

### F-QA5 — `form_validation_failed` P0 telemetry event not emitted by the Employee form · **S4** (telemetry gap) · Observability · LOGGED
- The employee hire-date validation blocked the save twice, but **no `form_validation_failed` event** appears in PostHog for the run (see §6). The P0 event exists in the taxonomy but isn't wired into `EmployeeFormModal`'s validation-failure path. Low impact; note for the analytics backfill.

### F-QA6 — Partners summary strip uses `+`/`−` sign prefixes on money · **S4** (low confidence, may be intentional) · Partners · LOGGED
- The Partners list summary shows «Всего к получению +0 UZS» / «Всего к оплате −0 UZS». Cross-cutting X4 says money uses colour only (no +/− signs), but the Partners ledger is explicitly dispute-grade/directional, so the sign may be intentional here. Flagging for a design check; do not "fix" without confirmation.

### OBS-1 — `GET /api/auth/refresh-token` returns **500** (not 401) for a missing/invalid token on boot · **S3** · Backend · LOGGED
- On the login page (pre-auth) the app attempts a token refresh and the backend responds **500**, surfaced to Sentry as `OMBOR-WEB-7`. A missing/invalid refresh token should be a **401**, not a server error. Backend-side; the frontend correctly proceeds to login. (Post-login refresh returns 200.)

---

## 3. Prior-findings re-check (on the current deployed build)

| ID | Source | Status on deploy |
|----|--------|------------------|
| **F-006** — product create blocked by `0<supply<retail<sale` + `RetailPrice` | findings.md / backend-deltas §8 | ✅ **NOW FIXED** — product create → 201; no retail field. |
| **F-10** — refund POST missing `WarehouseId` | manual-testing-results | ✅ **FIXED** — request body carries `PartnerId=152` **and** `WarehouseId=17`. |
| **F-013 / F-027** — auto-seeded «Розничный покупатель» | findings.md / backend-deltas §9 | ⚠️ Still seeded, but as type **Both** (the acceptable fallback per delta §9). Not a new bug. |
| Settings «no backend / mock-only» | CLAUDE.md repo-state note | ✅ Stale — `/api/settings/organization` + `/users` are real (200). |
| Orders promotion "self-contained, doesn't write the Sale" | CLAUDE.md / mock note | ✅ Stale for the real backend — deliver **does** create a real Sale (№500) + write off stock. |
| Password-reset endpoints (F-023 / delta §11) | designed gap | ⏭️ Not tested (documented mock-only gap). |
| Backend contract deltas §1–7 (Overdue enum, list `number`, `originalTransactionNumber`, movement/wallet-party ids, opening-stock note, template `discountType`/`lastUsedAt`) | backend-deltas.md | ⏭️ Contract-level, not individually re-verified this run — remain open per the doc. «Использован» still «—» on templates (delta §6) confirmed. |

---

## 4. Test data created (all prefixed `QA0706`)

| Module | Record | Id / № |
|--------|--------|--------|
| Categories | «QA0706 Категория» | — |
| Products | «QA0706 Тест Товар» SKU-39640, Оба, 20000/12000 | id 582 |
| Warehouses | «QA0706 Склад» (+opening stock 100 @12000) | id 17 |
| Stock Adjustments | +20 Оприходование (Находка) | — |
| Partners | «QA0706 Партнёр» / «QA0706 Компания», Оба | id 152 |
| Wallets | «QA0706 Касса», Наличные, opening 500000 | id 5 |
| Templates | «QA0706 Шаблон» (Продажа, 1 line) | — |
| New Supply | supply 30 @14000, paid full | id 497 / №S-497 |
| New Sale | sale 30 @20000, paid 400000 | id 498 / №S-498 (+payment P-2) |
| Refund | partial refund 10 @20000 | id 499 / #SR-499 |
| Orders | order → delivered → promoted | id 296 / №C169A68352 → Sale №500 |
| Transfers | 5u wh17 → wh16 | — |
| Payments | «Оплата» settlement 20000 → №498 | id 1432 / P-3 |
| Employees | «QA0706 Сотрудник», 3000000, hire 05.07.2026 (+payroll 3000000, 2026-07) | id 31 |
| Employees | «QA0706 Сотрудник 2 (дата-фикс)», 1000000, hire 06.07.2026 — created to verify F-QA1 fix | — |

Ending stock: product 582 = **124 @ wh17** (150 supply − 30 sale + 10 refund − 1 order-deliver − 5 transfer) + **5 @ wh16**. No owner data was archived/deleted; no destructive actions taken.

---

## 5. Fixes applied this run

| Finding | Change | Commit | Pushed | Deploy status |
|---------|--------|--------|--------|---------------|
| F-QA1 (hire-date validation, S2, blocking) | Parse `YYYY-MM-DD` as a local date in [`EmployeeSchema.ts`](../../src/schemas/EmployeeSchema.ts) | `9cdc8af` | ✅ `origin/redesign/bug-fixes` | ✅ **Verified live** — re-created an employee with today's date → 201 after Netlify redeploy. |

`npm run validate` passed before commit (0 errors; the 6 lint warnings are all pre-existing, none in the changed file). Only the one intended file was committed. No other fixes were applied — F-QA2/3/4/5/6 and OBS-1 are logged for a follow-up session (F-QA2 needs a store-lifecycle refactor; F-QA4/OBS-1 are backend-side; the rest are cosmetic/telemetry).

---

## 6. Observability digest

### Sentry — `silk-route-connect` / `ombor-web` (EU) — **LIVE**
- Error envelopes are being sent and accepted (200) from the deployed build.
- **1 unresolved issue in the last 24h:** [`OMBOR-WEB-7`](https://silk-route-connect.sentry.io/issues/OMBOR-WEB-7) — `AxiosError: Request failed with status code 500`, culprit `/login`, 2 events / 1 user, last seen ~05:15. This is the pre-auth `refresh-token` 500 on boot (see **OBS-1**).
- **No new Sentry errors were triggered by any of the create / POS / reconciliation flows** exercised this run → strong signal of runtime stability.

### PostHog — `Ombor` / project `484526` (US) — **LIVE**
P0 product events fired during the run window (05:15–06:05 UTC), matching the actions taken:

| Event | Count | Notes |
|-------|-------|-------|
| `user_logged_in` (+`$identify`) | 1 | login |
| `stock_adjustment_created` | 1 | +20 adjustment |
| `supply_created` | 1 | New Supply |
| `sale_created` | 1 | New Sale |
| `transaction_refunded` | 1 | refund |
| `order_created` | 1 | New Order |
| `order_status_changed` | 3 | process / ship / deliver |
| `stock_transfer_created` | 1 | warehouse transfer |
| `payment_recorded` | 2 | settlement payment(s) |

Plus infra events (`$autocapture`, `$pageview`, `$web_vitals`, `$pageleave`, `$dead_click`).

**Gaps / not-fired (expected):**
- **`form_validation_failed` never fired** despite the employee hire-date validation blocking the save twice → the `EmployeeFormModal` validation-failure path isn't instrumented (**F-QA5**).
- `wallet_transfer_created`, `user_signed_up`, `user_logged_out`, `password_reset_completed` — not exercised this run (I did a *warehouse* transfer, not inter-wallet; no register/logout/reset).

---

## 7. Release recommendation

**Go, with one caveat already resolved.** The only release-blocking defect found (F-QA1, employee create broken for the entire UTC+ target market) is fixed, deployed, and verified this run. F-QA2 (payroll-create spinner) is the next-most-important item — a UX break with a reload workaround, worth fixing before GA but not release-blocking. Everything else is S4 cosmetic/telemetry or backend-side. Core money math, stock accounting, and cross-module read models are correct end-to-end.
