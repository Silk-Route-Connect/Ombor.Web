import React from "react";

import { Box, Paper, Typography } from "@mui/material";

export type StateSize = "page" | "section";

interface StateMessageProps {
	icon: React.ReactNode;
	title: string;
	body?: string;
	action?: React.ReactNode;
	tone?: "neutral" | "error";
	size: StateSize;
	role?: string;
}

/**
 * Icon tile + title + one line + one action — the body of every non-data state
 * (load error, not found). "page" sits in its own outlined card; "section" is
 * frameless so it fills a table body, tab or dashboard card.
 */
export const StateMessage: React.FC<StateMessageProps> = ({
	icon,
	title,
	body,
	action,
	tone = "neutral",
	size,
	role,
}) => {
	const content = (
		<Box role={role} sx={{ textAlign: "center", py: size === "page" ? 8 : 5, px: 3 }}>
			<Box
				sx={{
					width: 56,
					height: 56,
					borderRadius: 1.5,
					mx: "auto",
					mb: 2,
					display: "grid",
					placeItems: "center",
					bgcolor: "background.default",
					border: 1,
					borderColor: tone === "error" ? "error.light" : "divider",
					color: tone === "error" ? "error.main" : "text.disabled",
				}}
			>
				{icon}
			</Box>
			<Typography variant="h3" sx={{ mb: 0.75 }}>
				{title}
			</Typography>
			{body && (
				<Typography
					variant="body2"
					sx={{ color: "text.secondary", maxWidth: 420, mx: "auto", lineHeight: 1.6 }}
				>
					{body}
				</Typography>
			)}
			{action && <Box sx={{ mt: 2.25 }}>{action}</Box>}
		</Box>
	);

	if (size === "section") {
		return content;
	}

	return (
		<Paper variant="outlined" sx={{ borderRadius: 1.5, borderColor: "divider" }}>
			{content}
		</Paper>
	);
};

export default StateMessage;
