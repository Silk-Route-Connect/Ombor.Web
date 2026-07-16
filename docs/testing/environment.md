# QA environment & session setup

How a Claude QA session gets a working, authenticated app and what it is allowed to do. Read once at the start of every QA session, before any other testing doc.

## Stack under test

- **Frontend:** Vite dev server on **`http://localhost:3000`** — start/reuse via the Browser pane (`preview_start {name: "ombor-web"}`, defined in `.claude/launch.json`). The port is mandatory: the backend CORS allowlist only accepts `:3000`; on any other port login fails in the browser as `net::ERR_FAILED` (not a 401). If the owner's own dev server occupies `:3000` outside the preview system, ask them to stop it — never kill it.
- **Backend:** real Ombor.API at **`http://localhost:5062`** (`VITE_OMBOR_API_BASE_URL` in `.env.development`); mocks are off (`VITE_ENABLE_MOCKS=false`). If the backend is down the app shows the offline banner and blocks submits — ask the owner to start it. Never test against MSW mocks; `src/mocks/` is dead code.
- **Quirk:** the dev server may bind IPv6-only. If `http://localhost:3000` refuses connections while the server is demonstrably running, use `http://[::1]:3000`.

## QA organization (the test tenant)

- All QA runs execute inside the dedicated **QA organization** — a separate tenant on the dev backend. Its books absorb permanent test data; the owner's real organizations must never be touched. Identity and fixtures: [fixtures.md](fixtures.md).
- The owner's dev account `+998900000001` is **not** the QA org — never write test events under it.
- If it is unclear which org the session is logged into (fixture entities from `fixtures.md` missing, unfamiliar data), **stop and ask** — do not write events into an unidentified org.

## Login handshake

1. `preview_start {name: "ombor-web"}` (reuses a running server).
2. If the app lands on `/login`: ask the owner to log into the **QA org** in the preview browser and wait. Claude never types passwords (safety rule).
3. Before any write test, verify identity: the sidebar/topbar shows the QA user, and at least one stable fixture from `fixtures.md` is present.

## Data permanence policy

- Transactions, payments, payroll, stock adjustments, and transfers are immutable (business-rules R1) — every write in a QA run stays in the QA org's books forever (DR-15: the dev DB is never wiped). There is no cleanup of events, by design.
- Run-scoped entities created for numeric oracles follow the naming convention in [fixtures.md](fixtures.md) (`QA-<MMDD> …`) so the books stay interpretable months later.
- Do not run money/stock events through stable fixture entities unless a case explicitly says so — fixture balances should drift as little as possible.
- Archivable run-scoped entities (partners, products, wallets, warehouses) should be archived at the end of a run.

## What a QA run is authorized to do

- The owner's QA request authorizes: navigating the app, filling and submitting forms **inside the app under test** with test data, and creating test entities/events in the QA org.
- Always out of scope: entering real personal data or any credentials; writing into a non-QA org; creating or deleting accounts; acting on any external site.

## Tooling guidance (Browser pane)

- Prefer `read_page` / `get_page_text` for content assertions, `read_network_requests` for API status/payload verification, `read_console_messages` for hygiene. **Screenshots are slow and may time out on this machine** — take them sparingly, mainly as evidence of a confirmed visual defect.
- Verify server-computed figures (balances, WAC, totals, «Наши средства») against the API response via `read_network_requests` — never against hand-summed event lists (R12). For arithmetic oracles, the sum is computed from inputs the test itself created.
- Negative cases assert the **surfaced** error (inline field error or toast per DR-24) *and* may confirm the HTTP status in the network log (expected statuses per case).
- Interactions: `computer` (click/type) and `form_input`; confirm outcomes with `read_page`, not by assuming the click worked.

## Hygiene assertions (every run, every tier)

- Zero console errors across all exercised screens (new warnings: note in the report).
- No unexpected 4xx/5xx responses — expected ones are named by negative test cases.
- Zero requests to `*.sentry.io` / `*.posthog.com` — telemetry is production-only; any such request in dev is itself a defect.
