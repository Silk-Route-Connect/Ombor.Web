import React from "react";
import { designTokens, radius } from "theme";

import { alpha, Box, Paper, Typography } from "@mui/material";

export type StateSize = "page" | "section" | "inline";

interface StateMessageProps {
	icon: React.ReactNode;
	title: string;
	body?: string;
	action?: React.ReactNode;
	tone?: "neutral" | "error";
	size: StateSize;
	role?: string;
}

/** Tile, halo and title per size — "inline" is the compact empty state of a line editor. */
const METRICS = {
	page: { py: 8, tile: 56, halo: 8, glyph: 28, gap: 2.5, title: "h3" },
	section: { py: 5, tile: 56, halo: 8, glyph: 28, gap: 2.5, title: "h3" },
	inline: { py: 4, tile: 44, halo: 6, glyph: 22, gap: 2, title: "subtitle1" },
} as const;

/**
 * Icon tile + title + one line + one action — the body of every non-data state
 * (load error, not found, an empty line editor). "page" sits in its own
 * outlined card; "section" is frameless so it fills a table body, tab or
 * dashboard card; "inline" is the same look, smaller, inside a form card.
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
	const m = METRICS[size];
	const content = (
		<Box role={role} sx={{ textAlign: "center", py: m.py, px: 3 }}>
			{/* The brand tint (error tint for a failure) with a soft halo: an empty
			    screen still looks like Ombor, not like something broke. */}
			<Box
				aria-hidden
				sx={{
					width: m.tile,
					height: m.tile,
					borderRadius: `${radius.lg}px`,
					mx: "auto",
					mb: m.gap,
					display: "grid",
					placeItems: "center",
					bgcolor: tint,
					color: tone === "error" ? "error.main" : "primary.main",
					boxShadow: `0 0 0 ${m.halo}px ${alpha(tint, 0.45)}`,
					"& .MuiSvgIcon-root": { fontSize: m.glyph },
				}}
			>
				{icon}
			</Box>
			<Typography
				variant={m.title}
				// A line editor's empty state sits inside a card under its own title — not a heading.
				{...(size === "inline" && { component: "p" })}
				sx={{ mb: 0.75 }}
			>
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

	if (size !== "page") {
		return content;
	}

	return (
		<Paper variant="outlined" sx={{ borderRadius: `${radius.lg}px`, borderColor: "divider" }}>
			{content}
		</Paper>
	);
};

export default StateMessage;
