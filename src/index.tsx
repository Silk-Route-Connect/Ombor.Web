import React from "react";
import ReactDOM from "react-dom/client";
import CssBaseline from "@mui/material/CssBaseline";
import { ThemeProvider } from "@mui/material/styles";
import * as Sentry from "@sentry/react";

import "./index.css";
import "./styles/global.scss";

import App from "./App";
import reportWebVitals from "./reportWebVitals";
import theme from "./theme";

Sentry.init({
	dsn: "https://84bb737c6cfcd8d390525efba2411f35@o4508670634557440.ingest.de.sentry.io/4509377451655248",
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

reportWebVitals();
