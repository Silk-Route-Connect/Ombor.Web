import axios, { AxiosError } from "axios";
import { attachHttpAuthInterceptors } from "services/auth/httpAuthInterceptor";

const baseURL = process.env.REACT_APP_OMBOR_API_BASE_URL;

if (!baseURL) {
	throw new Error("REACT_APP_OMBOR_API_BASE_URL must be defined");
}

console.log("🌐 API Base URL:", baseURL);

const http = axios.create({
	baseURL,
	headers: {
		"Content-Type": "application/json",
	},
	// CRITICAL: This must be set at instance level
	withCredentials: true,
});

// Debug interceptor - REMOVE THIS AFTER DEBUGGING
http.interceptors.request.use((config) => {
	console.log("📤 Request:", {
		url: config.url,
		method: config.method,
		baseURL: config.baseURL,
		withCredentials: config.withCredentials,
		headers: config.headers,
	});
	return config;
});

http.interceptors.response.use(
	(res) => {
		console.log("📥 Response:", {
			url: res.config.url,
			status: res.status,
			headers: res.headers,
		});
		return res;
	},
	(error: AxiosError) => {
		console.error("❌ API Error:", {
			url: error.config?.url,
			status: error.response?.status,
			message: error.message,
		});
		return Promise.reject(error);
	},
);

attachHttpAuthInterceptors(http);

export default http;
