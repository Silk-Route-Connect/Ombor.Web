# Design handoff — Claude Design → React/MUI

How to implement screens from Claude Design prototypes (delivered as HTML/CSS/JS via the Design→Code handoff). Read in full before implementing any designed screen.

**The prime rule: prototypes are design intent, not source code.** Never copy prototype HTML, CSS, or JS into the app. Re-express the design in React + MUI, styled exclusively through `theme.ts`, built on the shared components, bound to store/mock data.

## Handoff mechanics

The Claude Design handoff bundle is **project-scoped** — it contains all design files, the design system tokens, chat context, and a README. The session prompt, not the bundle, defines scope: implement **only the page(s) named in the session prompt**. Use the rest of the bundle as reference only — the design system tokens and shared chrome for consistency, neighboring pages for pattern alignment. Never implement unscoped pages "while you're there."

If the bundle's README conflicts with this doc or CLAUDE.md, this doc and CLAUDE.md win — the README is generic; these docs are repo law. A fresh handoff is generated per session, so the bundle always reflects the current design state. Fetch the bundle with `curl` + `tar` (it's a gzipped tar; WebFetch cannot parse it).

---

## Prerequisite: theme parity

`theme.ts` must encode the Ombor Design System before page implementation starts — this is a one-time foundation task:

- **Palette:** Bukhara Teal — primary teal `#12676B`, saffron accent, plus the semantic colors (success/error/warning) the prototypes use for balances and statuses.
- **Typography:** Onest for all text, including numerics; numeric/tabular contexts use tabular figures (`font-variant-numeric: tabular-nums`) on tables and money values. (Decision 2026-06-11: tokens.css is authoritative — JetBrains Mono for numerics was a stale early assumption.)
- **Shape/spacing:** radii and spacing scale matching the design system.

After parity, components reference theme tokens only. If a prototype shows a value the theme lacks, extend the theme — never inline the value.

**Palette drift caveat:** the Design project has drifted from the locked design-system palette (neutral ramp went cool; some controls changed). Until it is reconciled, `theme.ts` is the authoritative palette source and the prototype is **reference-only for color** — take structure and layout from the prototype, colors from the theme. Report the drift; don't import it.

## Reading a prototype

