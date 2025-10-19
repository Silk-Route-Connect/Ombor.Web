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
