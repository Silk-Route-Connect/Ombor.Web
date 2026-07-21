import i18next from "i18n/config";

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
			return `${sign}${formatted} ${i18next.t(key)}`;
		}
	}

	return `${sign}${abs.toLocaleString()}`;
}

// Fixed locale so money always renders as "1 250 000" (space-grouped,
// per the Ombor Design System) regardless of the user's browser locale.
const currencyFormatter = new Intl.NumberFormat("ru-RU", { maximumFractionDigits: 2 });

/**
 * Canonical money formatter (UZS, no currency symbol): 1250000 → "1 250 000".
 * All money display routes through this — never hand-assemble separators
 * (`toLocaleString`, manual grouping) or symbols anywhere.
 */
export function formatCurrency(value: number): string {
	return currencyFormatter.format(value);
}

/**
 * Space-grouped formatter for non-money quantities (stock counts, units). Same
 * grouping as money, but named for intent so quantity displays don't read as
 * currency. 340 → "340", 1500 → "1 500".
 */
export function formatQuantity(value: number): string {
	return currencyFormatter.format(value);
}

/** Signed money for ledger/balance figures: "+1 250 000" / "−800 000" / "0". */
export function formatSigned(value: number): string {
	if (value === 0) {
		return "0";
	}
	return `${value > 0 ? "+" : "−"}${formatCurrency(Math.abs(value))}`;
}
