import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import LegendSwatch from "components/shared/Chart/LegendSwatch";
import UzsUnit from "components/shared/Money/UzsUnit";
import { heroShade } from "components/shared/StatCard/statTone";
import { DashboardAgingBucket, DashboardAgingBucketKey } from "models/dashboard";
import { designTokens, numericSx, radius, typeScale } from "theme";
import { formatCurrency } from "utils/formatCurrency";

import ReportProblemOutlinedIcon from "@mui/icons-material/ReportProblemOutlined";
import { Box, Paper, Typography, useTheme } from "@mui/material";

import { EASE, usePrefersReducedMotion } from "./motion";

interface Props {
	aging: DashboardAgingBucket[];
	receivableTotal: number;
	/** The served receivable aged 31+ days — shown as its share, the KPI card above has the sum. */
	overdue: number;
}

/**
 * «Нам должны — по давности» — the receivable total, broken into age buckets
 * with a stacked proportion bar and escalating colours; the 31+ days share is
 * named beside the total. Not clickable — an at-a-glance indicator (the user acts
 * from the «Долги» page). Buckets sum to the receivable total.
 */
const AgingPanel: React.FC<Props> = ({ aging, receivableTotal, overdue }) => {
	const { t } = useTranslation();
	const theme = useTheme();

	const bucketColor: Record<DashboardAgingBucketKey, string> = {
		"0-7": theme.palette.success.main,
		"8-30": theme.palette.primary.main,
		"31-60": theme.palette.warning.main,
		"60+": theme.palette.error.main,
	};
	const pct = (amt: number): number =>
		receivableTotal > 0 ? Math.round((amt / receivableTotal) * 100) : 0;
	const hasOverdue = overdue > 0;
	const overdueShare = pct(overdue);

	// Grow the proportion bar in from zero on mount; CSS-transition the widths so
	// they also re-animate smoothly when the period changes.
	const motion = !usePrefersReducedMotion();
	const [grown, setGrown] = useState(!motion);
	useEffect(() => {
		if (!motion) {
			return;
		}
		const id = requestAnimationFrame(() => setGrown(true));
		return () => cancelAnimationFrame(id);
	}, [motion]);

	return (
		<Paper
			elevation={1}
			sx={{
				border: "1px solid",
				borderColor: "divider",
				borderRadius: `${radius.lg}px`,
				display: "flex",
				flexDirection: "column",
				minWidth: 0,
			}}
		>
			<Box sx={{ p: "16px 20px 0" }}>
				<Typography variant="h3" component="h2">
					{t("dashboard.aging.title")}
				</Typography>
			</Box>

			<Box
				sx={{
					display: "flex",
					alignItems: "flex-end",
					justifyContent: "space-between",
					flexWrap: "wrap",
					gap: 1.5,
					p: "16px 20px",
				}}
			>
				<Box sx={{ display: "flex", flexDirection: "column", gap: "4px" }}>
					<Typography variant="body2" sx={{ color: "text.secondary" }}>
						{t("dashboard.aging.total")}
					</Typography>
					<Typography
						component="div"
						sx={{ ...typeScale.numStrong, lineHeight: 1.1, color: heroShade("success.main") }}
					>
						{formatCurrency(receivableTotal)}
						<UzsUnit sx={{ fontSize: 13 }} />
					</Typography>
				</Box>
				{hasOverdue && (
					<Box
						sx={{
							display: "inline-flex",
							alignItems: "center",
							gap: "6px",
							typography: "body2",
							fontWeight: 600,
							color: designTokens.saffron700,
						}}
					>
						<ReportProblemOutlinedIcon sx={{ fontSize: 16, color: "warning.main" }} />
						{t("dashboard.aging.overdueShare", { pct: overdueShare })}
					</Box>
				)}
			</Box>

			<Box
				sx={{
					display: "flex",
					height: 10,
					borderRadius: `${radius.pill}px`,
					overflow: "hidden",
					mx: "20px",
					mb: "16px",
					bgcolor: "grey.100",
				}}
			>
				{aging.map((b, i) => (
					<Box
						key={b.bucket}
						sx={{
							width: grown ? `${pct(b.amount)}%` : 0,
							height: "100%",
							bgcolor: bucketColor[b.bucket],
							transition: motion ? `width .8s ${EASE} ${i * 90}ms` : "none",
						}}
					/>
				))}
			</Box>

			<Box sx={{ display: "flex", flexDirection: "column", gap: "13px", p: "2px 20px 20px" }}>
				{aging.map((b) => (
					<Box
						key={b.bucket}
						sx={{
							display: "grid",
							gridTemplateColumns: "12px 1fr auto",
							alignItems: "center",
							gap: "11px",
						}}
					>
						<LegendSwatch color={bucketColor[b.bucket]} />
						<Box sx={{ typography: "body2", color: designTokens.gray700 }}>
							{t(`dashboard.aging.bucket.${b.bucket}`)}
							<Box
								component="span"
								sx={{ ...numericSx, typography: "caption", color: "text.secondary", ml: "7px" }}
							>
								{pct(b.amount)}%
							</Box>
						</Box>
						<Box component="span" sx={{ ...numericSx, typography: "body1", fontWeight: 600 }}>
							{formatCurrency(b.amount)}
						</Box>
					</Box>
				))}
			</Box>
		</Paper>
	);
};

export default AgingPanel;
