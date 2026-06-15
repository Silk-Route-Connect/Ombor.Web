# CLAUDE.md — Ombor frontend

React 19 + TypeScript + MobX + MUI v7 client for **Ombor** — a warehouse and business-management system for small businesses in Uzbekistan replacing paper/Excel workflows. Core differentiator: a dispute-grade audit trail for debt, payments, and settlement. UI language is Russian (Uzbek backfill later); all amounts are UZS; all code, comments, and commits are English.

This file is the operating contract for every session in this repo. It points to canon documents instead of restating them — when this file and a canon doc conflict, canon wins; raise the conflict.

---

## Source-of-truth documents

Canon lives in `docs/canon/` (synced manually by Miraziz — treat as read-only; propose edits, never apply them).

| Document                         | When to read                                                                               | What to read                                                                                                             |
| -------------------------------- | ------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------ |
| `docs/canon/business-rules.md`   | Any task touching domain behavior — transactions, payments, debts, stock, wallets, archive | The rule sections relevant to the task, plus **Domain model** and **Enum reference** for any entity you render or mutate |
| `docs/canon/product-brief.md`    | When a design/UX decision needs reasoning, or scope is ambiguous                           | **"Core design decisions and reasoning"** section only                                                                   |
| `docs/canon/mvp-plan.md`         | Start of any feature task                                                                  | Only the slice covering the current task                                                                                 |
| `docs/canon/tech-change-list.md` | When unsure whether a backend capability exists                                            | Relevant entries; assume anything "not started" must be mocked                                                           |
| `docs/openapi.json`              | Before integrating or mocking any endpoint                                                 | The exact current backend contract — routes, DTOs, params, error shapes. The authority on what exists today              |
| `docs/conventions.md`            | Writing or modifying any code                                                              | Whole doc once per session, then as reference                                                                            |
| `docs/mocking.md`                | Any task hitting an endpoint the backend lacks                                             | Whole doc                                                                                                                |
| `docs/design-handoff.md`         | Implementing any screen from a Claude Design prototype                                     | Whole doc                                                                                                                |

Task-type quick map: **payments / debts / settlement UI** → business-rules §B + Domain model (Payment, Advance, worked examples). **Inventory / adjustments / transfers** → §D, §E. **Refunds** → §A. **Archive behavior in lists/pickers** → §G. **Any new page** → design-handoff.md + the mvp-plan slice.

---

## Commands

| Command                     | Purpose                                                                                                          |
| --------------------------- | ---------------------------------------------------------------------------------------------------------------- |
| `npm run dev`               | Dev server (Vite). **Never run it unprompted — assume it is already running.** If you need it and it isn't, ask. |
| `npm run build`             | Production build                                                                                                 |
| `npm run type-check`        | `tsc --noEmit`                                                                                                   |
| `npm run lint` / `lint:fix` | ESLint                                                                                                           |
| `npm run format`            | Prettier                                                                                                         |
| `npm run validate`          | type-check + lint. **Run before declaring any task complete.**                                                   |

No test suite in MVP — do not write tests unless explicitly asked.

---

## Repo map

```
src/
  components/<module>/   Per-module UI (Table, Form, Header, Autocomplete, …)
  components/shared/     Cross-module primitives (DataTable, FormDialog, NumericField, …)
  pages/                 One file per routed page
  stores/                MobX stores; RootStore composes, StoreContext provides
  services/api/          One Api class per module over BaseApi/http (axios)
  models/                TS types mirroring API contracts
  schemas/               Zod schemas for forms (via @hookform/resolvers)
  hooks/<module>/        Form hooks and module logic
  i18n/<locale>/         One JSON namespace per module
  routing/               Paths, guards (RequireAuth / GuestOnly)
  layouts/               AppLayout, Sidebar, Topbar
  theme.ts               Single MUI theme — the only styling source of truth
  utils/, helpers/, constants/
```

New code follows the existing module anatomy (see `docs/conventions.md`); do not invent parallel structures.

---

## Hard rules

