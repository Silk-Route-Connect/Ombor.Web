// src/utils/dateRangeUtils.ts
export type DateRangeOption = "week" | "month" | "all" | "custom";

export interface DateRange {
	from: Date | null; // null ⇒ no lower bound (used for "all")
	to: Date | null; // null ⇒ no upper bound
	option: DateRangeOption;
}

/** Returns { from, to } for a preset option, relative to “today”. */
export function presetRange(option: DateRangeOption, today = new Date()): DateRange {
	const normalized = startOfDay(today);

	switch (option) {
		case "week":
			return {
				from: addDays(normalized, -7),
				to: normalized,
				option,
			};
		case "month":
			return {
				from: addMonths(normalized, -1),
				to: normalized,
				option,
			};
		case "all":
			return { from: null, to: null, option };
		case "custom":
		default:
			throw new Error('presetRange("custom") is not supported; supply your own dates');
	}
}

/* ---------- trivial helpers (no external libs needed) ---------- */
function startOfDay(d: Date): Date {
	const copy = new Date(d);
	copy.setHours(0, 0, 0, 0);
	return copy;
}
function addDays(d: Date, n: number): Date {
	const copy = new Date(d);
	copy.setDate(copy.getDate() + n);
	return copy;
}
function addMonths(d: Date, n: number): Date {
	const copy = new Date(d);
	copy.setMonth(copy.getMonth() + n);
	return copy;
}
