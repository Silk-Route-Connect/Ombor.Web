/**
 * Phone formatting + field-validation helpers for the auth surface. The auth
 * fields hold the 9 national digits (no country code); `normalizeUzPhoneToE164`
 * adds +998 at submit. Error helpers return an i18n key (or null when valid) so
 * the pages can validate inline on submit — matching the design's UX.
 */

export const PHONE_DIGITS = 9;
export const PASSWORD_MIN = 8;

export const onlyDigits = (s: string): string => (s || "").replace(/\D/g, "");

/** Format up to 9 national digits as «90 123-45-67». */
export function formatNationalPhone(raw: string): string {
	const d = onlyDigits(raw).slice(0, PHONE_DIGITS);
	const a = d.slice(0, 2);
	const b = d.slice(2, 5);
	const c = d.slice(5, 7);
	const e = d.slice(7, 9);
	let out = a;
	if (b) out += " " + b;
	if (c) out += "-" + c;
	if (e) out += "-" + e;
	return out;
}

/** Masked phone for code-step copy, e.g. «+998 90 •••-••-67». */
export function maskedPhone(raw: string): string {
	const d = onlyDigits(raw).slice(0, PHONE_DIGITS);
	return `+998 ${d.slice(0, 2)} •••-••-${d.slice(7, 9)}`;
}

export const isPhoneComplete = (raw: string): boolean => onlyDigits(raw).length === PHONE_DIGITS;

export function phoneError(raw: string): string | null {
	const d = onlyDigits(raw);
	if (!d) return "auth.errors.phoneRequired";
	if (d.length !== PHONE_DIGITS) return "auth.errors.invalidPhone";
	return null;
}

export function requiredError(value: string): string | null {
	return value.trim() ? null : "auth.errors.required";
}

export function passwordError(value: string): string | null {
	if (!value) return "auth.errors.required";
	if (value.length < PASSWORD_MIN) return "auth.errors.passwordMin";
	return null;
}

export function confirmError(password: string, confirm: string): string | null {
	if (!confirm) return "auth.errors.required";
	if (confirm !== password) return "auth.errors.passwordMismatch";
	return null;
}
