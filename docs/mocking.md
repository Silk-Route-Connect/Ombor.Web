# Mocking policy — MSW, contract-first

The backend does not yet satisfy the redesigned UI. Every missing capability is mocked with **MSW (Mock Service Worker)** at the network layer — stores and Api classes stay production-shaped and never know they're talking to mocks. This entire folder (`src/mocks/`) is wholesale-deletable once the backend catches up.

**The contract-first rule:** every handler's request/response shape is written as if it were the real backend contract. Mocks are not throwaway fakes — they are the API spec the backend round will implement. Sloppy mock shapes become sloppy backend endpoints.

---

## Setup (one-time)

1. `npm i -D msw`, then `npx msw init public/` (registers the service worker file).
2. `src/mocks/browser.ts` — `setupWorker(...handlers)`.
3. Conditional start in `main.tsx`, gated by env:

```ts
if (import.meta.env.VITE_ENABLE_MOCKS === "true") {
  const { worker } = await import("./mocks/browser");
  await worker.start({ onUnhandledRequest: "bypass" });
}
```

`bypass` is deliberate — **hybrid mode**: only the endpoints we register are mocked; everything else (auth, existing CRUD) passes through to the real backend. Mock only what the backend lacks; check `docs/canon/tech-change-list.md` when unsure.

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
2. **Every handler carries a `CONTRACT` comment block** — method, route, params, request body type, response type, error cases. This is what gets lifted into the backend round:

```ts
// CONTRACT: GET /api/wallets
// query: ?includeArchived=boolean
// response: PagedResponse<WalletDto>
// errors: 401
```

3. **Routes follow the existing backend's REST conventions** (mirror the patterns already used in `services/api/`). Where no precedent exists, propose the route in the CONTRACT block — it becomes the spec.
4. **List endpoints use the standard paging envelope** (this is the contract the backend must implement — server-side paging is already a planned backend change):

```ts
interface PagedResponse<T> {
  items: T[];
  total: number;
  page: number; // 1-based
  pageSize: number;
}
// query params: page, pageSize, search, plus module-specific filters
```

5. **Realistic latency:** wrap responses in a small `delay(150–400ms)` so loading states are actually exercised.
6. **Error paths exist:** at minimum, 404 for missing ids and 400 with a field-keyed validation shape for invalid writes, so error UI is real, not theoretical.

## Seed data rules

1. In-memory and mutable within a session: a created wallet appears in the next list fetch; a payment changes the partner's mocked balance. Page reload resets — that's fine.
2. **Domain-consistent, always.** Mock data must obey `business-rules.md`: payment sources equal settling allocations; partner balances equal what their event history implies; stock never negative; refund quantities within original lines; immutable events have no updatable fields. The UI will be demoed to design partners on mocks — internally inconsistent numbers destroy exactly the trust the audit trail is supposed to create.
3. **Computed values are served, not client-computed** (CLAUDE.md hard rule 8): the mock computes partner balance, wallet balance, and "our money" server-side (i.e., inside the handler/data layer) and returns them in responses, same as the real backend will.
4. Realistic Russian-language names and UZS magnitudes, consistent with the Design sample-data style (e.g., products like «Мороженое пломбир 500г», amounts like 1 250 000).

## Lifecycle

- When the backend implements an endpoint: delete its handler and seed data, retest against the real API, and note the contract as "implemented" — the CONTRACT blocks for a module should be confirmed against the actual backend implementation in the backend round.
- Never let a mock and a real endpoint coexist for the same route; the handler's existence is the single switch.
