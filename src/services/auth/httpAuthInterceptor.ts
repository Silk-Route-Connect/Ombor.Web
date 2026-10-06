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

/**
 * The one refresh every concurrent 401 awaits (auth-12). A 401 arriving while it
 * is in flight joins it instead of queueing a waiter that a flushed queue would
 * never resolve; it is cleared when settled, so the next expiry refreshes again.
 */
let refreshInFlight: Promise<string> | null = null;
/** The failed refresh that already ended the session — logout fires once per failure. */
let sessionEndedBy: Promise<string> | null = null;

function refreshOnce(): Promise<string> {
	if (!refreshInFlight) {
		const refresh = AuthTokenBridge.refreshAccessToken();
		refreshInFlight = refresh;
		const clear = () => {
			if (refreshInFlight === refresh) {
				refreshInFlight = null;
			}
		};
		refresh.then(clear, clear);
	}
	return refreshInFlight;
}

function endSessionOnce(failedRefresh: Promise<string>): void {
	if (sessionEndedBy === failedRefresh) {
		return;
	}
	sessionEndedBy = failedRefresh;
	AuthTokenBridge.onLogout("refresh_failed");
}

function bearerOf(request: InternalAxiosRequestConfig): string | null {
	const value = toAxiosHeaders(request.headers).get("Authorization");
	return typeof value === "string" && value.startsWith("Bearer ") ? value.slice(7) : null;
}

function toError(e: unknown, fallbackMessage: string): Error {
	return e instanceof Error ? e : new Error(fallbackMessage);
}

function isUnauthorized(err: AxiosError): boolean {
	return err.response?.status === 401;
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
	const sentToken = bearerOf(request);
	const refresh = refreshOnce();

	let token: string;
	try {
		token = await refresh;
	} catch (e: unknown) {
		// A sign-in that completed while this request was out owns the session now —
		// only a refresh failure for the token this request used ends the session.
		const current = AuthTokenBridge.getAccessToken();
		if (!current || current === sentToken) {
			endSessionOnce(refresh);
		}
		throw toError(e, "Token refresh failed");
	}

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

			return performRefreshAndReplay(instance, request);
		},
	);
}
