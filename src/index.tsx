import React from "react";
import ReactDOM from "react-dom/client";
import * as Sentry from "@sentry/react";

import CssBaseline from "@mui/material/CssBaseline";
import { ThemeProvider } from "@mui/material/styles";

import App from "./App";
import ErrorFallback from "./components/shared/ErrorFallback/ErrorFallback";
import { initTelemetry } from "./services/telemetry";
import theme from "./theme";

import "@fontsource/onest/400.css";
import "@fontsource/onest/500.css";
import "@fontsource/onest/600.css";
import "@fontsource/onest/700.css";
import "./index.css";
import "./styles/global.scss";

// Safety net only — modules that call i18next.t at import time must import
// the configured instance from "i18n/config" themselves.
import "./i18n/config";

// Sentry (errors/tracing/replay) + PostHog (product analytics). Each no-ops
// when its key is absent — Netlify supplies keys only in the Production
// deploy context (docs/observability-analytics-plan.md).
initTelemetry();

async function enableMocking(): Promise<void> {
	if (import.meta.env.VITE_ENABLE_MOCKS !== "true") {
		return;
	}

	const { worker } = await import("./mocks/browser");
	// `bypass`: only registered endpoints are mocked; everything else passes
	// through to the real backend (hybrid mode — see docs/mocking.md).
	await worker.start({ onUnhandledRequest: "bypass" });
}

const root = ReactDOM.createRoot(document.getElementById("root") as HTMLElement);

enableMocking().then(() => {
	root.render(
		<React.StrictMode>
			<ThemeProvider theme={theme}>
				<CssBaseline />
				{/* Last-resort boundary: reports the crash and shows a themed
				    fallback instead of a blank screen. Works uninitialized too. */}
				<Sentry.ErrorBoundary fallback={<ErrorFallback />}>
					<App />
				</Sentry.ErrorBoundary>
			</ThemeProvider>
		</React.StrictMode>,
	);
});
