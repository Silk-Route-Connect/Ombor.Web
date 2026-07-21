import posthog from "posthog-js";

let initialized = false;

/**
 * PostHog product analytics. Owns behavioral data only — session replay and
 * exception capture stay disabled because Sentry owns those jobs
 * (docs/observability-analytics-plan.md decision #3).
 *
 * Gated on the project key being present. Netlify supplies it only in the
 * Production deploy context, so previews/branch builds and local dev no-op.
 */
export function initPostHog(): void {
	const key = import.meta.env.VITE_OMBOR_POSTHOG_KEY;
	if (!key) {
		return;
	}

	posthog.init(key, {
		api_host: import.meta.env.VITE_OMBOR_POSTHOG_HOST ?? "https://us.i.posthog.com",
		defaults: "2025-05-24",
		// Track anonymous (pre-login) activity as full persons too; merged into
		// the identified person on login (plan decision #6).
		person_profiles: "always",
		autocapture: true,
		// SPA pageviews on history changes (also part of `defaults`, explicit
		// here because the tracking plan depends on it).
		capture_pageview: "history_change",
		capture_dead_clicks: true,
		// Sentry owns replay + errors — never enable these here.
		disable_session_recording: true,
		capture_exceptions: false,
	});

	posthog.register({
		environment: import.meta.env.VITE_OMBOR_ENVIRONMENT ?? import.meta.env.MODE,
		app_release: __APP_RELEASE__,
		app_locale: localStorage.getItem("ombor.locale") ?? "ru",
	});

	initialized = true;
}

export function isPostHogInitialized(): boolean {
	return initialized;
}
