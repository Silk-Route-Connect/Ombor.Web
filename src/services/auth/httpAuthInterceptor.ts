import {
	AxiosError,
	AxiosHeaders,
	AxiosInstance,
	AxiosResponse,
	InternalAxiosRequestConfig,
} from "axios";

import { AuthTokenBridge } from "../auth/tokenBridge";

declare module "axios" {
	export interface InternalAxiosRequestConfig {
		skipAuth?: boolean;
		_retry?: boolean;
	}
}

const AUTH_ENDPOINTS = new Set<string>([
	"/api/auth/login",
	"/api/auth/register",
	"/api/auth/verification",
	"/api/auth/refresh-token",
	"/api/auth/logout",
]);

function isAuthEndpoint(url?: string): boolean {
	if (!url) {
		return false;
	}

	try {
		const parsed = new URL(url, "http://_");
		return AUTH_ENDPOINTS.has(parsed.pathname);
	} catch {
		return AUTH_ENDPOINTS.has(url);
	}
}

function isPrimitive(value: unknown): value is string | number | boolean {
	const type = typeof value;

	return type === "string" || type === "number" || type === "boolean";
}

function appendHeaderValue(headers: AxiosHeaders, key: string, value: unknown): void {
	if (Array.isArray(value)) {
		for (const item of value) {
			if (isPrimitive(item)) {
				headers.append(key, String(item));
			}
		}

		return;
	}

	if (isPrimitive(value)) {
		headers.set(key, String(value));
	}
}

function buildHeadersFromRecord(headers: AxiosHeaders, record: Record<string, unknown>): void {
	for (const [key, value] of Object.entries(record)) {
		if (value === undefined || value === null) {
			continue;
		}
		appendHeaderValue(headers, key, value);
	}
}

function toAxiosHeaders(input: unknown): AxiosHeaders {
	if (input instanceof AxiosHeaders) {
		return input;
	}

	const headers = new AxiosHeaders();

	if (input && typeof input === "object") {
		buildHeadersFromRecord(headers, input as Record<string, unknown>);
	}

	return headers;
}

let isRefreshing = false;
let refreshWaiters: Array<(token: string) => void> = [];
let refreshRejecters: Array<(err: Error) => void> = [];

function enqueueRefresh(): Promise<string> {
	return new Promise<string>((resolve, reject) => {
		refreshWaiters.push(resolve);
		refreshRejecters.push(reject);
	});
}

function resolveRefreshQueue(token: string): void {
	for (const resolve of refreshWaiters) {
		resolve(token);
	}

	refreshWaiters = [];
	refreshRejecters = [];
	isRefreshing = false;
}

function rejectRefreshQueue(err: Error): void {
	for (const reject of refreshRejecters) {
		reject(err);
	}

	refreshWaiters = [];
	refreshRejecters = [];
	isRefreshing = false;
}

function toError(e: unknown, fallbackMessage: string): Error {
	return e instanceof Error ? e : new Error(fallbackMessage);
}

function isUnauthorized(err: AxiosError): boolean {
	return err.response?.status === 401;
}

function shouldBypassRefreshFor(request: InternalAxiosRequestConfig): boolean {
	if (request._retry === true) {
		return true;
	}
	if (isAuthEndpoint(request.url)) {
		return true;
	}
	return false;
}

function applyBearerHeader(request: InternalAxiosRequestConfig, token: string | null): void {
	const headers = toAxiosHeaders(request.headers);
	if (token) {
		headers.set("Authorization", `Bearer ${token}`);
	}
	request.headers = headers;
}

async function performRefreshAndReplay(
	instance: AxiosInstance,
	request: InternalAxiosRequestConfig,
): Promise<AxiosResponse> {
	if (!isRefreshing) {
		isRefreshing = true;
		const newToken = await AuthTokenBridge.refreshAccessToken();
		resolveRefreshQueue(newToken);
	}

	const token = isRefreshing ? await enqueueRefresh() : (AuthTokenBridge.getAccessToken() ?? "");
	applyBearerHeader(request, token);

	return instance(request);
}

/* -------------------- Interceptors -------------------- */

export function attachHttpAuthInterceptors(instance: AxiosInstance): void {
	// REQUEST
	instance.interceptors.request.use((config: InternalAxiosRequestConfig) => {
		config.withCredentials = true;

		if (config.skipAuth === true || isAuthEndpoint(config.url)) {
			return config;
		}

		const token = AuthTokenBridge.getAccessToken();
		if (!token) {
			return config;
		}

		const headers = toAxiosHeaders(config.headers);
		if (!headers.has("Authorization")) {
			headers.set("Authorization", `Bearer ${token}`);
		}

		config.headers = headers;
		return config;
	});

	// RESPONSE
	instance.interceptors.response.use(
		(response: AxiosResponse) => {
			return response;
		},

		async (err: AxiosError) => {
			const request = err.config;

			if (!request) {
				throw toError(err, "HTTP error");
			}

			const unauthorized = isUnauthorized(err);
			const isAuth = isAuthEndpoint(request.url);

			if (isAuth) {
				throw toError(err, "HTTP error");
			}

			if (!unauthorized) {
				throw toError(err, "HTTP error");
			}

			if (request._retry === true) {
				AuthTokenBridge.onLogout("unauthorized");
				throw toError(err, "HTTP error");
			}

			request._retry = true;

			try {
				return await performRefreshAndReplay(instance, request);
			} catch (e: unknown) {
				const error = toError(e, "Token refresh failed");
				rejectRefreshQueue(error);

				// If refresh fails but we *do* have an access token (just logged in),
				// don't force-logout here; let the original request fail and UI decide.
				if (!AuthTokenBridge.getAccessToken()) {
					AuthTokenBridge.onLogout("refresh_failed");
				}

				throw error;
			}
		},
	);
}
