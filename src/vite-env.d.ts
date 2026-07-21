/// <reference types="vite/client" />

/** Build release id — Netlify COMMIT_REF baked in via Vite define (vite.config.ts). */
declare const __APP_RELEASE__: string;

interface ImportMetaEnv {
	readonly VITE_OMBOR_API_BASE_URL?: string;
	/** Sentry DSN — errors/tracing/replay no-op when absent (prod-only telemetry). */
	readonly VITE_OMBOR_SENTRY_DSN?: string;
	/** PostHog project API key — analytics no-op when absent (prod-only telemetry). */
	readonly VITE_OMBOR_POSTHOG_KEY?: string;
	/** PostHog ingestion host; defaults to https://us.i.posthog.com. */
	readonly VITE_OMBOR_POSTHOG_HOST?: string;
	/** Telemetry environment tag; defaults to the Vite mode. */
	readonly VITE_OMBOR_ENVIRONMENT?: string;
	/** "true" enables the MSW mock layer (src/mocks) — see docs/mocking.md. */
	readonly VITE_ENABLE_MOCKS?: string;
}

interface ImportMeta {
	readonly env: ImportMetaEnv;
}
