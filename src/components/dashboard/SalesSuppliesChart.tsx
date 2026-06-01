import React, { useRef, useState } from "react";
import { translate } from "i18n/i18n";
import {
	Area,
	AreaChart,
	Bar,
	BarChart,
	CartesianGrid,
	ResponsiveContainer,
	Tooltip,
	XAxis,
	YAxis,
} from "recharts";
import { formatShortNumber } from "utils/formatCurrency";

import { Box, useTheme } from "@mui/material";

import { DashboardSeriesPoint } from "../../models/dashboard";
import ChartDownloadButton from "./ChartDownloadButton";
import ChartLegend from "./ChartLegend";
import ChartTooltip from "./ChartTooltip";
import DashboardPanel from "./DashboardPanel";
import SegmentedControl from "./SegmentedControl";

type ChartType = "line" | "bar";

const SalesSuppliesChart: React.FC<{ series: DashboardSeriesPoint[] }> = ({ series }) => {
	const theme = useTheme();
	const panelRef = useRef<HTMLDivElement>(null);
	const [type, setType] = useState<ChartType>("line");

	const salesColor = theme.palette.primary.main;
	const suppliesColor = theme.palette.secondary.main;

	const axisStyle = { fontSize: 11, fill: theme.palette.text.disabled } as const;

	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	const renderTooltip = ({ active, payload, label }: any) => {
		if (!active || !payload?.length) {
			return null;
		}
		return (
			<ChartTooltip
				title={label}
				rows={[
					{
						label: translate("dashboard.legend.sales"),
						value: payload[0]?.payload.sales,
						color: salesColor,
					},
					{
						label: translate("dashboard.legend.supplies"),
						value: payload[0]?.payload.supplies,
						color: suppliesColor,
					},
				]}
			/>
		);
	};

	return (
		<DashboardPanel
			ref={panelRef}
			title={translate("dashboard.charts.salesSupplies.title")}
			subtitle={translate("dashboard.charts.salesSupplies.sub")}
			action={
				<Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
					<SegmentedControl<ChartType>
						value={type}
						onChange={setType}
						size="sm"
						options={[
							{ value: "line", label: translate("dashboard.charts.type.line") },
							{ value: "bar", label: translate("dashboard.charts.type.bar") },
						]}
					/>
					<ChartDownloadButton target={panelRef} fileName="ombor-sales-supplies" />
				</Box>
			}
		>
			<ChartLegend
				entries={[
					{ label: translate("dashboard.legend.sales"), color: salesColor },
					{ label: translate("dashboard.legend.supplies"), color: suppliesColor },
				]}
			/>
			<ResponsiveContainer width="100%" height={230}>
				{type === "line" ? (
					<AreaChart data={series} margin={{ top: 8, right: 8, bottom: 0, left: 0 }}>
						<defs>
							<linearGradient id="gradSales" x1="0" y1="0" x2="0" y2="1">
								<stop offset="0%" stopColor={salesColor} stopOpacity={0.18} />
								<stop offset="100%" stopColor={salesColor} stopOpacity={0} />
							</linearGradient>
							<linearGradient id="gradSupplies" x1="0" y1="0" x2="0" y2="1">
								<stop offset="0%" stopColor={suppliesColor} stopOpacity={0.18} />
								<stop offset="100%" stopColor={suppliesColor} stopOpacity={0} />
							</linearGradient>
						</defs>
						<CartesianGrid vertical={false} stroke={theme.palette.divider} />
						<XAxis dataKey="label" tick={axisStyle} tickLine={false} axisLine={false} />
						<YAxis
							tick={axisStyle}
							tickLine={false}
							axisLine={false}
							width={48}
							tickFormatter={formatShortNumber}
						/>
						<Tooltip content={renderTooltip} cursor={{ stroke: theme.palette.text.disabled }} />
						<Area
							type="monotone"
							dataKey="sales"
							stroke={salesColor}
							strokeWidth={2.4}
							fill="url(#gradSales)"
							isAnimationActive={false}
						/>
						<Area
							type="monotone"
							dataKey="supplies"
							stroke={suppliesColor}
							strokeWidth={2.4}
							fill="url(#gradSupplies)"
							isAnimationActive={false}
						/>
					</AreaChart>
				) : (
					<BarChart data={series} margin={{ top: 8, right: 8, bottom: 0, left: 0 }}>
						<CartesianGrid vertical={false} stroke={theme.palette.divider} />
						<XAxis dataKey="label" tick={axisStyle} tickLine={false} axisLine={false} />
						<YAxis
							tick={axisStyle}
							tickLine={false}
							axisLine={false}
							width={48}
							tickFormatter={formatShortNumber}
						/>
						<Tooltip content={renderTooltip} cursor={{ fill: theme.palette.action.hover }} />
						<Bar
							dataKey="sales"
							fill={salesColor}
							radius={[3, 3, 0, 0]}
							isAnimationActive={false}
						/>
						<Bar
							dataKey="supplies"
							fill={suppliesColor}
							radius={[3, 3, 0, 0]}
							isAnimationActive={false}
						/>
					</BarChart>
				)}
			</ResponsiveContainer>
		</DashboardPanel>
	);
};

export default SalesSuppliesChart;