1. **Immutable events get no edit/delete affordances.** Transactions, payments, payroll, stock adjustments, transfers: no edit buttons, no delete actions, no mutating forms. Corrections are separate counter-event flows (business-rules §A).
2. **No hardcoded UI strings.** Every string goes through an i18n key in the module's namespace. Fill `ru` values when adding keys; Uzbek locales are a later backfill pass — never block on them, never hardcode to avoid them.
3. **Side panes are deprecated.** The redesign uses full-page detail layouts. Never extend a `SidePane` component; when a module is being rewritten, its side pane is replaced and deleted.
4. **Currency machinery is frozen.** `CurrencyApi.ts` / `CurrencyStore.ts` stay in the tree but must not be used, extended, or fixed. The app is UZS-only (business-rules §H). All amounts render through `formatCurrency`.
5. **Never silently disable buttons.** Actions stay enabled; validation runs on submit and reports inline.
6. **Missing or stale backend = MSW mock of the target v1 contract, nothing else.** No hardcoded data in stores or components, no `setTimeout` fakes. Follow `docs/mocking.md`; every handler's shapes are written as the real future API contract.
7. **No scope additions.** Do not add features, fields, or flows beyond the current task and `mvp-plan.md`. Surface the idea; don't build it (business-rules rule 36).
8. **Computed balances are backend-computed.** Partner balance, wallet balance, "our money" are read from the API (or its mock) — never recomputed client-side from event lists.

## Git rules

- **Work on the branch the user currently has checked out.** Do not create branches in the repository. Local scratch branches are allowed only as a temporary working device and are never pushed; delete them before finishing.
- **Never switch, rename, rebase, or reset the user's branch** without explicit instruction.
- Commit under the repository's existing git identity only. **Never modify git config** (user.name / user.email).
- **No attribution trailers, ever** — no `Co-Authored-By`, no `Generated with Claude Code`, in commits or PR descriptions.
- Commit message format: `(<branch-name>) - <clear imperative summary>`, e.g. `(redesign) - migrate build tooling from CRA to Vite`. Small, scoped commits.
- **Decide the target branch before committing a feature.** When a module gets its own branch, agree the name (`redesign/<module>`, using the module/sidebar slug) and its base branch up front — don't author commits on one branch meaning to move them later. The `(<branch-name>)` prefix must match the branch the commits will actually live on.
- No push, no force operations, no history rewriting unless explicitly asked.

## Session discipline

