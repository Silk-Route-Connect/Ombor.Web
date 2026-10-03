import React from "react";

import { Box, Paper, Typography } from "@mui/material";

export {
	detailBodyCellSx as bodyCellSx,
	detailHeadCellSx as headCellSx,
} from "components/shared/Detail/detailTableChrome";

/** Card wrapper for the detail tables (bundle `.ledger-card`). */
export const LedgerCard: React.FC<{ children: React.ReactNode }> = ({ children }) => (
	<Paper
		elevation={1}
		sx={{ border: 1, borderColor: "divider", borderRadius: "12px", overflow: "hidden" }}
	>
		{children}
	</Paper>
);

/** In-card empty state (bundle `.hist-empty`). */
export const EmptyRecords: React.FC<{ icon: React.ReactNode; title: string; body: string }> = ({
	icon,
	title,
	body,
}) => (
	<Box
		sx={{
			p: "40px 24px 44px",
			textAlign: "center",
			display: "flex",
			flexDirection: "column",
			alignItems: "center",
			gap: "6px",
			color: "text.secondary",
		}}
	>
		<Box sx={{ color: "text.disabled", mb: "4px" }}>{icon}</Box>
		<Typography sx={{ fontWeight: 600, fontSize: 15, color: "text.primary" }}>{title}</Typography>
		<Typography sx={{ fontSize: 13, color: "text.secondary", maxWidth: 360, lineHeight: 1.55 }}>
			{body}
		</Typography>
	</Box>
);
