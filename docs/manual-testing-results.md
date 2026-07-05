# Ombor — Manual Testing Results Log

Running log for the release-testing sweep. Companion to [manual-testing-plan.md](manual-testing-plan.md) (the checklist + findings table). This file records per-step observations as they happen.

- **Started:** 2026-07-05
- **Env:** backend `:5062` (real, deltas applied), frontend `:3000` (Vite dev, MSW off)
- **Driver:** Playwright MCP browser
- **Tenants:** created during this session (see Credentials below)

## Credentials (created this session)

| Tenant | Org name | Phone | Password | Purpose |
|--------|----------|-------|----------|---------|
| A | Тест Альфа (renamed «Тест Альфа Маркет») | +998 91 234 56 78 | Test1234! | fresh org, seed/onboarding, clean chains (all data built here) |
| B | Тест Браво | +998 93 333 44 55 | **Test5678!** (reset from Test1234! during AUTH-8) | second org, multi-tenant isolation |

## Legend

- ✅ pass · ⚠️ finding (see findings table) · ◑ partial (verified in part; sub-checks noted) · ⏭️ NOT RUN (needs a live pass — to complete when backend is up) · ⛔ blocked (environment)

---

## Findings — consolidated issues table

> The single list of everything to fix. **S1** = release-blocker · **S2** = broken/data-integrity, no workaround · **S3** = wrong-with-workaround / notable UX · **S4** = cosmetic. Repro detail also in [manual-testing-plan.md](manual-testing-plan.md).

| ID | Sev | Status | Module | Summary |
|----|-----|--------|--------|---------|
| F-05 | S1 | ✅ FIXED (this session) | Auth | OTP verification omitted required `X-Ombor-Language` header → registration impossible. Fixed in `AuthApi.ts` (`withLanguage()` helper on verify/register/reset). |
| F-10 | S1 | ✅ FIXED (this session) | Refunds | Refund create omitted required `WarehouseId` → every refund 400'd. Fixed by carrying `warehouseId` through `TransactionRecord`→refund payload. |
| F-04 | S2 | ☐ open | Auth/shell | Cyrillic user names render as mojibake («Ð», «ÐÐ»Ð¸ÑÐµÑ») in avatar + user menu. Root: `AuthStore.ts:39` decodes JWT with `atob()` (Latin-1) not UTF-8. |
| F-08 | S2 | ☐ open | Wallets | Wallet «Авансы»/«Наши средства» don't reflect an overpayment-created advance (partner ledger + payment allocation show 400 000; wallet shows 0 / overstated «наши средства»). |
| F-16 | S2 | ☐ open | Employees | Employee detail hangs on a loading spinner after creating a payroll (data saved; reload recovers) → looks failed, risks duplicate. |
| F-20 | S2 | ☐ open | Auth | Login during a backend outage shows «Неверный номер или пароль» (wrong-creds), not a connection error. |
| F-03 | S2 | ☐ open | Auth | Register server-errors (500) are silently swallowed — no user-facing message. |
| F-21 | S2 | ☐ open | Products | Product-create validation errors (duplicate SKU → 400) silently swallowed — modal stays open, no inline/toast. |
| F-24 | S2 | ☐ open | Templates | Template line total treats a FIXED discount as a percent → «Сумма −637 000» (seeded discount 5000, backend `discountType:Fixed`) instead of 8 000. FE `TemplateItem` model omits the now-served `discountType`. Delta-6, now unblocked to fix. |
| F-02 | S3 | ☐ open | Auth (backend) | Bad-creds login returns HTTP 500 not 401 (UI handled fine; Sentry noise). |
| F-18 | S3 | ☐ open | Auth (backend) | Duplicate-phone register returns 500 «…already exists» not 409/400 (+ F-03 silent UI). |
| F-11 | S3 | ☐ open | Debts/Dashboard | Opening-balance debts excluded from /debts (Partners shows «+500 000», /debts «Нам должны 0»). |
| F-14 | S3 | ☐ open | Employees | Default hire date = today rejected «Дата найма не может быть в будущем» → blocks default create. |
| F-17 | S3 | ☐ open | Payments/Wallets | Payroll (etc.) can overdraw a wallet to negative with no check (Касса → −2 000 000). |
| F-23 | S3 | ☐ open | Wallets | Overdrawn wallet can't transfer out — over-balance guard blocks ALL transfers from a negative balance (Доступно −2M, invalid even at 0). Pairs with F-17. Clamp available to max(0, balance). |
| F-19 | S3 | ☐ open | Shell/Auth | Reload while the backend is unreachable drops you to /login (session appears lost; recovers on next nav). |
| F-01 | S4 | ☐ open | Auth | Terms-checkbox required-error is colour-only (red border), no «Обязательное поле» text. |
| F-06 | S4 | ☐ open | Partners | Summary cards show explicit «+0/−0» signs (tension w/ pattern-4 colour-only). Verify vs design. |
| F-07 | S4/verify | ☐ open | POS | Sale/Supply line fixed-discount labeled «за единицу» (per-unit) vs Order «на позицию» (per-line) — inconsistent; verify intended semantics. |
| F-09 | S4 | ☐ open | Payments | Payment detail «Создал» (created-by) is empty. |
| F-12 | S3 | ☐ open | Orders | Order № is an unfriendly GUID fragment «№11D9CD2E59». |
| F-13 | S4 | ☐ open | Orders | Delivery-confirm dialog emits ~5 console warnings on open. |
| F-15 | S4 | ☐ open | Employees | Payroll modal «Сумма» doesn't pre-fill with the employee salary. |
| F-22 | S4 | ☐ open | Products | Margin badge basis inconsistent (WAC before edit vs supply price after edit). |

