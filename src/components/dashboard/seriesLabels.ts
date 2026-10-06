import { format, parseISO } from "date-fns";
import { formatDate } from "utils/dateUtils";

/** The served daily bucket key («2026-09-05»); hourly buckets come as «09:00». */
const ISO_DAY = /^\d{4}-\d{2}-\d{2}$/;

/** Short axis tick: «05.09» for a day bucket, the hour as served otherwise. */
export const seriesTick = (label: string): string =>
	ISO_DAY.test(label) ? format(parseISO(label), "dd.MM") : label;

/** Tooltip heading: the app's full date format («05.09.2026») for a day bucket. */
export const seriesHeading = (label: string): string =>
	ISO_DAY.test(label) ? formatDate(label) : label;

/** Show ~8 evenly spaced ticks whatever the bucket count (7 / 24 / 30). */
export const seriesTickInterval = (count: number): number => Math.max(0, Math.ceil(count / 8) - 1);
