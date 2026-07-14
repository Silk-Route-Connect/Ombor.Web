# Design handoff — Claude Design -> React/MUI

**Status:** frontend craft doc — how to implement screens from Claude Design prototypes. The locked UI patterns moved to `../Ombor.Docs/ui-patterns.md` on 2026-07-12 (numbering preserved); this doc keeps the translation mechanics.
**Last updated:** 2026-07-13

How to implement screens from Claude Design prototypes (delivered as HTML/CSS/JS via the Design->Code handoff). Read in full before implementing any designed screen.

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

**Palette-drift caveat + clarify-don't-absorb:** the Design project has drifted from the locked design-system palette (neutral ramp went cool; some controls changed). Until it is reconciled, `theme.ts` is the authoritative palette source and the prototype is **reference-only for color** — take structure and layout from the prototype, colors from the theme. More generally: **when a prototype looks suspicious or contradicts what you'd expect** — colors wildly off from the theme, a control that fights an established pattern, a layout that violates canon — and it is **not already anticipated or called out in the session prompt, CLARIFY.** Do not silently refactor it to what you think was meant, and do not silently implement the suspicious thing as-is. Report the drift and ask.

## Reading a prototype

1. Inventory the screen: layout regions, components used, every interactive element, every state the prototype demonstrates (empty, loading, error, filtered, modal open, validation failure).
2. Map each element to an existing shared component first — see `docs/shared-components.md` for the index (`DataTable`, `FormDialog`, `KpiCard`, `SearchInput`, `DateFilterPicker`, `NumericField`, autocompletes, `ConfirmDialog`, chips/links, and the detail-page scaffold per ui-patterns #20). Create a new shared component only when nothing fits and the pattern is plainly reusable; one-off module components stay in `components/<module>/`.
3. Extract every visible string into the module's ru i18n namespace. Prototype copy is the source for ru values.
4. Prototype sample data is illustrative — screens bind to stores backed by the API or MSW mocks (see mocking.md), never to literals.
5. Implement every state the prototype demonstrates, reachable the same way (through interaction, not debug toggles).

**Conflicts:** if a prototype contradicts `business-rules.md`, `ui-patterns.md`, or a CLAUDE.md hard rule (e.g., shows an edit button on an immutable event), **canon wins** — implement per canon and flag the discrepancy in the session report so the prototype gets fixed.

**For design-specific components, fetch the actual prototype — don't build from a prose spec.** A text description gets structure roughly right but misses visual specifics (connected grids, tabular-number sizing, tinted result cells, skeletons, exact emphasis). When a component has a built prototype, reference it directly (colors still from theme per the drift caveat). If the prototype and a prose description of it disagree, trust the built prototype.

## Locked UI patterns

The locked patterns (1–20), display conventions, and behavior digest live in **`../Ombor.Docs/ui-patterns.md`** — moved 2026-07-12 with **numbering preserved**, so every existing «pattern N» / «#N» citation resolves there unchanged. Read it alongside this doc for any designed screen; implement to it, and treat divergences as conflicts per the rule above.

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
