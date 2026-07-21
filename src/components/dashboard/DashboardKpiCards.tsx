import React from "react";
import { useTranslation } from "react-i18next";
import { DashboardData } from "models/dashboard";
import { Line, LineChart, ResponsiveContainer } from "recharts";
import { designTokens, numericSx } from "theme";
import { formatCurrency } from "utils/formatCurrency";

import LocalAtmOutlinedIcon from "@mui/icons-material/LocalAtmOutlined";
import NorthEastIcon from "@mui/icons-material/NorthEast";
import ReportProblemOutlinedIcon from "@mui/icons-material/ReportProblemOutlined";
import SouthEastIcon from "@mui/icons-material/SouthEast";
import { Box, Paper, Typography } from "@mui/material";

import { staggerChildrenSx, useCountUp, usePrefersReducedMotion } from "./motion";

type Delta = { pct: number | null; tone: "up" | "down" | "flat" | "warn"; text: string };

type CardSpec = {
	key: string;
	icon: React.ReactNode;
	caption: string;
	/** Raw money amount — counted up on mount / period change. */
	value: number;
	/** UZS unit suffix, when the value is a plain money amount. */
	unit?: boolean;
	valueColor: string;
	sparkColor: string;
	trend: number[];
	delta: Delta;
	footnote: string;
	onClick: () => void;
};

const DeltaBadge: React.FC<{ delta: Delta }> = ({ delta }) => {
	const color =
		delta.tone === "up"
			? "success.main"
			: delta.tone === "down"
				? "error.main"
				: delta.tone === "warn"
					? "warning.main"
					: "text.secondary";
	const icon =
		delta.tone === "warn" ? (
			<ReportProblemOutlinedIcon sx={{ fontSize: 12 }} />
		) : delta.tone === "down" ? (
			<SouthEastIcon sx={{ fontSize: 13 }} />
		) : (
			<NorthEastIcon sx={{ fontSize: 13 }} />
		);
	return (
		<Box
			component="span"
			sx={{ display: "inline-flex", alignItems: "center", gap: "3px", fontWeight: 600, color }}
		>
			{icon}
			{delta.text}
		</Box>
	);
};

const KpiCard: React.FC<{ spec: CardSpec }> = ({ spec }) => {
	const animated = useCountUp(spec.value);
	const reduced = usePrefersReducedMotion();

	return (
		<Paper
			elevation={1}
			onClick={spec.onClick}
			sx={{
				position: "relative",
				minWidth: 0,
				border: "1px solid",
				borderColor: "divider",
				borderRadius: "12px",
				p: "16px 18px 14px",
				cursor: "pointer",
				transition: "box-shadow .15s, border-color .15s, transform .15s",
				"&:hover": {
					boxShadow: 8,
					borderColor: designTokens.gray300,
					transform: "translateY(-2px)",
					"& .go-arrow": { opacity: 1 },
					"& .kpi-spark": { opacity: 1 },
				},
			}}
		>
			<Box
				className="go-arrow"
				sx={{
					position: "absolute",
					top: 16,
					right: 16,
					color: "text.disabled",
					opacity: 0,
					transition: "opacity .15s",
				}}
			>
				<NorthEastIcon sx={{ fontSize: 15 }} />
			</Box>

			<Box
				sx={{
					display: "flex",
					alignItems: "center",
					gap: "7px",
					fontSize: 12.5,
					color: "text.secondary",
				}}
			>
				<Box sx={{ display: "inline-flex", color: "text.disabled" }}>{spec.icon}</Box>
				{spec.caption}
			</Box>

			<Typography
				sx={{
					...numericSx,
					fontWeight: 700,
					fontSize: 26,
					letterSpacing: "-0.02em",
					mt: "9px",
					lineHeight: 1.05,
					color: spec.valueColor,
				}}
			>
				{formatCurrency(Math.round(animated))}
				{spec.unit && (
					<Box
						component="span"
						sx={{ fontSize: 13, fontWeight: 500, color: "text.disabled", ml: "6px" }}
					>
						UZS
					</Box>
				)}
			</Typography>

			<Box
				sx={{
					display: "flex",
					alignItems: "center",
					gap: "8px",
					mt: "9px",
					fontSize: 12,
					flexWrap: "wrap",
				}}
			>
				<DeltaBadge delta={spec.delta} />
				<Box component="span" sx={{ fontSize: 12, color: "text.secondary" }}>
					{spec.footnote}
				</Box>
			</Box>

			<Box
				className="kpi-spark"
				sx={{ height: 34, mt: "10px", mx: "-2px", opacity: 0.85, transition: "opacity .15s" }}
			>
				<ResponsiveContainer width="100%" height="100%">
					<LineChart
						data={spec.trend.map((value) => ({ value }))}
						margin={{ top: 4, right: 2, bottom: 2, left: 2 }}
					>
						<Line
							type="monotone"
							dataKey="value"
							stroke={spec.sparkColor}
							strokeWidth={2}
							dot={false}
							isAnimationActive={!reduced}
							animationDuration={900}
							animationEasing="ease-out"
						/>
					</LineChart>
				</ResponsiveContainer>
			</Box>
		</Paper>
	);
};

