import React from "react";
import { useTranslation } from "react-i18next";
import { DashboardSeriesPoint } from "models/dashboard";
import {
	Area,
	Bar,
	BarChart,
	CartesianGrid,
	ComposedChart,
	ResponsiveContainer,
	Tooltip,
	XAxis,
	YAxis,
} from "recharts";
import { formatCurrency, formatShortNumber } from "utils/formatCurrency";

import { useTheme } from "@mui/material";

import ChartTooltip from "./ChartTooltip";
import { usePrefersReducedMotion } from "./motion";

const HEIGHT = 230;
const AXIS_TICK = { fontSize: 11, fontWeight: 600, fill: "#5E6E6E" } as const;

interface Props {
	series: DashboardSeriesPoint[];
	chartType: "line" | "bar";
}

/**
 * «Динамика продаж и поставок» — sales vs supplies over the period. Smooth
 * area-filled lines by default (cleaner for comparing two trends), bars on
 * toggle. Teal = sales (primary), saffron = supplies (accent).
 */
const SalesSuppliesChart: React.FC<Props> = ({ series, chartType }) => {
	const { t } = useTranslation();
	const theme = useTheme();
	const sales = theme.palette.primary.main;
	const supplies = theme.palette.secondary.main;
	const reduced = usePrefersReducedMotion();
	const anim = {
		isAnimationActive: !reduced,
		animationDuration: 850,
		animationEasing: "ease-out",
	} as const;

	const renderTooltip = ({ active, label }: { active?: boolean; label?: string }) => {
		if (!active) return null;
		const point = series.find((p) => p.label === label);
		if (!point) return null;
		return (
			<ChartTooltip
				heading={point.label}
				rows={[
					{ label: t("dashboard.chart.sales"), color: sales, value: formatCurrency(point.sales) },
					{
						label: t("dashboard.chart.supplies"),
						color: supplies,
						value: formatCurrency(point.supplies),
					},
				]}
			/>
		);
	};

	return (
		<ResponsiveContainer width="100%" height={HEIGHT}>
			{chartType === "line" ? (
				<ComposedChart data={series} margin={{ top: 8, right: 12, bottom: 0, left: 0 }}>
					<CartesianGrid vertical={false} stroke={theme.palette.divider} />
					<XAxis
						dataKey="label"
						tickLine={false}
						axisLine={false}
						tick={AXIS_TICK}
						tickMargin={8}
					/>
					<YAxis
						width={56}
						tickLine={false}
						axisLine={false}
						tick={AXIS_TICK}
						tickFormatter={(v) => formatShortNumber(v as number)}
					/>
					<Tooltip content={renderTooltip} cursor={{ stroke: "#CDD6D5", strokeDasharray: "3 3" }} />
					<Area
						type="monotone"
						dataKey="sales"
						stroke={sales}
						strokeWidth={2.4}
						fill={sales}
						fillOpacity={0.13}
						{...anim}
					/>
					<Area
						type="monotone"
						dataKey="supplies"
						stroke={supplies}
						strokeWidth={2.4}
						fill={supplies}
						fillOpacity={0.13}
						{...anim}
						animationBegin={120}
					/>
				</ComposedChart>
			) : (
				<BarChart data={series} margin={{ top: 8, right: 12, bottom: 0, left: 0 }}>
					<CartesianGrid vertical={false} stroke={theme.palette.divider} />
					<XAxis
						dataKey="label"
						tickLine={false}
						axisLine={false}
						tick={AXIS_TICK}
						tickMargin={8}
					/>
					<YAxis
						width={56}
						tickLine={false}
						axisLine={false}
						tick={AXIS_TICK}
						tickFormatter={(v) => formatShortNumber(v as number)}
					/>
					<Tooltip content={renderTooltip} cursor={{ fill: "rgba(18,103,107,0.05)" }} />
					<Bar dataKey="sales" fill={sales} radius={[3, 3, 0, 0]} maxBarSize={16} {...anim} />
					<Bar
						dataKey="supplies"
						fill={supplies}
						radius={[3, 3, 0, 0]}
						maxBarSize={16}
						{...anim}
						animationBegin={120}
					/>
				</BarChart>
			)}
		</ResponsiveContainer>
	);
};

export default SalesSuppliesChart;
