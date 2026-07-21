import React from "react";

import { Box, Typography } from "@mui/material";

interface PageHeaderProps {
	title: string;
	subtitle?: string;
	/** Right-aligned toolbar slot (filters, primary actions). */
	actions?: React.ReactNode;
}

/**
 * Page header per the Ombor Design System (`.page-head`): title block on the
 * left, action toolbar on the right. Every routed page renders one.
 */
export default function PageHeader({ title, subtitle, actions }: Readonly<PageHeaderProps>) {
	return (
		<Box
			sx={{
				display: "flex",
				alignItems: "flex-start",
				justifyContent: "space-between",
				gap: 2.5,
				mb: 3,
			}}
		>
			<Box sx={{ minWidth: 0 }}>
				<Typography variant="h1" sx={{ whiteSpace: "nowrap" }}>
					{title}
				</Typography>
				{subtitle && (
					<Typography variant="body1" sx={{ color: "text.secondary", mt: 0.5 }}>
						{subtitle}
					</Typography>
				)}
			</Box>
			{actions && <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>{actions}</Box>}
		</Box>
	);
}
