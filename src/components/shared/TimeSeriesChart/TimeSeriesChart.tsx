import React from "react";
import { Box } from "@mui/material";
import { parseISO } from "date-fns";
import { getLocale } from "i18n/i18n";
import { TimeSeriesPoint } from "models/dashboard";
import { Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { DateFilter } from "utils/dateFilterUtils";
import { formatShortNumber } from "utils/formatCurrency";

interface TimeSeriesChartProps {
	data: TimeSeriesPoint[];
	filter: DateFilter;
}

const TimeSeriesChart: React.FC<TimeSeriesChartProps> = ({ data, filter }) => {
	const locale = getLocale();
	const isPreset = filter.type === "preset";
	const preset = isPreset ? filter.preset : null;

	const tickFormatter = (dateStr: string) => {
		const date = parseISO(dateStr);
		const opts: Intl.DateTimeFormatOptions =
			preset === "alltime" ? { month: "short" } : { day: "numeric", month: "short" };
		return new Intl.DateTimeFormat(locale, opts).format(date);
	};

	const labelFormatter = (dateStr: string) => {
		const date = parseISO(dateStr);
		const opts: Intl.DateTimeFormatOptions =
			preset === "alltime"
				? { month: "short", year: "numeric" }
				: { day: "numeric", month: "short", year: "numeric" };
		return new Intl.DateTimeFormat(locale, opts).format(date);
	};

	return (
		<Box>
			<ResponsiveContainer width="100%" height={200}>
				<LineChart data={data} margin={{ top: 20, right: 10, bottom: 0, left: 0 }}>
					<XAxis
						dataKey="date"
						tickFormatter={tickFormatter}
						tickMargin={10}
						interval="preserveStartEnd"
					/>
					<YAxis width={80} tickFormatter={(v) => formatShortNumber(v as number)} />
					<Tooltip
						formatter={(value) => formatShortNumber(value as number)}
						labelFormatter={labelFormatter}
					/>
					<Line type="monotone" dataKey="value" dot={false} strokeWidth={2} />
				</LineChart>
			</ResponsiveContainer>
		</Box>
	);
};

export default TimeSeriesChart;
