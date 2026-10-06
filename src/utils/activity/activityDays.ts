import { isSameDay, startOfDay, subDays } from "date-fns";
import { TFunction } from "i18next";
import { ActivityItem } from "models/activity";
import { formatDate, formatISODate } from "utils/dateUtils";

/** The operations of one local calendar day, newest first as served. */
export interface ActivityDay {
	key: string;
	date: Date;
	items: ActivityItem[];
}

/** Splits the feed (newest first) into local calendar days, keeping the order. */
export function groupByDay(items: ActivityItem[]): ActivityDay[] {
	const days: ActivityDay[] = [];
	for (const item of items) {
		const date = startOfDay(new Date(item.at));
		const key = formatISODate(date);
		const last = days[days.length - 1];
		if (last?.key === key) {
			last.items.push(item);
		} else {
			days.push({ key, date, items: [item] });
		}
	}
	return days;
}

/** «Сегодня, 04.10.2026» / «Вчера, 03.10.2026» / «01.10.2026». */
export function dayHeading(t: TFunction, date: Date, now: Date = new Date()): string {
	const formatted = formatDate(date);
	if (isSameDay(date, now)) {
		return t("activity.day.today", { date: formatted });
	}
	if (isSameDay(date, subDays(now, 1))) {
		return t("activity.day.yesterday", { date: formatted });
	}
	return formatted;
}
