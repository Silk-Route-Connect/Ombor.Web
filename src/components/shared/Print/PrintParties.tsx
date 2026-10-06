import React from "react";

import { Box, Typography } from "@mui/material";

import { printCaptionSx } from "./printStyles";

export interface PrintParty {
	/** Stable key and caption: «Отправитель», «Получатель», «Партнёр». */
	role: string;
	name: string;
	/** Company, phones, address — empty values are skipped. */
	details: Array<string | null | undefined>;
}

/** The parties of a document side by side: caption, name, contact lines. */
export const PrintParties: React.FC<{ parties: PrintParty[] }> = ({ parties }) => (
	<Box
		sx={{
			display: "grid",
			gridTemplateColumns: `repeat(${parties.length}, minmax(0, 1fr))`,
			gap: "24px",
			mb: "16px",
		}}
	>
		{parties.map((party) => (
			<Box key={party.role} sx={{ minWidth: 0 }}>
				<Typography sx={printCaptionSx}>{party.role}</Typography>
				<Typography sx={{ fontSize: 14, fontWeight: 600, mt: "2px" }}>{party.name}</Typography>
				{party.details
					.filter((line): line is string => Boolean(line && line.trim()))
					.map((line) => (
						<Typography key={line} sx={{ fontSize: 12, color: "text.secondary" }}>
							{line}
						</Typography>
					))}
			</Box>
		))}
	</Box>
);

export default PrintParties;
