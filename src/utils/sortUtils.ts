/**
 * Default option ordering for selects / dropdowns: alphabetical by the option's
 * display label — ru-locale, numeric-aware (so «Склад 2» precedes «Склад 10»),
 * case-insensitive. Returns a new array. Use this for any picker whose order is
 * not intentionally relevance / recency ranked (those keep their own order).
 */
export const byLabel = <T>(items: T[], labelOf: (item: T) => string): T[] =>
	[...items].sort((a, b) =>
		labelOf(a).localeCompare(labelOf(b), "ru", { numeric: true, sensitivity: "base" }),
	);

export const sort = <T>(data: T[], field: keyof T, order: "asc" | "desc"): T[] => {
	const asc = order === "asc" ? 1 : -1;

	return [...data].sort((a, b) => {
		const aValue = a[field];
		const bValue = b[field];

		if (aValue == null && bValue == null) {
			return 0;
		}

		if (aValue == null) {
			return 1;
		}

		if (bValue == null) {
			return -1;
		}

		if (typeof aValue === "number" && typeof bValue === "number") {
			return asc * (aValue - bValue);
		}

		if (typeof aValue === "string" && typeof bValue === "string") {
			return asc * aValue.localeCompare(bValue, undefined, { numeric: true });
		}

		if (typeof aValue !== "object" && typeof bValue !== "object") {
			return asc * String(aValue).localeCompare(String(bValue), undefined, { numeric: true });
		}

		return 0;
	});
};
