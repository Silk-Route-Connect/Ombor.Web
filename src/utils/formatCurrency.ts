import i18next from "i18n/config";

/**
 * Abbreviate a large integer with translated suffixes (chart axis ticks):
 *   1 000      → "1 тыс"
 *   9 500      → "9,5 тыс" (ru decimal comma)
 *   12 000 000 → "12 млн"
 *   −16 000    → "−16 тыс" (a true minus, as money reads)
 */
export function formatShortNumber(input: number): string {
	const abs = Math.abs(input);
	const sign = input < 0 ? "−" : "";

	const units: Array<{ value: number; key: string }> = [
		{ value: 1_000_000_000, key: "common.number.billionShort" },
		{ value: 1_000_000, key: "common.number.millionShort" },
		{ value: 1_000, key: "common.number.thousandShort" },
	];

	for (const { value, key } of units) {
		if (abs >= value) {
			const num = abs / value;
			const formatted =
				num < 10 && num % 1 !== 0 ? num.toFixed(1).replace(".", ",") : Math.round(num).toString();
			return `${sign}${formatted} ${i18next.t(key)}`;
		}
	}

	return `${sign}${formatQuantity(abs)}`;
}

// Fixed locale so numbers always render as "1 250 000" (space-grouped,
// per the Ombor Design System) regardless of the user's browser locale.
const wholeMoneyFormatter = new Intl.NumberFormat("ru-RU", { maximumFractionDigits: 0 });
const fractionalMoneyFormatter = new Intl.NumberFormat("ru-RU", {
	minimumFractionDigits: 2,
	maximumFractionDigits: 2,
});
const quantityFormatter = new Intl.NumberFormat("ru-RU", { maximumFractionDigits: 2 });

/**
 * Canonical money formatter (UZS, no currency symbol): whole sums without
 * decimals («1 250 000»), anything fractional with exactly two («702,01»,
 * «1 190 434,20») — never one decimal place. All money display routes through
 * this, KPIs included — never hand-assemble separators or round before calling.
 * A negative sum reads with a true minus («−3 683 000»), never `Intl`'s hyphen.
 */
export function formatCurrency(value: number): string {
	// Round to the cent first so 702,004 reads «702», and `|| 0` drops a -0.
	const cents = Math.round(value * 100) || 0;
	const abs = Math.abs(cents) / 100;
	const text =
		cents % 100 === 0 ? wholeMoneyFormatter.format(abs) : fractionalMoneyFormatter.format(abs);
	return cents < 0 ? `−${text}` : text;
}

/**
 * Space-grouped formatter for non-money quantities (stock counts, units). Same
 * grouping as money, but named for intent so quantity displays don't read as
 * currency. 340 → "340", 1500 → "1 500", −4 → "−4" (a true minus: a report row
 * whose returns outnumber its sales).
 */
export function formatQuantity(value: number): string {
	const text = quantityFormatter.format(Math.abs(value));
	return value < 0 && text !== "0" ? `−${text}` : text;
}

const percentFormatter = new Intl.NumberFormat("ru-RU", { maximumFractionDigits: 1 });

/**
 * A percentage with the ru decimal comma: 33.33 → «33,3», 50 → «50», −2.2 → «−2,2»
 * (a true minus, as money reads; no «%» sign).
 */
export function formatPercent(value: number): string {
	const text = percentFormatter.format(Math.abs(value));
	return value < 0 && text !== "0" ? `−${text}` : text;
}

/**
 * Money that may be negative, with a true minus: «−18 000» (a refund row and
 * the net «Сумма» of Sales / Supplies, D12); positives stay unsigned. Same output
 * as `formatCurrency` — the name marks call sites where a negative is expected.
 */
export function formatCurrencyMinus(value: number): string {
	return formatCurrency(value);
}

/** Signed money for ledger/balance figures: "+1 250 000" / "−800 000" / "0". */
export function formatSigned(value: number): string {
	if (value === 0) {
		return "0";
	}
	return `${value > 0 ? "+" : "−"}${formatCurrency(Math.abs(value))}`;
}
