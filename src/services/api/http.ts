import axios from "axios";
import { attachHttpAuthInterceptors } from "services/auth/httpAuthInterceptor";

import { attachHttpErrorInterceptors } from "./httpErrorInterceptor";

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
// Attached after the auth interceptor so it observes the final outcome of any
// 401 refresh/replay (Sentry reporting + backend-reachability tracking).
attachHttpErrorInterceptors(http);

export default http;
