import React from "react";
import { figuresSx, typeScale } from "theme";
import { formatCurrency } from "utils/formatCurrency";

import { Box, Typography } from "@mui/material";

export interface LineStatus {
	icon: React.ReactNode;
	text: React.ReactNode;
	/** Palette path — `text.secondary`, `warning.dark`, `error.main`. */
	color: string;
}

interface LineRowHeadProps {
	name: string;
	sku: string;
	/** The stock line under the SKU (sale and order lines). */
	status?: LineStatus;
	lineTotal: number;
	lineDiscount: number;
}

/** Top of a cart / order line: product, SKU and stock on the left, the line total on the right. */
export const LineRowHead: React.FC<LineRowHeadProps> = ({
	name,
	sku,
	status,
	lineTotal,
	lineDiscount,
}) => (
	<Box sx={{ display: "flex", justifyContent: "space-between", gap: "16px" }}>
		<Box sx={{ minWidth: 0 }}>
			<Typography variant="subtitle1">{name}</Typography>
			<Typography variant="caption" component="p" sx={{ ...figuresSx, color: "text.secondary" }}>
				{sku}
			</Typography>
			{status && (
				<Box
					sx={{
						display: "inline-flex",
						alignItems: "center",
						gap: "4px",
						mt: "4px",
						fontSize: 12,
						lineHeight: "16px",
						fontWeight: 600,
						color: status.color,
						"& .MuiSvgIcon-root": { fontSize: 14 },
					}}
				>
					{status.icon}
					{status.text}
				</Box>
			)}
		</Box>
		<Box sx={{ textAlign: "right", flex: "0 0 auto" }}>
			<Typography sx={typeScale.numTable}>{formatCurrency(lineTotal)}</Typography>
			{lineDiscount > 0 && (
				<Typography
					variant="caption"
					component="p"
					sx={{ ...typeScale.numTable, fontSize: 12, color: "error.main" }}
				>
					−{formatCurrency(lineDiscount)}
				</Typography>
			)}
		</Box>
	</Box>
);

export default LineRowHead;
