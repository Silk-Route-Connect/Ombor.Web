/** Fixed country prefix — the app is Uzbekistan-only, so every number is +998. */
export const UZ_COUNTRY_PREFIX = "+998";
/** Uzbek national numbers are 9 digits after the country code (e.g. 90 123 45 67). */
const UZ_NATIONAL_MAX = 9;

/**
 * The editable national part (digits after +998) of any stored or typed value —
 * used to bind a phone input that shows a fixed «+998» prefix. The country code
 * is dropped only from a stored «+998…» or a full 12-digit number: typed national
 * digits may begin with 998 themselves (operator 99), and stripping those erased
 * «99 8…» as it was typed.
 */
export function uzNationalPart(value: string): string {
	const raw = (value ?? "").trim();
	const digits = raw.replace(/\D/g, "");
	const hasCountryCode = digits.startsWith("998") && (raw.startsWith("+") || digits.length >= 12);
	return (hasCountryCode ? digits.slice(3) : digits).slice(0, UZ_NATIONAL_MAX);
}

/**
 * Stored form rebuilt from typed national digits: `+998XXXXXXXXX`, or `""` when
 * the field is empty (so a bare «+998» never persists and blanks are filtered out).
 */
export function uzPhoneToStored(input: string): string {
	const national = uzNationalPart(input);
	return national === "" ? "" : UZ_COUNTRY_PREFIX + national;
}

/** National-number grouping — «XX XXX XX XX» (operator · 3 · 2 · 2). */
const UZ_NATIONAL_GROUPS = [2, 3, 2, 2];

/**
 * Group the national part of any phone input as you type:
 * `123456789` → «12 345 67 89» (partial input groups progressively, e.g.
 * `12345` → «12 345»). Bind a phone input's displayed value to this so the body
 * formats live alongside the fixed «+998» prefix.
 */
export function formatUzNational(input: string): string {
	const national = uzNationalPart(input);
	if (national === "") {
		return "";
	}
	const parts: string[] = [];
	let offset = 0;
	for (const size of UZ_NATIONAL_GROUPS) {
		if (offset >= national.length) {
			break;
		}
		parts.push(national.slice(offset, offset + size));
		offset += size;
	}
	return parts.join(" ");
}

/**
 * Read-only display of a stored/E.164 number with the country prefix and grouped
 * body: `+998901234567` → «+998 90 123 45 67», or `""` when empty.
 */
export function formatUzPhone(value: string): string {
	const grouped = formatUzNational(value);
	return grouped === "" ? "" : `${UZ_COUNTRY_PREFIX} ${grouped}`;
}

/**
 * A number shown without revealing it, for SMS-code copy: «+998 90 ••• •• 34» —
 * the same grouping as `formatUzPhone`.
 */
export function maskUzPhone(value: string): string {
	const national = uzNationalPart(value);
	return `${UZ_COUNTRY_PREFIX} ${national.slice(0, 2)} ••• •• ${national.slice(7, 9)}`;
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
