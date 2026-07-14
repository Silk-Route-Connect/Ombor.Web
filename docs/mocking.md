# Mocking policy — MSW, contract-first

**Status:** frontend craft doc. Premise updated 2026-07-13 after the backend M0–M7 redesign completed (2026-06-22).
**Last updated:** 2026-07-13

The backend redesign (M0–M7) plus the 2026-07-05 contract-alignment pass closed the gap this policy was written for: **the app now runs on the real backend — `VITE_ENABLE_MOCKS=false` — and the `src/mocks/` handlers are dead code pending deletion** (several already diverge from the real contract; see `frontend-gaps.md`, «Found during recon» #4). This doc now governs two things: **re-enabling a targeted mock** only if a genuine new gap appears (same contract-first rules below), and **deleting handlers + seed data** as each module's divergences are fixed. The mechanics are unchanged: any gap is mocked with **MSW (Mock Service Worker)** at the network layer — stores and Api classes stay production-shaped and never know they're talking to mocks. The entire `src/mocks/` folder is wholesale-deletable.

**The contract-first rule:** every handler's request/response shape is written as if it were the real backend contract. Mocks are not throwaway fakes — they are the API spec the backend round will implement. Sloppy mock shapes become sloppy backend endpoints.

**The shape-of-truth rule:** `docs/openapi.json` is the current backend's actual contract — **regenerate it after every backend release; a stale copy inverts this whole rule.** Post-redesign, the more common staleness runs the other way: a mock written against the pre-redesign backend may lag the real contract (e.g. the transactions mock's `POST /{id}/refund`, which the real backend never had — refunds are `POST /api/transactions` with a refund type + `originalTransactionId`). Before integrating any endpoint, check it against both `openapi.json` and the canon docs:

- "Satisfies v1 expectations" is judged at the page level, not the endpoint level: the endpoint must serve every field the designed page displays and every behavior canon requires. Missing any one of them makes it stale — a working endpoint that can't feed the designed page does not qualify.
- Endpoint satisfies that test → use the real API directly; never mock it.
- Endpoint is missing or stale → mock the target v1 contract. Mock at resource granularity: if any endpoint of a resource needs mocking, mock all of that resource's endpoints together, so writes are reflected in reads. Never degrade the designed page to backend reality — dropping a designed column or safeguard is never the answer; mocking the target is.

Mocked endpoints still follow the spec's general conventions (routes, plain arrays, error shapes) so real and mocked modules are indistinguishable to stores.

**The client-side-operations rule:** in v1, ALL searching, filtering, sorting, and pagination are client-side — Api clients fetch the full dataset and stores/DataTable do the rest. Mocked list endpoints therefore take **no query parameters** and return the entire collection (archived/soft-deleted records included, carrying their flag, so the store can filter). Server-side variants of any of these are deferred by decision (decision-log, «server-side pagination/sorting/filtering deferred», 2026-06-11) — do not implement them in mocks.

## Setup (one-time, in the first session that actually needs a mock)

1. `npm i -D msw`, then `npx msw init public/` (registers the service worker file).
2. `src/mocks/browser.ts` — `setupWorker(...handlers)`.
3. Conditional start in the entry point, gated by env:

```ts
if (import.meta.env.VITE_ENABLE_MOCKS === "true") {
  const { worker } = await import("./mocks/browser");
  await worker.start({ onUnhandledRequest: "bypass" });
}
```

`bypass` is deliberate — **hybrid mode**: only the endpoints we register are mocked; everything else (auth, existing CRUD) passes through to the real backend.

## Structure

```
src/mocks/
  browser.ts            worker setup
  handlers/
    index.ts            aggregates all module handlers
    <module>.ts         handlers for one module
  data/
    <module>.ts         seed data + in-memory state for one module
```

## Handler rules

1. **Types come from `src/models/`** — handlers import the same request/response types the Api classes use. Never define shapes inline in a handler.
2. **Every handler carries a `CONTRACT` comment block** — method, route, request body type, response type, error cases. This is what gets lifted into the backend round:

```ts
// CONTRACT: GET /api/wallets
// query: none — full dataset, archived included (isArchived flag)
// response: WalletDto[]
// errors: 401
```

3. **Routes and conventions mirror `docs/openapi.json`** — `/api/<plural>` resource routes; command actions as POST sub-routes (`archive`/`restore` and similar). **No query-parameter filters on list endpoints** (client-side-operations rule). Where no precedent exists, propose the route in the CONTRACT block — it becomes the spec.
4. **List endpoints return the complete collection as a plain array** — no paging envelope, no search/filter/sort params. Pagination, sorting, searching, and filtering are client-side in stores and the shared DataTable, identical to the modules running on the real API.
5. **Realistic latency:** wrap responses in a small `delay(150–400ms)` so loading states are actually exercised.
6. **Error paths match the backend's shapes** (see openapi.json): 404 with `ProblemDetails`, 400 with `ValidationProblemDetails` (field-keyed `errors` map) for invalid writes, so error UI is real, not theoretical.

## Seed data rules

1. In-memory and mutable within a session: a created wallet appears in the next list fetch; a payment changes the partner's mocked balance. Page reload resets — that's fine.
2. **Domain-consistent, always.** Mock data must obey `../Ombor.Docs/business-rules.md`: payment sources equal settling allocations; partner balances equal what their event history implies; stock never negative; refund quantities within original lines; immutable events have no updatable fields. The UI will be demoed to design partners on mocks — internally inconsistent numbers destroy exactly the trust the audit trail is supposed to create.
3. **Computed values are served, not client-computed** (CLAUDE.md hard rule 8): the mock computes partner balance, wallet balance, and "our money" inside the handler/data layer and returns them in responses, same as the real backend.
4. Realistic Russian-language names and UZS magnitudes, consistent with the Design sample-data style (e.g., products like «Мороженое пломбир 500г», amounts like 1 250 000).
5. Cross-module reference consistency: when mocking a resource that REAL modules reference (e.g., mocked categories used by the real products endpoint), seed it from a snapshot of the real backend's data — same ids, same names — then enrich with the target-contract fields. Otherwise real writes referencing mocked ids will fail.

## Lifecycle

- When the backend implements an endpoint: delete its handler and seed data, retest against the real API, and confirm the CONTRACT block against the actual implementation in the backend round.
- **Mocks are globally off** (`VITE_ENABLE_MOCKS=false`) since the 2026-07-05 alignment; the remaining lifecycle work is deleting dead handlers and seed data as each module's divergences (`frontend-gaps.md`) are fixed. Do not flip the flag back on casually — several stale handlers would misbehave against today's contract.
- Never let a mock and a real endpoint coexist for the same route; the handler's existence is the single switch.
