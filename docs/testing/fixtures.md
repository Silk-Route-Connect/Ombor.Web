# QA org fixtures

The registry of stable entities in the QA organization, plus the naming rules for entities tests create at run time. Module test cases reference fixtures by the names below.

## Status: NOT YET SEEDED

The QA org does not exist yet. Setup sequence (one session, owner + Claude together):

1. **Owner registers the QA org** on the dev backend via `/register` (account creation and OTP entry are owner-only actions) and logs into it in the preview browser.
2. Claude seeds the stable fixture registry below through the UI, then replaces this section with the actual org identity and records any deviations in the tables.

## Identity (fill at seeding)

- Org name: _(fill)_ · QA user phone: _(fill)_ · Registered: _(date)_

## Naming rules

- **Stable fixtures** are prefixed «QA » and listed below. They exist permanently and are used for pickers, read paths, and non-numeric flows.
- **Run-scoped entities** are named `QA-<MMDD> <name>` (e.g. «QA-0716 Партнёр А») and created fresh during a run wherever a case needs known starting numbers. Archive archivable ones at run end.

## Stable fixture registry (target set)

| Entity    | Name                                       | Configuration                                            | Purpose                                     |
| --------- | ------------------------------------------ | -------------------------------------------------------- | ------------------------------------------- |
| Warehouse | QA Склад А · QA Склад Б                    | plain                                                     | transfers, per-warehouse stock/WAC          |
| Wallet    | QA Касса · QA Карта · QA Банк              | types Cash / Card / Bank, opening balance 1 000 000 each | payment sources, wallet transfers, overdraft |
| Partner   | QA Клиент · QA Поставщик · QA Универсал    | types Customer / Supplier / Both, opening balance 0      | pickers, payment-direction derivation        |
| Category  | QA Категория                               | —                                                         | product forms                                |
| Product   | QA Товар Штучный                           | unit Piece, no packaging, supply 10 000 / sale 15 000    | POS lines, simple math                       |
| Product   | QA Товар Упаковка                          | packaging size 12, supply 12 000 / sale 18 000           | package-unit math (R21)                      |
| Product   | QA Товар Поставка                          | type Supply                                               | product-type filtering                       |
| Employee  | QA Сотрудник                               | Active, salary 3 000 000                                  | payroll                                      |

Registration also seeds 1 starter wallet, warehouse, category, and partner (R42) — ordinary entities. Leave them in place; they double as archive/delete-gating material.

## Books discipline

- Stable fixtures accumulate history as tests run. **Never assert an absolute balance or stock level on a stable fixture** — assert deltas (before/after within the run) or use run-scoped entities.
- Numeric-oracle cases (WAC math, advances, settlement identities) **always** use run-scoped products/partners so arithmetic starts from a known zero state.
- Keep fixture wallets' use to payment-source selection; wallet-balance oracles use run-scoped wallets.