interface Props {
	data: DashboardData;
	onRevenue: () => void;
	onReceivable: () => void;
	onPayable: () => void;
	onOverdue: () => void;
}

/**
 * Four KPI summary cards — Выручка, Нам должны, Мы должны, Просрочено. Hero
 * tabular number, period-over-period delta badge, sparkline; each is a clickable
 * navigation target. Per locked pattern 4, receivable / payable show colour only
 * (no +/− signs) — the caption carries the meaning, matching the «Долги» cards.
 */
const DashboardKpiCards: React.FC<Props> = ({
	data,
	onRevenue,
	onReceivable,
	onPayable,
	onOverdue,
}) => {
	const { t } = useTranslation();
	const motion = !usePrefersReducedMotion();

	const pct = (v: number | null | undefined): string =>
		v === null || v === undefined ? "—" : `${v > 0 ? "+" : ""}${v.toFixed(1)}%`;
	const openWord = (n: number): string => t("dashboard.kpi.open", { count: n });

	const cards: CardSpec[] = [
		{
			key: "revenue",
			icon: <LocalAtmOutlinedIcon sx={{ fontSize: 16 }} />,
			caption: t("dashboard.kpi.revenue"),
			value: data.revenue.value,
			unit: true,
			valueColor: "text.primary",
			sparkColor: "#12676B",
			trend: data.revenue.trend,
			delta: {
				pct: data.revenue.deltaPct,
				tone: "up",
				text: data.revenue.deltaPct === null ? "—" : pct(data.revenue.deltaPct),
			},
			footnote: t("dashboard.kpi.vsPrevPeriod"),
			onClick: onRevenue,
		},
		{
			key: "receivable",
			icon: <NorthEastIcon sx={{ fontSize: 15 }} />,
			caption: t("dashboard.kpi.receivable"),
			value: data.receivable.value,
			valueColor: "success.main",
			sparkColor: "#17835A",
			trend: data.receivable.trend,
			delta: {
				pct: data.receivable.deltaPct,
				tone: "up",
				text: data.receivable.deltaPct === null ? "—" : pct(data.receivable.deltaPct),
			},
			footnote: openWord(data.receivable.count),
			onClick: onReceivable,
		},
		{
			key: "payable",
			icon: <SouthEastIcon sx={{ fontSize: 15 }} />,
			caption: t("dashboard.kpi.payable"),
			value: data.payable.value,
			valueColor: "error.main",
			sparkColor: "#C53D31",
			trend: data.payable.trend,
			delta: {
				pct: data.payable.deltaPct,
				tone: "down",
				text: data.payable.deltaPct === null ? "—" : pct(data.payable.deltaPct),
			},
			footnote: openWord(data.payable.count),
			onClick: onPayable,
		},
		{
			key: "overdue",
			icon: <ReportProblemOutlinedIcon sx={{ fontSize: 15 }} />,
			caption: t("dashboard.kpi.overdue"),
			value: data.overdue.value,
			unit: true,
			valueColor: "warning.main",
			sparkColor: "#C57E14",
			trend: data.overdue.trend,
			delta: {
				pct: null,
				tone: "warn",
				text: t("debt.summary.txCount", { count: data.overdue.count }),
			},
			footnote: t("dashboard.kpi.partners", { count: data.overdue.partnerCount }),
			onClick: onOverdue,
		},
	];

	return (
		<Box
			sx={{
				display: "grid",
				gridTemplateColumns: { xs: "1fr", sm: "repeat(2, 1fr)", lg: "repeat(4, 1fr)" },
				gap: "16px",
				mb: "16px",
				...staggerChildrenSx(4, motion),
			}}
		>
			{cards.map((spec) => (
				<KpiCard key={spec.key} spec={spec} />
			))}
		</Box>
	);
};

export default DashboardKpiCards;
