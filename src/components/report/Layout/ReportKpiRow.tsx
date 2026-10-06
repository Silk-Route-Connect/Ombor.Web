import React from "react";
import InfoHint from "components/shared/InfoHint/InfoHint";
import UzsUnit from "components/shared/Money/UzsUnit";
import { typeScale } from "theme";
import { formatCurrencyMinus, formatQuantity } from "utils/formatCurrency";

import { Box, Paper, Typography } from "@mui/material";

import { ReportKpi } from "../View/types";

const TONE_COLOR = {
	ink: "text.primary",
	income: "success.main",
	expense: "error.main",
} as const;

function kpiColor(kpi: ReportKpi): string {
	if (kpi.signed && kpi.value < 0) {
		return TONE_COLOR.expense;
	}
	return TONE_COLOR[kpi.tone ?? "ink"];
}

function kpiText(kpi: ReportKpi): string {
	if (kpi.format === "count") {
		return formatQuantity(kpi.value);
	}
	return formatCurrencyMinus(kpi.value);
}

/**
 * The report's summary figures for the whole period, served totals only — one
 * card each: caption (with its «i» where the term needs one), the figure, and a
 * muted line that names what it is made of.
 */
const ReportKpiRow: React.FC<{ kpis: ReportKpi[] }> = ({ kpis }) => (
	<Box
		sx={{
			display: "grid",
			gridTemplateColumns: {
				xs: "1fr",
				sm: "repeat(2, minmax(0, 1fr))",
				lg: `repeat(${kpis.length}, minmax(0, 1fr))`,
			},
			gap: "16px",
			mb: "16px",
		}}
	>
		{kpis.map((kpi) => (
			<Paper
				key={kpi.key}
				elevation={1}
				sx={{
					border: "1px solid",
					borderColor: "divider",
					borderRadius: "12px",
					p: "16px 18px",
					minWidth: 0,
					containerType: "inline-size",
				}}
			>
				<Box
					sx={{
						display: "flex",
						alignItems: "center",
						gap: "6px",
						fontSize: 13,
						color: "text.secondary",
					}}
				>
					{kpi.caption}
					{kpi.hint && <InfoHint text={kpi.hint} />}
				</Box>
				<Typography
					sx={{
						...typeScale.numStrong,
						mt: "8px",
						lineHeight: 1.1,
						color: kpiColor(kpi),
						// A year's revenue with kopecks («7 549 210 702,01 UZS») is wider than a
						// quarter-row card on a 1366px laptop; a narrow card steps the figure down.
						"@container (max-width: 300px)": { fontSize: 20 },
					}}
				>
					{kpiText(kpi)}
					{kpi.format === "money" && <UzsUnit sx={{ fontSize: 13 }} />}
				</Typography>
				{kpi.sub && (
					<Typography sx={{ fontSize: 12, color: "text.secondary", mt: "6px" }}>
						{kpi.sub}
					</Typography>
				)}
			</Paper>
		))}
	</Box>
);

export default ReportKpiRow;
