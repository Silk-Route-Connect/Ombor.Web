import React from "react";

import { Box, Typography } from "@mui/material";

export interface LegendEntry {
	label: string;
	color: string;
}

/** Inline legend swatches used under chart headers. */
const ChartLegend: React.FC<{ entries: LegendEntry[] }> = ({ entries }) => (
	<Box sx={{ display: "flex", gap: 2, flexWrap: "wrap", mb: 1.5 }}>
		{entries.map((e) => (
			<Box key={e.label} sx={{ display: "inline-flex", alignItems: "center", gap: 0.75 }}>
				<Box sx={{ width: 10, height: 10, borderRadius: "3px", bgcolor: e.color }} />
				<Typography variant="caption" sx={{ color: "text.secondary" }}>
					{e.label}
				</Typography>
			</Box>
		))}
	</Box>
);

export default ChartLegend;
