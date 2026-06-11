/// <reference types="vite/client" />

interface ImportMetaEnv {
	readonly VITE_OMBOR_API_BASE_URL?: string;
	readonly VITE_OMBOR_SENTRY_DSN?: string;
}

interface ImportMeta {
	readonly env: ImportMetaEnv;
}
