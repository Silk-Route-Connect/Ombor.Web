# Ombor — Manual Test Plan (master index)

**Target:** deployed dev — `https://app.miraziz.net` (frontend) + `https://api.miraziz.net` (real backend, **mocks OFF**).
**Auth:** register a fresh `+998` tenant; OTP is the dev mock **`1234`**. Tenant starts **empty** → data is built up in dependency order.
**Tooling:** Playwright MCP (primary), Claude Preview MCP (visual spot-checks).
**Deliverables:** per-module cases in [`test-cases/`](test-cases/) · live findings in [`findings.md`](findings.md).

## Known designed gaps (not bugs)
- **Password-reset** (`/api/auth/forgot-password`, `/verify-reset-code`, `/reset-password`) has **no backend** → 404. The reset UI is mock-only (demo code `1234`).
- **uz-Latn / uz-Cyrl translations** are not backfilled → switching to Uzbek shows Russian (fallback).

## Execution order (data-dependency DAG)
0. Auth → 1. Settings → 2. Categories → 3. Products (+images) → 4. Warehouses (+opening stock) →
5. Stock Adjustments → 6. Partners → 7. Wallets → 8. Templates → 9. Supplies (POS) →
10. Sales (POS) → 11. Refunds → 12. Orders (state machine) → 13. Transfers → 14. Payments →
15. Debts (reconcile) → 16. Dashboard (reconcile) → 17. Employees (+payroll) → 18. Cross-cutting.

The real backend makes **cross-module reconciliation** testable (supply↑stock; sale↓stock+debt; payment↔wallet/debt) — the highest-value checks.

## Per-module test cases
| Module | Doc |
| --- | --- |
| Auth | [test-cases/auth.md](test-cases/auth.md) |
| Settings | [test-cases/settings.md](test-cases/settings.md) |
| Categories | [test-cases/categories.md](test-cases/categories.md) |
| Products | [test-cases/products.md](test-cases/products.md) |
| Warehouses | [test-cases/warehouses.md](test-cases/warehouses.md) |
| Stock Adjustments | [test-cases/stock-adjustments.md](test-cases/stock-adjustments.md) |
| Transfers | [test-cases/transfers.md](test-cases/transfers.md) |
| Partners | [test-cases/partners.md](test-cases/partners.md) |
| Sales & Supplies | [test-cases/sales-supplies.md](test-cases/sales-supplies.md) |
| New Sale/Supply POS | [test-cases/new-transaction.md](test-cases/new-transaction.md) |
| Templates | [test-cases/templates.md](test-cases/templates.md) |
| Orders | [test-cases/orders.md](test-cases/orders.md) |
| Wallets | [test-cases/wallets.md](test-cases/wallets.md) |
| Payments | [test-cases/payments.md](test-cases/payments.md) |
| Debts | [test-cases/debts.md](test-cases/debts.md) |
| Dashboard | [test-cases/dashboard.md](test-cases/dashboard.md) |
| Employees | [test-cases/employees.md](test-cases/employees.md) |
