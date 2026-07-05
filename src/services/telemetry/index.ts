import { initPostHog } from "./posthog";
import { initSentry } from "./sentry";

export type { TelemetryUser } from "./analytics";
export { analytics } from "./analytics";
export type { AnalyticsEvent, AnalyticsEventProps } from "./events";
export { SentryRoutes } from "./sentry";

/**
 * Initialize both telemetry tools. Called once from src/index.tsx before the
 * app renders. Each tool independently no-ops when its key is absent — Netlify
 * supplies keys only in the Production deploy context
 * (docs/observability-analytics-plan.md §5).
 */
export function initTelemetry(): void {
	initSentry();
	initPostHog();
}
