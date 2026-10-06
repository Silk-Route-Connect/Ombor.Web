import i18next from "i18n/config";

import { describeApiReason, parseApiError } from "./apiError";

/**
 * Auth-surface failure texts (frontend-7 / ux-7): a wrong password, a refused
 * code, a throttle and a dead server each say what happened — never one fixed
 * «wrong password» for every failure, never raw server text.
 */

/**
 * Login: a 401 is «wrong phone or password» whatever the cause (the server keeps
 * unknown phone, wrong password and not-yet-confirmed invite identical); a
 * disabled account is told only after the password was right.
 */
export function loginFailureText(cause: unknown): string {
	const info = parseApiError(cause);
	if (info.code === "auth.account_deactivated") {
		return i18next.t("auth.login.deactivated");
	}
	if (info.kind === "unauthorized") {
		return i18next.t("auth.login.failed");
	}
	return describeApiReason(cause, "auth.login.failedGeneric");
}

/** A one-time code was refused: wrong, expired, burned by too many guesses, or never checked. */
export function codeFailureText(cause: unknown): string {
	const info = parseApiError(cause);
	if (info.code === "auth.code_invalid" || (!info.code && info.kind === "validation")) {
		return i18next.t("auth.errors.codeInvalid");
	}
	return describeApiReason(cause, "auth.errors.codeInvalid");
}

/** The code can no longer be used (expired or burned by wrong guesses) — only a new code helps. */
export function isCodeGone(cause: unknown): boolean {
	const { code } = parseApiError(cause);
	return code === "auth.code_expired" || code === "auth.too_many_attempts";
}

/** Any refusal of the code itself (as opposed to no connection or a throttle). */
export function isCodeRefused(cause: unknown): boolean {
	const { code } = parseApiError(cause);
	return code === "auth.code_invalid" || isCodeGone(cause);
}

/** Seconds the server asks to wait (`429 auth.rate_limited`), or null for any other failure. */
export function retryAfterSeconds(cause: unknown): number | null {
	const info = parseApiError(cause);
	const value = info.params.retryAfterSeconds;
	return info.code === "auth.rate_limited" && typeof value === "number" && value > 0
		? Math.ceil(value)
		: null;
}

export type RegisterField = "company" | "firstName" | "lastName" | "phone" | "password" | "confirm";

/** Server property (`RegisterRequest`, PascalCase as `errors` keys it) → the register form field. */
const REGISTER_FIELDS: Record<string, RegisterField> = {
	OrganizationName: "company",
	FirstName: "firstName",
	LastName: "lastName",
	PhoneNumber: "phone",
	Password: "password",
	ConfirmPassword: "confirm",
};

/** Field-error text per error code; any other server field error reads «Проверьте это поле». */
const REGISTER_CODE_TEXT: Record<string, string> = {
	"auth.phone_taken": "auth.errors.phoneTaken",
};

/**
 * A refused registration as inline field errors (i18n keys) plus whether anything
 * is left for the banner — an error on a field the form doesn't have (email,
 * Telegram) or a failure that is not about a field at all.
 */
export function registerServerErrors(cause: unknown): {
	fields: Partial<Record<RegisterField, string>>;
	unplaced: boolean;
} {
	const info = parseApiError(cause);
	const keys = Object.keys(info.fieldErrors);
	const fields: Partial<Record<RegisterField, string>> = {};
	let unplaced = keys.length === 0;
	for (const key of keys) {
		const field = REGISTER_FIELDS[key];
		if (!field) {
			unplaced = true;
			continue;
		}
		const codeText = field === "phone" && info.code ? REGISTER_CODE_TEXT[info.code] : undefined;
		fields[field] = codeText ?? "common.apiError.fieldInvalid";
	}
	return { fields, unplaced };
}
