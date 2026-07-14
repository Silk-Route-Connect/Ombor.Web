# CLAUDE.md — Ombor frontend

React 19 + TypeScript + MobX + MUI v7 client for **Ombor** — a warehouse and business-management system for small businesses in Uzbekistan replacing paper/Excel workflows. Core differentiator: a dispute-grade audit trail for debt, payments, and settlement. UI language is Russian (Uzbek backfill later); all amounts are UZS; all code, comments, and commits are English.

This file is the operating contract for every session in this repo. It points to canon documents instead of restating them — when this file and a canon doc conflict, canon wins; raise the conflict.

---

## Source-of-truth documents

Shared canon lives in the **sibling checkout `../Ombor.Docs`** (distribution model DR-17) — read-only from here: propose canon edits, never apply them. Access is granted by `.claude/settings.json` → `permissions.additionalDirectories`.

| Document                          | When to read                                                                                         | What to read                                                                                                                  |
| --------------------------------- | ---------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------- |
| `../Ombor.Docs/business-rules.md` | Any task touching domain behavior — transactions, payments, debts, stock, wallets, archive           | The rule sections relevant to the task, plus **Domain model** and **Enum reference** for any entity you render or mutate      |
| `../Ombor.Docs/ui-patterns.md`    | Any screen work — new pages, tables, detail pages, chips, labels, formats                            | Locked patterns 1–21 + Display conventions + the behavior digest                                                              |
| `../Ombor.Docs/mvp-plan.md`       | Start of any feature task                                                                            | Only the slice covering the current task                                                                                      |
| `../Ombor.Docs/product-brief.md`  | When a design/UX decision needs reasoning, or scope is ambiguous                                     | **"Core design decisions and reasoning"** only                                                                                |
| `../Ombor.Docs/decision-log.md`   | Before questioning or reopening any settled choice                                                   | The row + its revisit trigger                                                                                                 |
| `../Ombor.Docs/operating-code.md` | Once per session, before writing any code                                                            | Cross-repo Code rules: file structure & size, comments, quality bar, reuse, git, session discipline, diagnostics              |
| `docs/openapi.json`               | Before integrating or mocking any endpoint                                                           | The exact live backend contract — routes, DTOs, params, error shapes. The authority on what exists today                      |
| `docs/frontend-gaps.md`           | Start of any fix or v2 planning; checking whether a known gap exists; discovering a new backend gap  | The verified recon (2026-07-09): live FE↔DTO divergences (F1–F17), unbuilt v1 modules, decisions needed, capability snapshot. Also the recording home for **new** FE→backend gaps — append as F-items with contract evidence; backend sessions read them |
| `docs/conventions.md`             | Writing or modifying any code                                                                        | Whole doc once per session, then as reference                                                                                 |
| `docs/shared-components.md`       | **Before creating any component**                                                                    | The index — reuse or extend before authoring new (hard rule 9)                                                                |
| `docs/repo-state.md`              | Before working in a module                                                                           | That module's entry: State / Data / Open items (F-numbers) / Key decisions                                                    |
| `docs/mocking.md`                 | Any task hitting an endpoint the backend lacks                                                       | Whole doc                                                                                                                     |
| `docs/design-handoff.md`          | Implementing any screen from a Claude Design prototype                                               | Whole doc                                                                                                                     |

Task-type quick map: **payments / debts / settlement UI** → business-rules §B + Domain model (Payment, Advance, worked examples). **Inventory / adjustments / transfers** → §D, §E. **Refunds** → §A. **Archive behavior in lists/pickers** → §G. **Any new page or screen change** → ui-patterns.md + the mvp-plan slice (+ design-handoff.md when a prototype exists).

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

No test suite yet — the testing strategy (types, libraries, tooling) is deferred to a dedicated session (decision-log DR-19). Do not write tests unless explicitly asked — but keep code testable in isolation (operating-code.md → Code quality bar).

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
  i18n/<locale>/         One JSON file per module (flat keys, merged at init — see conventions.md → i18n)
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
9. **No parallel components.** Before creating any component, check `docs/shared-components.md`. If a shared component (or a config of one) fits, use it; if a genuinely new shared component is needed, add it to the index in the same commit. Re-implementing near-identical UI per module instead of extracting is a defect, not a style choice.
10. **Files stay small and single-purpose.** A file crossing ~300 lines is split in the same change; an inline sub-component past ~40 lines gets its own file. Full thresholds in `../Ombor.Docs/operating-code.md` → File structure & size.

## Git, session discipline, diagnostics

The cross-repo rules live in **`../Ombor.Docs/operating-code.md`** — git rules, stop-and-ask session discipline, no unilateral deviations, blocker surfacing, and Sentry/PostHog/SQL diagnostics routing. Read once per session. Frontend-specific additions:

- **Preview verification needs real auth on the right origin.** The dev preview must run on **`http://localhost:3000`** so the backend's CORS allowlist accepts it and login works; on any other port login fails at the browser (`net::ERR_FAILED`, not a 401). If `:3000` is taken by the user's own dev server, ask them to stop it (don't kill it yourself), then start the preview on `:3000` and log in with real credentials. Do not bypass the auth guard to verify.
- Omitting or altering any **designed element** (prototype) is never a unilateral call — if the prototype shows something the backend/canon can't support, or canon and prototype conflict, pause and ask mid-session (see also `docs/design-handoff.md`).

## Verification & change discipline

- **Live verification before reporting done.** A green `tsc`/lint/build is NOT verification. Before reporting a task complete, run the app (or the relevant surface) and exercise the changed behavior against real or mock data — adoption and build-from-spec work silently drops prior behaviors and crashes on data shapes the build never sees. State what you verified live, not just that the build passed.
- **Migrating onto shared infra: flag behavior changes, get approval — don't absorb them.** When adopting a shared component/util changes any user-facing behavior (a lost interaction, a changed default, a dropped affordance), STOP and surface it as a decision. Do not rationalize it as "shared-component behavior" and move on.
- **A missing field may be intentional, not a gap.** Before treating "the API doesn't return X" as work to do, check it against the rules and the decision log (it may be deliberately out of scope — e.g. no persisted entity numbering, DR-14) and against the contract sources below. Confirm the field is genuinely absent _by design_ before proposing a backend change, a stub, or a fallback.

## Contract sources

When verifying whether a field or endpoint exists, check the contract, not memory: `docs/openapi.json` (regenerate after backend releases) plus the live API response; `models/<module>.ts` mirrors the contract. A field absent in both is genuinely unserved — then decide gap vs intentional scope per the discipline above, and record real gaps as new F-items in `docs/frontend-gaps.md` with contract evidence.

---

## Repo state

Per-module state lives in **`docs/repo-state.md`** (the single home — read the module's entry before touching a module). The authoritative gap list is **`docs/frontend-gaps.md`**: F-items are live bugs, not latent debt. **Since the 2026-07-05 contract alignment the app runs on the REAL backend (`VITE_ENABLE_MOCKS=false`); `src/mocks/` handlers are dead code pending deletion.**

Exceptions worth knowing before routing any task:

- **Not built (v1 scope):** Activity Log (**U1 — Blocker**: no backend endpoint, route is a placeholder) · Акт сверки (U2: ledger endpoint served, print screen missing).
- **Not built (v2):** Reports — out of navigation (pattern 10).
- **Legacy modules pending rebuild:** Products (**F1 edit crash — Blocker**) and Categories still use the deprecated side-pane layout.