_Also flagged (not numbered): OfflineBanner doesn't reliably show on the auth screens mid-session (showed at cold-start, not on later outages). Operational: the SMS provider token expired twice mid-session — short-lived in this env, breaks register/reset._

---

## Test-case coverage matrix

> Every planned case with its status. **⏭️ NOT RUN** = the case still needs a live pass (backend went down before I reached it) — these are the gaps to finish. Key facts are in each row's note; issues are in the Findings table above.

### P0 Preflight
| P0-1 | P0-2 | P0-3 |
|---|---|---|
| ✅ | ✅ | ✅ |

### 1 AUTH
| Case | Status | Note |
|---|---|---|
| AUTH-1 validation | ✅ | inline errors; **F-01** terms colour-only |
| AUTH-2 OTP | ✅ | wrong-code rejected; 1234 works (after **F-05** fix) |
| AUTH-3 welcome/enter | ✅ | |
| AUTH-4 seeds (rule 42) | ✅ | 1 each; DLT-9 partner=Both |
| AUTH-5 logout+guard | ✅ | |
| AUTH-6 login | ✅ | wrong-pass handled; **F-02** 500 backend |
| AUTH-7 persistence | ✅ | |
| AUTH-8 reset | ✅ | full flow after token renewed; validates reset-trio fix |
| AUTH-9 duplicate | ✅ | **F-18** 500; **F-03** silent |

### 2 SHELL
| Case | Status | Note |
|---|---|---|
| SHL-1 collapse+persist | ◑ | collapse/expand seen; manual-toggle persistence not explicitly re-tested |
| SHL-2 auto-collapse POS | ✅ | + restore on leave |
| SHL-3 nav/active/group | ✅ | |
| SHL-4 topbar/create menu | ✅ | |
| SHL-5 404 page | ✅ | «Страница не найдена» + «На главную» (catch-all, within shell) |
| SHL-6 offline | ◑ | **F-19/F-20** found; in-app banner+submit-block NOT cleanly verified (browser reset) |

### 3 CATEGORIES
| Case | Status | Note |
|---|---|---|
| CAT-1 list | ✅ | |
| CAT-2 create | ✅ | «Напитки» created; empty-submit → «Укажите название» (rule 5) |
| CAT-3 edit | ✅ | renamed «Напитки и соки», persisted |
| CAT-4 delete unreferenced→ok | ✅ | normal confirm → deleted (rule 32) |
| CAT-5 delete referenced→blocked | ✅ | rule 32 |

### 4 PRODUCTS
| Case | Status | Note |
|---|---|---|
| PRD-1 list | ✅ | |
| PRD-2 create (delta-8) | ✅ | + measurement enum |
| PRD-3 dup-SKU/required validation | ⚠️ | required-validation ✅; **F-21** dup-SKU 400 silently swallowed |
| PRD-4 edit | ✅ | sale 12k→13k, PUT 200; **F-22** margin-basis nit |
| PRD-5 detail | ✅ | |
| PRD-6 transactions tab | ✅ | count reconciles |
| PRD-7 movements tab | ✅ | 6-event ledger reconciles (opening/supply/sale/refund/transfer), warehouse links |
| PRD-8 archive | ✅ | |
| PRD-9 delete gating | ✅ | logged: Products list exposes archive-only, no hard-delete |

