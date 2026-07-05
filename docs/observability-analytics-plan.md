# Observability & Analytics Integration Plan — Sentry + PostHog

> **Living document.** Claude keeps this updated: ticking tasks as they land, logging
> findings/issues at the bottom, and revising decisions when they change. Miraziz and
> Claude both track progress here.
>
> **Status legend:** `[ ]` todo · `[~]` in progress · `[x]` done · `[!]` blocked (see Open Questions)
>
> **Last updated:** 2026-07-05 · **Branch:** `redesign/bug-fixes` · **Owner:** Miraziz

---

## 1. Goal

Stand up production observability and product analytics for the Ombor web client before
release. Two tools, two clean jobs:

- **Sentry** — crashes, unhandled exceptions, handled API errors, performance tracing, and
  **session replay** (replay is owned by Sentry, tied to errors).
- **PostHog** — product analytics: who uses what, which flows convert, where users get stuck.
  Answers "which features are used and how easy is the app to use."

No overlap: PostHog's own error-capture and replay stay **off** so each tool owns one job.

---

## 2. Verified environment (both MCPs live — 2026-07-05)

| | Sentry | PostHog |
|---|---|---|
| Status | ✅ connected via MCP | ✅ connected via MCP |
| Org | `silk-route-connect` | `Ombor` |
| Project | **`ombor-web`** (exists already; `ombor-api` is the backend) | **Default project** (id `484526`) |
| Region | **EU** — `https://de.sentry.io` | **US** — `us.posthog.com` (ingest `us.i.posthog.com`) |
| Current state | SDK installed + bare `init` + HTTP-error reporting already wired | Greenfield — no SDK, no custom events flowing |

> ⚠️ Region split (Sentry EU / PostHog US) is intentional-by-accident; fine for beta, note it
> for any future data-residency requirement.

### What already exists in the repo (Sentry)
- `@sentry/react@9` + `@sentry/cli` in `package.json`.
- `Sentry.init({ dsn, sendDefaultPii: true })` in `src/index.tsx` — **bare**: no replay, no
  tracing, no `environment`, no `release`, no ErrorBoundary, no source maps.
- `src/services/api/httpErrorInterceptor.ts` already reports handled 4xx (warning) / 5xx +
  network (error) to Sentry and correctly skips auth 401s. **Keep as-is.**
- `VITE_OMBOR_SENTRY_DSN` declared in `.env.example` + `src/vite-env.d.ts` (currently empty).

---

## 3. Locked decisions (from planning discussion, 2026-07-05)

1. **Production only.** Telemetry initializes only in production builds with keys present.
   Local dev + mock runs stay silent. Revisit (all environments) when on a paid plan.
2. **Beta = capture maximally.** Friends-only beta; prioritize data richness over privacy for
   now. Replay records visible content, `sendDefaultPii: true` stays, PostHog captures inputs.
   **One exception:** password inputs stay masked in replay (security, zero product value).
   **Before GA:** a hardening pass locks down PII (see task group F). This is a tracked debt.
3. **Sentry owns session replay.** PostHog replay + PostHog exception autocapture disabled.
4. **Plan-first.** This doc is the tracking plan; instrumentation follows the taxonomy in §7,
   built in the phases in §6, ticked here step by step.
5. **All config via env → Netlify environment variables** (Production deploy context). Claude
   supplied the full key list + values (§5); Miraziz sets them, including `SENTRY_AUTH_TOKEN`
   (confirmed 2026-07-05 — he will create + add it).
6. **PostHog `person_profiles: 'always'`** (confirmed 2026-07-05) — capture both anonymous
   (pre-login) and identified activity; anonymous events merge into the person on `identify`.

---

## 4. Architecture — where the code lives

New service module `src/services/telemetry/` (follows the existing `services/` convention):

