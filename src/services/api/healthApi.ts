import axios from "axios";
import { isConnectivityFailure } from "utils/apiError";

import http from "./http";

/** What one liveness probe proved about the backend. */
export type HealthProbe = "up" | "down" | "inconclusive";

const PROBE_TIMEOUT_MS = 5_000;

/**
 * Pings the API's anonymous liveness endpoint (`GET /health`, mapped at the API
 * root beside `/api`, URL built from the same base as every call). It goes out
 * on a bare axios call, not the app's `http` instance, so a probe never refreshes
 * a token, reports to Sentry or feeds the connectivity interceptor — the
 * `ConnectivityStore` reads the result itself.
 *
 * Only a 2xx proves the backend is back, and only a connectivity failure (no
 * response, a timeout, a gateway 502–504) proves it is down; any other answer
 * proves neither, so a misrouted `/health` can never fake an outage or a recovery.
 */
export async function probeHealth(): Promise<HealthProbe> {
	try {
		await axios.get(http.getUri({ url: "/health" }), { timeout: PROBE_TIMEOUT_MS });
		return "up";
	} catch (err) {
		return isConnectivityFailure(err) ? "down" : "inconclusive";
	}
}