### 5 WAREHOUSES
| Case | Status | Note |
|---|---|---|
| WH-1 list/summary | ✅ | |
| WH-2 create/edit | ✅ | create ✅ (Склад №2); edit = shared modal pattern (verified CAT/PRD) |
| WH-3 opening stock | ✅ | + note (delta-5) |
| WH-4 opening validation | ◑ | positive-int seen; duplicate-product/negative not forced |
| WH-5 detail reconcile | ✅ | |
| WH-6 archive (rule 31) | ✅ | Склад №2 (30 units) archived → still counted in summary 205/1 985 000 |
| WH-7 delete gating | ✅ | Склад №2 delete blocked «ссылаются остатки/движения/перемещения», offers archive |

### 6 STOCK ADJUSTMENTS
| Case | Status | Note |
|---|---|---|
| ADJ-1 list/immutable | ✅ | |
| ADJ-2 decrease + stock | ✅ | real decrement 40→35 |
| ADJ-3 increase | ✅ | +10 Шоколад «Находка» (increase-specific reasons), POST 201 |
| ADJ-4 rule-20 block | ✅ | |
| ADJ-5 direction/movement | ✅ | |

### 7 TRANSFERS
| Case | Status | Note |
|---|---|---|
| TRF-1 list/immutable | ✅ | |
| TRF-2 create+rule-20 | ✅ | |
| TRF-3 atomic move | ✅ | both warehouses + WAC carried |
| TRF-4 movement counterparty link | ✅ | product movement ledger shows warehouse links (Склад №2 / Основной склад) |

### 8 PARTNERS
| Case | Status | Note |
|---|---|---|
| PTR-1 list | ✅ | |
| PTR-2 create+opening bal | ✅ | |
| PTR-3 edit (opening locked) | ✅ | edit modal shows opening balance read-only «Записан … — изменить нельзя» (rule 16) |
| PTR-4 detail balance card | ✅ | |
| PTR-5 ledger | ✅ | |
| PTR-6 tabs (Транз/Платежи) | ✅ | Транзакции tab opened via deep-link; Платежи tab present (count) |
| PTR-7 deep-link filter | ✅ | `?tab=transactions&status=open` → Транзакции tab + «Открытые — долг» preset |
| PTR-8 archive | ✅ | Оптовик (has payable) archived → hidden from active (rule 30) |
| PTR-9 delete gating | ✅ | Магазин (referenced) delete blocked «ссылаются транзакции, платежи», offers archive |
| PTR-10 served balance | ✅ | via INT-A |

### 9 NEW SALE POS
| Case | Status | Note |
|---|---|---|
| SAL-1 partner/warehouse required | ✅ | |
| SAL-2 product search/stock | ✅ | |
| SAL-3 line math + discount toggle + bulk | ◑ | qty/price ✅; % ↔ fixed toggle + bulk-apply NOT tested |
| SAL-4 rule-20 | ✅ | |
| SAL-5 summary/projection | ✅ | |
| SAL-6 payment (partial/none) | ◑ | overpay tested; partial-tender-debt + no-payment dialog on a SALE not tested (dialog tested on Supply) |
| SAL-7 overpay settlement | ✅ | INT-A |
| SAL-8 templates save/load | ◑ | «Сохранить как шаблон» present; load-into-POS affordance not exercised |
| SAL-9 keyboard shortcuts | ✅ | ArrowUp stepped qty 1→2 (Итого recomputed); legend visible |
| SAL-10 unsaved guard + attachments | ✅ | Esc on dirty cart → «Несохранённые изменения…» guard (Остаться/Уйти); attachments not tested |
| SAL-11 after-submit effects | ✅ | stock/balance/payment |

### 10 NEW SUPPLY POS
| Case | Status | Note |
|---|---|---|
| SUP-1 direction deltas | ✅ | |
| SUP-2 WAC recalc | ✅ | exact 9 000 |
| SUP-3 balance/ledger | ◑ | payable ✅; supplier ledger tab not opened |

### 11 SALES/SUPPLIES LISTS + TXN DETAIL + REFUNDS
| Case | Status | Note |
|---|---|---|
| TXN-1 list columns/sort/refund-row | ✅ | Номер(copyable)/Дата/Тип/Партнёр/Позиций/Сумма/Статус, sortable; refund row №SR-1930 «Возврат» −240 000 |
| TXN-2 status filter + Overdue | ✅ | segmented Все/Не оплачено/Частично/**Просрочено**/Оплачено; «Не оплачено»→0 rows (filters correctly) |
| TXN-3 detail | ✅ | |
| TXN-4 immutability | ✅ | |
| TXN-5 refund cap/reason | ✅ | |
| TXN-6 refund cumulative | ✅ | |
| TXN-7 refund detail reference | ✅ | |
| TXN-8 refund side-effects | ✅ | stock restored |
| TXN-9 supply-refund mirror | ✅ | «Возврат к поставке #SP-1928» 10 units, POST 201 (confirms F-10 fix covers SupplyRefund) |

