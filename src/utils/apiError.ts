import axios, { AxiosError } from "axios";
import i18next from "i18n/config";
import { isOfflineError } from "services/api/httpOfflineInterceptor";

import { formatCurrency, formatQuantity } from "./formatCurrency";

export type ApiErrorKind =
	| "network"
	| "server"
	| "unauthorized"
	| "forbidden"
	| "notFound"
	| "conflict"
	| "validation"
	| "rateLimited"
	| "unknown";

/** A failed API call reduced to what the UI may act on — never the raw server text. */
export interface ApiErrorInfo {
	kind: ApiErrorKind;
	status?: number;
	/** Machine-readable domain code (backend-contracts/conventions.md → Error codes). */
	code?: string;
	params: Record<string, unknown>;
	/** Field errors keyed by the server's PascalCase property name (`"SKU"`, `"PhoneNumber"`). */
	fieldErrors: Record<string, string[]>;
}

/**
 * Codes the UI has localized text for (`common.apiError.<code>`). Anything else
 * falls back to the caller's generic message — server `detail`/`errors` text is
 * English developer text and is never shown.
 */
const KNOWN_CODES = new Set([
	"auth.invalid_credentials",
	"auth.phone_taken",
	"auth.email_taken",
	"auth.telegram_taken",
	"auth.code_invalid",
	"auth.code_expired",
	"auth.too_many_attempts",
	"auth.rate_limited",
	"auth.account_deactivated",
	"auth.session_expired",
	"auth.current_password_invalid",
	"stock.insufficient",
	"wallet.insufficient_balance",
	"payment.direction_mismatch",
	"file.invalid",
	"file.too_large",
	"entity.referenced",
	"conflict.duplicate",
	"entity.not_found",
	"validation.failed",
]);

/**
 * A domain failure the server returned inside a 200 body (`success: false` +
 * `code`, e.g. verify-reset-code). Thrown so callers map it exactly like a
 * ProblemDetails `code`.
 */
export class ApiCodeError extends Error {
	readonly code: string | undefined;

	constructor(code: string | undefined, message?: string) {
		super(message ?? code ?? "Request failed");
		this.name = "ApiCodeError";
		this.code = code;
	}
}

type ProblemBody = {
	code?: unknown;
	params?: unknown;
	errors?: unknown;
};

/**
 * Gateway statuses: a proxy in front of the API answered because the API itself
 * is unreachable or timed out — a connectivity failure, not a server bug.
 */
const GATEWAY_STATUSES = new Set([502, 503, 504]);

function kindFromStatus(status: number): ApiErrorKind {
	if (GATEWAY_STATUSES.has(status)) return "network";
	if (status >= 500) return "server";
	if (status === 401) return "unauthorized";
	if (status === 403) return "forbidden";
	if (status === 404) return "notFound";
	if (status === 409) return "conflict";
	if (status === 429) return "rateLimited";
	if (status === 400 || status === 422) return "validation";
	return "unknown";
}

function asRecord(value: unknown): Record<string, unknown> {
	return value !== null && typeof value === "object" && !Array.isArray(value)
		? (value as Record<string, unknown>)
		: {};
}

function asFieldErrors(value: unknown): Record<string, string[]> {
	const out: Record<string, string[]> = {};
	for (const [key, messages] of Object.entries(asRecord(value))) {
		if (Array.isArray(messages)) {
			out[key] = messages.filter((m): m is string => typeof m === "string");
		}
	}
	return out;
}

/** Reads ProblemDetails `code` / `params` / `errors` off a failed call (any thrown value). */
export function parseApiError(cause: unknown): ApiErrorInfo {
	if (isOfflineError(cause)) {
		return { kind: "network", params: {}, fieldErrors: {} };
	}
	if (cause instanceof ApiCodeError) {
		return { kind: "validation", code: cause.code, params: {}, fieldErrors: {} };
	}
	if (!axios.isAxiosError(cause)) {
		return { kind: "unknown", params: {}, fieldErrors: {} };
	}
	if (!cause.response) {
		return { kind: "network", params: {}, fieldErrors: {} };
	}

	const status = cause.response.status;
	const body = asRecord(cause.response.data) as ProblemBody;
	return {
		kind: kindFromStatus(status),
		status,
		code: typeof body.code === "string" ? body.code : undefined,
		params: asRecord(body.params),
		fieldErrors: asFieldErrors(body.errors),
	};
}

