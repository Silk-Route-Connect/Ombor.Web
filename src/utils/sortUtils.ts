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
