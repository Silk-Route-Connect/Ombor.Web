/// <reference types="vite/client" />

interface ImportMetaEnv {
	readonly VITE_OMBOR_API_BASE_URL?: string;
	readonly VITE_OMBOR_SENTRY_DSN?: string;
	/** "true" enables the MSW mock layer (src/mocks) — see docs/mocking.md. */
	readonly VITE_ENABLE_MOCKS?: string;
}

interface ImportMeta {
	readonly env: ImportMetaEnv;
}
