import React, { useMemo, useRef, useState } from "react";
import { Box } from "@mui/material";
import { useChartFormatters } from "hooks/charts/useChartFormatters";
import { getLocale } from "i18n/i18n";
import { TimeSeriesConfig, TimeSeriesPoint } from "models/dashboard";
import {
	Bar,
	BarChart,
	Legend,
	Line,
	LineChart,
	ResponsiveContainer,
	Tooltip as RechartsTooltip,
	XAxis,
	YAxis,
} from "recharts";
import { DateFilter } from "utils/dateFilterUtils";
import { formatShortNumber } from "utils/formatCurrency";

import ChartControls from "./Controls/ChartControls";

const DEFAULT_MARGIN = { top: 20, right: 10, bottom: 10, left: 10 };
const DEFAULT_HEIGHT = 250;

export type ChartType = "line" | "bar";

const ChartRenderer: React.FC<{
	type: ChartType;
	data: TimeSeriesPoint[];
	seriesConfig: TimeSeriesConfig[];
	height: number;
	margin: typeof DEFAULT_MARGIN;
	tickFormatter: (date: string) => string;
	labelFormatter: (date: string) => string;
}> = ({ type, data, seriesConfig, tickFormatter, labelFormatter, height, margin }) => (
	<ResponsiveContainer width="100%" height={height}>
		{type === "line" ? (
			<LineChart data={data} margin={margin}>
				<XAxis
					dataKey="date"
					tickFormatter={tickFormatter}
					tickMargin={10}
					interval="preserveStartEnd"
				/>
				<YAxis width={80} tickFormatter={(v) => formatShortNumber(v as number)} />
				<RechartsTooltip
					formatter={(v) => formatShortNumber(v as number)}
					labelFormatter={labelFormatter}
				/>
				<Legend />
				{seriesConfig.map((config) => (
					<Line
						key={config.dataKey}
						dataKey={config.dataKey}
						name={config.name}
						stroke={config.stroke}
						strokeDasharray={config.strokeDasharray}
						strokeWidth={2}
					/>
				))}
			</LineChart>
		) : (
			<BarChart data={data} margin={margin}>
				<XAxis
					dataKey="date"
					tickFormatter={tickFormatter}
					tickMargin={10}
					interval="preserveStartEnd"
				/>
				<YAxis width={80} tickFormatter={(v) => formatShortNumber(v as number)} />
				<RechartsTooltip
					formatter={(v) => formatShortNumber(v as number)}
					labelFormatter={labelFormatter}
				/>
				<Legend />
				{seriesConfig.map((config) => (
					<Bar
						key={config.dataKey}
						dataKey={config.dataKey}
						name={config.name}
						fill={config.stroke}
						strokeDasharray={config.strokeDasharray}
						strokeWidth={2}
					/>
				))}
			</BarChart>
		)}
	</ResponsiveContainer>
);

interface TimeSeriesChartProps {
	data: TimeSeriesPoint[];
	filter: DateFilter;
	seriesConfig: TimeSeriesConfig[];
	height?: number;
	margin?: typeof DEFAULT_MARGIN;
}

const TimeSeriesChart: React.FC<TimeSeriesChartProps> = ({
	data,
	filter,
	seriesConfig,
	height = DEFAULT_HEIGHT,
	margin = DEFAULT_MARGIN,
}) => {
	const [chartType, setChartType] = useState<ChartType>("line");
	const [exportAnchor, setExportAnchor] = useState<HTMLElement | null>(null);
	const chartWrapperRef = useRef<HTMLDivElement>(null);

	const locale = useMemo(() => getLocale(), []);
	const preset = filter.type === "preset" ? filter.preset : null;

	const { tickFormatter, labelFormatter } = useChartFormatters(locale, preset);

	const handleOpenExport = (e: React.MouseEvent<HTMLElement>) => setExportAnchor(e.currentTarget);
	const handleCloseExport = () => setExportAnchor(null);

	return (
		<Box>
			<ChartControls
				chartType={chartType}
				onChartTypeChange={setChartType}
				exportAnchor={exportAnchor}
				onOpenExport={handleOpenExport}
				onCloseExport={handleCloseExport}
			/>

			<div ref={chartWrapperRef}>
				<ChartRenderer
					type={chartType}
					data={data}
					seriesConfig={seriesConfig}
					tickFormatter={tickFormatter}
					labelFormatter={labelFormatter}
					height={height}
					margin={margin}
				/>
			</div>
		</Box>
	);
};

export default TimeSeriesChart;
