import React from "react";
import { Box } from "@mui/material";
import { parseISO } from "date-fns";
import { getLocale } from "i18n/i18n";
import { TimeSeriesConfig, TimeSeriesPoint } from "models/dashboard";
import { Legend, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { DateFilter } from "utils/dateFilterUtils";
import { formatShortNumber } from "utils/formatCurrency";

interface TimeSeriesChartProps {
	data: TimeSeriesPoint[];
	filter: DateFilter;
	series: TimeSeriesConfig[];
}

const TimeSeriesChart: React.FC<TimeSeriesChartProps> = ({ data, filter, series }) => {
	const locale = getLocale();
	const preset = filter.type === "preset" ? filter.preset : null;

	const tickFormatter = (dateStr: string) => {
		const date = parseISO(dateStr);
		const formatOptions: Intl.DateTimeFormatOptions =
			preset === "alltime" ? { month: "short" } : { day: "numeric", month: "short" };
		return new Intl.DateTimeFormat(locale, formatOptions).format(date);
	};

	const labelFormatter = (dateStr: string) => {
		const date = parseISO(dateStr);
		const formatOptions: Intl.DateTimeFormatOptions =
			preset === "alltime"
				? { month: "short", year: "numeric" }
				: { day: "numeric", month: "short", year: "numeric" };
		return new Intl.DateTimeFormat(locale, formatOptions).format(date);
	};

	return (
		<Box>
			<ResponsiveContainer width="100%" height={200}>
				<LineChart data={data} margin={{ top: 20, right: 10, bottom: 10, left: 10 }}>
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
					<Legend />
					{series.map((s) => (
						<Line
							key={s.dataKey}
							dataKey={s.dataKey}
							name={s.name}
							stroke={s.stroke}
							strokeDasharray={s.strokeDasharray}
							dot={false}
							strokeWidth={2}
						/>
					))}
				</LineChart>
			</ResponsiveContainer>
		</Box>
	);
};

export default TimeSeriesChart;
