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

## Reading a prototype

1. Inventory the screen: layout regions, components used, every interactive element, every state the prototype demonstrates (empty, loading, error, filtered, modal open, validation failure).
2. Map each element to an existing shared component first — `DataTable`, `FormDialog`, `KpiCard`, `SearchInput`, `DateFilterPicker`, `NumericField`, autocompletes, `ConfirmDialog`, chips/links. Create a new shared component only when nothing fits and the pattern is plainly reusable; one-off module components stay in `components/<module>/`.
3. Extract every visible string into the module's ru i18n namespace. Prototype copy is the source for ru values.
4. Prototype sample data is illustrative — screens bind to stores backed by the API or MSW mocks (see mocking.md), never to literals.
5. Implement every state the prototype demonstrates, reachable the same way (through interaction, not debug toggles).

**Conflicts:** if a prototype contradicts `business-rules.md` or a CLAUDE.md hard rule (e.g., shows an edit button on an immutable event), **canon wins** — implement per canon and flag the discrepancy in the session report so the prototype gets fixed.

## Locked UI patterns (redesign decisions — do not re-debate)

1. **Full-page detail layouts.** Entity details are routed pages with full app chrome (sidebar + topbar via `AppLayout`), never side panes or drawers.
2. **Three-dot menus for entity actions.** Edit, archive, restore live in a `⋮` menu on the detail page. Standalone buttons are reserved for child-event creation only (e.g., «Добавить оплату» on a partner page).
3. **Forms are centered modals**, never drawers.
4. **Balances: color + natural-language label, no +/− signs.** E.g., green «Вам должны 1 250 000» / red «Вы должны 800 000» / neutral «Нет долга». Applies to partner balances, debt lists, wallet figures.
5. **Settlement modal appears only on overpayment** — not on every payment. **Change return is the default** overpayment behavior; allocating the excess to debt settlement or advance is opt-in within the modal.
6. **Advances are offered only when the partner has zero outstanding debt.**
7. **Buttons never disabled** — always enabled, inline validation on submit.
8. **Immutable events show no edit/delete affordances** — corrections are separate counter-event flows (refund, reverse payment, stock adjustment).
9. **Walk-in retail sales** go through the system partner «Розничный покупатель» — POS flow defaults to it; it is not editable or archivable like a normal partner.
10. **Sidebar is flat two-tier** — top-level items, some expandable with children; **no section-label headings** (no ОБЗОР / КАТАЛОГ / ТРАНЗАКЦИИ group titles). «Отчёты» is omitted from navigation until v2. «Настройки» and «Выход» pinned at the bottom. Sidebars drawn in existing prototypes predate this decision — this spec overrides them.
11. Page-action placement: dataset-level actions (primary create, «Экспорт») sit on the title row; view-shaping controls (search, filters, tabs, archive toggle) sit on the filter row below. Export produces a client-side CSV of the current filtered view.

## Fidelity rules

- Match layout, hierarchy, grouping, and emphasis. Exact pixels come from the theme's spacing scale — pick the nearest token, don't transcribe prototype CSS values.
- Responsive behavior follows MUI grid/breakpoint conventions; prototypes are desktop-first, and the web app targets desktop — don't invent mobile layouts (mobile is a separate read-only RN client).
- Icons: `@mui/icons-material`, matched by meaning to the prototype's icons, not by importing new icon sets.
- Charts: `recharts` via the shared `TimeSeriesChart`/chart components, themed to the palette.

## Definition of done for a designed screen

- All prototype states implemented and reachable; strings in ru namespace; data via store + API/mock; theme-only styling; shared components reused; `npm run validate` clean; discrepancies between prototype and canon reported.
- **Measured, not eyeballed:** exact sizes, weights, spacings, and colors are extracted from the bundle's CSS and mapped to theme tokens — approximating from screenshots is not acceptable.
- **Side-by-side check before declaring done:** render the implemented screen next to the bundle's prototype and compare; remaining deviations are listed in the summary, not silently shipped.
