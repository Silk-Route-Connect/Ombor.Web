import React from "react";
import { designTokens } from "theme";

import { Box } from "@mui/material";

/**
 * Meta-line separator dot («12.06.2026 · Партнёр · …») for detail headers and
 * card meta rows. 4px on gray-400 (the decoration tier) — the old inline 3px
 * gray-300 dots disappeared against secondary text on the warm canvas. Carries
 * no margins of its own; parents supply spacing via flex `gap`.
 */
export const MetaDot: React.FC = () => (
	<Box
		component="span"
		sx={{
			width: 4,
			height: 4,
			borderRadius: "50%",
			bgcolor: designTokens.gray400,
			flex: "0 0 auto",
		}}
	/>
);

export default MetaDot;
