import React from "react";
import { Line, LineChart, ResponsiveContainer, YAxis } from "recharts";
import { formatMoney, formatSignedMoney } from "utils/formatCurrency";

import ArrowDownwardIcon from "@mui/icons-material/ArrowDownward";
import ArrowUpwardIcon from "@mui/icons-material/ArrowUpward";
import PaymentsOutlinedIcon from "@mui/icons-material/PaymentsOutlined";
import TrendingDownIcon from "@mui/icons-material/TrendingDown";
import TrendingUpIcon from "@mui/icons-material/TrendingUp";
import WarningAmberIcon from "@mui/icons-material/WarningAmber";
import { Box, Paper, Typography, useTheme } from "@mui/material";

import { DashboardKpi, DeltaDirection, KpiTone } from "../../models/dashboard";

const KPI_ICON: Record<DashboardKpi["key"], React.ElementType> = {
	revenue: PaymentsOutlinedIcon,
	receivable: TrendingUpIcon,
	payable: TrendingDownIcon,
	overdue: WarningAmberIcon,
};

const DELTA_ICON: Record<DeltaDirection, React.ElementType> = {
	up: ArrowUpwardIcon,
	down: ArrowDownwardIcon,
	warn: WarningAmberIcon,
	flat: ArrowUpwardIcon,
};

const DashboardKpiCard: React.FC<{ kpi: DashboardKpi }> = ({ kpi }) => {
	const theme = useTheme();

	const toneColor: Record<KpiTone, string> = {
		ink: theme.palette.text.primary,
		positive: theme.palette.success.main,
		negative: theme.palette.error.main,
		warning: theme.palette.warning.main,
	};

	const deltaColor: Record<DeltaDirection, string> = {
		up: theme.palette.success.main,
		down: theme.palette.error.main,
		warn: theme.palette.warning.main,
		flat: theme.palette.text.secondary,
	};

	const sparkColor = kpi.tone === "ink" ? theme.palette.primary.main : toneColor[kpi.tone];

	const Icon = KPI_ICON[kpi.key];
	const DeltaIcon = DELTA_ICON[kpi.deltaDirection];
	const valueText = kpi.signed ? formatSignedMoney(kpi.value) : formatMoney(kpi.value);
	const sparkData = kpi.spark.map((value, i) => ({ i, value }));

	return (
		<Paper
			elevation={1}
			sx={{
				border: 1,
				borderColor: "divider",
				borderRadius: 1.5,
				p: 2.5,
				display: "flex",
				flexDirection: "column",
				minWidth: 0,
			}}
		>
			<Box sx={{ display: "flex", alignItems: "center", gap: 1, color: "text.secondary" }}>
				<Icon sx={{ fontSize: 16 }} />
				<Typography variant="body2" sx={{ color: "text.secondary" }}>
					{kpi.caption}
				</Typography>
			</Box>

			<Typography
				sx={{
					mt: 1,
					fontSize: "1.625rem",
					fontWeight: 700,
					letterSpacing: "-0.02em",
					lineHeight: 1.1,
					color: toneColor[kpi.tone],
					fontVariantNumeric: "tabular-nums",
				}}
			>
				{valueText}
				{kpi.unit && (
					<Typography
						component="span"
						sx={{ ml: 0.75, fontSize: "0.8125rem", fontWeight: 500, color: "text.disabled" }}
					>
						{kpi.unit}
					</Typography>
				)}
			</Typography>

			<Box sx={{ display: "flex", alignItems: "center", gap: 1, mt: 1 }}>
				<Box
					sx={{
						display: "inline-flex",
						alignItems: "center",
						gap: 0.25,
						fontSize: "0.75rem",
						fontWeight: 600,
						color: deltaColor[kpi.deltaDirection],
					}}
				>
					<DeltaIcon sx={{ fontSize: 13 }} />
					{kpi.deltaLabel}
				</Box>
				<Typography variant="caption" sx={{ color: "text.disabled" }}>
					{kpi.subLabel}
				</Typography>
			</Box>

			<Box sx={{ height: 34, mt: 1.5 }}>
				<ResponsiveContainer width="100%" height="100%">
					<LineChart data={sparkData} margin={{ top: 2, right: 2, bottom: 2, left: 2 }}>
						<YAxis hide domain={["dataMin", "dataMax"]} />
						<Line
							type="monotone"
							dataKey="value"
							stroke={sparkColor}
							strokeWidth={2}
							dot={false}
							isAnimationActive={false}
						/>
					</LineChart>
				</ResponsiveContainer>
			</Box>
		</Paper>
	);
};

export default DashboardKpiCard;
