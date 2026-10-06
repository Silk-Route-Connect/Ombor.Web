import React from "react";
import { useDocumentTitle } from "hooks/shared/useDocumentTitle";
import { designTokens, radius } from "theme";

import { Box, SvgIconProps, Typography } from "@mui/material";

interface PageHeaderProps {
	title: string;
	/** One line saying what the page is for — new users learn the module in context. */
	subtitle?: string;
	/** The module's glyph, on a teal tile left of the title. */
	icon?: React.ComponentType<SvgIconProps>;
	/** Right-aligned toolbar slot (filters, primary actions). */
	actions?: React.ReactNode;
}

/**
 * Page header per the Ombor Design System (`.page-head`): module icon tile ·
 * title · purpose line on the left, action toolbar on the right. On narrow
 * widths the toolbar wraps below the title instead of overflowing, and a title
 * that still does not fit ellipsizes. The title also names the browser tab.
 */
export default function PageHeader({
	title,
	subtitle,
	icon: Icon,
	actions,
}: Readonly<PageHeaderProps>) {
	useDocumentTitle(title);

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
			<Box sx={{ display: "flex", alignItems: "center", gap: 1.75, minWidth: 0, flex: "1 1 auto" }}>
				{Icon && (
					<Box
						aria-hidden
						sx={{
							width: 44,
							height: 44,
							flex: "0 0 auto",
							display: "grid",
							placeItems: "center",
							borderRadius: `${radius.lg}px`,
							bgcolor: designTokens.primarySoft,
							color: "primary.main",
							boxShadow: `inset 0 0 0 1px ${designTokens.primaryLine}`,
						}}
					>
						<Icon sx={{ fontSize: 24 }} />
					</Box>
				)}
				<Box sx={{ minWidth: 0 }}>
					<Typography variant="h1" noWrap title={title}>
						{title}
					</Typography>
					{subtitle && (
						<Typography variant="body2" sx={{ color: "text.secondary", mt: 0.25 }}>
							{subtitle}
						</Typography>
					)}
				</Box>
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
						alignSelf: "center",
					}}
				>
					{actions}
				</Box>
			)}
		</Box>
	);
}