| File | Responsibility |
|---|---|
| `sentry.ts` | `initSentry()` — the full `Sentry.init`; exports the Router-wrapped `Routes` + `ErrorBoundary` helpers. |
| `posthog.ts` | `initPostHog()` — creates + configures the `posthog-js` instance. |
| `analytics.ts` | Thin facade: `capture(event, props)`, `identify(user)`, `reset()`. Domain code imports **this**, never `posthog-js` directly. No-ops when telemetry is disabled. Also mirrors user context into `Sentry.setUser`. |
| `events.ts` | Typed event-name constants + a discriminated union of event → props, so event calls are type-checked (no stringly-typed typos; matches the strict-TS repo). |
| `index.ts` | Barrel + a single `initTelemetry()` called once from `src/index.tsx`. |

**Gating:** `initTelemetry()` initializes Sentry only when the DSN is present and PostHog only
when the key is present. Netlify supplies those keys **only in the Production deploy context**,
so Deploy Previews, branch deploys, and local `npm run dev` all no-op automatically. `analytics.*`
is a safe no-op when uninitialized, so domain code can call it unconditionally.

**User identification:** wire `analytics.identify()` at the three points in `AuthStore` where a
user becomes authenticated (`enterWithTokens`, `bootstrap`, `refresh`) and `analytics.reset()`
in `logout()`. `distinct_id` = the JWT `nameidentifier` claim (`user.id`) — stable, not PII.

---

## 5. Env & secrets reference — Netlify (hand-off to Miraziz)

Netlify runs `vite build` on deploy. Vars set in **Site configuration → Environment variables**
are available to the build; Vite bakes any `VITE_`-prefixed var into the client bundle (a
process-env `VITE_` var overrides the committed `.env.production`). Two things to know:

