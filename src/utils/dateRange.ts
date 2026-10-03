import {
	addDays,
	isValid,
	parseISO,
	startOfDay,
	startOfMonth,
	startOfWeek,
	subMonths,
} from "date-fns";

import { formatDate } from "./dateUtils";

/** Ready-made periods of the shared list date filter, in menu order. */
export const DATE_PRESETS = ["all", "today", "yesterday", "week", "month", "lastMonth"] as const;
export type DatePreset = (typeof DATE_PRESETS)[number];

/**
 * A list's date filter: a ready-made period, or a custom range of whole calendar
 * days (ISO «yyyy-MM-dd», both ends inclusive).
 */
export type DateRangeValue =
	| { preset: DatePreset }
	| { preset: "custom"; from: string; to: string };

export const ALL_DATES: DateRangeValue = { preset: "all" };

/** Concrete bounds of a period: `start` inclusive, `end` exclusive. */
export interface ResolvedDateRange {
	start: Date;
	end: Date;
}

/**
 * Calendar periods, not rolling ones: «Эта неделя» starts on Monday, «Этот
 * месяц» on the 1st — so the totals answer «how much this month», not «in the
 * last 30 days». `null` means no date limit.
 */
export function resolveDateRange(
	value: DateRangeValue,
	now: Date = new Date(),
): ResolvedDateRange | null {
	const today = startOfDay(now);
	const tomorrow = addDays(today, 1);

	switch (value.preset) {
		case "all":
			return null;
		case "today":
			return { start: today, end: tomorrow };
		case "yesterday":
			return { start: addDays(today, -1), end: today };
		case "week":
			return { start: startOfWeek(today, { weekStartsOn: 1 }), end: tomorrow };
		case "month":
			return { start: startOfMonth(today), end: tomorrow };
		case "lastMonth":
			return { start: startOfMonth(subMonths(today, 1)), end: startOfMonth(today) };
		case "custom": {
			const from = parseISO(value.from);
			const to = parseISO(value.to);
			if (!isValid(from) || !isValid(to)) {
				return null;
			}
			return { start: startOfDay(from), end: addDays(startOfDay(to), 1) };
		}
	}
}

/** Whether a row's date falls in a resolved period (`null` keeps every row). */
export function isInDateRange(date: Date | string, range: ResolvedDateRange | null): boolean {
	if (range === null) {
		return true;
	}
	const time = (date instanceof Date ? date : new Date(date)).getTime();
	return time >= range.start.getTime() && time < range.end.getTime();
}

/** Keeps the rows whose date falls in the filter's period. */
export function filterByDateRange<T>(
	rows: T[],
	value: DateRangeValue,
	dateOf: (row: T) => Date | string,
): T[] {
	const range = resolveDateRange(value);
	return range === null ? rows : rows.filter((row) => isInDateRange(dateOf(row), range));
}

export const isDateRangeActive = (value: DateRangeValue): boolean => value.preset !== "all";

/** «01.10.2026 – 04.10.2026», or one date when the range is a single day. */
export function formatCustomRange(from: string, to: string): string {
	const day = (iso: string) => formatDate(parseISO(iso));
	return from === to ? day(from) : `${day(from)} – ${day(to)}`;
}

/** A custom range from two picked days, ordered so `from` is never after `to`. */
export function customDateRange(a: string, b: string): DateRangeValue {
	return a <= b ? { preset: "custom", from: a, to: b } : { preset: "custom", from: b, to: a };
}
