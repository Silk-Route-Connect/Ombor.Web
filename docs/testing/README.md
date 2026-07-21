# QA testing docs — Claude-driven manual testing

Oracle-based manual test documentation, written to be executed by a Claude session driving the app in a real browser against the real backend. The goal is catching bugs — not blind smoke-verification: every case states exact expected outcomes (strings, formats, numbers) with canon citations, and the docs encode both kinds of traps (designed behavior that looks broken, and broken behavior that looks fine).

## Doc map

| File                                     | Purpose                                                                                      |
| ---------------------------------------- | -------------------------------------------------------------------------------------------- |
| [environment.md](environment.md)         | Session setup: ports, backend, QA org, login handshake, permanence policy, tooling, hygiene  |
| [shared-checklist.md](shared-checklist.md) | Cross-cutting assertions applied to every screen; forbidden-affordance scan; traps table    |
| [fixtures.md](fixtures.md)               | QA org fixture registry + run-scoped entity naming                                           |
| [smoke.md](smoke.md)                     | T1 smoke suite — whole-app render/navigation pass, read-mostly                               |
| `modules/<module>.md`                    | Per-module deep test cases (happy path, edge, negative, reconciliation)                      |

**Loading set for a QA run:** this README → [environment.md](environment.md) → [shared-checklist.md](shared-checklist.md) → [fixtures.md](fixtures.md) → the target module doc(s) → [../frontend-gaps.md](../frontend-gaps.md) (open F-items so known issues aren't reported as new). Canon (`../../../Ombor.Docs/business-rules.md`, `ui-patterns.md`, `decision-log.md`) is consulted on citation, not read whole.

## Run tiers

| Tier | What                                                          | When                                | Writes                   |
| ---- | ------------------------------------------------------------- | ----------------------------------- | ------------------------ |
| T1   | [smoke.md](smoke.md) + hygiene sweep                          | quick confidence check, post-merge  | none                     |
| T2   | one module doc, all cases                                     | after changing that module          | run-scoped, permanent    |
| T3   | smoke + all authored module docs                              | pre-release                         | run-scoped, permanent    |

T3 is several hours; split it across sessions by module group if needed and merge the reports.

## Test-case format

Cases live in `modules/<module>.md` with stable IDs `T-<MOD>-NN` (never renumbered; gaps allowed). Tags: `[happy]` `[edge]` `[negative]` `[reconcile]`; cases creating permanent events additionally carry `✍`. Structure per case:

```markdown
### T-PAY-12 · Advance offered only at zero outstanding debt [edge] ✍
Pre: run-scoped partner with one unpaid sale (from T-PAY-10).
Steps: terse, imperative, numbered.
Expect: exact outcomes, each citing canon — (R40, #6).
Known: F-9 — if the allocation block crashes, report KNOWN, not new.
```

- **Preconditions** name fixtures ([fixtures.md](fixtures.md)) or earlier cases whose data they reuse — deep passes run a module's cases in order.
- **Expect** lines cite `R n` / `#n` / `DR-n` so ambiguity is resolvable against canon; docs cite, they don't restate.
- **Known** annotations map expected failures to open F-items. If a `Known` case *passes*, report "F-x may be fixed — verify and update frontend-gaps.md".
- Module docs also carry: a surfaces list (routes/modals), module-specific traps, and reconciliation checks (cross-screen number consistency — the highest-value tier, since the product's differentiator is a dispute-grade ledger).

## Session runbook

1. Load the docs per **Loading set** above. Note the current branch and whether the working tree is dirty (report it — behavior may be ahead of docs).
2. Environment + login handshake per [environment.md](environment.md). Verify the QA org before any write.
3. Execute the tier's cases in doc order. For each: PASS / FAIL / KNOWN / BLOCKED / SKIP. On FAIL, gather evidence immediately (page text, network entry, screenshot if visual) before moving on — state is often unrecoverable later.
4. Track every run-scoped entity created; archive archivable ones at the end.
5. Deliver the report (below). Never mark the run complete on build/console silence alone — results come from exercised behavior.

## Report format

```markdown
## QA run — <tier> — <date>
Env: branch/commit · backend up · QA org verified · working tree clean/dirty
| ID | Result | Note |
…one row per executed case…

### New defects
Per defect: repro steps · expected (with citation) vs actual · evidence · severity (Blocker/Important/Cosmetic).

### Known-issue observations
F-items confirmed still present; expected-fails that now pass (fix candidates).

### Data created
Run-scoped entities (name → archived?).
```

New confirmed FE↔backend gaps discovered by a run are recorded as F-items in [../frontend-gaps.md](../frontend-gaps.md) with contract evidence, per the existing convention.

## Maintenance

- **Test docs track behavior:** any change to a module's user-facing behavior updates its `modules/<module>.md` in the same change (same discipline as `repo-state.md`). New modules get a test doc when they ship.
- Known-issue truth lives in [../frontend-gaps.md](../frontend-gaps.md) — test docs reference F-items, never duplicate their content.
- Canon changes (rules/patterns) ripple: a session changing cited behavior re-checks the citing cases.

## Module doc status

| Module doc                      | ID prefix | Status                                  |
| ------------------------------- | --------- | --------------------------------------- |
| `modules/sales-supplies.md`     | T-POS     | ✅ Wave 1                                |
| `modules/refunds.md`            | T-RFD     | ✅ Wave 1                                |
| `modules/payments.md`           | T-PAY     | ✅ Wave 1                                |
| `modules/debts.md`              | T-DBT     | ✅ Wave 1                                |
| `modules/wallets.md`            | T-WAL     | ✅ Wave 1                                |
| `modules/partners.md`           | T-PRT     | ✅ Wave 1                                |
| `modules/warehouses.md`         | T-WHS     | Wave 2 (planned)                        |
| `modules/stock-adjustments.md`  | T-ADJ     | Wave 2 (planned)                        |
| `modules/transfers.md`          | T-TRF     | Wave 2 (planned)                        |
| `modules/orders.md`             | T-ORD     | Wave 2 (planned)                        |
| `modules/templates.md`          | T-TPL     | Wave 2 (planned)                        |
| `modules/products.md`           | T-PRD     | Wave 2, light until rebuild (F1)        |
| `modules/categories.md`         | T-CAT     | Wave 2, light until rebuild             |
| `modules/employees-payroll.md`  | T-EMP     | Wave 3 (planned)                        |
| `modules/settings.md`           | T-SET     | Wave 3 (planned)                        |
| `modules/auth.md`               | T-AUTH    | Wave 3 (planned; registration/OTP flows are owner-executed) |
| `modules/dashboard.md`          | T-DSH     | Wave 3 (planned; reconciliation-heavy)  |

Excluded until built: Activity Log (U1 — smoke checks the placeholder), Акт сверки (U2), Reports (v2 — absence from nav is asserted in smoke).

## One-time setup still pending

1. **QA org registration + fixture seeding** — see [fixtures.md](fixtures.md) (owner registers; Claude seeds).
2. **First live smoke run** to validate this harness end-to-end; expect doc fixes from it.
