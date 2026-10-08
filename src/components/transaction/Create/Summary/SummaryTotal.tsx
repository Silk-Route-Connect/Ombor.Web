import React from "react";
import UzsUnit from "components/shared/Money/UzsUnit";
import { numericSx } from "theme";
import { formatCurrency } from "utils/formatCurrency";

import { Box, Typography } from "@mui/material";

interface SummaryTotalProps {
	label: string;
	/** The document total as the page already computes it. */
	total: number;
}

/**
 * «Итого» of a POS / New Order summary — the one emphasised figure of the card,
 * in ink like every document total (teal reads as a link).
 */
const SummaryTotal: React.FC<SummaryTotalProps> = ({ label, total }) => (
	<Box
		sx={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", gap: "12px" }}
	>
		<Typography variant="subtitle1">{label}</Typography>
		<Typography
			sx={{
				...numericSx,
				fontSize: 20,
				lineHeight: "28px",
				fontWeight: 700,
				letterSpacing: "-0.02em",
				color: "text.primary",
				whiteSpace: "nowrap",
			}}
		>
			{formatCurrency(total)}
			<UzsUnit />
		</Typography>
	</Box>
);

export default SummaryTotal;
