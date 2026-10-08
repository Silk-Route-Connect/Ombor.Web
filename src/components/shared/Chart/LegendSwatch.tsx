import React from "react";
import { radius } from "theme";

import { Box } from "@mui/material";

/**
 * The coloured square that keys a series or bucket to its colour — chart
 * legends, chart tooltips, the aging breakdown and the debts sign legend.
 * Decorative: the label beside it carries the meaning.
 */
export const LegendSwatch: React.FC<{ color: string }> = ({ color }) => (
	<Box
		component="span"
		aria-hidden
		sx={{
			display: "inline-block",
			width: 10,
			height: 10,
			flex: "0 0 auto",
			borderRadius: `${radius.xs}px`,
			bgcolor: color,
		}}
	/>
);

/** A legend entry: swatch + label (chart legends and the debts sign legend). */
export const LegendKey: React.FC<{ color: string; label: string }> = ({ color, label }) => (
	<Box
		sx={{
			display: "inline-flex",
			alignItems: "center",
			gap: "8px",
			fontSize: 12,
			color: "text.secondary",
		}}
	>
		<LegendSwatch color={color} />
		{label}
	</Box>
);

export default LegendSwatch;
