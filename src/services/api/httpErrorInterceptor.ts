import * as Sentry from "@sentry/react";
import { AxiosError, AxiosInstance, AxiosResponse } from "axios";
import { isConnectivityFailure } from "utils/apiError";

import { ConnectivityBridge } from "./connectivityBridge";
import { isOfflineError } from "./httpOfflineInterceptor";

/**
 * Cross-cutting error reporting for every API call (attached after the auth
 * interceptor so it sees the final outcome of refresh/replay):
 *
 *  - F-032: report handled backend errors to Sentry (so 4xx/5xx surface during
 *    the testing stage, not only unhandled crashes).
 *  - F-028: track backend reachability — only a real connectivity failure
 *    (no response, a timeout, a gateway 502 / 503 / 504) marks the backend down;
 *    a 500 from one endpoint is that endpoint's error, not an outage, and any
 *    received response marks it back up.
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
			// A request short-circuited because the device is offline, or cancelled
			// by its caller, is not a backend outage — the header indicator already
			// shows offline, and neither is a Sentry-worthy defect.
			if (isOfflineError(err) || err.code === AxiosError.ERR_CANCELED) {
				return Promise.reject(err);
			}

			const status = err.response?.status;
			const method = err.config?.method?.toUpperCase();
			const url = err.config?.url;
			const unreachable = isConnectivityFailure(err);

			if (unreachable) {
				ConnectivityBridge.reportDown();
			} else {
				ConnectivityBridge.reportUp();
			}

			// A 4xx is a user error the calling store shows by error code
			// (notifyApiError, form field errors, the page's not-found state), not a
			// defect, so it creates no Sentry event (the FE analog of the backend's
			// BeforeSend filter; a beforeSend hook drops any 4xx as a backstop).
			if (unreachable || (status != null && status >= 500)) {
				Sentry.captureException(err, {
					level: "error",
					tags: { httpStatus: status ?? "network", httpMethod: method },
					extra: { url },
				});
			}

			return Promise.reject(err);
		},
	);
}
