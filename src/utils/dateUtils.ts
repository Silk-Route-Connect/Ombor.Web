import { format as formatDateFns, isValid } from "date-fns";

export type PresetOption = "week" | "month" | "alltime";

/**
 * DSN-1 canonical date display format (DD.MM.YYYY) and its datetime sibling.
 * The single source for date display — change here to propagate everywhere.
 */
export const DATE_FORMAT = "dd.MM.yyyy";
export const DATETIME_FORMAT = "dd.MM.yyyy HH:mm";

export type DateFilter =
	| { type: "preset"; preset: PresetOption }
	| { type: "custom"; from: Date; to: Date };

export interface DateRange {
	from: Date | null;
	to: Date | null;
}

const MILLISECONDS_PER_DAY = 86_400_000;

const PRESET_RANGES = {
	week: { days: -7 },
	month: { months: -1 },
	alltime: null,
} as const;

/**
 * Converts a Date or ISO string to a Date object
 */
export const toDate = (value: Date | string): Date =>
	value instanceof Date ? value : new Date(value);

/**
 * Returns start of day (00:00:00.000) for the given date
 */
export const startOfDay = (date: Date): Date => {
	const result = new Date(date);
	result.setHours(0, 0, 0, 0);

	return result;
};

/**
 * Returns today's date at start of day
 */
export const today = (): Date => startOfDay(new Date());

/**
 * Adds days to a date (negative values subtract)
 */
export const addDays = (date: Date, days: number): Date =>
	new Date(date.getTime() + days * MILLISECONDS_PER_DAY);

/**
 * Adds months to a date (negative values subtract)
 */
export const addMonths = (date: Date, months: number): Date => {
	const result = new Date(date);
	result.setMonth(result.getMonth() + months);

	return result;
};

/**
 * Returns a date N days before today (at start of day)
 */
export const daysAgo = (days: number): Date => startOfDay(addDays(new Date(), -days));

/**
 * Pads a number with leading zeros
 */
const pad = (n: number, width = 2): string => n.toString().padStart(width, "0");

/**
 * Canonical date display (DSN-1: DD.MM.YYYY) — every table / detail / card date
 * routes through here. date-fns formatting; an invalid date renders as "" rather
 * than "NaN.NaN.NaN".
 */
export const formatDate = (value: Date | string): string => {
	const date = toDate(value);
	return isValid(date) ? formatDateFns(date, DATE_FORMAT) : "";
};

/**
 * Canonical date+time display (DD.MM.YYYY HH:mm, 24-hour) — the date portion uses
 * the same DSN-1 separator as `formatDate`.
 */
export const formatDateTime = (value: Date | string): string => {
	const date = toDate(value);
	return isValid(date) ? formatDateFns(date, DATETIME_FORMAT) : "";
};

/**
 * Formats a date as "yyyy-MM-dd" (ISO date format, useful for keys)
 */
export const formatISODate = (date: Date | string): string => {
	const d = toDate(date);
	return [d.getFullYear(), pad(d.getMonth() + 1), pad(d.getDate())].join("-");
};

// Alias for backward compatibility or semantic clarity
export const getKeyFromDate = formatISODate;

/**
 * Converts a DateFilter to concrete date boundaries
 */
export const materialise = (filter: DateFilter, referenceDate = new Date()): DateRange => {
	if (filter.type === "custom") {
		return {
			from: filter.from,
			to: filter.to,
		};
	}

	const range = PRESET_RANGES[filter.preset];

	if (range === null) {
		return { from: null, to: null };
	}

	const endDate = startOfDay(referenceDate);
	const startDate =
		"days" in range ? addDays(endDate, range.days) : addMonths(endDate, range.months);

	return {
		from: startDate,
		to: endDate,
	};
};

/**
 * Checks if a date falls within the specified filter range
 */
export const isWithinDateRange = (date: Date | string, filter: DateFilter): boolean => {
	const range = materialise(filter);
	const targetDate = startOfDay(toDate(date));

	if (range.from === null && range.to === null) {
		return true;
	}

	if (range.from && targetDate < startOfDay(range.from)) {
		return false;
	}

	if (range.to && targetDate > startOfDay(range.to)) {
		return false;
	}

	return true;
};

export class DateFilterBuilder {
	static preset(preset: PresetOption): DateFilter {
		return { type: "preset", preset };
	}

	static custom(from: Date, to: Date): DateFilter {
		return { type: "custom", from, to };
	}

	static lastWeek(): DateFilter {
		return this.preset("week");
	}

	static lastMonth(): DateFilter {
		return this.preset("month");
	}

	static allTime(): DateFilter {
		return this.preset("alltime");
	}

	static lastNDays(days: number): DateFilter {
		return this.custom(daysAgo(days), today());
	}

	static between(from: Date, to: Date): DateFilter {
		return this.custom(from, to);
	}
}

/**
 * Validates that a date range is logically correct
 */
export const validateDateRange = (range: DateRange): boolean => {
	if (range.from === null || range.to === null) {
		return true; // All-time range is valid
	}

	return range.from <= range.to;
};

/**
 * Checks if a value is a valid date
 */
export const isValidDate = (value: unknown): boolean => {
	if (value instanceof Date) {
		return !isNaN(value.getTime());
	}

	if (typeof value === "string") {
		const date = new Date(value);
		return !isNaN(date.getTime());
	}

	return false;
};
