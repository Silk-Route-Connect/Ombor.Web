import React from "react";
import ReactDOM from "react-dom/client";
import * as Sentry from "@sentry/react";

import CssBaseline from "@mui/material/CssBaseline";
import { ThemeProvider } from "@mui/material/styles";

import App from "./App";
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

Sentry.init({
	dsn: import.meta.env.VITE_OMBOR_SENTRY_DSN,
	// Setting this option to true will send default PII data to Sentry.
	// For example, automatic IP address collection on events
	sendDefaultPii: true,
});

const root = ReactDOM.createRoot(document.getElementById("root") as HTMLElement);

root.render(
	<React.StrictMode>
		<ThemeProvider theme={theme}>
			<CssBaseline />
			<App />
		</ThemeProvider>
	</React.StrictMode>,
);
