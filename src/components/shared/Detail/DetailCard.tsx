import React from "react";

import { Box, Paper, Typography } from "@mui/material";

export interface DetailCardProps {
	/** Card title with its leading icon; omit for chrome-less cards. */
	title?: string;
	icon?: React.ReactNode;
	/** Right side of the head row (e.g. the zero-stock tag). */
	headerExtra?: React.ReactNode;
	/** Optional muted «· N» count shown after the title. */
	count?: number;
	children: React.ReactNode;
}

/**
 * Detail-page card per the design system's `.sd-card`: surface panel with
 * r-lg corners, e-1 shadow and an optional bordered head row.
 */
export const DetailCard: React.FC<DetailCardProps> = ({
	title,
	icon,
	headerExtra,
	count,
	children,
}) => (
	<Paper
		elevation={1}
		sx={{ border: 1, borderColor: "divider", borderRadius: "12px", overflow: "hidden" }}
	>
		{title && (
			<Box
				sx={{
					display: "flex",
					alignItems: "center",
					justifyContent: "space-between",
					gap: "12px",
					p: "15px 18px",
					borderBottom: 1,
					borderColor: "divider",
				}}
			>
				<Typography
					component="span"
					sx={{
						fontSize: 15,
						fontWeight: 600,
						display: "inline-flex",
						alignItems: "center",
						gap: "9px",
						color: "text.primary",
					}}
				>
					{icon}
					{title}
					{count != null && (
						<Box component="span" sx={{ color: "text.disabled", fontWeight: 500 }}>
							· {count}
						</Box>
					)}
				</Typography>
				{headerExtra}
			</Box>
		)}
		{children}
	</Paper>
);

export default DetailCard;
