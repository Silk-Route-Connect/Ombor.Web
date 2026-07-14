import * as Sentry from "@sentry/react";
import { AxiosError, AxiosInstance, AxiosResponse } from "axios";

import { ConnectivityBridge } from "./connectivityBridge";

/**
 * Cross-cutting error reporting for every API call (attached after the auth
 * interceptor so it sees the final outcome of refresh/replay):
 *
 *  - F-032: report handled backend errors to Sentry (so 4xx/5xx surface during
 *    the testing stage, not only unhandled crashes).
 *  - F-028: track backend reachability — a network error or a 5xx marks the
 *    backend down; any received response marks it back up.
 *  - F-001: the expected cold-load `refresh-token` 401 (and auth-flow 401s in
 *    general) are NOT reported — they are normal and would only be noise.
 */
export function attachHttpErrorInterceptors(instance: AxiosInstance): void {
	instance.interceptors.response.use(
		(response: AxiosResponse) => {
			ConnectivityBridge.reportUp();
			return response;
		},

		(err: AxiosError) => {
			const status = err.response?.status;
			const method = err.config?.method?.toUpperCase();
			const url = err.config?.url;

			// No response at all ⇒ network/connectivity failure. A 5xx ⇒ the server
			// is reachable but failing. Both should warn the user and block mutations.
			const isNetworkError = !err.response;
			const isServerError = status != null && status >= 500;

			if (isNetworkError || isServerError) {
				ConnectivityBridge.reportDown();
				Sentry.captureException(err, {
					level: "error",
					tags: { httpStatus: status ?? "network", httpMethod: method },
					extra: { url },
				});
			} else {
				// A 4xx means the server answered — it's up. Client-caused 4xx
				// (validation, not-found, conflict, auth) are user errors surfaced
				// inline in the UI, not defects — they must not create Sentry events
				// (the FE analog of the backend's BeforeSend filter). 5xx/network
				// still report above; a beforeSend hook drops any 4xx as a backstop.
				ConnectivityBridge.reportUp();
			}

			return Promise.reject(err);
		},
	);
}
