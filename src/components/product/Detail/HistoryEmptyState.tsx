import React from "react";

import { Box, Typography } from "@mui/material";

interface HistoryEmptyStateProps {
	icon: React.ReactNode;
	title: string;
	body: string;
}

/** Empty history block per the bundle's `.hist-empty`. */
export const HistoryEmptyState: React.FC<HistoryEmptyStateProps> = ({ icon, title, body }) => (
	<Box
		sx={{
			display: "flex",
			flexDirection: "column",
			alignItems: "center",
			gap: "6px",
			p: "40px 24px 44px",
			textAlign: "center",
		}}
	>
		<Box sx={{ color: "text.disabled", mb: "6px", display: "inline-flex" }}>{icon}</Box>
		<Typography sx={{ fontSize: 14, fontWeight: 600 }}>{title}</Typography>
		<Typography sx={{ fontSize: 12.5, color: "text.secondary", maxWidth: 320, lineHeight: 1.5 }}>
			{body}
		</Typography>
	</Box>
);

export default HistoryEmptyState;
