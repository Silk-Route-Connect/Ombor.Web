import React from "react";
import { useTranslation } from "react-i18next";
import { DashboardSeriesPoint } from "models/dashboard";
import {
	Area,
	Bar,
	BarChart,
	CartesianGrid,
	ComposedChart,
	ReferenceLine,
	ResponsiveContainer,
	Tooltip,
	XAxis,
	YAxis,
} from "recharts";
import { designTokens } from "theme";
import { formatCurrency, formatShortNumber } from "utils/formatCurrency";

import { useTheme } from "@mui/material";

import ChartTooltip from "./ChartTooltip";
import { KassaSelection } from "./KassaFilter";
import { usePrefersReducedMotion } from "./motion";

const HEIGHT = 230;
const AXIS_TICK = { fontSize: 11, fontWeight: 600, fill: designTokens.gray600 } as const;

type Row = { label: string; payin: number; payout: number; payoutNeg: number; net: number };

interface Props {
	series: DashboardSeriesPoint[];
	chartType: "bar" | "line";
	kassa: KassaSelection;
}

/**
 * «Платежи» — money in vs out per period. Diverging bars (green in above the
 * axis, red out below) by default; toggle to a net-flow line. The wallet filter
 * (`kassa`) narrows both series to one money location. Answers "is cash actually
 * flowing in or out?" — distinct from sales/supplies because of credit.
 */
const PaymentsChart: React.FC<Props> = ({ series, chartType, kassa }) => {
	const { t } = useTranslation();
	const theme = useTheme();
	const green = theme.palette.success.main;
	const red = theme.palette.error.main;
	const net = theme.palette.primary.main;
	const reduced = usePrefersReducedMotion();
	const anim = {
		isAnimationActive: !reduced,
		animationDuration: 850,
		animationEasing: "ease-out",
	} as const;

	const rows: Row[] = series.map((p) => {
		const payin = kassa === "all" ? p.payin : (p.walletPayin[kassa] ?? 0);
		const payout = kassa === "all" ? p.payout : (p.walletPayout[kassa] ?? 0);
		return { label: p.label, payin, payout, payoutNeg: -payout, net: payin - payout };
	});

	const renderTooltip = ({ active, label }: { active?: boolean; label?: string }) => {
		if (!active) return null;
		const row = rows.find((r) => r.label === label);
		if (!row) return null;
		return (
			<ChartTooltip
				heading={row.label}
				rows={[
					{ label: t("dashboard.chart.payin"), color: green, value: formatCurrency(row.payin) },
					{ label: t("dashboard.chart.payout"), color: red, value: formatCurrency(row.payout) },
					{
						label: t("dashboard.chart.net"),
						color: net,
						value: formatCurrency(row.net),
						divider: true,
					},
				]}
			/>
		);
	};

	return (
		<ResponsiveContainer width="100%" height={HEIGHT}>
			{chartType === "bar" ? (
				<BarChart data={rows} stackOffset="sign" margin={{ top: 8, right: 12, bottom: 0, left: 0 }}>
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
						tickFormatter={(v) => formatShortNumber(Math.abs(v as number))}
					/>
					<ReferenceLine y={0} stroke={designTokens.gray400} strokeWidth={1.3} />
					<Tooltip content={renderTooltip} cursor={{ fill: "rgba(18,103,107,0.05)" }} />
					<Bar dataKey="payin" fill={green} radius={[3, 3, 0, 0]} maxBarSize={14} {...anim} />
					<Bar
						dataKey="payoutNeg"
						fill={red}
						radius={[0, 0, 3, 3]}
						maxBarSize={14}
						{...anim}
						animationBegin={120}
					/>
				</BarChart>
			) : (
				<ComposedChart data={rows} margin={{ top: 8, right: 12, bottom: 0, left: 0 }}>
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
					<ReferenceLine y={0} stroke={designTokens.gray400} strokeWidth={1.3} />
					<Tooltip
						content={renderTooltip}
						cursor={{ stroke: designTokens.gray300, strokeDasharray: "3 3" }}
					/>
					<Area
						type="linear"
						dataKey="net"
						stroke={net}
						strokeWidth={2.4}
						fill={net}
						fillOpacity={0.07}
						dot={{ r: 2.6, fill: net, strokeWidth: 0 }}
						{...anim}
					/>
				</ComposedChart>
			)}
		</ResponsiveContainer>
	);
};

export default PaymentsChart;