- Orient before coding: read the docs the task-type map prescribes, state your plan in a few lines, then implement. For multi-page tasks, deliver one page/module at a time.
- If a needed fact is missing or a canon doc contradicts the task, **stop and ask** — never proceed silently on an assumption.
- Omitting or altering any designed element is never a unilateral call. If the prototype shows something the backend/canon can't support, or canon and prototype conflict, pause and ask the user mid-session — do not implement the deviation and report it in the summary. End-of-session "gap lists" are for discoveries that didn't change what you built, not for justifying changes you decided alone.
- If you discover a gap between code and canon that's outside the current task, report it at the end of the session; don't fix it silently.
- **Don't work around blockers that depend on the user or their environment — surface them and ask.** When something is failing because of the local setup (backend down, a port in use, CORS, credentials, env), stop and ask rather than building a workaround or weakening the app to get past it (e.g. never add an auth bypass to dodge a login that fails). State what you observed and what you think the cause is; the user can usually fix it fast.
- **Preview verification needs real auth on the right origin.** The dev preview must run on **`http://localhost:3000`** so the backend's CORS allowlist accepts it and login works; on any other port login fails at the browser (`net::ERR_FAILED`, not a 401). If `:3000` is taken by the user's own dev server, ask them to stop it (don't kill it yourself), then start the preview on `:3000` and log in with real credentials. Do not bypass the auth guard to verify.

---

## Repo state (maintained — update when it changes)

- **Build tooling:** Vite + TS 5.x (migrated from CRA, June 2026). Husky/lint-staged removed.
- **Rewrite-as-we-go:** existing modules (Products, Partners, Employees, Payments, Transactions, Categories, Payroll) are legacy side-pane style until rebuilt to the redesign. Structure and approach (stores/api/models/schemas) stay; components and layouts are replaced per module.
- **App shell:** Sidebar/Topbar/AppLayout rebuilt to the redesign (June 2026, locked pattern 10). All v1 routes exist in `routing/paths.ts`; unbuilt pages render the shared `PlaceholderPage`.
- **Warehouses (Склады):** rebuilt to the redesign (list + full-page detail with Остатки/Движения tabs, create/edit modal, opening-stock modal, archive/restore). Mocked at `/api/warehouses` (the backend resource is the stale `/api/inventories`); stock + movements are derived from the Products mock so the two reconcile.
- **Stock Adjustments (Корректировки):** rebuilt to the redesign (immutable list with expand-row detail, warehouse/direction/search filters, create modal with the direction toggle + reason-by-direction + hard-blocked over-stock validation). Mocked at `/api/stock-adjustments` (no backend endpoint exists); references real products/warehouses, does not mutate their stock (known mock limitation).
- **Transfers (Перемещения):** rebuilt to the redesign (immutable list via shared DataTable with warehouse filter, read-only detail modal with the from→to route + lines, multi-line create modal with route picker (from≠to), per-line availability + hard-blocked over-stock). Mocked at `/api/transfers` (backend DTO lacks author/unit and carries an unused status); references real products/warehouses, does not mutate their stock (known mock limitation).
- **Partners (Партнёры):** rebuilt to the redesign (list with summary strip + search/type/archive filters + CSV; full-page routed detail `/partners/:id` with balance card + the dispute-grade running-balance ledger and Журнал/Транзакции/Платежи tabs; create/edit modal with opening balance editable-at-create/locked-on-edit; archive/restore; **delete reference-gated** — deletable only when unreferenced, else a «cannot delete» warning). Mocked at `/api/partners` incl. a new `GET /api/partners/{id}/ledger` (server-computed balance, opening-balance event, archive, and ledger are all "not started" on the backend); the ledger is self-contained (does not cross-reference the Products/Transactions mocks). No system «Розничный покупатель» — partners are uniform (per product owner). Legacy `SelectedPartnerStore` + `PartnerAutocomplete`/`PartnerLink`/`PartnerBalanceTooltip` kept for the still-legacy transaction flow.
- **Sales / Supplies (Продажи / Поставки):** rebuilt to the redesign as one `direction`-parameterized module (`"Sale" | "Supply"`). List = unified immutable feed of the direction's transactions + refunds (search, payment-status segmented, functional date-range dropdown, CSV, empty states; no row menu — row → detail; refund rows negative + «Возврат к #N»). Routed full-page detail (`/sales/:id`, `/supplies/:id`) renders sale/supply or refund detail by type (positions + totals, refund-history, note/attachments, audit, partner-mini, financial card, payments; refund adds reference banner + mandatory reason, no refund action). Refund-create modal from the detail ⋮ (per-line cumulative cap + mandatory reason, business-rules §A). Mocked at `/api/transactions` (GET list, GET /{id}, **POST /{id}/refund**); totals computed from line items so screens reconcile; the legacy `POST /api/transactions` create flow (New Sale/Supply) is left to passthrough and is untouched. Refund doesn't mutate Products stock (known mock limitation). Legacy `TransactionPage` side-pane replaced; create-flow `Form/`/`DebtPayment/` preserved.
- **Templates (Шаблоны):** rebuilt to the redesign (list with search (name/partner) + type segmented filter, expand-row detail showing the line items + footer total, ⋮ row menu with Edit/Delete; create/edit modal with name + sale/supply type toggle that re-prices lines, all-partners autocomplete, product-search cart with qty stepper + editable price, discard-changes confirm; delete confirm). A template is an **editable** basket — not an immutable event — so edit/delete are allowed (mvp-plan §12). Mocked at `/api/templates` (the live `TemplateDto` exists but lacks the `lastUsedAt` «Использован» date and per-item SKU/unit the redesign shows); lines reference real products and partners, totals computed from line items. The prototype's «Использовать» (load into New Sale/Supply) action is **deferred** until those screens are rebuilt — the legacy New Sale/Supply create flow already loads templates via its `TemplateAutocomplete` (kept). The «Сохранить как шаблон» prefill banner (a New-Sale cross-page feature) is likewise deferred. `TemplateStore` keeps its legacy `setSelectedPartner`/`saleTemplates`/`supplyTemplates` surface for that autocomplete, decoupled from the list's search/type.
- **Orders (Заказы):** rebuilt to the redesign — the one **mutable** transaction (a customer's requested goods before stock/money move). List (`/orders`): status tabs with live counts + search + functional date-range + CSV; routed full-page detail (`/orders/:id`) with status stepper, terminal banner (cancelled/rejected/returned), positions, delivery info, status-history timeline, partner-mini (balance as color + natural-language label), financial card, promote-to-sale hint, and a ⋮ menu whose actions depend on status. State machine wired to `process`/`ship`/`deliver`/`cancel`/`reject`/`return`. Edit modal (client, source, product cart with qty/price/discount, address, requested delivery date, note; editable pre-delivery). Each order carries a **requested delivery date + time** (`deliveryDate`/`deliveryTime`, added to the design after the first pass): a **list column** with overdue (red, past + pre-delivery) / upcoming / done states, a detail delivery-card row (with «Просрочена» badge), and **required** date + optional time in the edit modal. **Warehouse is chosen at the delivery-confirmation dialog** (prototype flow) with a per-line stock-check that hard-blocks shortfalls (rule 20) — this overrode the earlier "warehouse at creation" wording in business-rules Domain model + mvp-plan §11, both updated. Mocked at `/api/orders` incl. the transition endpoints (the live `OrderDto` lacks status history, warehouse, the promoted-sale link, and per-line SKU/unit); lines reference real products, customers reference real partners. Promotion is **self-contained**: delivering marks the order Delivered with a sale reference + history but does NOT write the Sale into the Transactions mock or mutate stock (known limitation, like refunds/transfers) — the «Продажа #N» link shows an info toast. The «Новый заказ» create flow is **deferred** to the separate full-page New Order screen (button routes to `/new/orders` → `PlaceholderPage`).
- **Wallets (Касса):** rebuilt to the redesign — answers "how much cash do I have, and where?". List (`/wallets`): summary strip (Общий баланс / Наши средства / Авансы партнёров, spanning **all** wallets incl. archived per rule 31) + search + archive toggle + CSV; table (касса with type-tinted icon, type badge, balance, partner advances, our money) with a ⋮ row menu (edit / archive·restore — never delete). Routed full-page detail (`/wallets/:id`): breadcrumb/back header with type + archive badges and «Начальный остаток · создана» meta, ⋮ menu (edit / archive) or primary «Восстановить», archive banner, three stat cards (Баланс / Наши средства / Авансы), and two tabs — **Операции** (immutable money-movement ledger: date · payment# / Перевод chip · type · direction pill (Приход green / Расход red, **no +/− signs**, locked pattern 4) · party · amount · running balance; search + direction segmented filter; payment rows toast, transfer rows open the transfer detail) and **Переводы** (inter-wallet transfers with «Новый перевод»). Modals: create/edit (name + type segmented + opening balance on create; **type + opening locked on edit**, rule 16), inter-wallet transfer (icon wallet picker, from≠to, live route preview, available-balance hint + «Перевести всё», hard-blocked over-balance, immutable warning), read-only transfer detail. All balances / advances / our-money are **server-computed and served** (rule 12) — never recomputed client-side. Mocked at `/api/wallets` incl. `/operations`, `/transfers`, archive/restore, and `POST /api/wallets/transfers` (the **whole resource is "not started" on the backend**). **Self-contained** (like the Partners ledger): the operations ledger + transfers are seeded here and do **not** cross-reference the legacy Payments mock — payment numbers («P-520») are illustrative and a payment-row click only toasts; a created transfer adjusts both wallets' served balances + appends an operation to each side. Operations' `balanceAfter` running balances are illustrative (not reconciled to the opening balance — a known mock limitation). The prototype's per-ledger **period date filter and static pager are omitted** (locked pattern 12).
- **Not yet built:** New Order, Debts, Settings, Reports.
- **i18n state:** i18next + react-i18next (migrated June 2026, init in `src/i18n/config.ts` — flat keys with literal dots, single merged namespace, ru fallback, locale persisted in localStorage `ombor.locale`). `ru` partially complete; `uz` partial and legacy-named (`supplier`, `supply` namespaces to be consolidated as modules are rewritten); uz-Cyrl registered but empty; uz-Latn / uz-Cyrl backfill pending.
- **Backend:** does not yet satisfy the redesigned UI — check `tech-change-list.md`, mock per `docs/mocking.md`.
