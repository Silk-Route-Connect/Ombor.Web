import axios from "axios";
import { attachHttpAuthInterceptors } from "services/auth/httpAuthInterceptor";

import { attachHttpErrorInterceptors } from "./httpErrorInterceptor";
import { attachOfflineGuard } from "./httpOfflineInterceptor";

const baseURL = import.meta.env.VITE_OMBOR_API_BASE_URL;

if (!baseURL) {
	throw new Error("VITE_OMBOR_API_BASE_URL must be defined");
}

const http = axios.create({
	baseURL,
	headers: {
		"Content-Type": "application/json",
	},
	withCredentials: true,
});

attachHttpAuthInterceptors(http);
// Short-circuit requests while the device is offline (before they hit the
// network), so the browser doesn't throw and the backend-down toast can't flood.
attachOfflineGuard(http);
// Attached after the auth interceptor so it observes the final outcome of any
// 401 refresh/replay (Sentry reporting + backend-reachability tracking).
attachHttpErrorInterceptors(http);

export default http;
