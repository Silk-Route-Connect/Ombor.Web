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
 * left, action toolbar on the right. On narrow widths the toolbar wraps below the
 * title instead of overflowing, and a title that still does not fit ellipsizes.
 */
export default function PageHeader({ title, subtitle, actions }: Readonly<PageHeaderProps>) {
	return (
		<Box
			sx={{
				display: "flex",
				flexWrap: "wrap",
				alignItems: "flex-start",
				justifyContent: "space-between",
				columnGap: 2.5,
				rowGap: 1.5,
				mb: 3,
			}}
		>
			<Box sx={{ minWidth: 0, flex: "1 1 auto" }}>
				<Typography variant="h1" noWrap title={title}>
					{title}
				</Typography>
				{subtitle && (
					<Typography variant="body1" sx={{ color: "text.secondary", mt: 0.5 }}>
						{subtitle}
					</Typography>
				)}
			</Box>
			{actions && (
				<Box
					sx={{
						display: "flex",
						flexWrap: "wrap",
						alignItems: "center",
						justifyContent: "flex-end",
						gap: 1.5,
						ml: "auto",
					}}
				>
					{actions}
				</Box>
			)}
		</Box>
	);
}
