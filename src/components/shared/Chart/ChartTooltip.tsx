import React from "react";
import { designTokens, numericSx, radius } from "theme";

import { Box } from "@mui/material";

import LegendSwatch from "./LegendSwatch";

export type TooltipRow = {
	label: string;
	color: string;
	value: string;
	/** Render with a top divider (the "net" summary row). */
	divider?: boolean;
};

/**
 * Dark hover card shared by the dashboard charts (the bundle's `.chart-tip`):
 * a date heading over a list of coloured label/value rows.
 */
const ChartTooltip: React.FC<{ heading: string; rows: TooltipRow[] }> = ({ heading, rows }) => (
	<Box
		sx={{
			bgcolor: designTokens.gray900,
			color: "common.white",
			borderRadius: `${radius.md}px`,
			boxShadow: 16,
			p: "9px 11px",
			minWidth: 132,
		}}
	>
		<Box sx={{ ...numericSx, fontSize: 11, color: designTokens.onDarkMuted, mb: "6px" }}>
			{heading}
		</Box>
		{rows.map((r) => (
			<Box
				key={r.label}
				sx={{
					display: "flex",
					alignItems: "center",
					gap: "8px",
					fontSize: 12,
					lineHeight: 1.7,
					...(r.divider && {
						mt: "6px",
						pt: "6px",
						borderTop: `1px solid ${designTokens.onDarkLine}`,
					}),
				}}
			>
				<LegendSwatch color={r.color} />
				<Box sx={{ color: designTokens.gray300 }}>{r.label}</Box>
				<Box sx={{ ...numericSx, ml: "auto", fontWeight: 600, pl: "14px" }}>{r.value}</Box>
			</Box>
		))}
	</Box>
);

export default ChartTooltip;
