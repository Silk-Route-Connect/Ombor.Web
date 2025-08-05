import { useMemo } from "react";
import { parseISO } from "date-fns";
import { PresetOption } from "utils/dateFilterUtils";

export function useChartFormatters(locale: string, preset: PresetOption | null) {
	const tickFormatter = useMemo(
		() => (dateStr: string) => {
			const date = parseISO(dateStr);
			const opts: Intl.DateTimeFormatOptions =
				preset === "alltime" ? { month: "short" } : { day: "numeric", month: "short" };
			return new Intl.DateTimeFormat(locale, opts).format(date);
		},
		[locale, preset],
	);

	const labelFormatter = useMemo(
		() => (dateStr: string) => {
			const date = parseISO(dateStr);
			const opts: Intl.DateTimeFormatOptions =
				preset === "alltime"
					? { month: "short", year: "numeric" }
					: { day: "numeric", month: "short", year: "numeric" };
			return new Intl.DateTimeFormat(locale, opts).format(date);
		},
		[locale, preset],
	);

	return { tickFormatter, labelFormatter };
}
