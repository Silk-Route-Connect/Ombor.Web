import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { DashboardAgingBucket, DashboardAgingBucketKey } from "models/dashboard";
import { designTokens, numericSx } from "theme";
import { formatCurrency } from "utils/formatCurrency";

import ReportProblemOutlinedIcon from "@mui/icons-material/ReportProblemOutlined";
import { Box, Paper, Typography, useTheme } from "@mui/material";

import { txWord } from "../debt/DebtSummaryCards";
import { EASE, usePrefersReducedMotion } from "./motion";

interface Props {
	aging: DashboardAgingBucket[];
	receivableTotal: number;
	overdue: number;
	overdueCount: number;
}

/**
 * «Дебиторка по срокам» — receivables broken into age buckets with a stacked
 * proportion bar and escalating colours, an overdue (31+ days) banner, and a
 * "total to receive" footer. Not clickable — an at-a-glance indicator (the user
 * acts from the «Долги» page). Buckets sum to the receivable total.
 */
const AgingPanel: React.FC<Props> = ({ aging, receivableTotal, overdue, overdueCount }) => {
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
				borderRadius: "12px",
				display: "flex",
				flexDirection: "column",
				minWidth: 0,
			}}
		>
			<Box sx={{ p: "16px 20px 0" }}>
				<Typography sx={{ fontSize: 15, fontWeight: 600 }}>{t("dashboard.aging.title")}</Typography>
			</Box>

			<Box
				sx={{
					display: "flex",
					alignItems: "center",
					justifyContent: "space-between",
					gap: 1.5,
					p: "16px 20px",
				}}
			>
				<Box sx={{ display: "flex", flexDirection: "column", gap: "3px" }}>
					<Typography sx={{ fontSize: 12.5, color: "text.secondary" }}>
						{t("dashboard.aging.overdueLabel")}
					</Typography>
					<Typography
						sx={{
							...numericSx,
							fontSize: 26,
							fontWeight: 700,
							letterSpacing: "-0.02em",
							lineHeight: 1,
							color: hasOverdue ? "warning.main" : "text.disabled",
						}}
					>
						{formatCurrency(overdue)}
					</Typography>
				</Box>
				{hasOverdue && (
					<Box
						component="span"
						sx={{
							display: "inline-flex",
							alignItems: "center",
							gap: "5px",
							fontSize: 12,
							fontWeight: 600,
							px: "10px",
							py: "4px",
							borderRadius: "999px",
							bgcolor: designTokens.warningBg,
							color: "#C57E14",
							whiteSpace: "nowrap",
						}}
					>
						<ReportProblemOutlinedIcon sx={{ fontSize: 13 }} />
						{overdueCount} {txWord(overdueCount)}
					</Box>
				)}
			</Box>

			<Box
				sx={{
					display: "flex",
					height: 10,
					borderRadius: "999px",
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

			<Box sx={{ display: "flex", flexDirection: "column", gap: "13px", p: "2px 20px 18px" }}>
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
						<Box
							sx={{ width: 10, height: 10, borderRadius: "3px", bgcolor: bucketColor[b.bucket] }}
						/>
						<Box sx={{ fontSize: 13, color: designTokens.gray700 }}>
							{t(`dashboard.aging.bucket.${b.bucket}`)}
							<Box
								component="span"
								sx={{ ...numericSx, color: "text.disabled", ml: "7px", fontSize: 12 }}
							>
								{pct(b.amount)}%
							</Box>
						</Box>
						<Box component="span" sx={{ ...numericSx, fontSize: 13.5, fontWeight: 600 }}>
							{formatCurrency(b.amount)}
						</Box>
					</Box>
				))}
			</Box>

			<Box
				sx={{
					mt: "auto",
					display: "flex",
					alignItems: "center",
					justifyContent: "space-between",
					p: "14px 20px",
					borderTop: "1px solid",
					borderColor: "divider",
				}}
			>
				<Typography sx={{ fontSize: 12.5, color: "text.secondary" }}>
					{t("dashboard.aging.total")}
				</Typography>
				<Box
					component="span"
					sx={{ ...numericSx, fontWeight: 700, fontSize: 16, color: "success.main" }}
				>
					{formatCurrency(receivableTotal)}
				</Box>
			</Box>
		</Paper>
	);
};

export default AgingPanel;