/**
 * True when the backend could not be reached at all: no response (network error,
 * timeout) or a gateway 502 / 503 / 504. A cancelled request is not one, and
 * neither is a 500 — that endpoint failed, the server itself answered.
 */
export function isConnectivityFailure(cause: unknown): boolean {
	if (!axios.isAxiosError(cause) || cause.code === AxiosError.ERR_CANCELED) {
		return false;
	}
	return !cause.response || GATEWAY_STATUSES.has(cause.response.status);
}

/** True when the call failed because the record does not exist (404). */
export function isNotFoundError(cause: unknown): boolean {
	return parseApiError(cause).kind === "notFound";
}

/** «42 сек.», «15 мин.» for a login lockout, «3 ч.» for the daily SMS cap — rounded up. */
export function formatWait(seconds: number): string {
	if (seconds < 60) {
		return i18next.t("common.duration.seconds", { count: Math.ceil(seconds) });
	}
	if (seconds < 3600) {
		return i18next.t("common.duration.minutes", { count: Math.ceil(seconds / 60) });
	}
	return i18next.t("common.duration.hours", { count: Math.ceil(seconds / 3600) });
}

function localizedParams(info: ApiErrorInfo): Record<string, unknown> {
	if (info.code === "auth.rate_limited" && hasRetryAfter(info)) {
		return { ...info.params, wait: formatWait(info.params.retryAfterSeconds as number) };
	}
	const format =
		info.code === "wallet.insufficient_balance"
			? formatCurrency
			: info.code === "stock.insufficient"
				? formatQuantity
				: null;
	if (!format) {
		return info.params;
	}
	const asText = (v: unknown) => (typeof v === "number" ? format(v) : v);
	return {
		...info.params,
		available: asText(info.params.available),
		requested: asText(info.params.requested),
	};
}

function hasRetryAfter(info: ApiErrorInfo): boolean {
	return typeof info.params.retryAfterSeconds === "number";
}

/**
 * The i18n key + params describing *why* a call failed, or null when there is
 * nothing more specific to say than the caller's own message. Known domain codes
 * win; otherwise the transport kind (no connection, server error, conflict…).
 */
export function apiErrorReason(
	info: ApiErrorInfo,
): { key: string; params: Record<string, unknown> } | null {
	if (info.code === "auth.rate_limited" && !hasRetryAfter(info)) {
		return { key: "common.apiError.rateLimited", params: {} };
	}
	if (info.code && KNOWN_CODES.has(info.code)) {
		return { key: `common.apiError.${info.code}`, params: localizedParams(info) };
	}
	switch (info.kind) {
		case "network":
			return { key: "common.apiError.network", params: {} };
		case "server":
			return { key: "common.apiError.server", params: {} };
		case "forbidden":
			return { key: "common.apiError.forbidden", params: {} };
		case "notFound":
			return { key: "common.apiError.entity.not_found", params: {} };
		case "conflict":
			return { key: "common.apiError.conflict", params: {} };
		case "rateLimited":
			return { key: "common.apiError.rateLimited", params: {} };
		case "validation":
			return { key: "common.apiError.validation.failed", params: {} };
		default:
			return null;
	}
}

/**
 * A standalone localized sentence for a failed call — the reason alone
 * («Нет связи с сервером»), or `fallbackKey` when nothing more specific is known.
 * For surfaces with no action to prefix (auth banners, field errors).
 */
export function describeApiReason(cause: unknown, fallbackKey: string): string {
	const reason = apiErrorReason(parseApiError(cause));
	if (!reason) {
		return i18next.t(fallbackKey);
	}
	const text = i18next.t(reason.key, reason.params);
	return text.charAt(0).toUpperCase() + text.slice(1);
}

/**
 * Localized one-line message for a failed call: the caller's action
 * («Не удалось создать товар») plus the reason when one is known
 * («…: такой артикул уже есть»). Never returns server text.
 */
export function describeApiError(
	cause: unknown,
	fallbackKey: string,
	fallbackParams?: Record<string, unknown>,
): string {
	const action = i18next.t(fallbackKey, fallbackParams);
	const reason = apiErrorReason(parseApiError(cause));
	if (!reason) {
		return action;
	}
	return i18next.t("common.apiError.withReason", {
		action,
		reason: i18next.t(reason.key, reason.params),
	});
}
