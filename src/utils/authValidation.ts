/**
 * Phone formatting + field-validation helpers for the auth surface. The auth
 * fields hold the 9 national digits (no country code); `normalizeUzPhoneToE164`
 * adds +998 at submit. Error helpers return an i18n key (or null when valid) so
 * the pages can validate inline on submit — matching the design's UX.
 */

export const PHONE_DIGITS = 9;
/** Password and text limits mirror the backend validators (Register / ResetPassword / ChangePassword). */
export const PASSWORD_MIN = 8;
export const TEXT_MAX = 250;

export const onlyDigits = (s: string): string => (s || "").replace(/\D/g, "");

export const isPhoneComplete = (raw: string): boolean => onlyDigits(raw).length === PHONE_DIGITS;

export function phoneError(raw: string): string | null {
	const d = onlyDigits(raw);
	if (!d) return "auth.errors.phoneRequired";
	if (d.length !== PHONE_DIGITS) return "auth.errors.invalidPhone";
	return null;
}

export function requiredError(value: string): string | null {
	if (!value.trim()) return "auth.errors.required";
	if (value.trim().length > TEXT_MAX) return "auth.errors.tooLong";
	return null;
}

export function passwordError(value: string): string | null {
	if (!value) return "auth.errors.required";
	if (value.length < PASSWORD_MIN) return "auth.errors.passwordMin";
	if (value.length > TEXT_MAX) return "auth.errors.passwordMax";
	return null;
}

export function confirmError(password: string, confirm: string): string | null {
	if (!confirm) return "auth.errors.required";
	if (confirm !== password) return "auth.errors.passwordMismatch";
	return null;
}
