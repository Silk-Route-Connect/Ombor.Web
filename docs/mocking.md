# Mocking policy — MSW, contract-first

The backend does not yet satisfy the redesigned UI. Every missing or stale capability is mocked with **MSW (Mock Service Worker)** at the network layer — stores and Api classes stay production-shaped and never know they're talking to mocks. This entire folder (`src/mocks/`) is wholesale-deletable once the backend catches up.

**The contract-first rule:** every handler's request/response shape is written as if it were the real backend contract. Mocks are not throwaway fakes — they are the API spec the backend round will implement. Sloppy mock shapes become sloppy backend endpoints.

**The shape-of-truth rule**: docs/openapi.json is the current backend's actual contract — but it is incomplete and partly stale relative to v1: some endpoints are missing entirely, others exist with shapes that predate canon (e.g., the legacy payment model). Before integrating any endpoint, check it against both openapi.json and the canon docs:

- Endpoint exists and satisfies v1 expectations (canon rules + what the page needs) → use the real API directly; never mock it.
- Endpoint is missing or its shape is stale / contradicts canon → mock the target v1 contract; the handler fully replaces the real route (the handler's existence is the switch — never mix real and mocked for one route).

Mocked endpoints still follow the spec's general conventions (routes, plain arrays, error shapes) so real and mocked modules are indistinguishable to stores.

**The client-side-operations rule:** in v1, ALL searching, filtering, sorting, and pagination are client-side — Api clients fetch the full dataset and stores/DataTable do the rest. Mocked list endpoints therefore take **no query parameters** and return the entire collection (archived/soft-deleted records included, carrying their flag, so the store can filter). Server-side variants of any of these are a deferred backend change tracked in `tech-change-list.md` — do not implement them in mocks.

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
2. **Domain-consistent, always.** Mock data must obey `business-rules.md`: payment sources equal settling allocations; partner balances equal what their event history implies; stock never negative; refund quantities within original lines; immutable events have no updatable fields. The UI will be demoed to design partners on mocks — internally inconsistent numbers destroy exactly the trust the audit trail is supposed to create.
3. **Computed values are served, not client-computed** (CLAUDE.md hard rule 8): the mock computes partner balance, wallet balance, and "our money" inside the handler/data layer and returns them in responses, same as the real backend will.
4. Realistic Russian-language names and UZS magnitudes, consistent with the Design sample-data style (e.g., products like «Мороженое пломбир 500г», amounts like 1 250 000).

## Lifecycle

- When the backend implements an endpoint: delete its handler and seed data, retest against the real API, and confirm the CONTRACT block against the actual implementation in the backend round.
- Never let a mock and a real endpoint coexist for the same route; the handler's existence is the single switch.