- **Scope to the Production deploy context only.** This is how "production only" (decision #1)
  is enforced: Deploy Previews / branch deploys don't get the keys, so telemetry no-ops there
  automatically — no code change needed. (All Netlify builds run in Vite "production" mode, so
  `import.meta.env.PROD` alone can't distinguish them — **context scoping is the real gate.**)
- **Build-time, not runtime.** Static SPA: values are frozen into the bundle at build, so
  changing a var requires a redeploy to take effect.

### 5a. Client vars — `VITE_`-prefixed (baked into the bundle; public, not secret)

| Variable | Value |
|---|---|
| `VITE_OMBOR_SENTRY_DSN` | `https://84bb737c6cfcd8d390525efba2411f35@o4508670634557440.ingest.de.sentry.io/4509377451655248` |
| `VITE_OMBOR_POSTHOG_KEY` | `phc_zANZf293G6jYUdPfHFUMPWGxvxJdQfayyqfypaFjCV22` |
| `VITE_OMBOR_POSTHOG_HOST` | `https://us.i.posthog.com` |
| `VITE_OMBOR_ENVIRONMENT` | `production` |

> **Release** is auto-derived from Netlify's built-in `COMMIT_REF` (the deploy's git SHA) in the
> build config — no manual var. The Sentry vite-plugin injects it for error/replay tagging +
> source-map association; PostHog reads the same value (via a Vite `define`) as an `app_release`
> super-property.

### 5b. Build-only secrets — **NOT** `VITE_`-prefixed (source-map upload; never shipped to client)

| Variable | Value |
|---|---|
| `SENTRY_AUTH_TOKEN` | *(you create it — Sentry → Settings → Auth Tokens, scopes `project:releases` + `org:read`)* |
| `SENTRY_ORG` | `silk-route-connect` |
| `SENTRY_PROJECT` | `ombor-web` |
| `SENTRY_URL` | `https://de.sentry.io` |

> `SENTRY_URL` is **required** — the org is on the EU region and the plugin defaults to US
> (would 404 without it). These four are read only by the build; they never reach the client.
> `.env.example` + `src/vite-env.d.ts` document 5a; 5b lives only in Netlify.

> **Adjacent (not part of this task, but flagged):** the committed `.env.production` sets
> `VITE_OMBOR_API_BASE_URL=http://localhost:5062` — that won't work on the hosted site. Ensure
> the Netlify Production context sets the real backend URL and `VITE_ENABLE_MOCKS=false`.

---

## 6. Task checklist (phased)

### Phase A — Telemetry scaffold
- [x] Create `src/services/telemetry/` module (sentry.ts, posthog.ts, analytics.ts, events.ts, index.ts)
- [x] Add `initTelemetry()` gating (keys present) and no-op fallback — `analytics.*` is safe to call unconditionally
- [x] Update `src/vite-env.d.ts` with the new `VITE_OMBOR_*` vars (+ `__APP_RELEASE__` declaration)
- [x] Update `.env.example` documenting the new vars (values blank)
- [x] Expose the build release (Netlify `COMMIT_REF`) to the client via a Vite `define` so PostHog can tag `app_release`

### Phase B — Sentry upgrade
- [x] Expand `Sentry.init`: `reactRouterV7BrowserTracingIntegration` + `replayIntegration`, `environment`, `release`, sample rates (`src/services/telemetry/sentry.ts`)
- [x] Replay config for beta: `maskAllText: false`, `maskAllInputs: false`, `blockAllMedia: false`, **but** `mask: ['input[type="password"]']`
- [x] Sample rates for low-traffic beta: `tracesSampleRate: 1.0`, `replaysSessionSampleRate: 1.0`, `replaysOnErrorSampleRate: 1.0`
- [x] Wrap `<Routes>` with `Sentry.withSentryReactRouterV7Routing` — `SentryRoutes` created once at module scope, aliased in `src/App.tsx`
- [x] Wrap the app in `Sentry.ErrorBoundary` with a themed Russian fallback (`components/shared/ErrorFallback`, `common.errorBoundary.*` keys)
- [x] Keep the existing `httpErrorInterceptor` reporting unchanged
- [x] Add `@sentry/vite-plugin` to `vite.config.ts` (runs only when `SENTRY_AUTH_TOKEN` present; `release.name` = `COMMIT_REF`; `url` = `SENTRY_URL` for EU; hidden source maps, deleted from dist after upload)

### Phase C — PostHog install + init
- [x] `npm i posthog-js` (+ `@sentry/vite-plugin` as devDependency)
- [x] `initPostHog()` with key + US host; `person_profiles: 'always'` (decision #6); `defaults: '2025-05-24'`
- [x] Disable overlap: `autocapture: true`, SPA pageviews on history change, **`disable_session_recording: true`** (Sentry owns replay), **`capture_exceptions: false`**
- [x] Register super properties: `environment`, `app_release`, `app_locale`
- [x] Module singleton via the `analytics` facade (`services/telemetry/analytics.ts`) — domain code never imports `posthog-js` directly

### Phase D — User identification
- [x] `analytics.identify()` in `AuthStore.enterWithTokens` / `bootstrap` / `refresh` (distinct_id = JWT user id)
- [x] `analytics.reset()` in `AuthStore.logout` (after `user_logged_out` fires, while identity is still attached)
- [x] Person props: `name`, `phone`, `organization` (beta max-capture); mirrored into `Sentry.setUser`

### Phase E — Domain event instrumentation (P0 — see §7; sites pinned by a 6-agent discovery workflow)
- [x] Auth events — `user_signed_up` (verifyOtp = backend confirmation; welcome commit doesn't double-fire), `user_logged_in` (login() only — enterWithTokens is shared with register), `user_logged_out` (guarded to authenticated sessions), `password_reset_completed`
- [x] Money flows — `sale_created`/`supply_created` (POS component, incl. `from_template` + `payment_kind`/`has_settlement`/`overpayment_disposition`), `transaction_refunded` (TransactionStore), `payment_recorded` (PaymentStore; POS settlement confirmed NOT to double-fire — it's embedded in the transaction request)
- [x] Orders — `order_created` (OrderStore.create), `order_status_changed` (runTransition now takes `id`, reads pre-transition status for `from_status`)
- [x] Stock — `stock_adjustment_created` (direction + reason; single-product op so no line_count), `stock_transfer_created`, `wallet_transfer_created`
- [x] Friction — `form_validation_failed` on new_sale/new_supply/new_order (manual validation), payment_create (RHF onInvalid + over-withdraw), login/register
- [ ] P1/P2 events (see §7) — later batches; RHF entity modals (product/partner/etc.) join `form_validation_failed` then

### Phase F — Netlify env + pre-GA hardening
- [ ] Miraziz: set the §5a + §5b vars in Netlify, **scoped to the Production deploy context**
- [ ] Miraziz: create `SENTRY_AUTH_TOKEN`
- [ ] Miraziz: confirm the Netlify Production context has the real `VITE_OMBOR_API_BASE_URL` (not localhost) + `VITE_ENABLE_MOCKS=false`
- [ ] **Pre-GA debt:** re-enable replay masking, reconsider `sendDefaultPii`, review PII in event props + person properties (tracked from decision #2)

### Phase G — Live verification (before declaring done)
- [ ] Prod build → trigger a test exception → confirm it lands in Sentry with a **source-mapped** stack
- [ ] Confirm the error has a **linked session replay**
- [ ] Confirm `$pageview` + one custom event land in PostHog live events
- [ ] Confirm `identify` links events to the logged-in user (distinct_id = user id)
- [x] Confirm a **dev build sends nothing** to either tool — verified live 2026-07-05: app boots + routes render against the real backend with zero requests to `*.sentry.io` / `*.posthog.com`, clean console
- [ ] Confirm a performance transaction is named by route (not a generic URL)

---

## 7. PostHog tracking plan (event taxonomy)

**Naming:** `snake_case`, `entity_action`. **Autocaptured (no code):** `$pageview`,
`$autocapture` (clicks), `$rageclick`, `$dead_click`, `$web_vitals`.

**Standard person properties** (set on `identify`): `name`, `phone`, `organization`.
**Standard super properties** (every event): `environment`, `app_release`, `app_locale`.

### P0 — launch-critical

| Event | Fires when | Key properties |
|---|---|---|
| `user_signed_up` | Registration completed (welcome step) | — |
| `user_logged_in` | Login success | — |
| `user_logged_out` | Logout | — |
| `password_reset_completed` | Reset flow success | — |
| `sale_created` | New Sale POS submits | `line_count`, `subtotal`, `discount`, `total`, `from_template`, `has_attachments`, `payment_kind` (none/change/advance) |
| `supply_created` | New Supply POS submits | `line_count`, `subtotal`, `discount`, `total`, `from_template` |
| `transaction_refunded` | Refund created | `direction`, `line_count`, `total`, `original_id` |
| `payment_recorded` | Standalone payment created | `payment_type` (Оплата/Депозит/Вывод/Зарплата/Общий), `direction`, `amount`, `has_settlement`, `wallet_type` |
| `order_created` | New Order created | `source`, `line_count`, `total`, `has_delivery_time` |
| `order_status_changed` | process/ship/deliver/cancel/reject/return | `from_status`, `to_status` |
| `stock_adjustment_created` | Adjustment created | `direction` (Increase/Decrease), `line_count` |
| `stock_transfer_created` | Stock transfer created | `line_count` |
| `wallet_transfer_created` | Inter-wallet transfer | — |
| `form_validation_failed` | On-submit inline validation fails (any modal/POS) | `form`, `field_count`, `first_field` |

### P1 — soon after launch

| Event | Fires when | Key properties |
|---|---|---|
| `product_created` / `_updated` / `_archived` | Product mutations | `product_type` |
| `partner_created` / `_updated` / `_archived` | Partner mutations | `partner_type` |
| `warehouse_created` / `category_created` / `employee_created` | Master-data create | — |
| `employee_terminated` / `payroll_paid` | Employee lifecycle / payroll | — |
| `template_created` / `_updated` / `template_used` | Template mutations + load-into-POS | `direction`, `line_count` |
| `wallet_created` / `opening_stock_set` | Wallet + stock setup | — |
| `csv_exported` | Any CSV export | `module`, `row_count` |
| `bulk_discount_applied` | POS bulk discount | `discount_type` (percent/fixed), `value` |
| `language_changed` | Locale switch | `locale` |
| `dashboard_period_changed` / `dashboard_kpi_clicked` | Dashboard interactions | `period` / `kpi` |
| `settings_organization_saved` / `user_invited` | Settings | — |

### P2 — deeper engagement / long-tail

| Event | Fires when | Key properties |
|---|---|---|
| `pos_over_stock_blocked` | Sale cart hard-blocks over-stock | `product_id` |
| `pos_keyboard_shortcut_used` | POS shortcut used | `shortcut` |
| `backend_offline_shown` | OfflineBanner appears | — |
| `detail_tab_switched` / `filter_applied` | Navigation micro-interactions | `tab` / `filter` |

---

## 8. Open questions / blockers

1. **✅ Resolved — deploy is Netlify, not a CI pipeline.** Env vars go in Netlify Site config
   (§5), scoped to the Production context. Netlify runs `vite build`, so the Sentry source-map
   upload runs there via the vite-plugin. No workflow file needed.
2. **✅ Resolved** — `person_profiles: 'always'` (decision #6, confirmed 2026-07-05).
3. **✅ Resolved** — Miraziz will create + add `SENTRY_AUTH_TOKEN` (confirmed 2026-07-05).

---

## 9. Findings & issues log (running)

- **2026-07-05** — Both MCPs verified live. Sentry `ombor-web` project already exists; SDK
  already installed with a bare init + HTTP-error reporting. PostHog is greenfield. DSN fetched
  via MCP (§5a).
- **2026-07-05** — Deploy target clarified: **Netlify** (not a static-file CI pipeline). §5
  reworked as Netlify env vars scoped to the Production context; the missing-CI-file blocker is
  resolved. Release auto-derived from Netlify `COMMIT_REF`.
- **2026-07-05** — Phases A–E implemented. Discovery workflow (6 read-only agents) pinned every
  P0 capture site; notable confirmations: POS settlement is embedded in the transaction request
  (no `payment_recorded` double-fire), `user_signed_up` belongs at `verifyOtp` (backend
  confirmation) not the welcome commit, stock adjustments are single-product (event carries
  `reason` instead of `line_count`). `npm run validate` clean; prod build clean.
- **2026-07-05** — Bundle: main chunk 850 kB min / 244 kB gzip (grew from Sentry replay +
  posthog-js; the >500 kB chunk warning predates this work). Fine for beta; code-splitting is a
  separate task if it ever matters.
- **2026-07-05** — ⚠️ Quota watch: `replaysSessionSampleRate: 1.0` records EVERY session. On the
  Sentry free tier the replay quota is small (~50/mo) — fine for friends-only beta, but if the
  quota exhausts, drop session sampling to e.g. 0.1 and keep `replaysOnErrorSampleRate: 1.0`
  (error replays are the ones that matter).
- **2026-07-05** — Adversarial review (3 lenses → skeptic-verified per finding) found **3 real
  defects, 0 false positives**, all fixed + re-validated:
  1. **[major] Sentry route instrumentation was permanently inert.** `SentryRoutes =
     withSentryReactRouterV7Routing(Routes)` evaluated at import time, *before* `Sentry.init()`
     ran — so the SDK froze it to a plain `Routes` and never named transactions/replays by route
     (e.g. `/partners/:id`), even in prod. **Fix:** `initSentry()` is now idempotent and called
     at `sentry.ts` module load, before the wrap. (This was the highest-value catch — it silently
     defeated a core Sentry feature.)
  2. **[major] `payment_recorded.has_settlement`** counted *any* allocation (incl. AdvanceCredit /
     ChangeReturn), so Deposits + advance-only payments falsely read as settlements. **Fix:** keys
     off `allocationType === "TransactionSettlement"` (now consistent with the POS event).
  3. **[major] Payroll from the employee-detail «Выплатить»** (the primary payroll flow, via
     `PayrollStore.create`) fired no `payment_recorded` — only the Payments-page path did. **Fix:**
     `PayrollStore.create` now fires it (`payment_type: "Payroll"`, Expense, `has_settlement:false`).
