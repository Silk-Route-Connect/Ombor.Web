import React from "react";
import { designTokens, radius } from "theme";

import { alpha, Box, Paper, Typography } from "@mui/material";

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
	const tint = tone === "error" ? designTokens.errorBg : designTokens.primarySoft;
	const content = (
		<Box role={role} sx={{ textAlign: "center", py: size === "page" ? 8 : 5, px: 3 }}>
			{/* The brand tint (error tint for a failure) with a soft halo: an empty
			    screen still looks like Ombor, not like something broke. */}
			<Box
				aria-hidden
				sx={{
					width: 56,
					height: 56,
					borderRadius: `${radius.lg}px`,
					mx: "auto",
					mb: 2.5,
					display: "grid",
					placeItems: "center",
					bgcolor: tint,
					color: tone === "error" ? "error.main" : "primary.main",
					boxShadow: `0 0 0 8px ${alpha(tint, 0.45)}`,
					"& .MuiSvgIcon-root": { fontSize: 28 },
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