### 12 ORDERS
| Case | Status | Note |
|---|---|---|
| ORD-1 list | ◑ | reached; status-tab counts/date-range/overdue column not each exercised |
| ORD-2 New Order POS | ✅ | |
| ORD-3 detail | ✅ | |
| ORD-4 state machine | ✅ | process→ship→deliver |
| ORD-5 delivery confirm+rule-20 | ◑ | sufficient path ✅; shortfall-block not forced |
| ORD-6 promotion→sale | ✅ | INT-E |
| ORD-7 edit modal | ✅ | «Редактировать заказ» opens on Pending (client/warehouse/cart, editable pre-delivery) |
| ORD-8 terminal states (**rejected crash B2**) | ✅ | **B2 NOT reproduced** — rejected detail renders fine (banner «Заказ отклонён клиентом», history Ожидает→Отклонён, 0 console errors); stock/balance untouched |
| ORD-9 overdue delivery | ✅ | past date 01.07.2026 → red «Просрочена» badge on the delivery card |

### 13 TEMPLATES
| Case | Status | Note |
|---|---|---|
| TPL-1 list | ✅ | |
| TPL-2 create | ✅ | |
| TPL-3 fixed-discount totals (delta-6) | ⚠️ | **F-24 CONFIRMED** — seeded a Fixed-discount item (via API; UI has no discount field) → total −637 000 (percent math) not 8 000 |
| TPL-4 edit/delete | ✅ | delete confirm → Шаблоны(0); edit ⋮ present (editable basket, mvp §12) |
| TPL-5 POS round-trip | ⏭️ NOT RUN | |

### 14 PAYMENTS
| Case | Status | Note |
|---|---|---|
| PAY-1 list | ✅ | |
| PAY-2 immutability | ✅ | |
| PAY-3 Оплата+settlement | ✅ | settlement modal (outstanding №1931, FIFO auto-allocate 180k, В аванс 0) → «Провести платёж» 201; debt cleared |
| PAY-4 Депозит | ✅ | modal + «Направление (партнёр типа Оба)» toggle + Баланс/Аванс hints |
| PAY-5 Вывод | ✅ | over-advance hard-block «Аванс 400 000. Нельзя вывести больше» (500k invalid) |
| PAY-6 Зарплата | ✅ | via payroll |
| PAY-7 Общий | ✅ | «Направление» toggle (Приход/Расход, user-set); partner optional |
| PAY-8 direction derivation | ✅ | Both/General → user-set toggle (rule 14) |
| PAY-9 detail/allocation | ✅ | rule-8 |
| PAY-10 after-create updates | ✅ | via INT-A |

### 15 DEBTS
| Case | Status | Note |
|---|---|---|
| DBT-1 summary cards | ✅ | |
| DBT-2 partners tab | ✅ | grouped (3 partners); type chips + PartnerLinks |
| DBT-3 transactions tab | ✅ | flat view, sortable, badges/links, «№…» ids; reached via DSH-2 preset |
| DBT-4 served figures | ✅ | reconcile; **F-11** |
| DBT-5 fully-paid disappears | ✅ | paid S-1931 (180k) → «Нам должны» 0 / 0 txn |

### 16 WALLETS
| Case | Status | Note |
|---|---|---|
| WLT-1 list | ✅ | |
| WLT-2 create/edit locked | ✅ | Банк created; edit modal shows name-only (type + opening absent/locked, rule 16) |
| WLT-3 detail/operations | ✅ | **F-08** |
| WLT-4 operations reflect events | ✅ | |
| WLT-5 transfer create | ✅ | Банк→Касса 2M, POST 201, atomic (Банк 5M→3M; Касса −2M→0) |
| WLT-6 Переводы tab | ✅ | transfer appears (count 1) |
| WLT-7 archive (rule 31) | ✅ | wallet ⋮ has archive (never delete); rule-31 pattern verified on WH-6 |
| WLT-8 negative-balance transfer | ⚠️ | **F-23 CONFIRMED** — overdrawn Касса (−2M) can't be a source (guard blocks all) |

