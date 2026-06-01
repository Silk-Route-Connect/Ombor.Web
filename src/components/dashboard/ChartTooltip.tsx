import React from "react";
import { formatMoney } from "utils/formatCurrency";

import { Box, Paper, Typography } from "@mui/material";

export interface TooltipRow {
	label: string;
	value: number;
	color: string;
	signed?: boolean;
	emphasize?: boolean;
}

/** Shared themed tooltip body for the dashboard charts. */
const ChartTooltip: React.FC<{ title: string; rows: TooltipRow[] }> = ({ title, rows }) => (
	<Paper elevation={3} sx={{ p: 1.25, borderRadius: 1.5, minWidth: 180 }}>
		<Typography variant="caption" sx={{ color: "text.secondary", fontWeight: 600 }}>
			{title}
		</Typography>
		{rows.map((r) => {
			const prefix = r.signed ? (r.value >= 0 ? "+" : "−") : "";
			return (
				<Box
					key={r.label}
					sx={{
						display: "flex",
						alignItems: "center",
						gap: 1,
						mt: 0.5,
						pt: r.emphasize ? 0.5 : 0,
						borderTop: r.emphasize ? 1 : 0,
						borderColor: "divider",
					}}
				>
					<Box sx={{ width: 8, height: 8, borderRadius: "50%", bgcolor: r.color }} />
					<Typography variant="caption" sx={{ flex: 1, color: "text.secondary" }}>
						{r.label}
					</Typography>
					<Typography
						variant="caption"
						sx={{ fontWeight: 600, fontVariantNumeric: "tabular-nums" }}
					>
						{prefix}
						{formatMoney(Math.abs(r.value))}
					</Typography>
				</Box>
			);
		})}
	</Paper>
);

export default ChartTooltip;
