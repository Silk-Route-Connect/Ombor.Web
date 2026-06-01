import React, { useRef, useState } from "react";
import { translate } from "i18n/i18n";
import {
	Area,
	AreaChart,
	Bar,
	BarChart,
	CartesianGrid,
	ReferenceLine,
	ResponsiveContainer,
	Tooltip,
	XAxis,
	YAxis,
} from "recharts";
import { formatShortNumber } from "utils/formatCurrency";

import { Box, useTheme } from "@mui/material";

import { DashboardSeriesPoint, DashboardWallet } from "../../models/dashboard";
import ChartDownloadButton from "./ChartDownloadButton";
import ChartLegend from "./ChartLegend";
import ChartTooltip from "./ChartTooltip";
import DashboardPanel from "./DashboardPanel";
import SegmentedControl from "./SegmentedControl";
import WalletSelector, { ALL_WALLETS } from "./WalletSelector";

type PaymentsChartType = "bar" | "net";

interface PaymentsChartProps {
	series: DashboardSeriesPoint[];
	wallets: DashboardWallet[];
}

const PaymentsChart: React.FC<PaymentsChartProps> = ({ series, wallets }) => {
	const theme = useTheme();
	const panelRef = useRef<HTMLDivElement>(null);
	const [type, setType] = useState<PaymentsChartType>("bar");
	const [kassa, setKassa] = useState<string>(ALL_WALLETS);

	const payinColor = theme.palette.success.main;
	const payoutColor = theme.palette.error.main;
	const netColor = theme.palette.primary.main;
	const axisStyle = { fontSize: 11, fill: theme.palette.text.disabled } as const;

	const walletIndex = wallets.findIndex((w) => w.id === kassa);
	const data = series.map((d) => {
		const payin = kassa === ALL_WALLETS ? d.payin : (d.kin[walletIndex] ?? 0);
		const payout = kassa === ALL_WALLETS ? d.payout : (d.kout[walletIndex] ?? 0);
		return { label: d.label, payin, payout, payoutNeg: -payout, net: payin - payout };
	});

	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	const renderTooltip = ({ active, payload, label }: any) => {
		if (!active || !payload?.length) {
			return null;
		}
		const d = payload[0]?.payload as { payin: number; payout: number };
		return (
			<ChartTooltip
				title={label}
				rows={[
					{
						label: translate("dashboard.legend.payin"),
						value: d.payin,
						color: payinColor,
						signed: true,
					},
					{
						label: translate("dashboard.legend.payout"),
						value: -d.payout,
						color: payoutColor,
						signed: true,
					},
					{
						label: translate("dashboard.legend.net"),
						value: d.payin - d.payout,
						color: netColor,
						signed: true,
						emphasize: true,
					},
				]}
			/>
		);
	};

	return (
		<DashboardPanel
			ref={panelRef}
			title={translate("dashboard.payments.title")}
			subtitle={translate("dashboard.payments.sub")}
			action={
				<Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
					<WalletSelector wallets={wallets} value={kassa} onChange={setKassa} />
					<SegmentedControl<PaymentsChartType>
						value={type}
						onChange={setType}
						size="sm"
						options={[
							{ value: "bar", label: translate("dashboard.charts.type.bar") },
							{ value: "net", label: translate("dashboard.charts.type.net") },
						]}
					/>
					<ChartDownloadButton target={panelRef} fileName="ombor-payments" />
				</Box>
			}
		>
			<ChartLegend
				entries={[
					{ label: translate("dashboard.legend.payin"), color: payinColor },
					{ label: translate("dashboard.legend.payout"), color: payoutColor },
				]}
			/>
			<ResponsiveContainer width="100%" height={250}>
				{type === "bar" ? (
					<BarChart
						data={data}
						margin={{ top: 8, right: 8, bottom: 0, left: 0 }}
						stackOffset="sign"
					>
						<CartesianGrid vertical={false} stroke={theme.palette.divider} />
						<XAxis dataKey="label" tick={axisStyle} tickLine={false} axisLine={false} />
						<YAxis
							tick={axisStyle}
							tickLine={false}
							axisLine={false}
							width={48}
							tickFormatter={(v: number) => formatShortNumber(Math.abs(v))}
						/>
						<ReferenceLine y={0} stroke={theme.palette.text.disabled} />
						<Tooltip content={renderTooltip} cursor={{ fill: theme.palette.action.hover }} />
						<Bar
							dataKey="payin"
							fill={payinColor}
							radius={[3, 3, 0, 0]}
							isAnimationActive={false}
						/>
						<Bar
							dataKey="payoutNeg"
							fill={payoutColor}
							radius={[0, 0, 3, 3]}
							isAnimationActive={false}
						/>
					</BarChart>
				) : (
					<AreaChart data={data} margin={{ top: 8, right: 8, bottom: 0, left: 0 }}>
						<defs>
							<linearGradient id="gradNet" x1="0" y1="0" x2="0" y2="1">
								<stop offset="0%" stopColor={netColor} stopOpacity={0.18} />
								<stop offset="100%" stopColor={netColor} stopOpacity={0} />
							</linearGradient>
						</defs>
						<CartesianGrid vertical={false} stroke={theme.palette.divider} />
						<XAxis dataKey="label" tick={axisStyle} tickLine={false} axisLine={false} />
						<YAxis
							tick={axisStyle}
							tickLine={false}
							axisLine={false}
							width={48}
							tickFormatter={(v: number) => formatShortNumber(Math.abs(v))}
						/>
						<ReferenceLine y={0} stroke={theme.palette.text.disabled} />
						<Tooltip content={renderTooltip} cursor={{ stroke: theme.palette.text.disabled }} />
						<Area
							type="monotone"
							dataKey="net"
							stroke={netColor}
							strokeWidth={2.4}
							fill="url(#gradNet)"
							isAnimationActive={false}
						/>
					</AreaChart>
				)}
			</ResponsiveContainer>
		</DashboardPanel>
	);
};

export default PaymentsChart;