1. Inventory the screen: layout regions, components used, every interactive element, every state the prototype demonstrates (empty, loading, error, filtered, modal open, validation failure).
2. Map each element to an existing shared component first — `DataTable`, `FormDialog`, `KpiCard`, `SearchInput`, `DateFilterPicker`, `NumericField`, autocompletes, `ConfirmDialog`, chips/links, and the detail-page scaffold (#20). Create a new shared component only when nothing fits and the pattern is plainly reusable; one-off module components stay in `components/<module>/`.
3. Extract every visible string into the module's ru i18n namespace. Prototype copy is the source for ru values.
4. Prototype sample data is illustrative — screens bind to stores backed by the API or MSW mocks (see mocking.md), never to literals.
5. Implement every state the prototype demonstrates, reachable the same way (through interaction, not debug toggles).

**Conflicts:** if a prototype contradicts `business-rules.md` or a CLAUDE.md hard rule (e.g., shows an edit button on an immutable event), **canon wins** — implement per canon and flag the discrepancy in the session report so the prototype gets fixed.

**For design-specific components, fetch the actual prototype — don't build from a prose spec.** A text description gets structure roughly right but misses visual specifics (connected grids, tabular-number sizing, tinted result cells, skeletons). When a component has a built prototype, reference it directly (colors still from theme per the drift caveat).

## Locked UI patterns (redesign decisions — do not re-debate)

1. **Full-page detail layouts.** Entity details are routed pages with full app chrome (sidebar + topbar via `AppLayout`), never side panes or drawers. (Internal layout of the page — geometry, header, tabs — is specified in #20.)
2. **Three-dot menus for entity actions.** Edit, archive, restore live in a `⋮` menu on the detail page. Standalone buttons are reserved for **child-event creation only** — e.g. «Начальный остаток» on a warehouse detail page, surfaced through the `DetailPageHeader.primaryAction` slot (#20). This is a single optional slot for one genuine creation entry point, not a general multi-action toolbar. (A partner-page «Добавить оплату» button — settle a partner's debts from their detail page — is a **v2** item; see mvp-plan Deferred and the business-rules DR-05 scope note.)
3. **Forms are centered modals**, never drawers.
4. **Balances: color + natural-language label, no +/− signs.** E.g., green «Вам должны 1 250 000» / red «Вы должны 800 000» / neutral «Нет долга». Applies to partner balances, debt lists, wallet figures.
5. **Settlement modal appears only on overpayment** — not on every payment. **Change return is the default** overpayment behavior; allocating the excess to debt settlement or advance is opt-in within the modal.
6. **Advances are offered only when the partner has zero outstanding debt.**
7. **Buttons never disabled** — always enabled, inline validation on submit.
8. **Immutable events show no edit/delete affordances** — corrections are separate counter-event flows (refund, reverse payment, stock adjustment).
9. **No system walk-in partner — a partner is always required.** The product owner dropped the system «Розничный покупатель» (canon rules 39–40). Partners are uniform; a tenant gets an ordinary **default partner** at registration that can be reused for anonymous/walk-in retail sales — it has no system flag and is editable/deletable like any other. The POS New Sale therefore has **no default partner** — its picker starts empty and selection is required on submit.
10. **Sidebar is flat two-tier** — top-level items, some expandable with children; **no section-label headings** (no ОБЗОР / КАТАЛОГ / ТРАНЗАКЦИИ group titles). «Отчёты» is omitted from navigation until v2. «Настройки» and «Выход» pinned at the bottom. Sidebars drawn in existing prototypes predate this decision — this spec overrides them.
11. **Page-action placement (list pages):** dataset-level actions (primary create, «Экспорт») sit on the title row; view-shaping controls (search, filters, tabs, archive toggle) sit on the filter row below. Export produces a client-side CSV of the current filtered view.
12. **Inert prototype affordances are deferred to v2 — omit them, don't re-ask each time.** Prototypes draw a non-functional «Все даты» date-range filter on list/ledger toolbars (Warehouses movements, Stock Adjustments, Transfers, …) and a static pager row (`Строк на странице: 25 · 1–N из N`). Implement the real, functional filters/pagination the screen needs; **leave the date-range filter out** for now and note it in the session summary — no need to flag it as a deviation every time. _Backlog: date-range filtering across the stock ledgers is a planned refinement, not a permanent drop._
13. **Archive control is a segmented «Активные | Архив» toggle that swaps the dataset** — selecting «Архив» shows archived records _only_, not archived rows appended into the active list. Applies to Products, Warehouses, Partners, Wallets.
14. **Detail-page tabbed tables carry their filters inside the table widget** — one bordered unit reading "this toolbar shapes this table." Applies to detail tabs only: Partner → Ledger / Transactions / Payments, Wallet → Operations, Warehouse → Stocks / Transfers. List pages keep filters on the filter row per #11 — this in-widget pattern is for detail tabs, not list pages.
15. **`PartnerType.Both` renders as «Клиент + Поставщик»** (localized — uz-Latn «Mijoz + Yetkazib beruvchi», uz-Cyrl equivalent) everywhere via the chip system; the raw "Both" is never shown. The enum is unchanged — this is display-only.
16. **WAC is labeled «Средняя себестоимость»** («Сред. себест.» when the column is narrow), with an info-tooltip on the column header and the detail field explaining it in one plain sentence (e.g. «Средневзвешенная стоимость закупки: пересчитывается при каждом поступлении»). No formula is shown in the UI.
17. **Payments list "Type" column shows the real localized `PaymentType`** (Transaction / Deposit / Withdrawal / Payroll / General) under the header «Тип операции» — not a constant "Payment". The concrete labels: Transaction → «Оплата», Deposit → «Депозит», Withdrawal → «Вывод», Payroll → «Зарплата», General → «Общий». The Wallet Operations type column (Transfer / Payment) is kept and localized.
18. **Validation on compact modals is inline-per-field only** (on submit) — no top-of-form error summary. A summary is reserved for long multi-section forms, not 5-field dialogs. (Consistent with #7 — never silently disable.)
19. **Delete vs archive affordance.** The delete control is always shown for archivable entities (Product, Partner, Wallet, Warehouse) — never hidden to express "not deletable" (consistent with #7). When the entity is referenced by any record, activating delete opens a dialog explaining it cannot be deleted because it is referenced, and offering archive instead. Only a never-referenced entity is actually deleted (canon rule 32). Referenced-ness is a served flag (`isDeletable`), consistent across the served flag and the backend delete guard.
20. **Detail-page canonical structure.** Detail pages are assembled from shared scaffold components — never a per-module hand-rolled header, tab bar, or card:
    - **`DetailPageHeader`** — back button → **name-only title** → `⋮` kebab (shared `ActionMenu`) → optional `primaryAction` slot (one child-event creation action per #2). **No breadcrumb.**
    - **`DetailTabs`** — shared underline tabs with count pills.
    - **`DetailCard`** — shared card primitive for summary / rail cards.
    - **`detailTableChrome`** — shared warm chrome for detail-embedded tables (header band + a total band _or_ a pager footer, as configuration). The list `DataTable` is a separate component for list pages; detail-embedded tables are not `DataTable`.
    - **Title = entity name only.** Type chips, company, and every other reference field live in the summary region (a `DetailCard` or the hero card), never in the header title.
    - **No breadcrumbs anywhere.** Orientation is the H1 title; return is the back button; section-jump is the persistent sidebar. (Revisit only if a genuine 3+-level hierarchy ever appears.)
    - **Geometry: stacked by default** — a full-width summary region above full-width tabbed content. **Right-rail** (`1fr {rail}`) is the exception, used only when the entity has a compact, pin-worthy summary worth keeping visible beside wide tabbed content. Current split: right-rail = Product / Order / Transaction / Payment; stacked = Partner / Wallet / Warehouse / Employee. Rule of thumb: right-rail when the summary is reference facts to pin while scrolling wide tab tables; stacked when the hero is a few big metrics that read better full-width.

## Fidelity rules

- Match layout, hierarchy, grouping, and emphasis. Exact pixels come from the theme's spacing scale — pick the nearest token, don't transcribe prototype CSS values.
- Responsive behavior follows MUI grid/breakpoint conventions; prototypes are desktop-first, and the web app targets desktop — don't invent mobile layouts (mobile is a separate read-only RN client).
- Icons: `@mui/icons-material`, matched by meaning to the prototype's icons, not by importing new icon sets.
- Charts: `recharts` via the shared `TimeSeriesChart`/chart components, themed to the palette.

## Definition of done for a designed screen

- All prototype states implemented and reachable; strings in ru namespace; data via store + API/mock; theme-only styling; shared components reused; `npm run validate` clean; discrepancies between prototype and canon reported.
- **Measured, not eyeballed:** exact sizes, weights, spacings, and colors are extracted from the bundle's CSS and mapped to theme tokens — approximating from screenshots is not acceptable.
- **Side-by-side check before declaring done:** render the implemented screen next to the bundle's prototype and compare; remaining deviations are listed in the summary, not silently shipped.
- **Live verification before declaring done:** run the app, reach the surface with real/mock data, and exercise it — a green `tsc`/lint/build is not verification. Adoption or build-from-spec work can silently drop a prior behavior or crash on a data shape the build never sees; only live exercise catches it. Any behavior changed while adopting shared infra is a decision to flag, not a side effect to absorb.
