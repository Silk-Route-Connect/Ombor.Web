import React from "react";
import { useTranslation } from "react-i18next";
import ChartPanel from "components/shared/Chart/ChartPanel";
import ChartTooltip from "components/shared/Chart/ChartTooltip";
import {
	Bar,
	BarChart,
	CartesianGrid,
	ReferenceLine,
	ResponsiveContainer,
	Tooltip,
	XAxis,
	YAxis,
} from "recharts";
import { designTokens } from "theme";
import { formatCurrencyMinus, formatShortNumber } from "utils/formatCurrency";

import { Box, useTheme } from "@mui/material";

import { ReportChartPoint, ReportChartSpec } from "../View/types";

const TIME_HEIGHT = 240;
const RANK_ROW = 34;
const AXIS_TICK = { fontSize: 11, fontWeight: 600, fill: designTokens.gray600 } as const;
const NAME_TICK_CHARS = 22;

const shorten = (text: string): string =>
	text.length > NAME_TICK_CHARS ? `${text.slice(0, NAME_TICK_CHARS - 1)}…` : text;

/**
 * The report's chart in the shared `ChartPanel`: bars per calendar bucket
 * (oldest first, every bucket — no gaps), or the largest rows as horizontal
 * bars. Values are the served figures; a loss dips below the zero line.
 */
const ReportChart: React.FC<{ spec: ReportChartSpec }> = ({ spec }) => {
	const { t } = useTranslation();
	const theme = useTheme();
	const colorOf = (key: string): string => {
		const series = spec.series.find((s) => s.key === key);
		return series ? theme.palette[series.color].main : designTokens.gray400;
	};

	const data = spec.points.map((point) => ({ key: point.key, ...point.values }));
	const byKey = new Map<string, ReportChartPoint>(spec.points.map((p) => [p.key, p]));
	const hasNegative = spec.points.some((p) => Object.values(p.values).some((v) => v < 0));
	const ranking = spec.layout === "ranking";

	const renderTooltip = ({ active, label }: { active?: boolean; label?: string }) => {
		const point = active && label != null ? byKey.get(String(label)) : undefined;
		if (!point) {
			return null;
		}
		return (
			<ChartTooltip
				heading={point.heading}
				rows={spec.series.map((s) => ({
					label: s.label,
					color: colorOf(s.key),
					value: formatCurrencyMinus(point.values[s.key] ?? 0),
				}))}
			/>
		);
	};

	const tickOf = (key: unknown): string => {
		const tick = byKey.get(String(key))?.tick ?? "";
		return ranking ? shorten(tick) : tick;
	};

	const valueAxis = {
		tickLine: false,
		axisLine: false,
		tick: AXIS_TICK,
		tickFormatter: (v: number) => formatShortNumber(v),
	} as const;

	return (
		<Box sx={{ mb: "16px" }}>
			<ChartPanel
				title={spec.title}
				subtitle={spec.subtitle}
				legend={spec.series.map((s) => ({ label: s.label, color: colorOf(s.key) }))}
			>
				{spec.points.length === 0 ? (
					<Box sx={{ p: "32px 12px", textAlign: "center", fontSize: 13, color: "text.secondary" }}>
						{t("report.chart.empty")}
					</Box>
				) : (
					<ResponsiveContainer
						width="100%"
						height={ranking ? Math.max(120, spec.points.length * RANK_ROW + 40) : TIME_HEIGHT}
					>
						<BarChart
							data={data}
							layout={ranking ? "vertical" : "horizontal"}
							margin={{ top: 8, right: 16, bottom: 0, left: 0 }}
						>
							<CartesianGrid
								vertical={ranking}
								horizontal={!ranking}
								stroke={theme.palette.divider}
							/>
							{/* Axes stay direct children of the chart: recharts 2 reads them through
							    react-is 18, which does not see a React 19 fragment, so an axis
							    wrapped in <></> is silently dropped. */}
							{ranking ? (
								<XAxis type="number" {...valueAxis} />
							) : (
								<XAxis
									dataKey="key"
									interval={Math.max(0, Math.ceil(spec.points.length / 12) - 1)}
									tickLine={false}
									axisLine={false}
									tick={AXIS_TICK}
									tickMargin={8}
									tickFormatter={tickOf}
								/>
							)}
							{ranking ? (
								<YAxis
									type="category"
									dataKey="key"
									width={170}
									interval={0}
									tickLine={false}
									axisLine={false}
									tick={AXIS_TICK}
									tickFormatter={tickOf}
								/>
							) : (
								<YAxis width={60} {...valueAxis} />
							)}
							{hasNegative && (
								<ReferenceLine {...(ranking ? { x: 0 } : { y: 0 })} stroke={designTokens.gray400} />
							)}
							<Tooltip content={renderTooltip} cursor={{ fill: designTokens.primaryWash }} />
							{spec.series.map((s) => (
								<Bar
									key={s.key}
									dataKey={s.key}
									fill={colorOf(s.key)}
									radius={ranking ? [0, 3, 3, 0] : [3, 3, 0, 0]}
									maxBarSize={ranking ? 14 : 28}
									isAnimationActive={false}
								/>
							))}
						</BarChart>
					</ResponsiveContainer>
				)}
			</ChartPanel>
		</Box>
	);
};

export default ReportChart;
