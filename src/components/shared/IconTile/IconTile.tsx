import React from "react";
import { ChipTokenKey, chipTokens, iconSize, radius } from "theme";

import { Box } from "@mui/material";

interface IconTileProps {
	/** The glyph — sized by the tile. */
	icon: React.ReactNode;
	/** Chip family of the tint, so tiles and pills share one palette. */
	token?: ChipTokenKey;
	/** Square side in px; the glyph is the icon-size step nearest 57% of it. */
	size?: number;
}

const ICON_STEPS = Object.values(iconSize);

/** 28 → 16, 30/32 → 18, 40/44 → 22: tile glyphs stay on the icon scale. */
const glyphSize = (tile: number): number =>
	ICON_STEPS.reduce(
		(best, step) => (Math.abs(step - tile * 0.57) < Math.abs(best - tile * 0.57) ? step : best),
		ICON_STEPS[0],
	);

/**
 * A small tinted square holding an icon — the leading mark of a stat card or
 * a timeline row. Decorative: the label beside it carries the meaning.
 */
export const IconTile: React.FC<IconTileProps> = ({ icon, token = "neutral", size = 30 }) => {
	const tone = chipTokens[token];
	return (
		<Box
			aria-hidden
			sx={{
				width: size,
				height: size,
				flex: "0 0 auto",
				display: "grid",
				placeItems: "center",
				borderRadius: `${radius.md}px`,
				bgcolor: tone.variant === "outline" ? "background.paper" : tone.bg,
				color: tone.color,
				boxShadow: tone.variant === "outline" ? `inset 0 0 0 1px ${tone.border}` : undefined,
				"& .MuiSvgIcon-root": { fontSize: glyphSize(size) },
			}}
		>
			{icon}
		</Box>
	);
};

export default IconTile;
