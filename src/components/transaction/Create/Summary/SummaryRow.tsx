import React from "react";
import { numericSx } from "theme";

import { Box } from "@mui/material";

interface SummaryRowProps {
	label: React.ReactNode;
	value: React.ReactNode;
	valueColor?: string;
	bold?: boolean;
	/** A smaller breakdown line under the row above it (one settled document). */
	sub?: boolean;
}

/** One label · amount line of the POS summary. Amounts are unsigned — the label says what they are. */
const SummaryRow: React.FC<SummaryRowProps> = ({ label, value, valueColor, bold, sub }) => (
	<Box
		sx={{
			display: "flex",
			alignItems: "center",
			justifyContent: "space-between",
			gap: "12px",
			fontSize: sub ? 12 : 14,
			pl: sub ? "12px" : 0,
		}}
	>
		<Box
			component="span"
			sx={{ color: bold ? "text.primary" : "text.secondary", fontWeight: bold ? 700 : 400 }}
		>
			{label}
		</Box>
		<Box
			component="span"
			sx={{
				...numericSx,
				whiteSpace: "nowrap",
				fontWeight: bold ? 700 : 600,
				fontSize: bold ? 15 : "inherit",
				color: valueColor ?? "text.primary",
			}}
		>
			{value}
		</Box>
	</Box>
);

export default SummaryRow;
