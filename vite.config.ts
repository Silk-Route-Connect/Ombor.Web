import { sentryVitePlugin } from "@sentry/vite-plugin";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

// Netlify injects COMMIT_REF (the deploy's git SHA); local builds get "dev".
// Baked into the client as __APP_RELEASE__ and used as the Sentry release so
// errors/replays map to the exact commit + uploaded source maps.
const release = process.env.COMMIT_REF ?? "dev";

// Source maps are generated + uploaded only where the token exists (Netlify
// Production). The maps are for Sentry alone and are deleted from dist after
// upload — never published with the site.
const sentryAuthToken = process.env.SENTRY_AUTH_TOKEN;

export default defineConfig({
	plugins: [
		react(),
		...(sentryAuthToken
			? [
					sentryVitePlugin({
						org: process.env.SENTRY_ORG,
						project: process.env.SENTRY_PROJECT,
						authToken: sentryAuthToken,
						// EU-region org — the plugin defaults to the US instance.
						url: process.env.SENTRY_URL,
						release: { name: release },
						sourcemaps: {
							filesToDeleteAfterUpload: ["./dist/**/*.map"],
						},
						telemetry: false,
					}),
				]
			: []),
	],
	define: {
		__APP_RELEASE__: JSON.stringify(release),
	},
	resolve: {
		tsconfigPaths: true,
	},
	server: {
		// PORT lets a second instance (e.g. preview tooling) run alongside the
		// default dev server on 3000.
		port: Number(process.env.PORT) || 3000,
	},
	build: {
		outDir: "dist",
		// "hidden": maps without sourceMappingURL comments, for the upload only.
		sourcemap: sentryAuthToken ? "hidden" : false,
	},
});
