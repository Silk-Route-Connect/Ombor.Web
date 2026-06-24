/** Fixed country prefix — the app is Uzbekistan-only, so every number is +998. */
export const UZ_COUNTRY_PREFIX = "+998";
/** Uzbek national numbers are 9 digits after the country code (e.g. 90 123 45 67). */
const UZ_NATIONAL_MAX = 9;

/**
 * The editable national part (digits after +998) of any stored or typed value —
 * used to bind a phone input that shows a fixed «+998» prefix.
 */
export function uzNationalPart(value: string): string {
	const digits = (value ?? "").replace(/\D/g, "");
	const national = digits.startsWith("998") ? digits.slice(3) : digits;
	return national.slice(0, UZ_NATIONAL_MAX);
}

/**
 * Stored form rebuilt from typed national digits: `+998XXXXXXXXX`, or `""` when
 * the field is empty (so a bare «+998» never persists and blanks are filtered out).
 */
export function uzPhoneToStored(input: string): string {
	const national = uzNationalPart(input);
	return national === "" ? "" : UZ_COUNTRY_PREFIX + national;
}

/**
 * Normalize various Uzbek phone inputs to E.164 (+998XXXXXXXXX).
 * Accepts formats like: "+998 90 123 45 67", "90 123 45 67", "909876543", "998901234567"
 */
export function normalizeUzPhoneToE164(input: string): string {
	const digits = (input ?? "").replace(/\D+/g, "");
	// Already includes country code
	if (digits.length === 12 && digits.startsWith("998")) {
		return `+${digits}`;
	}
	// Local form without country code (9 digits)
	if (digits.length === 9) {
		return `+998${digits}`;
	}
	// Two-digit operator + 7 digits may also appear with leading zeros
	if (digits.length === 10 && digits.startsWith("8") === false && digits.startsWith("9")) {
		return `+998${digits.slice(1)}`;
	}
	// Fallback: if user typed "+998..." with spaces
	if (digits.startsWith("998") && digits.length >= 12) {
		return `+${digits.slice(0, 12)}`;
	}
	return input; // leave as-is; server-side will validate too
}
