import React from "react";
import { keyframes } from "@emotion/react";

import { Box } from "@mui/material";

const ripple = keyframes({
	from: { transform: "scale(1)", opacity: 0.55 },
	to: { transform: "scale(2.8)", opacity: 0 },
});

interface PulseDotProps {
	/** Palette colour of the dot. */
	color: string;
	/** A steady dot — a settled state has nothing to draw the eye to. */
	still?: boolean;
}

/** The header status's live dot: a ripple draws the eye to an ongoing problem (none with reduced motion). */
export const PulseDot: React.FC<PulseDotProps> = ({ color, still = false }) => (
	<Box
		component="span"
		aria-hidden
		sx={{
			position: "relative",
			flex: "0 0 auto",
			width: 8,
			height: 8,
			borderRadius: "50%",
			bgcolor: color,
			"&::after": {
				content: '""',
				position: "absolute",
				inset: 0,
				borderRadius: "50%",
				bgcolor: color,
				opacity: 0,
				animation: still ? "none" : `${ripple} 1.6s ease-out infinite`,
			},
			"@media (prefers-reduced-motion: reduce)": { "&::after": { animation: "none" } },
		}}
	/>
);

export default PulseDot;
