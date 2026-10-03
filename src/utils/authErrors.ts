import i18next from "i18n/config";

import { describeApiReason, parseApiError } from "./apiError";

/**
 * Auth-surface failure texts (frontend-7 / ux-7): a wrong password, a refused
 * code, a throttle and a dead server each say what happened — never one fixed
 * «wrong password» for every failure, never raw server text.
 */

/** Login: 401 is «wrong phone or password»; anything else says what really failed. */
export function loginFailureText(cause: unknown): string {
	const info = parseApiError(cause);
	if (info.kind === "unauthorized" && (!info.code || info.code === "auth.invalid_credentials")) {
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

/** The registration phone already belongs to an account (field error on the phone). */
export function isPhoneTaken(cause: unknown): boolean {
	const info = parseApiError(cause);
	return info.code === "auth.phone_taken" || (info.fieldErrors.PhoneNumber?.length ?? 0) > 0;
}
