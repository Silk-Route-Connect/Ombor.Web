export function formatUZS(value: number): string {
	if (value >= 1_000_000) {
		const mln = value / 1_000_000;
		const fixed = mln.toFixed(1);
		const formatted = fixed.endsWith(".0")
			? Number(mln.toFixed(0)).toLocaleString("ru-RU")
			: parseFloat(fixed).toLocaleString("ru-RU");
		return `${formatted} млн`;
	} else if (value >= 1_000) {
		const k = value / 1_000;
		const fixed = k.toFixed(1);
		const formatted = fixed.endsWith(".0")
			? Number(k.toFixed(0)).toLocaleString("ru-RU")
			: parseFloat(fixed).toLocaleString("ru-RU");
		return `${formatted} тыс`;
	} else {
		return `${value.toLocaleString("ru-RU")}`;
	}
}

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
