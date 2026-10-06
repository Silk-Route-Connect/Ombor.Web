import { addDays, format, parseISO } from "date-fns";
import { TFunction } from "i18next";
import { ReportTimeGroupBy } from "models/report";
import { formatDate } from "utils/dateUtils";
import { formatPeriod } from "utils/payrollUtils";

/**
 * A served calendar bucket in words: a day «04.10.2026», a week (served as its
 * Monday) «28.09 – 04.10.2026» — «29.12.2025 – 04.01.2026» across a new year —
 * a month «Октябрь 2026».
 */
export function bucketLabel(groupBy: ReportTimeGroupBy, key: string, t: TFunction): string {
	switch (groupBy) {
		case "Week": {
			const monday = parseISO(key);
			const sunday = addDays(monday, 6);
			const start =
				monday.getFullYear() === sunday.getFullYear()
					? format(monday, "dd.MM")
					: formatDate(monday);
			return `${start} – ${formatDate(sunday)}`;
		}
		case "Month":
			return formatPeriod(t, key);
		default:
			return formatDate(key);
	}
}

/** A bucket's short axis tick: «04.10» for a day or a week's Monday, «10.2026» for a month. */
export function bucketTick(groupBy: ReportTimeGroupBy, key: string): string {
	return groupBy === "Month"
		? format(parseISO(`${key}-01`), "MM.yyyy")
		: format(parseISO(key), "dd.MM");
}
