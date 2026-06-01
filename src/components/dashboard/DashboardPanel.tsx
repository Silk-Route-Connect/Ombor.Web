import React from "react";

import { Box, Paper, Typography } from "@mui/material";

interface DashboardPanelProps {
	title?: React.ReactNode;
	subtitle?: React.ReactNode;
	action?: React.ReactNode;
	children: React.ReactNode;
	sx?: object;
}

/** White bordered card used across the dashboard (design `.panel`). */
const DashboardPanel = React.forwardRef<HTMLDivElement, DashboardPanelProps>(
	({ title, subtitle, action, children, sx }, ref) => (
		<Paper
			ref={ref}
			elevation={1}
			sx={{
				border: 1,
				borderColor: "divider",
				borderRadius: 1.5,
				p: 2.5,
				display: "flex",
				flexDirection: "column",
				minWidth: 0,
				...sx,
			}}
		>
			{(title || action) && (
				<Box
					sx={{
						display: "flex",
						alignItems: "flex-start",
						justifyContent: "space-between",
						gap: 1.5,
						mb: 2,
					}}
				>
					<Box sx={{ minWidth: 0 }}>
						{title && (
							<Typography variant="h3" sx={{ fontWeight: 600 }}>
								{title}
							</Typography>
						)}
						{subtitle && (
							<Typography variant="body2" sx={{ color: "text.secondary", mt: 0.25 }}>
								{subtitle}
							</Typography>
						)}
					</Box>
					{action && <Box sx={{ flexShrink: 0 }}>{action}</Box>}
				</Box>
			)}
			{children}
		</Paper>
	),
);

DashboardPanel.displayName = "DashboardPanel";

export default DashboardPanel;