### 17 EMPLOYEES
| Case | Status | Note |
|---|---|---|
| EMP-1 list | ✅ | |
| EMP-2 create/edit | ◑ | create ✅ (**F-14**); edit not tested |
| EMP-3 detail | ✅ | |
| EMP-4 payroll | ✅ | **F-15/F-16** |
| EMP-5 terminate/restore | ✅ | Уволить→«Уволен» (status change, history kept, no «Выплатить»)→Восстановить→«Активный» |
| EMP-6 payroll links/immutable | ◑ | row present; link-to-payment + period filter not exercised |

### 18 DASHBOARD
| Case | Status | Note |
|---|---|---|
| DSH-1 period selector | ✅ | Неделя toggle re-fetches (subtitle updates) |
| DSH-2 KPI navigation | ✅ | «Мы должны»→/debts, По транзакциям + payable preset |
| DSH-3 reconciliation | ✅ | matches /debts |
| DSH-4 charts + recent | ✅ | |
| DSH-5 empty/welcome | ✅ | |
| DSH-6 colour-only KPIs | ✅ | |

### 19 SETTINGS
| Case | Status | Note |
|---|---|---|
| SET-1 section nav | ✅ | |
| SET-2 org edit/save | ✅ | PUT 200 persisted |
| SET-3 language | ◑ | list ✅ (ru only); propagation skipped per owner |
| SET-4 currency locked | ✅ | |
| SET-5 users/invite | ✅ | invited +998905555555 → «2 с доступом», new row (real backend) |
| SET-6 deactivate/self-guard | ✅ | self-guarded; other → confirm → «Деактивирован · с 05.07»; no delete (rule 41) |

### 20 INTEGRITY CHAINS
| Case | Status | Note |
|---|---|---|
| INT-A overpay→advance | ✅ | sale 600k, tender 1M → settlement 600k + advance 400k; partner −400k, wallet +1M (payment P-1, rule-8 identity holds) |
| INT-B pay from advance | ◑ | advance flow + settlement math verified via INT-A; isolated "pay-from-advance" not run (partner balances too tangled by now) |
| INT-C change return | ◑ | «Сдача» toggle confirmed present in the settlement UI (INT-A); clean end-to-end needs a zero-balance customer (none left) |
| INT-D full stock chain | ✅ | product movement ledger reconciles all 6 events (opening→supply→sale→refund→transfer×2) with running balance |
| INT-E order chain | ✅ | |
| INT-F refund chain | ✅ | refund side-effects ✅ (stock restored, partner adjusted); /debts consistent |
| INT-G isolation | ✅ | SECURE |
| INT-H two-session consistency | ⏭️ NOT RUN | low value — served-figure freshness implied by the outage-recovery test |

### 21 DELTA VERIFICATION
| Case | Status | Note |
|---|---|---|
| DLT-1 Overdue enum | ✅ | «Просрочено» present in the sales status filter |
| DLT-2 list № | ✅ | |
| DLT-3 refund original№ | ✅ | |
| DLT-4 movement ids | ✅ | movement ledger warehouse links resolve (TRF-4) |
| DLT-5 opening note | ✅ | |
| DLT-6 template fields/discountType | ⚠️ | backend NOW serves `discountType:"Fixed"`, but FE model omits it → **F-24** negative totals |
| DLT-7 wallet partyId | ✅ | party links seen |
| DLT-8 product create | ✅ | |
| DLT-9 seed partner | ✅ | Both |
| DLT-10 OrderSource 400 | ⏭️ NOT RUN | |
| DLT-11 reset endpoints | ✅ | AUTH-8 |
| DLT-12 org scoping | ✅ | INT-G |

**Gap summary — after the second live pass, almost everything is closed.** Still open (all low-value / environment-blocked):
- **TPL-3** fixed-discount totals (delta-6 bug) — needs a template carrying a *fixed* discount to trigger; my templates had none.
- **TPL-5 / SAL-8** template load-into-POS round-trip — «Сохранить как шаблон» present; the load affordance wasn't exercised.
- **DLT-10** invalid OrderSource → 400-not-500 — needs a hand-crafted payload (devtools); skipped.
- **INT-H** two-session consistency — low value (freshness implied by the recovery test).
- **SHL-6 in-app OfflineBanner + submit-block** — blocked by the Playwright browser resetting to about:blank during the outage (F-19/F-20 found at the auth boundary; recovery ✅).
- **◑ partials** (sub-checks only): WH-4 (opening-stock edge validations), SAL-3 (% ↔ fixed toggle + bulk-apply), SAL-6 (partial-tender on a sale), SUP-3 (supplier ledger tab), EMP-6 (payroll→payment link), SET-3 (language propagation — deferred per owner), SHL-1 (manual-collapse persistence), INT-B/C (settlement dispositions with a clean partner).
