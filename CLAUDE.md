# Ombor.Web — Claude Code guide

Ombor is a warehouse & business-management web app for small businesses in Uzbekistan
(replaces paper/Excel; trilingual RU / UZ-Latin / UZ-Cyrillic; dispute-grade BNPL audit trail
is the core differentiator). This repo is the **web frontend**. Backend is a separate .NET API
(runs locally on `http://localhost:5062`).

## Active initiative: UI/UX redesign — "Bukhara Teal"

We are reskinning the whole app to a finalized design system from **Claude Design**. The full
hand-off bundle is preserved in **[docs/design-handoff/](docs/design-handoff/)** — read it before
working on any screen:

- `docs/design-handoff/project/tokens.css` — design tokens **and an exact MUI `createTheme` mapping** at the bottom. Source of truth for the visual system.
- `docs/design-handoff/project/ds-components.css` — component specs (buttons, chips, table `.dtable`, app shell, etc.).
- `docs/design-handoff/project/*.jsx` / `*.css` — per-screen prototypes (HTML/CSS/JS — recreate in MUI, don't copy structure).
- `docs/design-handoff/chats/` — the design conversation; **where the intent lives**.
- `docs/design-handoff/project/screenshots/` — rendered reference images.

Direction: primary teal `#12676B`, saffron accent `#D88A1E`, warm-cool gray neutrals, **Onest**
font, numbers-as-hero (tabular figures). **Light mode only — no dark mode in v1** (explicit in the brief).
Keep existing structural patterns; only the visual identity changes.

The theme implementing all of this is **[src/theme.ts](src/theme.ts)** — always style via theme
tokens (`primary.main`, `text.secondary`, `divider`, `grey.*`, etc.), never hardcoded colors.

## Working agreement (READ FIRST — prevents the failure modes that wrecked a past session)

- **Run this redesign in the local Claude Code CLI, not the cloud/desktop autonomous agent.** The visual
  feedback loop depends on the **Claude Preview MCP**, which is a *local* server — cloud/remote agents
  can't start it, so they implement blind and drift from the design. If Preview is unavailable, **do NOT
  guess**: implement to the design, then **ask the user for a screenshot** to verify before moving on.
- **Match the design EXACTLY.** Open the specific design file/screenshot for the screen FIRST and replicate
  its columns, layout, filters, and data shape. Do **not** invent summary cards, extra columns, or
  fabricated data that aren't in the design. Mirror the real screen, not a generic CRUD page.
- **Don't rabbit-hole. If the same command/check fails ~2 times, STOP and ASK the user.** Never spawn
  multiple background tasks to chase one error.
- **Keep it simple — work sequentially in the main session.** This is incremental UI work; fleets of
  subagents / background shells / PRs add overhead and confusion, not speed.
- **Type-check sanity (this is the #1 trap):** `npm run type-check` and bare `tsc` are BROKEN and flood
  `node_modules` noise. Use **ESLint + the running dev-server's error overlay** as the bar. If you run the
  isolated `tsc` command (below), read **only** error lines whose path starts with the file you edited —
  treat `node_modules/*` and other-file errors (e.g. `BaseApi.ts`) as noise and **do not try to fix them**.
- **Use real backend data; don't fabricate.** Render "—" for genuinely missing fields (e.g. weighted-avg
  cost). Computed summaries (totals, payroll fund, counts) must be derived correctly — never a placeholder.

## Tech stack

React 19 + TypeScript + **Material UI 7** (Emotion) · **MobX** (`src/stores/`, accessed via
`useStore()` from `StoreContext`; `RootStore` composes ~22 stores) · React Router 7 · `react-hook-form`
+ `zod` · `recharts` · `notistack` · axios · CRA (`react-scripts`). See
[memory frontend-architecture] for the wiring; that auto-memory persists across sessions too.

**Per-feature page pattern** (repeated across modules): `Page` → `Header` → shared **`DataTable`**
(`src/components/shared/Table/DataTable/`) → `FormDialog` + `ConfirmDialog`, driven by a store
`dialogMode` discriminated union. Newer screens (Dashboard, Warehouses) use card/grid layouts per the design.

## Conventions & gotchas (read before editing)

- **i18n:** custom `translate(key)` from `src/i18n/i18n.ts` (NOT react-i18next). Flat keys, namespaced
  JSON under `src/i18n/{ru,uz}/`. **RU is the active default; add every new key to both ru and uz.**
  Strings are baked at import (no live language switch yet).
- **Prettier is enforced as an ESLint error.** After editing any file, run
  `node_modules/.bin/prettier --write <files>` or CRA shows a red "Compiled with problems" overlay.
  On Windows the webpack watcher sometimes shows a **stale** overlay after a prettier rewrite — touch
  the file (any edit) or restart the dev server to clear it; confirm with `prettier --check` + `eslint`.
- **`npm run type-check` is BROKEN** (`tsconfig` `moduleResolution: "bundler"` vs installed TS 4.9.5).
  Don't rely on it. Type-check a single file in isolation:
  `node_modules/.bin/tsc --noEmit --moduleResolution node --module esnext --target ES2020 --jsx react-jsx --esModuleInterop --skipLibCheck --resolveJsonModule --lib ES2022,dom,dom.iterable --baseUrl src <file>`
  (Note: `src/services/api/BaseApi.ts` reports one pre-existing false-positive under this command — ignore it.)
- **Lint clean bar:** `node_modules/.bin/eslint --max-warnings 0 <files>` must pass (CRA treats warnings as overlay errors; `react-hooks/exhaustive-deps` included).

## Verifying changes (Claude Preview MCP)

The real toolchain is react-scripts, not `tsc`. To verify visually:
1. `.claude/launch.json` defines server **`ombor-web`** (port 3000). `preview_start` it.
2. The HTML shell returns 200 long before the JS compiles — **wait for `/static/js/bundle.js` to exceed ~100KB** before screenshotting.
3. App redirects all routes except `/login`, `/register` to auth. **Test login:** phone `+998900000001` / password `Password123!`. The masked phone + react-hook-form can need a re-submit when driven by automation.
4. If login hangs, the **backend (`:5062`) is probably down** (it's run in debug and stops on a 500) — not a frontend bug.
5. Prefer `preview_inspect` (computed styles) over screenshots for color/font claims. Wide viewports (≥1320) render tiny in screenshots; ~1180 is readable.

## Redesign progress

**Done & verified live:**
- Phase 1 — theme foundation (`src/theme.ts`, Onest font in `public/index.html`, global styles).
- Phase 2 — shared primitives: `DataTable`/`ExpandableDataTable` (white header, no zebra, i18n empty state), `KpiCard`.
- Phase 3 — app shell: `src/layouts/{Sidebar,Topbar,AppLayout,config}.tsx` (Ombor brand, grouped nav, system search, "Создать"; dark-mode toggle removed).
- Phase 4 — **Dashboard** (`src/pages/DashboardPage.tsx`, `src/components/dashboard/*`): KPIs, charts (sales/supplies, payments w/ wallet selector + bar/net + PNG download), aging, top debtors, recent tx. Routed at index `/`. Backend not ready → fed by a **swappable mock API instance**: `src/services/api/DashboardApi.ts` (`IDashboardApi` + mock impl) + `src/services/api/mock/dashboardMock.ts` + `DashboardStore`. Replace the mock with an HTTP impl when the endpoint exists — page/store unchanged.
- **Warehouses list** (`src/pages/WarehousePage.tsx`, `src/components/warehouse/{Card,Summary,Header}`): cards + summary + collapsible archived section; `archive`/`restore` on `WarehouseStore`.
- **Warehouse detail** (`src/pages/WarehouseDetailPage.tsx`, route `/warehouses/:id`, `src/components/warehouse/Detail/*`): header actions, summary, Остатки/Движения tabs. Card click navigates here (side pane removed). Dialogs shared via `src/components/warehouse/WarehouseDialogs.tsx`.
- Warehouse create/edit form: added **Примечание (notes)**, removed the isActive checkbox (create = always active; archive/restore manages state).

**Next screens (designs in the bundle):** Partner Ledger (the dispute-grade value page), Sales list + detail, POS / Transaction Entry, Write-off & Transfer panels, Debts & Payments.

**Known data gaps — DO NOT fabricate financial numbers; render "—":**
- **Weighted-average cost** is not implemented in the backend → warehouse "Стоимость" / "Средняя себестоимость" / "Общая стоимость" show "—".
- **Write-off** (`Списание`) transaction type and a dedicated **receiving** (`Приёмка`) flow don't exist — warehouse detail exposes the real `Перемещение` (transfer) + `Корректировка` (adjust) actions instead.
- Dashboard data is mock (see swap note above).

**Pre-existing issue noticed (not from the redesign):** on a fresh load with a stale refresh cookie,
auth bootstrap can hit a `refresh-token` retry storm that wedges the renderer — worth investigating.

## Where things live

- Theme/tokens: `src/theme.ts` · Global styles: `src/styles/global.scss`, `src/index.css` · Font: `public/index.html`
- Layout shell: `src/layouts/` · Routes: `src/App.tsx` · Paths: `src/routing/`
- Stores: `src/stores/` (`RootStore.ts`, `StoreContext.tsx`) · API: `src/services/api/` · Models: `src/models/`
- Shared UI: `src/components/shared/` · Feature UI: `src/components/<feature>/` · Pages: `src/pages/`
- i18n: `src/i18n/{ru,uz}/*.json` (registered in `src/i18n/i18n.ts`)
- Design hand-off: `docs/design-handoff/`

> The `docs/design-handoff/` bundle is ~5 MB (includes screenshots). Keep it for reference; if you'd
> rather not commit it, add `docs/design-handoff/` to `.gitignore` and keep it locally.
