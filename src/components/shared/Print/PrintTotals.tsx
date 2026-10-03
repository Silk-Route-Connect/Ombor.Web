import React from "react";

import { Box } from "@mui/material";

import { PRINT_RULE_COLOR, printNumberSx } from "./printStyles";

export interface PrintTotalRow {
	key: string;
	label: string;
	/** Already formatted («1 250 000 UZS»). */
	value: string;
	/** The headline total: bold, larger, ruled above. */
	strong?: boolean;
}

/** Right-hand totals block under a document's table (label · amount rows). */
export const PrintTotals: React.FC<{ rows: PrintTotalRow[]; note?: string }> = ({ rows, note }) => (
	<Box sx={{ display: "flex", alignItems: "flex-start", gap: "24px", mb: "16px" }}>
		<Box sx={{ flex: 1, fontSize: 12, color: "text.secondary" }}>{note}</Box>
		<Box sx={{ minWidth: "45%" }}>
			{rows.map((row) => (
				<Box
					key={row.key}
					sx={{
						display: "flex",
						justifyContent: "space-between",
						gap: "16px",
						py: "2px",
						fontSize: row.strong ? 15 : 13,
						fontWeight: row.strong ? 700 : 400,
						...(row.strong && {
							mt: "4px",
							pt: "6px",
							borderTop: "1px solid",
							borderColor: PRINT_RULE_COLOR,
						}),
					}}
				>
					<Box component="span">{row.label}</Box>
					<Box component="span" sx={printNumberSx}>
						{row.value}
					</Box>
				</Box>
			))}
		</Box>
	</Box>
);

export default PrintTotals;
