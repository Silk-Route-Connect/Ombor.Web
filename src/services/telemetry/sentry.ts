import React from "react";
import {
	createRoutesFromChildren,
	matchRoutes,
	Routes,
	useLocation,
	useNavigationType,
} from "react-router-dom";
import * as Sentry from "@sentry/react";

let initialized = false;

/**
 * Full production Sentry setup: error capture, performance tracing keyed to
 * React Router v7 routes, and session replay (Sentry owns replay — PostHog's
 * recorder stays off, see docs/observability-analytics-plan.md decision #3).
 *
 * Gated on the DSN being present. Netlify supplies it only in the Production
 * deploy context, so previews/branch builds and local dev no-op automatically.
 */
export function initSentry(): void {
	if (initialized) {
		return;
	}
	const dsn = import.meta.env.VITE_OMBOR_SENTRY_DSN;
	if (!dsn) {
		return;
	}

	Sentry.init({
		dsn,
		environment: import.meta.env.VITE_OMBOR_ENVIRONMENT ?? import.meta.env.MODE,
		release: __APP_RELEASE__,
		// Beta max-capture (plan decision #2); revisit before GA.
		sendDefaultPii: true,
		integrations: [
			Sentry.reactRouterV7BrowserTracingIntegration({
				useEffect: React.useEffect,
				useLocation,
				useNavigationType,
				createRoutesFromChildren,
				matchRoutes,
			}),
			Sentry.replayIntegration({
				// Beta max-capture: content visible in replays. Passwords are the
				// one exception — recording credentials is a liability with zero
				// product value (plan decision #2).
				maskAllText: false,
				maskAllInputs: false,
				blockAllMedia: false,
				mask: ['input[type="password"]'],
			}),
		],
		// Friends-only beta traffic — record everything; tune down when volume
		// or plan quotas demand it.
		tracesSampleRate: 1.0,
		replaysSessionSampleRate: 0.1,
		replaysOnErrorSampleRate: 1.0,
	});

	initialized = true;
}

export function isSentryInitialized(): boolean {
	return initialized;
}

// CRITICAL ORDER: withSentryReactRouterV7Routing() below decides — once, at
// call time — whether to return the instrumented wrapper or a plain `Routes`,
// based on router hooks that only exist AFTER Sentry.init() runs its tracing
// integration setup. So init MUST run before the wrap is evaluated. This module
// is imported (via App.tsx) before index.tsx's body calls initTelemetry(), so
// we init here at module load. initSentry() is idempotent; the later
// initTelemetry() call is a no-op. Without this the wrapper freezes to a plain
// Routes and route-named transactions/replays never activate — even in prod.
initSentry();

/**
 * `Routes` wrapped with Sentry's route-change instrumentation so transactions
 * and replays are named by route pattern (e.g. /partners/:id), not raw URLs.
 * Created once at module scope (re-wrapping per render would remount the tree).
 * Behaves as a plain `Routes` when Sentry isn't initialized.
 */
export const SentryRoutes = Sentry.withSentryReactRouterV7Routing(Routes);
