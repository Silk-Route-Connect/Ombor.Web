import { translate } from "i18n/i18n";

/**
 * Formats a number with commas as thousand separators.
 * E.g. 1500   → "1,500"
 *       21003000 → "21,003,000"
 */
export function formatNumberWithCommas(value: number): string {
	const sign = getSign(value);
	return `${sign}${value.toLocaleString()}`;
}

function getSign(value: number): string {
	if (value === 0 || value < 0) {
		return "";
	}

	return "+";
}

/**
 * Abbreviate a large integer with translated suffixes:
 *   1 000      → "1 тыс"
 *   10 000     → "10 тыс"
 *   1 250 000  → "1.25 млн"
 *   12 000 000 → "12 млн"
 */
export function formatShortNumber(input: number): string {
	const abs = Math.abs(input);
	const sign = input < 0 ? "-" : "";

	const units: Array<{ value: number; key: string }> = [
		{ value: 1_000_000_000, key: "common.number.billionShort" },
		{ value: 1_000_000, key: "common.number.millionShort" },
		{ value: 1_000, key: "common.number.thousandShort" },
	];

	for (const { value, key } of units) {
		if (abs >= value) {
			const num = abs / value;
			const formatted = num < 10 && num % 1 !== 0 ? num.toFixed(1) : Math.round(num).toString();
			return `${sign}${formatted} ${translate(key)}`;
		}
	}

	return `${sign}${abs.toLocaleString()}`;
}

export function formatPrice(value: number): string {
	return value.toLocaleString();
}

/**
 * Money formatting with space thousand separators (UZS convention).
 *   1973000 → "1 973 000"
 */
export function formatMoney(value: number): string {
	return Math.round(value).toLocaleString("ru-RU");
}

/**
 * Signed money — always shows +/− (0 stays "0").
 *   1131000  → "+1 131 000"
 *   -582320  → "−582 320"
 */
export function formatSignedMoney(value: number): string {
	const rounded = Math.round(value);
	if (rounded === 0) {
		return "0";
	}
	const sign = rounded > 0 ? "+" : "−";
	return `${sign}${formatMoney(Math.abs(rounded))}`;
}
